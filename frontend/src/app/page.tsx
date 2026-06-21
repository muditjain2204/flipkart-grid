"use client";

import React, { useState } from "react";
import Navigation from "../components/Navigation";
import HeroHUD from "../components/HeroHUD";
import VehicleDetailsHUD, { VehicleData } from "../components/VehicleDetailsHUD";
import ThreeScene from "../components/ThreeScene";
import LandingSections from "../components/LandingSections";
import DashboardView from "../components/DashboardView";

export default function Home() {
  const [activeView, setActiveView] = useState<"landing" | "dashboard">("landing");
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleData | null>(null);

  const handleSectionClick = (sectionId: string) => {
    if (activeView === "dashboard") {
      setActiveView("landing");
      setTimeout(() => {
        const el = document.getElementById(sectionId);
        if (el) el.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } else {
      if (sectionId === "hero") {
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        const el = document.getElementById(sectionId);
        if (el) el.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  const handleOpenLiveMap = () => {
    setActiveView("dashboard");
  };

  return (
    <main className="w-full relative min-h-screen bg-white overflow-x-hidden">
      {/* Universal Sticky Glass Navigation */}
      <Navigation onSectionClick={handleSectionClick} />

      <div className="flex flex-col w-full">
        {/* Hero Section — full viewport with 3D scene */}
        <div id="hero" className="relative h-screen w-full overflow-hidden">
          {/* The 3D Scene fills the entire hero */}
          <ThreeScene onSelectVehicle={setSelectedVehicle} />

          {/* Central Dashboard HUD overlay */}
          <HeroHUD onGetStarted={() => {}} />

          {/* Floating instruction */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 text-center text-[10px] font-semibold tracking-widest text-white/70 uppercase pointer-events-none bg-black/20 backdrop-blur-sm px-4 py-1.5 rounded-full">
            🖱️ Click any vehicle to see AI analysis
          </div>
        </div>

        {/* Detailed Landing Page Sections */}
        <LandingSections />
      </div>

      {/* Floating Vehicle Metrics HUD */}
      <VehicleDetailsHUD
        vehicle={selectedVehicle}
        onClose={() => setSelectedVehicle(null)}
      />
    </main>
  );
}
