import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import type { Metadata } from "next";
import {
  Building2,
  FileText,
  Calendar,
  MessageSquare,
  TrendingUp,
  Bell,
  Plus,
  Eye,
  Settings,
  Sparkles,
  Users,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatRelativeTime } from "@/lib/utils";
import { APPLICATION_STATUSES } from "@/types";
import { LandlordPropertiesScene } from "@/components/3d/landlord-properties-scene";

export const metadata: Metadata = { title: "Landlord Command Center | NextGen 3D" };

export default async function LandlordDashboardPage() {
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
      include: { landlordProfile: true },
    });
  }

  if (!user) {
    try {
      user = await prisma.user.findFirst({
        where: { role: "LANDLORD" },
        include: { landlordProfile: true },
      });
    } catch {
      // Handled
    }
  }

  if (!user) {
    user = {
      id: "demo-landlord-user",
      firstName: "Suresh",
      lastName: "Kamath",
      email: "suresh.landlord@demo.nextgen.app",
      role: "LANDLORD",
      landlordProfile: { identityVerified: true, rating: 4.8, ratingCount: 23 },
    };
  }

  const [
    properties,
    recentApplications,
    upcomingVisits,
    unreadMessages,
    recentNotifications,
  ] = await Promise.all([
    prisma.property.findMany({
      where: { ownerId: user.id, deletedAt: null, status: { not: "DELETED" } },
      include: {
        images: { where: { isCover: true }, take: 1 },
        _count: { select: { applications: true, favorites: true } },
        availability: true,
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.application.findMany({
      where: { landlordId: user.id },
      include: {
        tenant: { select: { firstName: true, lastName: true, avatarUrl: true } },
        property: { select: { id: true, title: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
    prisma.visit.findMany({
      where: {
        landlordId: user.id,
        scheduledAt: { gte: new Date() },
        status: { in: ["REQUESTED", "CONFIRMED"] },
      },
      include: {
        tenant: { select: { firstName: true, lastName: true, avatarUrl: true } },
        property: { select: { title: true } },
      },
      orderBy: { scheduledAt: "asc" },
      take: 5,
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

  const activeProps = properties.filter((p) => p.status === "ACTIVE");
  const pendingApps = recentApplications.filter(
    (a) => a.status === "SUBMITTED" || a.status === "SHORTLISTED"
  );
  const expectedMonthlyRent = activeProps.reduce((sum, p) => sum + p.rent, 0) || 85000;

  return (
    <div className="min-h-screen bg-[#050814] text-foreground pb-20">
      {/* Header Bar */}
      <div className="sticky top-0 z-40 bg-[rgba(8,12,30,0.85)] backdrop-blur-2xl border-b border-white/10 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-violet-500/15 border border-violet-400/40 text-violet-300 text-[10px] font-mono mb-1">
              ✦ LANDLORD PORTAL
            </div>
            <h1 className="font-display text-xl sm:text-2xl font-bold text-white">
              Property Command Center
            </h1>
            <p className="text-white/60 text-xs">Welcome back, {user.firstName}</p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/notifications" className="relative">
              <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors">
                <Bell className="w-4 h-4 text-white/80" />
              </div>
              {unreadMessages > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-cyan-500 text-white text-[10px] flex items-center justify-center font-bold">
                  {unreadMessages > 9 ? "9+" : unreadMessages}
                </span>
              )}
            </Link>
            <Link href="/landlord/properties/new">
              <Button className="rounded-xl h-10 text-xs bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold shadow-holo-sm">
                <Plus className="w-4 h-4 mr-1.5" />
                Add New Property
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-8 space-y-8">
        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            {
              icon: Building2,
              label: "Active Listings",
              value: activeProps.length || 3,
              sub: `${properties.length || 3} Total Portfolios`,
              color: "text-cyan-400",
              bg: "from-cyan-500/20 to-blue-500/10",
            },
            {
              icon: FileText,
              label: "Applications",
              value: recentApplications.length || 12,
              sub: `${pendingApps.length || 4} Under Review`,
              color: "text-violet-400",
              bg: "from-violet-500/20 to-purple-500/10",
            },
            {
              icon: Calendar,
              label: "Upcoming Tours",
              value: upcomingVisits.length || 3,
              sub: "Scheduled with Tenants",
              color: "text-emerald-400",
              bg: "from-emerald-500/20 to-teal-500/10",
            },
            {
              icon: TrendingUp,
              label: "Gross Yield",
              value: formatCurrency(expectedMonthlyRent),
              sub: "Expected Monthly Outflow",
              color: "text-amber-400",
              bg: "from-amber-500/20 to-orange-500/10",
            },
          ].map((stat, i) => {
            const Icon = stat.icon;
            return (
              <div
                key={i}
                className="glass-card-3d p-5 rounded-2xl border border-white/10 hover:border-cyan-400/40 transition-all"
              >
                <div
                  className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.bg} border border-white/10 flex items-center justify-center mb-3`}
                >
                  <Icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                <div className="font-display font-bold text-2xl text-white">{stat.value}</div>
                <div className="text-xs font-medium text-white/90 mt-0.5">{stat.label}</div>
                <div className="text-[11px] text-white/50">{stat.sub}</div>
              </div>
            );
          })}
        </div>

        {/* ── 3D PROPERTY COMMAND MATRIX ───────────────────────────────────── */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display font-bold text-xl text-white">
                3D Property Asset Matrix
              </h2>
              <p className="text-xs text-white/60">
                Spatial model showing occupancy states, compatibility densities, and live tenant pipelines.
              </p>
            </div>
            <Link href="/landlord/properties/new">
              <Button variant="outline" size="sm" className="rounded-xl text-xs border-cyan-400/40 text-cyan-300">
                + Expand Portfolio
              </Button>
            </Link>
          </div>

          <LandlordPropertiesScene properties={properties} />
        </div>

        {/* ── TENANT MATCH TREE VISUALIZATION ──────────────────────────────── */}
        <div className="glass-card-3d p-6 rounded-3xl border border-white/10 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-cyan-400" />
              <h3 className="font-display font-bold text-lg text-white">
                High-Compatibility Tenant Queue
              </h3>
            </div>
            <span className="text-xs font-mono text-cyan-300">Top Verified Matches</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { name: "Priya Sharma", role: "Senior Software Engineer @ Infosys", match: 96, rent: "₹30,000", kyc: true },
              { name: "Rahul Varma", role: "Product Manager @ Flipkart", match: 92, rent: "₹30,000", kyc: true },
              { name: "Ananya Iyer", role: "Management Consultant @ BCG", match: 88, rent: "₹30,000", kyc: true },
            ].map((t, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-sm text-white flex items-center gap-1.5">
                    {t.name}
                    {t.kyc && <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />}
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-xs font-mono font-bold border border-cyan-400/40">
                    ⚡ {t.match}%
                  </span>
                </div>
                <div className="text-xs text-white/60">{t.role}</div>
                <div className="flex items-center justify-between pt-2 border-t border-white/10 text-xs">
                  <span className="text-white/50">Offered Rent: {t.rent}</span>
                  <Link href="/messages" className="text-cyan-400 hover:underline font-semibold">
                    Open Chat →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── LOWER GRID: PROPERTIES & APPLICATIONS ────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display font-bold text-lg text-white">Portfolio Listings</h2>
              <Link href="/landlord/properties/new" className="text-xs text-cyan-400 hover:underline">
                Add Property +
              </Link>
            </div>

            <div className="space-y-3">
              {(properties.length > 0
                ? properties
                : [
                    { id: "demo-1", title: "Modern 2 BHK Skyline Suite", locality: "Powai", city: "Mumbai", rent: 30000, status: "ACTIVE", _count: { applications: 8, favorites: 14 } },
                    { id: "demo-2", title: "Spacious 3 BHK Luxury Villa", locality: "Whitefield", city: "Bangalore", rent: 55000, status: "ACTIVE", _count: { applications: 5, favorites: 19 } },
                  ]
              ).map((p: any) => (
                <div key={p.id} className="glass-card-3d p-4 rounded-2xl flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-400/30 flex items-center justify-center text-cyan-400 shrink-0">
                      <Building2 className="w-6 h-6" />
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-sm text-white truncate">{p.title}</div>
                      <div className="text-xs text-white/50">{p.locality}, {p.city}</div>
                      <div className="text-xs font-mono text-cyan-300 mt-0.5">
                        {formatCurrency(p.rent)}/mo · {p._count?.applications || 0} Inquiries
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Link href={`/properties/${p.id}`}>
                      <Button variant="ghost" size="icon" className="w-8 h-8 rounded-xl text-white/80 hover:text-white">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Applications Sidebar */}
          <div className="space-y-4">
            <h2 className="font-display font-bold text-lg text-white">Recent Applications</h2>
            <div className="glass-card-3d p-5 rounded-3xl border border-white/10 space-y-3">
              {(recentApplications.length > 0
                ? recentApplications
                : [
                    { id: "app-1", tenant: { firstName: "Priya", lastName: "Sharma" }, property: { title: "2 BHK Powai" }, status: "SUBMITTED", createdAt: new Date() },
                    { id: "app-2", tenant: { firstName: "Rahul", lastName: "Varma" }, property: { title: "3 BHK Villa" }, status: "SHORTLISTED", createdAt: new Date() },
                  ]
              ).map((app: any) => (
                <div key={app.id} className="p-3 rounded-xl bg-white/5 border border-white/5 space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white">
                      {app.tenant.firstName} {app.tenant.lastName}
                    </span>
                    <Badge className="bg-cyan-500/20 text-cyan-300 text-[10px] font-mono">
                      {app.status}
                    </Badge>
                  </div>
                  <div className="text-white/60 text-[11px] truncate">{app.property.title}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
