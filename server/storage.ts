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
  type Notification,
  type InsertNotification,
  type StoreConnection,
  type InsertStoreConnection,
  users, 
  products, 
  seoMeta, 
  campaigns, 
  analytics,
  notifications,
  storeConnections
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
  updateUser(userId: string, updates: Partial<User>): Promise<User>;
  updateUserStripeInfo(userId: string, customerId: string, subscriptionId: string): Promise<User>;
  updateUserProfile(userId: string, fullName: string, email: string): Promise<User>;
  updateUserImage(userId: string, imageUrl: string): Promise<User>;
  changeUserPassword(userId: string, currentPassword: string, newPassword: string): Promise<User>;
  updateUserLanguage(userId: string, language: string): Promise<User>;

  // Store connections methods
  getStoreConnections(userId: string): Promise<StoreConnection[]>;
  createStoreConnection(storeConnection: InsertStoreConnection): Promise<StoreConnection>;
  updateStoreConnection(id: string, updates: Partial<StoreConnection>): Promise<StoreConnection>;
  deleteStoreConnection(id: string): Promise<void>;

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

  // Notification methods
  getNotifications(userId: string): Promise<Notification[]>;
  getUnreadNotificationCount(userId: string): Promise<number>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  markNotificationAsRead(userId: string, notificationId: string): Promise<Notification | null>;
  markAllNotificationsAsRead(userId: string): Promise<void>;
  deleteNotification(userId: string, notificationId: string): Promise<boolean>;
  clearAllNotifications(userId: string): Promise<void>;

  // Real-time Dashboard methods
  getDashboardData(userId: string): Promise<{
    user: User | undefined;
    profile: any;
    usageStats: any;
    activityLogs: any[];
    toolsAccess: any[];
    realtimeMetrics: any[];
  }>;
  initializeUserRealtimeData(userId: string): Promise<void>;
  trackToolAccess(userId: string, toolName: string): Promise<any>;
  createActivityLog(userId: string, logData: any): Promise<any>;
  updateUsageStats(userId: string, statField: string, increment: number): Promise<void>;
  generateSampleMetrics(userId: string): Promise<void>;
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

  async updateUser(userId: string, updates: Partial<User>): Promise<User> {
    if (!db) throw new Error("Database not configured");
    const result = await db.update(users)
      .set(updates)
      .where(eq(users.id, userId))
      .returning();
    return result[0];
  }

  async updateUserProfile(userId: string, fullName: string, email: string): Promise<User> {
    if (!db) throw new Error("Database not configured");
    const result = await db.update(users)
      .set({ fullName, email })
      .where(eq(users.id, userId))
      .returning();
    return result[0];
  }

  async updateUserImage(userId: string, imageUrl: string): Promise<User> {
    if (!db) throw new Error("Database not configured");
    const result = await db.update(users)
      .set({ imageUrl })
      .where(eq(users.id, userId))
      .returning();
    return result[0];
  }

  async changeUserPassword(userId: string, currentPassword: string, newPassword: string): Promise<User> {
    if (!db) throw new Error("Database not configured");
    
    // First, get the user to verify current password
    const user = await this.getUser(userId);
    if (!user) {
      throw new Error("User not found");
    }

    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, user.password);
    if (!isValidPassword) {
      throw new Error("Current password is incorrect");
    }

    // Hash new password and update
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    const result = await db.update(users)
      .set({ password: hashedNewPassword })
      .where(eq(users.id, userId))
      .returning();
    return result[0];
  }

  async updateUserLanguage(userId: string, language: string): Promise<User> {
    if (!db) throw new Error("Database not configured");
    const result = await db.update(users)
      .set({ preferredLanguage: language })
      .where(eq(users.id, userId))
      .returning();
    return result[0];
  }

  async getStoreConnections(userId: string): Promise<StoreConnection[]> {
    if (!db) throw new Error("Database not configured");
    return await db.select().from(storeConnections)
      .where(eq(storeConnections.userId, userId))
      .orderBy(desc(storeConnections.createdAt));
  }

  async createStoreConnection(storeConnection: InsertStoreConnection): Promise<StoreConnection> {
    if (!db) throw new Error("Database not configured");
    const result = await db.insert(storeConnections).values(storeConnection).returning();
    return result[0];
  }

  async updateStoreConnection(id: string, updates: Partial<StoreConnection>): Promise<StoreConnection> {
    if (!db) throw new Error("Database not configured");
    const result = await db.update(storeConnections)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(storeConnections.id, id))
      .returning();
    return result[0];
  }

  async deleteStoreConnection(id: string): Promise<void> {
    if (!db) throw new Error("Database not configured");
    await db.delete(storeConnections).where(eq(storeConnections.id, id));
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

  async updateUser(userId: string, updates: Partial<User>): Promise<User> {
    throw new Error("User updates not available in DatabaseStorage - use MemStorage");
  }

  // Dashboard methods - stub implementations since we're using MemStorage for dashboard
  async getDashboardData(userId: string): Promise<any> {
    throw new Error("Dashboard data not available in DatabaseStorage - use MemStorage");
  }

  async initializeUserRealtimeData(userId: string): Promise<void> {
    throw new Error("Dashboard data not available in DatabaseStorage - use MemStorage");
  }

  async trackToolAccess(userId: string, toolName: string): Promise<any> {
    throw new Error("Dashboard data not available in DatabaseStorage - use MemStorage");
  }

  async createActivityLog(userId: string, logData: any): Promise<any> {
    throw new Error("Dashboard data not available in DatabaseStorage - use MemStorage");
  }

  async updateUsageStats(userId: string, statField: string, increment: number): Promise<void> {
    throw new Error("Dashboard data not available in DatabaseStorage - use MemStorage");
  }

  async generateSampleMetrics(userId: string): Promise<void> {
    throw new Error("Dashboard data not available in DatabaseStorage - use MemStorage");
  }

  // Notification methods - stub implementations since we're using MemStorage
  async getNotifications(userId: string): Promise<Notification[]> {
    throw new Error("Notification data not available in DatabaseStorage - use MemStorage");
  }

  async getUnreadNotificationCount(userId: string): Promise<number> {
    throw new Error("Notification data not available in DatabaseStorage - use MemStorage");
  }

  async createNotification(notification: InsertNotification): Promise<Notification> {
    throw new Error("Notification data not available in DatabaseStorage - use MemStorage");
  }

  async markNotificationAsRead(userId: string, notificationId: string): Promise<Notification | null> {
    throw new Error("Notification data not available in DatabaseStorage - use MemStorage");
  }

  async markAllNotificationsAsRead(userId: string): Promise<void> {
    throw new Error("Notification data not available in DatabaseStorage - use MemStorage");
  }

  async deleteNotification(userId: string, notificationId: string): Promise<boolean> {
    throw new Error("Notification data not available in DatabaseStorage - use MemStorage");
  }

  async clearAllNotifications(userId: string): Promise<void> {
    throw new Error("Notification data not available in DatabaseStorage - use MemStorage");
  }
}

export class MemStorage implements IStorage {
  private users: Map<string, User> = new Map();
  private products: Map<string, Product> = new Map();
  private seoMetas: Map<string, SeoMeta> = new Map();
  private campaigns: Map<string, Campaign> = new Map();
  private analyticsData: Map<string, Analytics> = new Map();
  private notificationsData: Map<string, Notification> = new Map();
  
  // Real-time dashboard data storage
  private usageStats: Map<string, any> = new Map();
  private activityLogs: Map<string, any[]> = new Map();
  private toolsAccess: Map<string, any[]> = new Map();
  private realtimeMetrics: Map<string, any[]> = new Map();

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
      imageUrl: null,
      preferredLanguage: "en",
      createdAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(userId: string, updates: Partial<User>): Promise<User> {
    const user = this.users.get(userId);
    if (!user) throw new Error("User not found");
    const updatedUser = { ...user, ...updates };
    this.users.set(userId, updatedUser);
    return updatedUser;
  }

  async updateUserStripeInfo(userId: string, customerId: string, subscriptionId: string): Promise<User> {
    const user = this.users.get(userId);
    if (!user) throw new Error("User not found");
    const updatedUser = { ...user, stripeCustomerId: customerId, stripeSubscriptionId: subscriptionId };
    this.users.set(userId, updatedUser);
    return updatedUser;
  }

  async updateUserProfile(userId: string, fullName: string, email: string): Promise<User> {
    const user = this.users.get(userId);
    if (!user) throw new Error("User not found");
    const updatedUser = { ...user, fullName, email };
    this.users.set(userId, updatedUser);
    return updatedUser;
  }

  async updateUserImage(userId: string, imageUrl: string): Promise<User> {
    const user = this.users.get(userId);
    if (!user) throw new Error("User not found");
    const updatedUser = { ...user, imageUrl };
    this.users.set(userId, updatedUser);
    return updatedUser;
  }

  async changeUserPassword(userId: string, currentPassword: string, newPassword: string): Promise<User> {
    const user = this.users.get(userId);
    if (!user) throw new Error("User not found");

    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, user.password);
    if (!isValidPassword) {
      throw new Error('Current password is incorrect');
    }

    // Hash new password and update
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    const updatedUser = { ...user, password: hashedNewPassword };
    this.users.set(userId, updatedUser);
    return updatedUser;
  }

  async updateUserLanguage(userId: string, language: string): Promise<User> {
    const user = this.users.get(userId);
    if (!user) throw new Error("User not found");
    const updatedUser = { ...user, preferredLanguage: language };
    this.users.set(userId, updatedUser);
    return updatedUser;
  }

  private storeConnections: Map<string, StoreConnection> = new Map();

  async getStoreConnections(userId: string): Promise<StoreConnection[]> {
    return Array.from(this.storeConnections.values()).filter(conn => conn.userId === userId);
  }

  async createStoreConnection(storeConnection: InsertStoreConnection): Promise<StoreConnection> {
    const id = randomUUID();
    const newConnection: StoreConnection = {
      id,
      ...storeConnection,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.storeConnections.set(id, newConnection);
    return newConnection;
  }

  async updateStoreConnection(id: string, updates: Partial<StoreConnection>): Promise<StoreConnection> {
    const connection = this.storeConnections.get(id);
    if (!connection) throw new Error("Store connection not found");
    const updatedConnection = { ...connection, ...updates, updatedAt: new Date() };
    this.storeConnections.set(id, updatedConnection);
    return updatedConnection;
  }

  async deleteStoreConnection(id: string): Promise<void> {
    this.storeConnections.delete(id);
  }

  async getProducts(userId: string): Promise<Product[]> {
    return Array.from(this.products.values())
      .filter(product => product.userId === userId)
      .sort((a, b) => (b.updatedAt?.getTime() || 0) - (a.updatedAt?.getTime() || 0));
  }

  async getProduct(id: string): Promise<Product | undefined> {
    return this.products.get(id);
  }

  async createProduct(product: InsertProduct & { userId: string }): Promise<Product> {
    const id = randomUUID();
    const newProduct: Product = {
      id,
      ...product,
      description: product.description || null,
      originalDescription: product.originalDescription || null,
      category: product.category, // Required field, no fallback to null
      price: product.price, // Required field from new schema
      stock: product.stock || 0, // Default to 0 if not provided
      image: product.image || null, // Optional field
      features: product.features || null,
      tags: product.tags || null,
      optimizedCopy: product.optimizedCopy || null,
      shopifyId: product.shopifyId || null,
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
      seoTitle: seoMetaData.seoTitle || null,
      metaDescription: seoMetaData.metaDescription || null,
      keywords: seoMetaData.keywords || null,
      optimizedTitle: seoMetaData.optimizedTitle || null,
      optimizedMeta: seoMetaData.optimizedMeta || null,
      seoScore: seoMetaData.seoScore || null,
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
      subject: campaign.subject || null,
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
      metadata: analytic.metadata || null,
    };
    this.analyticsData.set(id, newAnalytic);
    return newAnalytic;
  }

  // Real-time Dashboard methods implementation
  async getDashboardData(userId: string): Promise<{
    user: User | undefined;
    profile: any;
    usageStats: any;
    activityLogs: any[];
    toolsAccess: any[];
    realtimeMetrics: any[];
  }> {
    const user = await this.getUser(userId);
    const usageStats = this.usageStats.get(userId) || null;
    const activityLogs = this.activityLogs.get(userId) || [];
    const toolsAccess = this.toolsAccess.get(userId) || [];
    const realtimeMetrics = this.realtimeMetrics.get(userId) || [];
    
    return {
      user,
      profile: user ? { 
        userId: user.id, 
        name: user.fullName, 
        email: user.email,
        plan: user.plan 
      } : null,
      usageStats,
      activityLogs: activityLogs.slice(0, 10), // Latest 10 activities
      toolsAccess,
      realtimeMetrics,
    };
  }

  async initializeUserRealtimeData(userId: string): Promise<void> {
    // Initialize usage stats with realistic sample data
    if (!this.usageStats.has(userId)) {
      this.usageStats.set(userId, {
        userId,
        totalRevenue: Math.floor(Math.random() * 50000) + 15000, // $150-$650
        totalOrders: Math.floor(Math.random() * 500) + 200, // 200-700 orders
        conversionRate: Math.floor(Math.random() * 300) + 250, // 2.5-5.5% conversion
        cartRecoveryRate: Math.floor(Math.random() * 2000) + 6000, // 60-80% recovery
        productsOptimized: 0,
        emailsSent: 0,
        smsSent: 0,
        aiGenerationsUsed: 0,
        seoOptimizationsUsed: 0,
        lastUpdated: new Date().toISOString(),
      });
    }

    // Initialize activity logs
    if (!this.activityLogs.has(userId)) {
      this.activityLogs.set(userId, [
        {
          id: randomUUID(),
          userId,
          action: "user_login",
          description: "User logged into dashboard",
          toolUsed: "dashboard",
          metadata: { timestamp: new Date().toISOString() },
          createdAt: new Date().toISOString(),
        }
      ]);
    }

    // Initialize tools access
    if (!this.toolsAccess.has(userId)) {
      this.toolsAccess.set(userId, []);
    }

    // Initialize real-time metrics
    if (!this.realtimeMetrics.has(userId)) {
      this.realtimeMetrics.set(userId, []);
    }
  }

  async trackToolAccess(userId: string, toolName: string): Promise<any> {
    const userTools = this.toolsAccess.get(userId) || [];
    const existingTool = userTools.find(tool => tool.toolName === toolName);
    
    if (existingTool) {
      existingTool.accessCount += 1;
      existingTool.lastAccessed = new Date().toISOString();
    } else {
      userTools.push({
        id: randomUUID(),
        userId,
        toolName,
        accessCount: 1,
        lastAccessed: new Date().toISOString(),
        firstAccessed: new Date().toISOString(),
      });
    }
    
    this.toolsAccess.set(userId, userTools);
    return existingTool || userTools[userTools.length - 1];
  }

  async createActivityLog(userId: string, logData: any): Promise<any> {
    const userActivities = this.activityLogs.get(userId) || [];
    const newActivity = {
      id: randomUUID(),
      userId,
      ...logData,
      createdAt: new Date().toISOString(),
    };
    
    userActivities.unshift(newActivity); // Add to beginning for latest first
    
    // Keep only latest 50 activities to prevent memory bloat
    if (userActivities.length > 50) {
      userActivities.splice(50);
    }
    
    this.activityLogs.set(userId, userActivities);
    return newActivity;
  }

  async updateUsageStats(userId: string, statField: string, increment: number): Promise<void> {
    const stats = this.usageStats.get(userId) || {};
    stats[statField] = (stats[statField] || 0) + increment;
    stats.lastUpdated = new Date().toISOString();
    this.usageStats.set(userId, stats);
  }

  async generateSampleMetrics(userId: string): Promise<void> {
    const userMetrics = this.realtimeMetrics.get(userId) || [];
    
    const newMetrics = [
      {
        id: randomUUID(),
        userId,
        metricName: "revenue_change",
        value: "$" + (Math.floor(Math.random() * 5000) + 1000),
        changePercent: "+" + (Math.random() * 20 + 5).toFixed(1) + "%",
        isPositive: true,
        timestamp: new Date().toISOString(),
      },
      {
        id: randomUUID(),
        userId,
        metricName: "orders_change", 
        value: (Math.floor(Math.random() * 100) + 50).toString(),
        changePercent: "+" + (Math.random() * 15 + 3).toFixed(1) + "%",
        isPositive: true,
        timestamp: new Date().toISOString(),
      },
      {
        id: randomUUID(),
        userId,
        metricName: "conversion_change",
        value: (Math.random() * 2 + 2).toFixed(1) + "%",
        changePercent: (Math.random() > 0.5 ? "+" : "-") + (Math.random() * 5 + 1).toFixed(1) + "%",
        isPositive: Math.random() > 0.3,
        timestamp: new Date().toISOString(),
      },
    ];

    // Add new metrics and keep only latest 20
    userMetrics.push(...newMetrics);
    if (userMetrics.length > 20) {
      userMetrics.splice(0, userMetrics.length - 20);
    }
    
    this.realtimeMetrics.set(userId, userMetrics);
  }

  // Notification methods implementation
  async getNotifications(userId: string): Promise<Notification[]> {
    return Array.from(this.notificationsData.values())
      .filter(notification => notification.userId === userId)
      .sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
  }

  async getUnreadNotificationCount(userId: string): Promise<number> {
    return Array.from(this.notificationsData.values())
      .filter(notification => notification.userId === userId && !notification.isRead)
      .length;
  }

  async createNotification(notificationData: InsertNotification): Promise<Notification> {
    const id = randomUUID();
    const notification: Notification = {
      id,
      ...notificationData,
      type: notificationData.type || "info", // Provide default value for required field
      actionUrl: notificationData.actionUrl || null, // Ensure not undefined
      actionLabel: notificationData.actionLabel || null, // Ensure not undefined
      isRead: false,
      createdAt: new Date(),
      readAt: null,
    };
    this.notificationsData.set(id, notification);
    return notification;
  }

  async markNotificationAsRead(userId: string, notificationId: string): Promise<Notification | null> {
    const notification = this.notificationsData.get(notificationId);
    if (!notification || notification.userId !== userId) {
      return null; // Not found or doesn't belong to user
    }
    
    const updatedNotification = {
      ...notification,
      isRead: true,
      readAt: new Date(),
    };
    
    this.notificationsData.set(notificationId, updatedNotification);
    return updatedNotification;
  }

  async markAllNotificationsAsRead(userId: string): Promise<void> {
    const userNotifications = Array.from(this.notificationsData.values())
      .filter(notification => notification.userId === userId && !notification.isRead);
    
    for (const notification of userNotifications) {
      const updatedNotification = {
        ...notification,
        isRead: true,
        readAt: new Date(),
      };
      this.notificationsData.set(notification.id, updatedNotification);
    }
  }

  async deleteNotification(userId: string, notificationId: string): Promise<boolean> {
    const notification = this.notificationsData.get(notificationId);
    if (!notification || notification.userId !== userId) {
      return false; // Not found or doesn't belong to user
    }
    
    this.notificationsData.delete(notificationId);
    return true; // Successfully deleted
  }

  async clearAllNotifications(userId: string): Promise<void> {
    const userNotifications = Array.from(this.notificationsData.values())
      .filter(notification => notification.userId === userId);
    
    for (const notification of userNotifications) {
      this.notificationsData.delete(notification.id);
    }
  }
}

export const storage = new MemStorage();
