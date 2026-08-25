"use client";

import React from "react";
import { formatCurrency } from "@/types";
import { Layers, ShieldCheck, Zap, Home, Sparkles } from "lucide-react";

interface CostBreakdownProps {
  rent: number;
  deposit: number;
  maintenance?: number | null;
  estimatedTotal?: number | null;
}

export function CostBreakdown3D({
  rent,
  deposit,
  maintenance = 0,
  estimatedTotal,
}: CostBreakdownProps) {
  const maintAmount = maintenance || Math.round(rent * 0.08);
  const utilitiesEst = 2200;
  const computedTotal = estimatedTotal || rent + maintAmount + utilitiesEst;

  const rentPct = Math.round((rent / computedTotal) * 100);
  const maintPct = Math.round((maintAmount / computedTotal) * 100);
  const utilPct = 100 - rentPct - maintPct;

  return (
    <div className="glass-card-3d p-6 rounded-2xl border border-white/10 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-cyan-400" />
          <h3 className="font-display font-bold text-lg text-white">
            Transparent Cost Breakdown
          </h3>
        </div>
        <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/15 border border-cyan-400/30 text-cyan-300 text-[11px] font-mono">
          Zero Brokerage
        </span>
      </div>

      {/* Stacked Visual Bar */}
      <div className="space-y-2">
        <div className="h-4 w-full rounded-full bg-white/5 overflow-hidden flex p-0.5 gap-1 border border-white/10">
          <div
            style={{ width: `${rentPct}%` }}
            className="h-full rounded-l-full bg-gradient-to-r from-cyan-500 to-blue-500 shadow-holo-sm"
            title={`Rent: ${rentPct}%`}
          />
          <div
            style={{ width: `${maintPct}%` }}
            className="h-full bg-gradient-to-r from-violet-500 to-purple-500"
            title={`Maintenance: ${maintPct}%`}
          />
          <div
            style={{ width: `${utilPct}%` }}
            className="h-full rounded-r-full bg-gradient-to-r from-pink-500 to-rose-500"
            title={`Utilities: ${utilPct}%`}
          />
        </div>
        <div className="flex justify-between text-[11px] font-mono text-white/50 px-1">
          <span>Base Rent ({rentPct}%)</span>
          <span>Maintenance ({maintPct}%)</span>
          <span>Utilities ({utilPct}%)</span>
        </div>
      </div>

      {/* Itemized Stacked Layers */}
      <div className="space-y-2.5 text-xs">
        <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-holo-sm" />
            <span className="text-white/80">Monthly Base Rent</span>
          </div>
          <span className="font-mono font-bold text-white text-sm">
            {formatCurrency(rent)}
          </span>
        </div>

        <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-violet-400" />
            <span className="text-white/80">Society Maintenance & Amenities</span>
          </div>
          <span className="font-mono font-bold text-white text-sm">
            {formatCurrency(maintAmount)}
          </span>
        </div>

        <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-pink-400" />
            <span className="text-white/80">Estimated Utilities (Electricity/WiFi)</span>
          </div>
          <span className="font-mono font-bold text-white text-sm">
            ~{formatCurrency(utilitiesEst)}
          </span>
        </div>
      </div>

      {/* Total & Deposit Footer */}
      <div className="pt-4 border-t border-white/10 flex items-center justify-between">
        <div>
          <div className="text-[11px] text-cyan-300 font-mono uppercase tracking-wider">
            Total Monthly Outflow
          </div>
          <div className="font-display font-bold text-2xl text-white">
            {formatCurrency(computedTotal)}
            <span className="text-xs font-normal text-white/50">/month</span>
          </div>
        </div>

        <div className="text-right">
          <div className="text-[11px] text-white/50 font-mono">Refundable Deposit</div>
          <div className="font-mono font-bold text-base text-cyan-300">
            {formatCurrency(deposit)}
          </div>
        </div>
      </div>
    </div>
  );
}
