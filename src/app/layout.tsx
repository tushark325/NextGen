import type { Metadata } from "next";
import { Inter, Outfit, JetBrains_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { QueryProvider } from "@/components/providers/query-provider";
import { PerformanceProvider } from "@/components/providers/performance-provider";
import { HolographicAIOrb } from "@/components/ai/holographic-ai-orb";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "NextGen — Spatial Real Estate & AI Discovery Experience",
    template: "%s | NextGen",
  },
  description:
    "India's premier 3D rental marketplace. Get matched with verified properties and landlords based on your lifestyle, budget, and spatial preferences.",
  keywords: [
    "rental",
    "property",
    "apartment",
    "flat",
    "3D real estate",
    "spatial computing",
    "tenant",
    "landlord",
    "Mumbai",
    "Bangalore",
    "Pune",
  ],
  authors: [{ name: "NextGen" }],
  creator: "NextGen",
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: process.env.NEXT_PUBLIC_APP_URL,
    title: "NextGen — Spatial Real Estate & AI Discovery Experience",
    description: "India's smartest rental marketplace with 3D spatial computing & AI matching.",
    siteName: "NextGen",
  },
  twitter: {
    card: "summary_large_image",
    title: "NextGen — Spatial Real Estate & AI Discovery Experience",
    description: "Explore homes with interactive 3D floor plans and AI compatibility scoring.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en" className="dark" suppressHydrationWarning>
        <head>
        </head>
        <body className={`${inter.variable} ${outfit.variable} ${jetbrainsMono.variable} font-sans antialiased bg-[#050814] text-foreground`}>
          <ThemeProvider attribute="class" defaultTheme="dark" forcedTheme="dark">
            <QueryProvider>
              <PerformanceProvider>
                {children}
                {/* Global Holographic AI Assistant Orb */}
                <HolographicAIOrb />
                <Toaster richColors position="top-right" />
              </PerformanceProvider>
            </QueryProvider>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
