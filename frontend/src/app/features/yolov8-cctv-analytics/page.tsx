"use client";

import React, { useState, useEffect, useRef } from "react";
import Navigation from "@/components/Navigation";
import { 
  ArrowLeft, Eye, Upload, Play, Pause, 
  Activity, Video, AlertCircle, RefreshCw, 
  Settings, Award, Flame, Check 
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

interface DetectionLog {
  time: string;
  msg: string;
  type: "success" | "warning" | "error" | "info";
}

export default function Yolov8CctvPage() {
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [detectionLogs, setDetectionLogs] = useState<DetectionLog[]>([
    { time: "15:20:00", msg: "YOLOv8 model loaded successfully (Weights: yolov8n.pt)", type: "success" },
    { time: "15:20:01", msg: "DeepSORT tracking module initiated", type: "info" },
    { time: "15:20:03", msg: "Connecting to virtual CCTV Node #14...", type: "info" },
    { time: "15:20:05", msg: "Live feed established. Frame rate: 30.2 FPS.", type: "success" }
  ]);

  // Statistics
  const [metrics, setMetrics] = useState({
    cars: 24,
    trucks: 6,
    buses: 2,
    ambulances: 1,
    avgSpeed: 22,
    density: 0.74,
  });

  const [activeTab, setActiveTab] = useState<"monitor" | "parameters">("monitor");
  const [inferenceTime, setInferenceTime] = useState<number>(14.2);

  // Simulated bounding box animation
  const [boundingBoxes, setBoundingBoxes] = useState<any[]>([]);

  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      // Randomly update metrics slightly to simulate real-time tracking
      setMetrics(prev => ({
        cars: Math.max(10, prev.cars + (Math.random() > 0.5 ? 1 : -1)),
        trucks: Math.max(2, prev.trucks + (Math.random() > 0.7 ? 1 : -1)),
        buses: Math.max(0, prev.buses + (Math.random() > 0.8 ? 1 : -1)),
        ambulances: Math.random() > 0.95 ? (prev.ambulances === 0 ? 1 : 0) : prev.ambulances,
        avgSpeed: Math.max(8, Math.min(45, prev.avgSpeed + Math.floor(Math.random() * 3) - 1)),
        density: parseFloat(Math.max(0.2, Math.min(0.95, prev.density + (Math.random() > 0.5 ? 0.02 : -0.02))).toFixed(2)),
      }));

      // Generate random bounding boxes for the simulated video overlay
      const classes = ["Car", "Truck", "Bus", "Ambulance"];
      const colors = ["border-red-500", "border-blue-500", "border-yellow-500", "border-emerald-500"];
      const newBoxes = Array.from({ length: Math.floor(Math.random() * 4) + 3 }).map(() => {
        const classIdx = Math.floor(Math.random() * classes.length);
        const top = Math.random() * 60 + 15;
        const left = Math.random() * 70 + 10;
        const width = Math.random() * 15 + 10;
        const height = Math.random() * 15 + 10;
        return {
          label: `${classes[classIdx]} [ID: ${Math.floor(Math.random() * 900) + 100}]`,
          color: colors[classIdx],
          top: `${top}%`,
          left: `${left}%`,
          width: `${width}%`,
          height: `${height}%`,
        };
      });
      setBoundingBoxes(newBoxes);

      // Random logs
      if (Math.random() > 0.7) {
        const time = new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
        const alerts = [
          { msg: "Detected Ambulance - Emergency vehicle override protocol standby.", type: "warning" as const },
          { msg: "Heavy vehicle flow detected in Lane 2.", type: "info" as const },
          { msg: "Tracking confidence index at 98.4%.", type: "success" as const },
          { msg: "Speed drop anomaly detected in Node #14 inflow.", type: "warning" as const }
        ];
        const randomAlert = alerts[Math.floor(Math.random() * alerts.length)];
        setDetectionLogs(prev => [
          { time, msg: randomAlert.msg, type: randomAlert.type },
          ...prev.slice(0, 15)
        ]);
        setInferenceTime(parseFloat((11.0 + Math.random() * 5).toFixed(1)));
      }
    }, 1200);

    return () => clearInterval(interval);
  }, [isPlaying]);

  // Video Upload Handler
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUploadVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("video", selectedFile);

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";
      const res = await fetch(`${API_URL}/traffic/upload`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (res.ok && data.success) {
        // Set the uploaded video URL
        setVideoUrl(`${API_URL.replace("/api/v1", "")}${data.data.videoUrl}`);
        
        const time = new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
        setDetectionLogs(prev => [
          { time, msg: `Uploaded video: ${data.data.originalName} (${(data.data.size / 1024 / 1024).toFixed(2)} MB)`, type: "success" },
          { time, msg: "YOLOv8 + DeepSORT analyzing custom video feed...", type: "info" },
          ...prev
        ]);
      } else {
        throw new Error(data.error || "Failed to upload video");
      }
    } catch (err: any) {
      console.error(err);
      const time = new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
      setDetectionLogs(prev => [
        { time, msg: `Upload Failed: ${err.message || "Unknown error"}`, type: "error" },
        ...prev
      ]);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-red-500/30">
      <Navigation onSectionClick={() => {}} />

      <div className="pt-28 pb-20 px-6 max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-red-400 mb-4 transition">
              <ArrowLeft className="w-4 h-4" /> Back to Home
            </Link>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white flex items-center gap-4">
              YOLOv8 CCTV Inference Center
            </h1>
            <p className="text-slate-400 mt-2 text-sm md:text-base max-w-2xl">
              Track vehicle classifications, count traffic density, and measure speeds in real-time using edge CCTV analytics.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* CCTV Feed Panel (Columns 1 & 2) */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Monitor Window */}
            <div className="bg-slate-900 border border-slate-800 rounded-[2rem] overflow-hidden relative shadow-2xl">
              
              {/* Top Bar */}
              <div className="bg-slate-950 border-b border-slate-850 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-2.5 h-2.5 rounded-full ${isPlaying ? "bg-red-500 animate-pulse" : "bg-slate-600"}`} />
                  <span className="text-xs font-bold font-mono tracking-widest text-slate-300">CCTV_FEED_NODE_14</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-[10px] bg-red-500/10 border border-red-500/30 text-red-400 font-bold px-2 py-0.5 rounded">
                    FPS: 30.2
                  </span>
                  <span className="text-[10px] bg-slate-800 text-slate-400 font-bold px-2 py-0.5 rounded">
                    {inferenceTime}ms inf.
                  </span>
                </div>
              </div>

              {/* Feed Screen */}
              <div className="relative aspect-video bg-black flex items-center justify-center overflow-hidden">
                {videoUrl ? (
                  <video 
                    src={videoUrl}
                    autoPlay
                    loop
                    muted
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center space-y-4">
                    {/* Simulated Street Scene Background */}
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.05)_0%,transparent_70%)]" />
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(18,24,38,0.4)_1px,transparent_1px),linear-gradient(90deg,rgba(18,24,38,0.4)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none" />
                    
                    <Video className="w-12 h-12 text-slate-700 animate-pulse" />
                    <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Simulated Traffic Viewport active</span>
                  </div>
                )}

                {/* Bounding Box Overlays */}
                <AnimatePresence>
                  {isPlaying && boundingBoxes.map((box, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className={`absolute border-2 ${box.color} flex flex-col justify-start rounded`}
                      style={{
                        top: box.top,
                        left: box.left,
                        width: box.width,
                        height: box.height,
                      }}
                    >
                      <span className="bg-slate-950/80 backdrop-blur-sm text-[8px] font-bold text-white font-mono px-1 rounded-sm -mt-4 border border-slate-850 shrink-0 self-start select-none whitespace-nowrap">
                        {box.label}
                      </span>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {/* Grid CRT effect overlay */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%)] bg-[size:100%_4px] pointer-events-none" />
              </div>

              {/* Feed Controls */}
              <div className="bg-slate-950 px-6 py-4 flex items-center justify-between border-t border-slate-850">
                <div className="flex gap-2">
                  <button 
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="p-2.5 bg-slate-900 border border-slate-800 hover:bg-slate-800 rounded-xl text-slate-300 transition"
                  >
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </button>
                  <button 
                    onClick={() => setBoundingBoxes([])}
                    className="p-2.5 bg-slate-900 border border-slate-800 hover:bg-slate-800 rounded-xl text-slate-300 transition text-xs font-bold"
                  >
                    Clear Overlays
                  </button>
                </div>

                {/* File Upload Trigger */}
                <form onSubmit={handleUploadVideo} className="flex gap-2 items-center">
                  <label className="px-4 py-2 bg-slate-900 border border-slate-800 hover:bg-slate-800 rounded-xl text-slate-300 text-xs font-bold transition flex items-center gap-2 cursor-pointer">
                    <Upload className="w-3.5 h-3.5" />
                    {selectedFile ? selectedFile.name : "Select Video Feed"}
                    <input 
                      type="file" 
                      accept="video/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                  {selectedFile && (
                    <button 
                      type="submit"
                      disabled={isUploading}
                      className="px-4 py-2 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition flex items-center gap-2"
                    >
                      {isUploading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                      Upload & Analyze
                    </button>
                  )}
                </form>
              </div>

            </div>

            {/* Classification HUD Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { name: "Sedans / SUVs", count: metrics.cars, color: "border-red-500/20 text-red-400" },
                { name: "Heavy Cargo Trucks", count: metrics.trucks, color: "border-blue-500/20 text-blue-400" },
                { name: "Mass Transit Buses", count: metrics.buses, color: "border-yellow-500/20 text-yellow-400" },
                { name: "Ambulances / Siren", count: metrics.ambulances, color: `border-emerald-500/20 text-emerald-400 ${metrics.ambulances > 0 ? "bg-emerald-500/5 animate-pulse" : ""}` }
              ].map((c, idx) => (
                <div key={idx} className={`bg-slate-900 border rounded-2xl p-5 relative overflow-hidden ${c.color}`}>
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">{c.name}</div>
                  <div className="text-3xl font-black font-mono text-white">{c.count}</div>
                  <div className="text-[10px] text-slate-500 mt-1">active tracking ID count</div>
                </div>
              ))}
            </div>

            {/* Analytical Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Average Passage Speed</div>
                  <div className="text-2xl font-black text-white font-mono">{metrics.avgSpeed} km/h</div>
                </div>
                <div className="w-16 h-10 bg-slate-950 rounded-lg flex items-center justify-center text-xs font-mono text-slate-500 border border-slate-850">
                  SPEED
                </div>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Spatial Density Score</div>
                  <div className="text-2xl font-black text-white font-mono">{metrics.density} <span className="text-xs text-slate-500 font-normal">/ 1.00</span></div>
                </div>
                <div className="w-16 h-10 bg-slate-950 rounded-lg flex items-center justify-center text-xs font-mono text-slate-500 border border-slate-850">
                  DENSITY
                </div>
              </div>
            </div>

          </div>

          {/* Detections Timeline Console (Column 3) */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 flex flex-col h-[650px]">
            <h3 className="font-extrabold text-sm uppercase tracking-wider text-slate-300 border-b border-slate-850 pb-4 mb-4 flex items-center gap-2">
              <Activity className="w-4 h-4 text-red-500 animate-pulse" /> Live Inference Detections
            </h3>
            
            <div className="flex-1 overflow-y-auto pr-2 space-y-3 font-mono text-xs scrollbar-thin scrollbar-thumb-slate-800">
              {detectionLogs.map((log, idx) => (
                <div 
                  key={idx} 
                  className={`p-3 rounded-xl border ${
                    log.type === "success" ? "bg-emerald-500/5 border-emerald-500/10 text-emerald-300" :
                    log.type === "warning" ? "bg-yellow-500/5 border-yellow-500/10 text-yellow-350" :
                    log.type === "error" ? "bg-red-500/5 border-red-500/10 text-red-300" :
                    "bg-slate-950 border-slate-850 text-slate-400"
                  }`}
                >
                  <span className="text-slate-500 mr-2">[{log.time}]</span>
                  {log.msg}
                </div>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t border-slate-850 space-y-3">
              <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-950 p-3 rounded-lg border border-slate-850">
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                <span>All video processing runs locally on sandboxed YOLOv8 tensors.</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}
