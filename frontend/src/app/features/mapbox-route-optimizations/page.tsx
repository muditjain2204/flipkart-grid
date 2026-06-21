"use client";

import React, { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import { 
  ArrowLeft, MapPin, Navigation as NavIcon, Compass, 
  Map, AlertTriangle, AlertCircle, RefreshCw, 
  Play, Check, Plus, Trash2, ArrowRight
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

interface RouteDetour {
  id: string;
  name: string;
  via: string;
  time: string;
  distance: string;
  delta: string;
  type: "optimal" | "bypass" | "emergency";
  color: string;
  active: boolean;
}

export default function MapboxOptimizationsPage() {
  const [startPoint, setStartPoint] = useState<string>("Sardar Patel Stadium");
  const [endPoint, setEndPoint] = useState<string>("Civil Airport Junction");
  const [isComputing, setIsComputing] = useState<boolean>(false);
  const [activeRouteId, setActiveRouteId] = useState<string>("optimal-1");

  // Congested road blocks configured by the user
  const [blockedRoads, setBlockedRoads] = useState<string[]>([
    "Stadium Access Road (South Entrance)",
    "Motera Cross Road",
  ]);
  const [newBlockInput, setNewBlockInput] = useState<string>("");

  // Route detour proposals
  const [detours, setDetours] = useState<RouteDetour[]>([
    {
      id: "optimal-1",
      name: "Primary Optimized Detour",
      via: "S.G. Highway to Ring Road Bypass",
      time: "18 mins",
      distance: "8.2 km",
      delta: "+4 mins",
      type: "optimal",
      color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
      active: true,
    },
    {
      id: "bypass-2",
      name: "Alternative Outer Bypass",
      via: "Ghandinagar Link Expressway",
      time: "25 mins",
      distance: "12.4 km",
      delta: "+11 mins",
      type: "bypass",
      color: "bg-blue-500/20 text-blue-400 border-blue-500/30",
      active: false,
    },
    {
      id: "emergency-3",
      name: "Isolated Emergency Lane",
      via: "Service Lane Corridor 3",
      time: "11 mins",
      distance: "6.1 km",
      delta: "-3 mins",
      type: "emergency",
      color: "bg-red-500/20 text-red-400 border-red-500/30",
      active: false,
    }
  ]);

  const [broadcastLogs, setBroadcastLogs] = useState<string[]>([
    "Mapbox route matrix initialized for Ahmedabad command sector.",
    "Active restriction zone placed at Motera Stadium perimeter.",
  ]);

  const addBroadcast = (msg: string) => {
    setBroadcastLogs(prev => [msg, ...prev]);
  };

  const handleAddBlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBlockInput.trim()) return;
    setBlockedRoads(prev => [...prev, newBlockInput.trim()]);
    addBroadcast(`New blockage parameter set: ${newBlockInput.trim()}`);
    setNewBlockInput("");
  };

  const handleRemoveBlock = (index: number) => {
    const removed = blockedRoads[index];
    setBlockedRoads(prev => prev.filter((_, i) => i !== index));
    addBroadcast(`Blockage parameter removed: ${removed}`);
  };

  const handleComputeRoutes = () => {
    setIsComputing(true);
    addBroadcast(`Querying Mapbox Matrix routing table from '${startPoint}' to '${endPoint}'...`);
    
    setTimeout(() => {
      // Modify ETA detours slightly based on number of blocks to simulate computation
      const scale = blockedRoads.length * 2.5;
      setDetours(prev => prev.map(d => {
        const baseMin = parseInt(d.time.split(" ")[0]);
        const computedMin = Math.ceil(baseMin + scale + Math.random() * 2);
        return {
          ...d,
          time: `${computedMin} mins`,
          delta: `+${computedMin - 14} mins`
        };
      }));
      
      setIsComputing(false);
      addBroadcast("Mapbox Directions API coordinates computed successfully.");
      addBroadcast(`Detour routes refreshed. Optimal travel time delta established.`);
    }, 1500);
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-emerald-500/30">
      <Navigation onSectionClick={() => {}} />

      <div className="pt-28 pb-20 px-6 max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-emerald-400 mb-4 transition">
              <ArrowLeft className="w-4 h-4" /> Back to Home
            </Link>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white flex items-center gap-4">
              Mapbox Route Optimizations
            </h1>
            <p className="text-slate-400 mt-2 text-sm md:text-base max-w-2xl">
              Calculate predictive detours, map emergency corridors, and bypass planned event blockages dynamically.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left panel: Route Parameters & Constraints (Column 1) */}
          <div className="space-y-6">
            
            {/* Input form */}
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-5">
              <h3 className="font-extrabold text-sm uppercase tracking-wider text-slate-350 flex items-center gap-2">
                <Compass className="w-4.5 h-4.5 text-emerald-400" /> Route Endpoints
              </h3>
              
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Origin</label>
                <div className="flex items-center gap-2 bg-slate-950 px-4 py-3 rounded-xl border border-slate-850">
                  <MapPin className="w-4 h-4 text-emerald-500" />
                  <input
                    type="text"
                    value={startPoint}
                    onChange={(e) => setStartPoint(e.target.value)}
                    className="bg-transparent text-sm text-white focus:outline-none w-full"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Destination</label>
                <div className="flex items-center gap-2 bg-slate-950 px-4 py-3 rounded-xl border border-slate-850">
                  <MapPin className="w-4 h-4 text-red-500" />
                  <input
                    type="text"
                    value={endPoint}
                    onChange={(e) => setEndPoint(e.target.value)}
                    className="bg-transparent text-sm text-white focus:outline-none w-full"
                  />
                </div>
              </div>

              <button
                onClick={handleComputeRoutes}
                disabled={isComputing}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition flex items-center justify-center gap-2"
              >
                {isComputing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <NavIcon className="w-4 h-4" />}
                {isComputing ? "Calculating..." : "Query Mapbox Router"}
              </button>
            </div>

            {/* Blockage configuration */}
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-4">
              <h3 className="font-extrabold text-sm uppercase tracking-wider text-slate-350 flex items-center gap-2">
                <AlertTriangle className="w-4.5 h-4.5 text-yellow-500" /> Exclusion Barriers
              </h3>
              
              <form onSubmit={handleAddBlock} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Street name or intersection..."
                  value={newBlockInput}
                  onChange={(e) => setNewBlockInput(e.target.value)}
                  className="flex-1 bg-slate-950 border border-slate-850 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-yellow-500 transition"
                />
                <button
                  type="submit"
                  className="p-3 bg-slate-800 hover:bg-slate-700 border border-slate-750 text-white rounded-xl transition"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </form>

              <div className="space-y-2 mt-4 max-h-[160px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-800">
                {blockedRoads.length === 0 ? (
                  <p className="text-xs text-slate-500 italic text-center py-4">No active exclusion barriers set.</p>
                ) : (
                  blockedRoads.map((road, idx) => (
                    <div key={idx} className="flex justify-between items-center bg-slate-950 px-3 py-2 rounded-lg border border-slate-850 text-xs">
                      <span className="text-slate-300 font-medium truncate max-w-[200px]">{road}</span>
                      <button 
                        onClick={() => handleRemoveBlock(idx)}
                        className="text-slate-500 hover:text-red-400 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>

          {/* Center: Dynamic Vector Map Simulation (Column 2) */}
          <div className="space-y-6">
            
            {/* Visual Vector Map Container */}
            <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-6 relative overflow-hidden aspect-square flex flex-col justify-between shadow-2xl">
              
              {/* Decorative Map Grid overlay */}
              <div className="absolute inset-0 bg-slate-950/20 backdrop-blur-[1px] grid grid-cols-5 grid-rows-5 border border-emerald-500/5 pointer-events-none">
                {Array.from({ length: 25 }).map((_, idx) => (
                  <div key={idx} className="border-r border-b border-slate-800/40" />
                ))}
              </div>

              {/* Vector Roads Overlay */}
              <svg className="absolute inset-0 w-full h-full p-8 pointer-events-none z-0" style={{ overflow: "visible" }}>
                {/* Standard Road network */}
                <path d="M 10% 10% L 90% 10% L 90% 90% L 10% 90% Z" stroke="rgba(71, 85, 105, 0.4)" strokeWidth="6" fill="none" />
                <path d="M 10% 50% L 90% 50%" stroke="rgba(71, 85, 105, 0.4)" strokeWidth="6" fill="none" />
                <path d="M 50% 10% L 50% 90%" stroke="rgba(71, 85, 105, 0.4)" strokeWidth="6" fill="none" />

                {/* Exclusions / Blocked road (Motera Cross Road) */}
                <circle cx="50%" cy="50%" r="20" fill="rgba(239, 68, 68, 0.2)" stroke="#ef4444" strokeWidth="2" strokeDasharray="3 3" />
                
                {/* Active detours based on selection */}
                {activeRouteId === "optimal-1" && (
                  <motion.path
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1 }}
                    d="M 10% 50% Q 10% 10% 50% 10% T 90% 50%"
                    stroke="#10b981"
                    strokeWidth="4"
                    fill="none"
                    style={{ filter: "drop-shadow(0 0 6px rgba(16,185,129,0.8))" }}
                  />
                )}

                {activeRouteId === "bypass-2" && (
                  <motion.path
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1 }}
                    d="M 10% 50% L 10% 90% L 90% 90% L 90% 50%"
                    stroke="#3b82f6"
                    strokeWidth="4"
                    fill="none"
                    style={{ filter: "drop-shadow(0 0 6px rgba(59,130,246,0.8))" }}
                  />
                )}

                {activeRouteId === "emergency-3" && (
                  <motion.path
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1 }}
                    d="M 10% 50% L 50% 50% L 90% 50%"
                    stroke="#ef4444"
                    strokeWidth="3"
                    fill="none"
                    strokeDasharray="4 4"
                    style={{ filter: "drop-shadow(0 0 6px rgba(239,68,68,0.8))" }}
                  />
                )}
              </svg>

              {/* Top Details HUD */}
              <div className="relative z-10 flex justify-between">
                <span className="text-[10px] bg-slate-950/80 px-2.5 py-1.5 rounded-lg border border-slate-800 font-mono tracking-wider text-emerald-400">
                  MAPBOX_DIVERSION_VISUALIZER
                </span>
                <span className="text-[10px] bg-slate-950/80 px-2.5 py-1.5 rounded-lg border border-slate-800 font-mono text-slate-400">
                   अहमदाबाद Command Sector
                </span>
              </div>

              {/* Map Floating Indicators */}
              <div className="relative z-10 flex flex-col gap-2 pointer-events-none select-none max-w-[200px] mt-12">
                <div className="flex items-center gap-1.5 bg-slate-950/90 border border-slate-800 p-2 rounded-lg text-[10px]">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                  <span className="text-slate-300 font-semibold truncate">Active Detour routing</span>
                </div>
                <div className="flex items-center gap-1.5 bg-slate-950/90 border border-slate-800 p-2 rounded-lg text-[10px]">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500 shrink-0" />
                  <span className="text-slate-300 font-semibold truncate">Blocked intersection</span>
                </div>
              </div>

              {/* Bottom Legend */}
              <div className="relative z-10 bg-slate-950/90 border border-slate-850 p-4 rounded-2xl flex items-center justify-between text-xs mt-auto">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-emerald-500" />
                  <span className="text-slate-300">Optimal Route</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500" />
                  <span className="text-slate-300">Alternative Bypass</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <span className="text-slate-300">Emergency Lane</span>
                </div>
              </div>

            </div>

          </div>

          {/* Right panel: Proposed Detours comparative cards (Column 3) */}
          <div className="space-y-6">
            
            <h3 className="font-extrabold text-sm uppercase tracking-wider text-slate-350 flex items-center gap-2">
              <Map className="w-4.5 h-4.5 text-emerald-400" /> Optimized Detours
            </h3>

            <div className="flex flex-col gap-4">
              {detours.map((route) => {
                const isActive = activeRouteId === route.id;
                return (
                  <div
                    key={route.id}
                    onClick={() => setActiveRouteId(route.id)}
                    className={`bg-slate-900 border rounded-2xl p-5 cursor-pointer transition ${
                      isActive 
                        ? "border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.15)]" 
                        : "border-slate-800 hover:border-slate-700/80"
                    }`}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-bold text-white text-sm">{route.name}</h4>
                      <span className={`px-2 py-0.5 text-[9px] font-black rounded border ${route.color}`}>
                        {route.type.toUpperCase()}
                      </span>
                    </div>

                    <div className="text-xs text-slate-450 leading-relaxed mt-1 mb-4 flex items-center gap-1.5">
                      <NavIcon className="w-3 h-3 text-slate-500" />
                      via {route.via}
                    </div>

                    <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-850 text-center font-mono">
                      <div>
                        <span className="text-slate-500 text-[9px] uppercase font-bold tracking-wider block">Duration</span>
                        <span className="text-xs font-bold text-slate-200">{route.time}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 text-[9px] uppercase font-bold tracking-wider block">Distance</span>
                        <span className="text-xs font-bold text-slate-200">{route.distance}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 text-[9px] uppercase font-bold tracking-wider block">ETA Delta</span>
                        <span className={`text-xs font-bold ${route.type === "emergency" ? "text-emerald-400" : "text-amber-400"}`}>{route.delta}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Broadcast panel */}
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl flex flex-col h-[220px]">
              <h4 className="text-xs font-black uppercase text-slate-350 border-b border-slate-850 pb-2 mb-3">Broadcast Advisory Feed</h4>
              <div className="flex-1 overflow-y-auto pr-1 space-y-2 font-mono text-[10px] text-slate-400 scrollbar-thin scrollbar-thumb-slate-800">
                {broadcastLogs.map((log, idx) => (
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
