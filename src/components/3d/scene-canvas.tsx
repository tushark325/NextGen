"use client";

import React, { useEffect, useRef, useState } from "react";
import { usePerformance } from "@/components/providers/performance-provider";
import { AlertCircle } from "lucide-react";

interface SceneCanvasProps {
  onInit: (canvas: HTMLCanvasElement, container: HTMLDivElement) => (() => void) | void;
  className?: string;
  fallback?: React.ReactNode;
  pauseWhenHidden?: boolean;
}

export function SceneCanvas({
  onInit,
  className = "w-full h-full",
  fallback,
  pauseWhenHidden = true,
}: SceneCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hasError, setHasError] = useState(false);
  const [isIntersecting, setIsIntersecting] = useState(true);
  const { capabilities, isLite } = usePerformance();

  useEffect(() => {
    if (!pauseWhenHidden || !containerRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setIsIntersecting(entry.isIntersecting);
        });
      },
      { threshold: 0.05 }
    );

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [pauseWhenHidden]);

  useEffect(() => {
    if (!canvasRef.current || !containerRef.current || isLite || !capabilities.hasWebGL) {
      return;
    }

    let cleanup: (() => void) | void;
    try {
      cleanup = onInit(canvasRef.current, containerRef.current);
    } catch (err) {
      console.warn("WebGL Scene initialization failed, falling back gracefully:", err);
      setHasError(true);
    }

    return () => {
      if (typeof cleanup === "function") {
        try {
          cleanup();
        } catch (e) {
          console.error("Error during WebGL cleanup:", e);
        }
      }
    };
  }, [onInit, isLite, capabilities.hasWebGL]);

  if (isLite || !capabilities.hasWebGL || hasError) {
    if (fallback) return <>{fallback}</>;
    return (
      <div
        ref={containerRef}
        className={`relative overflow-hidden bg-gradient-to-br from-brand-950/60 to-purple-950/60 rounded-2xl flex items-center justify-center p-6 text-center ${className}`}
      >
        <div className="absolute inset-0 bg-cyber-grid opacity-20" />
        <div className="relative z-10">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center mx-auto mb-2 text-cyan-400">
            ✦
          </div>
          <p className="text-xs text-muted-foreground">Spatial Experience (2D Optimized)</p>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className={`relative overflow-hidden ${className}`}>
      <canvas
        ref={canvasRef}
        className="w-full h-full block outline-none touch-none"
        style={{ opacity: isIntersecting ? 1 : 0.2, transition: "opacity 0.3s ease" }}
      />
    </div>
  );
}
