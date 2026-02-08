import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Check, ChevronRight, Loader2, Sparkles, MapPin, User, Building2, Globe, Phone, Upload, X, ChevronsUpDown, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useUpload } from "@/hooks/use-upload";
import avatarPlaceholder from "@/assets/avatar-placeholder.png";

// --- Schemas ---

const accountSchema = z.object({
  email: z.string().email("Valid email is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const identitySchema = z.object({
  fullName: z.string().min(2, "Name is required"),
  countryCode: z.string().min(1, "Country code required"),
  phoneNumber: z.string().min(5, "Valid phone number required"),
});

const COUNTRY_CODES = [
  { code: "+93", country: "AF", flag: "🇦🇫", name: "Afghanistan" },
  { code: "+355", country: "AL", flag: "🇦🇱", name: "Albania" },
  { code: "+213", country: "DZ", flag: "🇩🇿", name: "Algeria" },
  { code: "+376", country: "AD", flag: "🇦🇩", name: "Andorra" },
  { code: "+244", country: "AO", flag: "🇦🇴", name: "Angola" },
  { code: "+54", country: "AR", flag: "🇦🇷", name: "Argentina" },
  { code: "+374", country: "AM", flag: "🇦🇲", name: "Armenia" },
  { code: "+61", country: "AU", flag: "🇦🇺", name: "Australia" },
  { code: "+43", country: "AT", flag: "🇦🇹", name: "Austria" },
  { code: "+994", country: "AZ", flag: "🇦🇿", name: "Azerbaijan" },
  { code: "+973", country: "BH", flag: "🇧🇭", name: "Bahrain" },
  { code: "+880", country: "BD", flag: "🇧🇩", name: "Bangladesh" },
  { code: "+375", country: "BY", flag: "🇧🇾", name: "Belarus" },
  { code: "+32", country: "BE", flag: "🇧🇪", name: "Belgium" },
  { code: "+501", country: "BZ", flag: "🇧🇿", name: "Belize" },
  { code: "+229", country: "BJ", flag: "🇧🇯", name: "Benin" },
  { code: "+975", country: "BT", flag: "🇧🇹", name: "Bhutan" },
  { code: "+591", country: "BO", flag: "🇧🇴", name: "Bolivia" },
  { code: "+387", country: "BA", flag: "🇧🇦", name: "Bosnia" },
  { code: "+267", country: "BW", flag: "🇧🇼", name: "Botswana" },
  { code: "+55", country: "BR", flag: "🇧🇷", name: "Brazil" },
  { code: "+673", country: "BN", flag: "🇧🇳", name: "Brunei" },
  { code: "+359", country: "BG", flag: "🇧🇬", name: "Bulgaria" },
  { code: "+226", country: "BF", flag: "🇧🇫", name: "Burkina Faso" },
  { code: "+257", country: "BI", flag: "🇧🇮", name: "Burundi" },
  { code: "+855", country: "KH", flag: "🇰🇭", name: "Cambodia" },
  { code: "+237", country: "CM", flag: "🇨🇲", name: "Cameroon" },
  { code: "+1", country: "CA", flag: "🇨🇦", name: "Canada" },
  { code: "+238", country: "CV", flag: "🇨🇻", name: "Cape Verde" },
  { code: "+236", country: "CF", flag: "🇨🇫", name: "Central African Republic" },
  { code: "+235", country: "TD", flag: "🇹🇩", name: "Chad" },
  { code: "+56", country: "CL", flag: "🇨🇱", name: "Chile" },
  { code: "+86", country: "CN", flag: "🇨🇳", name: "China" },
  { code: "+57", country: "CO", flag: "🇨🇴", name: "Colombia" },
  { code: "+269", country: "KM", flag: "🇰🇲", name: "Comoros" },
  { code: "+242", country: "CG", flag: "🇨🇬", name: "Congo" },
  { code: "+243", country: "CD", flag: "🇨🇩", name: "Congo (DRC)" },
  { code: "+506", country: "CR", flag: "🇨🇷", name: "Costa Rica" },
  { code: "+385", country: "HR", flag: "🇭🇷", name: "Croatia" },
  { code: "+53", country: "CU", flag: "🇨🇺", name: "Cuba" },
  { code: "+357", country: "CY", flag: "🇨🇾", name: "Cyprus" },
  { code: "+420", country: "CZ", flag: "🇨🇿", name: "Czech Republic" },
  { code: "+45", country: "DK", flag: "🇩🇰", name: "Denmark" },
  { code: "+253", country: "DJ", flag: "🇩🇯", name: "Djibouti" },
  { code: "+593", country: "EC", flag: "🇪🇨", name: "Ecuador" },
  { code: "+20", country: "EG", flag: "🇪🇬", name: "Egypt" },
  { code: "+503", country: "SV", flag: "🇸🇻", name: "El Salvador" },
  { code: "+240", country: "GQ", flag: "🇬🇶", name: "Equatorial Guinea" },
  { code: "+291", country: "ER", flag: "🇪🇷", name: "Eritrea" },
  { code: "+372", country: "EE", flag: "🇪🇪", name: "Estonia" },
  { code: "+268", country: "SZ", flag: "🇸🇿", name: "Eswatini" },
  { code: "+251", country: "ET", flag: "🇪🇹", name: "Ethiopia" },
  { code: "+679", country: "FJ", flag: "🇫🇯", name: "Fiji" },
  { code: "+358", country: "FI", flag: "🇫🇮", name: "Finland" },
  { code: "+33", country: "FR", flag: "🇫🇷", name: "France" },
  { code: "+241", country: "GA", flag: "🇬🇦", name: "Gabon" },
  { code: "+220", country: "GM", flag: "🇬🇲", name: "Gambia" },
  { code: "+995", country: "GE", flag: "🇬🇪", name: "Georgia" },
  { code: "+49", country: "DE", flag: "🇩🇪", name: "Germany" },
  { code: "+233", country: "GH", flag: "🇬🇭", name: "Ghana" },
  { code: "+30", country: "GR", flag: "🇬🇷", name: "Greece" },
  { code: "+502", country: "GT", flag: "🇬🇹", name: "Guatemala" },
  { code: "+224", country: "GN", flag: "🇬🇳", name: "Guinea" },
  { code: "+245", country: "GW", flag: "🇬🇼", name: "Guinea-Bissau" },
  { code: "+592", country: "GY", flag: "🇬🇾", name: "Guyana" },
  { code: "+509", country: "HT", flag: "🇭🇹", name: "Haiti" },
  { code: "+504", country: "HN", flag: "🇭🇳", name: "Honduras" },
  { code: "+852", country: "HK", flag: "🇭🇰", name: "Hong Kong" },
  { code: "+36", country: "HU", flag: "🇭🇺", name: "Hungary" },
  { code: "+354", country: "IS", flag: "🇮🇸", name: "Iceland" },
  { code: "+91", country: "IN", flag: "🇮🇳", name: "India" },
  { code: "+62", country: "ID", flag: "🇮🇩", name: "Indonesia" },
  { code: "+98", country: "IR", flag: "🇮🇷", name: "Iran" },
  { code: "+964", country: "IQ", flag: "🇮🇶", name: "Iraq" },
  { code: "+353", country: "IE", flag: "🇮🇪", name: "Ireland" },
  { code: "+972", country: "IL", flag: "🇮🇱", name: "Israel" },
  { code: "+39", country: "IT", flag: "🇮🇹", name: "Italy" },
  { code: "+225", country: "CI", flag: "🇨🇮", name: "Ivory Coast" },
  { code: "+1876", country: "JM", flag: "🇯🇲", name: "Jamaica" },
  { code: "+81", country: "JP", flag: "🇯🇵", name: "Japan" },
  { code: "+962", country: "JO", flag: "🇯🇴", name: "Jordan" },
  { code: "+7", country: "KZ", flag: "🇰🇿", name: "Kazakhstan" },
  { code: "+254", country: "KE", flag: "🇰🇪", name: "Kenya" },
  { code: "+965", country: "KW", flag: "🇰🇼", name: "Kuwait" },
  { code: "+996", country: "KG", flag: "🇰🇬", name: "Kyrgyzstan" },
  { code: "+856", country: "LA", flag: "🇱🇦", name: "Laos" },
  { code: "+371", country: "LV", flag: "🇱🇻", name: "Latvia" },
  { code: "+961", country: "LB", flag: "🇱🇧", name: "Lebanon" },
  { code: "+266", country: "LS", flag: "🇱🇸", name: "Lesotho" },
  { code: "+231", country: "LR", flag: "🇱🇷", name: "Liberia" },
  { code: "+218", country: "LY", flag: "🇱🇾", name: "Libya" },
  { code: "+423", country: "LI", flag: "🇱🇮", name: "Liechtenstein" },
  { code: "+370", country: "LT", flag: "🇱🇹", name: "Lithuania" },
  { code: "+352", country: "LU", flag: "🇱🇺", name: "Luxembourg" },
  { code: "+853", country: "MO", flag: "🇲🇴", name: "Macau" },
  { code: "+261", country: "MG", flag: "🇲🇬", name: "Madagascar" },
  { code: "+265", country: "MW", flag: "🇲🇼", name: "Malawi" },
  { code: "+60", country: "MY", flag: "🇲🇾", name: "Malaysia" },
  { code: "+960", country: "MV", flag: "🇲🇻", name: "Maldives" },
  { code: "+223", country: "ML", flag: "🇲🇱", name: "Mali" },
  { code: "+356", country: "MT", flag: "🇲🇹", name: "Malta" },
  { code: "+222", country: "MR", flag: "🇲🇷", name: "Mauritania" },
  { code: "+230", country: "MU", flag: "🇲🇺", name: "Mauritius" },
  { code: "+52", country: "MX", flag: "🇲🇽", name: "Mexico" },
  { code: "+373", country: "MD", flag: "🇲🇩", name: "Moldova" },
  { code: "+377", country: "MC", flag: "🇲🇨", name: "Monaco" },
  { code: "+976", country: "MN", flag: "🇲🇳", name: "Mongolia" },
  { code: "+382", country: "ME", flag: "🇲🇪", name: "Montenegro" },
  { code: "+212", country: "MA", flag: "🇲🇦", name: "Morocco" },
  { code: "+258", country: "MZ", flag: "🇲🇿", name: "Mozambique" },
  { code: "+95", country: "MM", flag: "🇲🇲", name: "Myanmar" },
  { code: "+264", country: "NA", flag: "🇳🇦", name: "Namibia" },
  { code: "+977", country: "NP", flag: "🇳🇵", name: "Nepal" },
  { code: "+31", country: "NL", flag: "🇳🇱", name: "Netherlands" },
  { code: "+64", country: "NZ", flag: "🇳🇿", name: "New Zealand" },
  { code: "+505", country: "NI", flag: "🇳🇮", name: "Nicaragua" },
  { code: "+227", country: "NE", flag: "🇳🇪", name: "Niger" },
  { code: "+234", country: "NG", flag: "🇳🇬", name: "Nigeria" },
  { code: "+850", country: "KP", flag: "🇰🇵", name: "North Korea" },
  { code: "+389", country: "MK", flag: "🇲🇰", name: "North Macedonia" },
  { code: "+47", country: "NO", flag: "🇳🇴", name: "Norway" },
  { code: "+968", country: "OM", flag: "🇴🇲", name: "Oman" },
  { code: "+92", country: "PK", flag: "🇵🇰", name: "Pakistan" },
  { code: "+970", country: "PS", flag: "🇵🇸", name: "Palestine" },
  { code: "+507", country: "PA", flag: "🇵🇦", name: "Panama" },
  { code: "+675", country: "PG", flag: "🇵🇬", name: "Papua New Guinea" },
  { code: "+595", country: "PY", flag: "🇵🇾", name: "Paraguay" },
  { code: "+51", country: "PE", flag: "🇵🇪", name: "Peru" },
  { code: "+63", country: "PH", flag: "🇵🇭", name: "Philippines" },
  { code: "+48", country: "PL", flag: "🇵🇱", name: "Poland" },
  { code: "+351", country: "PT", flag: "🇵🇹", name: "Portugal" },
  { code: "+1787", country: "PR", flag: "🇵🇷", name: "Puerto Rico" },
  { code: "+974", country: "QA", flag: "🇶🇦", name: "Qatar" },
  { code: "+40", country: "RO", flag: "🇷🇴", name: "Romania" },
  { code: "+7", country: "RU", flag: "🇷🇺", name: "Russia" },
  { code: "+250", country: "RW", flag: "🇷🇼", name: "Rwanda" },
  { code: "+966", country: "SA", flag: "🇸🇦", name: "Saudi Arabia" },
  { code: "+221", country: "SN", flag: "🇸🇳", name: "Senegal" },
  { code: "+381", country: "RS", flag: "🇷🇸", name: "Serbia" },
  { code: "+248", country: "SC", flag: "🇸🇨", name: "Seychelles" },
  { code: "+232", country: "SL", flag: "🇸🇱", name: "Sierra Leone" },
  { code: "+65", country: "SG", flag: "🇸🇬", name: "Singapore" },
  { code: "+421", country: "SK", flag: "🇸🇰", name: "Slovakia" },
  { code: "+386", country: "SI", flag: "🇸🇮", name: "Slovenia" },
  { code: "+677", country: "SB", flag: "🇸🇧", name: "Solomon Islands" },
  { code: "+252", country: "SO", flag: "🇸🇴", name: "Somalia" },
  { code: "+27", country: "ZA", flag: "🇿🇦", name: "South Africa" },
  { code: "+82", country: "KR", flag: "🇰🇷", name: "South Korea" },
  { code: "+211", country: "SS", flag: "🇸🇸", name: "South Sudan" },
  { code: "+34", country: "ES", flag: "🇪🇸", name: "Spain" },
  { code: "+94", country: "LK", flag: "🇱🇰", name: "Sri Lanka" },
  { code: "+249", country: "SD", flag: "🇸🇩", name: "Sudan" },
  { code: "+597", country: "SR", flag: "🇸🇷", name: "Suriname" },
  { code: "+46", country: "SE", flag: "🇸🇪", name: "Sweden" },
  { code: "+41", country: "CH", flag: "🇨🇭", name: "Switzerland" },
  { code: "+963", country: "SY", flag: "🇸🇾", name: "Syria" },
  { code: "+886", country: "TW", flag: "🇹🇼", name: "Taiwan" },
  { code: "+992", country: "TJ", flag: "🇹🇯", name: "Tajikistan" },
  { code: "+255", country: "TZ", flag: "🇹🇿", name: "Tanzania" },
  { code: "+66", country: "TH", flag: "🇹🇭", name: "Thailand" },
  { code: "+670", country: "TL", flag: "🇹🇱", name: "Timor-Leste" },
  { code: "+228", country: "TG", flag: "🇹🇬", name: "Togo" },
  { code: "+676", country: "TO", flag: "🇹🇴", name: "Tonga" },
  { code: "+1868", country: "TT", flag: "🇹🇹", name: "Trinidad and Tobago" },
  { code: "+216", country: "TN", flag: "🇹🇳", name: "Tunisia" },
  { code: "+90", country: "TR", flag: "🇹🇷", name: "Turkey" },
  { code: "+993", country: "TM", flag: "🇹🇲", name: "Turkmenistan" },
  { code: "+256", country: "UG", flag: "🇺🇬", name: "Uganda" },
  { code: "+380", country: "UA", flag: "🇺🇦", name: "Ukraine" },
  { code: "+971", country: "AE", flag: "🇦🇪", name: "UAE" },
  { code: "+44", country: "GB", flag: "🇬🇧", name: "United Kingdom" },
  { code: "+1", country: "US", flag: "🇺🇸", name: "United States" },
  { code: "+598", country: "UY", flag: "🇺🇾", name: "Uruguay" },
  { code: "+998", country: "UZ", flag: "🇺🇿", name: "Uzbekistan" },
  { code: "+678", country: "VU", flag: "🇻🇺", name: "Vanuatu" },
  { code: "+58", country: "VE", flag: "🇻🇪", name: "Venezuela" },
  { code: "+84", country: "VN", flag: "🇻🇳", name: "Vietnam" },
  { code: "+967", country: "YE", flag: "🇾🇪", name: "Yemen" },
  { code: "+260", country: "ZM", flag: "🇿🇲", name: "Zambia" },
  { code: "+263", country: "ZW", flag: "🇿🇼", name: "Zimbabwe" },
];

const profileSchema = z.object({
  bio: z.string().max(120, "Max 120 characters").optional(),
});

const locationSchema = z.object({
  location: z.string().optional(),
  agentType: z.enum(["independent", "agency"]).default("independent"),
});

const linkSchema = z.object({
  slug: z.string().min(3, "Slug too short").regex(/^[a-z0-9-]+$/, "Only lowercase letters, numbers, and dashes"),
});

type FormData = z.infer<typeof accountSchema> &
                z.infer<typeof identitySchema> & 
                z.infer<typeof profileSchema> & 
                z.infer<typeof locationSchema> & 
                z.infer<typeof linkSchema>;

// --- Components ---

function StepIndicator({ currentStep, totalSteps }: { currentStep: number; totalSteps: number }) {
  return (
    <div className="flex gap-1.5 mb-6">
      {Array.from({ length: totalSteps }).map((_, i) => (
        <div
          key={i}
          className={`h-1 rounded-full transition-all duration-300 ${
            i <= currentStep ? "w-8 bg-primary" : "w-2.5 bg-gray-100"
          }`}
        />
      ))}
    </div>
  );
}

export default function OnboardingWizard() {
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  
  // Form State
  const [formData, setFormData] = useState<Partial<FormData>>({
    agentType: "independent",
  });
  
  // Specific UI State
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null);

  const totalSteps = 6; // Added account step

  const nextStep = () => {
    setDirection(1);
    setStep((s) => Math.min(s + 1, totalSteps - 1));
  };

  const prevStep = () => {
    setDirection(-1);
    setStep((s) => Math.max(s - 1, 0));
  };

  const handleIdentitySubmit = (data: any) => {
    setFormData({ ...formData, ...data });
    // Auto-generate slug
    const generatedSlug = data.fullName.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    setFormData((prev) => ({ ...prev, slug: generatedSlug }));
    nextStep();
  };

  const handleProfileSubmit = (data: any) => {
    setFormData({ ...formData, ...data });
    nextStep();
  };

  const handleLocationSubmit = (data: any) => {
    setFormData({ ...formData, ...data });
    nextStep();
  };

  const handleLinkSubmit = (data: any) => {
    setFormData({ ...formData, ...data });
    nextStep();
  };
  
  const handleAccountSubmit = (data: any) => {
    setFormData({ ...formData, ...data });
    nextStep();
  };

  const handleFinalSubmit = async () => {
    setIsLoading(true);
    
    try {
      // Register user with email/password
      const registerRes = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          firstName: formData.fullName?.split(" ")[0],
        }),
      });
      
      if (!registerRes.ok) {
        const error = await registerRes.json();
        throw new Error(error.message || "Registration failed");
      }
      
      // Create profile with full phone number (country code + number)
      const fullPhoneNumber = `${formData.countryCode}${formData.phoneNumber?.replace(/\s/g, '')}`;
      const profileRes = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          slug: formData.slug,
          fullName: formData.fullName,
          phoneNumber: fullPhoneNumber,
          bio: formData.bio,
          location: formData.location,
          agentType: formData.agentType,
          avatarUrl: avatarUrl,
        }),
      });
      
      if (!profileRes.ok) {
        const error = await profileRes.json();
        throw new Error(error.message || "Failed to create profile");
      }
      
      toast({
        title: "Success!",
        description: "Your profile has been created.",
      });
      
      // Redirect to dashboard
      setLocation("/dashboard");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 20 : -20,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 20 : -20,
      opacity: 0,
    }),
  };

  return (
    <div className="w-full mx-auto min-h-[400px] flex flex-col font-body">
      <StepIndicator currentStep={step} totalSteps={totalSteps} />

      <div className="flex-1 relative">
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={step}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="w-full"
          >
            {step === 0 && (
              <StepIdentity 
                defaultValues={formData} 
                onSubmit={handleIdentitySubmit}
              />
            )}
            {step === 1 && (
              <StepProfile 
                defaultValues={formData} 
                onSubmit={handleProfileSubmit}
                avatarPreview={avatarPreview}
                setAvatarPreview={setAvatarPreview}
                setAvatarUrl={setAvatarUrl}
                onBack={prevStep}
              />
            )}
            {step === 2 && (
              <StepLocation 
                defaultValues={formData} 
                onSubmit={handleLocationSubmit}
                onBack={prevStep}
              />
            )}
            {step === 3 && (
              <StepLink 
                defaultValues={formData} 
                onSubmit={handleLinkSubmit}
                onBack={prevStep}
                slugAvailable={slugAvailable}
                setSlugAvailable={setSlugAvailable}
              />
            )}
            {step === 4 && (
              <StepAccount 
                defaultValues={formData} 
                onSubmit={handleAccountSubmit}
                onBack={prevStep}
              />
            )}
            {step === 5 && (
              <StepConfirmation 
                data={formData} 
                onSubmit={handleFinalSubmit}
                isLoading={isLoading}
                onBack={prevStep}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

// --- Step Components ---

function StepIdentity({ defaultValues, onSubmit }: any) {
  const [countryOpen, setCountryOpen] = useState(false);
  const form = useForm({
    resolver: zodResolver(identitySchema),
    defaultValues: {
      fullName: defaultValues.fullName || "",
      countryCode: defaultValues.countryCode || "+971",
      phoneNumber: defaultValues.phoneNumber || "",
    },
  });

  const selectedCountry = COUNTRY_CODES.find(c => c.code === form.watch("countryCode")) || COUNTRY_CODES.find(c => c.code === "+971")!;

  return (
    <div className="space-y-5">
      <div className="space-y-1">
        <h2 className="text-[22px] font-display font-bold tracking-tight text-[#222222]">Let's get started</h2>
        <p className="text-[13px] text-muted-foreground font-body">Enter your details to claim your link.</p>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="fullName" className="text-[13px] font-semibold text-[#222222]">Full Name</Label>
            <Input 
              id="fullName" 
              placeholder="e.g. Ahmed Al Mansoori" 
              className="h-10 text-[13px] border-gray-200 focus-visible:ring-primary/20 bg-gray-50/50"
              {...form.register("fullName")}
              data-testid="input-fullname"
            />
            {form.formState.errors.fullName && (
              <p className="text-[11px] text-destructive">{String(form.formState.errors.fullName.message)}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="phone" className="text-[13px] font-semibold text-[#222222]">WhatsApp Number</Label>
            <div className="flex gap-2.5">
              <Popover open={countryOpen} onOpenChange={setCountryOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={countryOpen}
                    className="h-10 w-[120px] justify-between text-[13px] border-gray-200 bg-gray-50/50 font-normal"
                    data-testid="select-country-code"
                  >
                    <span className="flex items-center gap-1 truncate">
                      <span>{selectedCountry.flag}</span>
                      <span>{selectedCountry.code}</span>
                    </span>
                    <ChevronsUpDown className="ml-1 h-3 w-3 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[280px] p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Search country..." className="h-9" />
                    <CommandList>
                      <CommandEmpty>No country found.</CommandEmpty>
                      <CommandGroup className="max-h-[250px] overflow-auto">
                        {COUNTRY_CODES.map((country) => (
                          <CommandItem
                            key={`${country.country}-${country.code}`}
                            value={`${country.name} ${country.code}`}
                            onSelect={() => {
                              form.setValue("countryCode", country.code);
                              setCountryOpen(false);
                            }}
                            className="text-[13px]"
                          >
                            <span className="flex items-center gap-2 flex-1">
                              <span>{country.flag}</span>
                              <span className="flex-1">{country.name}</span>
                              <span className="text-muted-foreground">{country.code}</span>
                            </span>
                            {form.watch("countryCode") === country.code && (
                              <Check className="h-4 w-4 text-primary" />
                            )}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              <Input 
                id="phone" 
                placeholder="50 123 4567" 
                type="tel"
                className="h-10 text-[13px] flex-1 border-gray-200 focus-visible:ring-primary/20 bg-gray-50/50"
                {...form.register("phoneNumber")}
                data-testid="input-phone"
              />
            </div>
             {form.formState.errors.phoneNumber && (
              <p className="text-[11px] text-destructive">{String(form.formState.errors.phoneNumber.message)}</p>
            )}
          </div>
        </div>

        <Button type="submit" className="w-full h-10 text-[13px] font-semibold shadow-sm hover:shadow-md transition-all" data-testid="button-continue-identity">
          Continue
        </Button>
      </form>
    </div>
  );
}

function StepProfile({ defaultValues, onSubmit, avatarPreview, setAvatarPreview, setAvatarUrl, onBack }: any) {
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();
  
  const { uploadFile, isUploading } = useUpload({
    onSuccess: (response) => {
      setAvatarUrl(response.objectPath);
      toast({ title: "Photo uploaded!" });
    },
    onError: () => {
      toast({ title: "Failed to upload photo", variant: "destructive" });
    },
  });
  
  const form = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      bio: defaultValues.bio || "",
    },
    mode: "onChange",
  });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      await uploadFile(file);
    }
  };

  const handleGenerateBio = async () => {
    if (!defaultValues.fullName) {
      toast({ title: "Please enter your name first", variant: "destructive" });
      return;
    }
    
    setIsGenerating(true);
    try {
      const response = await fetch("/api/generate-bio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          name: defaultValues.fullName,
          location: defaultValues.location,
          agentType: defaultValues.agentType
        }),
      });
      
      if (!response.ok) throw new Error("Failed to generate bio");
      
      const data = await response.json();
      form.setValue("bio", data.bio, { shouldDirty: true, shouldValidate: true });
      toast({ title: "Bio generated!" });
    } catch (error) {
      toast({ title: "Failed to generate bio", variant: "destructive" });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="space-y-1">
        <h2 className="text-[22px] font-display font-bold tracking-tight text-[#222222]">Your Profile</h2>
        <p className="text-[13px] text-muted-foreground font-body">Add a photo and short bio to build trust.</p>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Avatar Upload */}
        <div className="flex justify-center">
          <div className="relative group cursor-pointer">
            <div className="w-24 h-24 rounded-full overflow-hidden border-[3px] border-white shadow-md bg-gray-50 relative">
              <img 
                src={avatarPreview || avatarPlaceholder} 
                alt="Avatar" 
                className="w-full h-full object-cover" 
              />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                {isUploading ? (
                  <Loader2 className="w-6 h-6 text-white animate-spin" />
                ) : (
                  <Upload className="w-6 h-6 text-white opacity-90" />
                )}
              </div>
            </div>
            <input 
              type="file" 
              accept="image/*" 
              className="absolute inset-0 opacity-0 cursor-pointer" 
              onChange={handleImageUpload}
              disabled={isUploading}
              data-testid="input-avatar"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="bio" className="text-[13px] font-semibold text-[#222222]">Short Bio</Label>
          <Textarea 
            id="bio" 
            placeholder="Dubai real estate agent | Ready to help you find your home"
            className="resize-none h-20 text-[13px] border-gray-200 focus-visible:ring-primary/20 bg-gray-50/50"
            value={form.watch("bio") || ""}
            onChange={(e) => form.setValue("bio", e.target.value, { shouldDirty: true, shouldValidate: true })}
            maxLength={120}
            data-testid="input-bio"
          />
          <p className="text-[10px] text-right text-muted-foreground">
            {form.watch("bio")?.length || 0}/120
          </p>
        </div>

        <div className="flex gap-2.5">
           <Button type="button" variant="outline" className="flex-1 h-10 text-[13px] font-medium" onClick={onBack}>
            Back
          </Button>
          <Button type="submit" className="flex-[2] h-10 text-[13px] font-semibold shadow-sm hover:shadow-md transition-all" data-testid="button-continue-profile">
            Continue
          </Button>
        </div>
      </form>
    </div>
  );
}

function StepLocation({ defaultValues, onSubmit, onBack }: any) {
  const form = useForm({
    resolver: zodResolver(locationSchema),
    defaultValues: {
      location: defaultValues.location || "",
      agentType: defaultValues.agentType || "independent",
    },
  });

  return (
    <div className="space-y-5">
      <div className="space-y-1">
        <h2 className="text-[22px] font-display font-bold tracking-tight text-[#222222]">Location & Context</h2>
        <p className="text-[13px] text-muted-foreground font-body">Where do you operate?</p>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="location" className="text-[13px] font-semibold text-[#222222]">Primary Area / Location</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                id="location" 
                placeholder="Dubai Marina, Business Bay, JVC" 
                className="pl-9 h-10 text-[13px] border-gray-200 focus-visible:ring-primary/20 bg-gray-50/50"
                {...form.register("location")}
                data-testid="input-location"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-[13px] font-semibold text-[#222222]">Agent Type</Label>
            <Tabs 
              defaultValue={form.getValues("agentType")} 
              onValueChange={(val) => form.setValue("agentType", val as any)}
              className="w-full"
            >
              <TabsList className="w-full h-10 grid grid-cols-2 p-1 bg-gray-100">
                <TabsTrigger value="independent" className="text-[13px] font-semibold h-full data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md transition-all">Independent Agent</TabsTrigger>
                <TabsTrigger value="agency" className="text-[13px] font-semibold h-full data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md transition-all">Agency / Brokerage</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>

        <div className="flex gap-2.5 pt-2">
           <Button type="button" variant="outline" className="flex-1 h-10 text-[13px] font-medium" onClick={onBack}>
            Back
          </Button>
          <Button type="submit" className="flex-[2] h-10 text-[13px] font-semibold shadow-sm hover:shadow-md transition-all" data-testid="button-continue-location">
            Continue
          </Button>
        </div>
      </form>
    </div>
  );
}

function StepLink({ defaultValues, onSubmit, onBack, slugAvailable, setSlugAvailable }: any) {
  const form = useForm({
    resolver: zodResolver(linkSchema),
    defaultValues: {
      slug: defaultValues.slug || "",
    },
  });

  // Mock validation effect
  useEffect(() => {
    const slug = form.watch("slug");
    if (slug.length >= 3) {
      setSlugAvailable(true); // Always available for mock
    } else {
      setSlugAvailable(null);
    }
  }, [form.watch("slug")]);

  return (
    <div className="space-y-5">
      <div className="space-y-1">
        <h2 className="text-[22px] font-display font-bold tracking-tight text-[#222222]">Claim Your Link</h2>
        <p className="text-[13px] text-muted-foreground font-body">This will be your public profile URL.</p>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
           <div className="space-y-1.5">
            <Label htmlFor="slug" className="text-[13px] font-semibold text-[#222222]">Your Link Slug</Label>
            <div className="flex items-center">
              <span className="text-muted-foreground text-[13px] mr-1 font-medium">linknow.live/</span>
              <div className="relative flex-1">
                <Input 
                  id="slug" 
                  className="h-10 text-[13px] font-semibold pr-8 border-gray-200 focus-visible:ring-primary/20 bg-gray-50/50"
                  {...form.register("slug")}
                  data-testid="input-slug"
                />
                {slugAvailable && (
                  <div className="absolute right-2.5 top-2.5 text-green-500">
                    <Check className="w-4 h-4" />
                  </div>
                )}
              </div>
            </div>
             {form.formState.errors.slug && (
              <p className="text-[11px] text-destructive">{String(form.formState.errors.slug.message)}</p>
            )}
            {slugAvailable && (
              <p className="text-[11px] text-green-600 flex items-center gap-1 font-medium">
                <Sparkles className="w-3 h-3" /> This link is available!
              </p>
            )}
          </div>
        </div>

        <div className="flex gap-2.5 pt-2">
           <Button type="button" variant="outline" className="flex-1 h-10 text-[13px] font-medium" onClick={onBack}>
            Back
          </Button>
          <Button type="submit" className="flex-[2] h-10 text-[13px] font-semibold shadow-sm hover:shadow-md transition-all" data-testid="button-continue-link">
            Look Good
          </Button>
        </div>
      </form>
    </div>
  );
}

function StepAccount({ defaultValues, onSubmit, onBack }: any) {
  const [showPassword, setShowPassword] = useState(false);
  const form = useForm({
    resolver: zodResolver(accountSchema),
    defaultValues: {
      email: defaultValues.email || "",
      password: defaultValues.password || "",
    },
  });

  return (
    <div className="space-y-5">
      <div className="space-y-1">
        <h2 className="text-[22px] font-display font-bold tracking-tight text-[#222222]">Create Your Account</h2>
        <p className="text-[13px] text-muted-foreground font-body">Set up your login credentials.</p>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-[13px] font-semibold text-[#222222]">Email Address</Label>
            <Input 
              id="email" 
              type="email"
              placeholder="you@example.com" 
              className="h-10 text-[13px] border-gray-200 focus-visible:ring-primary/20 bg-gray-50/50"
              {...form.register("email")}
              data-testid="input-email"
            />
            {form.formState.errors.email && (
              <p className="text-[11px] text-destructive">{String(form.formState.errors.email.message)}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-[13px] font-semibold text-[#222222]">Password</Label>
            <div className="relative">
              <Input 
                id="password" 
                type={showPassword ? "text" : "password"}
                placeholder="At least 6 characters" 
                className="h-10 text-[13px] border-gray-200 focus-visible:ring-primary/20 bg-gray-50/50 pr-10"
                {...form.register("password")}
                data-testid="input-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                data-testid="toggle-signup-password"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {form.formState.errors.password && (
              <p className="text-[11px] text-destructive">{String(form.formState.errors.password.message)}</p>
            )}
          </div>
        </div>

        <p className="text-[11px] text-muted-foreground">
          You'll use this email and password to log in and edit your profile later.
        </p>

        <div className="flex gap-2.5">
           <Button type="button" variant="outline" className="flex-1 h-10 text-[13px] font-medium" onClick={onBack}>
            Back
          </Button>
          <Button type="submit" className="flex-[2] h-10 text-[13px] font-semibold shadow-sm hover:shadow-md transition-all" data-testid="button-continue-account">
            Continue
          </Button>
        </div>
      </form>
    </div>
  );
}

function StepConfirmation({ data, onSubmit, isLoading, onBack }: any) {
  return (
    <div className="space-y-5">
      <div className="space-y-2 text-center pt-2">
        <div className="mx-auto w-14 h-14 bg-green-50 rounded-full flex items-center justify-center mb-3">
          <Sparkles className="w-7 h-7 text-green-600" />
        </div>
        <h2 className="text-[22px] font-display font-bold tracking-tight text-[#222222]">You're All Set!</h2>
        <p className="text-[13px] text-muted-foreground font-body">Your profile is ready to go live.</p>
      </div>

      <Card className="p-4 bg-secondary/40 border-none space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-[13px] font-display">
            {data.fullName.charAt(0)}
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-[13px] text-[#222222] font-display">{data.fullName}</h3>
            <p className="text-[11px] text-muted-foreground font-body">{data.countryCode} {data.phoneNumber}</p>
          </div>
        </div>
        <Separator className="bg-border/50" />
        <div className="flex items-center gap-2 text-[11px] text-muted-foreground font-medium">
          <Globe className="w-3 h-3" />
          <span>linknow.live/{data.slug}</span>
        </div>
      </Card>

      <div className="flex gap-2.5 pt-2">
         <Button type="button" variant="outline" className="flex-1 h-10 text-[13px] font-medium" onClick={onBack} disabled={isLoading}>
          Back
        </Button>
        <Button 
          onClick={onSubmit} 
          className="flex-[2] h-10 text-[13px] font-semibold shadow-md hover:shadow-lg transition-all"
          disabled={isLoading}
          data-testid="button-create-link"
        >
          {isLoading ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : "Create My Link"}
        </Button>
      </div>
    </div>
  );
}
