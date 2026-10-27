"use client";

import { useState } from "react";
import { useApp } from "@/lib/context";
import { ShieldCheck, Lock, Mail, User, Clock, ArrowRight, Loader2, AlertCircle } from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const timerOptions = [
  { value: "30", label: "After 30 days without checking in" },
  { value: "90", label: "After 90 days without checking in" },
  { value: "180", label: "After 6 months without checking in" },
  { value: "365", label: "After 1 year without checking in" },
];

const inputBase =
  "w-full rounded-xl border bg-white dark:bg-white/[0.05] pl-11 pr-4 py-3.5 text-[15px] text-stone-800 dark:text-emerald-50 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-700/40 transition";

export default function CompleteProfile() {
  const { state, dispatch } = useApp();
  const user = (state as any).user ?? {};
  
  const [name, setName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [inactivityTimer, setInactivityTimer] = useState("90");
  
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleDeployVault = async (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim().length < 2 || !contactEmail.includes("@")) {
      setErrorMsg("Please provide valid details so your safety net functions correctly.");
      return;
    }

    setLoading(true);
    setErrorMsg("");

    try {
     // --- PROD: Update Vault Contacts & Safety Timer ---
      const res = await fetch(`${API_BASE}/api/v1/heartbeat/update-vault-contacts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          owner_username: user.pubkey || "dev_pubkey_123",
          beneficiary_name: "Trusted Contact",
          beneficiary_email: contactEmail,
          beneficiary_phone: "+10000000000",
          otp_code: "123456" // Passed transparently as per backend dev setup
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Could not save your safety net settings.");
      }

      // Route directly to the active command center upon completion
      dispatch({ type: "SET_SCREEN", payload: "owner" });
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex flex-col items-center justify-center min-h-[calc(100vh-66px)] px-6 py-12 bg-stone-50 dark:bg-[#07130f] transition-colors duration-500 overflow-hidden">
      <div className="relative z-10 w-full max-w-lg animate-fade-up">
        
        <div className="text-center mb-8">
          <div className="mx-auto w-14 h-14 rounded-full bg-emerald-900 dark:bg-emerald-400/15 text-amber-300 dark:text-emerald-300 flex items-center justify-center mb-5">
            <ShieldCheck size={26} />
          </div>
          <h1 className="font-display text-3xl md:text-4xl font-semibold tracking-tight text-emerald-950 dark:text-white mb-3">
            Set up your safety net
          </h1>
          <p className="text-stone-600 dark:text-emerald-100/70 text-base leading-relaxed max-w-md mx-auto">
            Choose who should step in to manage your private assets if you are ever unavailable.
          </p>
        </div>

        {errorMsg && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 text-red-700 text-sm flex items-start gap-3">
            <AlertCircle size={18} className="shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        <div className="rounded-3xl bg-white dark:bg-white/[0.04] border border-stone-200 dark:border-white/10 shadow-xl dark:shadow-none p-6 md:p-9">
          <form onSubmit={handleDeployVault} className="flex flex-col gap-6">
            
            <div className="flex gap-3 rounded-2xl bg-emerald-50 dark:bg-emerald-400/10 border border-emerald-100 dark:border-emerald-400/20 p-4">
              <Lock size={18} className="shrink-0 mt-0.5 text-emerald-800 dark:text-emerald-300" />
              <p className="text-sm leading-relaxed text-emerald-900 dark:text-emerald-100/85">
                Your privacy comes first. Your vault is secured on-chain, meaning neither our team nor the public can see your private information.
              </p>
            </div>

            <fieldset disabled={loading} className="flex flex-col gap-5">
              <div>
                <label className="block text-sm font-medium text-stone-700 dark:text-emerald-100/80 mb-1.5">
                  Your Full Name
                </label>
                <div className="relative">
                  <User size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input
                    type="text"
                    placeholder="e.g. Jane Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={`${inputBase} border-stone-200 dark:border-white/10`}
                    required
                  />
                </div>
              </div>

              <div className="border-t border-stone-100 dark:border-white/10 pt-6">
                <h2 className="text-sm font-semibold text-emerald-950 dark:text-white mb-3">
                  Who should step in for you?
                </h2>
                <label className="block text-sm font-medium text-stone-700 dark:text-emerald-100/80 mb-1.5">
                  Trusted Contact&apos;s Email
                </label>
                <div className="relative">
                  <Mail size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input
                    type="email"
                    placeholder="family@example.com"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    className={`${inputBase} border-stone-200 dark:border-white/10`}
                    required
                  />
                </div>
                <p className="mt-1.5 text-xs text-stone-500 dark:text-emerald-100/50">
                  We will only notify this person if your safety timer runs out.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 dark:text-emerald-100/80 mb-1.5">
                  When should we reach out?
                </label>
                <div className="relative">
                  <Clock size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
                  <select
                    value={inactivityTimer}
                    onChange={(e) => setInactivityTimer(e.target.value)}
                    className={`${inputBase} border-stone-200 dark:border-white/10 appearance-none cursor-pointer`}
                  >
                    {timerOptions.map((o) => (
                      <option key={o.value} value={o.value} className="text-stone-800">
                        {o.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </fieldset>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full inline-flex items-center justify-center gap-2 rounded-full bg-emerald-900 hover:bg-emerald-800 dark:bg-amber-300 dark:hover:bg-amber-200 text-white dark:text-emerald-950 font-semibold px-8 py-4 shadow-lg transition disabled:opacity-50"
            >
              {loading ? (
                <><Loader2 size={18} className="animate-spin" /> Activating Safety Net...</>
              ) : (
                <>Lock & Secure My Vault <ArrowRight size={18} /></>
              )}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-sm text-stone-500 dark:text-emerald-100/50">
          You can update your trusted contact or adjust the timer inside your dashboard at any time.
        </p>
      </div>
    </div>
  );
}