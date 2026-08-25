/**
 * NextGen Spatial Engine — Performance Manager
 * Detects device hardware, WebGL capabilities, prefers-reduced-motion,
 * and manages visual rendering fidelity tiers.
 */

export type PerformanceTier = "ultra" | "standard" | "lite";

export interface SystemCapabilities {
  tier: PerformanceTier;
  hasWebGL: boolean;
  hasWebGL2: boolean;
  prefersReducedMotion: boolean;
  deviceMemoryGB: number;
  hardwareConcurrency: number;
  isMobile: boolean;
  fps: number;
}

class PerformanceManager {
  private static instance: PerformanceManager;
  private currentTier: PerformanceTier = "standard";
  private capabilities: SystemCapabilities = {
    tier: "standard",
    hasWebGL: true,
    hasWebGL2: true,
    prefersReducedMotion: false,
    deviceMemoryGB: 4,
    hardwareConcurrency: 4,
    isMobile: false,
    fps: 60,
  };
  private listeners: Set<(tier: PerformanceTier) => void> = new Set();
  private isInitialized = false;

  private constructor() {}

  public static getInstance(): PerformanceManager {
    if (!PerformanceManager.instance) {
      PerformanceManager.instance = new PerformanceManager();
    }
    return PerformanceManager.instance;
  }

  public init() {
    if (this.isInitialized || typeof window === "undefined") return;
    this.isInitialized = true;

    // Check reduced motion preference
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    this.capabilities.prefersReducedMotion = mediaQuery.matches;
    mediaQuery.addEventListener("change", (e) => {
      this.capabilities.prefersReducedMotion = e.matches;
      if (e.matches) {
        this.setTier("lite");
      }
    });

    // Check Mobile
    this.capabilities.isMobile =
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      ) || window.innerWidth < 768;

    // Device Memory & Concurrency
    const nav = navigator as any;
    this.capabilities.deviceMemoryGB = nav.deviceMemory || 4;
    this.capabilities.hardwareConcurrency = nav.hardwareConcurrency || 4;

    // WebGL checks
    try {
      const canvas = document.createElement("canvas");
      this.capabilities.hasWebGL = !!(
        window.WebGLRenderingContext &&
        (canvas.getContext("webgl") || canvas.getContext("experimental-webgl"))
      );
      this.capabilities.hasWebGL2 = !!(
        window.WebGL2RenderingContext && canvas.getContext("webgl2")
      );
    } catch {
      this.capabilities.hasWebGL = false;
      this.capabilities.hasWebGL2 = false;
    }

    // Load saved user preference or calculate initial tier
    const saved = localStorage.getItem("nextgen_performance_tier") as PerformanceTier;
    if (saved && ["ultra", "standard", "lite"].includes(saved)) {
      this.currentTier = saved;
    } else if (this.capabilities.prefersReducedMotion || !this.capabilities.hasWebGL) {
      this.currentTier = "lite";
    } else if (
      this.capabilities.deviceMemoryGB >= 8 &&
      this.capabilities.hardwareConcurrency >= 6 &&
      !this.capabilities.isMobile
    ) {
      this.currentTier = "ultra";
    } else if (this.capabilities.isMobile) {
      this.currentTier = "standard";
    } else {
      this.currentTier = "standard";
    }

    this.capabilities.tier = this.currentTier;
  }

  public getCapabilities(): SystemCapabilities {
    return { ...this.capabilities, tier: this.currentTier };
  }

  public getTier(): PerformanceTier {
    return this.currentTier;
  }

  public setTier(tier: PerformanceTier) {
    this.currentTier = tier;
    this.capabilities.tier = tier;
    if (typeof window !== "undefined") {
      localStorage.setItem("nextgen_performance_tier", tier);
    }
    this.notify();
  }

  public subscribe(fn: (tier: PerformanceTier) => void): () => void {
    this.listeners.add(fn);
    fn(this.currentTier);
    return () => this.listeners.delete(fn);
  }

  private notify() {
    this.listeners.forEach((fn) => fn(this.currentTier));
  }
}

export const performanceManager = PerformanceManager.getInstance();
