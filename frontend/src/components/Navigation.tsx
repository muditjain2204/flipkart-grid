"use client";

import React, { useState } from "react";
import { Sparkles, LogIn, Menu, X, User, ChevronDown } from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";

interface NavigationProps {
  onSectionClick: (sectionId: string) => void;
  onOpenLiveMap?: () => void;
}

export default function Navigation({ onSectionClick, onOpenLiveMap }: NavigationProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { data: session } = useSession();

  const navItems = [
    { label: "How it works", id: "how-it-works" },
    { label: "Features", id: "features" },
    { label: "Predictions", id: "predictions" },
    { label: "Use Cases", id: "use-cases" },
    { label: "Contact", id: "contact" },
  ];

  const handleNavClick = (e: React.MouseEvent | null, id: string) => {
    if (id === "how-it-works" || id === "features" || id === "hero" || id === "use-cases" || id === "contact") {
      if (typeof window !== "undefined" && window.location.pathname === "/") {
        if (e) e.preventDefault();
        onSectionClick(id);
        setMobileMenuOpen(false);
      }
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-4 py-3 pointer-events-auto">
      <div className="max-w-[1400px] mx-auto flex items-center justify-between bg-blue-100/70 backdrop-blur-lg border border-gray-200/60 px-5 py-2.5 rounded-2xl shadow-[0_2px_20px_rgba(0,0,0,0.06)]">
        {/* Brand Logo */}
        <div className="flex items-center gap-2.5 cursor-pointer shrink-0" onClick={(e) => handleNavClick(e, "hero")}>
          <div className="flex flex-col gap-[3px] items-center bg-gray-50 p-1.5 rounded-lg border border-gray-100">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_6px_#ef4444]" />
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-400 shadow-[0_0_6px_#facc15]" />
            <div className="w-2.5 h-2.5 rounded-full bg-green-500 shadow-[0_0_6px_#22c55e]" />
          </div>
          <span className="text-xl font-black tracking-tight text-gray-800">
            TRATROL
          </span>
        </div>

        {/* Desktop Nav Links */}
        <div className="hidden lg:flex items-center gap-1">
          {navItems.map((item) => {
            if (item.id === "features") {
              return (
                <div key={item.id} className="relative group py-2">
                  <button
                    onClick={(e) => handleNavClick(e, item.id)}
                    className="text-[13px] font-semibold px-3.5 py-2 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-50 cursor-pointer transition-all duration-200 inline-flex items-center gap-1"
                  >
                    {item.label}
                    <ChevronDown className="w-3.5 h-3.5 transition-transform duration-200 group-hover:rotate-180" />
                  </button>
                  {/* Dropdown Menu */}
                  <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 w-72 bg-white/95 backdrop-blur-md border border-gray-200/80 rounded-2xl shadow-xl py-2.5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform scale-95 group-hover:scale-100 pointer-events-none group-hover:pointer-events-auto">
                    {[
                      { title: "YOLOv8 CCTV Analytics", desc: "Continuous vehicle detection & speed tracking", href: "/features/yolov8-cctv-analytics", color: "hover:bg-red-50/50 hover:text-red-600" },
                      { title: "Multi-Agent Logic Sync", desc: "6 distinct AI agents executing logic pipelines", href: "/features/multi-agent-logic-sync", color: "hover:bg-yellow-50/50 hover:text-yellow-600" },
                      { title: "Mapbox Route Optimizations", desc: "Dynamic route diversion pathfinding", href: "/features/mapbox-route-optimizations", color: "hover:bg-emerald-50/50 hover:text-emerald-600" },
                      { title: "Proactive Logistics", desc: "AI planning for officers & barricades", href: "/features/proactive-logistics", color: "hover:bg-indigo-50/50 hover:text-indigo-600" }
                    ].map((sub, sIdx) => {
                      if (sub.href) {
                        return (
                          <Link
                            key={sIdx}
                            href={sub.href}
                            className={`block px-4 py-2.5 transition-colors duration-150 text-gray-800 ${sub.color}`}
                          >
                            <div className="font-extrabold text-[12px] tracking-tight">{sub.title}</div>
                            <div className="text-[10px] text-gray-500 font-medium leading-normal mt-0.5">{sub.desc}</div>
                          </Link>
                        );
                      }
                      return (
                        <button
                          key={sIdx}
                          onClick={(e) => handleNavClick(e, "features")}
                          className={`w-full text-left block px-4 py-2.5 transition-colors duration-150 text-gray-800 ${sub.color}`}
                        >
                          <div className="font-extrabold text-[12px] tracking-tight">{sub.title}</div>
                          <div className="text-[10px] text-gray-500 font-medium leading-normal mt-0.5">{sub.desc}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            }
            if (item.id === "predictions") {
              return (
                <Link
                  key={item.id}
                  href="/features/congestion-predictions"
                  className="text-[13px] font-semibold px-3.5 py-2 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-50 cursor-pointer transition-all duration-200"
                >
                  {item.label}
                </Link>
              );
            }
            return (
              <Link
                key={item.id}
                href={`/#${item.id}`}
                onClick={(e) => handleNavClick(e, item.id)}
                className="text-[13px] font-semibold px-3.5 py-2 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-50 cursor-pointer transition-all duration-200"
              >
                {item.label}
              </Link>
            );
          })}
        </div>

        {/* Traffic Light Buttons + CTAs */}
        <div className="hidden lg:flex items-center gap-2">
          {session ? (
            <>
              <Link href="/dashboard">
                <button className="px-4 py-2 text-xs font-bold text-white rounded-full bg-green-500 shadow-sm transition hover:bg-green-600">
                  Live Map Dashboard
                </button>
              </Link>
              <div className="w-px h-5 bg-gray-200 mx-1" />
              <div className="flex items-center gap-2">
                <Link href="/profile" className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-md hover:scale-105 transition cursor-pointer">
                  <span className="text-white font-black text-sm select-none">
                    {session.user?.name ? session.user.name.charAt(0).toUpperCase() : "U"}
                  </span>
                </Link>
                <Link href="/profile">
                  <button className="px-4 py-2 text-xs font-bold text-white rounded-full bg-indigo-600 shadow-sm flex items-center gap-1.5 transition hover:bg-indigo-700">
                    <User className="w-3.5 h-3.5" /> Profile
                  </button>
                </Link>
              </div>
            </>
          ) : (
            <>
              <div className="w-px h-5 bg-gray-200 mx-1" />
              <Link href="/register">
                <button className="px-4 py-2 text-xs font-bold text-white rounded-full bg-blue-600 shadow-sm flex items-center gap-1.5 transition hover:bg-blue-700">
                  <Sparkles className="w-3.5 h-3.5" /> Get Started
                </button>
              </Link>
              <Link href="/login">
                <button className="px-3.5 py-2 text-xs font-semibold text-gray-600 rounded-full border border-gray-200 flex items-center gap-1.5 transition hover:bg-gray-50">
                  <LogIn className="w-3.5 h-3.5" /> Sign In
                </button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu */}
        <div className="lg:hidden">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg bg-gray-50 text-gray-600 hover:bg-gray-100 cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden mt-2 mx-4 bg-white border border-gray-200 p-5 rounded-2xl shadow-xl flex flex-col gap-3">
          {navItems.map((item) => {
            if (item.id === "predictions") {
              return (
                <Link
                  key={item.id}
                  href="/features/congestion-predictions"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-left font-semibold text-gray-600 p-2 rounded-lg transition text-sm hover:bg-gray-50 cursor-pointer block"
                >
                  {item.label}
                </Link>
              );
            }
            return (
              <Link
                key={item.id}
                href={`/#${item.id}`}
                onClick={(e) => handleNavClick(e, item.id)}
                className="text-left font-semibold text-gray-600 p-2 rounded-lg transition text-sm hover:bg-gray-50 cursor-pointer block"
              >
                {item.label}
              </Link>
            );
          })}
          <div className="h-px bg-gray-100 my-1" />
          <div className="grid grid-cols-3 gap-2">
            <button onClick={() => {}} className="py-2 text-xs font-bold text-white rounded-full bg-red-500 cursor-default">About</button>
            <button onClick={() => {}} className="py-2 text-xs font-bold text-gray-900 rounded-full bg-yellow-400 cursor-default">Features</button>
            <button onClick={() => {}} className="py-2 text-xs font-bold text-white rounded-full bg-green-500 cursor-default">Live Map</button>
          </div>
          <button onClick={() => {}} className="w-full py-2.5 text-sm font-bold text-white rounded-full bg-blue-600 flex items-center justify-center gap-1.5 cursor-default">
            <Sparkles className="w-4 h-4" /> Get Started
          </button>
        </div>
      )}
    </nav>
  );
}
