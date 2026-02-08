export type PropertyType = "rent" | "sale";

export type PropertyCategory = "apartment" | "villa" | "townhouse" | "penthouse" | "studio" | "office";

export interface Property {
  id: string;
  type: PropertyType;
  price: string;
  images: string[];
  description: string;
  location?: string;
  beds?: string;
  baths?: string;
  sqft?: string;
  propertyType?: PropertyCategory;
}

export interface AgentProfile {
  name: string;
  bio: string;
  avatar: string;
  phone: string;
  slug: string;
  reraId?: string;
  location?: string;
  agentType?: string;
  coverPhoto?: string;
  email?: string;
  whatsappNumber?: string;
  instagramUrl?: string;
  linkedinUrl?: string;
  tiktokUrl?: string;
  youtubeUrl?: string;
  twitterUrl?: string;
  facebookUrl?: string;
  avatarPosition?: number;
}
