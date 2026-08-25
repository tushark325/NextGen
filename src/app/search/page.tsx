"use client";

import { useState, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Search,
  SlidersHorizontal,
  MapPin,
  X,
  Check,
  ChevronDown,
  LayoutGrid,
  Map as MapIcon,
  Building2,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { PropertyCard } from "@/components/property/property-card";
import { PropertyCardSkeleton } from "@/components/property/property-card-skeleton";
import { HolographicMapScene } from "@/components/3d/holographic-map-scene";
import { cn } from "@/lib/utils";
import { INDIAN_CITIES, PROPERTY_TYPES, FURNISHING_TYPES } from "@/types";

type ViewMode = "grid" | "map" | "city";

const NEIGHBORHOOD_DENSITY = [
  { name: "Powai", city: "Mumbai", properties: 324, avgRent: 28000, avgMatch: 92, tag: "Tech & Lakeview" },
  { name: "Whitefield", city: "Bangalore", properties: 412, avgRent: 42000, avgMatch: 89, tag: "IT Corridors" },
  { name: "Hinjewadi", city: "Pune", properties: 256, avgRent: 18000, avgMatch: 86, tag: "Infotech Hub" },
  { name: "Cyber City", city: "Gurgaon", properties: 198, avgRent: 48000, avgMatch: 94, tag: "Corporate Center" },
  { name: "Indiranagar", city: "Bangalore", properties: 175, avgRent: 52000, avgMatch: 91, tag: "Lifestyle & Metro" },
  { name: "Bandra West", city: "Mumbai", properties: 142, avgRent: 85000, avgMatch: 88, tag: "Luxury Coastal" },
];

function SearchPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");

  // Filter state
  const [filters, setFilters] = useState({
    q: searchParams.get("q") ?? "",
    city: searchParams.get("city") ?? "",
    maxRent: searchParams.get("maxRent") ?? "",
    minBedrooms: searchParams.get("minBedrooms") ?? "",
    type: searchParams.getAll("type"),
    furnishing: searchParams.getAll("furnishing"),
    hasParking: searchParams.get("hasParking") === "true",
    petsAllowed: searchParams.get("petsAllowed") === "true",
    isVerified: searchParams.get("isVerified") === "true",
    sortBy: searchParams.get("sortBy") ?? "best_match",
  });

  // Build query string
  const queryString = new URLSearchParams(
    Object.entries(filters).flatMap(([k, v]) => {
      if (Array.isArray(v)) return v.map((val) => [k, val]);
      if (v === true) return [[k, "true"]];
      if (!v) return [];
      return [[k, String(v)]];
    })
  ).toString();

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["properties", queryString],
    queryFn: async () => {
      const res = await fetch(`/api/properties?${queryString}&limit=24`);
      const json = await res.json();
      if (!json.success) throw new Error(json.error?.message);
      return json;
    },
    staleTime: 30 * 1000,
  });

  const properties = data?.data ?? [];
  const total = data?.meta?.total ?? properties.length;

  const updateFilter = (key: string, value: unknown) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const toggleArrayFilter = (key: string, value: string) => {
    setFilters((prev) => {
      const arr = prev[key as keyof typeof prev] as string[];
      return {
        ...prev,
        [key]: arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value],
      };
    });
  };

  const clearAll = () => {
    setFilters({
      q: "",
      city: "",
      maxRent: "",
      minBedrooms: "",
      type: [],
      furnishing: [],
      hasParking: false,
      petsAllowed: false,
      isVerified: false,
      sortBy: "best_match",
    });
  };

  const activeFilterCount = [
    filters.city,
    filters.maxRent,
    filters.minBedrooms,
    ...filters.type,
    ...filters.furnishing,
    filters.hasParking,
    filters.petsAllowed,
    filters.isVerified,
  ].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-[#050814] text-foreground pb-20">
      {/* Search Header Console */}
      <div className="sticky top-0 z-40 bg-[rgba(8,12,30,0.85)] backdrop-blur-2xl border-b border-white/10 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center gap-3">
            {/* Search Input */}
            <div className="flex-1 relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-400" />
              <Input
                className="pl-10 rounded-xl h-11 bg-white/5 border-white/15 text-white placeholder:text-white/40 focus:border-cyan-400 focus:ring-cyan-400/20"
                placeholder="Search by locality, tech park, metro station, or lifestyle..."
                value={filters.q}
                onChange={(e) => updateFilter("q", e.target.value)}
              />
            </div>

            {/* City Select */}
            <select
              className="h-11 px-3.5 rounded-xl border border-white/15 bg-white/5 text-white text-xs font-semibold cursor-pointer focus:outline-none focus:border-cyan-400 hidden sm:block"
              value={filters.city}
              onChange={(e) => updateFilter("city", e.target.value)}
            >
              <option value="" className="bg-[#0b1026] text-white">All Metros</option>
              {INDIAN_CITIES.map((c) => (
                <option key={c} value={c} className="bg-[#0b1026] text-white">
                  {c}
                </option>
              ))}
            </select>

            {/* View Switcher Tabs */}
            <div className="flex items-center bg-white/5 border border-white/10 p-1 rounded-xl">
              <button
                onClick={() => setViewMode("grid")}
                className={cn(
                  "p-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors",
                  viewMode === "grid"
                    ? "bg-cyan-500 text-white shadow-holo-sm font-bold"
                    : "text-white/60 hover:text-white"
                )}
                title="3D Spatial Grid"
              >
                <LayoutGrid className="w-4 h-4" />
                <span className="hidden md:inline">Grid</span>
              </button>
              <button
                onClick={() => setViewMode("map")}
                className={cn(
                  "p-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors",
                  viewMode === "map"
                    ? "bg-cyan-500 text-white shadow-holo-sm font-bold"
                    : "text-white/60 hover:text-white"
                )}
                title="3D Spatial Map"
              >
                <MapIcon className="w-4 h-4" />
                <span className="hidden md:inline">3D Map</span>
              </button>
              <button
                onClick={() => setViewMode("city")}
                className={cn(
                  "p-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors",
                  viewMode === "city"
                    ? "bg-cyan-500 text-white shadow-holo-sm font-bold"
                    : "text-white/60 hover:text-white"
                )}
                title="Neighborhood Density"
              >
                <Building2 className="w-4 h-4" />
                <span className="hidden md:inline">City View</span>
              </button>
            </div>

            {/* Filters Button */}
            <Button
              variant="outline"
              className="rounded-xl h-11 shrink-0 border-white/15 bg-white/5 hover:bg-white/10 text-white font-medium text-xs"
              onClick={() => setShowFilters(!showFilters)}
            >
              <SlidersHorizontal className="w-3.5 h-3.5 mr-1.5 text-cyan-400" />
              Filters
              {activeFilterCount > 0 && (
                <Badge className="ml-1.5 text-[10px] px-1.5 py-0 bg-cyan-500 text-white">
                  {activeFilterCount}
                </Badge>
              )}
            </Button>
          </div>

          {/* Expanded Filter Panel */}
          {showFilters && (
            <div className="mt-4 p-5 rounded-2xl glass-panel border border-cyan-400/30 shadow-holo-md animate-fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {/* Max Rent */}
                <div>
                  <label className="text-[11px] font-mono uppercase text-cyan-300 mb-1.5 block">Max Rent (₹)</label>
                  <Input
                    type="number"
                    placeholder="e.g. 45000"
                    value={filters.maxRent}
                    onChange={(e) => updateFilter("maxRent", e.target.value)}
                    className="rounded-xl h-10 text-xs bg-white/5 border-white/15 text-white"
                  />
                </div>

                {/* Min Bedrooms */}
                <div>
                  <label className="text-[11px] font-mono uppercase text-cyan-300 mb-1.5 block">Bedrooms</label>
                  <div className="flex gap-1.5">
                    {["", "1", "2", "3", "4+"].map((b) => (
                      <button
                        key={b}
                        onClick={() => updateFilter("minBedrooms", b === "4+" ? "4" : b)}
                        className={cn(
                          "flex-1 h-10 rounded-xl border text-xs font-semibold transition-all",
                          filters.minBedrooms === (b === "4+" ? "4" : b)
                            ? "bg-cyan-500 text-white border-cyan-400 shadow-holo-sm font-bold"
                            : "bg-white/5 border-white/10 text-white/70 hover:border-cyan-400/40"
                        )}
                      >
                        {b || "Any"}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Property Type */}
                <div>
                  <label className="text-[11px] font-mono uppercase text-cyan-300 mb-1.5 block">Architecture Type</label>
                  <div className="flex flex-wrap gap-1.5">
                    {PROPERTY_TYPES.slice(0, 4).map((pt) => (
                      <button
                        key={pt.value}
                        onClick={() => toggleArrayFilter("type", pt.value)}
                        className={cn(
                          "px-2.5 py-1 rounded-lg border text-[11px] font-medium transition-all",
                          filters.type.includes(pt.value)
                            ? "bg-cyan-500 text-white border-cyan-400 font-bold"
                            : "bg-white/5 border-white/10 text-white/70 hover:border-cyan-400/40"
                        )}
                      >
                        {pt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Quick Toggles */}
                <div>
                  <label className="text-[11px] font-mono uppercase text-cyan-300 mb-1.5 block">Preferences</label>
                  <div className="space-y-1.5">
                    {[
                      { key: "hasParking", label: "🚗 Covered Parking" },
                      { key: "petsAllowed", label: "🐾 Pet Friendly" },
                      { key: "isVerified", label: "✓ Verified Only" },
                    ].map((opt) => (
                      <button
                        key={opt.key}
                        onClick={() => updateFilter(opt.key, !filters[opt.key as keyof typeof filters])}
                        className={cn(
                          "w-full flex items-center justify-between px-3 py-1.5 rounded-xl border text-xs font-medium transition-all",
                          filters[opt.key as keyof typeof filters]
                            ? "bg-cyan-500/20 border-cyan-400 text-cyan-300 font-bold"
                            : "bg-white/5 border-white/10 text-white/70 hover:border-white/20"
                        )}
                      >
                        <span>{opt.label}</span>
                        {filters[opt.key as keyof typeof filters] && <Check className="w-3 h-3 text-cyan-400" />}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {activeFilterCount > 0 && (
                <div className="mt-4 pt-3 border-t border-white/10 flex justify-end">
                  <button
                    onClick={clearAll}
                    className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 font-semibold"
                  >
                    <X className="w-3.5 h-3.5" /> Clear all filters
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Main Results Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6">
        {/* Results Metadata Bar */}
        <div className="flex items-center justify-between mb-6">
          <div className="text-xs font-mono text-white/60">
            {isLoading
              ? "Scanning spatial database..."
              : `Found ${total} curated properties ${filters.city ? `in ${filters.city}` : "across India"}`}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-white/50 hidden sm:inline">Sort:</span>
            <select
              className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/15 text-xs text-white cursor-pointer focus:outline-none"
              value={filters.sortBy}
              onChange={(e) => updateFilter("sortBy", e.target.value)}
            >
              <option value="best_match" className="bg-[#0b1026]">⚡ Best AI Match</option>
              <option value="newest" className="bg-[#0b1026]">Newest Listings</option>
              <option value="lowest_rent" className="bg-[#0b1026]">Lowest Rent</option>
              <option value="highest_rent" className="bg-[#0b1026]">Highest Rent</option>
            </select>
          </div>
        </div>

        {/* ── VIEW 1: 3D SPATIAL GRID ───────────────────────────────────────── */}
        {viewMode === "grid" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {isLoading || isFetching
              ? Array.from({ length: 8 }).map((_, i) => <PropertyCardSkeleton key={i} />)
              : properties.map((p: any) => <PropertyCard key={p.id} property={p} />)}
          </div>
        )}

        {/* ── VIEW 2: 3D HOLOGRAPHIC SPATIAL MAP ──────────────────────────── */}
        {viewMode === "map" && (
          <div className="space-y-6">
            <HolographicMapScene
              properties={properties}
              selectedCity={filters.city || "All Metros"}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {properties.slice(0, 6).map((p: any) => (
                <PropertyCard key={p.id} property={p} />
              ))}
            </div>
          </div>
        )}

        {/* ── VIEW 3: NEIGHBORHOOD DENSITY & CITY VIEW ────────────────────── */}
        {viewMode === "city" && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {NEIGHBORHOOD_DENSITY.map((nh, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    updateFilter("city", nh.city);
                    updateFilter("q", nh.name);
                    setViewMode("grid");
                  }}
                  className="glass-card-3d p-6 cursor-pointer group hover:border-cyan-400/60 hover:shadow-holo-md"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/15 border border-cyan-400/30 text-cyan-300 text-[10px] font-mono">
                      {nh.tag}
                    </span>
                    <span className="text-xs font-mono text-emerald-400 font-bold">
                      {nh.avgMatch}% Avg Match
                    </span>
                  </div>

                  <h3 className="font-display font-bold text-xl text-white mb-1 group-hover:text-cyan-300 transition-colors">
                    {nh.name}
                  </h3>
                  <div className="text-xs text-white/50 mb-4">{nh.city} Tech Corridor</div>

                  <div className="grid grid-cols-2 gap-3 pt-3 border-t border-white/10 text-xs">
                    <div>
                      <div className="text-white/50">Active Inventory</div>
                      <div className="font-bold text-white font-mono mt-0.5">{nh.properties} Homes</div>
                    </div>
                    <div>
                      <div className="text-white/50">Average Rent</div>
                      <div className="font-bold text-cyan-300 font-mono mt-0.5">
                        ₹{nh.avgRent.toLocaleString("en-IN")}/mo
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && properties.length === 0 && (
          <div className="text-center py-24 glass-panel rounded-3xl p-8 max-w-md mx-auto border border-white/10">
            <MapPin className="w-12 h-12 text-cyan-400/40 mx-auto mb-3" />
            <h2 className="font-display text-lg font-bold text-white mb-1">No matching homes found</h2>
            <p className="text-xs text-white/60 mb-6">
              Try adjusting your max budget or searching a different city sector.
            </p>
            <Button
              onClick={clearAll}
              className="bg-cyan-500 hover:bg-cyan-400 text-white rounded-xl text-xs font-semibold"
            >
              Reset Search Parameters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#050814] flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin" />
        </div>
      }
    >
      <SearchPageContent />
    </Suspense>
  );
}
