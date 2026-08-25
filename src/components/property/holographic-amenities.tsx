"use client";

import React from "react";
import {
  Car,
  Dumbbell,
  Waves,
  Shield,
  Wifi,
  ArrowUpFromLine,
  Zap,
  Trees,
  CheckCircle2,
  Lock,
} from "lucide-react";

interface AmenityItem {
  id?: string;
  name: string;
  category?: string | null;
  detail?: string;
}

const AMENITY_ICONS: Record<string, { icon: any; color: string; bg: string }> = {
  "Parking": { icon: Car, color: "text-cyan-400", bg: "from-cyan-500/20 to-blue-500/10" },
  "Covered Parking": { icon: Car, color: "text-cyan-400", bg: "from-cyan-500/20 to-blue-500/10" },
  "Gym": { icon: Dumbbell, color: "text-violet-400", bg: "from-violet-500/20 to-purple-500/10" },
  "Fitness Center": { icon: Dumbbell, color: "text-violet-400", bg: "from-violet-500/20 to-purple-500/10" },
  "Swimming Pool": { icon: Waves, color: "text-sky-400", bg: "from-sky-500/20 to-cyan-500/10" },
  "24/7 Security": { icon: Shield, color: "text-emerald-400", bg: "from-emerald-500/20 to-teal-500/10" },
  "Security": { icon: Shield, color: "text-emerald-400", bg: "from-emerald-500/20 to-teal-500/10" },
  "High Speed WiFi": { icon: Wifi, color: "text-pink-400", bg: "from-pink-500/20 to-rose-500/10" },
  "Internet": { icon: Wifi, color: "text-pink-400", bg: "from-pink-500/20 to-rose-500/10" },
  "Elevator / Lift": { icon: ArrowUpFromLine, color: "text-amber-400", bg: "from-amber-500/20 to-yellow-500/10" },
  "Lift": { icon: ArrowUpFromLine, color: "text-amber-400", bg: "from-amber-500/20 to-yellow-500/10" },
  "Power Backup": { icon: Zap, color: "text-yellow-400", bg: "from-yellow-500/20 to-amber-500/10" },
  "Garden / Park": { icon: Trees, color: "text-emerald-400", bg: "from-emerald-500/20 to-green-500/10" },
};

export function HolographicAmenities({ amenities = [] }: { amenities: AmenityItem[] }) {
  if (amenities.length === 0) return null;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5">
      {amenities.map((item, idx) => {
        const config = AMENITY_ICONS[item.name] || {
          icon: CheckCircle2,
          color: "text-cyan-400",
          bg: "from-cyan-500/15 to-indigo-500/10",
        };
        const Icon = config.icon;

        return (
          <div
            key={idx}
            className="group relative p-4 rounded-2xl bg-[rgba(10,16,40,0.7)] backdrop-blur-xl border border-white/10 hover:border-cyan-400/50 hover:shadow-holo-sm transition-all duration-300 flex flex-col items-center text-center cursor-default transform hover:-translate-y-1"
          >
            {/* Holographic icon backing */}
            <div
              className={`w-12 h-12 rounded-xl bg-gradient-to-br ${config.bg} border border-white/10 flex items-center justify-center mb-2.5 shadow-sm group-hover:scale-110 transition-transform duration-300`}
            >
              <Icon className={`w-6 h-6 ${config.color}`} />
            </div>

            <div className="font-semibold text-xs text-white group-hover:text-cyan-300 transition-colors">
              {item.name}
            </div>

            <div className="text-[10px] text-white/50 mt-0.5 font-mono">Verified In-Unit</div>
          </div>
        );
      })}
    </div>
  );
}
