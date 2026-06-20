'use client';

import React, { useState, useRef } from 'react';
import { Compass, Play, Sparkles } from 'lucide-react';
import gsap from 'gsap';

interface HeroHUDProps {
  onExplore: () => void;
}

export const HeroHUD: React.FC<HeroHUDProps> = ({ onExplore }) => {
  const [visible, setVisible] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleExploreClick = () => {
    // GSAP Outward shrink & slide down
    if (containerRef.current) {
      gsap.to(containerRef.current, {
        opacity: 0,
        y: 80,
        scale: 0.95,
        duration: 0.6,
        ease: 'power3.inOut',
        onComplete: () => {
          setVisible(false);
          onExplore();
        }
      });
    }
  };

  if (!visible) return null;

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none p-6"
    >
      {/* Background soft fog overlay */}
      <div className="absolute inset-0 bg-slate-950/20 backdrop-blur-[3px] pointer-events-auto" />

      {/* Main Glassmorphic Panel */}
      <div className="relative w-full max-w-xl p-8 md:p-10 rounded-[32px] bg-slate-950/80 backdrop-blur-xl border border-white/10 shadow-[0_24px_80px_rgba(0,0,0,0.8)] pointer-events-auto flex flex-col items-center text-center gap-6">
        
        {/* Glowing badge */}
        <div className="px-4 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-[#00ff88] font-mono text-[10px] tracking-widest uppercase flex items-center gap-1.5 shadow-[0_0_15px_rgba(0,255,136,0.15)]">
          <Sparkles className="w-3.5 h-3.5" />
          FLIPKART GRID HACKATHON
        </div>

        {/* Headlines */}
        <div className="flex flex-col gap-3">
          <h1 className="font-display font-black text-4xl md:text-5xl tracking-tight text-white leading-[1.05]">
            We Predict Traffic <br />
            <span className="bg-gradient-to-r from-[#00ff88] via-[#00baff] to-[#ecc94b] bg-clip-text text-transparent">
              Before It Happens
            </span>
          </h1>
          <p className="text-slate-300 text-sm md:text-base font-light leading-relaxed max-w-md mx-auto">
            AI-powered traffic forecasting that predicts congestion, optimizes signals, and prevents gridlock before it starts.
          </p>
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 w-full max-w-sm mt-2">
          {/* Main explore CTA */}
          <button
            onClick={handleExploreClick}
            className="flex-1 h-12 rounded-xl bg-gradient-to-r from-[#00ff88] to-[#00baff] text-slate-950 font-display font-bold text-sm tracking-wide shadow-[0_4px_25px_rgba(0,255,136,0.3)] hover:shadow-[0_4px_35px_rgba(0,255,136,0.5)] hover:scale-[1.01] transition-all flex items-center justify-center gap-2"
          >
            <Compass className="w-4 h-4" />
            Explore Live Traffic
          </button>

          {/* watch simulation secondary button */}
          <button
            onClick={handleExploreClick}
            className="flex-1 h-12 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 font-display font-medium text-sm tracking-wide transition-all flex items-center justify-center gap-2"
          >
            <Play className="w-4 h-4 fill-white" />
            Watch Simulation
          </button>
        </div>

        {/* Telemetry info line */}
        <div className="border-t border-white/5 w-full pt-4 font-mono text-[9px] text-slate-500 tracking-widest">
          SYS_STATUS: ACTIVE // MODEL_VER: 7.0_PROT
        </div>
      </div>
    </div>
  );
};
