import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import type { Metadata } from "next";
import Link from "next/link";
import { Users, Building2, FileText, Shield, AlertTriangle, TrendingUp, CheckCircle2, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatRelativeTime } from "@/lib/utils";

export const metadata: Metadata = { title: "Admin Panel" };

export default async function AdminDashboardPage() {
  const { userId: clerkId } = await auth();
  if (!clerkId) redirect("/login");

  const user = await prisma.user.findUnique({ where: { clerkId } });
  if (!user || user.role !== "ADMIN") redirect("/dashboard");

  const [
    totalUsers,
    newUsersToday,
    activeListings,
    totalApplications,
    pendingVerifications,
    recentUsers,
    recentProperties,
    reports,
  ] = await Promise.all([
    prisma.user.count({ where: { isActive: true } }),
    prisma.user.count({ where: { createdAt: { gte: new Date(Date.now() - 86400000) } } }),
    prisma.property.count({ where: { status: "ACTIVE", deletedAt: null } }),
    prisma.application.count(),
    prisma.user.count({ where: { OR: [{ tenantProfile: { identityVerified: "PENDING" } }, { landlordProfile: { identityVerified: "PENDING" } }] } }),
    prisma.user.findMany({ orderBy: { createdAt: "desc" }, take: 10, include: { landlordProfile: { select: { identityVerified: true } }, tenantProfile: { select: { identityVerified: true } } } }),
    prisma.property.findMany({ orderBy: { createdAt: "desc" }, take: 10, include: { owner: { select: { firstName: true, lastName: true } }, _count: { select: { applications: true } } } }),
    prisma.report.findMany({ where: { status: "PENDING" }, take: 10, include: { reporter: { select: { firstName: true, lastName: true } } }, orderBy: { createdAt: "desc" } }),
  ]);

  const stats = [
    { icon: Users, label: "Total Users", value: totalUsers.toLocaleString(), sub: `+${newUsersToday} today`, color: "text-brand-600", bg: "bg-brand-50 dark:bg-brand-950" },
    { icon: Building2, label: "Active Listings", value: activeListings.toLocaleString(), sub: "Properties", color: "text-green-600", bg: "bg-green-50 dark:bg-green-950" },
    { icon: FileText, label: "Applications", value: totalApplications.toLocaleString(), sub: "Total", color: "text-purple-600", bg: "bg-purple-50 dark:bg-purple-950" },
    { icon: Shield, label: "Pending KYC", value: pendingVerifications.toLocaleString(), sub: "Need verification", color: "text-orange-600", bg: "bg-orange-50 dark:bg-orange-950" },
    { icon: AlertTriangle, label: "Open Reports", value: reports.length.toLocaleString(), sub: "Needs review", color: "text-red-600", bg: "bg-red-50 dark:bg-red-950" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border/50 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="font-display text-xl font-bold">Admin Panel</h1>
            <p className="text-muted-foreground text-sm">NextGen Platform Management</p>
          </div>
          <Badge variant="destructive" className="text-xs">Admin</Badge>
        </div>
        {/* Admin Nav */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-0">
          <div className="flex gap-1">
            {adminNavLinks.map((link) => (
              <Link key={link.href} href={link.href}
                className="px-4 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground border-b-2 border-transparent hover:border-primary transition-colors">
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          {stats.map((s, i) => (
            <div key={i} className="stat-card">
              <div className={`w-9 h-9 rounded-xl ${s.bg} flex items-center justify-center mb-3`}>
                <s.icon className={`w-4 h-4 ${s.color}`} />
              </div>
              <div className="font-display font-bold text-xl">{s.value}</div>
              <div className="text-xs font-medium mt-0.5">{s.label}</div>
              <div className="text-xs text-muted-foreground">{s.sub}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Users */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-bold text-lg">Recent Users</h2>
              <Link href="/admin/users" className="text-sm text-primary hover:underline">Manage All</Link>
            </div>
            <div className="card-elevated divide-y divide-border/50">
              {recentUsers.map((u) => {
                const isVerified = u.tenantProfile?.identityVerified || u.landlordProfile?.identityVerified;
                return (
                  <div key={u.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                      {u.firstName[0]}{u.lastName[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{u.firstName} {u.lastName}</span>
                        <Badge variant={u.role === "ADMIN" ? "destructive" : u.role === "LANDLORD" ? "default" : "secondary"} className="text-xs">
                          {u.role}
                        </Badge>
                        {isVerified && <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />}
                      </div>
                      <div className="text-xs text-muted-foreground">{u.email}</div>
                    </div>
                    <div className="text-xs text-muted-foreground shrink-0">{formatRelativeTime(u.createdAt)}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent Listings */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-bold text-lg">Recent Listings</h2>
              <Link href="/admin/listings" className="text-sm text-primary hover:underline">Manage All</Link>
            </div>
            <div className="card-elevated divide-y divide-border/50">
              {recentProperties.map((p) => (
                <div key={p.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-medium text-sm line-clamp-1">{p.title}</span>
                      <Badge variant={p.status === "ACTIVE" ? "success" : "secondary"} className="text-xs shrink-0">
                        {p.status}
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground">{p.locality}, {p.city} · by {p.owner.firstName} {p.owner.lastName}</div>
                    <div className="text-xs text-muted-foreground">{p._count.applications} applications · ₹{p.rent.toLocaleString("en-IN")}/mo</div>
                  </div>
                  <div className="flex gap-1.5 shrink-0">
                    <Link href={`/properties/${p.id}`}>
                      <Button variant="ghost" size="sm" className="h-7 px-2 rounded-lg text-xs">View</Button>
                    </Link>
                    {!p.isVerified && (
                      <Button size="sm" className="h-7 px-2 rounded-lg text-xs bg-green-500 hover:bg-green-600">Verify</Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Reports */}
          {reports.length > 0 && (
            <div className="lg:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display font-bold text-lg flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                  Pending Reports
                </h2>
                <Link href="/admin/reports" className="text-sm text-primary hover:underline">View All</Link>
              </div>
              <div className="card-elevated divide-y divide-border/50">
                {reports.map((r) => (
                  <div key={r.id} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
                    <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <Badge variant="destructive" className="text-xs">{r.reason}</Badge>
                        <span className="text-xs text-muted-foreground">by {r.reporter.firstName}</span>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">{r.description}</p>
                    </div>
                    <div className="flex gap-1.5 shrink-0">
                      <Button variant="outline" size="sm" className="h-7 text-xs rounded-lg">Dismiss</Button>
                      <Button size="sm" className="h-7 text-xs rounded-lg bg-red-500 hover:bg-red-600">Action</Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const adminNavLinks = [
  { label: "Overview", href: "/admin" },
  { label: "Users", href: "/admin/users" },
  { label: "Listings", href: "/admin/listings" },
  { label: "Applications", href: "/admin/applications" },
  { label: "Reports", href: "/admin/reports" },
  { label: "Matching Config", href: "/admin/matching" },
  { label: "Analytics", href: "/admin/analytics" },
];
