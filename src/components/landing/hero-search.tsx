"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, MapPin, Sparkles, Building2, SlidersHorizontal, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { INDIAN_CITIES, PROPERTY_TYPES } from "@/types";

export function HeroSearch() {
  const router = useRouter();
  const [city, setCity] = useState("Mumbai");
  const [budget, setBudget] = useState(45000);
  const [propertyType, setPropertyType] = useState("APARTMENT");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (city) params.set("city", city);
    if (budget) params.set("maxRent", String(budget));
    if (propertyType) params.set("type", propertyType);
    router.push(`/search?${params.toString()}`);
  };

  return (
    <div className="relative w-full max-w-4xl mx-auto">
      {/* Holographic glowing aura behind console */}
      <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/30 via-violet-600/30 to-pink-500/30 rounded-3xl blur-xl opacity-75 animate-pulse-glow" />

      {/* Main Console Box */}
      <form
        onSubmit={handleSearch}
        className="relative glass-panel rounded-3xl p-4 sm:p-6 border border-cyan-400/30 shadow-holo-lg scanline-effect"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          {/* City Selection */}
          <div className="space-y-1.5 text-left">
            <label className="text-[11px] font-mono font-bold uppercase tracking-wider text-cyan-300 flex items-center gap-1">
              <MapPin className="w-3 h-3 text-cyan-400" />
              Target City
            </label>
            <div className="relative">
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full h-12 px-4 rounded-xl bg-white/5 border border-white/15 text-white font-semibold text-sm focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 cursor-pointer transition-all"
              >
                <option value="" className="bg-[#0c1228] text-white">All Indian Metros</option>
                {INDIAN_CITIES.map((c) => (
                  <option key={c} value={c} className="bg-[#0c1228] text-white">
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Budget Interactive Slider */}
          <div className="space-y-1.5 text-left">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-mono font-bold uppercase tracking-wider text-cyan-300 flex items-center gap-1">
                <SlidersHorizontal className="w-3 h-3 text-cyan-400" />
                Max Budget
              </label>
              <span className="font-display font-bold text-sm text-cyan-300">
                ₹{budget.toLocaleString("en-IN")}/mo
              </span>
            </div>
            <div className="h-12 px-4 rounded-xl bg-white/5 border border-white/15 flex items-center">
              <input
                type="range"
                min={10000}
                max={150000}
                step={2500}
                value={budget}
                onChange={(e) => setBudget(Number(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer"
              />
            </div>
          </div>

          {/* Property Type */}
          <div className="space-y-1.5 text-left">
            <label className="text-[11px] font-mono font-bold uppercase tracking-wider text-cyan-300 flex items-center gap-1">
              <Building2 className="w-3 h-3 text-cyan-400" />
              Property Architecture
            </label>
            <select
              value={propertyType}
              onChange={(e) => setPropertyType(e.target.value)}
              className="w-full h-12 px-4 rounded-xl bg-white/5 border border-white/15 text-white font-semibold text-sm focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 cursor-pointer transition-all"
            >
              <option value="" className="bg-[#0c1228] text-white">Any Configuration</option>
              {PROPERTY_TYPES.map((pt) => (
                <option key={pt.value} value={pt.value} className="bg-[#0c1228] text-white">
                  {pt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Action Button & Quick Filters */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-3 border-t border-white/10">
          {/* Quick presets */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] font-mono text-white/50">Curated:</span>
            {[
              { label: "Powai 2BHK", city: "Mumbai", type: "APARTMENT" },
              { label: "Whitefield Villa", city: "Bangalore", type: "VILLA" },
              { label: "Hinjewadi Studio", city: "Pune", type: "STUDIO" },
            ].map((p, i) => (
              <button
                key={i}
                type="button"
                onClick={() => {
                  setCity(p.city);
                  setPropertyType(p.type);
                  router.push(`/search?city=${p.city}&type=${p.type}`);
                }}
                className="text-xs px-2.5 py-1 rounded-lg bg-white/5 hover:bg-cyan-500/20 border border-white/10 hover:border-cyan-400/40 text-white/80 hover:text-cyan-300 transition-all font-medium"
              >
                {p.label}
              </button>
            ))}
          </div>

          <Button
            type="submit"
            size="lg"
            className="w-full sm:w-auto h-12 px-8 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold text-sm shadow-holo-md border border-cyan-400/50 flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-cyan-200" />
            Discover Matches
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </form>
    </div>
  );
}
