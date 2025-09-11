import type { Express } from "express";
import { createServer, type Server } from "http";
import bcrypt from "bcrypt";
import session from "express-session";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { insertUserSchema } from "@shared/schema";
import { storage } from "./storage";
import OpenAI from "openai";
import Stripe from "stripe";

// Initialize OpenAI
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || ""
});

// Initialize Stripe if keys are provided
let stripe: Stripe | null = null;
if (process.env.STRIPE_SECRET_KEY) {
  stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2023-10-16",
  });
}

declare module "express-session" {
  interface SessionData {
    userId?: string;
  }
}

declare global {
  namespace Express {
    interface User {
      id: string;
      email: string;
      fullName: string;
      role: string;
      plan: string;
      stripeCustomerId?: string | null;
      stripeSubscriptionId?: string | null;
    }
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Session configuration
  app.use(
    session({
      secret: process.env.SESSION_SECRET || "your-secret-key",
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: process.env.NODE_ENV === "production",
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
      },
    })
  );

  // Passport configuration
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(
      { usernameField: "email" },
      async (email, password, done) => {
        try {
          const user = await storage.getUserByEmail(email);
          if (!user) {
            return done(null, false, { message: "Invalid email or password" });
          }

          const isValid = await bcrypt.compare(password, user.password);
          if (!isValid) {
            return done(null, false, { message: "Invalid email or password" });
          }

          return done(null, user);
        } catch (error) {
          return done(error);
        }
      }
    )
  );

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: string, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });

  // Auth middleware
  const requireAuth = (req: any, res: any, next: any) => {
    if (req.isAuthenticated()) {
      return next();
    }
    res.status(401).json({ message: "Authentication required" });
  };

  // Auth routes
  app.post("/api/register", async (req, res) => {
    try {
      const validatedData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(validatedData.email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }

      const user = await storage.createUser(validatedData);
      
      // Auto-login after registration
      req.login(user, (err) => {
        if (err) {
          return res.status(500).json({ message: "Login failed after registration" });
        }
        res.json({ user: { id: user.id, email: user.email, fullName: user.fullName, plan: user.plan } });
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.post("/api/login", passport.authenticate("local"), (req, res) => {
    const user = req.user!;
    res.json({ 
      user: { 
        id: user.id, 
        email: user.email, 
        fullName: user.fullName, 
        plan: user.plan 
      } 
    });
  });

  app.post("/api/logout", (req, res) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ message: "Logout failed" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });

  app.get("/api/me", requireAuth, (req, res) => {
    const user = req.user!;
    res.json({ 
      user: { 
        id: user.id, 
        email: user.email, 
        fullName: user.fullName, 
        plan: user.plan 
      } 
    });
  });

  // AI Product Description Generator
  app.post("/api/generate-description", requireAuth, async (req, res) => {
    try {
      const { productName, category, features, audience, brandVoice } = req.body;

      if (!productName) {
        return res.status(400).json({ message: "Product name is required" });
      }

      const prompts = {
        sales: `Create a compelling sales-focused product description for "${productName}" in the ${category} category. 
                Target audience: ${audience}. Key features: ${features}. 
                Make it persuasive, benefit-focused, and include a clear call-to-action. Keep it under 150 words.
                Respond with JSON in this format: { "description": "your description here" }`,
        
        seo: `Create an SEO-optimized product description for "${productName}" in the ${category} category.
              Target audience: ${audience}. Key features: ${features}.
              Include relevant keywords naturally, focus on search-friendly language, and maintain readability.
              Keep it under 160 words.
              Respond with JSON in this format: { "description": "your description here" }`,
        
        casual: `Create a casual, friendly product description for "${productName}" in the ${category} category.
                 Target audience: ${audience}. Key features: ${features}.
                 Use conversational tone, emojis where appropriate, and make it relatable and fun.
                 Keep it under 150 words.
                 Respond with JSON in this format: { "description": "your description here" }`
      };

      const selectedPrompt = prompts[brandVoice as keyof typeof prompts] || prompts.sales;

      // the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
      const response = await openai.chat.completions.create({
        model: "gpt-5",
        messages: [{ role: "user", content: selectedPrompt }],
        response_format: { type: "json_object" },
      });

      const result = JSON.parse(response.choices[0].message.content || "{}");
      res.json({ description: result.description });
    } catch (error: any) {
      console.error("AI generation error:", error);
      res.status(500).json({ message: "Failed to generate description" });
    }
  });

  // SEO Optimization
  app.post("/api/optimize-seo", requireAuth, async (req, res) => {
    try {
      const { currentTitle, keywords, currentMeta, category } = req.body;

      if (!currentTitle || !keywords) {
        return res.status(400).json({ message: "Title and keywords are required" });
      }

      const prompt = `Optimize the following product for SEO:
                      Current Title: "${currentTitle}"
                      Keywords: "${keywords}"
                      Category: "${category}"
                      Current Meta: "${currentMeta}"
                      
                      Create an optimized SEO title (under 60 characters), meta description (under 160 characters), 
                      and suggest 5-7 relevant keywords. Calculate an SEO score out of 100.
                      
                      Respond with JSON in this format:
                      {
                        "optimizedTitle": "your title",
                        "optimizedMeta": "your meta description", 
                        "keywords": ["keyword1", "keyword2", "keyword3"],
                        "seoScore": 85
                      }`;

      // the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
      const response = await openai.chat.completions.create({
        model: "gpt-5",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
      });

      const result = JSON.parse(response.choices[0].message.content || "{}");
      res.json(result);
    } catch (error: any) {
      console.error("SEO optimization error:", error);
      res.status(500).json({ message: "Failed to optimize SEO" });
    }
  });

  // Products CRUD
  app.get("/api/products", requireAuth, async (req, res) => {
    try {
      const products = await storage.getProducts(req.user!.id);
      res.json(products);
    } catch (error: any) {
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  app.post("/api/products", requireAuth, async (req, res) => {
    try {
      const productData = { ...req.body, userId: req.user!.id };
      const product = await storage.createProduct(productData);
      res.json(product);
    } catch (error: any) {
      res.status(500).json({ message: "Failed to create product" });
    }
  });

  app.patch("/api/products/:id", requireAuth, async (req, res) => {
    try {
      const product = await storage.updateProduct(req.params.id, req.body);
      res.json(product);
    } catch (error: any) {
      res.status(500).json({ message: "Failed to update product" });
    }
  });

  // Analytics
  app.get("/api/analytics", requireAuth, async (req, res) => {
    try {
      const { type } = req.query;
      const analytics = await storage.getAnalytics(req.user!.id, type as string);
      res.json(analytics);
    } catch (error: any) {
      res.status(500).json({ message: "Failed to fetch analytics" });
    }
  });

  // Stripe subscription routes
  if (stripe) {
    app.post("/api/create-subscription", requireAuth, async (req, res) => {
      try {
        let user = req.user!;
        
        if (user.stripeSubscriptionId) {
          const subscription = await stripe!.subscriptions.retrieve(user.stripeSubscriptionId);
          return res.json({
            subscriptionId: subscription.id,
            clientSecret: (subscription.latest_invoice as any)?.payment_intent?.client_secret,
          });
        }

        let customerId = user.stripeCustomerId;
        if (!customerId) {
          const customer = await stripe!.customers.create({
            email: user.email,
            name: user.fullName,
          });
          customerId = customer.id;
          await storage.updateUserStripeInfo(user.id, customerId, "");
        }

        const subscription = await stripe!.subscriptions.create({
          customer: customerId,
          items: [{
            price: process.env.STRIPE_PRICE_ID || "price_1234", // User needs to set this
          }],
          payment_behavior: 'default_incomplete',
          expand: ['latest_invoice.payment_intent'],
        });

        await storage.updateUserStripeInfo(user.id, customerId, subscription.id);

        res.json({
          subscriptionId: subscription.id,
          clientSecret: (subscription.latest_invoice as any)?.payment_intent?.client_secret,
        });
      } catch (error: any) {
        console.error("Subscription error:", error);
        res.status(400).json({ error: { message: error.message } });
      }
    });
  }

  const httpServer = createServer(app);
  return httpServer;
}
