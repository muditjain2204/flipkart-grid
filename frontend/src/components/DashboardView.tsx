"use client";

import React, { useState, useEffect } from "react";
import {
  Activity, ShieldAlert, Users, Compass, ArrowLeft, Video,
  MapPin, CheckCircle, Flame, Siren, RefreshCw, AlertTriangle
} from "lucide-react";

interface DashboardViewProps {
  onBack: () => void;
}

export default function DashboardView({ onBack }: DashboardViewProps) {
  const [activeTab, setActiveTab] = useState<"traffic" | "agents" | "incidents">("traffic");
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(100);
  const [eventsList, setEventsList] = useState<any[]>([]);
  const [incidentsList, setIncidentsList] = useState<any[]>([]);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [stats, setStats] = useState<any>({ cars: 1482, crowd: 132000, critical: 2 });

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const eventsRes = await fetch(`${API_URL}/events?limit=3`);
        const eventsData = await eventsRes.json();
        if (eventsData.success) {
          setEventsList(eventsData.data.map((e: any) => ({
            id: e.id,
            name: e.name,
            venue: e.venue,
            crowd: e.expectedCrowd,
            risk: "HIGH", // Placeholder since event risk is in analysis
            time: new Date(e.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          })));
        }

        const incidentsRes = await fetch(`${API_URL}/incidents?limit=3`);
        const incidentsData = await incidentsRes.json();
        if (incidentsData.success) {
          setIncidentsList(incidentsData.data.incidents.map((i: any) => ({
            id: i.id,
            type: i.cause,
            location: i.address,
            priority: i.priority,
            status: i.status,
            time: new Date(i.startDatetime).toLocaleDateString(),
          })));
        }
      } catch (err) {
        console.error("Failed to fetch dashboard data:", err);
      }
    };
    fetchData();
  }, [API_URL]);

  const handleRunAnalysis = async () => {
    if (eventsList.length === 0) return;
    setIsProcessing(true);
    setProgress(0);
    setActiveTab("agents");
    setAnalysisResult(null);

    try {
      // 1. Trigger Analysis
      const res = await fetch(`${API_URL}/analysis/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventId: eventsList[0].id }),
      });
      const data = await res.json();
      
      if (!data.success) throw new Error(data.error);
      const analysisId = data.data.analysisId;

      // 2. Poll Status
      const interval = setInterval(async () => {
        const statusRes = await fetch(`${API_URL}/analysis/${analysisId}/status`);
        const statusData = await statusRes.json();
        
        if (statusData.success) {
          if (statusData.data.status === "COMPLETED") {
            clearInterval(interval);
            setProgress(100);
            setIsProcessing(false);
            
            // 3. Fetch Result
            const resultRes = await fetch(`${API_URL}/analysis/${analysisId}/result`);
            const resultData = await resultRes.json();
            if (resultData.success) {
              setAnalysisResult(resultData.data);
            }
          } else if (statusData.data.status === "FAILED") {
            clearInterval(interval);
            setIsProcessing(false);
            console.error("Analysis Failed");
          } else {
            setProgress((p) => Math.min(p + 10, 90));
          }
        }
      }, 2000);

    } catch (err) {
      console.error("Analysis error:", err);
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 pt-24 flex flex-col gap-6 animate-in fade-in duration-500">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 p-6 rounded-3xl">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-3 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-2xl transition flex items-center justify-center cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <h2 className="text-2xl font-black tracking-tight">TRATROL Command Center</h2>
            </div>
            <p className="text-sm text-slate-400">Autonomous Multi-Agent Traffic Operations Room</p>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleRunAnalysis}
            disabled={isProcessing}
            className="px-6 py-3.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 text-white font-bold text-sm uppercase tracking-wider rounded-2xl transition duration-300 flex items-center gap-2 shadow-lg shadow-indigo-500/10 cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${isProcessing ? "animate-spin" : ""}`} />
            {isProcessing ? `Running Pipeline (${progress}%)` : "Run System Pipeline"}
          </button>
        </div>
      </div>

      {/* Grid Statistics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/40 border border-slate-800/50 rounded-2xl p-5 flex items-center justify-between">
          <div>
            <span className="text-3xl font-black tracking-tight">{stats.cars.toLocaleString()}</span>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-1">Total Cars Detected</p>
          </div>
          <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400"><Compass className="w-6 h-6" /></div>
        </div>

        <div className="bg-slate-900/40 border border-slate-800/50 rounded-2xl p-5 flex items-center justify-between">
          <div>
            <span className="text-3xl font-black tracking-tight text-red-500">CRITICAL</span>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-1">Grid Congestion level</p>
          </div>
          <div className="p-3 rounded-xl bg-red-500/10 text-red-400"><ShieldAlert className="w-6 h-6" /></div>
        </div>

        <div className="bg-slate-900/40 border border-slate-800/50 rounded-2xl p-5 flex items-center justify-between">
          <div>
            <span className="text-3xl font-black tracking-tight">{stats.crowd >= 1000 ? `${(stats.crowd/1000).toFixed(0)}K+` : stats.crowd}</span>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-1">Expected Crowd Size</p>
          </div>
          <div className="p-3 rounded-xl bg-yellow-500/10 text-yellow-400"><Users className="w-6 h-6" /></div>
        </div>

        <div className="bg-slate-900/40 border border-slate-800/50 rounded-2xl p-5 flex items-center justify-between">
          <div>
            <span className="text-3xl font-black tracking-tight">{stats.critical} Active</span>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-1">Critical Road Incidents</p>
          </div>
          <div className="p-3 rounded-xl bg-orange-500/10 text-orange-400"><Siren className="w-6 h-6" /></div>
        </div>
      </div>

      {/* Main Panel Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: Event and Incident listings */}
        <div className="flex flex-col gap-6 lg:col-span-1">
          {/* Active Events */}
          <div className="bg-slate-900/50 border border-slate-800/80 rounded-3xl p-5">
            <h3 className="font-extrabold text-sm uppercase tracking-wider text-slate-350 border-b border-slate-850 pb-3 flex items-center gap-2">
              <Flame className="w-4.5 h-4.5 text-red-500" /> Active Planned Events
            </h3>
            <div className="flex flex-col gap-3 mt-4">
              {eventsList.map((e) => (
                <div key={e.id} className="bg-slate-850/40 hover:bg-slate-800/40 border border-slate-800/60 hover:border-slate-750 p-4 rounded-2xl transition">
                  <div className="flex justify-between items-start">
                    <span className="font-bold text-slate-200">{e.name}</span>
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                      e.risk === "CRITICAL" ? "bg-red-500/10 text-red-400 border border-red-500/20" :
                      e.risk === "HIGH" ? "bg-orange-500/10 text-orange-400 border border-orange-500/20" :
                      "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20"
                    }`}>
                      {e.risk}
                    </span>
                  </div>
                  <div className="mt-2 text-xs text-slate-450 space-y-1">
                    <p>📍 Venue: {e.venue}</p>
                    <p>⏱ Window: {e.time}</p>
                    {e.crowd > 0 && <p>👥 Attendance: {e.crowd.toLocaleString()}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Active Incidents */}
          <div className="bg-slate-900/50 border border-slate-800/80 rounded-3xl p-5">
            <h3 className="font-extrabold text-sm uppercase tracking-wider text-slate-350 border-b border-slate-850 pb-3 flex items-center gap-2">
              <AlertTriangle className="w-4.5 h-4.5 text-orange-500 animate-pulse" /> Active Incidents
            </h3>
            <div className="flex flex-col gap-3 mt-4">
              {incidentsList.map((i) => (
                <div key={i.id} className="bg-slate-850/40 hover:bg-slate-800/40 border border-slate-800/60 hover:border-slate-750 p-4 rounded-2xl transition">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-black text-slate-300 tracking-wider bg-slate-800 px-2.5 py-0.5 rounded-md">
                      {i.type}
                    </span>
                    <span className="text-[10px] text-slate-450">{i.time}</span>
                  </div>
                  <p className="mt-2 font-bold text-slate-200 text-sm">📍 {i.location}</p>
                  <div className="flex items-center justify-between mt-3 text-xs">
                    <span className="text-slate-400 font-medium">Priority: <strong className="text-orange-400">{i.priority}</strong></span>
                    <span className="text-emerald-400 font-bold">{i.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Center/Right: Simulated CCTV Feeds & Multi-Agent analysis */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Navigation/Tabs for feeds */}
          <div className="flex gap-2 p-1.5 bg-slate-900 border border-slate-800 rounded-2xl w-fit">
            <button
              onClick={() => setActiveTab("traffic")}
              className={`px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition ${
                activeTab === "traffic" ? "bg-indigo-600 text-white shadow" : "text-slate-400 hover:text-white"
              }`}
            >
              CCTV AI Feed
            </button>
            <button
              onClick={() => setActiveTab("agents")}
              className={`px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition ${
                activeTab === "agents" ? "bg-indigo-600 text-white shadow" : "text-slate-400 hover:text-white"
              }`}
            >
              Agent Playbook
            </button>
          </div>

          {/* CCTV AI Feed */}
          {activeTab === "traffic" && (
            <div className="bg-slate-900/50 border border-slate-800/80 rounded-3xl p-6 flex flex-col gap-4">
              <div className="relative aspect-video w-full rounded-2xl bg-black overflow-hidden border border-slate-800 shadow-inner flex items-center justify-center group">
                {/* Visualizer Grid */}
                <div className="absolute inset-0 bg-slate-950/20 backdrop-blur-[1px] grid grid-cols-3 grid-rows-3 border border-indigo-500/10 pointer-events-none">
                  {Array.from({ length: 9 }).map((_, idx) => (
                    <div key={idx} className="border-r border-b border-indigo-500/5" />
                  ))}
                </div>

                {/* Scanning Light */}
                <div className="absolute left-0 right-0 h-[2px] bg-indigo-500/40 shadow-[0_0_15px_#6366f1] top-1/3 animate-[bounce_6s_infinite]" />

                {/* Simulated CCTV Camera Metadata */}
                <div className="absolute top-4 left-4 flex items-center gap-2 bg-black/60 px-3 py-1.5 rounded-xl border border-white/10 text-[10px] font-mono tracking-wider text-emerald-400">
                  <Video className="w-3.5 h-3.5 animate-pulse text-red-500" /> LIVE CAMERA FEED: SG_ROAD_CAM_04
                </div>

                <div className="absolute top-4 right-4 bg-black/60 px-3 py-1.5 rounded-xl border border-white/10 text-[10px] font-mono text-slate-300">
                  FPS: 60 / MODEL: YOLOv8n-Traffic
                </div>

                <div className="text-center p-6 space-y-3 z-10 pointer-events-none">
                  <span className="text-xs bg-indigo-500/20 text-indigo-400 font-bold border border-indigo-500/30 px-3 py-1 rounded-full uppercase tracking-wider animate-pulse">
                    Analyzing Flow Coordinates
                  </span>
                  <p className="text-sm font-semibold text-slate-300">
                    CCTV traffic analysis is mapped in the background of page 1.
                  </p>
                  <p className="text-xs text-slate-500">
                    Interact with the 3D visual landscape to inspect vehicles and trigger slowing wave physics.
                  </p>
                </div>
              </div>

              {/* Feed Stats */}
              <div className="grid grid-cols-3 gap-4 text-center mt-2">
                <div className="bg-slate-850/20 border border-slate-800/40 p-4 rounded-2xl">
                  <span className="text-2xl font-black text-slate-100">8.4 km/h</span>
                  <p className="text-[10px] font-bold text-slate-500 uppercase mt-1">Average Speed</p>
                </div>
                <div className="bg-slate-850/20 border border-slate-800/40 p-4 rounded-2xl">
                  <span className="text-2xl font-black text-slate-100">1.2 km</span>
                  <p className="text-[10px] font-bold text-slate-500 uppercase mt-1">Queue Length</p>
                </div>
                <div className="bg-slate-850/20 border border-slate-800/40 p-4 rounded-2xl">
                  <span className="text-2xl font-black text-indigo-400">CRITICAL</span>
                  <p className="text-[10px] font-bold text-slate-500 uppercase mt-1">Flow Density</p>
                </div>
              </div>
            </div>
          )}

          {/* Multi-Agent Action Plan Playbook */}
          {activeTab === "agents" && (
            <div className="bg-slate-900/50 border border-slate-800/80 rounded-3xl p-6 flex flex-col gap-6">
              <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
                <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-2xl"><Activity className="w-5 h-5" /></div>
                <div>
                  <h4 className="font-extrabold text-slate-150">Synthesized Operations Playbook</h4>
                  <p className="text-xs text-slate-400">Calculated route diversions & physical logistics</p>
                </div>
              </div>

              {/* Agent details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-850/30 border border-slate-800/50 p-4 rounded-2xl space-y-2">
                  <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest block">Agent 4: Logistics</span>
                  <p className="font-bold text-slate-200 text-sm">Deployment Recommendation</p>
                  <ul className="text-xs text-slate-400 list-disc list-inside space-y-1">
                    {analysisResult?.officersRequired ? (
                      <>
                        <li>Officers Required: {analysisResult.officersRequired} Personnel</li>
                        <li>Barricades: {analysisResult.barricadesRequired} Gate elements</li>
                        {(analysisResult.patrolPriority || []).map((p: any, idx: number) => (
                          <li key={idx}>Patrol: {p.zone} (P{p.priority})</li>
                        ))}
                      </>
                    ) : (
                      <li>Awaiting calculation...</li>
                    )}
                  </ul>
                </div>

                <div className="bg-slate-850/30 border border-slate-800/50 p-4 rounded-2xl space-y-2">
                  <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest block">Agent 5: Diversion</span>
                  <p className="font-bold text-slate-200 text-sm">Active Detours</p>
                  <ul className="text-xs text-slate-400 list-disc list-inside space-y-1">
                    {analysisResult?.diversionRoutes ? (
                      analysisResult.diversionRoutes.map((r: any, idx: number) => (
                        <li key={idx}>Avoid {r.from}. Route via {r.via} (+{r.estimatedTime}m)</li>
                      ))
                    ) : (
                      <li>Awaiting mapping...</li>
                    )}
                  </ul>
                </div>
              </div>

              {/* Synthesis Report */}
              <div className="bg-slate-950 border border-slate-850 rounded-2xl p-4 space-y-2">
                <span className="text-[10px] font-black text-emerald-400 uppercase tracking-wider">Agent 6: Decision Synthesis Summary</span>
                <p className="text-xs leading-relaxed text-slate-350">
                  {analysisResult?.explanation || (isProcessing ? "Processing synthesis..." : "Run pipeline to generate synthesis summary.")}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
