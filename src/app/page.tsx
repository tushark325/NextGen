import type { Metadata } from "next";
import Link from "next/link";
import {
  Search,
  MapPin,
  Home,
  Shield,
  Zap,
  Star,
  ArrowRight,
  CheckCircle2,
  Users,
  Building2,
  TrendingUp,
  Sparkles,
  Layers,
  Cpu,
  Compass,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { HeroSearch } from "@/components/landing/hero-search";
import { FeaturedProperties } from "@/components/landing/featured-properties";
import { HowItWorks } from "@/components/landing/how-it-works";
import { StatsSection } from "@/components/landing/stats-section";
import { TestimonialsSection } from "@/components/landing/testimonials-section";
import { HeroCityScene, AmbientParticles } from "@/components/3d/dynamic-3d-wrappers";

export const metadata: Metadata = {
  title: "NextGen — Spatial Real Estate & AI Discovery Experience",
  description:
    "Explore India's premier 3D rental marketplace. Find properties matched to your lifestyle, commute, budget, and preferences in an immersive spatial computing environment.",
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#050814] text-foreground relative overflow-hidden">
      {/* Global Ambient Background Particles */}
      <AmbientParticles count={140} />

      {/* Cyber Grid Backdrop */}
      <div className="absolute inset-0 bg-cyber-grid opacity-25 pointer-events-none" />

      {/* Futuristic Navbar */}
      <Navbar />

      {/* ── HERO SECTION — 3D EXPERIENCE ─────────────────────────────────── */}
      <section className="relative pt-24 sm:pt-28 pb-16 md:pb-24 overflow-hidden">
        {/* Spatial background glow layers */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-gradient-to-tr from-cyan-500/15 via-violet-600/15 to-pink-500/10 rounded-full blur-[140px] pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center pt-8 sm:pt-12">
            
            {/* Left Content Column */}
            <div className="lg:col-span-6 text-center lg:text-left z-10">
              {/* Futuristic Pill Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-cyan-400/40 text-cyan-300 text-xs font-mono mb-6 backdrop-blur-xl shadow-holo-sm animate-fade-in">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                <span>SPATIAL REAL ESTATE & AI MATCHING</span>
              </div>

              {/* Main Cinematic Headline */}
              <h1 className="font-display text-4xl sm:text-6xl lg:text-7xl font-extrabold text-white leading-[1.1] tracking-tight mb-6">
                Find a home that{" "}
                <span className="text-gradient-holo">
                  fits your life.
                </span>
              </h1>

              <p className="text-base sm:text-lg text-white/70 max-w-xl mx-auto lg:mx-0 mb-8 leading-relaxed">
                Experience the next generation of property discovery. Explore verified architectural
                living spaces matched to your lifestyle, commute, and personal compatibility.
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 mb-10">
                <Link href="/search">
                  <Button
                    size="lg"
                    className="w-full sm:w-auto bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold text-sm px-8 h-13 rounded-xl shadow-holo-md border border-cyan-400/50"
                  >
                    <Compass className="w-4 h-4 mr-2" />
                    Find My Home
                  </Button>
                </Link>
                <Link href="/landlord/properties/new">
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full sm:w-auto border-white/20 hover:border-cyan-400/50 bg-white/5 hover:bg-white/10 text-white font-semibold text-sm px-8 h-13 rounded-xl backdrop-blur-xl"
                  >
                    <Building2 className="w-4 h-4 mr-2 text-cyan-400" />
                    List My Property
                  </Button>
                </Link>
              </div>

              {/* Quick Key Metrics */}
              <div className="grid grid-cols-3 gap-3 max-w-md mx-auto lg:mx-0 pt-4 border-t border-white/10 text-left">
                <div>
                  <div className="font-display font-bold text-xl text-white">96.4%</div>
                  <div className="text-[11px] font-mono text-white/50">Match Precision</div>
                </div>
                <div>
                  <div className="font-display font-bold text-xl text-cyan-300">0%</div>
                  <div className="text-[11px] font-mono text-white/50">Brokerage Fees</div>
                </div>
                <div>
                  <div className="font-display font-bold text-xl text-white">100%</div>
                  <div className="text-[11px] font-mono text-white/50">Verified KYC</div>
                </div>
              </div>
            </div>

            {/* Right Interactive 3D Architectural Scene */}
            <div className="lg:col-span-6 relative flex items-center justify-center">
              <HeroCityScene />
            </div>

          </div>

          {/* 3D Holographic Search Console */}
          <div className="mt-12 sm:mt-16 z-20 relative">
            <HeroSearch />
          </div>
        </div>
      </section>

      {/* ── STATS SECTION ────────────────────────────────────────────────── */}
      <StatsSection />

      {/* ── HOW IT WORKS ─────────────────────────────────────────────────── */}
      <HowItWorks />

      {/* ── FEATURED PROPERTIES (3D SPATIAL GALLERY) ────────────────────── */}
      <section className="section bg-[rgba(8,12,30,0.6)] backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-400/30 text-cyan-300 text-xs font-mono mb-3">
              ✦ DISCOVERY GALLERY
            </div>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-4">
              Properties matching top profiles
            </h2>
            <p className="text-white/60 text-base sm:text-lg max-w-xl mx-auto">
              Curated listings across India&apos;s major tech cities, verified and ready for smart matching.
            </p>
          </div>

          <FeaturedProperties />

          <div className="text-center mt-12">
            <Link href="/search">
              <Button
                variant="outline"
                size="lg"
                className="rounded-xl border-cyan-400/40 hover:bg-cyan-500/10 text-white font-semibold shadow-holo-sm px-8"
              >
                Browse All 3D Listings
                <ArrowRight className="w-4 h-4 ml-2 text-cyan-400" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── WHY NEXTGEN (FUTURISTIC CAPABILITIES) ────────────────────────── */}
      <section className="section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-400/30 text-violet-300 text-xs font-mono mb-3">
              ✦ INTELLIGENT PLATFORM
            </div>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-4">
              Engineered for the future of living
            </h2>
            <p className="text-white/60 text-base sm:text-lg max-w-xl mx-auto">
              We don&apos;t just list properties. We calculate lifestyle compatibility.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <div
                key={i}
                className="glass-card-3d p-6 group hover:border-cyan-400/50 hover:shadow-holo-md"
              >
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${f.iconBg} border border-white/10`}>
                  <f.icon className={`w-6 h-6 ${f.iconColor}`} />
                </div>
                <h3 className="font-display font-bold text-lg text-white mb-2 group-hover:text-cyan-300 transition-colors">
                  {f.title}
                </h3>
                <p className="text-white/60 text-sm leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── MUTUAL MATCH TECHNOLOGY (SIGNATURE BRAND MOMENT) ─────────────── */}
      <section className="section relative overflow-hidden bg-gradient-to-b from-[#080d24] via-[#0b1236] to-[#050814]">
        <div className="absolute inset-0 bg-cyber-grid opacity-30" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/15 border border-cyan-400/40 text-cyan-300 text-xs font-mono mb-6 backdrop-blur-md shadow-holo-sm">
            <Zap className="w-4 h-4 text-cyan-300 animate-pulse" />
            MUTUAL MATCH™ COMPATIBILITY ENGINE
          </div>

          <h2 className="font-display text-3xl sm:text-5xl font-extrabold text-white mb-6">
            Not 500 random properties.{" "}
            <span className="text-gradient-holo">The right 8.</span>
          </h2>

          <p className="text-white/70 text-base sm:text-lg mb-10 max-w-2xl mx-auto leading-relaxed">
            Our multi-variable AI algorithm computes compatibility from both sides — how well the
            living space fits your daily habits, and how likely the landlord is to select you.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register?role=TENANT">
              <Button
                size="lg"
                className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold px-8 rounded-xl shadow-holo-sm border border-cyan-400/40"
              >
                Find My Perfect Match
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Link href="/register?role=LANDLORD">
              <Button
                size="lg"
                variant="outline"
                className="border-white/20 bg-white/5 hover:bg-white/10 text-white font-semibold px-8 rounded-xl backdrop-blur-md"
              >
                Find Ideal Verified Tenants
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ─────────────────────────────────────────────────── */}
      <TestimonialsSection />

      {/* Footer */}
      <Footer />
    </div>
  );
}

const features = [
  {
    icon: Zap,
    iconBg: "bg-cyan-500/10",
    iconColor: "text-cyan-400",
    title: "AI Mutual Match™ Scoring",
    description:
      "Proprietary 2-way scoring. See your compatibility percentage across location, commute, budget, amenities, and lifestyle rules.",
  },
  {
    icon: Shield,
    iconBg: "bg-emerald-500/10",
    iconColor: "text-emerald-400",
    title: "Aadhaar & KYC Verified Profiles",
    description:
      "Direct connection with identity-verified landlords and tenants. Zero anonymous listings, zero fake profiles.",
  },
  {
    icon: MapPin,
    iconBg: "bg-indigo-500/10",
    iconColor: "text-indigo-400",
    title: "Spatial Location Intelligence",
    description:
      "Interactive 3D map exploration with commute calculators, nearby transit hubs, and neighborhood liveability clusters.",
  },
  {
    icon: CheckCircle2,
    iconBg: "bg-purple-500/10",
    iconColor: "text-purple-400",
    title: "All-Inclusive Cost Transparency",
    description:
      "Stacked 3D cost breakdowns: transparent monthly rent, maintenance fees, and utility projections with no hidden broker commissions.",
  },
  {
    icon: Users,
    iconBg: "bg-pink-500/10",
    iconColor: "text-pink-400",
    title: "Direct Digital Command Center",
    description:
      "Apply, message, schedule visits, and complete agreements directly inside your personal command dashboard.",
  },
  {
    icon: TrendingUp,
    iconBg: "bg-cyan-500/10",
    iconColor: "text-cyan-400",
    title: "Explainable Match Insights",
    description:
      "Actionable insights show exactly why a home is a top match and offer tips to boost your compatibility score.",
  },
];
