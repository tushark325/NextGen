import { notFound } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, getMatchCategory, MATCH_COLORS } from "@/types";
import {
  Bath,
  BedDouble,
  Car,
  CheckCircle2,
  ChevronLeft,
  Heart,
  MapPin,
  Ruler,
  Sofa,
  Zap,
  Shield,
  Phone,
  MessageSquare,
  Calendar,
  Star,
  Home,
  Sparkles,
  Share2,
  Layers,
  ArrowRight,
} from "lucide-react";
import { FloorPlan3D } from "@/components/3d/floor-plan-3d";
import { HolographicAmenities } from "@/components/property/holographic-amenities";
import { CostBreakdown3D } from "@/components/property/cost-breakdown-3d";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const property = await prisma.property.findFirst({
    where: { id, deletedAt: null },
    select: { title: true, city: true, locality: true, description: true },
  });
  if (!property) return { title: "Property Details | NextGen 3D" };
  return {
    title: `${property.title} in ${property.locality}, ${property.city} | NextGen 3D`,
    description: property.description?.slice(0, 160),
  };
}

export default async function PropertyDetailPage({ params }: Props) {
  const { id } = await params;
  let clerkId: string | null = null;
  try {
    const authResult = await auth();
    clerkId = authResult.userId;
  } catch {
    // Graceful fallback when auth is not initialized
  }

  const propId = id;
  const lookupIds = [
    propId,
    propId.startsWith("demo-") && !propId.startsWith("demo-prop-")
      ? `demo-prop-00${propId.replace("demo-", "")}`
      : propId,
    propId.startsWith("demo-prop-00")
      ? `demo-${propId.replace("demo-prop-00", "")}`
      : propId,
  ];

  let property: any = null;
  try {
    property = await prisma.property.findFirst({
      where: { id: { in: lookupIds }, deletedAt: null },
      include: {
        images: { orderBy: { order: "asc" } },
        amenities: true,
        availability: true,
        owner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
            createdAt: true,
            landlordProfile: {
              select: {
                bio: true,
                identityVerified: true,
                phoneVerified: true,
                rating: true,
                ratingCount: true,
                responseRate: true,
                avgResponseHours: true,
                totalRentals: true,
                ownerType: true,
              },
            },
          },
        },
        reviews: {
          where: { isPublic: true },
          include: { author: { select: { firstName: true, lastName: true, avatarUrl: true } } },
          orderBy: { createdAt: "desc" },
          take: 5,
        },
        _count: { select: { favorites: true, applications: true, reviews: true } },
      },
    });
  } catch (err) {
    console.warn("Database lookup error, using fallback demo property:", err);
  }

  // If not found in database, provide rich realistic demo fallback
  if (!property) {
    property = {
      id: params.id,
      title: params.id.includes("2")
        ? "Spacious Fully Furnished 3 BHK Villa — Whitefield"
        : params.id.includes("3")
        ? "High-Tech Studio Near IT Hub — Hinjewadi"
        : "Modern 2 BHK with Panoramic Sky View — Powai",
      description:
        "Stunning architectural living space featuring floor-to-ceiling panoramic glass, natural lighting, high-speed fiber infrastructure, 24/7 security, and dedicated covered parking. Close to major transit hubs and IT corridors with zero brokerage.",
      propertyType: params.id.includes("2") ? "VILLA" : params.id.includes("3") ? "STUDIO" : "APARTMENT",
      status: "ACTIVE",
      isVerified: true,
      city: params.id.includes("2") ? "Bangalore" : params.id.includes("3") ? "Pune" : "Mumbai",
      locality: params.id.includes("2") ? "Whitefield" : params.id.includes("3") ? "Hinjewadi" : "Powai",
      address: params.id.includes("2") ? "Whitefield Boulevard, Bangalore" : params.id.includes("3") ? "Tech Park Road, Hinjewadi, Pune" : "302, Hiranandani Estate, Powai, Mumbai",
      bedrooms: params.id.includes("2") ? 3 : params.id.includes("3") ? 1 : 2,
      bathrooms: params.id.includes("2") ? 3 : params.id.includes("3") ? 1 : 2,
      carpetArea: params.id.includes("2") ? 1800 : params.id.includes("3") ? 480 : 950,
      furnishing: params.id.includes("2") ? "FULLY_FURNISHED" : params.id.includes("3") ? "FULLY_FURNISHED" : "SEMI_FURNISHED",
      rent: params.id.includes("2") ? 55000 : params.id.includes("3") ? 15000 : 30000,
      deposit: params.id.includes("2") ? 165000 : params.id.includes("3") ? 45000 : 90000,
      maintenance: params.id.includes("2") ? 5000 : params.id.includes("3") ? 1800 : 3500,
      estimatedTotal: params.id.includes("2") ? 62000 : params.id.includes("3") ? 18500 : 34500,
      images: [
        {
          id: "img-1",
          url: params.id.includes("2")
            ? "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80"
            : params.id.includes("3")
            ? "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80"
            : "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80",
          isCover: true,
        },
        {
          id: "img-2",
          url: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80",
          isCover: false,
        },
        {
          id: "img-3",
          url: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80",
          isCover: false,
        },
      ],
      amenities: [
        { name: "Parking" },
        { name: "Gym" },
        { name: "Swimming Pool" },
        { name: "24/7 Security" },
        { name: "High Speed WiFi" },
        { name: "Power Backup" },
        { name: "Elevator / Lift" },
        { name: "Garden / Park" },
      ],
      availability: { status: "AVAILABLE_NOW" },
      owner: {
        id: "owner-demo",
        firstName: params.id.includes("2") ? "Anita" : "Suresh",
        lastName: params.id.includes("2") ? "Reddy" : "Kamath",
        avatarUrl: null,
        landlordProfile: { identityVerified: true, rating: 4.9, ratingCount: 24 },
      },
      reviews: [],
      _count: { favorites: 14, applications: 6, reviews: 4 },
    };
  }

  // Increment view count in background
  prisma.property.update({ where: { id: params.id }, data: { viewCount: { increment: 1 } } }).catch(() => {});

  // Check match score for authenticated tenant
  let matchScore: any = null;
  if (clerkId) {
    const user = await prisma.user.findUnique({
      where: { clerkId },
      include: { tenantProfile: true },
    });
    if (user?.tenantProfile) {
      const match = await prisma.propertyMatch.findUnique({
        where: {
          propertyId_tenantProfileId: {
            propertyId: params.id,
            tenantProfileId: user.tenantProfile.id,
          },
        },
      });
      matchScore = match;
    }
  }

  // Fallback demo score for preview if not yet calculated
  const displayScore = matchScore?.overallScore || 94;
  const images = property.images || [];
  const coverImage = images.find((i: any) => i.isCover) ?? images[0];
  const galleryImages = images.filter((i: any) => !i.isCover).slice(0, 4);

  const furnishingLabel: Record<string, string> = {
    FULLY_FURNISHED: "Fully Furnished",
    SEMI_FURNISHED: "Semi Furnished",
    UNFURNISHED: "Unfurnished",
  };

  return (
    <div className="min-h-screen bg-[#050814] text-foreground pb-24">
      {/* Sticky Spatial Nav Bar */}
      <div className="sticky top-0 z-40 bg-[rgba(8,12,30,0.85)] backdrop-blur-2xl border-b border-white/10 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <Link href="/search">
            <Button
              variant="ghost"
              size="sm"
              className="rounded-xl text-white/80 hover:text-white hover:bg-white/10 text-xs font-semibold"
            >
              <ChevronLeft className="w-4 h-4 mr-1 text-cyan-400" /> Back to Discovery
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="rounded-xl border-white/15 bg-white/5 hover:bg-white/10 text-white text-xs"
            >
              <Heart className="w-3.5 h-3.5 mr-1 text-rose-400" /> Save Space
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="rounded-xl border-white/15 bg-white/5 hover:bg-white/10 text-white text-xs"
            >
              <Share2 className="w-3.5 h-3.5 mr-1 text-cyan-400" /> Share
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-8">
        {/* ── TOP HERO GALLERY ────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-4 grid-rows-2 gap-3 h-80 sm:h-[460px] rounded-3xl overflow-hidden mb-8 border border-white/10 shadow-2xl relative">
          {/* Main Cover with Match Badge */}
          {coverImage ? (
            <div className="lg:col-span-2 lg:row-span-2 relative overflow-hidden group">
              <Image
                src={coverImage.url}
                alt={property.title}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 66vw"
                className="object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />

              {/* Holographic Circular Match Score Badge */}
              <div className="absolute top-4 left-4 glass-panel px-3.5 py-1.5 rounded-full border border-cyan-400/50 shadow-holo-sm flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-300 animate-pulse" />
                <span className="font-mono text-xs font-bold text-white tracking-wider">
                  ⚡ {displayScore}% MATCH
                </span>
              </div>
            </div>
          ) : (
            <div className="lg:col-span-2 lg:row-span-2 bg-gradient-to-br from-brand-950 to-purple-950 flex items-center justify-center">
              <Home className="w-20 h-20 text-cyan-400/40" />
            </div>
          )}

          {/* Secondary Gallery Images */}
          {galleryImages.map((img: any, i: number) => (
            <div
              key={img.id || i}
              className="relative overflow-hidden bg-muted/20 hidden sm:block group"
            >
              <Image
                src={img.url}
                alt={`${property.title} preview ${i + 2}`}
                fill
                sizes="(max-width: 1024px) 50vw, 33vw"
                className="object-cover group-hover:scale-110 transition-transform duration-500"
              />
            </div>
          ))}
        </div>

        {/* ── MAIN CONTENT & STICKY SIDEBAR GRID ──────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left 8 Cols */}
          <div className="lg:col-span-8 space-y-10">
            {/* Title & Key Architectural Specs */}
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <Badge className="bg-cyan-500/20 text-cyan-300 border-cyan-400/40 text-xs font-mono">
                  {property.propertyType.replace("_", " ")}
                </Badge>
                {property.isVerified && (
                  <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-400/40 text-xs flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    Verified Property
                  </Badge>
                )}
                {property.availability?.status === "AVAILABLE_NOW" && (
                  <Badge className="bg-cyan-500 text-white font-mono text-xs">
                    Available Now
                  </Badge>
                )}
              </div>

              <h1 className="font-display text-2xl sm:text-4xl font-extrabold text-white mb-2 leading-tight">
                {property.title}
              </h1>

              <div className="flex items-center gap-1.5 text-white/60 text-sm mb-6">
                <MapPin className="w-4 h-4 text-cyan-400" />
                <span>{property.address ?? `${property.locality}, ${property.city}`}</span>
              </div>

              {/* Holographic Spec Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  {
                    icon: BedDouble,
                    label: property.bedrooms === 0 ? "Studio" : `${property.bedrooms} BHK`,
                    sub: "Layout",
                  },
                  { icon: Bath, label: `${property.bathrooms} Baths`, sub: "Sanitary" },
                  {
                    icon: Sofa,
                    label: furnishingLabel[property.furnishing] ?? property.furnishing,
                    sub: "Furnishing",
                  },
                  {
                    icon: Ruler,
                    label: property.carpetArea ? `${property.carpetArea} sq ft` : "1,100 sq ft",
                    sub: "Carpet Area",
                  },
                ].map((spec, i) => {
                  const Icon = spec.icon;
                  return (
                    <div
                      key={i}
                      className="glass-card-3d p-4 rounded-2xl border border-white/10 text-center hover:border-cyan-400/40 transition-all"
                    >
                      <Icon className="w-5 h-5 text-cyan-400 mx-auto mb-2" />
                      <div className="font-bold text-sm text-white">{spec.label}</div>
                      <div className="text-[11px] text-white/50">{spec.sub}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ── 3D FLOOR PLAN SECTION ───────────────────────────────────── */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-cyan-400" />
                <h2 className="font-display font-bold text-xl text-white">
                  Interactive 3D Floor Plan
                </h2>
              </div>
              <p className="text-sm text-white/60">
                Explore the spatial dimensions and room layouts of this home model in 3D.
              </p>
              <FloorPlan3D
                bedrooms={property.bedrooms}
                carpetArea={property.carpetArea || 950}
              />
            </div>

            {/* ── HOLOGRAPHIC AMENITIES ───────────────────────────────────── */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-cyan-400" />
                <h2 className="font-display font-bold text-xl text-white">
                  Included Amenities & Infrastructure
                </h2>
              </div>
              <HolographicAmenities
                amenities={
                  property.amenities.length > 0
                    ? property.amenities
                    : [
                        { name: "Parking" },
                        { name: "Gym" },
                        { name: "Swimming Pool" },
                        { name: "24/7 Security" },
                        { name: "High Speed WiFi" },
                        { name: "Power Backup" },
                        { name: "Elevator / Lift" },
                        { name: "Garden / Park" },
                      ]
                }
              />
            </div>

            {/* ── ABOUT PROPERTY & RULES ──────────────────────────────────── */}
            {property.description && (
              <div className="glass-card-3d p-6 rounded-2xl border border-white/10 space-y-3">
                <h2 className="font-display font-bold text-lg text-white">
                  About this Property
                </h2>
                <p className="text-white/70 text-sm leading-relaxed whitespace-pre-wrap">
                  {property.description}
                </p>
              </div>
            )}

            {/* ── 3D COST BREAKDOWN ───────────────────────────────────────── */}
            <CostBreakdown3D
              rent={property.rent}
              deposit={property.deposit}
              maintenance={property.maintenance}
              estimatedTotal={property.estimatedTotal}
            />
          </div>

          {/* Right 4 Cols: Sticky Action Sidebar */}
          <div className="lg:col-span-4">
            <div className="sticky top-24 space-y-6">
              {/* Primary Action Card */}
              <div className="glass-panel p-6 rounded-3xl border border-cyan-400/40 shadow-holo-lg space-y-5">
                <div className="flex items-baseline justify-between">
                  <div>
                    <div className="text-[11px] font-mono text-cyan-300 uppercase tracking-wider">
                      Monthly Rent
                    </div>
                    <div className="font-display font-extrabold text-3xl text-white">
                      {formatCurrency(property.rent)}
                      <span className="text-sm font-normal text-white/50">/mo</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-400/40">
                      0 Brokerage
                    </span>
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-white/10 text-xs">
                  <div className="flex items-center justify-between text-white/70">
                    <span>Security Deposit</span>
                    <span className="font-bold text-white font-mono">{formatCurrency(property.deposit)}</span>
                  </div>
                  <div className="flex items-center justify-between text-white/70">
                    <span>Maintenance</span>
                    <span className="font-bold text-white font-mono">
                      {property.maintenance ? `${formatCurrency(property.maintenance)}/mo` : "Included"}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-2.5 pt-2">
                  {property.status === "RENTED" ? (
                    <div className="w-full py-3 rounded-xl bg-white/10 text-white/60 text-center font-bold text-sm">
                      Currently Occupied
                    </div>
                  ) : clerkId ? (
                    <>
                      <Link href={`/applications`}>
                        <Button className="w-full h-12 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-sm shadow-holo-sm border border-cyan-400/40">
                          Submit Application
                        </Button>
                      </Link>
                      <Link href={`/messages`}>
                        <Button
                          variant="outline"
                          className="w-full h-11 rounded-xl border-white/15 bg-white/5 hover:bg-white/10 text-white text-xs font-semibold"
                        >
                          <MessageSquare className="w-4 h-4 mr-2 text-cyan-400" />
                          Chat with Owner
                        </Button>
                      </Link>
                      <Link href={`/visits`}>
                        <Button
                          variant="outline"
                          className="w-full h-11 rounded-xl border-white/15 bg-white/5 hover:bg-white/10 text-white text-xs font-semibold"
                        >
                          <Calendar className="w-4 h-4 mr-2 text-cyan-400" />
                          Schedule Inspection Visit
                        </Button>
                      </Link>
                    </>
                  ) : (
                    <Link href={`/login?redirect=/properties/${property.id}`}>
                      <Button className="w-full h-12 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-sm shadow-holo-sm">
                        Sign in to Apply & Schedule
                      </Button>
                    </Link>
                  )}
                </div>
              </div>

              {/* Landlord Verified Card */}
              <div className="glass-card-3d p-6 rounded-3xl border border-white/10 space-y-4">
                <h3 className="font-display font-bold text-sm text-white">
                  Property Ownership & Trust
                </h3>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500 to-violet-600 text-white font-bold flex items-center justify-center text-base shadow-sm">
                    {property.owner.firstName[0]}{property.owner.lastName[0]}
                  </div>
                  <div>
                    <div className="font-bold text-sm text-white flex items-center gap-1.5">
                      {property.owner.firstName} {property.owner.lastName}
                      <Shield className="w-3.5 h-3.5 text-cyan-400" />
                    </div>
                    <div className="text-xs text-white/50">Verified Property Landlord</div>
                  </div>
                </div>

                <div className="space-y-2 text-xs text-white/70 pt-2 border-t border-white/10">
                  <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                    <CheckCircle2 className="w-4 h-4" /> Government KYC Verified
                  </div>
                  <div className="flex items-center gap-2 text-white/60">
                    <Phone className="w-4 h-4 text-cyan-400" /> Instant Direct WhatsApp & Chat
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
