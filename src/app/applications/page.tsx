"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { 
  FileText, 
  Building2, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Calendar, 
  ShieldCheck, 
  AlertCircle, 
  ArrowRight,
  MessageSquare,
  Sparkles,
  Layers,
  UserCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { formatRelativeTime } from "@/lib/utils";

interface Application {
  id: string;
  status: "SUBMITTED" | "UNDER_REVIEW" | "VISIT_SCHEDULED" | "APPROVED" | "REJECTED" | "LEASE_SIGNED" | "CANCELLED";
  proposedRent?: number;
  moveInDate?: string;
  leaseMonths?: number;
  message?: string;
  createdAt: string;
  property: {
    id: string;
    title: string;
    city: string;
    locality: string;
    rent: number;
    deposit: number;
    images?: { url: string }[];
    owner: {
      firstName: string;
      lastName: string;
    };
  };
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: any }> = {
  SUBMITTED: { label: "Submitted", color: "text-cyan-300", bg: "bg-cyan-500/20 border-cyan-400/40", icon: Clock },
  UNDER_REVIEW: { label: "Under Review", color: "text-amber-300", bg: "bg-amber-500/20 border-amber-400/40", icon: AlertCircle },
  VISIT_SCHEDULED: { label: "Visit Scheduled", color: "text-violet-300", bg: "bg-violet-500/20 border-violet-400/40", icon: Calendar },
  APPROVED: { label: "Approved", color: "text-emerald-300", bg: "bg-emerald-500/20 border-emerald-400/40", icon: CheckCircle2 },
  LEASE_SIGNED: { label: "Lease Signed", color: "text-cyan-300", bg: "bg-cyan-500/25 border-cyan-400/50", icon: UserCheck },
  REJECTED: { label: "Declined", color: "text-rose-300", bg: "bg-rose-500/20 border-rose-400/40", icon: XCircle },
  CANCELLED: { label: "Withdrawn", color: "text-white/40", bg: "bg-white/5 border-white/10", icon: XCircle },
};

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"ALL" | "ACTIVE" | "COMPLETED">("ALL");

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/applications");
      if (res.ok) {
        const json = await res.json();
        setApplications(json.data || []);
        return;
      }

      // Demo fallback
      setApplications([
        {
          id: "app-1",
          status: "APPROVED",
          proposedRent: 30000,
          moveInDate: "2025-09-01",
          leaseMonths: 11,
          message: "Looking forward to moving in. My office is 5 mins away in Powai.",
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
          property: {
            id: "demo-1",
            title: "Modern 2 BHK Skyline Suite — Powai",
            city: "Mumbai",
            locality: "Powai",
            rent: 30000,
            deposit: 90000,
            images: [{ url: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80" }],
            owner: { firstName: "Suresh", lastName: "Kamath" }
          }
        },
        {
          id: "app-2",
          status: "UNDER_REVIEW",
          proposedRent: 55000,
          moveInDate: "2025-09-15",
          leaseMonths: 12,
          message: "We have a trained pet retriever and are looking for a long stay.",
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
          property: {
            id: "demo-2",
            title: "Spacious Fully Furnished 3 BHK Villa — Whitefield",
            city: "Bangalore",
            locality: "Whitefield",
            rent: 55000,
            deposit: 165000,
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

  const handleCancelApplication = async (appId: string) => {
    try {
      const res = await fetch(`/api/applications/${appId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "CANCELLED" }),
      });
      if (res.ok) {
        toast.success("Application withdrawn successfully");
        setApplications((prev) =>
          prev.map((a) => (a.id === appId ? { ...a, status: "CANCELLED" } : a))
        );
      }
    } catch {
      toast.error("Failed to cancel application");
    }
  };

  const filteredApps = applications.filter((app) => {
    if (activeTab === "ACTIVE") return ["SUBMITTED", "UNDER_REVIEW", "VISIT_SCHEDULED"].includes(app.status);
    if (activeTab === "COMPLETED") return ["APPROVED", "LEASE_SIGNED", "REJECTED", "CANCELLED"].includes(app.status);
    return true;
  });

  return (
    <div className="min-h-screen bg-[#050814] text-foreground py-10 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/15 border border-cyan-400/40 text-cyan-300 text-xs font-mono mb-2 shadow-holo-sm">
              <Layers className="w-3.5 h-3.5" /> SPATIAL APPLICATION TIMELINE
            </div>
            <h1 className="font-display text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              Application Command Center
            </h1>
            <p className="text-white/60 text-sm mt-1">
              Track your property inquiries, approvals, and digital lease transitions in real-time.
            </p>
          </div>
          <Link href="/search">
            <Button className="h-10 px-5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs shadow-holo-sm gap-1.5">
              Explore More Homes <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>

        {/* Tab Filters */}
        <div className="flex gap-2 border-b border-white/10 pb-3">
          {(["ALL", "ACTIVE", "COMPLETED"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeTab === tab
                  ? "bg-cyan-500 text-white shadow-holo-sm font-bold border border-cyan-400"
                  : "bg-white/5 text-white/60 hover:text-white hover:bg-white/10"
              }`}
            >
              {tab === "ALL" ? "All Applications" : tab === "ACTIVE" ? "In Progress" : "Decided & Closed"}
            </button>
          ))}
        </div>

        {/* Application Cards */}
        {filteredApps.length === 0 ? (
          <div className="glass-panel p-16 text-center rounded-3xl border border-white/10">
            <FileText className="w-12 h-12 text-cyan-400/40 mx-auto mb-3" />
            <h3 className="font-display font-bold text-lg text-white">No applications in this category</h3>
            <p className="text-xs text-white/60 mt-1 mb-4">
              Apply to your matched properties directly to secure your next home with zero brokerage.
            </p>
            <Link href="/matches">
              <Button variant="outline" size="sm" className="rounded-xl text-xs border-cyan-400/40 text-cyan-300">
                View Matched Properties
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredApps.map((app) => {
              const statusCfg = STATUS_CONFIG[app.status] || STATUS_CONFIG.SUBMITTED;
              const Icon = statusCfg.icon;
              return (
                <div
                  key={app.id}
                  className="glass-card-3d p-6 rounded-3xl border border-white/10 hover:border-cyan-400/40 transition-all"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
                    <div className="flex items-center gap-3.5">
                      <div className="relative w-14 h-14 rounded-2xl overflow-hidden bg-muted/20 shrink-0">
                        <Image
                          src={app.property.images?.[0]?.url || "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80"}
                          alt={app.property.title}
                          fill
                          sizes="(max-width: 768px) 100vw, 56px"
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <h2 className="font-bold text-base text-white hover:text-cyan-300 transition-colors">
                          <Link href={`/properties/${app.property.id}`}>{app.property.title}</Link>
                        </h2>
                        <div className="text-xs text-white/60">
                          {app.property.locality}, {app.property.city} · Landlord: {app.property.owner.firstName} {app.property.owner.lastName}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className={`px-3.5 py-1.5 rounded-full border text-xs font-bold font-mono flex items-center gap-1.5 ${statusCfg.bg} ${statusCfg.color}`}>
                        <Icon className="w-3.5 h-3.5" />
                        {statusCfg.label}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-4 text-xs">
                    <div>
                      <div className="text-white/50 font-mono text-[11px]">Proposed Rent</div>
                      <div className="font-bold text-white font-mono text-sm mt-0.5">
                        ₹{(app.proposedRent || app.property.rent).toLocaleString("en-IN")}/mo
                      </div>
                    </div>
                    <div>
                      <div className="text-white/50 font-mono text-[11px]">Security Deposit</div>
                      <div className="font-bold text-white font-mono text-sm mt-0.5">
                        ₹{app.property.deposit.toLocaleString("en-IN")}
                      </div>
                    </div>
                    <div>
                      <div className="text-white/50 font-mono text-[11px]">Target Move-in</div>
                      <div className="font-bold text-cyan-300 font-mono text-sm mt-0.5">
                        {app.moveInDate ? new Date(app.moveInDate).toLocaleDateString() : "Immediate"}
                      </div>
                    </div>
                    <div>
                      <div className="text-white/50 font-mono text-[11px]">Submitted</div>
                      <div className="font-bold text-white font-mono text-sm mt-0.5">
                        {formatRelativeTime(app.createdAt)}
                      </div>
                    </div>
                  </div>

                  {app.message && (
                    <div className="text-xs text-white/70 bg-white/5 p-3 rounded-2xl mb-4 italic border border-white/5">
                      &ldquo;{app.message}&rdquo;
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-3 border-t border-white/10">
                    <Link href="/messages">
                      <Button variant="outline" size="sm" className="h-8 text-xs rounded-xl border-white/15 bg-white/5 text-white gap-1">
                        <MessageSquare className="w-3.5 h-3.5 text-cyan-400" /> Chat with Owner
                      </Button>
                    </Link>

                    {["SUBMITTED", "UNDER_REVIEW"].includes(app.status) && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCancelApplication(app.id)}
                        className="h-8 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-xl"
                      >
                        Withdraw Application
                      </Button>
                    )}
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
