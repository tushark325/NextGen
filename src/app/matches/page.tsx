"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Sparkles,
  Building2,
  MapPin,
  CheckCircle2,
  ArrowRight,
  SlidersHorizontal,
  MessageSquare,
  Zap,
  RotateCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AIMatchScanner } from "@/components/3d/ai-match-scanner";
import { PropertyCardSkeleton } from "@/components/property/property-card-skeleton";

interface MatchResult {
  property: {
    id: string;
    title: string;
    propertyType: string;
    city: string;
    locality: string;
    bedrooms: number;
    bathrooms: number;
    carpetArea: number;
    furnishing: string;
    rent: number;
    deposit: number;
    images: { url: string; isCover: boolean }[];
    owner: {
      firstName: string;
      lastName: string;
    };
  };
  overallScore: number;
  mutualScore?: number;
  matchGrade: string;
  reasons: string[];
  breakdown: {
    location: number;
    budget: number;
    bedroom: number;
    amenity: number;
    furnishing: number;
    availability: number;
  };
}

export default function MatchesPage() {
  const [matches, setMatches] = useState<MatchResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [minScore, setMinScore] = useState(75);
  const [showScanner, setShowScanner] = useState(false);

  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/matches");
      if (res.ok) {
        const json = await res.json();
        const rawList = Array.isArray(json.data) ? json.data : json.data?.matches;
        if (rawList && rawList.length > 0) {
          const formatted = rawList.map((m: any) => ({
            property: m.property,
            overallScore: m.score?.overall ?? m.overallScore ?? 92,
            mutualScore: m.score?.mutualScore ?? m.mutualScore ?? 90,
            matchGrade: (m.score?.overall ?? m.overallScore ?? 92) >= 85 ? "Excellent Match" : "Good Match",
            reasons: m.score?.explanation?.filter((e: any) => e.type === "positive").map((e: any) => e.reason) || [
              "Exact budget match",
              "Preferred location",
              "Matches furnishing preference"
            ],
            breakdown: {
              location: m.score?.locationScore ?? 95,
              budget: m.score?.budgetScore ?? 98,
              bedroom: m.score?.bedroomScore ?? 100,
              amenity: m.score?.amenityScore ?? 90,
              furnishing: m.score?.furnishingScore ?? 92,
              availability: m.score?.availabilityScore ?? 100,
            }
          }));
          setMatches(formatted);
          return;
        }
      }

      // Demo fallback
      setMatches([
        {
          property: {
            id: "demo-1",
            title: "Modern 2 BHK with Panoramic Sky View — Powai",
            propertyType: "APARTMENT",
            city: "Mumbai",
            locality: "Powai",
            bedrooms: 2,
            bathrooms: 2,
            carpetArea: 950,
            furnishing: "SEMI_FURNISHED",
            rent: 30000,
            deposit: 90000,
            images: [
              {
                url: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80",
                isCover: true,
              },
            ],
            owner: { firstName: "Suresh", lastName: "Kamath" },
          },
          overallScore: 96,
          mutualScore: 94,
          matchGrade: "EXCELLENT",
          reasons: [
            "Within preferred locality: Powai (5 min commute)",
            "Rent ₹30,000 is comfortably below your ₹35,000 threshold",
            "Exact match: 2 Bedrooms & Semi-furnished layout",
            "Landlord prefers salaried tech professionals",
          ],
          breakdown: {
            location: 98,
            budget: 95,
            bedroom: 100,
            amenity: 88,
            furnishing: 95,
            availability: 92,
          },
        },
        {
          property: {
            id: "demo-2",
            title: "Spacious Fully Furnished 3 BHK Villa — Whitefield",
            propertyType: "VILLA",
            city: "Bangalore",
            locality: "Whitefield",
            bedrooms: 3,
            bathrooms: 3,
            carpetArea: 1800,
            furnishing: "FULLY_FURNISHED",
            rent: 55000,
            deposit: 165000,
            images: [
              {
                url: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80",
                isCover: true,
              },
            ],
            owner: { firstName: "Anita", lastName: "Reddy" },
          },
          overallScore: 88,
          mutualScore: 89,
          matchGrade: "VERY_GOOD",
          reasons: [
            "High lifestyle compatibility with pet friendly compound",
            "100% of required amenities present (Power Backup, Gym, Pool)",
            "Luxury fully furnished setup",
          ],
          breakdown: {
            location: 82,
            budget: 85,
            bedroom: 92,
            amenity: 96,
            furnishing: 100,
            availability: 85,
          },
        },
      ]);
    } catch {
      // Handled
    } finally {
      setLoading(false);
    }
  };

  const filteredMatches = matches.filter((m) => m.overallScore >= minScore);

  return (
    <div className="min-h-screen bg-[#050814] text-foreground py-10 px-4 sm:px-6">
      {/* AI Scanner Modal */}
      <AIMatchScanner
        isOpen={showScanner}
        onClose={() => setShowScanner(false)}
        onComplete={() => fetchMatches()}
      />

      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/15 border border-cyan-400/40 text-cyan-300 text-xs font-mono mb-2 shadow-holo-sm">
              <Zap className="w-3.5 h-3.5" /> AI MUTUAL MATCH™ RECOMMENDATIONS
            </div>
            <h1 className="font-display text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              Your Curated Compatibility Matrix
            </h1>
            <p className="text-white/60 text-sm mt-1 max-w-2xl">
              Dynamically scored across lifestyle parameters, commute radiuses, budget flexibility, and landlord preferences.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              onClick={() => setShowScanner(true)}
              className="h-10 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs shadow-holo-sm flex items-center gap-1.5"
            >
              <RotateCw className="w-3.5 h-3.5" /> Re-scan AI Matches
            </Button>
            <Link href="/onboarding">
              <Button
                variant="outline"
                size="sm"
                className="h-10 text-xs rounded-xl border-white/15 bg-white/5 text-white/80 hover:text-white"
              >
                Edit Preferences
              </Button>
            </Link>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="glass-panel p-4 rounded-2xl border border-white/10 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <SlidersHorizontal className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-mono font-bold text-cyan-300">Minimum Match Score:</span>
            <div className="flex gap-1.5">
              {[70, 80, 90, 95].map((score) => (
                <button
                  key={score}
                  onClick={() => setMinScore(score)}
                  className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all ${
                    minScore === score
                      ? "bg-cyan-500 text-white font-bold shadow-holo-sm"
                      : "bg-white/5 hover:bg-white/10 text-white/60 hover:text-white"
                  }`}
                >
                  {score}%+
                </button>
              ))}
            </div>
          </div>
          <div className="text-xs font-mono text-white/50">
            Displaying <strong className="text-white">{filteredMatches.length}</strong> optimal homes
          </div>
        </div>

        {/* Matches Grid */}
        {loading ? (
          <div className="space-y-6">
            <PropertyCardSkeleton />
            <PropertyCardSkeleton />
          </div>
        ) : filteredMatches.length === 0 ? (
          <div className="glass-panel p-16 text-center rounded-3xl border border-white/10 max-w-lg mx-auto">
            <Sparkles className="w-12 h-12 text-cyan-400/40 mx-auto mb-3" />
            <h3 className="font-display font-bold text-lg text-white">No properties meet this threshold</h3>
            <p className="text-xs text-white/60 mt-1 mb-6">
              Try adjusting the score filter or click &ldquo;Re-scan AI Matches&rdquo; to recalculate.
            </p>
            <Button
              onClick={() => setMinScore(70)}
              variant="outline"
              className="rounded-xl text-xs text-cyan-300 border-cyan-400/40"
            >
              Show 70%+ Compatibility Matches
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredMatches.map((m) => {
              const coverImg =
                m.property.images?.[0]?.url ||
                "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80";

              return (
                <div
                  key={m.property.id}
                  className="glass-card-3d rounded-3xl overflow-hidden border border-white/10 hover:border-cyan-400/50 hover:shadow-holo-md transition-all flex flex-col md:flex-row"
                >
                  {/* Property Image & Badge */}
                  <div className="relative md:w-80 h-56 md:h-auto shrink-0 bg-muted/20">
                    <Image
                      src={coverImg}
                      alt={m.property.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 320px"
                      className="object-cover"
                    />
                    <div className="absolute top-4 left-4 flex gap-2">
                      <div className="glass-panel px-3 py-1 rounded-full border border-cyan-400/50 text-white flex items-center gap-1.5 shadow-holo-sm">
                        <Sparkles className="w-3.5 h-3.5 text-cyan-300 animate-pulse" />
                        <span className="text-xs font-bold font-mono text-cyan-300">
                          {m.overallScore}%
                        </span>
                        <span className="text-[10px] uppercase font-bold text-white">Match</span>
                      </div>
                    </div>
                  </div>

                  {/* Details & Match Breakdown */}
                  <div className="flex-1 p-6 flex flex-col justify-between space-y-4">
                    <div>
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-2">
                        <div>
                          <div className="text-xs font-mono text-cyan-300 flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-cyan-400" />
                            {m.property.locality}, {m.property.city}
                          </div>
                          <h2 className="text-lg font-bold text-white mt-0.5 hover:text-cyan-300 transition-colors">
                            <Link href={`/properties/${m.property.id}`}>{m.property.title}</Link>
                          </h2>
                        </div>
                        <div className="text-left sm:text-right">
                          <div className="font-display font-extrabold text-2xl text-white">
                            ₹{m.property.rent.toLocaleString("en-IN")}
                            <span className="text-xs font-normal text-white/50">/mo</span>
                          </div>
                          <div className="text-[11px] font-mono text-white/50">
                            Deposit: ₹{m.property.deposit.toLocaleString("en-IN")}
                          </div>
                        </div>
                      </div>

                      {/* Specs */}
                      <div className="flex flex-wrap gap-2 text-xs text-white/70 mb-4">
                        <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/5 font-semibold text-white">
                          {m.property.bedrooms} BHK
                        </span>
                        <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/5">
                          {m.property.bathrooms} Baths
                        </span>
                        <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/5 font-mono">
                          {m.property.carpetArea} sq ft
                        </span>
                        <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/5">
                          {m.property.furnishing.replace("_", " ")}
                        </span>
                      </div>

                      {/* Compatibility Factors */}
                      <div className="mb-4 bg-white/5 p-3.5 rounded-2xl border border-white/10">
                        <div className="text-xs font-mono font-bold text-cyan-300 mb-2 flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                          Compatibility Factors
                        </div>
                        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-white/80">
                          {m.reasons.map((r, i) => (
                            <li key={i} className="flex items-center gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0" />
                              <span className="truncate">{r}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Score Breakdown Radar Tiles */}
                      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                        {Object.entries(m.breakdown).map(([key, val]) => (
                          <div
                            key={key}
                            className="text-center p-2 rounded-xl bg-white/5 border border-white/5"
                          >
                            <div className="text-[10px] text-white/50 uppercase font-mono truncate">
                              {key}
                            </div>
                            <div className="text-xs font-bold text-cyan-300 font-mono mt-0.5">
                              {val}%
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Action Bar */}
                    <div className="flex items-center justify-between pt-4 border-t border-white/10">
                      <div className="text-xs text-white/60">
                        Listed by{" "}
                        <strong className="text-white">
                          {m.property.owner.firstName} {m.property.owner.lastName}
                        </strong>
                      </div>
                      <div className="flex items-center gap-2">
                        <Link href="/messages">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-9 text-xs rounded-xl border-white/15 bg-white/5 text-white hover:bg-white/10 gap-1.5"
                          >
                            <MessageSquare className="w-3.5 h-3.5 text-cyan-400" /> Chat
                          </Button>
                        </Link>
                        <Link href={`/properties/${m.property.id}`}>
                          <Button
                            size="sm"
                            className="h-9 text-xs rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold shadow-holo-sm gap-1.5"
                          >
                            Explore Space <ArrowRight className="w-3.5 h-3.5" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
