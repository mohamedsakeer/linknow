import { 
  type Profile, 
  type InsertProfile,
  type Property,
  type InsertProperty,
  profiles,
  properties,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  // Profile operations
  createProfile(userId: string, data: InsertProfile): Promise<Profile>;
  getProfileByUserId(userId: string): Promise<Profile | undefined>;
  getProfileBySlug(slug: string): Promise<Profile | undefined>;
  getProfileById(id: string): Promise<Profile | undefined>;
  getProfileByPhone(phoneNumber: string): Promise<Profile | undefined>;
  getProfileByPhoneAndEmail(phoneNumber: string, email: string): Promise<Profile | undefined>;
  updateProfile(id: string, data: Partial<InsertProfile>): Promise<Profile>;
  
  // Property operations
  createProperty(profileId: string, data: InsertProperty): Promise<Property>;
  getPropertiesByProfile(profileId: string): Promise<Property[]>;
  getPropertyById(id: string): Promise<Property | undefined>;
  updateProperty(id: string, data: Partial<InsertProperty>): Promise<Property>;
  deleteProperty(id: string): Promise<void>;
  reorderProperties(profileId: string, propertyIds: string[]): Promise<void>;
}

export class Storage implements IStorage {
  // Profile operations
  async createProfile(userId: string, data: InsertProfile): Promise<Profile> {
    const [profile] = await db
      .insert(profiles)
      .values({ ...data, userId })
      .returning();
    return profile;
  }

  async getProfileByUserId(userId: string): Promise<Profile | undefined> {
    const [profile] = await db
      .select()
      .from(profiles)
      .where(eq(profiles.userId, userId));
    return profile;
  }

  async getProfileBySlug(slug: string): Promise<Profile | undefined> {
    const [profile] = await db
      .select()
      .from(profiles)
      .where(eq(profiles.slug, slug));
    return profile;
  }

  async getProfileById(id: string): Promise<Profile | undefined> {
    const [profile] = await db
      .select()
      .from(profiles)
      .where(eq(profiles.id, id));
    return profile;
  }

  async getProfileByPhone(phoneNumber: string): Promise<Profile | undefined> {
    // Normalize phone for lookup (remove spaces, dashes, parentheses)
    const normalizedPhone = phoneNumber.replace(/[\s\-\(\)]/g, '');
    const allProfiles = await db.select().from(profiles);
    // Find profile with matching normalized phone
    return allProfiles.find(p => 
      p.phoneNumber.replace(/[\s\-\(\)]/g, '') === normalizedPhone
    );
  }

  async getProfileByPhoneAndEmail(phoneNumber: string, email: string): Promise<Profile | undefined> {
    // Normalize phone for lookup
    const normalizedPhone = phoneNumber.replace(/[\s\-\(\)]/g, '');
    const allProfiles = await db.select().from(profiles);
    // Find profile with matching normalized phone AND email
    return allProfiles.find(p => 
      p.phoneNumber.replace(/[\s\-\(\)]/g, '') === normalizedPhone &&
      p.email?.toLowerCase() === email?.toLowerCase()
    );
  }

  async updateProfile(id: string, data: Partial<InsertProfile>): Promise<Profile> {
    const [profile] = await db
      .update(profiles)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(profiles.id, id))
      .returning();
    return profile;
  }

  // Property operations
  async createProperty(profileId: string, data: InsertProperty): Promise<Property> {
    // Get max display order for this profile
    const existing = await db
      .select()
      .from(properties)
      .where(eq(properties.profileId, profileId))
      .orderBy(desc(properties.displayOrder));
    
    const maxOrder = existing.length > 0 ? (existing[0].displayOrder || 0) : 0;
    
    const [property] = await db
      .insert(properties)
      .values({ ...data, profileId, displayOrder: maxOrder + 1 })
      .returning();
    return property;
  }

  async getPropertiesByProfile(profileId: string): Promise<Property[]> {
    return db
      .select()
      .from(properties)
      .where(eq(properties.profileId, profileId))
      .orderBy(desc(properties.displayOrder));
  }

  async getPropertyById(id: string): Promise<Property | undefined> {
    const [property] = await db
      .select()
      .from(properties)
      .where(eq(properties.id, id));
    return property;
  }

  async updateProperty(id: string, data: Partial<InsertProperty>): Promise<Property> {
    const [property] = await db
      .update(properties)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(properties.id, id))
      .returning();
    return property;
  }

  async deleteProperty(id: string): Promise<void> {
    await db.delete(properties).where(eq(properties.id, id));
  }

  async reorderProperties(profileId: string, propertyIds: string[]): Promise<void> {
    // Update display order for each property
    for (let i = 0; i < propertyIds.length; i++) {
      await db
        .update(properties)
        .set({ displayOrder: i })
        .where(eq(properties.id, propertyIds[i]));
    }
  }
}

export const storage = new Storage();
