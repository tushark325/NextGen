"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useRef } from "react";
import { Bath, BedDouble, Car, CheckCircle2, Heart, MapPin, Sofa, Sparkles, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { formatCurrency, getMatchCategory, MATCH_COLORS } from "@/types";
import { cn } from "@/lib/utils";

interface PropertyCardProps {
  property: {
    id: string;
    title: string;
    propertyType: string;
    city: string;
    locality: string;
    bedrooms: number;
    bathrooms: number;
    rent: number;
    estimatedTotal?: number | null;
    deposit: number;
    furnishing: string;
    hasParking: boolean;
    isVerified?: boolean;
    petsAllowed?: boolean;
    coverImage?: string | null;
    images?: Array<{ url: string; isCover?: boolean }>;
    matchScore?: number;
    owner?: {
      firstName: string;
      lastName: string;
      avatarUrl?: string | null;
      landlordProfile?: { identityVerified?: boolean; rating?: number | null } | null;
    };
  };
  className?: string;
  showMatchBadge?: boolean;
  onSaveToggle?: (id: string, isSaved: boolean) => void;
}

const furnishingLabels: Record<string, string> = {
  FULLY_FURNISHED: "Furnished",
  SEMI_FURNISHED: "Semi-Furnished",
  UNFURNISHED: "Unfurnished",
};

export function PropertyCard({
  property: p,
  className,
  showMatchBadge = true,
  onSaveToggle,
}: PropertyCardProps) {
  const [isFavorited, setIsFavorited] = useState(false);
  const [isTogglingFav, setIsTogglingFav] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ rotateX: 0, rotateY: 0 });

  const coverImage =
    p.coverImage ??
    p.images?.find((img) => img.isCover)?.url ??
    p.images?.[0]?.url;

  const matchCat = p.matchScore ? getMatchCategory(p.matchScore) : null;
  const isOwnerVerified = p.owner?.landlordProfile?.identityVerified;

  // 3D Parallax Tilt Handler on Hover
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -6;
    const rotateY = ((x - centerX) / centerX) * 6;

    setTilt({ rotateX, rotateY });
  };

  const handleMouseLeave = () => {
    setTilt({ rotateX: 0, rotateY: 0 });
  };

  const handleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsTogglingFav(true);
    try {
      const res = await fetch("/api/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ propertyId: p.id }),
      });
      const json = await res.json();
      if (json.success) {
        setIsFavorited(json.data.isFavorited);
        onSaveToggle?.(p.id, json.data.isFavorited);
        toast.success(json.data.isFavorited ? "Saved to favorites" : "Removed from favorites");
      } else if (res.status === 401) {
        toast.error("Please sign in to save properties");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setIsTogglingFav(false);
    }
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: `perspective(1000px) rotateX(${tilt.rotateX}deg) rotateY(${tilt.rotateY}deg)`,
        transition: "transform 0.15s ease-out, box-shadow 0.3s ease",
      }}
      className={cn("group property-card block hologram-border", className)}
    >
      <Link href={`/properties/${p.id}`}>
        {/* Image Container with depth */}
        <div className="property-card__image relative">
          {coverImage ? (
            <Image
              src={coverImage}
              alt={p.title}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-brand-950 to-purple-950 flex items-center justify-center">
              <BedDouble className="w-12 h-12 text-cyan-400/40" />
            </div>
          )}

          {/* Vignette Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#080d22] via-transparent to-black/30 pointer-events-none" />

          {/* Holographic Match Badge */}
          {showMatchBadge && p.matchScore && (
            <div className="match-badge match-badge--excellent flex items-center gap-1.5 font-mono">
              <Sparkles className="w-3.5 h-3.5 text-cyan-300 animate-pulse" />
              <span>{p.matchScore}% MATCH</span>
            </div>
          )}

          {/* Save Button */}
          <button
            onClick={handleFavorite}
            disabled={isTogglingFav}
            className="absolute top-3 right-3 w-9 h-9 rounded-full bg-black/60 backdrop-blur-md
                       flex items-center justify-center shadow-lg border border-white/20
                       hover:bg-black/80 hover:scale-110 transition-all duration-200 disabled:opacity-50 z-10"
            aria-label={isFavorited ? "Remove from favorites" : "Save property"}
          >
            <Heart
              className={cn(
                "w-4 h-4 transition-colors",
                isFavorited ? "fill-red-500 text-red-500" : "text-white/80 hover:text-red-400"
              )}
            />
          </button>

          {/* Verified badge */}
          {(p.isVerified || isOwnerVerified) && (
            <div className="absolute bottom-3 left-3 flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-950/80 backdrop-blur-md text-[11px] font-bold text-emerald-300 border border-emerald-400/50">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              Verified Listing
            </div>
          )}
        </div>

        {/* Content Panel */}
        <div className="p-5 relative z-10">
          <div className="flex items-center justify-between mb-2">
            <span className="px-2.5 py-0.5 rounded-lg bg-white/5 border border-white/10 text-[11px] font-mono text-cyan-300 uppercase tracking-wider">
              {p.propertyType.replace("_", " ")}
            </span>
            {p.petsAllowed && (
              <span className="text-[11px] text-white/60 font-medium">🐾 Pets Welcomed</span>
            )}
          </div>

          <h3 className="font-display font-bold text-base leading-snug mb-1.5 line-clamp-1 text-white group-hover:text-cyan-300 transition-colors">
            {p.title}
          </h3>

          <div className="flex items-center gap-1 text-white/60 text-xs mb-3">
            <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span className="truncate">{p.locality}, {p.city}</span>
          </div>

          {/* Property Specs Pill Grid */}
          <div className="flex items-center gap-2 text-xs text-white/70 mb-4 flex-wrap">
            <span className="flex items-center gap-1 px-2 py-1 rounded-md bg-white/5 border border-white/5">
              <BedDouble className="w-3.5 h-3.5 text-cyan-400" />
              {p.bedrooms === 0 ? "Studio" : `${p.bedrooms} BHK`}
            </span>
            <span className="flex items-center gap-1 px-2 py-1 rounded-md bg-white/5 border border-white/5">
              <Bath className="w-3.5 h-3.5 text-cyan-400" />
              {p.bathrooms} Bath
            </span>
            <span className="flex items-center gap-1 px-2 py-1 rounded-md bg-white/5 border border-white/5">
              <Sofa className="w-3.5 h-3.5 text-cyan-400" />
              {furnishingLabels[p.furnishing]?.split("-")[0] ?? p.furnishing}
            </span>
            {p.hasParking && (
              <span className="flex items-center gap-1 px-2 py-1 rounded-md bg-white/5 border border-white/5">
                <Car className="w-3.5 h-3.5 text-cyan-400" />
                Parking
              </span>
            )}
          </div>

          {/* Price & View Action */}
          <div className="flex items-end justify-between pt-3 border-t border-white/10">
            <div>
              <div className="font-display font-bold text-xl text-white">
                {formatCurrency(p.rent)}
                <span className="text-xs font-normal text-white/50">/month</span>
              </div>
              {p.estimatedTotal && p.estimatedTotal > p.rent && (
                <div className="text-[11px] text-cyan-300/80 mt-0.5">
                  ~{formatCurrency(p.estimatedTotal)} all-in total
                </div>
              )}
            </div>
            <Button
              size="sm"
              className="rounded-xl text-xs h-8 px-3.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold shadow-holo-sm border border-cyan-400/40"
            >
              Explore <ArrowRight className="w-3 h-3 ml-1" />
            </Button>
          </div>
        </div>
      </Link>
    </div>
  );
}
