"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { useApp } from "@/lib/context";
import type { Screen } from "@/lib/types";
import {
  LayoutDashboard,
  Users,
  FolderHeart,
  SlidersHorizontal,
  User,
  LogOut,
  Sun,
  Moon,
  ChevronDown,
  Lock,
  Menu,
  X,
  Home,
} from "lucide-react";

const navItems: {
  id: Screen;
  label: string;
  icon: typeof LayoutDashboard;
}[] = [
  { id: "landing", label: "Home", icon: Home },
  { id: "owner", label: "My Vault", icon: LayoutDashboard },
  { id: "profile", label: "Safety Net", icon: SlidersHorizontal },
  { id: "beneficiary", label: "Family & Partners", icon: Users },
  { id: "claim", label: "Request Access", icon: FolderHeart },
];

export default function Navbar() {
  const { state, dispatch, logout } = useApp();
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const navigate = (screen: Screen) => {
    dispatch({ type: "SET_SCREEN", payload: screen });
    setProfileOpen(false);
    setMobileMenuOpen(false);
  };

  const toggleTheme = () => {
    dispatch({ type: "SET_THEME", payload: !state.isDark });
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const userName = state.user?.name || "My Account";
  const userEmail = state.user?.email || "Private Vault Member";
  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <header className="fixed w-full top-0 left-0 h-[66px] bg-white/35 dark:bg-[#07130f]/45 backdrop-blur-2xl backdrop-saturate-150 border-b border-stone-200/40 dark:border-white/[0.08] shadow-[0_4px_30px_rgba(0,0,0,0.03)] flex items-center px-4 md:px-6 z-50 transition-colors duration-500">
      <div className="max-w-7xl mx-auto w-full flex items-center justify-between gap-4">
        
        {/* ─── Left: Brand Logo & Calm Status Pill ─── */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("landing")}
            className="flex items-center gap-2.5 group focus:outline-none"
          >
            <Image 
              src="/logo.png" 
              alt="Terminus Logo" 
              width={36} 
              height={36} 
              className="rounded-xl shadow-md shadow-emerald-950/15 border border-emerald-800/10 dark:border-emerald-300/20 group-hover:scale-105 transition-transform object-cover"
            />
            <div className="flex flex-col text-left">
              <span className="font-display text-xl font-semibold text-emerald-950 dark:text-white tracking-tight leading-none">
                Terminus
              </span>
              <span className="text-[11px] text-stone-500 dark:text-emerald-200/60 mt-0.5">
                Personal & Business Vault
              </span>
            </div>
          </button>

          <div className="hidden xl:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 dark:bg-emerald-400/10 border border-emerald-600/20 dark:border-emerald-400/20 text-xs font-medium text-emerald-800 dark:text-emerald-300">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Protected & Online
          </div>
        </div>

        {/* ─── Center: Translucent Navigation Dock (Desktop) ─── */}
        <nav
          aria-label="Primary Navigation"
          className="hidden lg:flex items-center gap-1 p-1 rounded-full bg-stone-200/45 dark:bg-white/[0.04] border border-stone-300/40 dark:border-white/[0.07] backdrop-blur-md"
        >
          {navItems.map(({ id, label, icon: Icon }) => {
            const active = state.screen === id;
            return (
              <button
                key={id}
                onClick={() => navigate(id)}
                className={`relative flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
                  active
                    ? "bg-emerald-900 text-white dark:bg-amber-300 dark:text-emerald-950 shadow-sm font-semibold"
                    : "text-stone-700 dark:text-emerald-100/75 hover:text-emerald-950 dark:hover:text-white hover:bg-white/50 dark:hover:bg-white/[0.06]"
                }`}
              >
                <Icon size={14} />
                <span>{label}</span>
              </button>
            );
          })}
        </nav>

        {/* ─── Right: Theme Switcher, Sign In & Profile Menu ─── */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={toggleTheme}
            aria-label="Switch light or dark appearance"
            className="p-2 rounded-full bg-white/50 dark:bg-white/[0.06] text-stone-700 dark:text-emerald-100 border border-stone-300/50 dark:border-white/10 hover:border-emerald-700 dark:hover:border-amber-300 transition"
          >
            {state.isDark ? <Sun size={16} className="text-amber-300" /> : <Moon size={16} />}
          </button>

          {state.screen !== "auth" && !state.user && (
            <button
              onClick={() => navigate("auth")}
              className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-emerald-900 hover:bg-emerald-800 dark:bg-amber-300 dark:hover:bg-amber-200 text-white dark:text-emerald-950 text-xs font-semibold px-4 py-2 shadow-md shadow-emerald-950/10 transition"
            >
              <Lock size={13} />
              Sign In
            </button>
          )}

          {/* Profile Menu Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setProfileOpen((prev) => !prev)}
              aria-expanded={profileOpen}
              className="flex items-center gap-2 pl-1.5 pr-2.5 py-1 rounded-full bg-white/60 dark:bg-white/[0.06] border border-stone-300/50 dark:border-white/10 hover:border-emerald-700/50 dark:hover:border-amber-300/40 transition"
            >
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-emerald-800 to-emerald-950 dark:from-emerald-400 dark:to-amber-300 text-amber-300 dark:text-emerald-950 flex items-center justify-center text-xs font-bold">
                {initials}
              </div>
              <span className="hidden md:block text-xs font-medium text-emerald-950 dark:text-emerald-50 max-w-[110px] truncate">
                {userName}
              </span>
              <ChevronDown
                size={14}
                className={`text-stone-500 dark:text-emerald-200/70 transition-transform duration-200 ${
                  profileOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {profileOpen && (
              <div className="absolute right-0 mt-2.5 w-64 rounded-2xl bg-white/95 dark:bg-[#0b1c16]/95 backdrop-blur-2xl border border-stone-200/80 dark:border-white/10 shadow-2xl p-2 z-50">
                <div className="px-3 py-2.5 border-b border-stone-100 dark:border-white/10">
                  <p className="text-xs font-semibold text-emerald-950 dark:text-white truncate">
                    {userName}
                  </p>
                  <p className="text-[11px] text-stone-500 dark:text-emerald-100/60 truncate">
                    {userEmail}
                  </p>
                  <span className="inline-flex items-center gap-1 mt-1.5 px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-500/20 text-[10px] font-medium text-emerald-800 dark:text-emerald-300">
                    <Lock size={10} /> Private by design
                  </span>
                </div>

                <div className="py-1.5 space-y-0.5">
                  <button
                    onClick={() => navigate("owner")}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-stone-700 dark:text-emerald-100/85 hover:bg-emerald-50 dark:hover:bg-white/5 transition"
                  >
                    <LayoutDashboard size={15} className="text-emerald-700 dark:text-amber-300" />
                    My Vault & Items
                  </button>
                  <button
                    onClick={() => navigate("profile")}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-stone-700 dark:text-emerald-100/85 hover:bg-emerald-50 dark:hover:bg-white/5 transition"
                  >
                    <User size={15} className="text-emerald-700 dark:text-amber-300" />
                    My Profile & Safety Timer
                  </button>
                  <button
                    onClick={() => navigate("beneficiary")}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-stone-700 dark:text-emerald-100/85 hover:bg-emerald-50 dark:hover:bg-white/5 transition"
                  >
                    <Users size={15} className="text-emerald-700 dark:text-amber-300" />
                    Family & Partner View
                  </button>
                  <button
                    onClick={() => navigate("claim")}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-stone-700 dark:text-emerald-100/85 hover:bg-emerald-50 dark:hover:bg-white/5 transition"
                  >
                    <FolderHeart size={15} className="text-emerald-700 dark:text-amber-300" />
                    Request Emergency Access
                  </button>
                </div>

                <div className="pt-1.5 border-t border-stone-100 dark:border-white/10">
                  <button
                    onClick={() => {
                      logout();
                      navigate("landing");
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition"
                  >
                    <LogOut size={15} />
                    Lock Vault & Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label="Open Menu"
            className="lg:hidden p-2 rounded-xl bg-white/50 dark:bg-white/[0.06] text-stone-700 dark:text-emerald-100 border border-stone-300/50 dark:border-white/10"
          >
            {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* ─── Mobile Drawer ─── */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-x-0 top-[66px] bg-white/95 dark:bg-[#07130f]/95 backdrop-blur-2xl border-b border-stone-200/60 dark:border-white/10 px-6 py-4 space-y-2 shadow-xl">
          {navItems.map(({ id, label, icon: Icon }) => {
            const active = state.screen === id;
            return (
              <button
                key={id}
                onClick={() => navigate(id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition ${
                  active
                    ? "bg-emerald-900 text-white dark:bg-amber-300 dark:text-emerald-950 font-semibold"
                    : "text-stone-700 dark:text-emerald-100/80 hover:bg-stone-100 dark:hover:bg-white/5"
                }`}
              >
                <Icon size={17} />
                {label}
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
}