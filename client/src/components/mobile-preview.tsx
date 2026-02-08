import { useState } from "react";
import { Phone, MapPin, BedDouble, Bath, Ruler, Home, X, ChevronLeft, ChevronRight, Building2, Building, Castle, Warehouse, Briefcase } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Property, AgentProfile } from "@/lib/types";

// Format price with commas
const formatPrice = (price: string) => {
  if (!price) return "";
  const num = price.replace(/[^0-9]/g, '');
  return num.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

// Get property type icon based on type
const getPropertyTypeIcon = (propertyType: string) => {
  const iconClass = "w-2.5 h-2.5";
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

interface MobilePreviewProps {
  profile: AgentProfile;
  properties: Property[];
  isInline?: boolean;
}

export default function MobilePreview({ profile, properties, isInline = false }: MobilePreviewProps) {
  
  const handleWhatsAppClick = (property: Property) => {
    // This is just for preview purposes - functionality is same as PublicProfile
    console.log(`Open WhatsApp for property ${property.id}`);
  };

  const ContainerClass = isInline 
    ? "w-full h-[600px] bg-white relative flex flex-col" 
    : "w-[375px] h-[812px] bg-white rounded-[40px] shadow-[0_0_0_12px_#111,0_0_0_14px_#333,0_30px_60px_rgba(0,0,0,0.4)] overflow-hidden relative border border-gray-200 select-none flex flex-col";

  return (
    <div className={ContainerClass}>
      
      {/* Notch - only show if not inline (or maybe show it for style?) */}
      {!isInline && <div className="absolute top-0 inset-x-0 h-7 bg-black z-20 rounded-b-2xl mx-16" />}
      
      {/* Status Bar Mock */}
      <div className="h-11 w-full bg-white flex items-end justify-between px-6 pb-2 text-[10px] font-medium text-black z-10 relative shrink-0">
        <span>9:41</span>
        <div className="flex gap-1">
           <div className="w-4 h-2.5 bg-black rounded-[2px]" />
           <div className="w-0.5 h-2.5 bg-black rounded-[1px]" />
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto pb-24 scrollbar-hide bg-[#F8F9FA]">
        
        {/* Profile Header */}
        <div className="bg-white px-6 pb-8 pt-6 text-center rounded-b-[32px] shadow-sm mb-6">
           <div className="w-20 h-20 mx-auto rounded-full p-1 border border-gray-100 shadow-sm mb-3 relative">
             <img src={profile.avatar} alt={profile.name} className="w-full h-full rounded-full object-cover" style={{ objectPosition: `center ${profile.avatarPosition ?? 50}%` }} />
           </div>
           <h2 className="font-display font-bold text-lg text-[#222222] mb-1">{profile.name}</h2>
           {profile.reraId && (
             <p className="text-[10px] font-semibold text-primary uppercase tracking-wide mb-2">RERA: {profile.reraId}</p>
           )}
           <p className="text-xs text-muted-foreground font-body max-w-[240px] mx-auto leading-relaxed line-clamp-3">
             {profile.bio}
           </p>
        </div>

        {/* Properties Grid - 2 Columns */}
        <div className="px-3 grid grid-cols-2 gap-2">
          {properties.map((property) => (
            <PropertyCardMobile key={property.id} property={property} onWhatsApp={() => handleWhatsAppClick(property)} />
          ))}
        </div>

        {/* Branding Footer (Minimal) */}
        <div className="mt-8 text-center pb-8">
           <a href="#" className="inline-flex items-center gap-1.5 opacity-40 grayscale hover:grayscale-0 hover:opacity-100 transition-all">
             <span className="text-[10px] font-semibold text-[#222222]">Linknow</span>
           </a>
        </div>

      </div>

      {/* Home Indicator */}
      <div className="absolute bottom-1 inset-x-0 flex justify-center z-20 pointer-events-none">
        <div className="w-32 h-1 bg-black rounded-full" />
      </div>

    </div>
  );
}

// Property Card for Mobile Preview with Gallery
function PropertyCardMobile({ property, onWhatsApp }: { property: Property, onWhatsApp: () => void }) {
  const [showGallery, setShowGallery] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  const images = property.images || [];
  
  return (
    <>
      <div className="bg-white rounded-xl overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-gray-100 flex flex-col">
        
        {/* Image with gallery indicator */}
        <div className="aspect-[4/3] bg-gray-100 relative cursor-pointer" onClick={() => images.length > 0 && setShowGallery(true)}>
           {images[0] ? (
             <img src={images[0]} className="w-full h-full object-cover" alt="" />
           ) : (
             <div className="w-full h-full flex items-center justify-center text-gray-300">
               <span className="text-[10px]">No Image</span>
             </div>
           )}
           
           {/* Image count badge */}
           {images.length > 1 && (
             <div className="absolute bottom-1 right-1 bg-black/60 text-white text-[8px] px-1.5 py-0.5 rounded-full">
               1/{images.length}
             </div>
           )}
           
           {/* Badges row - both on same line */}
           <div className="absolute top-1.5 left-1.5 right-1.5 flex justify-between items-center">
              <Badge 
                variant="secondary" 
                className={`h-5 px-2 text-[8px] font-bold uppercase tracking-wider backdrop-blur-md border-none ${
                  property.type === 'rent' ? 'bg-blue-500/90 text-white' : 'bg-emerald-500/90 text-white'
                }`}
              >
                {property.type}
              </Badge>
              {property.propertyType && (
                <Badge className="h-5 px-2 text-[8px] font-medium bg-white/90 text-gray-700 backdrop-blur-md border-none flex items-center gap-1 capitalize">
                  {getPropertyTypeIcon(property.propertyType)}
                  {property.propertyType}
                </Badge>
              )}
           </div>
        </div>

        {/* Content */}
        <div className="p-2.5 flex flex-col flex-1">
          {/* Price */}
          <div className="mb-1.5">
            {property.price ? (
              <div className="font-display font-bold text-sm text-[#222222] truncate">
                {formatPrice(property.price)} <span className="text-[10px] text-muted-foreground font-medium">AED</span>
              </div>
            ) : (
              <div className="font-display font-bold text-xs text-primary">Call for Price</div>
            )}
          </div>
          
          {/* Location */}
          {property.location && (
            <div className="flex items-center gap-1 text-[10px] text-muted-foreground mb-1.5">
              <MapPin className="w-2.5 h-2.5 shrink-0" />
              <span className="truncate">{property.location}</span>
            </div>
          )}
          
          {/* Beds, Baths, Sqft - all on one line with icons */}
          <div className="flex items-center gap-2 text-[10px] text-muted-foreground mb-1.5">
            {property.beds && (
              <div className="flex items-center gap-0.5">
                <BedDouble className="w-2.5 h-2.5" />
                <span>{property.beds}</span>
              </div>
            )}
            {property.baths && (
              <div className="flex items-center gap-0.5">
                <Bath className="w-2.5 h-2.5" />
                <span>{property.baths}</span>
              </div>
            )}
            {property.sqft && (
              <div className="flex items-center gap-0.5">
                <Ruler className="w-2.5 h-2.5" />
                <span>{property.sqft}</span>
              </div>
            )}
          </div>
          
          {/* Description */}
          {property.description && (
            <p className="text-[10px] text-gray-500 line-clamp-2 mb-1.5 leading-relaxed">
              {property.description}
            </p>
          )}

          <div className="mt-auto pt-1">
             <button 
               className="w-full h-7 rounded-lg bg-[#25D366] hover:bg-[#128C7E] active:scale-[0.98] transition-all flex items-center justify-center gap-1 text-white font-semibold text-[10px] shadow-sm"
               onClick={(e) => { e.stopPropagation(); onWhatsApp(); }}
             >
               <Phone className="w-2.5 h-2.5 fill-current" />
               <span>WhatsApp</span>
             </button>
          </div>
        </div>
      </div>
      
      {/* In-card Gallery Overlay */}
      {showGallery && images.length > 0 && (
        <div className="fixed inset-0 z-50 bg-black/95 flex flex-col" onClick={() => setShowGallery(false)}>
          {/* Close button */}
          <div className="absolute top-4 right-4 z-10">
            <button className="p-2 bg-white/10 rounded-full" onClick={() => setShowGallery(false)}>
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
          
          {/* Image counter */}
          <div className="absolute top-4 left-4 text-white text-sm font-medium">
            {currentImageIndex + 1} / {images.length}
          </div>
          
          {/* Main image */}
          <div className="flex-1 flex items-center justify-center p-4" onClick={(e) => e.stopPropagation()}>
            <img src={images[currentImageIndex]} className="max-w-full max-h-full object-contain" alt="" />
          </div>
          
          {/* Navigation */}
          {images.length > 1 && (
            <>
              <button 
                className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-white/10 rounded-full disabled:opacity-30"
                disabled={currentImageIndex === 0}
                onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(i => i - 1); }}
              >
                <ChevronLeft className="w-6 h-6 text-white" />
              </button>
              <button 
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-white/10 rounded-full disabled:opacity-30"
                disabled={currentImageIndex === images.length - 1}
                onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(i => i + 1); }}
              >
                <ChevronRight className="w-6 h-6 text-white" />
              </button>
            </>
          )}
          
          {/* Thumbnail strip */}
          {images.length > 1 && (
            <div className="flex justify-center gap-2 p-4" onClick={(e) => e.stopPropagation()}>
              {images.map((img, i) => (
                <button 
                  key={i} 
                  className={`w-12 h-12 rounded-lg overflow-hidden border-2 ${i === currentImageIndex ? 'border-white' : 'border-transparent opacity-50'}`}
                  onClick={() => setCurrentImageIndex(i)}
                >
                  <img src={img} className="w-full h-full object-cover" alt="" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}
