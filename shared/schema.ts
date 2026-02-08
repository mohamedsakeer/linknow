import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, jsonb, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Export auth models (required for Replit Auth)
export * from "./models/auth";

// Agent profiles
export const profiles = pgTable("profiles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  slug: text("slug").notNull().unique(),
  fullName: text("full_name").notNull(),
  phoneNumber: text("phone_number").notNull(),
  bio: text("bio"),
  location: text("location"),
  agentType: text("agent_type").notNull().default("independent"), // independent or agency
  avatarUrl: text("avatar_url"),
  avatarPosition: integer("avatar_position").default(50), // Vertical position 0-100 (50 = center)
  coverPhotoUrl: text("cover_photo_url"), // Cover photo for Airbnb-style header
  reraId: text("rera_id"), // RERA registration number
  email: text("email"), // Email address for contact
  whatsappNumber: text("whatsapp_number"), // WhatsApp number (can be different from phone)
  instagramUrl: text("instagram_url"), // Instagram profile URL
  linkedinUrl: text("linkedin_url"), // LinkedIn profile URL
  tiktokUrl: text("tiktok_url"), // TikTok profile URL
  youtubeUrl: text("youtube_url"), // YouTube channel URL
  twitterUrl: text("twitter_url"), // Twitter/X profile URL
  facebookUrl: text("facebook_url"), // Facebook profile URL
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  userIdIdx: index("profiles_user_id_idx").on(table.userId),
  slugIdx: index("profiles_slug_idx").on(table.slug),
}));

export const insertProfileSchema = createInsertSchema(profiles).omit({
  id: true,
  userId: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertProfile = z.infer<typeof insertProfileSchema>;
export type Profile = typeof profiles.$inferSelect;

// Properties/Listings
export const properties = pgTable("properties", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  profileId: varchar("profile_id").notNull().references(() => profiles.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  price: text("price").notNull(),
  location: text("location").notNull(),
  bedrooms: integer("bedrooms"),
  bathrooms: integer("bathrooms"),
  area: text("area"), // e.g., "1200 sq ft"
  propertyType: text("property_type"), // apartment, villa, townhouse, etc.
  imageUrl: text("image_url"), // Primary image
  images: text("images").array(), // Array of image URLs (up to 5)
  description: text("description"),
  displayOrder: integer("display_order").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  profileIdIdx: index("properties_profile_id_idx").on(table.profileId),
  displayOrderIdx: index("properties_display_order_idx").on(table.displayOrder),
}));

export const insertPropertySchema = createInsertSchema(properties).omit({
  id: true,
  profileId: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertProperty = z.infer<typeof insertPropertySchema>;
export type Property = typeof properties.$inferSelect;

// Import users from auth models for references
import { users } from "./models/auth";
