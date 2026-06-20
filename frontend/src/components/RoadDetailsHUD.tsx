'use client';

import React from 'react';
import { useStore } from '../store/useStore';
import { X, Navigation, ShieldAlert, Sparkles } from 'lucide-react';

export const RoadDetailsHUD: React.FC = () => {
  const selectedRoad = useStore((state) => state.selectedRoad);
  const setSelectedRoad = useStore((state) => state.setSelectedRoad);
  const spawnEmergency = useStore((state) => state.spawnEmergency);
  const emergencyActive = useStore((state) => state.emergencyActive);

  if (!selectedRoad) return null;

  // Determine status configurations
  const colors = {
    green: { border: 'border-emerald-500/30', bg: 'bg-emerald-500/10', text: 'text-emerald-400', glow: 'shadow-[0_0_15px_rgba(16,185,129,0.15)]' },
    yellow: { border: 'border-amber-500/30', bg: 'bg-amber-500/10', text: 'text-amber-400', glow: 'shadow-[0_0_15px_rgba(245,158,11,0.15)]' },
    red: { border: 'border-red-500/30', bg: 'bg-red-500/10', text: 'text-red-400', glow: 'shadow-[0_0_15px_rgba(239,68,68,0.15)]' },
  };

  const statusStyle = colors[selectedRoad.status] || colors.green;

  return (
    <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-xl z-50 pointer-events-auto p-6 rounded-[24px] bg-slate-950/85 backdrop-blur-md border border-white/10 ${statusStyle.glow} flex flex-col gap-5`}>
      {/* Header bar */}
      <div className="flex justify-between items-center border-b border-white/5 pb-3">
        <div className="flex items-center gap-2.5 text-white">
          <Navigation className="w-5 h-5 text-[#00baff] transform rotate-45" />
          <div>
            <h3 className="font-display font-extrabold text-sm tracking-tight">
              {selectedRoad.name}
            </h3>
            <span className="font-mono text-[9px] text-slate-400 tracking-wider">
              ROADWAY INTERSECTION SEGMENT TELEMETRY
            </span>
          </div>
        </div>

        {/* Close Button */}
        <button 
          onClick={() => setSelectedRoad(null)}
          className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/5 transition-all"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Grid details */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Congestion slider metrics */}
        <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 flex flex-col gap-1 col-span-2">
          <span className="text-[10px] font-mono text-slate-400">CONGESTION METRIC</span>
          <div className="flex justify-between items-baseline mt-1">
            <span className="text-3xl font-black font-mono text-white">{selectedRoad.congestion}%</span>
            <span className={`text-[10px] font-mono font-bold uppercase tracking-wider ${statusStyle.text}`}>
              {selectedRoad.status === 'red' ? 'Heavy Bottleneck' : selectedRoad.status === 'yellow' ? 'Moderate Load' : 'Free Flow'}
            </span>
          </div>
          <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden mt-1">
            <div 
              className={`h-full transition-all duration-500 ${
                selectedRoad.status === 'red' ? 'bg-red-500' : selectedRoad.status === 'yellow' ? 'bg-amber-500' : 'bg-emerald-500'
              }`}
              style={{ width: `${selectedRoad.congestion}%` }}
            />
          </div>
        </div>

        {/* Vehicle count */}
        <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 flex flex-col gap-1">
          <span className="text-[10px] font-mono text-slate-400">VEHICLES</span>
          <span className="text-xl font-bold font-mono text-white mt-1">{selectedRoad.vehiclesCount}</span>
        </div>

        {/* Avg speed */}
        <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 flex flex-col gap-1">
          <span className="text-[10px] font-mono text-slate-400">AVG SPEED</span>
          <span className="text-xl font-bold font-mono text-white mt-1">{selectedRoad.avgSpeed} km/h</span>
        </div>

        {/* Predicted jam time */}
        <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 flex flex-col gap-1">
          <span className="text-[10px] font-mono text-slate-400">JAM EXPECTED</span>
          <span className="text-sm font-bold font-mono text-white mt-1.5 truncate">{selectedRoad.predictedJamTime}</span>
        </div>

        {/* ETA */}
        <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 flex flex-col gap-1">
          <span className="text-[10px] font-mono text-slate-400">CONGESTION ETA</span>
          <span className="text-sm font-bold font-mono text-white mt-1.5 truncate">{selectedRoad.etaToCongestion}</span>
        </div>

        {/* Action card: Priority Clearing trigger */}
        <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 flex flex-col gap-1 col-span-2">
          <span className="text-[10px] font-mono text-slate-400">NEURAL BYPASS ACTION</span>
          <button
            disabled={emergencyActive}
            onClick={spawnEmergency}
            className={`mt-1.5 h-10 w-full rounded-lg font-mono text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              emergencyActive 
                ? 'bg-red-500/20 text-red-500 border border-red-500/30 cursor-not-allowed' 
                : 'bg-gradient-to-r from-[#00ff88] to-[#00baff] text-slate-950 font-bold hover:shadow-[0_0_12px_#00ff88] hover:scale-[1.01]'
            }`}
          >
            {emergencyActive ? (
              <>
                <ShieldAlert className="w-3.5 h-3.5 animate-bounce" />
                BYPASS PRIORITY ACTIVE
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                CLEAR BOTTLENECK NOW
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
