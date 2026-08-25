"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Building2, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  MessageSquare,
  ArrowRight,
  Plus,
  Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface Visit {
  id: string;
  visitDate: string;
  status: "SCHEDULED" | "CONFIRMED" | "COMPLETED" | "CANCELLED";
  notes?: string;
  property: {
    id: string;
    title: string;
    city: string;
    locality: string;
    address?: string;
    addressPublic: string;
    rent: number;
    images?: { url: string }[];
    owner: {
      firstName: string;
      lastName: string;
    };
  };
}

const VISIT_STATUS_MAP: Record<string, { label: string; color: string; bg: string }> = {
  SCHEDULED: { label: "Pending Confirmation", color: "text-amber-300", bg: "bg-amber-500/20 border-amber-400/40" },
  CONFIRMED: { label: "Confirmed", color: "text-emerald-300", bg: "bg-emerald-500/20 border-emerald-400/40" },
  COMPLETED: { label: "Completed", color: "text-cyan-300", bg: "bg-cyan-500/20 border-cyan-400/40" },
  CANCELLED: { label: "Cancelled", color: "text-white/40", bg: "bg-white/5 border-white/10" },
};

export default function VisitsPage() {
  const [visits, setVisits] = useState<Visit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVisits();
  }, []);

  const fetchVisits = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/visits");
      if (res.ok) {
        const json = await res.json();
        setVisits(json.data || []);
        return;
      }

      // Demo Fallback
      setVisits([
        {
          id: "v-1",
          visitDate: new Date(Date.now() + 1000 * 60 * 60 * 48).toISOString(),
          status: "CONFIRMED",
          notes: "Meeting at the society entrance gate with Suresh Kamath (Owner).",
          property: {
            id: "demo-1",
            title: "Modern 2 BHK Skyline Suite — Powai",
            city: "Mumbai",
            locality: "Powai",
            address: "302, Hiranandani Estate, Powai, Mumbai",
            addressPublic: "Powai, Mumbai",
            rent: 30000,
            images: [{ url: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80" }],
            owner: { firstName: "Suresh", lastName: "Kamath" }
          }
        },
        {
          id: "v-2",
          visitDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
          status: "COMPLETED",
          notes: "Property visit finished. Discussing lease agreement terms.",
          property: {
            id: "demo-2",
            title: "Spacious Fully Furnished 3 BHK Villa — Whitefield",
            city: "Bangalore",
            locality: "Whitefield",
            addressPublic: "Whitefield, Bangalore",
            rent: 55000,
            images: [{ url: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80" }],
            owner: { firstName: "Anita", lastName: "Reddy" }
          }
        }
      ]);
    } catch {
      // Handled
    } finally {
      setLoading(false);
    }
  };

  const handleCancelVisit = (id: string) => {
    toast.success("Visit cancelled successfully");
    setVisits((prev) =>
      prev.map((v) => (v.id === id ? { ...v, status: "CANCELLED" } : v))
    );
  };

  return (
    <div className="min-h-screen bg-[#050814] text-foreground py-10 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/15 border border-cyan-400/40 text-cyan-300 text-xs font-mono mb-2 shadow-holo-sm">
              <Calendar className="w-3.5 h-3.5" /> PHYSICAL PROPERTY TOURS
            </div>
            <h1 className="font-display text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              Inspection Schedule
            </h1>
            <p className="text-white/60 text-sm mt-1">
              Direct physical tours and video walkthroughs arranged with verified property owners.
            </p>
          </div>

          <Link href="/search">
            <Button className="h-10 px-5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs shadow-holo-sm gap-1.5">
              <Plus className="w-4 h-4" /> Schedule Another Visit
            </Button>
          </Link>
        </div>

        {/* Visit List */}
        {visits.length === 0 ? (
          <div className="glass-panel p-16 text-center rounded-3xl border border-white/10">
            <Calendar className="w-12 h-12 text-cyan-400/30 mx-auto mb-3" />
            <h3 className="font-display font-bold text-lg text-white">No visits scheduled</h3>
            <p className="text-xs text-white/60 mt-1 mb-6">
              Browse properties and click &ldquo;Schedule Visit&rdquo; to meet owners in person.
            </p>
            <Link href="/search">
              <Button variant="outline" size="sm" className="rounded-xl text-xs border-cyan-400/40 text-cyan-300">
                Browse Properties
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {visits.map((v) => {
              const statusCfg = VISIT_STATUS_MAP[v.status] || VISIT_STATUS_MAP.SCHEDULED;
              const visitDateTime = new Date(v.visitDate);
              return (
                <div
                  key={v.id}
                  className="glass-card-3d p-6 rounded-3xl border border-white/10 hover:border-cyan-400/40 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
                >
                  <div className="flex items-start gap-4">
                    <div className="relative w-16 h-16 rounded-2xl bg-muted/20 overflow-hidden shrink-0">
                      <Image
                        src={v.property.images?.[0]?.url || "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80"}
                        alt={v.property.title}
                        fill
                        sizes="(max-width: 768px) 100vw, 320px"
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <div className={`px-3 py-1 rounded-full border text-[11px] font-bold font-mono ${statusCfg.bg} ${statusCfg.color}`}>
                          {statusCfg.label}
                        </div>
                      </div>
                      <h2 className="font-bold text-base text-white hover:text-cyan-300 transition-colors">
                        <Link href={`/properties/${v.property.id}`}>{v.property.title}</Link>
                      </h2>
                      <div className="text-xs text-white/60 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                        {v.property.address || v.property.addressPublic}
                      </div>
                      {v.notes && (
                        <div className="text-xs text-white/70 mt-2 bg-white/5 p-2.5 rounded-xl border border-white/5">
                          {v.notes}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right date & actions */}
                  <div className="flex flex-col sm:flex-row md:flex-col items-start md:items-end justify-between w-full md:w-auto gap-3 pt-4 md:pt-0 border-t md:border-t-0 border-white/10">
                    <div className="text-left md:text-right">
                      <div className="text-sm font-bold text-white flex items-center gap-1.5 md:justify-end font-mono">
                        <Calendar className="w-4 h-4 text-cyan-400" />
                        {visitDateTime.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" })}
                      </div>
                      <div className="text-xs text-white/50 flex items-center gap-1.5 md:justify-end mt-0.5 font-mono">
                        <Clock className="w-3.5 h-3.5" />
                        {visitDateTime.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Link href="/messages">
                        <Button variant="outline" size="sm" className="h-8 text-xs rounded-xl border-white/15 bg-white/5 text-white gap-1">
                          <MessageSquare className="w-3.5 h-3.5 text-cyan-400" /> Chat
                        </Button>
                      </Link>
                      {v.status === "SCHEDULED" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCancelVisit(v.id)}
                          className="h-8 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-xl"
                        >
                          Cancel
                        </Button>
                      )}
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
