import { useState } from "react";
import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Phone, MapPin, BedDouble, Bath, Ruler, Home, Check, X, ChevronLeft, ChevronRight, Share2, AlertCircle, Building2, Building, Castle, Warehouse, Briefcase, Clock, Instagram, Linkedin, Mail, Sun, Moon, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import type { Profile, Property } from "@shared/schema";

// Format price with commas
const formatPrice = (price: string | undefined) => {
  if (!price) return "";
  const num = String(price).replace(/[^0-9]/g, '');
  return num.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

// Get property type icon based on type
const getPropertyTypeIcon = (propertyType: string, iconClass: string = "w-3 h-3") => {
  switch (propertyType?.toLowerCase()) {
    case 'apartment':
      return <Building2 className={iconClass} />;
    case 'villa':
      return <Home className={iconClass} />;
    case 'townhouse':
      return <Castle className={iconClass} />;
    case 'penthouse':
      return <Building className={iconClass} />;
    case 'studio':
      return <Warehouse className={iconClass} />;
    case 'office':
      return <Briefcase className={iconClass} />;
    default:
      return <Home className={iconClass} />;
  }
};

interface PublicProfileProps {
  profileData?: Profile;
  propertiesData?: Property[];
  isEmbedded?: boolean;
}

export default function PublicProfile({ profileData, propertiesData, isEmbedded = false }: PublicProfileProps) {
  const { slug } = useParams();
  const { toast } = useToast();
  const [showBookCallModal, setShowBookCallModal] = useState(false);
  const [showRequestFormModal, setShowRequestFormModal] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  
  // Check if embedded via query parameter
  const urlParams = new URLSearchParams(window.location.search);
  const isEmbeddedViaUrl = urlParams.get('embed') === '1';
  const isActuallyEmbedded = isEmbedded || isEmbeddedViaUrl;

  const toggleDarkMode = () => {
    setIsDarkMode(prev => !prev);
  };

  // Fetch profile data (only if not passed as props)
  const { data: fetchedProfile, isLoading: isLoadingProfile, error: profileError } = useQuery<Profile>({
    queryKey: ["/api/profile", slug],
    enabled: !profileData && !!slug,
  });

  // Fetch properties data (only if not passed as props)
  const { data: fetchedProperties = [], isLoading: isLoadingProperties } = useQuery<Property[]>({
    queryKey: ["/api/properties", slug],
    enabled: !propertiesData && !!slug && !!(profileData || fetchedProfile),
  });

  // Use props data if available, otherwise use fetched data
  const profile = profileData || fetchedProfile;
  const properties = propertiesData || fetchedProperties;

  const handleWhatsAppClick = (property: Property) => {
    const whatsappNum = (profile as any)?.whatsappNumber || profile?.phoneNumber;
    if (!whatsappNum) return;
    
    const isRent = (property as any).type === 'rent' || property.title?.toLowerCase().includes('rent');
    const typeText = isRent ? 'for rent' : 'for sale';
    const bedroomText = property.bedrooms ? `${property.bedrooms}-bedroom` : '';
    const propertyTypeText = property.propertyType || 'property';
    const priceText = formatPrice(property.price) || 'enquiry';
    const locationText = property.location || 'Dubai';

    const typeLabel = bedroomText ? `${bedroomText} ${propertyTypeText}` : propertyTypeText;
    const message = `Hi ${profile?.fullName}, I'm interested in this property:\n\n• Type: ${typeLabel}\n• Status: ${typeText}\n• Location: ${locationText}\n• Price: ${priceText} AED\n\nPlease share more details.`;
    
    // Construct WhatsApp URL - sanitize number to digits only
    const url = `https://wa.me/${whatsappNum.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  const handleStickyWhatsAppClick = () => {
    const whatsappNum = (profile as any)?.whatsappNumber || profile?.phoneNumber;
    if (!whatsappNum) return;
    
    const message = `Hi ${profile?.fullName}, I found your Linknow page and would like to enquire about your available properties.`;
    const url = `https://wa.me/${whatsappNum.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({ title: "Link Copied", description: "Profile link copied to clipboard." });
  };

  // Show loading state (only when fetching, not when data is passed as props)
  if (!profileData && isLoadingProfile) {
    return <ProfileLoadingSkeleton />;
  }

  // Show 404 if profile not found (only when not embedded)
  if (!isActuallyEmbedded && (profileError || !profile)) {
    return <ProfileNotFound />;
  }
  
  // Show loading placeholder when embedded and no profile data yet
  if (!profile) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-pulse text-gray-400">Loading preview...</div>
      </div>
    );
  }

  // Default cover photo if none uploaded
  const defaultCoverPhoto = "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1200&q=80"; // Dubai skyline
  const coverPhoto = profile.coverPhotoUrl || defaultCoverPhoto;

  return (
    <div 
      className="min-h-screen font-nunito selection:bg-primary/10 selection:text-primary pb-24 md:pb-12 transition-colors duration-300"
      style={{ backgroundColor: isDarkMode ? '#000000' : '#ffffff' }}
    >
      
      {/* Dark Mode & Share Buttons - Top Right Corner (hide when embedded) */}
      {!isActuallyEmbedded && (
        <div className="fixed top-4 right-4 z-30 flex gap-2">
          <button 
            className={`w-10 h-10 rounded-full shadow-lg flex items-center justify-center transition-colors ${isDarkMode ? 'bg-[#1c1c1e] hover:bg-[#2c2c2e] border border-[#38383a]' : 'bg-white/90 backdrop-blur-md hover:bg-gray-100'}`}
            onClick={toggleDarkMode} 
            data-testid="button-toggle-theme"
          >
            {isDarkMode ? (
              <Sun className="w-5 h-5 text-yellow-400" />
            ) : (
              <Moon className="w-5 h-5 text-gray-700" />
            )}
          </button>
          <button 
            className={`w-10 h-10 rounded-full shadow-lg flex items-center justify-center transition-colors ${isDarkMode ? 'bg-[#1c1c1e] hover:bg-[#2c2c2e] border border-[#38383a]' : 'bg-white/90 backdrop-blur-md hover:bg-gray-100'}`}
            onClick={handleShare} 
            data-testid="button-share"
          >
            <Share2 className={`w-5 h-5 ${isDarkMode ? 'text-white' : 'text-gray-700'}`} />
          </button>
        </div>
      )}

      {/* Header with Cover Photo */}
      <div className="relative">
        {/* Cover Photo */}
        <div className="h-40 md:h-52 w-full overflow-hidden">
          <img 
            src={coverPhoto} 
            alt="Cover" 
            className="w-full h-full object-cover"
            data-testid="img-cover-photo"
          />
          <div className={`absolute inset-0 bg-gradient-to-b from-black/10 via-transparent ${isDarkMode ? 'to-black' : 'to-white'}`} />
        </div>
        
        {/* Profile Section - Large centered avatar */}
        <div className="relative -mt-16 md:-mt-20 pb-4 px-4 text-center">
          {/* Profile Picture - Large */}
          <div 
            className={`w-40 h-40 md:w-48 md:h-48 mx-auto rounded-full p-1 border-4 relative z-10 ${isDarkMode ? '' : 'shadow-xl'}`}
            style={{ 
              backgroundColor: isDarkMode ? '#000000' : '#ffffff',
              borderColor: isDarkMode ? '#000000' : '#ffffff'
            }}
          >
            <img 
              src={profile.avatarUrl || "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=256&q=80"} 
              alt={profile.fullName} 
              className="w-full h-full rounded-full object-cover" 
              style={{ objectPosition: `center ${(profile as any).avatarPosition ?? 50}%` }}
              loading="eager"
              decoding="async"
              fetchPriority="high"
              data-testid="img-avatar"
            />
          </div>
          
          {/* Name */}
          <h1 
            className="font-bold text-xl md:text-2xl mt-3 tracking-tight" 
            style={{ color: isDarkMode ? '#ffffff' : '#222222' }}
            data-testid="text-profile-name"
          >
            {profile.fullName}
          </h1>
          
          {/* Bio - Max 2 lines */}
          {profile.bio && (
            <p 
              className="text-sm max-w-[300px] mx-auto mt-2 line-clamp-2" 
              style={{ color: isDarkMode ? '#9ca3af' : '#717171' }}
              data-testid="text-profile-bio"
            >
              {profile.bio}
            </p>
          )}
          
          {/* Info Row - Location, RERA, Verified */}
          <div 
            className="flex items-center justify-center gap-2 mt-3 text-xs flex-wrap"
            style={{ color: isDarkMode ? '#9ca3af' : '#717171' }}
          >
            {profile.location && (
              <>
                <span className="flex items-center gap-1" data-testid="text-location">
                  <MapPin className="w-3 h-3" /> {profile.location}
                </span>
                <span className="text-gray-300">•</span>
              </>
            )}
            {profile.reraId && (
              <>
                <span data-testid="text-rera-id">RERA: {profile.reraId}</span>
                <span className="text-gray-300">•</span>
              </>
            )}
            <span className="flex items-center gap-1 text-green-600" data-testid="badge-verified">
              <Check className="w-3 h-3" /> Verified
            </span>
          </div>
        </div>
      </div>
      
      {/* Divider */}
      <div className="border-t mx-4 mb-4" style={{ borderColor: isDarkMode ? '#38383a' : '#f3f4f6' }} />

      <div className="md:max-w-5xl md:mx-auto md:px-8">
        <div className="pb-8">

          {/* Properties List - Horizontal Scroll */}
          <div className="space-y-4">
            <h2 
              className="text-sm font-semibold text-center px-4"
              style={{ color: isDarkMode ? '#ffffff' : '#222222' }}
            >Available Right Now</h2>
            
            {isLoadingProperties ? (
              <div className="flex gap-4 overflow-x-auto px-4 pb-4 snap-x snap-mandatory scrollbar-hide">
                {[1, 2, 3].map((i) => <PropertyCardSkeleton key={i} />)}
              </div>
            ) : properties.length === 0 ? (
              <div className={`text-center py-12 px-4 ${isDarkMode ? 'text-gray-400' : 'text-muted-foreground'}`} data-testid="text-no-properties">
                No properties listed yet
              </div>
            ) : (
              <div className="flex gap-4 overflow-x-auto px-4 pb-4 snap-x snap-mandatory scrollbar-hide">
                {properties.map((property) => (
                  <PropertyCard key={property.id} property={property} onWhatsApp={() => handleWhatsAppClick(property)} isDarkMode={isDarkMode} />
                ))}
              </div>
            )}

          </div>

          {/* Action Buttons Section */}
          <ActionButtonsSection profile={profile} onBookCall={() => setShowBookCallModal(true)} onRequestForm={() => setShowRequestFormModal(true)} isDarkMode={isDarkMode} />

          {/* Book a Call Modal */}
          <BookCallModal 
            profile={profile} 
            isOpen={showBookCallModal} 
            onClose={() => setShowBookCallModal(false)} 
          />

          {/* Request Form Modal */}
          <RequestFormModal 
            profile={profile}
            isOpen={showRequestFormModal}
            onClose={() => setShowRequestFormModal(false)}
          />

        </div>
      </div>
      
      {/* Branding Footer */}
      <div className="py-8 text-center opacity-50 hover:opacity-100 transition-opacity">
        <a href="/" className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700">
          Powered by <span className="font-semibold">Linknow</span>
        </a>
      </div>

          </div>
  );
}

function PropertyCard({ property, onWhatsApp, isDarkMode = false }: { property: Property, onWhatsApp: () => void, isDarkMode?: boolean }) {
  const [showGallery, setShowGallery] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const fixImageUrl = (url: string | undefined | null) => {
    if (!url) return null;
    if (url.includes('/api/uploads/')) return url.replace('/api/uploads/', '');
    return url;
  };
  
  const dbImages = (property as any).images as string[] | null;
  let images: string[] = [];
  if (dbImages && dbImages.length > 0) {
    images = dbImages.map(img => fixImageUrl(img)).filter(Boolean) as string[];
  } else if (property.imageUrl) {
    const fixedImg = fixImageUrl(property.imageUrl);
    if (fixedImg) images = [fixedImg];
  }
  const isRent = (property as any).type === 'rent' || property.title?.toLowerCase().includes('rent');
  const propertyTypeName = property.propertyType ? property.propertyType.charAt(0).toUpperCase() + property.propertyType.slice(1) : 'Residential';

  const handlePrevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex(i => Math.max(0, i - 1));
  };

  const handleNextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex(i => Math.min(images.length - 1, i + 1));
  };

  return (
    <div className="flex-shrink-0 snap-start">
      <div 
        className="w-[300px] md:w-[340px] rounded-2xl overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.08)] transition-all hover:shadow-xl duration-300 border"
        style={{ 
          backgroundColor: isDarkMode ? '#1c1c1e' : '#ffffff',
          borderColor: isDarkMode ? '#38383a' : '#f3f4f6'
        }}
        data-testid={`card-property-${property.id}`}
      >
        {/* Image Area with Carousel */}
        <div className="aspect-[4/3] bg-gray-100 relative">
          {images.length > 0 ? (
            <img 
              src={images[currentImageIndex]} 
              className="w-full h-full object-cover cursor-pointer" 
              alt={property.title || "Property"}
              onClick={() => setShowGallery(true)}
              loading="lazy"
              decoding="async"
              data-testid={`img-property-${property.id}`}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
              <Home className="w-12 h-12 text-gray-300" />
            </div>
          )}
          
          {/* Rent/Sale Badge */}
          <Badge 
            className={`absolute top-3 left-3 h-7 px-3 text-xs font-bold uppercase tracking-wide border-none shadow-md ${
              isRent ? 'bg-blue-500 text-white' : 'bg-emerald-500 text-white'
            }`}
            data-testid={`badge-type-${property.id}`}
          >
            {isRent ? 'For Rent' : 'For Sale'}
          </Badge>
          
          {/* Property Type Badge */}
          <Badge 
            className="absolute top-3 right-3 h-7 px-3 text-xs font-semibold border-none shadow-md bg-white/90 text-gray-700 backdrop-blur-sm flex items-center gap-1.5"
            data-testid={`badge-property-type-${property.id}`}
          >
            {getPropertyTypeIcon(property.propertyType || '', "w-3.5 h-3.5")}
            {propertyTypeName}
          </Badge>
          
          {/* Carousel Arrows */}
          {images.length > 1 && (
            <>
              <button 
                className={`absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 shadow-lg flex items-center justify-center transition-all hover:bg-white ${currentImageIndex === 0 ? 'opacity-40 cursor-not-allowed' : 'hover:scale-105'}`}
                onClick={handlePrevImage}
                disabled={currentImageIndex === 0}
              >
                <ChevronLeft className="w-5 h-5 text-gray-700" />
              </button>
              <button 
                className={`absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 shadow-lg flex items-center justify-center transition-all hover:bg-white ${currentImageIndex === images.length - 1 ? 'opacity-40 cursor-not-allowed' : 'hover:scale-105'}`}
                onClick={handleNextImage}
                disabled={currentImageIndex === images.length - 1}
              >
                <ChevronRight className="w-5 h-5 text-gray-700" />
              </button>
            </>
          )}
          
          {/* Image Dots */}
          {images.length > 1 && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
              {images.slice(0, 5).map((_, i) => (
                <div key={i} className={`w-1.5 h-1.5 rounded-full transition-all ${i === currentImageIndex ? 'bg-white w-3' : 'bg-white/50'}`} />
              ))}
              {images.length > 5 && <div className="w-1.5 h-1.5 rounded-full bg-white/50" />}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Price */}
          <div 
            className="font-bold text-xl" 
            style={{ color: isDarkMode ? '#ffffff' : '#222222' }}
            data-testid={`text-price-${property.id}`}
          >
            {property.price ? `AED ${formatPrice(property.price)}` : 'Price on Request'}
          </div>
          
          {/* Description */}
          <p 
            className="text-sm line-clamp-1 mt-1" 
            style={{ color: isDarkMode ? '#9ca3af' : '#6b7280' }}
            data-testid={`text-description-${property.id}`}
          >
            {property.description || property.title || propertyTypeName}
          </p>
          
          {/* Amenities Row */}
          <div 
            className="flex items-center gap-4 text-sm mt-3"
            style={{ color: isDarkMode ? '#9ca3af' : '#4b5563' }}
          >
            {property.bedrooms && (
              <span className="flex items-center gap-1.5">
                <BedDouble className="w-4 h-4" />
                {property.bedrooms} Bed
              </span>
            )}
            {property.bathrooms && (
              <span className="flex items-center gap-1.5">
                <Bath className="w-4 h-4" />
                {property.bathrooms} Bath
              </span>
            )}
            {property.area && (
              <span className="flex items-center gap-1.5">
                <Ruler className="w-4 h-4" />
                {property.area} sq.ft
              </span>
            )}
          </div>
          
          {/* Location */}
          {property.location && (
            <div 
              className="flex items-center gap-1.5 text-sm mt-2"
              style={{ color: isDarkMode ? '#9ca3af' : '#6b7280' }}
            >
              <MapPin className="w-4 h-4" />
              <span className="truncate" data-testid={`text-location-${property.id}`}>{property.location}</span>
            </div>
          )}
          
          {/* WhatsApp Button - Apple Style */}
          <div 
            className="mt-4 pt-3 border-t"
            style={{ borderColor: isDarkMode ? '#38383a' : '#f3f4f6' }}
          >
            <button 
              className="w-full py-2.5 rounded-xl border-2 active:scale-[0.98] transition-all flex items-center justify-center gap-2 font-medium text-sm group hover:border-[#25D366] hover:bg-[#25D366]/10"
              style={{
                background: isDarkMode ? '#1c1c1e' : '#ffffff',
                borderColor: isDarkMode ? '#38383a' : '#e5e7eb',
                color: isDarkMode ? '#ffffff' : '#1d1d1f'
              }}
              onClick={() => onWhatsApp()}
              data-testid={`button-whatsapp-${property.id}`}
            >
              <svg className="w-4 h-4 text-[#25D366]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              <span>Chat on WhatsApp</span>
            </button>
          </div>
        </div>
      </div>
      
      {/* Gallery Overlay */}
      {showGallery && images.length > 0 && (
        <GalleryOverlay 
          images={images} 
          currentIndex={currentImageIndex} 
          onIndexChange={setCurrentImageIndex}
          onClose={() => setShowGallery(false)} 
        />
      )}
    </div>
  );
}

function GalleryOverlay({ images, currentIndex, onIndexChange, onClose }: { 
  images: string[]; 
  currentIndex: number; 
  onIndexChange: (index: number) => void;
  onClose: () => void;
}) {
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  
  const minSwipeDistance = 50;
  
  const goToNext = () => {
    onIndexChange(currentIndex === images.length - 1 ? 0 : currentIndex + 1);
  };
  
  const goToPrev = () => {
    onIndexChange(currentIndex === 0 ? images.length - 1 : currentIndex - 1);
  };
  
  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };
  
  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };
  
  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    
    if (isLeftSwipe) goToNext();
    if (isRightSwipe) goToPrev();
  };
  
  return (
    <div 
      className="fixed inset-0 z-50 bg-black flex flex-col"
      onClick={onClose}
      data-testid="gallery-overlay"
    >
      {/* Top bar - counter only on desktop, close button on mobile moves to bottom */}
      <div className="hidden md:flex items-center justify-between px-4 py-3" onClick={(e) => e.stopPropagation()}>
        <span className="text-white/60 text-sm font-medium">
          {currentIndex + 1} of {images.length}
        </span>
        <button 
          className="p-2 -mr-2 rounded-full hover:bg-white/10 transition-colors"
          onClick={onClose}
          data-testid="button-gallery-close-desktop"
        >
          <X className="w-6 h-6 text-white" />
        </button>
      </div>
      
      {/* Image container with touch support */}
      <div 
        className="flex-1 flex items-center justify-center px-4 py-6 overflow-hidden select-none"
        style={{ touchAction: 'pan-y pinch-zoom' }}
        onClick={(e) => e.stopPropagation()}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <div className="relative w-full max-w-2xl mx-auto">
          <img 
            src={images[currentIndex]} 
            className="w-full h-auto max-h-[60vh] object-contain rounded-xl pointer-events-none" 
            alt="" 
            draggable={false}
            data-testid="img-gallery-current"
          />
          
          {/* Desktop navigation arrows */}
          {images.length > 1 && (
            <>
              <button 
                className="hidden md:flex absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 hover:bg-black/70 rounded-full items-center justify-center transition-colors"
                onClick={goToPrev}
                data-testid="button-gallery-prev"
              >
                <ChevronLeft className="w-6 h-6 text-white" />
              </button>
              <button 
                className="hidden md:flex absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 hover:bg-black/70 rounded-full items-center justify-center transition-colors"
                onClick={goToNext}
                data-testid="button-gallery-next"
              >
                <ChevronRight className="w-6 h-6 text-white" />
              </button>
            </>
          )}
        </div>
      </div>
      
      {/* Bottom section with dots and close button */}
      <div className="pb-6 pt-2" onClick={(e) => e.stopPropagation()}>
        {/* Dot indicators */}
        {images.length > 1 && (
          <div className="flex justify-center gap-2 mb-4">
            {images.map((_, i) => (
              <button 
                key={i}
                className={`w-2 h-2 rounded-full transition-all ${i === currentIndex ? 'bg-white w-6' : 'bg-white/40 hover:bg-white/60'}`}
                onClick={() => onIndexChange(i)}
                data-testid={`button-gallery-dot-${i}`}
              />
            ))}
          </div>
        )}
        
        {/* Mobile close button - centered at bottom for easy thumb reach */}
        <div className="md:hidden flex justify-center">
          <button 
            className="px-6 py-2.5 bg-white/10 hover:bg-white/20 rounded-full text-white text-sm font-medium transition-colors flex items-center gap-2"
            onClick={onClose}
            data-testid="button-gallery-close-mobile"
          >
            <X className="w-4 h-4" />
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

function SocialIconsRow({ profile, isDarkMode = false }: { profile: Profile; isDarkMode?: boolean }) {
  const socialLinks = [
    { url: (profile as any).instagramUrl, icon: "instagram", label: "Instagram" },
    { url: (profile as any).linkedinUrl, icon: "linkedin", label: "LinkedIn" },
    { url: (profile as any).tiktokUrl, icon: "tiktok", label: "TikTok" },
    { url: (profile as any).youtubeUrl, icon: "youtube", label: "YouTube" },
    { url: (profile as any).twitterUrl, icon: "twitter", label: "Twitter" },
    { url: (profile as any).facebookUrl, icon: "facebook", label: "Facebook" },
  ].filter(link => link.url && link.url.trim() !== "");

  if (socialLinks.length === 0) return null;

  const iconColor = isDarkMode ? "text-gray-400 hover:text-white" : "text-gray-500 hover:text-gray-800";
  const bgColor = isDarkMode ? "hover:bg-white/10" : "hover:bg-gray-100";

  const renderIcon = (icon: string) => {
    switch (icon) {
      case "instagram":
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
          </svg>
        );
      case "linkedin":
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
          </svg>
        );
      case "tiktok":
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
          </svg>
        );
      case "youtube":
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
          </svg>
        );
      case "twitter":
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
          </svg>
        );
      case "facebook":
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex items-center justify-center gap-4 pt-2">
      {socialLinks.map((link) => (
        <a
          key={link.icon}
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${iconColor} ${bgColor}`}
          aria-label={link.label}
          data-testid={`link-social-${link.icon}`}
        >
          {renderIcon(link.icon)}
        </a>
      ))}
    </div>
  );
}

function ActionButtonsSection({ profile, onBookCall, onRequestForm, isDarkMode = false }: { profile: Profile; onBookCall: () => void; onRequestForm: () => void; isDarkMode?: boolean }) {
  const handleWhatsApp = () => {
    const whatsappNum = (profile as any).whatsappNumber || profile.phoneNumber;
    if (whatsappNum) {
      const message = `Hi ${profile.fullName}, I'd like to connect with you about your properties.`;
      window.open(`https://wa.me/${whatsappNum.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`, '_blank');
    }
  };

  const handleEmail = () => {
    const email = (profile as any).email;
    const subject = `Property Inquiry - ${profile.fullName}`;
    const body = `Hi ${profile.fullName},\n\nI found your profile on Linknow and would like to enquire about your properties.\n\nPlease get back to me at your earliest convenience.\n\nThank you`;
    window.location.href = `mailto:${email || ''}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  const cardBaseStyle = isDarkMode 
    ? "bg-[#1c1c1e] border-[#38383a] hover:border-[#48484a]" 
    : "bg-white border-gray-200 hover:border-gray-400";
  
  const textPrimaryStyle = isDarkMode ? "text-white" : "text-[#1d1d1f]";
  const textSecondaryStyle = isDarkMode ? "text-white/70" : "text-[#6e6e73]";

  return (
    <div className="px-4 py-6 mt-24">
      <h3 className={`text-base font-semibold mb-4 ${textPrimaryStyle}`}>
        <span className="font-bold">Contact.</span>{" "}
        <span className={textSecondaryStyle}>Choose how you'd like to connect.</span>
      </h3>
      
      <div className="space-y-3">
        {/* WhatsApp Card */}
        <button 
          onClick={handleWhatsApp}
          className={`w-full p-4 rounded-xl border-2 transition-all duration-200 active:scale-[0.98] text-left ${cardBaseStyle}`}
          data-testid="button-whatsapp-quick"
        >
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#25D366]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
              <svg className="w-4 h-4 text-[#25D366]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <div className={`font-semibold text-[15px] ${textPrimaryStyle}`}>WhatsApp</div>
              <div className={`text-[13px] mt-0.5 ${textSecondaryStyle}`}>Chat directly. Instant reply guaranteed.</div>
            </div>
            <ChevronRight className={`w-5 h-5 flex-shrink-0 ${textSecondaryStyle}`} />
          </div>
        </button>

        {/* Email Card */}
        <button 
          onClick={handleEmail}
          className={`w-full p-4 rounded-xl border-2 transition-all duration-200 active:scale-[0.98] text-left ${cardBaseStyle}`}
          data-testid="button-email"
        >
          <div className="flex items-start gap-3">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${isDarkMode ? 'bg-[#2c2c2e]' : 'bg-gray-100'}`}>
              <Mail className={`w-4 h-4 ${isDarkMode ? 'text-white/80' : 'text-gray-600'}`} />
            </div>
            <div className="flex-1 min-w-0">
              <div className={`font-semibold text-[15px] ${textPrimaryStyle}`}>Email</div>
              <div className={`text-[13px] mt-0.5 ${textSecondaryStyle}`}>Send an inquiry. Response within 24 hours.</div>
            </div>
            <ChevronRight className={`w-5 h-5 flex-shrink-0 ${textSecondaryStyle}`} />
          </div>
        </button>

        {/* Request Form Card */}
        <button 
          onClick={onRequestForm}
          className={`w-full p-4 rounded-xl border-2 transition-all duration-200 active:scale-[0.98] text-left ${cardBaseStyle}`}
          data-testid="button-request-form"
        >
          <div className="flex items-start gap-3">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${isDarkMode ? 'bg-[#2c2c2e]' : 'bg-gray-100'}`}>
              <FileText className={`w-4 h-4 ${isDarkMode ? 'text-white/80' : 'text-gray-600'}`} />
            </div>
            <div className="flex-1 min-w-0">
              <div className={`font-semibold text-[15px] ${textPrimaryStyle}`}>Request Form</div>
              <div className={`text-[13px] mt-0.5 ${textSecondaryStyle}`}>Tell us exactly what you're looking for.</div>
            </div>
            <ChevronRight className={`w-5 h-5 flex-shrink-0 ${textSecondaryStyle}`} />
          </div>
        </button>

        {/* Book a Call Card */}
        <button 
          onClick={onBookCall}
          className={`w-full p-4 rounded-xl border-2 transition-all duration-200 active:scale-[0.98] text-left ${cardBaseStyle}`}
          data-testid="button-book-call"
        >
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Clock className="w-4 h-4 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <div className={`font-semibold text-[15px] ${textPrimaryStyle}`}>Book a 30-Min Call</div>
              <div className={`text-[13px] mt-0.5 ${textSecondaryStyle}`}>Speak directly with the agent.</div>
            </div>
            <ChevronRight className={`w-5 h-5 flex-shrink-0 ${textSecondaryStyle}`} />
          </div>
        </button>
        
        <SocialIconsRow profile={profile} isDarkMode={isDarkMode} />
      </div>
    </div>
  );
}


function BookCallModal({ profile, isOpen, onClose }: { profile: Profile; isOpen: boolean; onClose: () => void }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [preferredTime, setPreferredTime] = useState("");

  const timeSlots = ["Morning (9-12)", "Afternoon (12-5)", "Evening (5-8)"];

  const handleSubmit = () => {
    if (!profile.phoneNumber) return;
    
    const parts = [`Name: ${name || 'Not provided'}`];
    if (phone) parts.push(`Phone: ${phone}`);
    if (preferredTime) parts.push(`Preferred time: ${preferredTime}`);
    
    const message = `Hi ${profile.fullName}, I'd like to book a 30-minute consultation call.\n\n${parts.join('\n')}\n\nPlease confirm a suitable time.`;
    
    window.open(`https://wa.me/${profile.phoneNumber}?text=${encodeURIComponent(message)}`, '_blank');
    onClose();
    setName("");
    setPhone("");
    setPreferredTime("");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center" onClick={onClose}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      
      {/* Modal */}
      <div 
        className="relative bg-white w-full max-w-md rounded-t-3xl md:rounded-2xl p-6 pb-8 shadow-2xl animate-in slide-in-from-bottom duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle bar (mobile) */}
        <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mb-6 md:hidden" />
        
        {/* Close button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
        >
          <X className="w-4 h-4 text-gray-600" />
        </button>
        
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-full overflow-hidden mx-auto mb-3 border-2 border-gray-100">
            <img 
              src={profile.avatarUrl || "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=64&q=80"} 
              alt={profile.fullName}
              className="w-full h-full object-cover"
              loading="lazy"
              decoding="async"
            />
          </div>
          <h3 className="text-lg font-bold text-gray-900">Book a Call</h3>
          <p className="text-sm text-gray-500 mt-1">30 minute consultation with {profile.fullName?.split(' ')[0]}</p>
        </div>
        
        {/* Form */}
        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1.5 block">Your Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              className="w-full h-11 px-4 rounded-xl border border-gray-200 focus:border-violet-500 focus:ring-2 focus:ring-violet-100 outline-none transition-all text-sm"
            />
          </div>
          
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1.5 block">Phone Number (optional)</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+971 XX XXX XXXX"
              className="w-full h-11 px-4 rounded-xl border border-gray-200 focus:border-violet-500 focus:ring-2 focus:ring-violet-100 outline-none transition-all text-sm"
            />
          </div>
          
          <div>
            <label className="text-xs font-medium text-gray-600 mb-2 block">Preferred Time</label>
            <div className="flex flex-wrap gap-2">
              {timeSlots.map((slot) => (
                <button
                  key={slot}
                  onClick={() => setPreferredTime(preferredTime === slot ? "" : slot)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    preferredTime === slot 
                      ? 'bg-violet-500 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {slot}
                </button>
              ))}
            </div>
          </div>
        </div>
        
        {/* Submit Button */}
        <button 
          onClick={handleSubmit}
          className="w-full h-12 mt-6 rounded-xl bg-[#FF5A5F] hover:bg-[#e54a4f] active:scale-[0.98] transition-all flex items-center justify-center gap-2 text-white font-semibold text-sm shadow-lg"
        >
          <Check className="w-5 h-5" />
          <span>Confirm Booking</span>
        </button>
      </div>
    </div>
  );
}

function RequestFormModal({ profile, isOpen, onClose }: { profile: Profile; isOpen: boolean; onClose: () => void }) {
  const [propertyType, setPropertyType] = useState<string>("");
  const [transactionType, setTransactionType] = useState<string>("");
  const [budget, setBudget] = useState<string>("");
  const [bedrooms, setBedrooms] = useState<string>("");
  const [location, setLocation] = useState<string>("");
  const [locationSearch, setLocationSearch] = useState<string>("");
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [name, setName] = useState<string>("");

  const propertyTypes = ["Apartment", "Villa", "Townhouse", "Penthouse", "Studio", "Office"];
  const transactionTypes = ["Buy", "Rent"];
  const bedroomOptions = ["Studio", "1", "2", "3", "4", "5+"];
  
  const dubaiLocations = [
    "Abu Hail", "Al Baraha", "Al Barsha", "Al Barsha South", "Al Furjan", "Al Garhoud", 
    "Al Jaddaf", "Al Karama", "Al Khawaneej", "Al Kifaf", "Al Mamzar", "Al Manara", 
    "Al Mankhool", "Al Muraqqabat", "Al Nahda", "Al Qusais", "Al Quoz", "Al Raffa", 
    "Al Rashidiya", "Al Rigga", "Al Safa", "Al Satwa", "Al Sufouh", "Al Twar", 
    "Al Warqa", "Al Wasl", "Arabian Ranches", "Arjan", "Bur Dubai", "Business Bay", 
    "City Walk", "Creek Harbour", "DAMAC Hills", "Deira", "DIFC", "Discovery Gardens", 
    "Downtown Dubai", "Dubai Design District", "Dubai Festival City", "Dubai Healthcare City", 
    "Dubai Hills Estate", "Dubai Industrial City", "Dubai Internet City", "Dubai Investment Park", 
    "Dubai Knowledge Park", "Dubai Land", "Dubai Marina", "Dubai Media City", "Dubai Production City", 
    "Dubai Science Park", "Dubai Silicon Oasis", "Dubai South", "Dubai Sports City", 
    "Dubai Studio City", "Dubai World Central", "Emirates Hills", "Green Community", 
    "International City", "JBR", "Jebel Ali", "Jumeirah", "Jumeirah Beach Residence", 
    "Jumeirah Golf Estates", "Jumeirah Islands", "Jumeirah Lake Towers", "Jumeirah Park", 
    "Jumeirah Village Circle", "Jumeirah Village Triangle", "Majan", "Meydan", "Mirdif", 
    "Mohammed Bin Rashid City", "Motor City", "Mudon", "Nad Al Sheba", "Oud Metha", 
    "Palm Jumeirah", "Port Saeed", "Remraam", "Serena", "Sheikh Zayed Road", 
    "Silicon Oasis", "Springs", "Studio City", "Tecom", "The Gardens", "The Greens", 
    "The Lakes", "The Meadows", "The Villa", "Town Square", "Umm Al Sheif", "Umm Hurair", 
    "Umm Suqeim", "Warsan", "Za'abeel"
  ];

  const filteredLocations = dubaiLocations.filter(loc => 
    loc.toLowerCase().includes(locationSearch.toLowerCase())
  );

  const handleLocationSelect = (loc: string) => {
    setLocation(loc);
    setLocationSearch(loc);
    setShowLocationDropdown(false);
  };

  const handleSubmit = () => {
    const whatsappNum = (profile as any).whatsappNumber || profile.phoneNumber;
    if (!whatsappNum) return;
    
    const parts = [];
    if (name) parts.push(`• Name: ${name}`);
    if (bedrooms) parts.push(`• Bedrooms: ${bedrooms === "Studio" ? "Studio" : bedrooms}`);
    if (transactionType) parts.push(`• Purpose: ${transactionType}`);
    if (propertyType) parts.push(`• Property Type: ${propertyType}`);
    if (location) parts.push(`• Location: ${location}`);
    if (budget) parts.push(`• Budget: ${budget} AED`);
    
    const propertyDetails = parts.length > 0 ? parts.join("\n") : "• Looking for a property";
    const message = `Hi ${profile.fullName}, I'm looking for a property:\n\n${propertyDetails}\n\nPlease help me find something suitable.`;
    
    window.open(`https://wa.me/${whatsappNum.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`, '_blank');
    onClose();
  };

  const PillButton = ({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) => (
    <button
      type="button"
      onClick={onClick}
      className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
        selected 
          ? 'bg-[#FF5A5F] text-white' 
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
      }`}
    >
      {label}
    </button>
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm" 
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full md:max-w-lg bg-white rounded-t-3xl md:rounded-2xl shadow-2xl animate-slide-up max-h-[90vh] overflow-y-auto">
        {/* Handle bar for mobile */}
        <div className="flex justify-center pt-3 pb-1 md:hidden">
          <div className="w-12 h-1 bg-gray-300 rounded-full" />
        </div>
        
        {/* Close button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>
        
        {/* Content */}
        <div className="p-6 pt-4">
          <h2 className="text-xl font-bold text-[#222] mb-1">Request a Property</h2>
          <p className="text-sm text-gray-500 mb-6">Tell me what you're looking for</p>
          
          {/* Your Details */}
          <div className="mb-5">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Your Name</p>
            <input 
              type="text"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF5A5F]/20 focus:border-[#FF5A5F]"
            />
          </div>
          
          {/* Transaction Type */}
          <div className="mb-4">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">I want to</p>
            <div className="flex flex-wrap gap-2">
              {transactionTypes.map((type) => (
                <PillButton 
                  key={type} 
                  label={type} 
                  selected={transactionType === type} 
                  onClick={() => setTransactionType(transactionType === type ? "" : type)} 
                />
              ))}
            </div>
          </div>
          
          {/* Property Type */}
          <div className="mb-4">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Property Type</p>
            <div className="flex flex-wrap gap-2">
              {propertyTypes.map((type) => (
                <PillButton 
                  key={type} 
                  label={type} 
                  selected={propertyType === type} 
                  onClick={() => setPropertyType(propertyType === type ? "" : type)} 
                />
              ))}
            </div>
          </div>
          
          {/* Bedrooms */}
          <div className="mb-4">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Bedrooms</p>
            <div className="flex flex-wrap gap-2">
              {bedroomOptions.map((bed) => (
                <PillButton 
                  key={bed} 
                  label={bed} 
                  selected={bedrooms === bed} 
                  onClick={() => setBedrooms(bedrooms === bed ? "" : bed)} 
                />
              ))}
            </div>
          </div>
          
          {/* Budget */}
          <div className="mb-4">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Budget (AED)</p>
            <input 
              type="text"
              placeholder="e.g., 1,500,000 or 1.5M"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF5A5F]/20 focus:border-[#FF5A5F]"
            />
          </div>
          
          {/* Location */}
          <div className="mb-6 relative">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Preferred Location</p>
            <input 
              type="text"
              placeholder="Search Dubai areas..."
              value={locationSearch}
              onChange={(e) => {
                setLocationSearch(e.target.value);
                setLocation(e.target.value);
                setShowLocationDropdown(true);
              }}
              onFocus={() => setShowLocationDropdown(true)}
              className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF5A5F]/20 focus:border-[#FF5A5F]"
            />
            {showLocationDropdown && locationSearch && filteredLocations.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                {filteredLocations.slice(0, 8).map((loc) => (
                  <button
                    key={loc}
                    type="button"
                    onClick={() => handleLocationSelect(loc)}
                    className="w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50 first:rounded-t-xl last:rounded-b-xl flex items-center gap-2"
                  >
                    <MapPin className="w-3.5 h-3.5 text-gray-400" />
                    {loc}
                  </button>
                ))}
              </div>
            )}
          </div>
          
          {/* Submit Button */}
          <button 
            onClick={handleSubmit}
            className="w-full h-12 rounded-xl bg-[#25D366] hover:bg-[#128C7E] active:scale-[0.98] transition-all flex items-center justify-center gap-2 text-white font-semibold text-sm shadow-md"
            data-testid="button-submit-request"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            <span>Submit Request via WhatsApp</span>
          </button>
        </div>
      </div>
    </div>
  );
}

function ProfileLoadingSkeleton() {
  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-12">
      <div className="md:max-w-7xl md:mx-auto md:p-8">
        <div className="max-w-[480px] mx-auto min-h-screen bg-white shadow-xl relative pb-24 md:min-h-0 md:bg-transparent md:shadow-none md:max-w-none md:grid md:grid-cols-[350px_1fr] md:gap-8 md:items-start md:pb-0">
          
          {/* Profile Skeleton */}
          <div className="bg-white px-6 pb-8 pt-12 text-center rounded-b-[40px] shadow-[0_4px_20px_-12px_rgba(0,0,0,0.1)] mb-8 relative z-10 md:rounded-[32px] md:pt-10 md:pb-10">
            <Skeleton className="w-24 h-24 mx-auto rounded-full mb-4 md:w-32 md:h-32" />
            <Skeleton className="h-8 w-48 mx-auto mb-2" />
            <Skeleton className="h-4 w-64 mx-auto mb-6" />
            <div className="flex justify-center gap-3">
              <Skeleton className="h-6 w-28" />
              <Skeleton className="h-6 w-20" />
            </div>
          </div>

          {/* Properties Skeleton */}
          <div className="px-4 space-y-4 md:px-0">
            <Skeleton className="h-6 w-48 mx-auto md:mx-0 mb-6" />
            <div className="grid grid-cols-2 gap-3 lg:gap-5">
              {[1, 2, 3, 4].map((i) => <PropertyCardSkeleton key={i} />)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PropertyCardSkeleton() {
  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-gray-100">
      <Skeleton className="aspect-[4/3] w-full" />
      <div className="p-2.5 space-y-2">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-7 w-full rounded-md" />
      </div>
    </div>
  );
}

function ProfileNotFound() {
  return (
    <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
          <AlertCircle className="w-8 h-8 text-red-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2" data-testid="text-404-title">Profile Not Found</h1>
        <p className="text-gray-600 mb-6" data-testid="text-404-description">
          The profile you're looking for doesn't exist or has been removed.
        </p>
        <Button asChild>
          <a href="/" data-testid="button-home">Go to Home</a>
        </Button>
      </div>
    </div>
  );
}
