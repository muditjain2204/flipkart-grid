"use client";

import React from "react";
import Navigation from "@/components/Navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function FeaturePage({ params }: { params: { slug: string } }) {
  const { slug } = params;

  // Mock data mapping based on slug
  const featureContent: Record<string, { title: string, desc: string, icon: string }> = {
    "yolov8-cctv-analytics": {
      title: "YOLOv8 CCTV Analytics",
      desc: "Continuous vehicle detection, classification (sedans, buses, trucks, ambulances), and speed tracking from CCTV footage.",
      icon: "📹",
    },
    "multi-agent-logic-sync": {
      title: "Multi-Agent Logic Sync",
      desc: "6 distinct AI agents executing specific analytical roles sequentially to prevent gridlocks before they form.",
      icon: "🤖",
    },
    "mapbox-route-optimizations": {
      title: "Mapbox Route Optimizations",
      desc: "Dynamic coordinate diversion pathfinding with real-time ETA delta predictions during heavy event hours.",
      icon: "🗺️",
    },
    "proactive-logistics": {
      title: "Proactive Logistics",
      desc: "Heuristic and AI models planning exact officer personnel and barricade equipment deployments.",
      icon: "🛡️",
    }
  };

  const feature = featureContent[slug] || { title: "Feature Not Found", desc: "This feature is currently under development.", icon: "🚧" };

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Navigation onSectionClick={() => {}} />
      
      <div className="pt-32 px-6 max-w-4xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-indigo-600 mb-8 transition">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 md:p-12 rounded-[2.5rem] shadow-xl">
          <div className="text-6xl mb-6">{feature.icon}</div>
          <h1 className="text-3xl md:text-5xl font-black tracking-tight text-slate-900 dark:text-white mb-4">
            {feature.title}
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed mb-8">
            {feature.desc}
          </p>
          
          <div className="bg-slate-100 dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-200 dark:border-slate-700/50">
            <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-2">Development Status</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              The dedicated dashboard view for {feature.title} is currently being mapped to the backend API. Check back soon for the interactive module.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
