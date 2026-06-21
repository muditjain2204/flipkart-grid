"use client";

import React, { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import { 
  ArrowLeft, Activity, Clock, AlertTriangle, 
  Settings, RefreshCw, BarChart2, TrendingUp, 
  MapPin, CheckCircle, Flame, Play
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

interface BottleneckNode {
  intersection: string;
  load: number; // percentage
  status: "NORMAL" | "WARNING" | "SEVERE";
  timeOffset: string;
}

export default function CongestionPredictionsPage() {
  const [forecastWindow, setForecastWindow] = useState<number>(60); // minutes
  const [isProjecting, setIsProjecting] = useState<boolean>(false);
  const [hasProjected, setHasProjected] = useState<boolean>(true);
  
  // Projection Parameters
  const [eventImpact, setEventImpact] = useState<string>("HIGH");
  const [baseCapacity, setBaseCapacity] = useState<number>(75); // %
  
  // Forecasted values
  const [congestionIndex, setCongestionIndex] = useState<number>(84);
  const [confidence, setConfidence] = useState<number>(94);
  const [peakWindow, setPeakWindow] = useState<string>("17:30 - 19:00");
  
  const [bottlenecks, setBottlenecks] = useState<BottleneckNode[]>([
    { intersection: "Stadium Gate 1 Crossroad", load: 92, status: "SEVERE", timeOffset: "+45 mins" },
    { intersection: "NH-48 Diversion Exit", load: 78, status: "WARNING", timeOffset: "+60 mins" },
    { intersection: "S.G. Highway Junction", load: 45, status: "NORMAL", timeOffset: "+30 mins" }
  ]);

  const [forecastLogs, setForecastLogs] = useState<string[]>([
    "Temporal Graph Neural Network (GNN) models synchronized.",
    "Ingested traffic perception telemetry from active CCTV nodes.",
    "Forecast model standing by."
  ]);

  const addLog = (msg: string) => {
    setForecastLogs(prev => [msg, ...prev]);
  };

  const handleRunProjection = () => {
    setIsProjecting(true);
    setHasProjected(false);
    addLog(`Running GNN simulation for +${forecastWindow} minutes projection window...`);

    setTimeout(() => {
      // Heuristic model calculations
      const scale = eventImpact === "CRITICAL" ? 1.4 : eventImpact === "HIGH" ? 1.2 : eventImpact === "MEDIUM" ? 0.95 : 0.7;
      const computedCongestion = Math.min(100, Math.ceil(baseCapacity * scale + (forecastWindow / 10)));
      const computedConfidence = Math.max(78, Math.min(99, Math.ceil(95 - (forecastWindow / 12) + Math.random() * 4)));
      
      setCongestionIndex(computedCongestion);
      setConfidence(computedConfidence);

      // Adjust peak window
      if (eventImpact === "CRITICAL" || eventImpact === "HIGH") {
        setPeakWindow("17:00 - 19:30");
      } else {
        setPeakWindow("18:00 - 19:00");
      }

      // Update bottlenecks load
      setBottlenecks([
        { 
          intersection: "Stadium Gate 1 Crossroad", 
          load: Math.min(100, Math.ceil(computedCongestion * 1.1)), 
          status: computedCongestion > 80 ? "SEVERE" : "WARNING", 
          timeOffset: `+${Math.ceil(forecastWindow * 0.75)} mins` 
        },
        { 
          intersection: "NH-48 Diversion Exit", 
          load: Math.min(100, Math.ceil(computedCongestion * 0.9)), 
          status: computedCongestion > 70 ? "WARNING" : "NORMAL", 
          timeOffset: `+${forecastWindow} mins` 
        },
        { 
          intersection: "S.G. Highway Junction", 
          load: Math.min(100, Math.ceil(computedCongestion * 0.6)), 
          status: computedCongestion > 85 ? "WARNING" : "NORMAL", 
          timeOffset: `+${Math.ceil(forecastWindow * 0.5)} mins` 
        }
      ]);

      setIsProjecting(false);
      setHasProjected(true);
      addLog(`Congestion projection completed. Spatial bottlenecks plotted.`);
      addLog(`Temporal model confidence calculated at ${computedConfidence}%.`);
    }, 1500);
  };

  // Simple simulated forecast line coordinates for SVG chart
  const getChartPoints = () => {
    const riskFactor = eventImpact === "CRITICAL" ? 90 : eventImpact === "HIGH" ? 75 : eventImpact === "MEDIUM" ? 55 : 35;
    const base = 100 - baseCapacity;
    const startY = 150 - (baseCapacity * 1.2);
    const midY = 150 - (riskFactor * 1.2);
    const endY = 150 - ((riskFactor * 0.8) * 1.2);
    return `10,${startY} 80,${startY * 0.9} 160,${midY} 240,${midY * 1.1} 320,${endY}`;
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500/30">
      <Navigation onSectionClick={() => {}} />

      <div className="pt-28 pb-20 px-6 max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-indigo-400 mb-4 transition">
              <ArrowLeft className="w-4 h-4" /> Back to Home
            </Link>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white flex items-center gap-4">
              Congestion Forecasting Center
            </h1>
            <p className="text-slate-400 mt-2 text-sm md:text-base max-w-2xl">
              Leverage Graph Neural Networks (GNNs) to project traffic conditions, detect bottlenecks, and model flow decay.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Inputs & Parameters Panel (Column 1) */}
          <div className="space-y-6">
            
            {/* Parameters Card */}
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-6">
              <h3 className="font-extrabold text-sm uppercase tracking-wider text-slate-350 flex items-center gap-2">
                <Settings className="w-5 h-5 text-indigo-400" /> Forecasting Engine Parameters
              </h3>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Forecast Window: <span className="text-indigo-400 font-mono">+{forecastWindow} mins</span>
                </label>
                <input
                  type="range"
                  min="15"
                  max="180"
                  step="15"
                  value={forecastWindow}
                  onChange={(e) => setForecastWindow(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
                  <span>15m</span>
                  <span>90m</span>
                  <span>180m</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Event Base Risk Tier</label>
                <div className="grid grid-cols-4 gap-2">
                  {["LOW", "MEDIUM", "HIGH", "CRITICAL"].map((tier) => (
                    <button
                      key={tier}
                      type="button"
                      onClick={() => setEventImpact(tier)}
                      className={`py-2 text-[10px] font-bold rounded-lg border transition ${
                        eventImpact === tier 
                          ? "bg-indigo-600/20 border-indigo-500 text-indigo-300 font-bold"
                          : "bg-slate-950 border-slate-850 text-slate-500 hover:border-slate-850"
                      }`}
                    >
                      {tier}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Active capacity load: <span className="text-indigo-400 font-mono">{baseCapacity}%</span>
                </label>
                <input
                  type="range"
                  min="20"
                  max="95"
                  step="5"
                  value={baseCapacity}
                  onChange={(e) => setBaseCapacity(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
              </div>

              <button
                onClick={handleRunProjection}
                disabled={isProjecting}
                className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold rounded-xl transition shadow-[0_0_20px_rgba(79,70,229,0.3)] flex items-center justify-center gap-2 cursor-pointer"
              >
                {isProjecting ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" /> Simulating GNN Nodes...
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5" fill="currentColor" /> Run Spatial Projection
                  </>
                )}
              </button>
            </div>

            {/* Metrics outputs */}
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-4">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-500">Forecasting Confidence Scores</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-850 text-center">
                  <span className="text-3xl font-black font-mono text-white">{confidence}%</span>
                  <p className="text-[9px] font-bold text-slate-500 uppercase mt-1">Accuracy Index</p>
                </div>
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-850 text-center">
                  <span className="text-xs font-bold font-mono text-indigo-400 break-words block">{peakWindow}</span>
                  <p className="text-[9px] font-bold text-slate-500 uppercase mt-1">Peak Hazard Window</p>
                </div>
              </div>
            </div>

          </div>

          {/* Center: Graph & Visualizer Projection (Column 2) */}
          <div className="space-y-6">
            
            {/* Visualizer Chart */}
            <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-6 relative overflow-hidden flex flex-col justify-between shadow-2xl aspect-square">
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-[80px] pointer-events-none" />
              
              {/* Chart top metrics */}
              <div className="relative z-10 flex justify-between items-start">
                <div>
                  <span className="text-[10px] bg-slate-950/80 px-2.5 py-1.5 rounded-lg border border-slate-800 font-mono tracking-wider text-indigo-400">
                    GNN_FLOW_TEMPORAL_FORECAST
                  </span>
                  <h3 className="text-2xl font-black text-white mt-3 font-mono">
                    {congestionIndex}% <span className="text-xs text-slate-500 font-normal">Predicted Congestion</span>
                  </h3>
                </div>
              </div>

              {/* SVG Flow Projection Line Graph */}
              <div className="relative w-full h-[180px] bg-slate-950/40 border border-slate-850 rounded-2xl p-4 flex items-end">
                {/* Y-Axis labels */}
                <div className="absolute left-2 top-2 bottom-2 flex flex-col justify-between text-[9px] font-mono text-slate-600 select-none">
                  <span>100%</span>
                  <span>50%</span>
                  <span>0%</span>
                </div>

                <svg className="w-full h-full" viewBox="0 0 330 150" style={{ overflow: "visible" }}>
                  {/* Grid Lines */}
                  <line x1="10" y1="10" x2="330" y2="10" stroke="rgba(51, 65, 85, 0.2)" strokeWidth="1" strokeDasharray="3 3" />
                  <line x1="10" y1="75" x2="330" y2="75" stroke="rgba(51, 65, 85, 0.2)" strokeWidth="1" strokeDasharray="3 3" />
                  <line x1="10" y1="140" x2="330" y2="140" stroke="rgba(51, 65, 85, 0.2)" strokeWidth="1" strokeDasharray="3 3" />

                  {/* Flow curve line */}
                  <motion.polyline
                    key={getChartPoints()}
                    fill="none"
                    stroke="url(#gradient-flow)"
                    strokeWidth="4"
                    points={getChartPoints()}
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1.2, ease: "easeInOut" }}
                    style={{ filter: "drop-shadow(0 0 8px rgba(99,102,241,0.5))" }}
                  />

                  {/* SVG Gradient definitions */}
                  <defs>
                    <linearGradient id="gradient-flow" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#6366f1" />
                      <stop offset="50%" stopColor="#f43f5e" />
                      <stop offset="100%" stopColor="#10b981" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>

              {/* Chart Timeline Legend */}
              <div className="relative z-10 grid grid-cols-5 text-center text-[9px] font-mono text-slate-500 font-bold border-t border-slate-850 pt-4">
                <span>Start</span>
                <span>+30 min</span>
                <span>+60 min</span>
                <span>+120 min</span>
                <span>+180 min</span>
              </div>

            </div>

          </div>

          {/* Right panel: Active bottleneck intersections (Column 3) */}
          <div className="space-y-6">
            
            <h3 className="font-extrabold text-sm uppercase tracking-wider text-slate-355 flex items-center gap-2">
              <BarChart2 className="w-4.5 h-4.5 text-indigo-400 animate-pulse" /> Projected Hotspots
            </h3>

            <div className="flex flex-col gap-4">
              {bottlenecks.map((node, idx) => {
                const getBadgeColor = (status: string) => {
                  switch (status) {
                    case "SEVERE": return "bg-red-500/10 border-red-500/20 text-red-400";
                    case "WARNING": return "bg-orange-500/10 border-orange-500/20 text-orange-400";
                    default: return "bg-emerald-50/10 border-emerald-500/20 text-emerald-400";
                  }
                };
                return (
                  <div key={idx} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <h4 className="font-bold text-white text-xs leading-normal">{node.intersection}</h4>
                        <span className="text-[10px] font-mono text-slate-500 block">Peak congestion: {node.timeOffset}</span>
                      </div>
                      <span className={`px-2 py-0.5 text-[9px] font-black rounded border shrink-0 ${getBadgeColor(node.status)}`}>
                        {node.status}
                      </span>
                    </div>

                    <div className="mt-4 space-y-1">
                      <div className="flex justify-between text-[10px] font-mono text-slate-500 font-bold">
                        <span>Projected Capacity Load</span>
                        <span>{node.load}%</span>
                      </div>
                      <div className="w-full h-1 bg-slate-950 rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-500 ${
                            node.status === "SEVERE" ? "bg-red-500" :
                            node.status === "WARNING" ? "bg-orange-500" : "bg-emerald-500"
                          }`}
                          style={{ width: `${node.load}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Forecast logs */}
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl flex flex-col h-[200px]">
              <h4 className="text-xs font-black uppercase text-slate-350 border-b border-slate-850 pb-2 mb-3">Model Inference logs</h4>
              <div className="flex-1 overflow-y-auto pr-1 space-y-2 font-mono text-[10px] text-slate-400 scrollbar-thin scrollbar-thumb-slate-800">
                {forecastLogs.map((log, idx) => (
                  <div key={idx} className="bg-slate-950 p-2 rounded-lg border border-slate-850">
                    {log}
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      </div>
    </main>
  );
}
