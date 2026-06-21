"use client";

import React, { useEffect, useState } from "react";
import { X, ShieldAlert, Cpu, Gauge, Navigation, Compass } from "lucide-react";

export interface VehicleData {
  id: string;
  type: string;
  speed: number;
  color: string;
  congestionImpact: "LOW" | "MODERATE" | "HIGH" | "CRITICAL";
  lane: number;
  agentAnalysis: string[];
  theta?: number;
  radius?: number;
}

interface VehicleDetailsHUDProps {
  vehicle: VehicleData | null;
  onClose: () => void;
}

export default function VehicleDetailsHUD({ vehicle, onClose }: VehicleDetailsHUDProps) {
  const [activeLogIndex, setActiveLogIndex] = useState(0);

  useEffect(() => {
    if (!vehicle) return;
    setActiveLogIndex(0);
    const interval = setInterval(() => {
      setActiveLogIndex((prev) => (prev < vehicle.agentAnalysis.length - 1 ? prev + 1 : prev));
    }, 1500);

    return () => clearInterval(interval);
  }, [vehicle]);

  if (!vehicle) return null;

  const impactColors = {
    LOW: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    MODERATE: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20",
    HIGH: "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20",
    CRITICAL: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",
  };

  return (
    <div className="fixed right-6 bottom-6 z-40 w-full max-w-sm bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/40 dark:border-slate-800/50 rounded-3xl shadow-2xl p-6 animate-in slide-in-from-bottom-5 duration-300">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <div
            className="w-4 h-4 rounded-full border border-white/20"
            style={{ backgroundColor: vehicle.color }}
          />
          <h3 className="font-extrabold text-slate-800 dark:text-white uppercase tracking-wider text-sm">
            {vehicle.type} Analysis
          </h3>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-white transition"
        >
          <X className="w-4.5 h-4.5" />
        </button>
      </div>

      {/* Speed & Direction Cards */}
      <div className="grid grid-cols-2 gap-3 mt-4">
        {/* Speed Card */}
        <div className="bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/50 rounded-2xl p-3 flex flex-col items-center">
          <Gauge className="w-5 h-5 text-indigo-500 mb-1" />
          <span className="text-2xl font-black text-slate-850 dark:text-slate-100">
            {vehicle.speed} <span className="text-xs font-semibold text-slate-400">km/h</span>
          </span>
          <span className="text-[10px] font-bold text-slate-450 dark:text-slate-500 uppercase tracking-widest mt-1">
            Current Speed
          </span>
        </div>

        {/* Impact Level */}
        <div className="bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/50 rounded-2xl p-3 flex flex-col items-center justify-between">
          <ShieldAlert className="w-5 h-5 text-indigo-500 mb-1" />
          <div
            className={`px-2.5 py-0.5 rounded-full text-xs font-black border ${
              impactColors[vehicle.congestionImpact]
            }`}
          >
            {vehicle.congestionImpact}
          </div>
          <span className="text-[10px] font-bold text-slate-450 dark:text-slate-500 uppercase tracking-widest mt-1">
            Predicted Risk
          </span>
        </div>
      </div>

      {/* Lane & Vector Metadata */}
      <div className="mt-4 flex gap-4 text-xs font-bold text-slate-500 dark:text-slate-450 bg-slate-50 dark:bg-slate-800/20 py-2.5 px-4 rounded-xl border border-slate-100 dark:border-slate-800/30">
        <div className="flex items-center gap-1.5 flex-1">
          <Navigation className="w-3.5 h-3.5 text-indigo-500/70 rotate-90" />
          <span>Lane: {vehicle.lane} of 4</span>
        </div>
        <div className="w-[1px] bg-slate-200 dark:bg-slate-800" />
        <div className="flex items-center gap-1.5 flex-1 justify-end">
          <Compass className="w-3.5 h-3.5 text-indigo-500/70" />
          <span>Vector: Polar Loop</span>
        </div>
      </div>

      {/* Agent Analysis Stream */}
      <div className="mt-4">
        <h4 className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-1.5 mb-2">
          <Cpu className="w-3.5 h-3.5 text-indigo-500 animate-pulse" /> Agent Logs Pipeline
        </h4>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 font-mono text-[11px] text-emerald-400 h-28 overflow-y-auto space-y-1.5 shadow-inner">
          {vehicle.agentAnalysis.slice(0, activeLogIndex + 1).map((log, index) => (
            <div key={index} className="flex gap-1.5 leading-relaxed animate-in fade-in slide-in-from-left-2 duration-300">
              <span className="text-emerald-600 select-none">&gt;</span>
              <span>{log}</span>
            </div>
          ))}
          {activeLogIndex < vehicle.agentAnalysis.length - 1 && (
            <div className="w-1.5 h-3 bg-emerald-400 animate-pulse ml-4 mt-1" />
          )}
        </div>
      </div>

      <button
        onClick={onClose}
        className="w-full mt-4 py-3 bg-indigo-650 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white font-bold text-xs uppercase tracking-wider rounded-2xl shadow-lg shadow-indigo-500/10 hover:shadow-indigo-500/30 transition duration-300 cursor-pointer"
      >
        Resume Traffic Stream
      </button>
    </div>
  );
}
