import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import type { Metadata } from "next";
import {
  Sparkles,
  Home,
  Heart,
  FileText,
  Calendar,
  MessageSquare,
  TrendingUp,
  Bell,
  ArrowRight,
  Compass,
  Zap,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { formatCurrency, getMatchCategory, MATCH_COLORS } from "@/types";
import { formatRelativeTime } from "@/lib/utils";
import { MatchUniverseScene } from "@/components/3d/match-universe-scene";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Tenant Command Center | NextGen 3D" };

export default async function TenantDashboardPage() {
  let clerkId: string | null = null;
  try {
    const authResult = await auth();
    clerkId = authResult.userId;
  } catch {
    // Auth optional for demo
  }

  let user: any = null;
  if (clerkId) {
    user = await prisma.user.findUnique({
      where: { clerkId },
      include: {
        tenantProfile: {
          include: {
            preferences: true,
            matches: {
              orderBy: { overallScore: "desc" },
              take: 5,
              include: {
                property: {
                  include: {
                    images: { where: { isCover: true }, take: 1 },
                    owner: {
                      select: {
                        firstName: true,
                        lastName: true,
                        landlordProfile: { select: { identityVerified: true } },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });
  }

  // Fallback to seeded demo tenant for testing/preview
  if (!user) {
    try {
      user = await prisma.user.findFirst({
        where: { role: "TENANT" },
        include: {
          tenantProfile: {
            include: {
              preferences: true,
              matches: {
                orderBy: { overallScore: "desc" },
                take: 5,
                include: {
                  property: {
                    include: {
                      images: { where: { isCover: true }, take: 1 },
                      owner: {
                        select: {
                          firstName: true,
                          lastName: true,
                          landlordProfile: { select: { identityVerified: true } },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      });
    } catch {
      // Handled
    }
  }

  if (!user) {
    user = {
      id: "demo-tenant-user",
      firstName: "Priya",
      lastName: "Sharma",
      email: "priya.tenant@demo.nextgen.app",
      role: "TENANT",
      tenantProfile: {
        preferences: { maxRent: 35000 },
        matches: [
          {
            id: "match-1",
            overallScore: 96,
            propertyId: "demo-prop-001",
            property: {
              id: "demo-prop-001",
              title: "Modern 2 BHK with Panoramic Sky View — Powai",
              locality: "Powai",
              city: "Mumbai",
              rent: 30000,
              images: [{ url: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80" }],
              owner: { firstName: "Suresh", lastName: "Kamath", landlordProfile: { identityVerified: true } },
            },
          },
          {
            id: "match-2",
            overallScore: 89,
            propertyId: "demo-prop-002",
            property: {
              id: "demo-prop-002",
              title: "Spacious Fully Furnished 3 BHK Villa — Whitefield",
              locality: "Whitefield",
              city: "Bangalore",
              rent: 55000,
              images: [{ url: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80" }],
              owner: { firstName: "Anita", lastName: "Reddy", landlordProfile: { identityVerified: true } },
            },
          },
        ],
      },
    };
  }

  const [
    savedCount,
    applicationCount,
    upcomingVisits,
    unreadMessages,
    recentNotifications,
  ] = await Promise.all([
    prisma.favorite.count({ where: { userId: user.id } }),
    prisma.application.count({ where: { tenantId: user.id } }),
    prisma.visit.count({
      where: {
        tenantId: user.id,
        scheduledAt: { gte: new Date() },
        status: { in: ["REQUESTED", "CONFIRMED"] },
      },
    }),
    prisma.message.count({
      where: {
        conversation: { OR: [{ user1Id: user.id }, { user2Id: user.id }] },
        senderId: { not: user.id },
        isRead: false,
      },
    }),
    prisma.notification.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);

  const hasPreferences = !!user.tenantProfile?.preferences;
  const topMatch = user.tenantProfile?.matches[0];
  const overallMatchScore = topMatch?.overallScore ?? 94;

  return (
    <div className="min-h-screen bg-[#050814] text-foreground pb-20">
      {/* Top Command Bar */}
      <div className="border-b border-white/10 bg-[rgba(8,12,30,0.85)] backdrop-blur-2xl sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-500/15 border border-cyan-400/40 text-cyan-300 text-[10px] font-mono mb-1">
              ✦ COMMAND CENTER
            </div>
            <h1 className="font-display text-xl sm:text-2xl font-bold text-white">
              Good morning, {user.firstName} 👋
            </h1>
            <p className="text-white/60 text-xs">Your Spatial Rental Ecosystem & Live Compatibility</p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/notifications" className="relative">
              <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors">
                <Bell className="w-4 h-4 text-white/80" />
              </div>
              {unreadMessages > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-cyan-500 text-white text-[10px] flex items-center justify-center font-bold shadow-holo-sm">
                  {unreadMessages > 9 ? "9+" : unreadMessages}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-8 space-y-8">
        {/* Onboarding Banner if no preferences */}
        {!hasPreferences && (
          <div className="rounded-3xl glass-panel p-6 border border-cyan-400/50 shadow-holo-md flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h2 className="font-display font-bold text-lg text-white mb-1">
                Configure your lifestyle preferences
              </h2>
              <p className="text-white/70 text-xs">
                Unlock 3D Mutual Match calculations and personalized home recommendations.
              </p>
            </div>
            <Link href="/onboarding">
              <Button className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs h-10 px-6 rounded-xl shadow-holo-sm">
                Complete Onboarding →
              </Button>
            </Link>
          </div>
        )}

        {/* Floating KPI Cards Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            icon={Sparkles}
            label="Peak Compatibility"
            value={`${overallMatchScore}%`}
            sub="AI Mutual Match"
            color="text-cyan-400"
            bg="from-cyan-500/20 to-blue-500/10"
            href="/matches"
          />
          <StatCard
            icon={Heart}
            label="Saved Spaces"
            value={savedCount}
            sub="Shortlisted listings"
            color="text-rose-400"
            bg="from-rose-500/20 to-pink-500/10"
            href="/favorites"
          />
          <StatCard
            icon={FileText}
            label="Applications"
            value={applicationCount}
            sub="Active inquiries"
            color="text-violet-400"
            bg="from-violet-500/20 to-purple-500/10"
            href="/applications"
          />
          <StatCard
            icon={Calendar}
            label="Scheduled Visits"
            value={upcomingVisits}
            sub="Physical tours"
            color="text-emerald-400"
            bg="from-emerald-500/20 to-teal-500/10"
            href="/visits"
          />
        </div>

        {/* ── CENTERPIECE: MATCH UNIVERSE 3D SCENE ────────────────────────── */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display font-bold text-xl text-white">Your Match Universe</h2>
              <p className="text-xs text-white/60">
                Live 3D orbital visualization of compatible homes orbiting your lifestyle preferences.
              </p>
            </div>
            <Link href="/matches">
              <Button variant="outline" size="sm" className="rounded-xl text-xs border-cyan-400/40 text-cyan-300">
                Explore Matrix <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </Link>
          </div>

          <MatchUniverseScene tenantName={user.firstName} />
        </div>

        {/* ── LOWER SECTION: TOP MATCHES & QUICK ACTIONS ──────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Top Matches Column */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display font-bold text-lg text-white">Curated Home Recommendations</h2>
              <Link href="/matches" className="text-xs text-cyan-400 hover:underline">
                View All Matches →
              </Link>
            </div>

            {user.tenantProfile?.matches.length === 0 ? (
              <div className="glass-panel text-center py-12 rounded-3xl border border-white/10">
                <Sparkles className="w-10 h-10 text-cyan-400/40 mx-auto mb-2" />
                <h3 className="font-bold text-sm text-white">Scanning for matching spaces</h3>
                <p className="text-xs text-white/60 mb-4">
                  {hasPreferences
                    ? "Calculating your match scores in real time."
                    : "Complete your preferences to generate matches."}
                </p>
                <Link href={hasPreferences ? "/search" : "/onboarding"}>
                  <Button className="bg-cyan-500 hover:bg-cyan-400 text-white rounded-xl text-xs font-semibold">
                    {hasPreferences ? "Browse Properties" : "Set Preferences"}
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {user.tenantProfile?.matches.map((match: any) => {
                  const coverImg = match.property.images[0]?.url;
                  return (
                    <Link key={match.id} href={`/properties/${match.propertyId}`}>
                      <div className="glass-card-3d p-4 rounded-2xl flex items-center gap-4 hover:border-cyan-400/50 hover:shadow-holo-sm transition-all cursor-pointer">
                        <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-muted/20 shrink-0">
                          {coverImg ? (
                            <Image
                              src={coverImg}
                              alt={match.property.title}
                              fill
                              sizes="(max-width: 768px) 100vw, 80px"
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-brand-950 to-purple-950 flex items-center justify-center">
                              <Home className="w-8 h-8 text-cyan-400" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <h3 className="font-bold text-sm text-white line-clamp-1">
                              {match.property.title}
                            </h3>
                            <span className="shrink-0 px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-400/40">
                              ⚡ {match.overallScore}%
                            </span>
                          </div>
                          <div className="text-white/60 text-xs mb-1">
                            {match.property.locality}, {match.property.city}
                          </div>
                          <div className="font-display font-bold text-base text-white">
                            {formatCurrency(match.property.rent)}
                            <span className="text-white/50 text-xs font-normal">/mo</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* Quick Actions & Notifications Sidebar */}
          <div className="space-y-6">
            <div className="glass-card-3d p-6 rounded-3xl border border-white/10 space-y-3">
              <h3 className="font-display font-bold text-sm text-white">Direct Actions</h3>
              <div className="space-y-2">
                {[
                  { icon: Compass, label: "Explore 3D Search", href: "/search", color: "text-cyan-400" },
                  { icon: Sparkles, label: "AI Match Matrix", href: "/matches", color: "text-violet-400" },
                  { icon: FileText, label: "Active Applications", href: "/applications", color: "text-pink-400" },
                  { icon: MessageSquare, label: "Direct Messages", href: "/messages", color: "text-emerald-400" },
                  { icon: Calendar, label: "Scheduled Tours", href: "/visits", color: "text-amber-400" },
                ].map((a, i) => {
                  const Icon = a.icon;
                  return (
                    <Link key={i} href={a.href}>
                      <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-cyan-400/30 transition-all cursor-pointer">
                        <Icon className={`w-4 h-4 ${a.color}`} />
                        <span className="text-xs font-medium text-white/90">{a.label}</span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Notifications */}
            <div className="glass-card-3d p-6 rounded-3xl border border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-display font-bold text-sm text-white">Notifications</h3>
                <Link href="/notifications" className="text-[11px] text-cyan-400 hover:underline">
                  All
                </Link>
              </div>
              {recentNotifications.length === 0 ? (
                <p className="text-xs text-white/50 text-center py-4">No new notifications</p>
              ) : (
                <div className="space-y-2">
                  {recentNotifications.map((n) => (
                    <div key={n.id} className="p-3 rounded-xl bg-white/5 border border-white/5 text-xs">
                      <div className="font-semibold text-white mb-0.5 line-clamp-1">{n.title}</div>
                      <div className="text-white/60 text-[11px] line-clamp-2">{n.body}</div>
                      <div className="text-white/40 text-[10px] mt-1 font-mono">{formatRelativeTime(n.createdAt)}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, sub, color, bg, href }: any) {
  const content = (
    <div className="glass-card-3d p-5 rounded-2xl border border-white/10 hover:border-cyan-400/40 transition-all cursor-pointer">
      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${bg} border border-white/10 flex items-center justify-center mb-3`}>
        <Icon className={`w-5 h-5 ${color}`} />
      </div>
      <div className="font-display font-bold text-2xl text-white">{value}</div>
      <div className="text-xs font-medium text-white/90 mt-0.5">{label}</div>
      <div className="text-[11px] text-white/50">{sub}</div>
    </div>
  );
  return href ? <Link href={href}>{content}</Link> : content;
}
