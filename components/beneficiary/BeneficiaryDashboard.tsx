"use client";

import { useState, useEffect } from "react";
import { useApp } from "@/lib/context";
import { Lock, Users, ArrowRight, Bell, ShieldCheck, Loader2 } from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function BeneficiaryDashboard() {
  const { dispatch } = useApp();
  
  const ownerPubkey = "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU"; // Hardcoded for demo route
  const ownerName = "Jane";
  
  const [vaultState, setVaultState] = useState<"ACTIVE" | "IN_CHALLENGE" | "SETTLED">("ACTIVE");
  const [timerDays, setTimerDays] = useState(90);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVaultState = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/v1/vault/state/${ownerPubkey}`);
        if (res.ok) {
          const data = await res.json();
          if (data.state) setVaultState(data.state);
          if (data.challenge_period_days) setTimerDays(data.challenge_period_days);
        }
      } catch (err) {
        // Fallback silently if offline
      } finally {
        setLoading(false);
      }
    };
    fetchVaultState();
  }, []);

  return (
    <div className="min-h-[calc(100vh-66px)] bg-stone-50 dark:bg-[#07130f] text-stone-800 dark:text-emerald-50 py-12 px-6 transition-colors duration-500">
      <div className="max-w-4xl mx-auto space-y-8 animate-fade-up">
        
        {/* Header */}
        <div className="text-center mb-10">
          <div className="mx-auto w-14 h-14 rounded-full bg-emerald-900 dark:bg-emerald-400/15 text-amber-300 dark:text-emerald-300 flex items-center justify-center mb-5">
            <Users size={26} />
          </div>
          <h1 className="font-display text-3xl md:text-4xl font-semibold tracking-tight text-emerald-950 dark:text-white mb-3">
            Family & Partner Portal
          </h1>
          <p className="text-stone-600 dark:text-emerald-100/70 text-base leading-relaxed max-w-md mx-auto">
            {ownerName} has designated you as a trusted person in their safety net.
          </p>
        </div>

        {/* Status Card */}
        <div className="rounded-3xl bg-white dark:bg-white/[0.04] border border-stone-200 dark:border-white/10 shadow-xl shadow-emerald-900/5 dark:shadow-none p-8 md:p-10 relative overflow-hidden">
          
          {loading ? (
            <div className="flex flex-col items-center justify-center py-10 text-stone-400">
              <Loader2 size={32} className="animate-spin mb-4" />
              <p>Checking vault safety status...</p>
            </div>
          ) : (
            <div className="flex flex-col md:flex-row gap-8 items-center md:items-start text-center md:text-left">
              <div className="w-24 h-24 shrink-0 rounded-full bg-emerald-50 dark:bg-white/5 border-4 border-stone-100 dark:border-white/10 flex items-center justify-center">
                {vaultState === "ACTIVE" ? (
                  <Lock size={32} className="text-emerald-800 dark:text-emerald-400" />
                ) : (
                  <ShieldCheck size={32} className="text-amber-500" />
                )}
              </div>
              
              <div className="flex-1 space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 font-mono text-[11px] uppercase tracking-widest">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  {vaultState === "ACTIVE" ? "Vault is Sealed and Active" : "Vault Handover Initiated"}
                </div>
                
                <h2 className="text-2xl font-semibold text-emerald-950 dark:text-white">
                  {ownerName}&apos;s items are currently secure.
                </h2>
                
                <p className="text-stone-600 dark:text-emerald-100/70 leading-relaxed max-w-xl">
                  {vaultState === "ACTIVE" 
                    ? `The system is actively checking in with ${ownerName}. Because the vault is locked with private encryption, you cannot view its contents at this time.` 
                    : `The safety timer has expired or a claim has been verified. You may now proceed to the Request Access portal to unlock the items assigned to you.`}
                </p>
                
                <div className="flex items-start gap-3 mt-6 p-4 rounded-2xl bg-stone-50 dark:bg-white/5 border border-stone-100 dark:border-white/10">
                  <Bell size={20} className="text-amber-500 dark:text-amber-300 shrink-0 mt-0.5" />
                  <p className="text-sm text-stone-600 dark:text-emerald-100/70">
                    If {ownerName} is unable to check in for <strong className="text-emerald-950 dark:text-white">{timerDays} days</strong>, 
                    you will receive a notification allowing you to request emergency access.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-center pt-6">
          <button 
            onClick={() => dispatch({ type: "SET_SCREEN", payload: "claim" })}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-stone-800 hover:bg-stone-700 dark:bg-white/10 dark:hover:bg-white/20 text-white px-8 py-3.5 text-sm font-medium transition"
          >
            I need to request emergency access now <ArrowRight size={16} />
          </button>
        </div>

      </div>
    </div>
  );
}