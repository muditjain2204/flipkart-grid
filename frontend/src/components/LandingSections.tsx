"use client";

import React from "react";
import Link from "next/link";
import {
  Brain, Eye, Map, ShieldAlert, Cpu, Landmark, Clock, Flame, Send
} from "lucide-react";

export default function LandingSections() {
  const steps = [
    {
      num: "01",
      title: "Event Intelligence Ingestion",
      desc: "City administrators register planned events. The Event Intelligence agent processes expected crowd sizes, timings, and venues to establish a base risk score.",
      icon: <Landmark className="w-6 h-6 text-indigo-500" />,
    },
    {
      num: "02",
      title: "Computer Vision Perception",
      desc: "YOLOv8 and DeepSORT models run on internal FastAPI servers to calculate vehicle counts, average speed, traffic density levels, and queue lengths from video feeds.",
      icon: <Eye className="w-6 h-6 text-indigo-500" />,
    },
    {
      num: "03",
      title: "Autonomous Logistics Planning",
      desc: "Resource and Diversion agents coordinate with Mapbox APIs to simulate traffic patterns, plan officer counts, place barricades, and map out detour configurations.",
      icon: <Brain className="w-6 h-6 text-indigo-500" />,
    },
    {
      num: "04",
      title: "Synthesized Operations Playbook",
      desc: "Our Decision Synthesis LLM summarizes structured data from all agents into a unified, actionable executive plan for deployment and citizen notification.",
      icon: <Cpu className="w-6 h-6 text-indigo-500" />,
    },
  ];

  const features = [
    {
      title: "YOLOv8 CCTV Analytics",
      desc: "Continuous vehicle detection, classification (sedans, buses, trucks, ambulances), and speed tracking from CCTV footage.",
      icon: <Eye className="w-7 h-7 text-red-500" />,
      color: "border-red-500/10 hover:border-red-500/30",
    },
    {
      title: "Multi-Agent Logic Sync",
      desc: "6 distinct AI agents executing specific analytical roles sequentially to prevent gridlocks before they form.",
      icon: <Brain className="w-7 h-7 text-yellow-500" />,
      color: "border-yellow-500/10 hover:border-yellow-500/30",
    },
    {
      title: "Mapbox Route Optimizations",
      desc: "Dynamic coordinate diversion pathfinding with real-time ETA delta predictions during heavy event hours.",
      icon: <Map className="w-7 h-7 text-emerald-500" />,
      color: "border-emerald-500/10 hover:border-emerald-500/30",
    },
    {
      title: "Proactive Logistics",
      desc: "Heuristic and AI models planning exact officer personnel and barricade equipment deployments.",
      icon: <ShieldAlert className="w-7 h-7 text-indigo-500" />,
      color: "border-indigo-500/10 hover:border-indigo-500/30",
    },
  ];

  const useCases = [
    {
      title: "Large Scale Sports Tournaments",
      subtitle: "e.g., Stadium Events",
      desc: "Rerouting city transit lanes and predicting massive incoming pedestrian crowds up to 3 hours before a match begins.",
    },
    {
      title: "VIP Movement & Parades",
      subtitle: "e.g., Public Processions",
      desc: "Securing green-light channels for emergency and VIP escort logistics while minimizing traffic shock waves along surrounding grid streets.",
    },
    {
      title: "Extreme Water Logging",
      subtitle: "e.g., Unplanned Monsoon Weather",
      desc: "Correlating flood zones with traffic volumes to dynamically block dangerous lanes and suggest active alternate corridors.",
    },
  ];

  return (
    <div className="bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 relative z-20">
      {/* 1. How It Works Section */}
      <section id="how-it-works" className="py-24 px-6 border-b border-slate-200/50 dark:border-slate-900/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
            <span className="text-xs bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              System Pipeline
            </span>
            <h2 className="text-3xl md:text-5xl font-black tracking-tight text-slate-900 dark:text-white">
              How Smartflow Works
            </h2>
            <p className="text-sm md:text-base text-slate-500 dark:text-slate-400">
              TRATROL uses a coordinated sequence of operations to solve urban traffic bottlenecks.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, idx) => (
              <div
                key={idx}
                className="bg-white dark:bg-slate-900/50 border border-slate-200/60 dark:border-slate-800 p-6 rounded-3xl relative shadow-[0_10px_30px_rgba(0,0,0,0.02)]"
              >
                <div className="absolute top-4 right-6 text-4xl font-black text-indigo-500/10 select-none">
                  {step.num}
                </div>
                <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center mb-6">
                  {step.icon}
                </div>
                <h3 className="font-extrabold text-slate-900 dark:text-white mb-3 text-lg">{step.title}</h3>
                <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 2. Features Section */}
      <section id="features" className="py-24 px-6 bg-slate-100/40 dark:bg-slate-900/10 border-b border-slate-200/50 dark:border-slate-900/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
            <span className="text-xs bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              Core Capabilities
            </span>
            <h2 className="text-3xl md:text-5xl font-black tracking-tight text-slate-900 dark:text-white">
              Platform Features
            </h2>
            <p className="text-sm md:text-base text-slate-500 dark:text-slate-400">
              Under-the-hood microservices that empower cities to run proactive smart traffic operations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map((f, idx) => {
              const slug = f.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
              return (
                <Link key={idx} href={`/features/${slug}`} className="block">
                  <div
                    className={`h-full bg-white dark:bg-slate-900/30 border p-8 rounded-3xl transition duration-500 shadow-[0_15px_40px_rgba(0,0,0,0.01)] hover:scale-[1.02] cursor-pointer ${f.color}`}
                  >
                    <div className="flex gap-6 items-start">
                      <div className="p-4 bg-slate-100 dark:bg-slate-800/60 rounded-2xl shrink-0">
                        {f.icon}
                      </div>
                      <div>
                        <h3 className="font-extrabold text-lg text-slate-900 dark:text-slate-150 mb-2">{f.title}</h3>
                        <p className="text-xs md:text-sm leading-relaxed text-slate-500 dark:text-slate-400">{f.desc}</p>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* 3. Use Cases & Scenarios */}
      <section id="use-cases" className="py-24 px-6 border-b border-slate-200/50 dark:border-slate-900/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
            <span className="text-xs bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              Real World Deployments
            </span>
            <h2 className="text-3xl md:text-5xl font-black tracking-tight text-slate-900 dark:text-white">
              Where TRATROL Operates
            </h2>
            <p className="text-sm md:text-base text-slate-500 dark:text-slate-400">
              Proven scenarios resolving city grid stress.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {useCases.map((uc, idx) => (
              <div
                key={idx}
                className="bg-white dark:bg-slate-900/50 border border-slate-200/60 dark:border-slate-800 p-8 rounded-3xl shadow-[0_12px_35px_rgba(0,0,0,0.02)] space-y-4"
              >
                <div className="space-y-1">
                  <h3 className="font-extrabold text-slate-900 dark:text-slate-150 text-lg">{uc.title}</h3>
                  <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest block">{uc.subtitle}</span>
                </div>
                <p className="text-xs md:text-sm leading-relaxed text-slate-500 dark:text-slate-400">{uc.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>



      <section id="contact" className="py-24 px-6">
        <div className="max-w-3xl mx-auto bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-8 md:p-12 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
          {/* Decorative Glow */}
          <div className="absolute -top-12 -left-12 w-32 h-32 bg-indigo-500/10 blur-2xl rounded-full" />
          <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-blue-500/10 blur-2xl rounded-full" />

          <div className="text-center mb-8 space-y-2">
            <h2 className="text-2xl md:text-4xl font-extrabold text-slate-900 dark:text-slate-100">Contact Control Center</h2>
            <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400">Onboard your city or submit general municipal feedback.</p>
          </div>

          <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Your Name"
                className="w-full px-5 py-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-250 dark:border-slate-800 text-slate-950 dark:text-white !text-slate-950 dark:!text-white placeholder-slate-500 dark:placeholder-slate-400 font-medium text-sm focus:outline-none focus:border-indigo-500 transition duration-300"
              />
              <input
                type="email"
                placeholder="Your Email"
                className="w-full px-5 py-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-250 dark:border-slate-800 text-slate-950 dark:text-white !text-slate-950 dark:!text-white placeholder-slate-500 dark:placeholder-slate-400 font-medium text-sm focus:outline-none focus:border-indigo-500 transition duration-300"
              />
            </div>
            <textarea
              placeholder="Your Message..."
              rows={4}
              className="w-full px-5 py-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-250 dark:border-slate-800 text-slate-950 dark:text-white !text-slate-950 dark:!text-white placeholder-slate-500 dark:placeholder-slate-400 font-medium text-sm focus:outline-none focus:border-indigo-500 transition duration-300"
            />
            <button
              type="submit"
              className="w-full py-4 bg-indigo-650 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white font-bold text-xs uppercase tracking-wider rounded-2xl shadow-lg shadow-indigo-500/10 hover:shadow-indigo-500/35 transition duration-300 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Send className="w-4 h-4" /> Send Message
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
