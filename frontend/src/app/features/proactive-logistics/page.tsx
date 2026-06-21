"use client";

import React, { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import { 
  ArrowLeft, ShieldAlert, Users, Compass, 
  Settings, CheckCircle2, Play, RefreshCw, 
  AlertTriangle, Truck, Layers, MapPin 
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

interface ResourceMetric {
  name: string;
  count: number;
  max: number;
  color: string;
  icon: React.ReactNode;
}

interface TacticalLog {
  time: string;
  message: string;
  type: "info" | "dispatch" | "alert";
}

export default function ProactiveLogisticsPage() {
  // Scenario Config States
  const [crowdSize, setCrowdSize] = useState<number>(45000);
  const [riskLevel, setRiskLevel] = useState<string>("HIGH");
  const [availableOfficers, setAvailableOfficers] = useState<number>(120);
  const [availableBarricades, setAvailableBarricades] = useState<number>(300);
  const [selectedCorridors, setSelectedCorridors] = useState<string[]>([
    "Stadium Ring Road",
    "NH-48 Corridor",
  ]);

  // Live Simulation/Calculation States
  const [isCalculating, setIsCalculating] = useState<boolean>(false);
  const [hasCalculated, setHasCalculated] = useState<boolean>(true);
  
  // Results
  const [officersAllocated, setOfficersAllocated] = useState<number>(48);
  const [barricadesAllocated, setBarricadesAllocated] = useState<number>(140);
  const [zones, setZones] = useState<any[]>([
    { name: "Zone A: Main Stadium Gate", officers: 24, barricades: 60, priority: "CRITICAL", reasoning: "Main pedestrian accumulation node; requires high barricade density for channelization." },
    { name: "Zone B: SP Ring Road Junction", officers: 12, barricades: 40, priority: "HIGH", reasoning: "Major route diversion checkpoint; requires officer presence to guide detouring transit vehicles." },
    { name: "Zone C: NH-48 Expressway Exit", officers: 12, barricades: 40, priority: "MEDIUM", reasoning: "Incoming vehicle speed control zone. Barricades deployed for traffic calming." }
  ]);

  const [logs, setLogs] = useState<TacticalLog[]>([
    { time: "15:10:12", message: "Initial logistics model loaded. Ready for parameters.", type: "info" },
    { time: "15:11:05", message: "Fleet availability synced: 120 officers, 300 barricades active.", type: "info" }
  ]);

  const addLog = (message: string, type: "info" | "dispatch" | "alert") => {
    const time = new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setLogs(prev => [{ time, message, type }, ...prev]);
  };

  const handleCorridorToggle = (corridor: string) => {
    if (selectedCorridors.includes(corridor)) {
      setSelectedCorridors(prev => prev.filter(c => c !== corridor));
    } else {
      setSelectedCorridors(prev => [...prev, corridor]);
    }
  };

  const handleRunLogisticsCalculation = () => {
    setIsCalculating(true);
    setHasCalculated(false);
    addLog(`Recalculating allocations for ${crowdSize} attendees at ${riskLevel} risk...`, "info");

    setTimeout(() => {
      // Logic-based heuristic calculation
      const riskMultiplier = riskLevel === "CRITICAL" ? 1.5 : riskLevel === "HIGH" ? 1.2 : riskLevel === "MEDIUM" ? 0.9 : 0.6;
      const baseOfficers = Math.ceil((crowdSize / 1000) * 0.8 * riskMultiplier);
      const baseBarricades = Math.ceil((crowdSize / 1000) * 2.5 * riskMultiplier);

      const finalOfficers = Math.min(baseOfficers, availableOfficers);
      const finalBarricades = Math.min(baseBarricades, availableBarricades);

      setOfficersAllocated(finalOfficers);
      setBarricadesAllocated(finalBarricades);

      // Distribute to zones
      const newZones = [
        {
          name: "Zone A: Primary Entry Node",
          officers: Math.ceil(finalOfficers * 0.5),
          barricades: Math.ceil(finalBarricades * 0.45),
          priority: riskLevel === "CRITICAL" ? "CRITICAL" : "HIGH",
          reasoning: `Handles primary ingress. Requires ${Math.ceil(finalBarricades * 0.45)} barricades to direct crowd flow safely.`
        },
        {
          name: "Zone B: Core Intersect Intersection",
          officers: Math.ceil(finalOfficers * 0.3),
          barricades: Math.ceil(finalBarricades * 0.35),
          priority: "HIGH",
          reasoning: `Key diversion junction for ${selectedCorridors.join(" and ") || "nearby routes"}.`
        },
        {
          name: "Zone C: Outer Inflow Buffer",
          officers: Math.ceil(finalOfficers * 0.2),
          barricades: Math.ceil(finalBarricades * 0.2),
          priority: "MEDIUM",
          reasoning: "Early calming and warning zone to limit shockwave congestion back-up."
        }
      ];

      setZones(newZones);
      setIsCalculating(false);
      setHasCalculated(true);

      addLog(`Deployment Plan generated: ${finalOfficers} Officers and ${finalBarricades} Barricades assigned across 3 key zones.`, "dispatch");
      addLog("Tactical dispatch signals broadcasted to mobile personnel units.", "alert");
    }, 1500);
  };

  const inventoryMetrics: ResourceMetric[] = [
    { name: "Officers deployed", count: officersAllocated, max: availableOfficers, color: "from-blue-500 to-indigo-500", icon: <Users className="w-5 h-5" /> },
    { name: "Barricades placed", count: barricadesAllocated, max: availableBarricades, color: "from-amber-500 to-orange-500", icon: <ShieldAlert className="w-5 h-5" /> },
    { name: "Emergency Fleet Assigned", count: Math.ceil(officersAllocated / 12), max: 15, color: "from-red-500 to-rose-600", icon: <Truck className="w-5 h-5" /> },
    { name: "Route Interceptors", count: selectedCorridors.length * 2, max: 10, color: "from-emerald-500 to-teal-500", icon: <Compass className="w-5 h-5" /> }
  ];

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
              Proactive Logistics Center
            </h1>
            <p className="text-slate-400 mt-2 text-sm md:text-base max-w-2xl">
              Dynamically calculate and deploy physical barriers and officer squads before gridlocks materialize.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Column 1 & 2: Controls & Zone Allocation */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Scenario Planner Inputs */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 md:p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-[80px] pointer-events-none" />
              
              <h3 className="font-extrabold text-lg text-white mb-6 flex items-center gap-2">
                <Settings className="w-5 h-5 text-indigo-400 animate-spin-slow" /> Scenario Parameters
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Expected Crowd Size: <span className="text-indigo-400 font-mono">{crowdSize.toLocaleString()}</span>
                  </label>
                  <input
                    type="range"
                    min="5000"
                    max="150000"
                    step="5000"
                    value={crowdSize}
                    onChange={(e) => setCrowdSize(parseInt(e.target.value))}
                    className="w-full h-1.5 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
                    <span>5k</span>
                    <span>75k</span>
                    <span>150k</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Event Risk Tier</label>
                  <div className="grid grid-cols-4 gap-2">
                    {["LOW", "MEDIUM", "HIGH", "CRITICAL"].map((tier) => (
                      <button
                        key={tier}
                        type="button"
                        onClick={() => setRiskLevel(tier)}
                        className={`py-2 text-[10px] font-bold rounded-lg border transition ${
                          riskLevel === tier 
                            ? "bg-indigo-600/20 border-indigo-500 text-indigo-300"
                            : "bg-slate-950 border-slate-850 text-slate-500 hover:border-slate-800"
                        }`}
                      >
                        {tier}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Total Active Officers: <span className="text-indigo-400 font-mono">{availableOfficers}</span>
                  </label>
                  <input
                    type="range"
                    min="20"
                    max="300"
                    step="10"
                    value={availableOfficers}
                    onChange={(e) => setAvailableOfficers(parseInt(e.target.value))}
                    className="w-full h-1.5 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Total Available Barricades: <span className="text-indigo-400 font-mono">{availableBarricades}</span>
                  </label>
                  <input
                    type="range"
                    min="50"
                    max="600"
                    step="25"
                    value={availableBarricades}
                    onChange={(e) => setAvailableBarricades(parseInt(e.target.value))}
                    className="w-full h-1.5 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                  />
                </div>
              </div>

              <div className="mb-8">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Impacted Corridors under planning</label>
                <div className="flex flex-wrap gap-2">
                  {["Stadium Ring Road", "NH-48 Corridor", "Expressway Bypass", "Hudson Circle", "MG Road Inflow"].map((corridor) => {
                    const isSelected = selectedCorridors.includes(corridor);
                    return (
                      <button
                        key={corridor}
                        type="button"
                        onClick={() => handleCorridorToggle(corridor)}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-full border transition ${
                          isSelected
                            ? "bg-slate-100 text-slate-950 border-white font-bold"
                            : "bg-slate-950 border-slate-850 text-slate-400 hover:border-slate-800"
                        }`}
                      >
                        {corridor}
                      </button>
                    );
                  })}
                </div>
              </div>

              <button
                onClick={handleRunLogisticsCalculation}
                disabled={isCalculating}
                className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition shadow-[0_0_25px_rgba(79,70,229,0.35)] flex items-center justify-center gap-2"
              >
                {isCalculating ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" /> Computing Deployment...
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5" fill="currentColor" /> Compute & Broadcast Logistics Plan
                  </>
                )}
              </button>
            </div>

            {/* Inventory Deployment Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {inventoryMetrics.map((m, idx) => {
                const pct = Math.min((m.count / m.max) * 100, 100);
                return (
                  <div key={idx} className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 relative overflow-hidden">
                    <div className="flex items-center justify-between mb-4">
                      <div className="text-slate-400 text-sm font-bold truncate max-w-[120px]">{m.name}</div>
                      <div className="p-2 bg-slate-950 rounded-lg text-slate-400 border border-slate-850">
                        {m.icon}
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      <div className="text-2xl font-black text-white font-mono">
                        {m.count} <span className="text-xs text-slate-500 font-normal">/ {m.max}</span>
                      </div>
                      
                      {/* Custom Progress Bar */}
                      <div className="w-full h-1 bg-slate-950 rounded-full overflow-hidden">
                        <div 
                          className={`h-full bg-gradient-to-r ${m.color} transition-all duration-500`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <div className="text-[10px] text-slate-500 text-right font-mono">{pct.toFixed(0)}% utilization</div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Allocated Zones Details */}
            <div className="space-y-4">
              <h3 className="font-extrabold text-lg text-white mb-2 flex items-center gap-2">
                <Layers className="w-5 h-5 text-indigo-400" /> Active Deployment Zones
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {zones.map((zone, idx) => {
                  const getPriorityBadge = (p: string) => {
                    switch (p) {
                      case "CRITICAL": return "bg-red-500/10 border-red-500/20 text-red-400";
                      case "HIGH": return "bg-orange-500/10 border-orange-500/20 text-orange-400";
                      default: return "bg-indigo-500/10 border-indigo-500/20 text-indigo-400";
                    }
                  };
                  return (
                    <div key={idx} className="bg-slate-900 border border-slate-800 hover:border-slate-700/80 p-5 rounded-2xl flex flex-col justify-between transition">
                      <div className="space-y-3">
                        <div className="flex justify-between items-start gap-2">
                          <h4 className="font-bold text-white text-sm line-clamp-2">{zone.name}</h4>
                          <span className={`px-2 py-0.5 text-[9px] font-black rounded border shrink-0 ${getPriorityBadge(zone.priority)}`}>
                            {zone.priority}
                          </span>
                        </div>
                        
                        <p className="text-xs text-slate-400 leading-relaxed font-medium line-clamp-4">
                          {zone.reasoning}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-2 mt-6 pt-4 border-t border-slate-850">
                        <div className="bg-slate-950 p-2 rounded-lg border border-slate-850 flex items-center gap-2">
                          <Users className="w-3.5 h-3.5 text-blue-400" />
                          <div className="text-[11px]">
                            <span className="font-bold text-white font-mono">{zone.officers}</span> Officers
                          </div>
                        </div>
                        <div className="bg-slate-950 p-2 rounded-lg border border-slate-850 flex items-center gap-2">
                          <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                          <div className="text-[11px]">
                            <span className="font-bold text-white font-mono">{zone.barricades}</span> Barricades
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Column 3: Status / Timeline Console */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 flex flex-col h-[740px]">
            <h3 className="font-extrabold text-sm uppercase tracking-wider text-slate-300 border-b border-slate-850 pb-4 mb-4 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-indigo-500 animate-pulse" /> Tactical Dispatch Console
            </h3>
            
            <div className="flex-1 overflow-y-auto pr-2 space-y-3 font-mono text-xs scrollbar-thin scrollbar-thumb-slate-800">
              {logs.map((log, idx) => (
                <div 
                  key={idx} 
                  className={`p-3.5 rounded-xl border ${
                    log.type === "alert" ? "bg-red-500/10 border-red-500/20 text-red-200" :
                    log.type === "dispatch" ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-200" :
                    "bg-slate-950 border-slate-850 text-slate-400"
                  }`}
                >
                  <span className="text-slate-500 mr-2">[{log.time}]</span>
                  {log.message}
                </div>
              ))}
            </div>
            
            <div className="mt-4 pt-4 border-t border-slate-850 space-y-3">
              <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-950 p-3 rounded-lg border border-slate-850">
                <AlertTriangle className="w-4 h-4 text-orange-500 shrink-0" />
                <span>Verify that deployment safety clearance protocols are met before activating officers.</span>
              </div>
              <button 
                onClick={() => addLog("Resource deployment plans locked and filed with central dispatch.", "dispatch")}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition text-xs uppercase tracking-wider"
              >
                Sign Off & Deploy Plan
              </button>
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}
