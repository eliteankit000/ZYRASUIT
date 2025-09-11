import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { eq, desc, and } from "drizzle-orm";
import { 
  type User, 
  type InsertUser, 
  type Product, 
  type InsertProduct,
  type SeoMeta,
  type InsertSeoMeta,
  type Campaign,
  type InsertCampaign,
  type Analytics,
  type InsertAnalytics,
  users, 
  products, 
  seoMeta, 
  campaigns, 
  analytics 
} from "@shared/schema";
import { randomUUID } from "crypto";
import bcrypt from "bcrypt";

let db: any;

if (process.env.DATABASE_URL) {
  const sql = neon(process.env.DATABASE_URL);
  db = drizzle(sql);
}

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserStripeInfo(userId: string, customerId: string, subscriptionId: string): Promise<User>;

  // Product methods
  getProducts(userId: string): Promise<Product[]>;
  getProduct(id: string): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: string, updates: Partial<Product>): Promise<Product>;
  deleteProduct(id: string): Promise<void>;

  // SEO methods
  getSeoMeta(productId: string): Promise<SeoMeta | undefined>;
  createSeoMeta(seoMeta: InsertSeoMeta): Promise<SeoMeta>;
  updateSeoMeta(productId: string, updates: Partial<SeoMeta>): Promise<SeoMeta>;

  // Campaign methods
  getCampaigns(userId: string): Promise<Campaign[]>;
  createCampaign(campaign: InsertCampaign): Promise<Campaign>;
  updateCampaign(id: string, updates: Partial<Campaign>): Promise<Campaign>;

  // Analytics methods
  getAnalytics(userId: string, metricType?: string): Promise<Analytics[]>;
  createAnalytic(analytic: InsertAnalytics): Promise<Analytics>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    if (!db) throw new Error("Database not configured");
    const result = await db.select().from(users).where(eq(users.id, id));
    return result[0];
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    if (!db) throw new Error("Database not configured");
    const result = await db.select().from(users).where(eq(users.email, email));
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    if (!db) throw new Error("Database not configured");
    const hashedPassword = await bcrypt.hash(insertUser.password, 10);
    const result = await db.insert(users).values({
      ...insertUser,
      password: hashedPassword,
    }).returning();
    return result[0];
  }

  async updateUserStripeInfo(userId: string, customerId: string, subscriptionId: string): Promise<User> {
    if (!db) throw new Error("Database not configured");
    const result = await db.update(users)
      .set({ 
        stripeCustomerId: customerId,
        stripeSubscriptionId: subscriptionId 
      })
      .where(eq(users.id, userId))
      .returning();
    return result[0];
  }

  async getProducts(userId: string): Promise<Product[]> {
    if (!db) throw new Error("Database not configured");
    return await db.select().from(products)
      .where(eq(products.userId, userId))
      .orderBy(desc(products.updatedAt));
  }

  async getProduct(id: string): Promise<Product | undefined> {
    if (!db) throw new Error("Database not configured");
    const result = await db.select().from(products).where(eq(products.id, id));
    return result[0];
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    if (!db) throw new Error("Database not configured");
    const result = await db.insert(products).values(product).returning();
    return result[0];
  }

  async updateProduct(id: string, updates: Partial<Product>): Promise<Product> {
    if (!db) throw new Error("Database not configured");
    const result = await db.update(products)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(products.id, id))
      .returning();
    return result[0];
  }

  async deleteProduct(id: string): Promise<void> {
    if (!db) throw new Error("Database not configured");
    await db.delete(products).where(eq(products.id, id));
  }

  async getSeoMeta(productId: string): Promise<SeoMeta | undefined> {
    if (!db) throw new Error("Database not configured");
    const result = await db.select().from(seoMeta).where(eq(seoMeta.productId, productId));
    return result[0];
  }

  async createSeoMeta(seoMetaData: InsertSeoMeta): Promise<SeoMeta> {
    if (!db) throw new Error("Database not configured");
    const result = await db.insert(seoMeta).values(seoMetaData).returning();
    return result[0];
  }

  async updateSeoMeta(productId: string, updates: Partial<SeoMeta>): Promise<SeoMeta> {
    if (!db) throw new Error("Database not configured");
    const result = await db.update(seoMeta)
      .set(updates)
      .where(eq(seoMeta.productId, productId))
      .returning();
    return result[0];
  }

  async getCampaigns(userId: string): Promise<Campaign[]> {
    if (!db) throw new Error("Database not configured");
    return await db.select().from(campaigns)
      .where(eq(campaigns.userId, userId))
      .orderBy(desc(campaigns.createdAt));
  }

  async createCampaign(campaign: InsertCampaign): Promise<Campaign> {
    if (!db) throw new Error("Database not configured");
    const result = await db.insert(campaigns).values(campaign).returning();
    return result[0];
  }

  async updateCampaign(id: string, updates: Partial<Campaign>): Promise<Campaign> {
    if (!db) throw new Error("Database not configured");
    const result = await db.update(campaigns)
      .set(updates)
      .where(eq(campaigns.id, id))
      .returning();
    return result[0];
  }

  async getAnalytics(userId: string, metricType?: string): Promise<Analytics[]> {
    if (!db) throw new Error("Database not configured");
    const conditions = [eq(analytics.userId, userId)];
    if (metricType) {
      conditions.push(eq(analytics.metricType, metricType));
    }
    return await db.select().from(analytics)
      .where(and(...conditions))
      .orderBy(desc(analytics.date));
  }

  async createAnalytic(analytic: InsertAnalytics): Promise<Analytics> {
    if (!db) throw new Error("Database not configured");
    const result = await db.insert(analytics).values(analytic).returning();
    return result[0];
  }
}

export class MemStorage implements IStorage {
  private users: Map<string, User> = new Map();
  private products: Map<string, Product> = new Map();
  private seoMetas: Map<string, SeoMeta> = new Map();
  private campaigns: Map<string, Campaign> = new Map();
  private analyticsData: Map<string, Analytics> = new Map();

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const hashedPassword = await bcrypt.hash(insertUser.password, 10);
    const user: User = {
      id,
      ...insertUser,
      password: hashedPassword,
      role: "user",
      plan: "trial",
      trialEndDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      stripeCustomerId: null,
      stripeSubscriptionId: null,
      createdAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  async updateUserStripeInfo(userId: string, customerId: string, subscriptionId: string): Promise<User> {
    const user = this.users.get(userId);
    if (!user) throw new Error("User not found");
    const updatedUser = { ...user, stripeCustomerId: customerId, stripeSubscriptionId: subscriptionId };
    this.users.set(userId, updatedUser);
    return updatedUser;
  }

  async getProducts(userId: string): Promise<Product[]> {
    return Array.from(this.products.values())
      .filter(product => product.userId === userId)
      .sort((a, b) => (b.updatedAt?.getTime() || 0) - (a.updatedAt?.getTime() || 0));
  }

  async getProduct(id: string): Promise<Product | undefined> {
    return this.products.get(id);
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const id = randomUUID();
    const newProduct: Product = {
      id,
      ...product,
      isOptimized: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.products.set(id, newProduct);
    return newProduct;
  }

  async updateProduct(id: string, updates: Partial<Product>): Promise<Product> {
    const product = this.products.get(id);
    if (!product) throw new Error("Product not found");
    const updatedProduct = { ...product, ...updates, updatedAt: new Date() };
    this.products.set(id, updatedProduct);
    return updatedProduct;
  }

  async deleteProduct(id: string): Promise<void> {
    this.products.delete(id);
  }

  async getSeoMeta(productId: string): Promise<SeoMeta | undefined> {
    return Array.from(this.seoMetas.values()).find(seo => seo.productId === productId);
  }

  async createSeoMeta(seoMetaData: InsertSeoMeta): Promise<SeoMeta> {
    const id = randomUUID();
    const seo: SeoMeta = {
      id,
      ...seoMetaData,
      createdAt: new Date(),
    };
    this.seoMetas.set(id, seo);
    return seo;
  }

  async updateSeoMeta(productId: string, updates: Partial<SeoMeta>): Promise<SeoMeta> {
    const existing = await this.getSeoMeta(productId);
    if (!existing) throw new Error("SEO meta not found");
    const updated = { ...existing, ...updates };
    this.seoMetas.set(existing.id, updated);
    return updated;
  }

  async getCampaigns(userId: string): Promise<Campaign[]> {
    return Array.from(this.campaigns.values())
      .filter(campaign => campaign.userId === userId)
      .sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
  }

  async createCampaign(campaign: InsertCampaign): Promise<Campaign> {
    const id = randomUUID();
    const newCampaign: Campaign = {
      id,
      ...campaign,
      status: "draft",
      sentCount: 0,
      openRate: 0,
      clickRate: 0,
      conversionRate: 0,
      createdAt: new Date(),
    };
    this.campaigns.set(id, newCampaign);
    return newCampaign;
  }

  async updateCampaign(id: string, updates: Partial<Campaign>): Promise<Campaign> {
    const campaign = this.campaigns.get(id);
    if (!campaign) throw new Error("Campaign not found");
    const updated = { ...campaign, ...updates };
    this.campaigns.set(id, updated);
    return updated;
  }

  async getAnalytics(userId: string, metricType?: string): Promise<Analytics[]> {
    return Array.from(this.analyticsData.values())
      .filter(analytic => 
        analytic.userId === userId && 
        (!metricType || analytic.metricType === metricType)
      )
      .sort((a, b) => (b.date?.getTime() || 0) - (a.date?.getTime() || 0));
  }

  async createAnalytic(analytic: InsertAnalytics): Promise<Analytics> {
    const id = randomUUID();
    const newAnalytic: Analytics = {
      id,
      ...analytic,
      date: analytic.date || new Date(),
    };
    this.analyticsData.set(id, newAnalytic);
    return newAnalytic;
  }
}

export const storage = process.env.DATABASE_URL ? new DatabaseStorage() : new MemStorage();
