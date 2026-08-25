"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { useUser, UserButton, SignedIn, SignedOut } from "@clerk/nextjs";
import {
  Menu,
  X,
  Home,
  Search,
  Sparkles,
  Bell,
  Sliders,
  Cpu,
  Bot,
  Compass,
  FileText,
  MessageSquare,
  Calendar,
  Heart,
  PlusCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { usePerformance } from "@/components/providers/performance-provider";
import { type PerformanceTier } from "@/lib/performance-manager";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showPerfMenu, setShowPerfMenu] = useState(false);
  const pathname = usePathname();
  const isLanding = pathname === "/";
  const { tier, setTier } = usePerformance();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const tierLabels: Record<PerformanceTier, { label: string; icon: string }> = {
    ultra: { label: "Ultra 3D", icon: "✨" },
    standard: { label: "Standard 3D", icon: "⚡" },
    lite: { label: "Lite 2D", icon: "🍃" },
  };

  return (
    <nav className="fixed top-3 left-0 right-0 z-50 px-3 sm:px-6">
      <div
        className={cn(
          "max-w-7xl mx-auto rounded-2xl transition-all duration-300",
          scrolled || !isLanding
            ? "glass-dock bg-[rgba(8,12,30,0.85)] border border-white/15 shadow-holo-sm py-1.5"
            : "bg-[rgba(10,15,36,0.6)] backdrop-blur-xl border border-white/10 py-2 shadow-lg"
        )}
      >
        <div className="px-4 sm:px-6 flex items-center justify-between h-14">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 shrink-0 group">
            <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-400 via-blue-600 to-violet-600 p-[1px] shadow-holo-sm group-hover:scale-105 transition-transform duration-300">
              <div className="w-full h-full bg-[#070b1e] rounded-[11px] flex items-center justify-center">
                <Home className="w-4 h-4 text-cyan-300" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="font-display font-bold text-lg text-white tracking-wide flex items-center gap-1.5">
                NextGen
                <span className="px-1.5 py-0.2 rounded-md bg-cyan-500/20 text-[10px] font-mono text-cyan-300 border border-cyan-400/30">
                  3D
                </span>
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/10 backdrop-blur-md">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "relative px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 flex items-center gap-1.5",
                    isActive
                      ? "text-cyan-300 bg-cyan-500/15 border border-cyan-400/30 shadow-holo-sm"
                      : "text-white/70 hover:text-white hover:bg-white/10"
                  )}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {link.label}
                  {isActive && (
                    <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-3 h-0.5 rounded-full bg-cyan-400 shadow-holo-sm" />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Right Side Tools */}
          <div className="hidden md:flex items-center gap-2.5">
            {/* Performance Mode Switcher */}
            <div className="relative">
              <button
                onClick={() => setShowPerfMenu(!showPerfMenu)}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-medium text-white/80 transition-colors"
                title="Rendering Mode"
              >
                <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                <span className="text-[11px]">{tierLabels[tier].icon} {tierLabels[tier].label}</span>
              </button>

              {showPerfMenu && (
                <div className="absolute right-0 mt-2 w-44 glass-panel p-1.5 rounded-xl border border-cyan-500/30 shadow-holo-md animate-scale-in z-50">
                  {(["ultra", "standard", "lite"] as PerformanceTier[]).map((t) => (
                    <button
                      key={t}
                      onClick={() => {
                        setTier(t);
                        setShowPerfMenu(false);
                      }}
                      className={cn(
                        "w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-colors",
                        tier === t
                          ? "bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-400/30"
                          : "text-white/70 hover:text-white hover:bg-white/10"
                      )}
                    >
                      <span className="flex items-center gap-1.5">
                        {tierLabels[t].icon} {tierLabels[t].label}
                      </span>
                      {tier === t && <span className="text-[10px] text-cyan-400">✓</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Auth Buttons */}
            <SignedOut>
              <Link href="/login">
                <Button
                  variant="ghost"
                  size="sm"
                  className="rounded-xl text-xs h-9 text-white/80 hover:text-white hover:bg-white/10"
                >
                  Sign in
                </Button>
              </Link>
              <Link href="/register">
                <Button
                  size="sm"
                  className="rounded-xl text-xs h-9 px-4 font-semibold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-holo-sm border border-cyan-400/40"
                >
                  Get Started
                </Button>
              </Link>
            </SignedOut>

            <SignedIn>
              <Link href="/dashboard">
                <Button variant="ghost" size="sm" className="rounded-xl text-xs h-9 text-cyan-300 hover:bg-cyan-500/10">
                  Command Center
                </Button>
              </Link>
              <Link href="/notifications">
                <Button variant="ghost" size="icon" className="w-9 h-9 rounded-xl relative hover:bg-white/10">
                  <Bell className="w-4 h-4 text-white/80" />
                </Button>
              </Link>
              <UserButton
                appearance={{
                  elements: {
                    avatarBox: "w-8 h-8 rounded-xl ring-2 ring-cyan-500/40",
                  },
                }}
              />
            </SignedIn>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden p-2 rounded-xl text-white hover:bg-white/10 transition-colors"
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="lg:hidden mt-2 max-w-7xl mx-auto glass-panel rounded-2xl p-4 border border-white/15 animate-fade-in shadow-2xl">
          <div className="space-y-1 mb-4">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-white/80 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <Icon className="w-4 h-4 text-cyan-400" />
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* Tier Switcher on Mobile */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10 mb-4 text-xs">
            <span className="text-white/60">Rendering Tier:</span>
            <div className="flex gap-1">
              {(["ultra", "standard", "lite"] as PerformanceTier[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setTier(t)}
                  className={cn(
                    "px-2 py-1 rounded-lg text-[11px] font-medium transition-colors",
                    tier === t
                      ? "bg-cyan-500 text-white font-bold"
                      : "bg-white/5 text-white/60"
                  )}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-white/10 flex flex-col gap-2">
            <SignedOut>
              <Link href="/login" onClick={() => setIsOpen(false)}>
                <Button variant="outline" className="w-full rounded-xl text-white border-white/20">
                  Sign in
                </Button>
              </Link>
              <Link href="/register" onClick={() => setIsOpen(false)}>
                <Button className="w-full rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white">
                  Get Started
                </Button>
              </Link>
            </SignedOut>
            <SignedIn>
              <div className="flex items-center justify-between px-2 py-1">
                <span className="text-xs text-white/60">Active Session</span>
                <UserButton />
              </div>
            </SignedIn>
          </div>
        </div>
      )}
    </nav>
  );
}

const navLinks = [
  { label: "Find Homes", href: "/search", icon: Search },
  { label: "AI Matches", href: "/matches", icon: Sparkles },
  { label: "Applications", href: "/applications", icon: FileText },
  { label: "Messages", href: "/messages", icon: MessageSquare },
  { label: "Visits", href: "/visits", icon: Calendar },
  { label: "Saved", href: "/favorites", icon: Heart },
  { label: "List Property", href: "/landlord/properties/new", icon: PlusCircle },
];
