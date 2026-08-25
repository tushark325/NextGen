"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Heart, Building2, Search, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PropertyCard } from "@/components/property/property-card";
import { PropertyCardSkeleton } from "@/components/property/property-card-skeleton";

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/favorites");
      if (res.ok) {
        const json = await res.json();
        setFavorites(json.data || []);
        return;
      }

      // Demo Fallback
      setFavorites([
        {
          id: "demo-1",
          title: "Modern 2 BHK Skyline Suite — Powai",
          propertyType: "APARTMENT",
          city: "Mumbai",
          locality: "Powai",
          addressPublic: "Powai, Mumbai",
          bedrooms: 2,
          bathrooms: 2,
          carpetArea: 950,
          furnishing: "SEMI_FURNISHED",
          rent: 30000,
          deposit: 90000,
          maintenance: 3500,
          hasParking: true,
          hasLift: true,
          hasPowerBackup: true,
          petsAllowed: false,
          isVerified: true,
          images: [
            { id: "img-1", url: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80", isCover: true, alt: "Living Room" }
          ],
          owner: {
            id: "landlord-1",
            firstName: "Suresh",
            lastName: "Kamath",
            avatarUrl: null,
            landlordProfile: { identityVerified: true, rating: 4.8, ratingCount: 23 }
          },
          availability: {
            status: "AVAILABLE_NOW",
            availableFrom: new Date().toISOString()
          },
          matchScore: 94,
          isSaved: true
        },
        {
          id: "demo-2",
          title: "Spacious Fully Furnished 3 BHK Villa — Whitefield",
          propertyType: "VILLA",
          city: "Bangalore",
          locality: "Whitefield",
          addressPublic: "Whitefield, Bangalore",
          bedrooms: 3,
          bathrooms: 3,
          carpetArea: 1800,
          furnishing: "FULLY_FURNISHED",
          rent: 55000,
          deposit: 165000,
          maintenance: 5000,
          hasParking: true,
          hasLift: false,
          hasPowerBackup: true,
          petsAllowed: true,
          isVerified: true,
          images: [
            { id: "img-2", url: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80", isCover: true, alt: "Villa Exterior" }
          ],
          owner: {
            id: "landlord-2",
            firstName: "Anita",
            lastName: "Reddy",
            avatarUrl: null,
            landlordProfile: { identityVerified: true, rating: 4.9, ratingCount: 18 }
          },
          availability: {
            status: "AVAILABLE_NOW",
            availableFrom: new Date().toISOString()
          },
          matchScore: 89,
          isSaved: true
        }
      ]);
    } catch {
      // Handled
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFavorite = (propertyId: string, isSaved: boolean) => {
    if (!isSaved) {
      setFavorites((prev) => prev.filter((p) => p.id !== propertyId));
    }
  };

  return (
    <div className="min-h-screen bg-[#050814] text-foreground py-10 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/15 border border-rose-400/40 text-rose-300 text-xs font-mono mb-2 shadow-holo-sm">
              <Heart className="w-3.5 h-3.5 fill-rose-400 text-rose-400" /> SHORTLISTED SPATIAL ASSETS
            </div>
            <h1 className="font-display text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              Saved Living Spaces
            </h1>
            <p className="text-white/60 text-sm mt-1">
              Shortlisted properties ready for side-by-side 3D comparison and direct applications.
            </p>
          </div>

          <Link href="/search">
            <Button size="sm" variant="outline" className="h-10 px-4 rounded-xl border-cyan-400/40 text-cyan-300 bg-white/5 hover:bg-cyan-500/10 gap-1.5 text-xs font-semibold">
              <Search className="w-3.5 h-3.5" /> Browse More Homes
            </Button>
          </Link>
        </div>

        {/* Content */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <PropertyCardSkeleton />
            <PropertyCardSkeleton />
            <PropertyCardSkeleton />
          </div>
        ) : favorites.length === 0 ? (
          <div className="glass-panel p-16 text-center rounded-3xl border border-white/10 max-w-lg mx-auto">
            <Heart className="w-12 h-12 text-rose-400/30 mx-auto mb-3" />
            <h3 className="font-display font-bold text-lg text-white">No saved properties yet</h3>
            <p className="text-xs text-white/60 mt-1 mb-6">
              Click the heart icon on any 3D property card or detail page to bookmark it.
            </p>
            <Link href="/search">
              <Button className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white gap-2 font-bold text-xs h-10 px-6 rounded-xl shadow-holo-sm">
                Explore Available Rentals <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {favorites.map((prop) => (
              <PropertyCard
                key={prop.id}
                property={prop}
                onSaveToggle={handleToggleFavorite}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
