import session from "express-session";
import type { Express, RequestHandler } from "express";
import connectPg from "connect-pg-simple";
import bcrypt from "bcryptjs";
import { db } from "../../db";
import { users } from "@shared/models/auth";
import { eq } from "drizzle-orm";

export function getSession() {
  const sessionSecret = process.env.SESSION_SECRET;
  if (!sessionSecret) {
    throw new Error("SESSION_SECRET environment variable is required for security");
  }
  
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: true,
    ttl: sessionTtl,
    tableName: "sessions",
  });
  return session({
    secret: sessionSecret,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: sessionTtl,
    },
  });
}

export async function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());

  // Register endpoint
  app.post("/api/auth/register", async (req, res) => {
    try {
      const { email, password, firstName } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }

      if (password.length < 6) {
        return res.status(400).json({ message: "Password must be at least 6 characters" });
      }

      // Check if user already exists
      const [existingUser] = await db.select().from(users).where(eq(users.email, email.toLowerCase()));
      if (existingUser) {
        return res.status(400).json({ message: "An account with this email already exists" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user
      const [newUser] = await db.insert(users).values({
        email: email.toLowerCase(),
        password: hashedPassword,
        firstName: firstName || null,
      }).returning();

      // Set session
      (req.session as any).userId = newUser.id;
      (req.session as any).user = {
        id: newUser.id,
        email: newUser.email,
        firstName: newUser.firstName,
      };

      res.json({ 
        success: true, 
        user: {
          id: newUser.id,
          email: newUser.email,
          firstName: newUser.firstName,
        }
      });
    } catch (error: any) {
      console.error("Registration error:", error);
      res.status(500).json({ message: "Registration failed. Please try again." });
    }
  });

  // Login endpoint
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }

      // Find user
      const [user] = await db.select().from(users).where(eq(users.email, email.toLowerCase()));
      if (!user) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      // Check password
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      // Set session
      (req.session as any).userId = user.id;
      (req.session as any).user = {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
      };

      res.json({ 
        success: true, 
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
        }
      });
    } catch (error: any) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Login failed. Please try again." });
    }
  });

  // Logout endpoint
  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Logout failed" });
      }
      // Clear cookie with same options it was set with for production compatibility
      res.clearCookie("connect.sid", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        path: "/",
      });
      res.json({ success: true });
    });
  });

  // Get current user endpoint
  app.get("/api/auth/user", (req, res) => {
    const sessionUser = (req.session as any).user;
    if (!sessionUser) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    res.json(sessionUser);
  });

  // Change password endpoint (requires current password for security)
  app.post("/api/auth/change-password", async (req, res) => {
    try {
      const { email, currentPassword, newPassword } = req.body;
      
      if (!email || !currentPassword || !newPassword) {
        return res.status(400).json({ message: "Email, current password, and new password are required" });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({ message: "New password must be at least 6 characters" });
      }

      // Find user
      const [user] = await db.select().from(users).where(eq(users.email, email.toLowerCase()));
      if (!user) {
        return res.status(404).json({ message: "No account found with this email" });
      }

      // Verify current password
      const isValidPassword = await bcrypt.compare(currentPassword, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Current password is incorrect" });
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // Update password
      await db.update(users)
        .set({ password: hashedPassword, updatedAt: new Date() })
        .where(eq(users.email, email.toLowerCase()));

      res.json({ success: true, message: "Password changed successfully" });
    } catch (error: any) {
      console.error("Change password error:", error);
      res.status(500).json({ message: "Password change failed. Please try again." });
    }
  });
}

export const isAuthenticated: RequestHandler = async (req, res, next) => {
  const sessionUser = (req.session as any).user;
  
  if (!sessionUser) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  // Attach user info to request for route handlers
  (req as any).user = {
    claims: {
      sub: sessionUser.id,
    },
    ...sessionUser,
  };

  return next();
};
