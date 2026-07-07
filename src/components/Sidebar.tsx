import React, { useState } from "react";
import { AppScreen } from "../types";
import SettingsModal from "./SettingsModal";

interface SidebarProps {
  currentScreen: AppScreen;
  onNavigate: (screen: AppScreen) => void;
}

export default function Sidebar({ currentScreen, onNavigate }: SidebarProps) {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const menuItems = [
    {
      screen: AppScreen.DASHBOARD,
      label: "Dashboard",
      icon: "dashboard"
    },
    {
      screen: AppScreen.PROJECTS_LIST,
      label: "Projects",
      icon: "architecture"
    },
    {
      screen: AppScreen.USERS_AND_ROLES,
      label: "Users",
      icon: "group"
    },
    {
      screen: AppScreen.REPORTS_CENTER,
      label: "Reports",
      icon: "assessment"
    }
  ];

  return (
    <>
      <aside className="fixed left-0 top-0 h-full w-[240px] bg-[#181c1e] text-white flex flex-col py-6 border-r border-[#d5c4ab]/20 z-50 select-none">
        {/* Brand Identity Header - Click to redirect to Dashboard */}
        <div 
          onClick={() => onNavigate(AppScreen.DASHBOARD)}
          className="px-6 mb-8 cursor-pointer hover:opacity-[0.9] transition-opacity active:scale-[0.98]"
          title="Navegar al Dashboard Principal"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#ffb800] rounded flex items-center justify-center text-[#181c1e]">
              <span className="material-symbols-outlined font-bold" style={{ fontVariationSettings: "'FILL' 1" }}>
                architecture
              </span>
            </div>
            <div>
              <h1 className="font-sans text-lg font-black text-[#ffb800] leading-none">GMP BIM</h1>
              <p className="text-[10px] text-gray-400 tracking-widest uppercase mt-1">Construction Management</p>
            </div>
          </div>
        </div>

        {/* Main Navigation Menu */}
        <nav className="flex-1 px-3 space-y-1">
          {menuItems.map((item) => {
            const isActive = currentScreen === item.screen;
            return (
              <button
                key={item.screen}
                onClick={() => onNavigate(item.screen)}
                className={`w-full flex items-center gap-3 px-4 py-3 font-medium text-sm transition-all duration-200 cursor-pointer rounded ${
                  isActive
                    ? "text-[#ffb800] bg-gray-800 border-l-4 border-[#ffb800]"
                    : "text-gray-400 hover:bg-gray-800/65 hover:text-[#ffb800]"
                }`}
              >
                <span className="material-symbols-outlined text-lg">{item.icon}</span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Bottom Preferences & Quick Actions */}
        <div className="px-3 space-y-1 pt-6 border-t border-gray-800">
          <div className="px-3 mb-4">
            <button
              onClick={() => onNavigate(AppScreen.REGISTER_PROJECT)}
              className="w-full bg-[#ffb800] text-[#181c1e] px-4 py-3 rounded-lg font-bold text-xs flex items-center justify-center gap-2 hover:brightness-105 active:scale-95 transition-all shadow-sm cursor-pointer"
            >
              <span className="material-symbols-outlined font-bold text-sm">add</span>
              <span>New Project</span>
            </button>
          </div>
          
          <button
            id="sidebar_settings_btn"
            onClick={() => setIsSettingsOpen(true)}
            className="w-full flex items-center gap-3 px-4 py-3 text-gray-450 hover:text-[#ffb800] hover:bg-gray-800/40 text-sm rounded cursor-pointer text-left"
          >
            <span className="material-symbols-outlined text-lg">settings</span>
            <span>Settings</span>
          </button>
        </div>
      </aside>

      {/* Embedded Modals Stage for the Sidebar */}
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </>
  );
}
