"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { 
  Building2, 
  MapPin, 
  IndianRupee, 
  Sparkles, 
  Image as ImageIcon, 
  CheckCircle2, 
  ArrowLeft, 
  ArrowRight, 
  Home, 
  ShieldCheck,
  Plus,
  Trash2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { AMENITIES_LIST, INDIAN_CITIES, PROPERTY_TYPES } from "@/types";

const STEPS = [
  { id: 1, title: "Basic Details", icon: Building2, desc: "Type & Configuration" },
  { id: 2, title: "Location", icon: MapPin, desc: "City & Address" },
  { id: 3, title: "Rent & Terms", icon: IndianRupee, desc: "Pricing & Deposit" },
  { id: 4, title: "Amenities & Rules", icon: Sparkles, desc: "Features & Tenant Preferences" },
  { id: 5, title: "Photos & Media", icon: ImageIcon, desc: "Images & Cover" },
];

export default function NewPropertyPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    propertyType: "APARTMENT",
    bedrooms: 2,
    bathrooms: 2,
    balconies: 1,
    carpetArea: 950,
    builtUpArea: 1100,
    floor: 4,
    totalFloors: 12,
    furnishing: "SEMI_FURNISHED",
    hasParking: true,
    parkingType: "covered",
    hasLift: true,
    hasPowerBackup: true,

    // Location
    state: "Maharashtra",
    city: "Mumbai",
    locality: "Powai",
    address: "",
    addressPublic: "Powai, Mumbai",
    pincode: "400076",

    // Pricing
    rent: 30000,
    deposit: 90000,
    maintenance: 3000,
    brokerage: 0,
    availableFrom: new Date().toISOString().split("T")[0],
    minimumStay: 11,
    noticePeriodDays: 30,

    // Preferences & Rules
    petsAllowed: false,
    smokingAllowed: false,
    guestsAllowed: true,
    vegetarianOnly: false,
    preferredGender: "any",
    amenities: ["Security", "Power Backup", "Lift", "Internet / WiFi"],
    furnitureItems: ["Wardrobe", "Geyser", "AC", "Bed"],

    // Media
    images: [
      { url: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80", isCover: true, alt: "Living Room" },
      { url: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80", isCover: false, alt: "Bedroom" }
    ]
  });

  const [newImageUrl, setNewImageUrl] = useState("");
  const [newImageAlt, setNewImageAlt] = useState("");

  const updateField = (key: string, value: any) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const toggleAmenity = (name: string) => {
    setFormData((prev) => {
      const exists = prev.amenities.includes(name);
      return {
        ...prev,
        amenities: exists 
          ? prev.amenities.filter((a) => a !== name)
          : [...prev.amenities, name]
      };
    });
  };

  const addImage = () => {
    if (!newImageUrl.trim()) return;
    setFormData((prev) => ({
      ...prev,
      images: [
        ...prev.images,
        {
          url: newImageUrl.trim(),
          isCover: prev.images.length === 0,
          alt: newImageAlt.trim() || "Property Photo"
        }
      ]
    }));
    setNewImageUrl("");
    setNewImageAlt("");
  };

  const removeImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const setCoverImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.map((img, i) => ({
        ...img,
        isCover: i === index
      }))
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/properties", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          rent: Number(formData.rent),
          deposit: Number(formData.deposit),
          maintenance: Number(formData.maintenance),
          carpetArea: Number(formData.carpetArea),
          builtUpArea: Number(formData.builtUpArea),
          bedrooms: Number(formData.bedrooms),
          bathrooms: Number(formData.bathrooms),
          balconies: Number(formData.balconies),
          floor: Number(formData.floor),
          totalFloors: Number(formData.totalFloors),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create property listing");
      }

      toast.success("Listing published successfully! Finding top tenant matches...");
      router.push(`/properties/${data.data.id}`);
    } catch (err: any) {
      toast.error(err.message || "Failed to submit listing");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background py-8 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
              <Home className="w-4 h-4" />
              <span>Landlord Portal</span>
              <span>/</span>
              <span className="text-foreground font-medium">New Listing</span>
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight">
              List Your Property
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              Our AI Mutual Match™ algorithm will automatically connect you with verified, high-compatibility tenants.
            </p>
          </div>
          <Badge variant="outline" className="self-start sm:self-center px-3 py-1 text-xs border-brand-500/40 text-brand-600 bg-brand-50/50 dark:bg-brand-950/50">
            <ShieldCheck className="w-3.5 h-3.5 mr-1" /> 100% Direct Owner
          </Badge>
        </div>

        {/* Step Indicator */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mb-8">
          {STEPS.map((s) => {
            const Icon = s.icon;
            const isActive = currentStep === s.id;
            const isDone = currentStep > s.id;
            return (
              <button
                key={s.id}
                onClick={() => setCurrentStep(s.id)}
                className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                  isActive
                    ? "border-brand-500 bg-brand-500/10 text-brand-600 dark:text-brand-400 font-semibold shadow-sm"
                    : isDone
                    ? "border-green-500/30 bg-green-500/5 text-foreground"
                    : "border-border/60 text-muted-foreground opacity-60 hover:opacity-100"
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs shrink-0 ${
                    isActive
                      ? "bg-brand-600 text-white"
                      : isDone
                      ? "bg-green-500 text-white"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {isDone ? <CheckCircle2 className="w-4 h-4" /> : <Icon className="w-3.5 h-3.5" />}
                </div>
                <div className="min-w-0 hidden sm:block">
                  <div className="text-xs font-semibold leading-none truncate">{s.title}</div>
                  <div className="text-[10px] text-muted-foreground mt-0.5 truncate">{s.desc}</div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Form Container */}
        <div className="card-elevated p-6 sm:p-8 rounded-2xl mb-8">
          {/* STEP 1: Basic Details */}
          {currentStep === 1 && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="text-xl font-display font-bold">Property Overview & Configuration</h2>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Listing Title</label>
                <Input
                  value={formData.title}
                  onChange={(e) => updateField("title", e.target.value)}
                  placeholder="e.g. Spacious 2 BHK with Lake View in Hiranandani Powai"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Property Type</label>
                  <select
                    className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                    value={formData.propertyType}
                    onChange={(e) => updateField("propertyType", e.target.value)}
                  >
                    {PROPERTY_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Furnishing Status</label>
                  <select
                    className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                    value={formData.furnishing}
                    onChange={(e) => updateField("furnishing", e.target.value)}
                  >
                    <option value="FULLY_FURNISHED">Fully Furnished</option>
                    <option value="SEMI_FURNISHED">Semi Furnished</option>
                    <option value="UNFURNISHED">Unfurnished</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Bedrooms</label>
                  <Input
                    type="number"
                    min="1"
                    max="10"
                    value={formData.bedrooms}
                    onChange={(e) => updateField("bedrooms", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Bathrooms</label>
                  <Input
                    type="number"
                    min="1"
                    max="10"
                    value={formData.bathrooms}
                    onChange={(e) => updateField("bathrooms", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Balconies</label>
                  <Input
                    type="number"
                    min="0"
                    max="10"
                    value={formData.balconies}
                    onChange={(e) => updateField("balconies", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Carpet Area (sq ft)</label>
                  <Input
                    type="number"
                    value={formData.carpetArea}
                    onChange={(e) => updateField("carpetArea", e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Floor Number</label>
                  <Input
                    type="number"
                    value={formData.floor}
                    onChange={(e) => updateField("floor", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Total Floors</label>
                  <Input
                    type="number"
                    value={formData.totalFloors}
                    onChange={(e) => updateField("totalFloors", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Lift Available</label>
                  <select
                    className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                    value={formData.hasLift ? "true" : "false"}
                    onChange={(e) => updateField("hasLift", e.target.value === "true")}
                  >
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Property Description</label>
                <textarea
                  rows={4}
                  className="w-full p-3 rounded-lg border border-border bg-background text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                  value={formData.description}
                  onChange={(e) => updateField("description", e.target.value)}
                  placeholder="Describe your property, nearby landmarks, society rules, and what makes it special..."
                />
              </div>
            </div>
          )}

          {/* STEP 2: Location */}
          {currentStep === 2 && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="text-xl font-display font-bold">Property Location & Address</h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">City</label>
                  <select
                    className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                    value={formData.city}
                    onChange={(e) => updateField("city", e.target.value)}
                  >
                    {INDIAN_CITIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Locality / Sector</label>
                  <Input
                    value={formData.locality}
                    onChange={(e) => updateField("locality", e.target.value)}
                    placeholder="e.g. Powai / Whitefield / Koramangala"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Full Private Address (Only shared with approved applicants)</label>
                <Input
                  value={formData.address}
                  onChange={(e) => updateField("address", e.target.value)}
                  placeholder="Flat 402, Building B, Hiranandani Gardens, Powai"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Public Display Address</label>
                  <Input
                    value={formData.addressPublic}
                    onChange={(e) => updateField("addressPublic", e.target.value)}
                    placeholder="Powai, Mumbai"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Pincode</label>
                  <Input
                    value={formData.pincode}
                    onChange={(e) => updateField("pincode", e.target.value)}
                    placeholder="400076"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Rent & Financials */}
          {currentStep === 3 && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="text-xl font-display font-bold">Rent, Deposit & Lease Terms</h2>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Monthly Rent (₹)</label>
                  <Input
                    type="number"
                    value={formData.rent}
                    onChange={(e) => updateField("rent", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Security Deposit (₹)</label>
                  <Input
                    type="number"
                    value={formData.deposit}
                    onChange={(e) => updateField("deposit", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Monthly Maintenance (₹)</label>
                  <Input
                    type="number"
                    value={formData.maintenance}
                    onChange={(e) => updateField("maintenance", e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Available From Date</label>
                  <Input
                    type="date"
                    value={formData.availableFrom}
                    onChange={(e) => updateField("availableFrom", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Min Stay (Months)</label>
                  <Input
                    type="number"
                    value={formData.minimumStay}
                    onChange={(e) => updateField("minimumStay", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Notice Period (Days)</label>
                  <Input
                    type="number"
                    value={formData.noticePeriodDays}
                    onChange={(e) => updateField("noticePeriodDays", e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Amenities & Preferences */}
          {currentStep === 4 && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="text-xl font-display font-bold">Amenities & House Rules</h2>

              <div>
                <label className="text-sm font-medium block mb-3">Available Society Amenities</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {AMENITIES_LIST.map((amenity: string) => {
                    const selected = formData.amenities.includes(amenity);
                    return (
                      <button
                        type="button"
                        key={amenity}
                        onClick={() => toggleAmenity(amenity)}
                        className={`p-2.5 text-xs font-medium rounded-xl border text-left flex items-center justify-between transition-all ${
                          selected
                            ? "border-brand-500 bg-brand-500/10 text-brand-600 dark:text-brand-400 font-semibold"
                            : "border-border/60 hover:border-border text-muted-foreground"
                        }`}
                      >
                        <span>{amenity}</span>
                        {selected && <CheckCircle2 className="w-3.5 h-3.5 text-brand-500 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-4 border-t border-border/60">
                <label className="text-sm font-medium block mb-3">Tenant & Lifestyle Preferences</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs text-muted-foreground">Pets Allowed</label>
                    <select
                      className="w-full h-9 px-2 rounded-lg border border-border bg-background text-xs"
                      value={formData.petsAllowed ? "true" : "false"}
                      onChange={(e) => updateField("petsAllowed", e.target.value === "true")}
                    >
                      <option value="false">No Pets</option>
                      <option value="true">Pets Welcome</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-muted-foreground">Smoking</label>
                    <select
                      className="w-full h-9 px-2 rounded-lg border border-border bg-background text-xs"
                      value={formData.smokingAllowed ? "true" : "false"}
                      onChange={(e) => updateField("smokingAllowed", e.target.value === "true")}
                    >
                      <option value="false">Non-Smoking Only</option>
                      <option value="true">Smoking Allowed</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-muted-foreground">Diet Preference</label>
                    <select
                      className="w-full h-9 px-2 rounded-lg border border-border bg-background text-xs"
                      value={formData.vegetarianOnly ? "true" : "false"}
                      onChange={(e) => updateField("vegetarianOnly", e.target.value === "true")}
                    >
                      <option value="false">No Restriction</option>
                      <option value="true">Veg Only</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-muted-foreground">Parking</label>
                    <select
                      className="w-full h-9 px-2 rounded-lg border border-border bg-background text-xs"
                      value={formData.hasParking ? "true" : "false"}
                      onChange={(e) => updateField("hasParking", e.target.value === "true")}
                    >
                      <option value="true">Available</option>
                      <option value="false">None</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: Media */}
          {currentStep === 5 && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="text-xl font-display font-bold">Property Photos & Showcase</h2>
              <p className="text-sm text-muted-foreground">
                High quality photos get 4x more matching tenant applications. Select one photo as the primary cover.
              </p>

              {/* Add image input */}
              <div className="p-4 rounded-xl border border-dashed border-border bg-muted/20 flex flex-col sm:flex-row gap-3">
                <Input
                  className="flex-1 text-xs"
                  placeholder="Paste Image URL (Unsplash or direct image link)"
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                />
                <Input
                  className="w-full sm:w-48 text-xs"
                  placeholder="Caption (e.g. Master Bedroom)"
                  value={newImageAlt}
                  onChange={(e) => setNewImageAlt(e.target.value)}
                />
                <Button onClick={addImage} type="button" size="sm" className="gap-1 text-xs">
                  <Plus className="w-3.5 h-3.5" /> Add
                </Button>
              </div>

              {/* Image preview grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {formData.images.map((img, i) => (
                  <div key={i} className="group relative rounded-xl overflow-hidden border border-border/80 bg-muted aspect-video">
                    <Image 
                      src={img.url} 
                      alt={img.alt} 
                      fill
                      sizes="(max-width: 768px) 50vw, 33vw"
                      className="object-cover" 
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <Button
                        size="sm"
                        variant={img.isCover ? "default" : "secondary"}
                        className="text-xs h-7 px-2"
                        onClick={() => setCoverImage(i)}
                      >
                        {img.isCover ? "Cover" : "Make Cover"}
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        className="text-xs h-7 px-2"
                        onClick={() => removeImage(i)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                    {img.isCover && (
                      <span className="absolute top-2 left-2 px-2 py-0.5 text-[10px] font-bold bg-brand-500 text-white rounded-md shadow">
                        Cover Photo
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Navigation Controls */}
          <div className="flex items-center justify-between pt-6 mt-6 border-t border-border/60">
            {currentStep > 1 ? (
              <Button
                variant="outline"
                onClick={() => setCurrentStep((prev) => prev - 1)}
                className="gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </Button>
            ) : (
              <div />
            )}

            {currentStep < STEPS.length ? (
              <Button
                onClick={() => setCurrentStep((prev) => prev + 1)}
                className="gap-1.5 bg-brand-600 hover:bg-brand-700 text-white"
              >
                Next Step <ArrowRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={loading}
                className="gap-1.5 bg-brand-600 hover:bg-brand-700 text-white"
              >
                {loading ? "Publishing Listing..." : "Publish Listing"} <CheckCircle2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
