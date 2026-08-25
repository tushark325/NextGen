"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import {
  performanceManager,
  type PerformanceTier,
  type SystemCapabilities,
} from "@/lib/performance-manager";

interface PerformanceContextType {
  tier: PerformanceTier;
  capabilities: SystemCapabilities;
  setTier: (tier: PerformanceTier) => void;
  isUltra: boolean;
  isStandard: boolean;
  isLite: boolean;
}

const PerformanceContext = createContext<PerformanceContextType>({
  tier: "standard",
  capabilities: {
    tier: "standard",
    hasWebGL: true,
    hasWebGL2: true,
    prefersReducedMotion: false,
    deviceMemoryGB: 4,
    hardwareConcurrency: 4,
    isMobile: false,
    fps: 60,
  },
  setTier: () => {},
  isUltra: false,
  isStandard: true,
  isLite: false,
});

export function PerformanceProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [tier, setTierState] = useState<PerformanceTier>("standard");
  const [capabilities, setCapabilities] = useState<SystemCapabilities>(
    performanceManager.getCapabilities()
  );

  useEffect(() => {
    performanceManager.init();
    setCapabilities(performanceManager.getCapabilities());
    const unsubscribe = performanceManager.subscribe((newTier) => {
      setTierState(newTier);
      setCapabilities(performanceManager.getCapabilities());
    });
    return unsubscribe;
  }, []);

  const setTier = (newTier: PerformanceTier) => {
    performanceManager.setTier(newTier);
  };

  return (
    <PerformanceContext.Provider
      value={{
        tier,
        capabilities,
        setTier,
        isUltra: tier === "ultra",
        isStandard: tier === "standard" || tier === "ultra",
        isLite: tier === "lite",
      }}
    >
      {children}
    </PerformanceContext.Provider>
  );
}

export function usePerformance() {
  return useContext(PerformanceContext);
}
