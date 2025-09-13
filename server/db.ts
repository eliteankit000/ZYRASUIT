import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { eq, desc, and, gte, lt } from "drizzle-orm";
import bcrypt from "bcrypt";
import { randomUUID } from "crypto";
import {
  users,
  profiles,
  sessions,
  subscriptionPlans,
  subscriptions,
  type User,
  type InsertUser,
  type Profile,
  type InsertProfile,
  type Session,
  type InsertSession,
  type SubscriptionPlan,
  type InsertSubscriptionPlan,
  type Subscription
} from "@shared/schema";

// Database connection
let db: any;

if (process.env.DATABASE_URL) {
  const sql = neon(process.env.DATABASE_URL);
  db = drizzle(sql);
} else {
  console.warn("DATABASE_URL not found. Database operations will fail.");
}

// Error handling wrapper
async function withErrorHandling<T>(
  operation: () => Promise<T>,
  operationName: string
): Promise<T> {
  try {
    if (!db) {
      throw new Error("Database connection not configured. Please check DATABASE_URL.");
    }
    console.log(`[DB] Starting operation: ${operationName}`);
    const result = await operation();
    console.log(`[DB] Operation completed successfully: ${operationName}`);
    return result;
  } catch (error) {
    console.error(`[DB] Error in ${operationName}:`, error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Database operation failed: ${operationName} - ${errorMessage}`);
  }
}

// User operations
export async function createUser(userData: InsertUser): Promise<User> {
  return withErrorHandling(async () => {
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const [user] = await db.insert(users).values({
      ...userData,
      password: hashedPassword,
    }).returning();
    
    // Auto-create profile for user
    await db.insert(profiles).values({
      userId: user.id,
      name: userData.fullName,
    });
    
    console.log(`[DB] User created with ID: ${user.id}`);
    return user;
  }, "createUser");
}

export async function getUserByEmail(email: string): Promise<User | undefined> {
  return withErrorHandling(async () => {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }, "getUserByEmail");
}

export async function getUserById(userId: string): Promise<User | undefined> {
  return withErrorHandling(async () => {
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    return user || undefined;
  }, "getUserById");
}

export async function updateUserSubscription(userId: string, planId: string): Promise<User> {
  return withErrorHandling(async () => {
    // Get the subscription plan details
    const [plan] = await db.select().from(subscriptionPlans).where(eq(subscriptionPlans.id, planId));
    if (!plan) {
      throw new Error(`Subscription plan with ID ${planId} not found`);
    }

    // Update user's plan
    const [updatedUser] = await db.update(users)
      .set({ plan: plan.planName })
      .where(eq(users.id, userId))
      .returning();

    // Create subscription record
    await db.insert(subscriptions).values({
      userId,
      plan: plan.planName,
      status: "active",
    });

    console.log(`[DB] User ${userId} subscription updated to ${plan.planName}`);
    return updatedUser;
  }, "updateUserSubscription");
}

// Profile operations
export async function getUserProfile(userId: string): Promise<Profile | undefined> {
  return withErrorHandling(async () => {
    const [profile] = await db.select().from(profiles).where(eq(profiles.userId, userId));
    return profile || undefined;
  }, "getUserProfile");
}

export async function updateUserProfile(userId: string, profileData: Partial<InsertProfile>): Promise<Profile> {
  return withErrorHandling(async () => {
    const [updatedProfile] = await db.update(profiles)
      .set({ ...profileData, updatedAt: new Date() })
      .where(eq(profiles.userId, userId))
      .returning();

    if (!updatedProfile) {
      throw new Error(`Profile for user ${userId} not found`);
    }

    console.log(`[DB] Profile updated for user: ${userId}`);
    return updatedProfile;
  }, "updateUserProfile");
}

// Session operations
export async function saveSession(sessionData: InsertSession): Promise<Session> {
  return withErrorHandling(async () => {
    // Clean up expired sessions first
    await db.delete(sessions).where(lt(sessions.expiresAt, new Date()));

    const [session] = await db.insert(sessions).values(sessionData).returning();
    console.log(`[DB] Session saved: ${session.sessionId}`);
    return session;
  }, "saveSession");
}

export async function getSession(sessionId: string): Promise<Session | undefined> {
  return withErrorHandling(async () => {
    const [session] = await db.select()
      .from(sessions)
      .where(and(
        eq(sessions.sessionId, sessionId),
        gte(sessions.expiresAt, new Date())
      ));
    
    return session || undefined;
  }, "getSession");
}

export async function deleteSession(sessionId: string): Promise<void> {
  return withErrorHandling(async () => {
    await db.delete(sessions).where(eq(sessions.sessionId, sessionId));
    console.log(`[DB] Session deleted: ${sessionId}`);
  }, "deleteSession");
}

// Subscription plan operations
export async function getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
  return withErrorHandling(async () => {
    return await db.select()
      .from(subscriptionPlans)
      .where(eq(subscriptionPlans.isActive, true))
      .orderBy(subscriptionPlans.price);
  }, "getSubscriptionPlans");
}

export async function createSubscriptionPlan(planData: InsertSubscriptionPlan): Promise<SubscriptionPlan> {
  return withErrorHandling(async () => {
    const [plan] = await db.insert(subscriptionPlans).values(planData).returning();
    console.log(`[DB] Subscription plan created: ${plan.planName}`);
    return plan;
  }, "createSubscriptionPlan");
}

// Utility functions
export async function cleanupExpiredSessions(): Promise<number> {
  return withErrorHandling(async () => {
    const result = await db.delete(sessions).where(lt(sessions.expiresAt, new Date()));
    console.log(`[DB] Cleaned up expired sessions`);
    return result.rowCount || 0;
  }, "cleanupExpiredSessions");
}

export async function getUserSubscription(userId: string): Promise<Subscription | undefined> {
  return withErrorHandling(async () => {
    const [subscription] = await db.select()
      .from(subscriptions)
      .where(eq(subscriptions.userId, userId))
      .orderBy(desc(subscriptions.createdAt));
    
    return subscription || undefined;
  }, "getUserSubscription");
}

// Seed default subscription plans
export async function seedSubscriptionPlans(): Promise<void> {
  return withErrorHandling(async () => {
    console.log("[DB] Seeding default subscription plans...");

    const defaultPlans: InsertSubscriptionPlan[] = [
      {
        planName: "Free Trial",
        price: 0,
        features: [
          "Try all premium features free for 7 days",
          "No credit card required (optional)",
          "Cancel anytime before trial ends",
          "Perfect for testing Zyra on your own store before upgrading"
        ],
      },
      {
        planName: "Starter",
        price: 1500, // $15.00 in cents
        features: [
          "Optimize up to 100 products with AI-generated descriptions",
          "Send up to 500 AI-crafted emails per month (upsells, receipts)",
          "Access to SEO title + meta tag generator",
          "AI image alt-text generator for accessibility + SEO boost",
          "Basic analytics dashboard (track optimized products + email open rates)"
        ],
      },
      {
        planName: "Pro",
        price: 2500, // $25.00 in cents
        features: [
          "Unlimited product optimizations (no limits on AI copy)",
          "Send up to 2,000 AI-crafted emails per month",
          "Recover abandoned carts with 500 SMS reminders per month",
          "Advanced analytics dashboard (email CTR, SMS conversion, keyword density)",
          "Priority AI processing → faster response + reduced wait times"
        ],
      },
      {
        planName: "Growth",
        price: 4900, // $49.00 in cents
        features: [
          "Unlimited everything → products, emails, and SMS recovery",
          "Full analytics suite → keyword insights, revenue from emails/SMS, product optimization impact",
          "A/B testing for AI-generated content → test multiple product descriptions, email subjects, and SMS messages",
          "Premium template library → advanced email & SMS layouts designed to convert",
          "Early access to new AI tools (before Starter/Pro users)",
          "Priority support for faster help"
        ],
      },
    ];

    // Check if plans already exist
    for (const planData of defaultPlans) {
      const [existingPlan] = await db.select()
        .from(subscriptionPlans)
        .where(eq(subscriptionPlans.planName, planData.planName));

      if (!existingPlan) {
        await db.insert(subscriptionPlans).values(planData);
        console.log(`[DB] Created subscription plan: ${planData.planName}`);
      } else {
        console.log(`[DB] Subscription plan already exists: ${planData.planName}`);
      }
    }

    console.log("[DB] Subscription plans seeding completed!");
  }, "seedSubscriptionPlans");
}

// Database health check
export async function testDatabaseConnection(): Promise<boolean> {
  try {
    if (!db) return false;
    
    // Simple test query
    await db.execute("SELECT 1");
    console.log("[DB] Database connection test successful!");
    return true;
  } catch (error) {
    console.error("[DB] Database connection test failed:", error);
    return false;
  }
}

// Export the database instance for direct queries if needed
export { db };
