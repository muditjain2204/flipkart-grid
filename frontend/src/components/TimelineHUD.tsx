'use client';

import React from 'react';
import { useStore } from '../store/useStore';
import { Calendar, AlertTriangle, TrendingUp, RefreshCw } from 'lucide-react';

export const TimelineHUD: React.FC = () => {
  const metrics = useStore((state) => state.metrics);

  const forecast = [
    { time: '4:00 PM', status: 'Normal Flow', desc: 'No bottlenecks detected.', color: '#00ff88', bg: 'rgba(0,255,136,0.1)' },
    { time: '5:00 PM', status: 'Moderate Load', desc: 'Slight queue near expressway entry.', color: '#ffaa00', bg: 'rgba(255,170,0,0.1)' },
    { time: '6:00 PM', status: 'Heavy Density', desc: 'Gridlock forecast on ORR Corridor.', color: '#ff3b30', bg: 'rgba(255,59,48,0.1)' },
    { time: '7:00 PM', status: 'Severe Jam Expected', desc: 'Junction throughput drops by 45%.', color: '#ff3b30', bg: 'rgba(255,59,48,0.15)' },
  ];

  return (
    <aside className="fixed right-6 top-28 bottom-6 w-80 z-50 pointer-events-none flex flex-col gap-6 justify-between">
      {/* ─── Top Panel: Global Predictions ─── */}
      <div className="pointer-events-auto w-full p-5 rounded-[24px] bg-slate-950/75 backdrop-blur-md border border-white/10 shadow-2xl flex flex-col gap-4">
        <h3 className="font-mono text-[10px] tracking-widest text-[#00ff88] flex items-center gap-2">
          <Calendar className="w-3.5 h-3.5" />
          GLOBAL METRIC TELEMETRY
        </h3>

        {/* Global Score Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 flex flex-col gap-1">
            <span className="text-[9px] font-mono text-slate-400">SYS CAPACITY</span>
            <span className="text-xl font-bold text-white font-mono">{metrics.capacity}%</span>
          </div>

          <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 flex flex-col gap-1">
            <span className="text-[9px] font-mono text-slate-400">JAM CONFIDENCE</span>
            <span className="text-xl font-bold text-white font-mono">{metrics.confidence}%</span>
          </div>

          <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 flex flex-col gap-1 col-span-2">
            <span className="text-[9px] font-mono text-slate-400">CONGESTION SCORE</span>
            <div className="flex justify-between items-baseline">
              <span className="text-2xl font-black text-white font-mono">{metrics.congestionScore}%</span>
              <span className="text-[10px] text-[#ffaa00] font-mono flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                +{metrics.growthRate}% Growth
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Bottom Panel: Hourly Forecast Timeline ─── */}
      <div className="pointer-events-auto w-full p-6 rounded-[24px] bg-slate-950/75 backdrop-blur-md border border-white/10 shadow-2xl flex-grow overflow-y-auto flex flex-col gap-4">
        <h3 className="font-mono text-[10px] tracking-widest text-slate-400 flex items-center gap-2 border-b border-white/5 pb-3">
          <RefreshCw className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '6s' }} />
          CHRONO_TRAFFIC_FORECAST
        </h3>

        {/* Timeline items list */}
        <div className="flex flex-col gap-5 flex-grow">
          {forecast.map((item, i) => (
            <div key={i} className="flex gap-4 relative group">
              {/* Vertical line connector */}
              {i < forecast.length - 1 && (
                <div className="absolute left-[7px] top-[18px] bottom-[-24px] w-[1px] bg-white/10" />
              )}
              
              {/* Node indicator */}
              <div 
                className="w-4 h-4 rounded-full border-2 border-slate-950 mt-1 flex-shrink-0 z-10" 
                style={{ backgroundColor: item.color, boxShadow: `0 0 8px ${item.color}` }}
              />

              {/* Forecast text */}
              <div className="flex flex-col gap-1">
                <span className="text-[11px] font-mono text-slate-400">{item.time}</span>
                <span className="text-xs font-bold text-white tracking-wide">{item.status}</span>
                <span className="text-[10px] text-slate-500 leading-normal">{item.desc}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Forecast warning box */}
        <div className="p-3.5 rounded-xl border border-red-500/30 bg-red-500/10 flex gap-3 items-start mt-2">
          <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
          <div className="flex flex-col gap-1">
            <span className="font-display font-bold text-xs text-white">JAM WARNING ALERT</span>
            <span className="text-[9px] font-mono text-slate-400 leading-relaxed">
              Junction bottleneck expected near ORR segment within {metrics.jamTime} minutes. Dispatch priority corridor now.
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
};
