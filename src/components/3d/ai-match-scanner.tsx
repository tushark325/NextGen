"use client";

import React, { useState, useEffect } from "react";
import { Sparkles, CheckCircle2, X, ArrowRight, Zap, Shield, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import confetti from "canvas-confetti";

interface AIMatchScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

const SCAN_STEPS = [
  "Analyzing tenant lifestyle & commute requirements...",
  "Scanning active verified property nodes in Mumbai & Bangalore...",
  "Evaluating budget limits & monthly utility thresholds...",
  "Matching pet rules, furnishing & power backup requirements...",
  "Computing mutual landlord-tenant compatibility scores...",
  "Synthesizing optimal property recommendations...",
];

export function AIMatchScanner({ isOpen, onClose, onComplete }: AIMatchScannerProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setCurrentStepIndex(0);
      setIsDone(false);
      return;
    }

    const interval = setInterval(() => {
      setCurrentStepIndex((prev) => {
        if (prev < SCAN_STEPS.length - 1) {
          return prev + 1;
        } else {
          clearInterval(interval);
          setIsDone(true);
          try {
            confetti({
              particleCount: 80,
              spread: 70,
              origin: { y: 0.6 },
              colors: ["#00f2fe", "#7f00ff", "#f107a3"],
            });
          } catch {
            // Safe fallback if confetti isn't supported
          }
          return prev;
        }
      });
    }, 700);

    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-fade-in">
      <div className="relative w-full max-w-lg glass-panel rounded-3xl p-6 sm:p-8 border border-cyan-400/50 shadow-holo-lg scanline-effect text-center space-y-6">
        {/* Skip / Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-white/50 hover:text-white hover:bg-white/10 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Central Rotating Holographic Orb / Radar */}
        <div className="relative w-28 h-28 mx-auto flex items-center justify-center">
          {/* Pulsing rings */}
          <div className="absolute inset-0 rounded-full border-2 border-cyan-400/40 animate-ping" />
          <div className="absolute inset-2 rounded-full border-2 border-violet-500/50 animate-pulse" />
          <div className="match-ring-outer w-20 h-20 shadow-holo-md">
            <div className="match-ring-inner">
              <Sparkles className="w-8 h-8 text-cyan-300 animate-spin-slow" />
            </div>
          </div>
        </div>

        {/* Status Text Sequence */}
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/15 border border-cyan-400/40 text-cyan-300 text-xs font-mono mb-3 shadow-holo-sm">
            <Zap className="w-3.5 h-3.5 animate-pulse" />
            AI MUTUAL MATCH™ ENGINE
          </div>

          <h3 className="font-display font-bold text-xl sm:text-2xl text-white mb-2">
            {isDone ? "High-Quality Matches Found!" : "Scanning Property Matrix"}
          </h3>

          <p className="text-xs sm:text-sm text-cyan-300/80 font-mono min-h-[40px] flex items-center justify-center">
            {isDone
              ? "Successfully computed top compatibility recommendations."
              : SCAN_STEPS[currentStepIndex]}
          </p>
        </div>

        {/* Progress Dots */}
        <div className="flex items-center justify-center gap-2">
          {SCAN_STEPS.map((_, i) => (
            <span
              key={i}
              className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                i <= currentStepIndex
                  ? "bg-cyan-400 shadow-holo-sm scale-110"
                  : "bg-white/15"
              }`}
            />
          ))}
        </div>

        {/* Actions */}
        <div className="pt-2 flex items-center justify-center gap-3">
          {isDone ? (
            <Button
              onClick={() => {
                onComplete();
                onClose();
              }}
              className="h-11 px-8 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-sm shadow-holo-md border border-cyan-400/40"
            >
              Reveal Matched Properties <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button
              variant="outline"
              onClick={() => {
                setIsDone(true);
                onComplete();
                onClose();
              }}
              className="h-9 px-4 rounded-xl border-white/20 text-white/70 hover:text-white text-xs font-semibold"
            >
              Skip Animation →
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
