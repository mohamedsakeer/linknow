import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { isAuthenticated } from "./replit_integrations/auth";
import { registerObjectStorageRoutes, ObjectStorageService } from "./replit_integrations/object_storage";
import { generateBio, generatePropertyDescription } from "./replit_integrations/ai";
import { insertProfileSchema, insertPropertySchema } from "@shared/schema";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Register object storage routes
  registerObjectStorageRoutes(app);

  const objectStorageService = new ObjectStorageService();

  // AI Bio generation endpoint
  app.post("/api/generate-bio", async (req, res) => {
    try {
      const { name, location, agentType } = req.body;
      if (!name) {
        return res.status(400).json({ message: "Name is required" });
      }
      const bio = await generateBio(name, location, agentType);
      res.json({ bio });
    } catch (error: any) {
      console.error("Error generating bio:", error);
      res.status(500).json({ message: "Failed to generate bio" });
    }
  });
  
  // AI Property description generation endpoint
  app.post("/api/generate-property-description", isAuthenticated, async (req, res) => {
    try {
      const { type, propertyType, location, price, beds, baths, sqft } = req.body;
      const description = await generatePropertyDescription({
        type: type || 'sale',
        propertyType: propertyType || 'property',
        location: location || '',
        price: price || '',
        beds: beds || 0,
        baths: baths || 0,
        sqft: sqft || ''
      });
      res.json({ description });
    } catch (error: any) {
      console.error("Error generating property description:", error);
      res.status(500).json({ message: "Failed to generate description" });
    }
  });

  // Whitelisted phone numbers that can create multiple profiles
  const WHITELISTED_PHONES = ['+971565829169'];

  // Profile routes
  app.post("/api/profile", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const profileData = insertProfileSchema.parse(req.body);
      
      // Check if user already has a profile
      const existing = await storage.getProfileByUserId(userId);
      if (existing) {
        return res.status(400).json({ message: "Profile already exists" });
      }

      // Normalize phone for comparison (remove spaces, dashes, parentheses)
      const normalizedPhone = profileData.phoneNumber.replace(/[\s\-\(\)]/g, '');
      const isWhitelisted = WHITELISTED_PHONES.some(phone => 
        normalizedPhone === phone.replace(/[\s\-\(\)]/g, '')
      );
      
      if (isWhitelisted) {
        // Whitelisted phone can create multiple profiles but must use different emails
        if (!profileData.email) {
          return res.status(400).json({ message: "Email is required for this phone number" });
        }
        const existingWithSameEmail = await storage.getProfileByPhoneAndEmail(
          profileData.phoneNumber, 
          profileData.email
        );
        if (existingWithSameEmail) {
          return res.status(400).json({ message: "A profile with this phone and email already exists" });
        }
      } else {
        // Non-whitelisted phones must be unique
        const existingPhone = await storage.getProfileByPhone(profileData.phoneNumber);
        if (existingPhone) {
          return res.status(400).json({ message: "This phone number is already registered" });
        }
      }

      const profile = await storage.createProfile(userId, profileData);
      res.json(profile);
    } catch (error: any) {
      console.error("Error creating profile:", error);
      res.status(400).json({ message: error.message || "Failed to create profile" });
    }
  });

  app.get("/api/profile", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const profile = await storage.getProfileByUserId(userId);
      if (!profile) {
        return res.status(404).json({ message: "Profile not found" });
      }
      res.json(profile);
    } catch (error) {
      console.error("Error fetching profile:", error);
      res.status(500).json({ message: "Failed to fetch profile" });
    }
  });

  app.patch("/api/profile", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const profile = await storage.getProfileByUserId(userId);
      if (!profile) {
        return res.status(404).json({ message: "Profile not found" });
      }

      // Handle avatar upload and ACL
      if (req.body.avatarUrl) {
        const normalizedPath = await objectStorageService.trySetObjectEntityAclPolicy(
          req.body.avatarUrl,
          { owner: userId, visibility: "public" }
        );
        req.body.avatarUrl = normalizedPath;
      }

      const updated = await storage.updateProfile(profile.id, req.body);
      res.json(updated);
    } catch (error: any) {
      console.error("Error updating profile:", error);
      res.status(400).json({ message: error.message || "Failed to update profile" });
    }
  });

  // Public profile by slug
  app.get("/api/profile/:slug", async (req, res) => {
    try {
      const profile = await storage.getProfileBySlug(req.params.slug);
      if (!profile) {
        return res.status(404).json({ message: "Profile not found" });
      }
      res.json(profile);
    } catch (error) {
      console.error("Error fetching profile:", error);
      res.status(500).json({ message: "Failed to fetch profile" });
    }
  });

  // Property routes
  app.post("/api/properties", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const profile = await storage.getProfileByUserId(userId);
      if (!profile) {
        return res.status(404).json({ message: "Profile not found" });
      }

      const propertyData = insertPropertySchema.parse(req.body);

      // Handle image upload and ACL
      if (propertyData.imageUrl) {
        const normalizedPath = await objectStorageService.trySetObjectEntityAclPolicy(
          propertyData.imageUrl,
          { owner: userId, visibility: "public" }
        );
        propertyData.imageUrl = normalizedPath;
      }

      const property = await storage.createProperty(profile.id, propertyData);
      res.json(property);
    } catch (error: any) {
      console.error("Error creating property:", error);
      res.status(400).json({ message: error.message || "Failed to create property" });
    }
  });

  app.get("/api/properties", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const profile = await storage.getProfileByUserId(userId);
      if (!profile) {
        return res.status(404).json({ message: "Profile not found" });
      }

      const properties = await storage.getPropertiesByProfile(profile.id);
      res.json(properties);
    } catch (error) {
      console.error("Error fetching properties:", error);
      res.status(500).json({ message: "Failed to fetch properties" });
    }
  });

  // Public properties by slug
  app.get("/api/properties/:slug", async (req, res) => {
    try {
      const profile = await storage.getProfileBySlug(req.params.slug);
      if (!profile) {
        return res.status(404).json({ message: "Profile not found" });
      }
      const properties = await storage.getPropertiesByProfile(profile.id);
      res.json(properties);
    } catch (error) {
      console.error("Error fetching properties:", error);
      res.status(500).json({ message: "Failed to fetch properties" });
    }
  });

  app.patch("/api/properties/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const property = await storage.getPropertyById(req.params.id);
      if (!property) {
        return res.status(404).json({ message: "Property not found" });
      }

      // Verify ownership
      const profile = await storage.getProfileById(property.profileId);
      if (!profile || profile.userId !== userId) {
        return res.status(403).json({ message: "Forbidden" });
      }

      // Handle image upload and ACL - skip ACL setting if object not found (will be set later)
      if (req.body.imageUrl) {
        try {
          const normalizedPath = await objectStorageService.trySetObjectEntityAclPolicy(
            req.body.imageUrl,
            { owner: userId, visibility: "public" }
          );
          req.body.imageUrl = normalizedPath;
        } catch (aclError: any) {
          // If object not found, just save the path as-is - it may take time for object to be accessible
          console.log("ACL setting skipped, using path directly:", req.body.imageUrl);
        }
      }

      const updated = await storage.updateProperty(req.params.id, req.body);
      res.json(updated);
    } catch (error: any) {
      console.error("Error updating property:", error);
      res.status(500).json({ message: error.message || "Failed to update property" });
    }
  });

  app.delete("/api/properties/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const property = await storage.getPropertyById(req.params.id);
      if (!property) {
        return res.status(404).json({ message: "Property not found" });
      }

      // Verify ownership
      const profile = await storage.getProfileById(property.profileId);
      if (!profile || profile.userId !== userId) {
        return res.status(403).json({ message: "Forbidden" });
      }

      await storage.deleteProperty(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting property:", error);
      res.status(500).json({ message: "Failed to delete property" });
    }
  });

  // Reorder properties
  app.post("/api/properties/reorder", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const profile = await storage.getProfileByUserId(userId);
      if (!profile) {
        return res.status(404).json({ message: "Profile not found" });
      }

      const { propertyIds } = req.body;
      if (!Array.isArray(propertyIds)) {
        return res.status(400).json({ message: "Invalid property IDs" });
      }

      await storage.reorderProperties(profile.id, propertyIds);
      res.json({ success: true });
    } catch (error) {
      console.error("Error reordering properties:", error);
      res.status(500).json({ message: "Failed to reorder properties" });
    }
  });

  return httpServer;
}
