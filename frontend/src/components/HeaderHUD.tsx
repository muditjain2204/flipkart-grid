'use client';

import React, { useEffect, useState } from 'react';
import { Cpu, CloudRain, Bell, ShieldAlert } from 'lucide-react';
import { useStore } from '../store/useStore';

export const HeaderHUD: React.FC = () => {
  const [timeStr, setTimeStr] = useState('01:23:00 UTC');
  const emergencyActive = useStore((state) => state.emergencyActive);

  useEffect(() => {
    // Standard static base time from user session metadata to maintain synchronization
    const base = new Date('2026-06-19T01:23:00Z');
    let secs = 0;
    
    const interval = setInterval(() => {
      secs++;
      const current = new Date(base.getTime() + secs * 1000);
      const hrs = String(current.getUTCHours()).padStart(2, '0');
      const mins = String(current.getUTCMinutes()).padStart(2, '0');
      const s = String(current.getUTCSeconds()).padStart(2, '0');
      setTimeStr(`${hrs}:${mins}:${s} UTC`);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <header className="fixed top-6 left-6 right-6 h-16 z-50 pointer-events-none flex justify-between items-center">
      {/* Top Left: Logo */}
      <div className="pointer-events-auto flex items-center gap-3 px-5 h-full rounded-full bg-slate-950/75 backdrop-blur-md border border-white/10 shadow-2xl">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#00ff88] to-[#00baff] flex items-center justify-center text-slate-950">
          <Cpu className="w-5 h-5 animate-pulse" />
        </div>
        <div>
          <span className="font-display font-extrabold text-sm tracking-tight text-white block">
            TRAFFIC AI
          </span>
          <span className="font-mono text-[9px] tracking-widest text-[#00ff88] block">
            CENTRAL_NODE_01
          </span>
        </div>
      </div>

      {/* Top Right: Time, Weather & Alerts */}
      <div className="pointer-events-auto flex items-center gap-4 h-full">
        {/* Weather node */}
        <div className="hidden sm:flex items-center gap-2.5 px-4 h-full rounded-full bg-slate-950/75 backdrop-blur-md border border-white/10 text-slate-300 font-mono text-xs">
          <CloudRain className="w-4 h-4 text-[#00baff]" />
          <span>BENGALURU: 24°C / RAIN CHANCE 12%</span>
        </div>

        {/* Live Running clock */}
        <div className="flex items-center gap-2 px-5 h-full rounded-full bg-slate-950/75 backdrop-blur-md border border-white/10 text-white font-mono text-xs tracking-wider">
          <span className="w-2 h-2 rounded-full bg-[#00ff88] shadow-[0_0_8px_#00ff88]" />
          <span>{timeStr}</span>
        </div>

        {/* Emergency Alert indicator */}
        <div className={`flex items-center justify-center w-12 h-full rounded-full border transition-all duration-300 ${
          emergencyActive 
            ? 'bg-red-500/20 border-red-500 text-red-500 shadow-[0_0_15px_rgba(255,59,48,0.25)] animate-pulse' 
            : 'bg-slate-950/75 border-white/10 text-slate-300'
        }`}>
          {emergencyActive ? (
            <ShieldAlert className="w-5 h-5" />
          ) : (
            <Bell className="w-5 h-5" />
          )}
        </div>
      </div>
    </header>
  );
};
