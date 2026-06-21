"use client";

import React from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, User, LogOut, Shield, Mail, Calendar, Activity } from "lucide-react";

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    router.push("/login");
    return null;
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-20">
      {/* Navigation Header */}
      <div className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-white transition">
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>
          <button 
            onClick={() => signOut({ callbackUrl: "/" })}
            className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg text-sm font-bold transition"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 mt-12 space-y-8">
        
        {/* Profile Header Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 flex items-center gap-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-[80px] pointer-events-none" />
          
          <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl relative z-10">
            <User className="w-10 h-10 text-white" />
          </div>
          
          <div className="relative z-10">
            <h1 className="text-3xl font-black text-white">{session?.user?.name || "Commander"}</h1>
            <p className="text-indigo-400 font-medium flex items-center gap-2 mt-1">
              <Shield className="w-4 h-4" /> System Administrator
            </p>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-6 flex items-center gap-2">
              <User className="w-4 h-4" /> Account Details
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="text-xs text-slate-500 uppercase tracking-wider font-bold">Email Address</label>
                <div className="flex items-center gap-3 mt-1 text-slate-300 bg-slate-950 p-3 rounded-xl border border-slate-800/50">
                  <Mail className="w-4 h-4 text-slate-500" />
                  {session?.user?.email}
                </div>
              </div>
              
              <div>
                <label className="text-xs text-slate-500 uppercase tracking-wider font-bold">Role Access</label>
                <div className="flex items-center gap-3 mt-1 text-slate-300 bg-slate-950 p-3 rounded-xl border border-slate-800/50">
                  <Shield className="w-4 h-4 text-emerald-500" />
                  Full Read/Write Access
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-500 uppercase tracking-wider font-bold">Member Since</label>
                <div className="flex items-center gap-3 mt-1 text-slate-300 bg-slate-950 p-3 rounded-xl border border-slate-800/50">
                  <Calendar className="w-4 h-4 text-slate-500" />
                  Just now (Hackathon)
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-6 flex items-center gap-2">
              <Activity className="w-4 h-4" /> Recent Activity
            </h3>
            
            <div className="space-y-4">
              {[
                { action: "Logged in to Command Center", time: "Just now" },
                { action: "Ran Multi-Agent Simulation", time: "2 mins ago" },
                { action: "Account Created", time: "5 mins ago" },
              ].map((act, i) => (
                <div key={i} className="flex items-start justify-between p-3 rounded-xl hover:bg-slate-800/50 transition">
                  <span className="text-sm text-slate-300">{act.action}</span>
                  <span className="text-xs text-slate-500 font-mono">{act.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </main>
  );
}
