"use client";

import React, { useState, useEffect, useRef } from "react";
import Navigation from "@/components/Navigation";
import { ArrowLeft, Play, RotateCcw, Brain, Eye, Map, ShieldAlert, Cpu, Landmark, X, CheckCircle2, Loader2, Activity, RefreshCw, Database } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

// --- Types ---
type AgentStatus = "Idle" | "Processing" | "Synced" | "Completed";

interface Agent {
  id: string;
  name: string;
  role: string;
  icon: React.ReactNode;
  status: AgentStatus;
  inputs: Record<string, string | any>;
  outputs: Record<string, string | any>;
  dependencies: string[];
  logic: string;
  color: string;
}

interface LogEntry {
  id: string;
  timestamp: string;
  agentId: string;
  message: string;
  type: "info" | "success" | "warning";
}

// --- Initial Data ---
const initialAgents: Agent[] = [
  {
    id: "event",
    name: "Event Intelligence",
    role: "Analyzes event details, calculates crowd impact, and estimates traffic risk.",
    icon: <Landmark className="w-6 h-6" />,
    status: "Idle",
    color: "from-blue-500 to-indigo-500",
    inputs: {
      "Event Type": "Cricket Match",
      "Venue": "Stadium Ring",
      "Crowd Size": "132,000",
      "Timing": "18:00 - 23:00"
    },
    outputs: {
      "Risk Level": "CRITICAL",
      "Arrival Window": "16:00 - 18:30",
      "Event Severity": "High Impact"
    },
    dependencies: ["None (Root)"],
    logic: "Cross-references expected attendance with venue capacity and historical bottleneck data to establish base traffic load.",
  },
  {
    id: "traffic",
    name: "Traffic Perception",
    role: "Analyzes road conditions, counts vehicles, and measures density.",
    icon: <Eye className="w-6 h-6" />,
    status: "Idle",
    color: "from-teal-500 to-emerald-500",
    inputs: {
      "Live Feeds": "14 Cameras",
      "Road Weather": "Clear"
    },
    outputs: {
      "Vehicle Count": "1,482/hr",
      "Density Level": "High (0.84)",
      "Avg Speed": "12 km/h",
      "Queue Length": "1.2 km"
    },
    dependencies: ["CCTV Network"],
    logic: "Runs YOLOv8 and DeepSORT to track individual vehicles and calculate real-time flow metrics.",
  },
  {
    id: "prediction",
    name: "Congestion Prediction",
    role: "Forecasts future congestion using current and event data.",
    icon: <Activity className="w-6 h-6" />,
    status: "Idle",
    color: "from-orange-500 to-red-500",
    inputs: {
      "Event Risk": "CRITICAL",
      "Current Flow": "12 km/h"
    },
    outputs: {
      "Predicted State": "Severe Gridlock",
      "Peak Hours": "17:30 - 19:00",
      "Confidence": "94%"
    },
    dependencies: ["Event Intelligence", "Traffic Perception"],
    logic: "Utilizes temporal Graph Neural Networks (GNNs) to project traffic state 2 hours into the future based on current spatial loads.",
  },
  {
    id: "resource",
    name: "Resource Planning",
    role: "Determines required physical and human resources.",
    icon: <ShieldAlert className="w-6 h-6" />,
    status: "Idle",
    color: "from-purple-500 to-pink-500",
    inputs: {
      "Predicted State": "Severe Gridlock",
      "Venue": "Stadium Ring"
    },
    outputs: {
      "Officers Req.": "85 Personnel",
      "Barricades": "42 Units",
      "Priority Zones": "Gates 1-4"
    },
    dependencies: ["Congestion Prediction"],
    logic: "Maps predicted congestion nodes to nearest available police precincts and calculates physical barricade requirements to stem flow.",
  },
  {
    id: "diversion",
    name: "Diversion Strategy",
    role: "Suggests alternate routes and restricts zones.",
    icon: <Map className="w-6 h-6" />,
    status: "Idle",
    color: "from-yellow-400 to-orange-500",
    inputs: {
      "Predicted State": "Severe Gridlock",
      "Road Network": "Graph Active"
    },
    outputs: {
      "Detour Route": "SP Ring Road (+12m)",
      "Restricted Radius": "2.0 km",
      "Emergency Lane": "Open"
    },
    dependencies: ["Congestion Prediction"],
    logic: "Queries Mapbox Matrix API to find sub-optimal paths that bypass the predicted congestion zones while ensuring emergency access.",
  },
  {
    id: "decision",
    name: "Decision Synthesis",
    role: "Aggregates all outputs to produce a unified traffic management plan.",
    icon: <Brain className="w-6 h-6" />,
    status: "Idle",
    color: "from-indigo-600 to-purple-600",
    inputs: {
      "Resources": "85 Officers",
      "Diversion": "SP Ring Road",
      "Risk": "CRITICAL"
    },
    outputs: {
      "Unified Plan": "Execute Protocol Alpha",
      "Action Items": "Dispatch + Reroute",
      "Final Score": "Actionable"
    },
    dependencies: ["Resource Planning", "Diversion Strategy"],
    logic: "LLM synthesis mapping structured data from all specialized agents into a singular, human-readable executive command directive.",
  }
];

export default function MultiAgentSyncPage() {
  const [agents, setAgents] = useState<Agent[]>(initialAgents);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isSimulating, setIsSimulating] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
  const [hasCompleted, setHasCompleted] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const logsEndRef = useRef<HTMLDivElement>(null);

  // Custom Seed Modal States
  const [isSeedModalOpen, setIsSeedModalOpen] = useState(false);
  const [customEventName, setCustomEventName] = useState("");
  const [customVenue, setCustomVenue] = useState("");
  const [customEventType, setCustomEventType] = useState("SPORTS");
  const [customExpectedCrowd, setCustomExpectedCrowd] = useState("50000");
  const [customStartTime, setCustomStartTime] = useState("18:00");
  const [customEndTime, setCustomEndTime] = useState("22:00");

  const handleApplyCustomSeed = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSeeding(true);
    setLogs(prev => [...prev, {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      agentId: "system",
      message: `Creating custom event '${customEventName}' in database...`,
      type: "info"
    }]);

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";
      
      let startDay = "2026-07-15";
      let endDay = "2026-07-15";
      if (customEndTime < customStartTime) {
        endDay = "2026-07-16"; // Over midnight
      }
      
      const startIso = new Date(`${startDay}T${customStartTime}:00+05:30`).toISOString();
      const endIso = new Date(`${endDay}T${customEndTime}:00+05:30`).toISOString();

      const res = await fetch(`${API_URL}/events`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: customEventName,
          venue: customVenue,
          eventType: customEventType,
          expectedCrowd: parseInt(customExpectedCrowd) || 0,
          startTime: startIso,
          endTime: endIso,
          latitude: 28.6129,
          longitude: 77.2295,
          description: "Custom user-seeded simulation event."
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setLogs(prev => [...prev, {
          id: Math.random().toString(36).substr(2, 9),
          timestamp: new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          agentId: "system",
          message: `Successfully created and saved custom event in database.`,
          type: "success"
        }]);

        // Place directly into active simulation event agent inputs
        setAgents(prev => prev.map(a => {
          if (a.id === "event") {
            return {
              ...a,
              inputs: {
                "Event Name": customEventName,
                "Event Type": customEventType,
                "Venue": customVenue,
                "Crowd Size": customExpectedCrowd,
                "Timing": `${customStartTime} - ${customEndTime}`
              },
              outputs: {}
            };
          }
          return { ...a, inputs: {}, outputs: {} }; // Clear downstream inputs/outputs
        }));

        setHasCompleted(false);
        setIsSeedModalOpen(false);
      } else {
        throw new Error(data.message || "Failed to create event");
      }
    } catch (err: any) {
      console.error(err);
      setLogs(prev => [...prev, {
        id: Math.random().toString(36).substr(2, 9),
        timestamp: new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        agentId: "system",
        message: `Custom seeding failed: ${err.message || "Unknown error"}`,
        type: "warning"
      }]);
    } finally {
      setIsSeeding(false);
    }
  };

  // Initial auto-refresh
  useEffect(() => {
    refreshData();
  }, []); // Run once on mount

  // Auto scroll logs
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  const runSimulation = async () => {
    if (isSimulating) return;
    setIsSimulating(true);
    setHasCompleted(false);
    setAgents(prev => prev.map(a => {
      if (a.id === "event") {
        return {
          ...a,
          status: "Idle",
          outputs: {}
        };
      }
      return {
        ...a,
        status: "Idle",
        inputs: {},
        outputs: {}
      };
    }));
    setLogs([]);

    const addLog = (agentId: string, message: string, type: "info" | "success" | "warning" = "info") => {
      setLogs(prev => [...prev, {
        id: Math.random().toString(36).substr(2, 9),
        timestamp: new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        agentId,
        message,
        type
      }]);
    };

    const updateAgent = (id: string, status: AgentStatus) => {
      setAgents(prev => prev.map(a => a.id === id ? { ...a, status } : a));
    };

    const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

    const callAgent = async (id: string, context: any) => {
      try {
        const response = await fetch("/api/agent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ agentId: id, context })
        });
        const data = await response.json();
        return data.output || {};
      } catch (e) {
        console.error(e);
        return { error: "Failed to connect to agent" };
      }
    };

    // Simulation Sequence with Real OpenAI API
    addLog("system", "Initializing OpenAI Multi-Agent Logic Sync...", "info");
    await delay(1000);
    
    // 2. Event
    const currentEventAgent = agents.find(a => a.id === "event");
    const eventContext = { 
      Event: currentEventAgent?.inputs["Event Name"] || "Dynamic Event", 
      Type: currentEventAgent?.inputs["Event Type"] || "SPORTS",
      Venue: currentEventAgent?.inputs["Venue"] || "Stadium", 
      Crowd: currentEventAgent?.inputs["Crowd Size"] || "100000", 
      Time: currentEventAgent?.inputs["Timing"] || "18:00" 
    };

    updateAgent("event", "Processing");

    addLog("event", "Event Agent analyzing base parameters via GPT-4o...", "info");
    const eventOutput = await callAgent("event", eventContext);
    setAgents(prev => prev.map(a => a.id === "event" ? { ...a, status: "Completed", outputs: eventOutput } : a));
    addLog("event", `Event Agent → Risk Level: ${eventOutput["Risk Level"] || "CRITICAL"}`, "warning");
    
    await delay(500);

    // 2. Traffic
    updateAgent("traffic", "Processing");
    addLog("traffic", "Traffic Agent computing spatial density based on event...", "info");
    const trafficOutput = await callAgent("traffic", { eventAnalysis: eventOutput, roadConditions: "Clear, normal baseline" });
    setAgents(prev => prev.map(a => a.id === "traffic" ? { 
      ...a, 
      status: "Completed", 
      inputs: {
        "Event Risk": eventOutput["Risk Level"] || "Unknown",
        "Road Weather": "Clear, normal baseline"
      },
      outputs: trafficOutput 
    } : a));
    addLog("traffic", `Traffic Agent → Density Level: ${trafficOutput["Density Level"] || "High"}`, "warning");

    await delay(500);

    // 3. Prediction
    updateAgent("prediction", "Processing");
    addLog("prediction", "Prediction Agent aggregating contexts...", "info");
    const predictionOutput = await callAgent("prediction", { event: eventOutput, traffic: trafficOutput });
    setAgents(prev => prev.map(a => a.id === "prediction" ? { 
      ...a, 
      status: "Completed", 
      inputs: {
        "Event Risk": eventOutput["Risk Level"] || "Unknown",
        "Avg Speed": trafficOutput["Avg Speed"] || "Unknown"
      },
      outputs: predictionOutput 
    } : a));
    addLog("prediction", `Prediction Agent → Predicted: ${predictionOutput["Predicted State"] || "Severe Congestion"}`, "warning");

    await delay(500);

    // 4. Resource & Diversion (Parallel)
    updateAgent("resource", "Processing");
    updateAgent("diversion", "Processing");
    addLog("resource", "Resource Agent calculating deployments...", "info");
    addLog("diversion", "Diversion Agent charting escape routes...", "info");
    
    const [resourceOutput, diversionOutput] = await Promise.all([
      callAgent("resource", { prediction: predictionOutput }),
      callAgent("diversion", { prediction: predictionOutput })
    ]);

    setAgents(prev => prev.map(a => {
      if (a.id === "resource") return { 
        ...a, 
        status: "Completed", 
        inputs: {
          "Predicted State": predictionOutput["Predicted State"] || "Unknown",
          "Venue": eventContext.Venue
        },
        outputs: resourceOutput 
      };
      if (a.id === "diversion") return { 
        ...a, 
        status: "Completed", 
        inputs: {
          "Predicted State": predictionOutput["Predicted State"] || "Unknown",
          "Road Network": "Graph Active"
        },
        outputs: diversionOutput 
      };
      return a;
    }));

    addLog("resource", `Resource Agent → Officers: ${resourceOutput["Officers Req."] || "85"}`, "success");
    addLog("diversion", `Diversion Agent → Detour: ${diversionOutput["Detour Route"] || "SP Ring Road"}`, "success");

    await delay(500);

    // 5. Decision Synthesis
    updateAgent("decision", "Processing");
    addLog("decision", "Decision Agent synthesizing final directive...", "info");
    const decisionOutput = await callAgent("decision", { resource: resourceOutput, diversion: diversionOutput, event: eventOutput });
    setAgents(prev => prev.map(a => a.id === "decision" ? { 
      ...a, 
      status: "Completed", 
      inputs: {
        "Resources": resourceOutput["Officers Req."] || "Unknown",
        "Diversion": diversionOutput["Detour Route"] || "Unknown",
        "Risk": eventOutput["Risk Level"] || "Unknown"
      },
      outputs: decisionOutput 
    } : a));
    addLog("decision", `Decision Agent → ${decisionOutput["Unified Plan"] || "Execute Protocol"}`, "success");
    
    // Final sync state
    setAgents(prev => prev.map(a => ({ ...a, status: "Synced" })));
    addLog("system", "All agents successfully synced. Ready for deployment.", "success");
    
    setIsSimulating(false);
    setHasCompleted(true);
  };

  const handleSeedDatabase = async () => {
    if (isSeeding || isSimulating) return;
    setIsSeeding(true);
    setLogs(prev => [...prev, {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      agentId: "system",
      message: "Requesting server to reset and seed database...",
      type: "info"
    }]);

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";
      const res = await fetch(`${API_URL}/system/seed`, {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setLogs(prev => [...prev, {
          id: Math.random().toString(36).substr(2, 9),
          timestamp: new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          agentId: "system",
          message: `Success! Seeded ${data.data.eventsCount} simulation events and ${data.data.incidentsCount} Astram dataset incidents.`,
          type: "success"
        }]);
        // Refresh after seeding
        await refreshData();
      } else {
        throw new Error(data.message || "Failed to seed database");
      }
    } catch (e: any) {
      console.error(e);
      setLogs(prev => [...prev, {
        id: Math.random().toString(36).substr(2, 9),
        timestamp: new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        agentId: "system",
        message: `Seeding failed: ${e.message || "Unknown error"}`,
        type: "warning"
      }]);
    } finally {
      setIsSeeding(false);
    }
  };

  const refreshData = async () => {
    if (isSimulating) return;
    
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";
      const eventsRes = await fetch(`${API_URL}/events?limit=100`);
      const eventsJson = await eventsRes.json();
      
      if (eventsJson.success && eventsJson.data && eventsJson.data.length > 0) {
        // Find currently selected event name to avoid selecting it again if possible
        const currentEventName = agents.find(a => a.id === "event")?.inputs["Event Name"];
        const filteredEvents = eventsJson.data.filter((e: any) => e.name !== currentEventName);
        const candidates = filteredEvents.length > 0 ? filteredEvents : eventsJson.data;
        const randomEvent = candidates[Math.floor(Math.random() * candidates.length)];
        
        const formatTiming = (startStr: string, endStr: string) => {
          try {
            const start = new Date(startStr);
            const end = new Date(endStr);
            const formatTime = (d: Date) => {
              const hh = String(d.getHours()).padStart(2, '0');
              const mm = String(d.getMinutes()).padStart(2, '0');
              return `${hh}:${mm}`;
            };
            return `${formatTime(start)} - ${formatTime(end)}`;
          } catch (e) {
            return "18:00 - 23:00";
          }
        };

        setAgents(initialAgents.map(a => {
          if (a.id === "event") {
            return {
              ...a,
              inputs: {
                "Event Name": randomEvent.name,
                "Event Type": randomEvent.eventType,
                "Venue": randomEvent.venue,
                "Crowd Size": String(randomEvent.expectedCrowd),
                "Timing": formatTiming(randomEvent.startTime, randomEvent.endTime)
              },
              outputs: {}
            };
          }
          return { ...a, inputs: {}, outputs: {} }; // Clear downstream inputs/outputs
        }));

        setLogs([{
          id: Math.random().toString(36).substr(2, 9),
          timestamp: new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          agentId: "system",
          message: `Refreshed dataset with new event: ${randomEvent.name} at ${randomEvent.venue}`,
          type: "success"
        }]);
      }
    } catch (e) {
      console.error(e);
      setAgents(initialAgents);
    }

    setIsSimulating(false);
    setHasCompleted(false);
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500/30">
      <Navigation onSectionClick={() => {}} />

      <div className="pt-28 pb-20 px-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-10">
          <div>
            <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-indigo-400 mb-4 transition">
              <ArrowLeft className="w-4 h-4" /> Back to Home
            </Link>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white flex items-center gap-4">
              Agent Collaboration Center
            </h1>
            <p className="text-slate-400 mt-2 text-sm md:text-base max-w-2xl">
              Watch in real-time as multiple AI agents share context, resolve conflicts, and synthesize a unified traffic command strategy.
            </p>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={handleSeedDatabase}
              disabled={isSeeding || isSimulating}
              className="px-4 py-2 bg-red-950/40 border border-red-800/80 hover:bg-red-900/40 text-red-300 text-sm font-bold rounded-xl transition disabled:opacity-50 flex items-center gap-2"
            >
              <RotateCcw className={`w-4 h-4 ${isSeeding ? "animate-spin" : ""}`} /> {isSeeding ? "Resetting..." : "Reset Database"}
            </button>
            <button 
              onClick={() => setIsSeedModalOpen(true)}
              disabled={isSeeding || isSimulating}
              className="px-4 py-2 bg-amber-950/40 border border-amber-800/80 hover:bg-amber-900/40 text-amber-300 text-sm font-bold rounded-xl transition disabled:opacity-50 flex items-center gap-2"
            >
              <Database className="w-4 h-4" /> Seed Custom Data
            </button>
            <button 
              onClick={refreshData}
              disabled={isSimulating || isSeeding}
              className="px-4 py-2 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 text-sm font-bold rounded-xl transition disabled:opacity-50 flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${isSimulating ? "animate-spin" : ""}`} /> Refresh Data
            </button>
            <button 
              onClick={runSimulation}
              disabled={isSimulating || isSeeding}
              className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_0_20px_rgba(79,70,229,0.4)] text-sm font-bold rounded-xl transition disabled:opacity-50 flex items-center gap-2"
            >
              {isSimulating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" fill="currentColor" />} 
              {isSimulating ? "Simulating..." : "Trigger Simulation"}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Grid: Visualizer + Agent Cards */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Animated Workflow Visualizer */}
            <div className="bg-slate-900/40 border border-slate-800/80 rounded-3xl p-8 relative overflow-hidden h-[240px] flex items-center justify-center">
              {/* Background Glow */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-3/4 bg-indigo-500/10 blur-[100px] pointer-events-none" />
              
              <div className="relative w-full max-w-3xl flex flex-col items-center gap-12">
                {/* Node Row 1 */}
                <div className="flex w-full justify-around relative z-10">
                  <WorkflowNode agent={agents[0]} />
                  <WorkflowNode agent={agents[1]} />
                </div>
                {/* Node Row 2 */}
                <div className="flex w-full justify-center relative z-10">
                  <WorkflowNode agent={agents[2]} />
                </div>
                {/* Node Row 3 */}
                <div className="flex w-full justify-around relative z-10">
                  <WorkflowNode agent={agents[3]} />
                  <WorkflowNode agent={agents[5]} />
                  <WorkflowNode agent={agents[4]} />
                </div>

                {/* Simulated Data Lines (SVG) */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none z-0" style={{ overflow: "visible" }}>
                  {/* Event -> Prediction */}
                  <DataLine active={agents[0].status === "Completed" || agents[2].status === "Processing"} d="M 20% 10% L 50% 50%" />
                  {/* Traffic -> Prediction */}
                  <DataLine active={agents[1].status === "Completed" || agents[2].status === "Processing"} d="M 80% 10% L 50% 50%" />
                  {/* Prediction -> Resource */}
                  <DataLine active={agents[2].status === "Completed" || agents[3].status === "Processing"} d="M 50% 50% L 20% 90%" />
                  {/* Prediction -> Diversion */}
                  <DataLine active={agents[2].status === "Completed" || agents[4].status === "Processing"} d="M 50% 50% L 80% 90%" />
                  {/* Resource -> Decision */}
                  <DataLine active={agents[3].status === "Completed" || agents[5].status === "Processing"} d="M 20% 90% L 50% 90%" />
                  {/* Diversion -> Decision */}
                  <DataLine active={agents[4].status === "Completed" || agents[5].status === "Processing"} d="M 80% 90% L 50% 90%" />
                </svg>
              </div>
            </div>

            {/* Agent Status Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {agents.map(agent => (
                <motion.div 
                  key={agent.id}
                  layoutId={`card-${agent.id}`}
                  onClick={() => setSelectedAgent(agent)}
                  className={`bg-slate-900/60 border rounded-2xl p-5 cursor-pointer transition-all duration-300 hover:scale-[1.02] relative overflow-hidden ${
                    agent.status === "Processing" ? "border-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.2)]" :
                    agent.status === "Completed" || agent.status === "Synced" ? "border-emerald-500/50" : "border-slate-800 hover:border-slate-700"
                  }`}
                >
                  {/* Processing Gradient sweep */}
                  {agent.status === "Processing" && (
                    <motion.div 
                      animate={{ x: ["-100%", "200%"] }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-12"
                    />
                  )}

                  <div className="flex items-center justify-between mb-4 relative z-10">
                    <div className={`p-2 rounded-xl bg-gradient-to-br ${agent.color} shadow-lg`}>
                      {React.isValidElement(agent.icon) ? (
                        React.cloneElement(agent.icon as React.ReactElement<any>, { className: "w-5 h-5 text-white" })
                      ) : (
                        agent.icon
                      )}
                    </div>
                    <StatusBadge status={agent.status} />
                  </div>
                  
                  <div className="space-y-1 relative z-10">
                    <h3 className="font-bold text-white text-sm">{agent.name}</h3>
                    <p className="text-xs text-slate-400 line-clamp-1">{agent.role}</p>
                  </div>

                  <div className="mt-4 pt-4 border-t border-slate-800/80 flex gap-2 relative z-10">
                    <div className="flex-1 bg-slate-950 rounded-lg p-2 border border-slate-800/50">
                      <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-1">Latest Input</span>
                      <span className="text-xs text-slate-300 font-medium truncate block">
                        {Object.values(agent.inputs)[0]}
                      </span>
                    </div>
                    <div className="flex-1 bg-slate-950 rounded-lg p-2 border border-slate-800/50">
                      <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-1">Generated</span>
                      <span className="text-xs text-indigo-400 font-bold truncate block">
                        {agent.status === "Idle" || agent.status === "Processing" ? "..." : Object.values(agent.outputs)[0]}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Sidebar: Sync Timeline */}
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-3xl p-6 flex flex-col h-[700px]">
            <h3 className="font-extrabold text-sm uppercase tracking-wider text-slate-300 border-b border-slate-800 pb-4 mb-4 flex items-center gap-2">
              <Activity className="w-4 h-4 text-indigo-500" /> Agent Sync Timeline
            </h3>
            
            <div className="flex-1 overflow-y-auto pr-2 space-y-3 font-mono text-[11px] md:text-xs scrollbar-thin scrollbar-thumb-slate-800">
              {logs.length === 0 ? (
                <div className="text-slate-600 text-center mt-10">Trigger simulation to view real-time sync logs.</div>
              ) : (
                logs.map((log) => (
                  <motion.div 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    key={log.id} 
                    className={`p-3 rounded-xl border ${
                      log.type === "warning" ? "bg-orange-500/10 border-orange-500/20 text-orange-200" :
                      log.type === "success" ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-200" :
                      "bg-slate-950 border-slate-800 text-slate-400"
                    }`}
                  >
                    <span className="text-slate-500 mr-2">[{log.timestamp}]</span>
                    {log.message}
                  </motion.div>
                ))
              )}
              <div ref={logsEndRef} />
            </div>

            {/* Action Button that fades in after completion */}
            <AnimatePresence>
              {hasCompleted && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="mt-4 pt-4 border-t border-slate-800"
                >
                  <Link href="/dashboard" className="block">
                    <button className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2">
                      <CheckCircle2 className="w-4 h-4" /> Deploy Unified Plan to Dashboard
                    </button>
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Agent Details Modal */}
      <AnimatePresence>
        {selectedAgent && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedAgent(null)}
              className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50"
            />
            <motion.div 
              layoutId={`card-${selectedAgent.id}`}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-[2rem] shadow-2xl z-50 overflow-hidden"
            >
              {/* Modal Header */}
              <div className={`p-8 bg-gradient-to-br ${selectedAgent.color} relative`}>
                <button 
                  onClick={() => setSelectedAgent(null)}
                  className="absolute top-6 right-6 p-2 bg-black/20 hover:bg-black/40 rounded-full text-white transition"
                >
                  <X className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md">
                    {React.isValidElement(selectedAgent.icon) ? (
                      React.cloneElement(selectedAgent.icon as React.ReactElement<any>, { className: "w-8 h-8 text-white" })
                    ) : (
                      selectedAgent.icon
                    )}
                  </div>
                  <div>
                    <span className="text-white/80 text-xs font-black uppercase tracking-widest block mb-1">Agent Details</span>
                    <h2 className="text-2xl font-black text-white">{selectedAgent.name}</h2>
                  </div>
                </div>
              </div>

              {/* Modal Body */}
              <div className="p-8 space-y-8">
                <div>
                  <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Decision Logic</h4>
                  <p className="text-sm text-slate-300 leading-relaxed bg-slate-950 p-4 rounded-xl border border-slate-800">
                    {selectedAgent.logic}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                      <ArrowLeft className="w-3 h-3" /> Input Parameters
                    </h4>
                    <div className="space-y-2">
                      {Object.entries(selectedAgent.inputs).map(([key, val]) => (
                        <div key={key} className="flex justify-between items-center bg-slate-800/30 px-3 py-2 rounded-lg text-sm">
                          <span className="text-slate-400">{key}</span>
                          <span className="font-semibold text-slate-200">{val}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                      Output Generated <ArrowLeft className="w-3 h-3 rotate-180" />
                    </h4>
                    <div className="space-y-2">
                      {Object.entries(selectedAgent.outputs).map(([key, val]) => (
                        <div key={key} className="flex justify-between items-center bg-indigo-500/10 border border-indigo-500/20 px-3 py-2 rounded-lg text-sm">
                          <span className="text-indigo-300">{key}</span>
                          <span className="font-bold text-indigo-400">{val}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-800">
                  <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-3">Upstream Dependencies</h4>
                  <div className="flex gap-2">
                    {selectedAgent.dependencies.map((dep, idx) => (
                      <span key={idx} className="px-3 py-1 bg-slate-800 border border-slate-700 text-slate-300 text-xs rounded-full">
                        {dep}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Custom Seed Modal */}
      <AnimatePresence>
        {isSeedModalOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSeedModalOpen(false)}
              className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-slate-900 border border-slate-800 rounded-[2rem] shadow-2xl z-50 overflow-hidden"
            >
              {/* Modal Header */}
              <div className="p-8 bg-gradient-to-br from-amber-600 to-amber-700 relative">
                <button 
                  onClick={() => setIsSeedModalOpen(false)}
                  className="absolute top-6 right-6 p-2 bg-black/20 hover:bg-black/40 rounded-full text-white transition"
                >
                  <X className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md">
                    <Database className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <span className="text-white/80 text-xs font-black uppercase tracking-widest block mb-1">Seed Database</span>
                    <h2 className="text-2xl font-black text-white">Seed Custom Event</h2>
                  </div>
                </div>
              </div>

              {/* Modal Body */}
              <form onSubmit={handleApplyCustomSeed} className="p-8 space-y-5">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Event Name</label>
                  <input
                    type="text"
                    value={customEventName}
                    onChange={(e) => setCustomEventName(e.target.value)}
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-500 transition"
                    placeholder="IPL 2026 Mumbai Derby"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Venue</label>
                  <input
                    type="text"
                    value={customVenue}
                    onChange={(e) => setCustomVenue(e.target.value)}
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-500 transition"
                    placeholder="Wankhede Stadium, Mumbai"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Event Type</label>
                    <select
                      value={customEventType}
                      onChange={(e) => setCustomEventType(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-500 transition"
                    >
                      <option value="SPORTS">Sports</option>
                      <option value="FESTIVAL">Festival</option>
                      <option value="POLITICAL_RALLY">Political Rally</option>
                      <option value="CONCERT">Concert</option>
                      <option value="CONSTRUCTION">Construction</option>
                      <option value="PROTEST">Protest</option>
                      <option value="RELIGIOUS">Religious</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Expected Crowd</label>
                    <input
                      type="number"
                      value={customExpectedCrowd}
                      onChange={(e) => setCustomExpectedCrowd(e.target.value)}
                      required
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-500 transition"
                      placeholder="35000"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Start Time</label>
                    <input
                      type="time"
                      value={customStartTime}
                      onChange={(e) => setCustomStartTime(e.target.value)}
                      required
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-500 transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">End Time</label>
                    <input
                      type="time"
                      value={customEndTime}
                      onChange={(e) => setCustomEndTime(e.target.value)}
                      required
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-500 transition"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 mt-4 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl transition shadow-[0_0_20px_rgba(245,158,11,0.2)] flex items-center justify-center gap-2"
                >
                  <Database className="w-4 h-4" /> Seed and Apply Custom Event
                </button>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </main>
  );
}

// --- Subcomponents ---

function StatusBadge({ status }: { status: AgentStatus }) {
  const getStyle = () => {
    switch (status) {
      case "Idle": return "bg-slate-800 text-slate-400 border-slate-700";
      case "Processing": return "bg-indigo-500/20 text-indigo-400 border-indigo-500/50 animate-pulse";
      case "Completed": return "bg-emerald-500/20 text-emerald-400 border-emerald-500/50";
      case "Synced": return "bg-blue-500/20 text-blue-400 border-blue-500/50";
    }
  };

  return (
    <div className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border flex items-center gap-1.5 ${getStyle()}`}>
      {status === "Processing" && <Loader2 className="w-3 h-3 animate-spin" />}
      {status === "Completed" && <CheckCircle2 className="w-3 h-3" />}
      {status === "Synced" && <Activity className="w-3 h-3" />}
      {status}
    </div>
  );
}

function WorkflowNode({ agent }: { agent: Agent }) {
  const isActive = agent.status === "Processing" || agent.status === "Completed" || agent.status === "Synced";
  return (
    <div className="flex flex-col items-center gap-2">
      <div className={`w-12 h-12 rounded-full flex items-center justify-center relative transition-all duration-500 ${
        isActive ? `bg-gradient-to-br ${agent.color} shadow-[0_0_20px_rgba(255,255,255,0.3)] scale-110` : "bg-slate-800"
      }`}>
        {isActive && agent.status === "Processing" && (
          <div className="absolute inset-0 rounded-full border-2 border-white animate-ping opacity-20" />
        )}
        {React.isValidElement(agent.icon) ? (
          React.cloneElement(agent.icon as React.ReactElement<any>, { className: `w-5 h-5 ${isActive ? "text-white" : "text-slate-500"}` })
        ) : (
          agent.icon
        )}
      </div>
      <span className={`text-[10px] font-bold uppercase tracking-wider max-w-[80px] text-center ${isActive ? "text-white" : "text-slate-500"}`}>
        {agent.name.split(" ")[0]}
      </span>
    </div>
  );
}

function DataLine({ active, d }: { active: boolean, d: string }) {
  return (
    <g>
      {/* Base inactive path */}
      <path d={d} stroke="rgba(51, 65, 85, 0.5)" strokeWidth="2" fill="none" strokeDasharray="4 4" />
      {/* Active glowing path */}
      {active && (
        <motion.path 
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
          d={d} 
          stroke="rgba(99, 102, 241, 0.8)" 
          strokeWidth="3" 
          fill="none" 
          style={{ filter: "drop-shadow(0 0 8px rgba(99,102,241,0.8))" }}
        />
      )}
      {/* Traveling data packet */}
      {active && (
        <circle r="4" fill="#fff" style={{ filter: "drop-shadow(0 0 10px #fff)" }}>
          <animateMotion dur="1.5s" repeatCount="indefinite" path={d} />
        </circle>
      )}
    </g>
  );
}
