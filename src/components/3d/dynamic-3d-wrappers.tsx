"use client";

import dynamic from "next/dynamic";

export const HeroCityScene = dynamic(
  () => import("@/components/3d/hero-city-scene").then((mod) => mod.HeroCityScene),
  { ssr: false }
);

export const AmbientParticles = dynamic(
  () => import("@/components/3d/ambient-particles").then((mod) => mod.AmbientParticles),
  { ssr: false }
);
