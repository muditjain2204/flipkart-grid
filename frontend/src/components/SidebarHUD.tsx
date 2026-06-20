'use client';

import React from 'react';
import { useStore, TabType } from '../store/useStore';
import { Eye, Brain, BarChart3, FileSpreadsheet, Settings } from 'lucide-react';

export const SidebarHUD: React.FC = () => {
  const activeTab = useStore((state) => state.activeTab);
  const setActiveTab = useStore((state) => state.setActiveTab);

  const menuItems: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: 'live', label: 'Live View', icon: <Eye className="w-5 h-5" /> },
    { id: 'predictions', label: 'Predictions', icon: <Brain className="w-5 h-5" /> },
    { id: 'analytics', label: 'Analytics', icon: <BarChart3 className="w-5 h-5" /> },
    { id: 'reports', label: 'Reports', icon: <FileSpreadsheet className="w-5 h-5" /> },
    { id: 'settings', label: 'Settings', icon: <Settings className="w-5 h-5" /> },
  ];

  const handleTabClick = (id: TabType) => {
    setActiveTab(id);
  };

  return (
    <aside className="fixed left-6 top-28 bottom-6 w-20 hover:w-60 group z-50 pointer-events-none transition-all duration-300 ease-out">
      <div className="pointer-events-auto w-full h-full rounded-[30px] bg-slate-950/75 backdrop-blur-md border border-white/10 shadow-2xl py-8 px-4 flex flex-col justify-between items-center group-hover:items-stretch overflow-hidden">
        {/* Navigation list */}
        <nav className="flex flex-col gap-4 w-full">
          {menuItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleTabClick(item.id)}
                className={`flex items-center gap-4 h-12 rounded-xl transition-all duration-200 text-left overflow-hidden ${
                  isActive 
                    ? 'bg-gradient-to-r from-emerald-500/20 to-teal-500/10 border-l-2 border-[#00ff88] text-[#00ff88] px-4' 
                    : 'text-slate-400 hover:text-white hover:bg-white/5 px-4'
                }`}
                title={item.label}
              >
                <div className="flex-shrink-0">{item.icon}</div>
                <span className="font-display font-medium text-sm tracking-wide transition-opacity duration-300 opacity-0 group-hover:opacity-100 whitespace-nowrap">
                  {item.label}
                </span>
              </button>
            );
          })}
        </nav>

        {/* Small branding node */}
        <div className="w-full flex items-center justify-center group-hover:justify-start px-2 font-mono text-[9px] text-slate-500 tracking-widest uppercase">
          <span className="group-hover:hidden text-center block">V7.0</span>
          <span className="hidden group-hover:block whitespace-nowrap">PROACTIVE_CONTROL_SYS</span>
        </div>
      </div>
    </aside>
  );
};
