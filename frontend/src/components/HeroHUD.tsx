"use client";

import React from "react";
import Link from "next/link";
import { Sparkles, ArrowRight, BrainCircuit } from "lucide-react";

interface HeroHUDProps {
  onGetStarted: () => void;
}

export default function HeroHUD({ onGetStarted }: HeroHUDProps) {
  return (
    <div className="absolute top-20 left-1/2 -translate-x-1/2 z-30 text-center pointer-events-none w-full max-w-2xl px-4">
      {/* Platform Title — large and prominent */}
      <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-slate-800 drop-shadow-[0_2px_10px_rgba(255,255,255,0.6)] select-none leading-tight">
        AI Smartflow System
      </h1>

      {/* Glassmorphism Info Card */}
      <div className="relative mt-4 pointer-events-auto bg-white/10 backdrop-blur-lg border-[3px] border-white/50 rounded-3xl p-5 md:p-7 shadow-[0_8px_32px_rgba(0,0,0,0.1)] transition-all duration-500 hover:bg-white/20">
        
        {/* Three Lights on Border */}
        <div className="absolute top-4 left-5 flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
          <div className="w-3 h-3 rounded-full bg-yellow-400 shadow-[0_0_8px_rgba(250,204,21,0.8)]" />
          <div className="w-3 h-3 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)]" />
        </div>

        <div className="flex flex-col items-center gap-3 mt-2">
          <div className="space-y-1.5">
            <p className="text-lg md:text-xl font-bold text-slate-800 drop-shadow-[0_1px_2px_rgba(255,255,255,0.8)]">
              that predicts future of heavy traffic
            </p>
            <p className="text-sm md:text-base font-bold text-emerald-700 drop-shadow-[0_1px_2px_rgba(255,255,255,0.8)]">
              saves the life of living ones
            </p>
          </div>

          {/* Get Started CTA — routes to dashboard */}
          <Link href="/dashboard" className="mt-3 block">
            <button
              className="px-7 py-3 text-sm font-bold text-white bg-gradient-to-r from-indigo-600 to-blue-600 rounded-full shadow-[0_4px_14px_rgba(79,70,229,0.35)] hover:shadow-[0_4px_20px_rgba(79,70,229,0.5)] hover:scale-[1.04] active:scale-95 transition-all duration-300 flex items-center gap-2 cursor-pointer w-full"
            >
              <Sparkles className="w-4 h-4" />
              Get Started
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
