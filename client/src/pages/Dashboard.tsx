import { useState, useRef, useEffect, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Redirect } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import { Sparkles, Plus, Trash2, MoveUp, MoveDown, Image as ImageIcon, X, Smartphone, Eye, Crop, ZoomIn, ChevronLeft, ChevronRight, ChevronDown, ChevronUp, Bed, Bath, Ruler, MapPin, Home, Copy, LogOut, Loader2, ExternalLink } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { useUpload } from "@/hooks/use-upload";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Property, AgentProfile, PropertyType } from "@/lib/types";
import type { Profile, InsertProfile, Property as DBProperty, InsertProperty } from "@shared/schema";

function fixImageUrl(url: string | undefined | null): string | null {
  if (!url) return null;
  if (url.includes('/api/uploads/')) return url.replace('/api/uploads/', '');
  return url;
}

function formatPrice(price: string): string {
  if (!price) return "";
  const num = price.replace(/[^0-9]/g, '');
  return num.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  return isMobile;
}

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("properties");
  const [expandedPropertyId, setExpandedPropertyId] = useState<string | null>(null);
  const [previewReady, setPreviewReady] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user, isLoading: authLoading, isAuthenticated, logout } = useAuth();
  const isMobile = useIsMobile();
  
  // Delay iframe loading to prevent React DOM conflicts
  useEffect(() => {
    const timer = setTimeout(() => setPreviewReady(true), 500);
    return () => clearTimeout(timer);
  }, []);

  const { data: dbProfile, isLoading: profileLoading } = useQuery<Profile>({
    queryKey: ["/api/profile"],
    queryFn: async () => {
      const res = await fetch("/api/profile", { credentials: "include" });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch profile");
      return res.json();
    },
    enabled: isAuthenticated,
  });

  const createProfileMutation = useMutation({
    mutationFn: async (data: InsertProfile) => {
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create profile");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/profile"] });
      toast({ title: "Profile Created", description: "Your profile has been set up successfully." });
    },
  });

  useEffect(() => {
    if (!profileLoading && !dbProfile && isAuthenticated && !createProfileMutation.isPending) {
      const onboardingData = sessionStorage.getItem("onboarding_data") || sessionStorage.getItem("onboardingData");
      let profileData: InsertProfile;
      
      if (onboardingData) {
        try {
          const data = JSON.parse(onboardingData);
          profileData = {
            slug: data.slug || `agent-${Date.now()}`,
            fullName: data.name || data.fullName || user?.firstName || "New Agent",
            phoneNumber: data.phone || data.phoneNumber || "",
            bio: data.bio || "",
            location: data.location || "",
            agentType: data.agentType || "independent",
            avatarUrl: data.avatar || data.avatarUrl || "",
          };
          sessionStorage.removeItem("onboarding_data");
          sessionStorage.removeItem("onboardingData");
        } catch (e) {
          profileData = {
            slug: `agent-${Date.now()}`,
            fullName: user?.firstName || "New Agent",
            phoneNumber: "",
            bio: "",
            location: "",
            agentType: "independent",
            avatarUrl: "",
          };
        }
      } else {
        profileData = {
          slug: `agent-${Date.now()}`,
          fullName: user?.firstName || "New Agent",
          phoneNumber: "",
          bio: "",
          location: "",
          agentType: "independent",
          avatarUrl: "",
        };
      }
      
      createProfileMutation.mutate(profileData);
    }
  }, [profileLoading, dbProfile, isAuthenticated, createProfileMutation.isPending, user]);

  const { data: dbProperties = [], isLoading: propertiesLoading } = useQuery<DBProperty[]>({
    queryKey: ["/api/properties"],
    queryFn: async () => {
      const res = await fetch("/api/properties", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch properties");
      return res.json();
    },
    enabled: isAuthenticated && !!dbProfile,
  });

  const fixedAvatarUrl = fixImageUrl(dbProfile?.avatarUrl);
  const fixedCoverUrl = fixImageUrl((dbProfile as any)?.coverPhotoUrl);
  const profile: AgentProfile = dbProfile ? {
    name: dbProfile.fullName,
    bio: dbProfile.bio || "",
    avatar: fixedAvatarUrl || "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=256&q=80",
    phone: dbProfile.phoneNumber,
    slug: dbProfile.slug,
    reraId: (dbProfile as any).reraId || "",
    location: dbProfile.location || "",
    agentType: dbProfile.agentType || "independent",
    coverPhoto: fixedCoverUrl || "",
    instagramUrl: (dbProfile as any).instagramUrl || "",
    linkedinUrl: (dbProfile as any).linkedinUrl || "",
    tiktokUrl: (dbProfile as any).tiktokUrl || "",
    youtubeUrl: (dbProfile as any).youtubeUrl || "",
    twitterUrl: (dbProfile as any).twitterUrl || "",
    facebookUrl: (dbProfile as any).facebookUrl || "",
    email: (dbProfile as any).email || "",
    whatsappNumber: (dbProfile as any).whatsappNumber || "",
    avatarPosition: (dbProfile as any).avatarPosition ?? 50,
  } : {
    name: "New Agent",
    bio: "",
    avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=256&q=80",
    phone: "",
    slug: "new-agent",
    coverPhoto: "",
    instagramUrl: "",
    linkedinUrl: "",
    tiktokUrl: "",
    youtubeUrl: "",
    twitterUrl: "",
    facebookUrl: "",
    email: "",
    whatsappNumber: "",
    avatarPosition: 50,
  };

  const addPropertyMutation = useMutation({
    mutationFn: async (displayOrder: number) => {
      const res = await fetch("/api/properties", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          title: "",
          price: "",
          location: "",
          bedrooms: 0,
          bathrooms: 0,
          area: "",
          propertyType: "apartment",
          imageUrl: "",
          description: "",
          displayOrder,
        }),
      });
      if (!res.ok) throw new Error("Failed to add property");
      return res.json();
    },
    onSuccess: (newProperty: Property) => {
      queryClient.invalidateQueries({ queryKey: ["/api/properties"] });
      setExpandedPropertyId(newProperty.id);
      toast({ title: "Property Added", description: "Start editing your new listing." });
    },
  });

  const updatePropertyMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<InsertProperty> }) => {
      const res = await fetch(`/api/properties/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(updates),
      });
      if (!res.ok) throw new Error("Failed to update property");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/properties"] });
    },
  });

  const deletePropertyMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/properties/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to delete property");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/properties"] });
      toast({ title: "Property Deleted", description: "The property has been removed." });
    },
  });

  const reorderPropertiesMutation = useMutation({
    mutationFn: async (propertyIds: string[]) => {
      const res = await fetch("/api/properties/reorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ propertyIds }),
      });
      if (!res.ok) throw new Error("Failed to reorder properties");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/properties"] });
    },
  });
  
  const duplicatePropertyMutation = useMutation({
    mutationFn: async (property: Property) => {
      const res = await fetch("/api/properties", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          title: property.type === "rent" ? "For Rent" : "For Sale",
          price: property.price,
          location: property.location,
          bedrooms: parseInt(property.beds || "0") || 0,
          bathrooms: parseInt(property.baths || "0") || 0,
          area: property.sqft,
          propertyType: property.propertyType,
          imageUrl: property.images[0] || "",
          images: property.images,
          description: property.description,
          displayOrder: 0,
        }),
      });
      if (!res.ok) throw new Error("Failed to duplicate property");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/properties"] });
      toast({ title: "Property Copied", description: "You can now edit the copy." });
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (updates: Partial<InsertProfile>) => {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(updates),
      });
      if (!res.ok) throw new Error("Failed to update profile");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/profile"] });
    },
  });

  const properties: Property[] = dbProperties.map(p => {
    const dbImages = (p as any).images as string[] | null;
    let images: string[] = [];
    if (dbImages && dbImages.length > 0) {
      images = dbImages.map(img => fixImageUrl(img)).filter(Boolean) as string[];
    } else if (p.imageUrl) {
      const fixedImg = fixImageUrl(p.imageUrl);
      if (fixedImg) images = [fixedImg];
    }
    
    return {
      id: p.id,
      type: (p.title?.toLowerCase().includes("rent") ? "rent" : "sale") as PropertyType,
      price: p.price,
      images,
      description: p.description || "",
      location: p.location,
      beds: p.bedrooms?.toString(),
      baths: p.bathrooms?.toString(),
      sqft: p.area || "",
      propertyType: (p.propertyType || "apartment") as any,
    };
  });

  if (!authLoading && !isAuthenticated) {
    window.location.href = "/";
    return null;
  }

  if (authLoading || profileLoading || createProfileMutation.isPending) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-3 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-sm text-muted-foreground">
            {createProfileMutation.isPending ? "Setting up your profile..." : "Loading..."}
          </p>
        </div>
      </div>
    );
  }

  const addProperty = () => {
    if (properties.length >= 30) {
      toast({ title: "Limit Reached", description: "Max 30 properties allowed.", variant: "destructive" });
      return;
    }
    addPropertyMutation.mutate(0);
  };
  
  const duplicateProperty = (property: Property) => {
    if (properties.length >= 30) {
      toast({ title: "Limit Reached", description: "Max 30 properties allowed.", variant: "destructive" });
      return;
    }
    duplicatePropertyMutation.mutate(property);
  };

  const removeProperty = (id: string) => {
    deletePropertyMutation.mutate(id);
  };

  const updateProperty = (id: string, updates: Partial<Property>) => {
    const dbUpdates: Partial<InsertProperty> = {};
    if (updates.price !== undefined) dbUpdates.price = updates.price;
    if (updates.description !== undefined) dbUpdates.description = updates.description;
    if (updates.location !== undefined) dbUpdates.location = updates.location;
    if (updates.beds !== undefined) dbUpdates.bedrooms = parseInt(updates.beds) || 0;
    if (updates.baths !== undefined) dbUpdates.bathrooms = parseInt(updates.baths) || 0;
    if (updates.sqft !== undefined) dbUpdates.area = updates.sqft;
    if (updates.propertyType !== undefined) dbUpdates.propertyType = updates.propertyType;
    if (updates.images !== undefined) {
      dbUpdates.imageUrl = updates.images[0] || "";
      (dbUpdates as any).images = updates.images;
    }
    if (updates.type !== undefined) {
      dbUpdates.title = updates.type === "rent" ? "For Rent" : "For Sale";
    }
    
    updatePropertyMutation.mutate({ id, updates: dbUpdates });
  };

  const moveProperty = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= properties.length) return;
    
    const newProperties = [...dbProperties];
    const [moved] = newProperties.splice(index, 1);
    newProperties.splice(newIndex, 0, moved);
    
    const propertyIds = newProperties.map(p => p.id);
    reorderPropertiesMutation.mutate(propertyIds);
  };

  const updateProfile = (updates: Partial<AgentProfile>) => {
    const dbUpdates: Partial<InsertProfile> = {};
    if (updates.name !== undefined) dbUpdates.fullName = updates.name;
    if (updates.bio !== undefined) dbUpdates.bio = updates.bio;
    if (updates.phone !== undefined) dbUpdates.phoneNumber = updates.phone;
    if (updates.avatar !== undefined) dbUpdates.avatarUrl = updates.avatar;
    if (updates.slug !== undefined) dbUpdates.slug = updates.slug;
    if (updates.reraId !== undefined) (dbUpdates as any).reraId = updates.reraId;
    if (updates.coverPhoto !== undefined) (dbUpdates as any).coverPhotoUrl = updates.coverPhoto;
    if (updates.instagramUrl !== undefined) (dbUpdates as any).instagramUrl = updates.instagramUrl;
    if (updates.linkedinUrl !== undefined) (dbUpdates as any).linkedinUrl = updates.linkedinUrl;
    if (updates.tiktokUrl !== undefined) (dbUpdates as any).tiktokUrl = updates.tiktokUrl;
    if (updates.youtubeUrl !== undefined) (dbUpdates as any).youtubeUrl = updates.youtubeUrl;
    if (updates.twitterUrl !== undefined) (dbUpdates as any).twitterUrl = updates.twitterUrl;
    if (updates.facebookUrl !== undefined) (dbUpdates as any).facebookUrl = updates.facebookUrl;
    if (updates.email !== undefined) (dbUpdates as any).email = updates.email;
    if (updates.whatsappNumber !== undefined) (dbUpdates as any).whatsappNumber = updates.whatsappNumber;
    if (updates.avatarPosition !== undefined) (dbUpdates as any).avatarPosition = updates.avatarPosition;
    
    updateProfileMutation.mutate(dbUpdates);
  };

  const handleShareToWhatsApp = () => {
    // Use linknow.live domain for sharing (production URL)
    const baseUrl = window.location.hostname === 'localhost' || window.location.hostname.includes('replit') 
      ? 'https://linknow.live' 
      : window.location.origin;
    const url = `${baseUrl}/${profile.slug}`;
    const text = `Check out my real estate profile: ${url}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
    toast({ title: "Opening WhatsApp", description: "Sharing your profile..." });
  };

  const handleAiWrite = async (field: string, currentText: string, setter: (val: string) => void, context?: any) => {
    toast({ title: "AI Thinking...", description: "Generating content..." });
    
    try {
      if (field === "bio") {
        const res = await fetch("/api/generate-bio", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            name: profile?.name || "Agent",
            location: profile?.location || "",
            agentType: profile?.agentType || "independent"
          })
        });
        if (!res.ok) throw new Error("Failed to generate bio");
        const data = await res.json();
        setter(data.bio);
        toast({ title: "AI Bio Generated" });
      }
      
      if (field === "description") {
        const { location, price, type, propertyType, beds, baths, sqft } = context || {};
        const res = await fetch("/api/generate-property-description", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            type: type || 'sale',
            propertyType: propertyType || 'property',
            location: location || '',
            price: price || '',
            beds: beds || 0,
            baths: baths || 0,
            sqft: sqft || ''
          })
        });
        if (!res.ok) throw new Error("Failed to generate description");
        const data = await res.json();
        setter(data.description);
        toast({ title: "AI Description Generated" });
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to generate content.", variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F7F7]">
      {/* Header - Clean, minimal */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
        <div className="mx-auto px-4 md:px-8">
          <div className="h-16 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-[#FF5A5F] flex items-center justify-center text-white">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
              </div>
              <span className="font-display font-bold text-lg text-[#FF5A5F]">Linknow</span>
            </div>
            
            <div className="flex items-center gap-2">
              <Button 
                size="sm" 
                className="h-10 px-4 bg-[#FF5A5F] hover:bg-[#e54a4f] text-white text-sm font-semibold"
                onClick={() => window.open(`/${dbProfile?.slug}`, '_blank')}
                disabled={!dbProfile?.slug}
                data-testid="button-live-link"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Live
              </Button>
              <Button 
                size="sm" 
                className="h-10 px-4 bg-[#25D366] hover:bg-[#20BD5A] text-white text-sm font-semibold"
                onClick={handleShareToWhatsApp}
              >
                <Smartphone className="w-4 h-4 mr-2" />
                Share
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-10 w-10 p-0 text-gray-400 hover:text-red-500"
                onClick={() => logout()}
                data-testid="button-signout"
              >
                <LogOut className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto px-4 md:px-8 py-6">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 justify-center">
          
          {/* Left: Editor Panel */}
          <div className="flex-1 min-w-0 max-w-[640px]">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <div className="flex justify-center mb-6">
                <TabsList className="h-12 p-1 bg-white border border-gray-200 rounded-full shadow-sm">
                  <TabsTrigger 
                    value="properties" 
                    className="px-4 sm:px-6 h-10 text-sm font-semibold rounded-full text-gray-600"
                    style={{ 
                      backgroundColor: activeTab === 'properties' ? '#FF5A5F' : 'transparent',
                      color: activeTab === 'properties' ? 'white' : '#4b5563'
                    }}
                  >
                    Properties
                  </TabsTrigger>
                  <TabsTrigger 
                    value="profile"
                    className="px-4 sm:px-6 h-10 text-sm font-semibold rounded-full text-gray-600"
                    style={{ 
                      backgroundColor: activeTab === 'profile' ? '#FF5A5F' : 'transparent',
                      color: activeTab === 'profile' ? 'white' : '#4b5563'
                    }}
                  >
                    Profile
                  </TabsTrigger>
                  <TabsTrigger 
                    value="preview"
                    className="px-4 sm:px-6 h-10 text-sm font-semibold rounded-full text-gray-600"
                    style={{ 
                      display: isMobile ? 'inline-flex' : 'none',
                      backgroundColor: activeTab === 'preview' ? '#FF5A5F' : 'transparent',
                      color: activeTab === 'preview' ? 'white' : '#4b5563'
                    }}
                  >
                    Preview
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="properties" className="mt-0">
                {/* Header */}
                <div className="bg-white rounded-2xl p-5 mb-4 shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <h1 className="text-xl font-bold text-gray-900">Your Listings</h1>
                      <p className="text-sm text-gray-500 mt-0.5">Manage up to 30 properties</p>
                    </div>
                    <Button 
                      onClick={addProperty} 
                      className="h-11 px-5 text-sm font-semibold bg-[#FF5A5F] hover:bg-[#e54a4f] shadow-md"
                    >
                      <Plus className="w-4 h-4 mr-2" /> Add Property
                    </Button>
                  </div>
                </div>

                <div className="space-y-4">
                  {properties.map((property, index) => (
                    <PropertyCard 
                      key={property.id} 
                      property={property} 
                      index={index}
                      total={properties.length}
                      isExpanded={expandedPropertyId === property.id}
                      onToggleExpand={() => setExpandedPropertyId(expandedPropertyId === property.id ? null : property.id)}
                      onUpdate={(updates: Partial<Property>) => updateProperty(property.id, updates)}
                      onRemove={() => removeProperty(property.id)}
                      onDuplicate={() => duplicateProperty(property)}
                      onMove={(dir: 'up' | 'down') => moveProperty(index, dir)}
                      onAiWrite={handleAiWrite}
                    />
                  ))}
                  
                  {properties.length === 0 && (
                    <Card className="border-2 border-dashed border-gray-200 bg-white rounded-2xl">
                      <CardContent className="py-12 text-center">
                        <div className="w-16 h-16 rounded-full bg-gray-100 mx-auto flex items-center justify-center mb-4">
                          <ImageIcon className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No properties yet</h3>
                        <p className="text-sm text-gray-500 mb-5">Add your first listing to get started</p>
                        <Button onClick={addProperty} className="h-11 px-6 text-sm font-semibold bg-[#FF5A5F] hover:bg-[#e54a4f]">
                          <Plus className="w-4 h-4 mr-2" /> Add Property
                        </Button>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="profile" className="mt-0">
                {/* Header */}
                <div className="bg-white rounded-2xl p-5 mb-4 shadow-sm border border-gray-100">
                  <h1 className="text-xl font-bold text-gray-900">Your Profile</h1>
                  <p className="text-sm text-gray-500 mt-0.5">Your public business card details</p>
                </div>
                
                <ProfileEditor 
                  profile={profile} 
                  onUpdate={updateProfile}
                  onAiWrite={handleAiWrite}
                />
              </TabsContent>

              {/* Live Preview Tab - Mobile Only */}
              <TabsContent value="preview" className="mt-0" style={{ display: isMobile && activeTab === 'preview' ? 'block' : 'none' }}>
                <div className="rounded-2xl overflow-hidden shadow-sm border border-gray-100 h-[600px]">
                  {dbProfile?.slug && previewReady ? (
                    <iframe 
                      key={`mobile-preview-${dbProfile.slug}`}
                      src={`/${dbProfile.slug}?embed=1`}
                      className="w-full h-full border-0"
                      title="Profile Preview"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      Loading preview...
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Right: Desktop Preview Panel */}
          <div className="hidden lg:block w-[380px] xl:w-[420px] shrink-0">
            <div className="sticky top-24">
              <div className="text-center mb-4">
                <Badge variant="outline" className="bg-white text-xs font-medium text-gray-500 border-gray-200">
                  Live Preview
                </Badge>
              </div>
              <div className="flex justify-center">
                <div className="transform scale-[0.65] xl:scale-[0.7] origin-top">
                  <div className="w-[420px] h-[900px] border border-gray-200 rounded-[44px] overflow-hidden shadow-xl bg-white">
                    {dbProfile?.slug && previewReady ? (
                      <iframe 
                        key={`preview-${dbProfile.slug}`}
                        src={`/${dbProfile.slug}?embed=1`}
                        className="w-full h-full border-0"
                        title="Profile Preview"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        Loading preview...
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}

function PropertyCard({ property, index, total, isExpanded, onToggleExpand, onUpdate, onRemove, onDuplicate, onMove, onAiWrite }: any) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  
  const [localLocation, setLocalLocation] = useState(property.location || "");
  const [localBeds, setLocalBeds] = useState(property.beds || "");
  const [localBaths, setLocalBaths] = useState(property.baths || "");
  const [localSqft, setLocalSqft] = useState(property.sqft || "");
  const [localDescription, setLocalDescription] = useState(property.description || "");
  const [localPrice, setLocalPrice] = useState(property.price || "");
  const [localTitle, setLocalTitle] = useState(property.title || "");
  
  useEffect(() => {
    setLocalLocation(property.location || "");
    setLocalBeds(property.beds || "");
    setLocalBaths(property.baths || "");
    setLocalSqft(property.sqft || "");
    setLocalDescription(property.description || "");
    setLocalPrice(property.price || "");
    setLocalTitle(property.title || "");
  }, [property.id]);
  
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const debouncedUpdate = (field: string, value: string) => {
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      onUpdate({ [field]: value });
    }, 500);
  };

  const uploadedImagesRef = useRef<string[]>([...property.images]);
  
  const { uploadFile, isUploading } = useUpload({
    onSuccess: (response) => {
      const imageUrl = response.objectPath;
      uploadedImagesRef.current = [imageUrl, ...uploadedImagesRef.current].slice(0, 5);
      onUpdate({ images: uploadedImagesRef.current });
    },
    onError: (error) => {
      toast({ title: "Upload Failed", description: error.message, variant: "destructive" });
    },
  });
  
  useEffect(() => {
    uploadedImagesRef.current = [...property.images];
  }, [property.images]);
  
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const remainingSlots = 5 - property.images.length;
    if (remainingSlots <= 0) {
      toast({ title: "Limit Reached", description: "Max 5 images per property.", variant: "destructive" });
      return;
    }
    
    const filesToUpload = Array.from(files).slice(0, remainingSlots);
    uploadedImagesRef.current = [...property.images];
    
    for (const file of filesToUpload) {
      await uploadFile(file);
    }
    
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeImage = (imgIndex: number) => {
    const newImages = [...property.images];
    newImages.splice(imgIndex, 1);
    onUpdate({ images: newImages });
  };

  const moveImage = (imgIndex: number, direction: 'left' | 'right') => {
    const newImages = [...property.images];
    const targetIndex = direction === 'left' ? imgIndex - 1 : imgIndex + 1;
    if (targetIndex < 0 || targetIndex >= newImages.length) return;
    [newImages[imgIndex], newImages[targetIndex]] = [newImages[targetIndex], newImages[imgIndex]];
    onUpdate({ images: newImages });
  };

  // Collapsed View - compact row with thumbnail, title, price, location
  if (!isExpanded) {
    return (
      <Card 
        className="bg-white border-gray-100 shadow-sm hover:shadow-md transition-all cursor-pointer rounded-2xl"
        onClick={onToggleExpand}
      >
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            {/* Thumbnail */}
            <div className="w-16 h-16 shrink-0 rounded-xl overflow-hidden bg-gray-100">
              {property.images && property.images.length > 0 ? (
                <img src={property.images[0]} alt="" className="w-full h-full object-cover" loading="lazy" decoding="async" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ImageIcon className="w-6 h-6 text-gray-300" />
                </div>
              )}
            </div>
            
            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Badge className={`text-xs px-2 py-0.5 ${property.type === 'rent' ? 'bg-blue-500' : 'bg-emerald-500'}`}>
                  {property.type === 'rent' ? 'RENT' : 'SALE'}
                </Badge>
                <span className="text-xs text-gray-500 capitalize">{property.propertyType || 'Apartment'}</span>
              </div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-semibold text-sm text-emerald-600">
                  AED {formatPrice(property.price) || '0'}
                </span>
                {property.location && (
                  <span className="text-xs text-gray-500 flex items-center gap-1 truncate">
                    <MapPin className="w-3.5 h-3.5" /> {property.location}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-4 text-xs text-gray-400">
                {property.beds && <span className="flex items-center gap-1"><Bed className="w-3.5 h-3.5" /> {property.beds}</span>}
                {property.baths && <span className="flex items-center gap-1"><Bath className="w-3.5 h-3.5" /> {property.baths}</span>}
                {property.sqft && <span className="flex items-center gap-1"><Ruler className="w-3.5 h-3.5" /> {property.sqft} sqft</span>}
              </div>
            </div>
            
            {/* Expand Icon */}
            <ChevronDown className="w-6 h-6 text-gray-400 shrink-0" />
          </div>
        </CardContent>
      </Card>
    );
  }

  // Expanded View - full editing form
  return (
    <Card className="bg-white border-gray-100 shadow-md ring-2 ring-[#FF5A5F]/20 transition-shadow rounded-2xl">
      <CardContent className="p-5 space-y-5">
        
        {/* Collapse Header */}
        <div 
          className="flex items-center justify-between cursor-pointer pb-3 border-b border-gray-100"
          onClick={onToggleExpand}
        >
          <span className="text-sm font-semibold text-gray-800">Editing Property</span>
          <ChevronUp className="w-6 h-6 text-gray-400" />
        </div>
        
        {/* Type Toggle Row */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center bg-gray-100 rounded-full p-1 h-11">
            <button
              onClick={(e) => { e.stopPropagation(); onUpdate({ type: 'rent' }); }}
              className={`px-5 h-9 rounded-full text-sm font-bold uppercase tracking-wide transition-all ${
                property.type === 'rent' ? 'bg-blue-500 text-white shadow' : 'text-gray-500 hover:bg-gray-200'
              }`}
            >
              Rent
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onUpdate({ type: 'sale' }); }}
              className={`px-5 h-9 rounded-full text-sm font-bold uppercase tracking-wide transition-all ${
                property.type === 'sale' ? 'bg-emerald-500 text-white shadow' : 'text-gray-500 hover:bg-gray-200'
              }`}
            >
              Sale
            </button>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-10 w-10 text-gray-400" disabled={index === 0} onClick={() => onMove('up')}>
              <MoveUp className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon" className="h-10 w-10 text-gray-400" disabled={index === total - 1} onClick={() => onMove('down')}>
              <MoveDown className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon" className="h-10 w-10 text-blue-500 hover:text-blue-600 hover:bg-blue-50" onClick={onDuplicate}>
              <Copy className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon" className="h-10 w-10 text-red-400 hover:text-red-600 hover:bg-red-50" onClick={onRemove}>
              <Trash2 className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Property Type & Price Row */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-xs font-medium text-gray-500 uppercase">Property Type</Label>
            <Select value={property.propertyType || "apartment"} onValueChange={(val) => onUpdate({ propertyType: val })}>
              <SelectTrigger className="h-11 text-sm border-gray-200 bg-gray-50">
                <Home className="w-4 h-4 mr-2 text-gray-400 shrink-0" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="apartment">Apartment</SelectItem>
                <SelectItem value="villa">Villa</SelectItem>
                <SelectItem value="townhouse">Townhouse</SelectItem>
                <SelectItem value="penthouse">Penthouse</SelectItem>
                <SelectItem value="studio">Studio</SelectItem>
                <SelectItem value="office">Office</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-medium text-gray-500 uppercase">Price (AED)</Label>
            <Input 
              placeholder="Enter price" 
              value={localPrice}
              onChange={(e) => {
                const value = e.target.value.replace(/[^0-9]/g, '');
                setLocalPrice(value);
                debouncedUpdate('price', value);
              }}
              className="h-11 text-sm font-semibold border-gray-200 bg-gray-50"
            />
          </div>
        </div>

        {/* Images */}
        <div className="space-y-2">
          <Label className="text-xs font-medium text-gray-500 uppercase">Photos (max 5)</Label>
          <div className="flex gap-3 overflow-x-auto pb-1">
            {property.images.map((img: string, i: number) => (
              <div key={i} className="relative w-20 h-20 shrink-0 rounded-xl overflow-hidden border border-gray-200 group/img">
                <img src={img} alt="" className="w-full h-full object-cover" loading="lazy" decoding="async" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center gap-1">
                  <button onClick={() => moveImage(i, 'left')} className="p-1.5 rounded-full bg-white/20 text-white disabled:opacity-30" disabled={i === 0}>
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button onClick={() => removeImage(i)} className="p-1.5 rounded-full bg-red-500 text-white">
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => moveImage(i, 'right')} className="p-1.5 rounded-full bg-white/20 text-white disabled:opacity-30" disabled={i === property.images.length - 1}>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
            {property.images.length < 5 && (
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="w-20 h-20 shrink-0 rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:border-[#FF5A5F] hover:bg-[#FF5A5F]/5 transition-colors"
              >
                {isUploading ? (
                  <Loader2 className="w-6 h-6 text-[#FF5A5F] animate-spin" />
                ) : (
                  <>
                    <Plus className="w-6 h-6 text-gray-400" />
                    <span className="text-xs text-gray-400 mt-1">Add</span>
                  </>
                )}
              </div>
            )}
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" multiple onChange={handleImageUpload} />
          </div>
        </div>

        {/* Details Grid - responsive columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-xs font-medium text-gray-500 uppercase flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" /> Location
            </Label>
            <Input 
              placeholder="e.g. Marina" 
              value={localLocation} 
              onChange={(e) => {
                setLocalLocation(e.target.value);
                debouncedUpdate('location', e.target.value);
              }}
              className="h-11 text-sm"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-medium text-gray-500 uppercase flex items-center gap-1">
              <Ruler className="w-3.5 h-3.5" /> Area (sqft)
            </Label>
            <Input 
              placeholder="e.g. 1200" 
              type="number"
              min="0"
              value={localSqft} 
              onChange={(e) => {
                setLocalSqft(e.target.value);
                debouncedUpdate('sqft', e.target.value);
              }}
              className="h-11 text-sm"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-medium text-gray-500 uppercase flex items-center gap-1">
              <Bed className="w-3.5 h-3.5" /> Bedrooms
            </Label>
            <Input 
              placeholder="0" 
              type="number"
              min="0"
              value={localBeds} 
              onChange={(e) => {
                setLocalBeds(e.target.value);
                debouncedUpdate('beds', e.target.value);
              }}
              className="h-11 text-sm"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-medium text-gray-500 uppercase flex items-center gap-1">
              <Bath className="w-3.5 h-3.5" /> Bathrooms
            </Label>
            <Input 
              placeholder="0" 
              type="number"
              min="0"
              value={localBaths} 
              onChange={(e) => {
                setLocalBaths(e.target.value);
                debouncedUpdate('baths', e.target.value);
              }}
              className="h-11 text-sm"
            />
          </div>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-medium text-gray-500 uppercase">Description</Label>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 text-xs text-[#FF5A5F] hover:bg-[#FF5A5F]/10 px-3"
              onClick={() => onAiWrite("description", localDescription, (val: string) => {
                setLocalDescription(val);
                onUpdate({ description: val });
              }, property)}
            >
              <Sparkles className="w-3.5 h-3.5 mr-1" /> AI Write
            </Button>
          </div>
          <Textarea 
            placeholder="Describe property highlights..."
            value={localDescription}
            onChange={(e) => {
              setLocalDescription(e.target.value);
              debouncedUpdate('description', e.target.value);
            }}
            className="h-24 text-sm resize-none"
            maxLength={120}
          />
        </div>

      </CardContent>
    </Card>
  );
}

function ProfileEditor({ profile, onUpdate, onAiWrite }: any) {
  const [isPhotoDialogOpen, setIsPhotoDialogOpen] = useState(false);
  const [zoom, setZoom] = useState([100]);
  const [verticalPosition, setVerticalPosition] = useState([profile.avatarPosition ?? 50]);
  const [localName, setLocalName] = useState(profile.name);
  const [localPhone, setLocalPhone] = useState(profile.phone);
  const [localReraId, setLocalReraId] = useState(profile.reraId || "");
  const [localBio, setLocalBio] = useState(profile.bio);
  const [localInstagram, setLocalInstagram] = useState(profile.instagramUrl || "");
  const [localLinkedin, setLocalLinkedin] = useState(profile.linkedinUrl || "");
  const [localTiktok, setLocalTiktok] = useState(profile.tiktokUrl || "");
  const [localYoutube, setLocalYoutube] = useState(profile.youtubeUrl || "");
  const [localTwitter, setLocalTwitter] = useState(profile.twitterUrl || "");
  const [localFacebook, setLocalFacebook] = useState(profile.facebookUrl || "");
  const [localEmail, setLocalEmail] = useState(profile.email || "");
  const [localWhatsapp, setLocalWhatsapp] = useState(profile.whatsappNumber || "");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const validateEmail = (email: string) => {
    if (!email) return "";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) ? "" : "Please enter a valid email address";
  };

  const validatePhone = (phone: string) => {
    if (!phone) return "";
    const phoneRegex = /^\+?[\d\s\-()]{8,20}$/;
    return phoneRegex.test(phone.replace(/\s/g, '')) ? "" : "Please enter a valid phone number";
  };

  const validateUrl = (url: string, platform: string) => {
    if (!url) return "";
    try {
      new URL(url);
      return "";
    } catch {
      return `Please enter a valid ${platform} URL`;
    }
  };

  const handleFieldChange = (field: string, value: string, setter: (v: string) => void) => {
    setter(value);
    setTouched(prev => ({ ...prev, [field]: true }));
    
    let error = "";
    if (field === "email") error = validateEmail(value);
    else if (field === "phone" || field === "whatsapp") error = validatePhone(value);
    else if (field.includes("Url") || field.includes("url")) error = validateUrl(value, field.replace("Url", "").replace("url", ""));
    
    setErrors(prev => ({ ...prev, [field]: error }));
  };

  const handleFieldBlur = (field: string, value: string, updateKey: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    
    let error = "";
    if (field === "email") error = validateEmail(value);
    else if (field === "phone" || field === "whatsapp") error = validatePhone(value);
    else if (field.includes("Url") || field.includes("url")) error = validateUrl(value, field.replace("Url", "").replace("url", ""));
    
    setErrors(prev => ({ ...prev, [field]: error }));
    
    if (!error) {
      onUpdate({ [updateKey]: value });
    }
  };

  const getInputClassName = (field: string) => {
    const hasError = touched[field] && errors[field];
    return `h-11 text-sm ${hasError ? 'border-red-500 focus:border-red-500 focus:ring-red-100' : ''}`;
  };
  
  // Avatar upload
  const { uploadFile, isUploading } = useUpload({
    onSuccess: (response) => {
      onUpdate({ avatar: response.objectPath });
      setIsPhotoDialogOpen(false);
      toast({ title: "Avatar Updated" });
    },
    onError: (error) => {
      toast({ title: "Upload Failed", description: error.message, variant: "destructive" });
    },
  });
  
  // Cover photo upload
  const { uploadFile: uploadCover, isUploading: isUploadingCover } = useUpload({
    onSuccess: (response) => {
      onUpdate({ coverPhoto: response.objectPath });
      toast({ title: "Cover Photo Updated" });
    },
    onError: (error) => {
      toast({ title: "Upload Failed", description: error.message, variant: "destructive" });
    },
  });

  useEffect(() => {
    setLocalName(profile.name);
    setLocalPhone(profile.phone);
    setLocalReraId(profile.reraId || "");
    setLocalBio(profile.bio);
    setLocalInstagram(profile.instagramUrl || "");
    setLocalLinkedin(profile.linkedinUrl || "");
    setLocalTiktok(profile.tiktokUrl || "");
    setLocalYoutube(profile.youtubeUrl || "");
    setLocalTwitter(profile.twitterUrl || "");
    setLocalFacebook(profile.facebookUrl || "");
    setLocalEmail(profile.email || "");
    setLocalWhatsapp(profile.whatsappNumber || "");
    setVerticalPosition([profile.avatarPosition ?? 50]);
  }, [profile]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) await uploadFile(file);
  };
  
  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) await uploadCover(file);
  };

  const defaultCoverPhoto = "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1200&q=80";

  return (
    <Card className="bg-white border-gray-100 shadow-sm overflow-hidden rounded-2xl">
      {/* Cover Photo Section */}
      <div className="relative h-36 bg-gray-100 group">
        <img 
          src={profile.coverPhoto || defaultCoverPhoto} 
          alt="Cover" 
          className="w-full h-full object-cover"
          loading="lazy"
          decoding="async"
        />
        <div 
          className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
          onClick={() => coverInputRef.current?.click()}
        >
          <span className="text-white text-sm font-medium flex items-center gap-2">
            {isUploadingCover ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImageIcon className="w-4 h-4" />}
            {isUploadingCover ? 'Uploading...' : 'Change Cover Photo'}
          </span>
        </div>
        <input 
          ref={coverInputRef}
          type="file" 
          accept="image/*" 
          className="hidden" 
          onChange={handleCoverUpload}
        />
      </div>
      
      <CardContent className="p-5 space-y-5">
        {/* Avatar and Name Section */}
        <div className="flex items-center gap-4 -mt-14 relative z-10">
          <div 
            className="relative group cursor-pointer w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-lg shrink-0 bg-white"
            onClick={() => setIsPhotoDialogOpen(true)}
          >
            <img src={profile.avatar} className="w-full h-full object-cover" style={{ objectPosition: `center ${profile.avatarPosition ?? 50}%` }} loading="lazy" decoding="async" />
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="text-white text-xs font-medium">Change</span>
            </div>
          </div>
          <div className="flex-1 pt-8">
            <div className="space-y-2">
              <Label className="text-xs font-medium text-gray-500 uppercase">Full Name</Label>
              <Input 
                value={localName}
                onChange={(e) => setLocalName(e.target.value)}
                onBlur={(e) => onUpdate({ name: e.target.value })}
                placeholder="Your full name"
                className="h-11 text-sm"
              />
            </div>
          </div>
        </div>
        
        {/* Contact Details - Stacked for mobile */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label className="text-xs font-medium text-gray-500 uppercase">Phone Number</Label>
            <Input 
              value={localPhone}
              onChange={(e) => handleFieldChange("phone", e.target.value, setLocalPhone)}
              onBlur={() => handleFieldBlur("phone", localPhone, "phone")}
              placeholder="+971 50 123 4567"
              className={getInputClassName("phone")}
            />
            {touched.phone && errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
          </div>
          <div className="space-y-1">
            <Label className="text-xs font-medium text-gray-500 uppercase">WhatsApp Number</Label>
            <Input 
              value={localWhatsapp}
              onChange={(e) => handleFieldChange("whatsapp", e.target.value, setLocalWhatsapp)}
              onBlur={() => handleFieldBlur("whatsapp", localWhatsapp, "whatsappNumber")}
              placeholder="+971 50 123 4567"
              className={getInputClassName("whatsapp")}
            />
            {touched.whatsapp && errors.whatsapp && <p className="text-xs text-red-500 mt-1">{errors.whatsapp}</p>}
          </div>
          <div className="space-y-1">
            <Label className="text-xs font-medium text-gray-500 uppercase">Email Address</Label>
            <Input 
              type="email"
              value={localEmail}
              onChange={(e) => handleFieldChange("email", e.target.value, setLocalEmail)}
              onBlur={() => handleFieldBlur("email", localEmail, "email")}
              placeholder="agent@email.com"
              className={getInputClassName("email")}
            />
            {touched.email && errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
          </div>
          <div className="space-y-1">
            <Label className="text-xs font-medium text-gray-500 uppercase">RERA ID</Label>
            <Input 
              value={localReraId}
              onChange={(e) => setLocalReraId(e.target.value)}
              onBlur={(e) => onUpdate({ reraId: e.target.value })}
              placeholder="e.g. 12345"
              className="h-11 text-sm"
            />
          </div>
        </div>
        
        {/* Social Media Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label className="text-xs font-medium text-gray-500 uppercase">Instagram URL</Label>
            <Input 
              value={localInstagram}
              onChange={(e) => handleFieldChange("instagramUrl", e.target.value, setLocalInstagram)}
              onBlur={() => handleFieldBlur("instagramUrl", localInstagram, "instagramUrl")}
              placeholder="https://instagram.com/username"
              className={getInputClassName("instagramUrl")}
            />
            {touched.instagramUrl && errors.instagramUrl && <p className="text-xs text-red-500 mt-1">{errors.instagramUrl}</p>}
          </div>
          <div className="space-y-1">
            <Label className="text-xs font-medium text-gray-500 uppercase">LinkedIn URL</Label>
            <Input 
              value={localLinkedin}
              onChange={(e) => handleFieldChange("linkedinUrl", e.target.value, setLocalLinkedin)}
              onBlur={() => handleFieldBlur("linkedinUrl", localLinkedin, "linkedinUrl")}
              placeholder="https://linkedin.com/in/username"
              className={getInputClassName("linkedinUrl")}
            />
            {touched.linkedinUrl && errors.linkedinUrl && <p className="text-xs text-red-500 mt-1">{errors.linkedinUrl}</p>}
          </div>
          <div className="space-y-1">
            <Label className="text-xs font-medium text-gray-500 uppercase">TikTok URL</Label>
            <Input 
              value={localTiktok}
              onChange={(e) => handleFieldChange("tiktokUrl", e.target.value, setLocalTiktok)}
              onBlur={() => handleFieldBlur("tiktokUrl", localTiktok, "tiktokUrl")}
              placeholder="https://tiktok.com/@username"
              className={getInputClassName("tiktokUrl")}
            />
            {touched.tiktokUrl && errors.tiktokUrl && <p className="text-xs text-red-500 mt-1">{errors.tiktokUrl}</p>}
          </div>
          <div className="space-y-1">
            <Label className="text-xs font-medium text-gray-500 uppercase">YouTube URL</Label>
            <Input 
              value={localYoutube}
              onChange={(e) => handleFieldChange("youtubeUrl", e.target.value, setLocalYoutube)}
              onBlur={() => handleFieldBlur("youtubeUrl", localYoutube, "youtubeUrl")}
              placeholder="https://youtube.com/@channel"
              className={getInputClassName("youtubeUrl")}
            />
            {touched.youtubeUrl && errors.youtubeUrl && <p className="text-xs text-red-500 mt-1">{errors.youtubeUrl}</p>}
          </div>
          <div className="space-y-1">
            <Label className="text-xs font-medium text-gray-500 uppercase">Twitter/X URL</Label>
            <Input 
              value={localTwitter}
              onChange={(e) => handleFieldChange("twitterUrl", e.target.value, setLocalTwitter)}
              onBlur={() => handleFieldBlur("twitterUrl", localTwitter, "twitterUrl")}
              placeholder="https://x.com/username"
              className={getInputClassName("twitterUrl")}
            />
            {touched.twitterUrl && errors.twitterUrl && <p className="text-xs text-red-500 mt-1">{errors.twitterUrl}</p>}
          </div>
          <div className="space-y-1">
            <Label className="text-xs font-medium text-gray-500 uppercase">Facebook URL</Label>
            <Input 
              value={localFacebook}
              onChange={(e) => handleFieldChange("facebookUrl", e.target.value, setLocalFacebook)}
              onBlur={() => handleFieldBlur("facebookUrl", localFacebook, "facebookUrl")}
              placeholder="https://facebook.com/username"
              className={getInputClassName("facebookUrl")}
            />
            {touched.facebookUrl && errors.facebookUrl && <p className="text-xs text-red-500 mt-1">{errors.facebookUrl}</p>}
          </div>
        </div>

        <Dialog open={isPhotoDialogOpen} onOpenChange={setIsPhotoDialogOpen}>
          <DialogContent className="max-w-sm sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-lg">Edit Photo</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col items-center gap-6 py-4">
              <div className="w-48 h-48 rounded-full overflow-hidden border-4 border-gray-100 bg-gray-50">
                <img 
                  src={profile.avatar} 
                  className="w-full h-full object-cover transition-transform" 
                  style={{ 
                    transform: `scale(${zoom[0] / 100})`,
                    objectPosition: `center ${verticalPosition[0]}%`
                  }}
                  loading="lazy"
                  decoding="async"
                />
              </div>
              <div className="w-full max-w-[240px] space-y-4">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <ChevronUp className="w-4 h-4" />
                  <span>Position Face</span>
                  <ChevronDown className="w-4 h-4" />
                </div>
                <Slider 
                  defaultValue={[50]} 
                  max={100} 
                  min={0} 
                  step={1} 
                  value={verticalPosition}
                  onValueChange={(val) => {
                    setVerticalPosition(val);
                    onUpdate({ avatarPosition: val[0] });
                  }}
                  data-testid="slider-avatar-position"
                />
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <ZoomIn className="w-4 h-4" />
                  <span>Zoom</span>
                </div>
                <Slider 
                  defaultValue={[100]} 
                  max={200} 
                  min={100} 
                  step={1} 
                  value={zoom}
                  onValueChange={setZoom}
                />
                <Button 
                  variant="outline" 
                  className="w-full h-11 text-sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                >
                  <Crop className="w-4 h-4 mr-2" />
                  {isUploading ? "Uploading..." : "Change Image"}
                </Button>
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleAvatarUpload} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setIsPhotoDialogOpen(false)} className="h-10 text-sm">
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Bio Section */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-medium text-gray-500 uppercase">Bio</Label>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 text-xs text-[#FF5A5F] hover:bg-[#FF5A5F]/10 px-3"
              onClick={() => onAiWrite("bio", localBio, (val: string) => {
                setLocalBio(val);
                onUpdate({ bio: val });
              })}
            >
              <Sparkles className="w-3.5 h-3.5 mr-1" /> AI Enhance
            </Button>
          </div>
          <Textarea 
            value={localBio}
            onChange={(e) => setLocalBio(e.target.value)}
            onBlur={(e) => onUpdate({ bio: e.target.value })}
            placeholder="Write a brief bio about yourself..."
            className="h-28 text-sm resize-none"
          />
        </div>
      </CardContent>
    </Card>
  );
}
