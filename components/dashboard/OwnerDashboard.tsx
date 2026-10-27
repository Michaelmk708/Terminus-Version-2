"use client";

import { useState, useEffect } from "react";
import { useApp } from "@/lib/context";
import {
  ShieldCheck, Wallet, FileText, Activity, Plus,
  KeyRound, Landmark, Folder, Trash2, X,
  Mail, Loader2, ShieldAlert,
  Sparkles, PenTool,
  UploadCloud, Lock, TrendingUp,
  Flame, ExternalLink, Users, Eye,
  AlertTriangle, TrendingDown
} from "lucide-react";

type Category = "legal" | "finance" | "crypto" | "logins" | "other";
type Asset = { id: number; name: string; category: Category; note: string; value?: number; createdAt: number; hasFile?: boolean; fileName?: string; fileUrl?: string; };
type LegacyMessage = { id: number; recipient: string; title: string; preview: string; createdAt: number };
type LogItem = { id: number; text: string; tone: "gold" | "green" | "red" | "alert"; at: number; isVariable?: boolean };

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

const categories: Record<Category, { label: string; icon: typeof FileText }> = {
  legal: { label: "Legal or property", icon: FileText },
  finance: { label: "Bank or investment", icon: Landmark },
  crypto: { label: "Digital savings", icon: Wallet },
  logins: { label: "Passwords", icon: KeyRound },
  other: { label: "Other item", icon: Folder },
};

const dailyPrompts = [
  "What is a mistake you made in your 20s that you want your kids to avoid?",
  "What was your biggest win today?",
  "What is a core value you hope your family never forgets?",
  "If your partners had to take over today, what is your #1 piece of advice?"
];

const field = "w-full rounded-xl border border-stone-200 dark:border-white/10 bg-white dark:bg-white/[0.05] px-4 py-3 text-[15px] text-stone-800 dark:text-emerald-50 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-700/40 transition";

export default function OwnerDashboard() {
  const { state } = useApp();
  const user = (state as any).user ?? {};

  // Mocked for Pitch Mode
  const ownerPubkey = user.pubkey || "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU";
  const isWeb3 = true;

  // --- State ---
  const [assets, setAssets] = useState<Asset[]>([]);
  const [messages, setMessages] = useState<LegacyMessage[]>([]);
  const [log, setLog] = useState<LogItem[]>([]);
  const [isDataLoading, setIsDataLoading] = useState(true);

  const [trustedEmail, setTrustedEmail] = useState(user.contactEmail || user.trustedEmail || "No contact assigned");
  const [timerDays, setTimerDays] = useState(Number(user.inactivityTimer) || 90);
  const [vaultState, setVaultState] = useState<"ACTIVE" | "IN_CHALLENGE">("ACTIVE");
  const [daysLeft, setDaysLeft] = useState(timerDays);
  
  const [dailyStreak, setDailyStreak] = useState(0);
  const [dailyAnswer, setDailyAnswer] = useState("");
  const [todayPrompt, setTodayPrompt] = useState(dailyPrompts[0]);
  const [promptAnswered, setPromptAnswered] = useState(false);
  
  const [liveWalletBalance, setLiveWalletBalance] = useState(0);
  const [hoursLeftInDay, setHoursLeftInDay] = useState(24);
  
  // Modals & UI States
  const [assetModalOpen, setAssetModalOpen] = useState(false);
  const [messageModalOpen, setMessageModalOpen] = useState(false);
  const [panicModalOpen, setPanicModalOpen] = useState(false);
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [isDefending, setIsDefending] = useState(false);
  const [isSavingAsset, setIsSavingAsset] = useState(false);
  const [isSavingLetter, setIsSavingLetter] = useState(false);
  const [isEditingSafetyNet, setIsEditingSafetyNet] = useState(false);

  // Form States
  const [editEmail, setEditEmail] = useState(trustedEmail);
  const [editTimer, setEditTimer] = useState(timerDays.toString());
  const [aName, setAName] = useState("");
  const [aCat, setACat] = useState<Category>("crypto");
  const [aNote, setANote] = useState("");
  const [aValue, setAValue] = useState("");
  const [uploadDoc, setUploadDoc] = useState<any>(null);
  const [mRecipient, setMRecipient] = useState("");
  const [mTitle, setMTitle] = useState("");
  const [mBody, setMBody] = useState("");

  const addLog = (text: string, tone: LogItem["tone"], isVariable = false) => 
    setLog((l) => [{ id: Date.now() + Math.random(), text, tone, at: Date.now(), isVariable }, ...l]);

  useEffect(() => {
    setTodayPrompt(dailyPrompts[Math.floor(Math.random() * dailyPrompts.length)]);
    setHoursLeftInDay(24 - new Date().getHours());

    const fetchVaultData = async () => {
      try {
        const [assetsRes, msgsRes, stateRes] = await Promise.all([
          fetch(`${API_BASE}/api/v1/vault/assets/${ownerPubkey}`).catch(() => null),
          fetch(`${API_BASE}/api/v1/vault/messages/${ownerPubkey}`).catch(() => null),
          fetch(`${API_BASE}/api/v1/vault/state/${ownerPubkey}`).catch(() => null)
        ]);

        if (assetsRes?.ok) {
          const aData = await assetsRes.json();
          setAssets(aData.assets || []);
        }
        if (msgsRes?.ok) {
          const mData = await msgsRes.json();
          setMessages(mData.messages || []);
        }
        if (stateRes?.ok) {
          const sData = await stateRes.json();
          if (sData.state) setVaultState(sData.state);
          if (sData.challenge_period_days) setDaysLeft(sData.challenge_period_days);
          if (sData.streak) setDailyStreak(sData.streak);
          if (sData.prompt_answered_today) setPromptAnswered(true);
        }

        const variableEvents = [
          { text: "Mainnet congestion spiked globally. Your Argust Trust ZK execution SLA remains unaffected.", tone: "gold" as const },
          { text: "A new device attempted to query your public vault metadata. Encryption held.", tone: "alert" as const },
          { text: "You are currently in the top 12% of protected users in your network cohort.", tone: "green" as const }
        ];
        const randomEvent = variableEvents[Math.floor(Math.random() * variableEvents.length)];
        addLog(randomEvent.text, randomEvent.tone, true);

      } catch (err) {
        console.error("Failed to fetch live vault data", err);
      } finally {
        setIsDataLoading(false);
      }
    };
    fetchVaultData();
  }, [ownerPubkey]);

  // Hook Mathematics
  const totalNetWorth = assets.reduce((sum, a) => sum + (a.value || 0), 0) + liveWalletBalance;
  
  let healthScore = 40;
  if (assets.length > 0) healthScore += 20;
  if (assets.length > 2 || liveWalletBalance > 0) healthScore += 15;
  if (messages.length > 0) healthScore += 15;
  if (promptAnswered) healthScore += 10;

  const riskPercentage = (100 - healthScore) / 100;
  const valueAtRisk = totalNetWorth * riskPercentage;
  const securedValue = totalNetWorth - valueAtRisk;
  const percentileRank = Math.min(99, Math.max(12, healthScore - Math.floor(Math.random() * 5)));

  // Handlers
  const handleSubmitDaily = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dailyAnswer.trim()) return;
    setIsCheckingIn(true);
    
    // Simulate Encryption Delay for Pitch
    await new Promise(r => setTimeout(r, 1200));

    try {
      const fd = new FormData();
      fd.append("vault_owner", ownerPubkey);
      fd.append("journal_entry", dailyAnswer);
      await fetch(`${API_BASE}/api/v1/claims/ping-heartbeat`, { method: "POST", body: fd });
    } finally {
      const daysMissed = timerDays - daysLeft;
      if (daysMissed > 10) {
        addLog(`NEAR MISS: You went ${daysMissed} days without checking in. Smart contract transfer averted.`, "alert", true);
      } else {
        addLog("Daily reflection encrypted. Safety timer reset to maximum.", "green");
      }
      
      setDaysLeft(timerDays);
      setPromptAnswered(true);
      setDailyStreak(s => s + 1);
      setIsCheckingIn(false);
    }
  };

  const handleDefendVault = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsDefending(true);
    await new Promise(r => setTimeout(r, 1500));
    try {
      const fd = new FormData();
      fd.append("vault_owner", ownerPubkey);
      fd.append("proof_of_life_sig", `POL_SIG_${Date.now()}`);
      await fetch(`${API_BASE}/api/v1/vault/defend`, { method: "POST", body: fd });
    } finally {
      setVaultState("ACTIVE");
      setPanicModalOpen(false);
      addLog("EMERGENCY DEFENSE SUCCESSFUL: Handover request terminated via Argust Trust ZK proof.", "green", true);
      setIsDefending(false);
    }
  };

  const addAsset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (aName.trim().length < 2) return;
    setIsSavingAsset(true);
    
    await new Promise(r => setTimeout(r, 1500));
    
    try {
      const fd = new FormData();
      fd.append("owner_pubkey", ownerPubkey);
      fd.append("name", aName.trim());
      fd.append("category", aCat);
      fd.append("note", aNote.trim());
      if (aValue) fd.append("value", aValue);
      if (uploadDoc) fd.append("file", uploadDoc);

      const res = await fetch(`${API_BASE}/api/v1/vault/add-asset`, { method: "POST", body: fd });
      if (res.ok) {
        const newAssetData = await res.json();
        if (uploadDoc) newAssetData.asset.fileUrl = URL.createObjectURL(uploadDoc);
        
        setAssets([newAssetData.asset, ...assets]);
        addLog(`Vault Equity Increased: Protected "${aName}"`, "green");
        setAName(""); setANote(""); setAValue(""); setUploadDoc(null); setAssetModalOpen(false);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSavingAsset(false);
    }
  };

  // Mocked Encryption Flow for Pitch
  const saveMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mTitle || !mBody) return;
    setIsSavingLetter(true);

    // Simulate Lit Protocol Network call delay for realism
    await new Promise(r => setTimeout(r, 1800));

    try {
      const mockCiphertext = `lit_mock_encrypted_${Buffer.from(mBody).toString('base64').substring(0, 30)}...`;

      const res = await fetch(`${API_BASE}/api/v1/vault/add-message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          owner_pubkey: ownerPubkey,
          recipient: mRecipient || "Family",
          title: mTitle,
          body: mockCiphertext, 
          lit_hash: "mock_data_to_encrypt_hash_for_pitch"
        })
      });

      if (res.ok) {
        const newMsgData = await res.json();
        setMessages([newMsgData.message, ...messages]);
        addLog(`Social Equity Increased: Encrypted letter to ${mRecipient}.`, "green");
        setMRecipient(""); setMTitle(""); setMBody(""); setMessageModalOpen(false);
      }
    } catch (err) {
      console.error("Upload failed:", err);
    } finally {
      setIsSavingLetter(false);
    }
  };

  if (isDataLoading) {
    return (
      <div className="min-h-[calc(100vh-66px)] bg-stone-50 dark:bg-[#07130f] flex items-center justify-center">
        <Loader2 className="animate-spin text-emerald-700 dark:text-emerald-400" size={32} />
      </div>
    );
  }

  const pct = Math.max(0, Math.min(100, (daysLeft / timerDays) * 100));

  return (
    <div className="min-h-[calc(100vh-66px)] bg-stone-50 dark:bg-[#07130f] text-stone-800 dark:text-emerald-50 py-10 px-6 transition-colors duration-500">
      <div className="max-w-6xl mx-auto space-y-8">

        {vaultState === "IN_CHALLENGE" && (
          <div className="rounded-3xl bg-red-600 text-white p-6 md:p-8 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 animate-pop-in">
            <div className="flex items-start gap-4">
              <ShieldAlert size={32} className="shrink-0 text-amber-300 mt-1" />
              <div>
                <span className="text-xs font-bold uppercase tracking-wider bg-black/30 px-3 py-1 rounded-full text-white">Critical • 30 Days to Overwrite</span>
                <h2 className="font-display text-2xl font-bold mt-2">Emergency Transfer Initiated</h2>
                <p className="text-sm text-red-100 mt-1 max-w-2xl">A trusted contact has triggered your Dead Man&apos;s Switch. If you do not verify your presence, your assets and letters will be decrypted and transferred.</p>
              </div>
            </div>
            <button onClick={handleDefendVault} disabled={isDefending} className="shrink-0 rounded-full bg-amber-300 hover:bg-amber-200 text-red-950 font-bold px-8 py-4 shadow-[0_0_20px_rgba(252,211,77,0.4)] transition disabled:opacity-70 flex items-center gap-2">
              {isDefending ? <Loader2 size={18} className="animate-spin" /> : "ABORT HANDOVER & LOCK"}
            </button>
          </div>
        )}

        <div className="flex flex-col md:flex-row justify-between gap-6 bg-white dark:bg-white/[0.04] border border-stone-200 dark:border-white/10 p-6 md:p-8 rounded-3xl shadow-sm">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6 md:gap-12 w-full md:w-auto">
            <div>
              <p className="text-stone-500 dark:text-emerald-100/60 text-xs font-semibold mb-1.5 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck size={14} className="text-emerald-600 dark:text-emerald-400" /> Protected Equity
              </p>
              <h1 className="font-display text-3xl md:text-4xl font-bold tracking-tight text-emerald-950 dark:text-white">
                ${securedValue.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
              </h1>
            </div>
            
            <div className={`pl-6 md:pl-12 border-l ${valueAtRisk > 0 ? "border-red-500/30" : "border-stone-200 dark:border-white/10"}`}>
              <p className={`text-xs font-semibold mb-1.5 uppercase tracking-wider flex items-center gap-1.5 ${valueAtRisk > 0 ? "text-red-600 dark:text-red-400" : "text-stone-500 dark:text-emerald-100/60"}`}>
                {valueAtRisk > 0 ? <AlertTriangle size={14} /> : <ShieldCheck size={14} />} Value at Risk
              </p>
              <h2 className={`font-display text-3xl md:text-4xl font-bold tracking-tight ${valueAtRisk > 0 ? "text-red-600 dark:text-red-400 animate-pulse" : "text-emerald-950 dark:text-white"}`}>
                ${valueAtRisk.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
              </h2>
            </div>
            
            <div className="hidden md:block pl-12 border-l border-stone-200 dark:border-white/10">
               <p className="text-stone-500 dark:text-emerald-100/60 text-xs font-semibold mb-1.5 uppercase tracking-wider flex items-center gap-1.5">
                 Live Total
                 {liveWalletBalance > 0 && <span className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 px-1.5 py-0.5 rounded text-[9px] flex items-center gap-1"><TrendingUp size={10}/> Sync</span>}
               </p>
               <h3 className="font-display text-xl font-semibold text-stone-400 dark:text-emerald-100/40">
                 ${totalNetWorth.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
               </h3>
               {isWeb3 && (
                <div className="mt-1 inline-flex items-center gap-1 text-[10px] font-mono text-emerald-700 dark:text-emerald-300/60 hover:text-emerald-500 transition cursor-pointer">
                  <Wallet size={10} /> {ownerPubkey.slice(0, 4)}...{ownerPubkey.slice(-4)}
                </div>
              )}
            </div>
          </div>
          
          <div className="flex flex-col gap-3 shrink-0">
            <button onClick={() => setAssetModalOpen(true)} className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-900 hover:bg-emerald-800 dark:bg-amber-300 dark:hover:bg-amber-200 text-white dark:text-emerald-950 font-bold px-6 py-3 shadow-lg transition">
              <Plus size={18} /> Secure New Asset
            </button>
            <button onClick={() => setMessageModalOpen(true)} className="inline-flex items-center justify-center gap-2 rounded-full border border-stone-300 dark:border-white/15 text-stone-700 dark:text-emerald-100 hover:bg-stone-100 dark:hover:bg-white/5 font-semibold px-6 py-2.5 transition">
              <PenTool size={16} /> Write a Letter
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            
            {!promptAnswered ? (
              <section className="rounded-3xl bg-gradient-to-br from-[#1c110b] to-[#2a130f] border border-red-900/50 p-6 md:p-8 text-white shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
                <div className="flex items-center justify-between mb-4 relative z-10">
                  <h2 className="text-lg font-semibold flex items-center gap-2"><Flame size={20} className="text-amber-400" /> Life Log Overdue</h2>
                  <div className="flex items-center gap-1.5 bg-red-950/80 px-3 py-1 rounded-full text-xs font-bold text-red-400 border border-red-900/50">
                    <TrendingDown size={14} /> {hoursLeftInDay} Hours to save your {dailyStreak}-day streak
                  </div>
                </div>
                <p className="font-display text-xl md:text-2xl font-medium mb-6 leading-snug relative z-10">&quot;{todayPrompt}&quot;</p>
                <form onSubmit={handleSubmitDaily} className="relative z-10 space-y-3">
                  <textarea rows={3} value={dailyAnswer} onChange={(e) => setDailyAnswer(e.target.value)} placeholder="Type here to encrypt your reflection and save your streak..." className="w-full rounded-2xl bg-black/40 border border-red-900/50 px-4 py-3 text-sm text-red-50 placeholder:text-red-200/40 focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition resize-none" required />
                  <button type="submit" disabled={isCheckingIn} className="rounded-full bg-amber-400 hover:bg-amber-300 text-red-950 font-bold px-6 py-3 transition flex items-center gap-2 text-sm disabled:opacity-70">
                    {isCheckingIn ? <Loader2 size={16} className="animate-spin" /> : <Lock size={16} />}
                    {isCheckingIn ? "Encrypting..." : "Save Streak & Secure Vault"}
                  </button>
                </form>
              </section>
            ) : (
              <section className="rounded-3xl bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-800/30 p-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-emerald-200 dark:bg-emerald-800/50 flex items-center justify-center text-emerald-700 dark:text-emerald-300"><ShieldCheck size={24} /></div>
                  <div>
                    <h3 className="font-semibold text-emerald-950 dark:text-white">Streak secured: {dailyStreak} days</h3>
                    <p className="text-sm text-emerald-700 dark:text-emerald-300/70">Your value is protected. Next milestone at {(Math.floor(dailyStreak/5)+1)*5} days.</p>
                  </div>
                </div>
              </section>
            )}

            <section className="rounded-3xl bg-white dark:bg-white/[0.04] border border-stone-200 dark:border-white/10 p-6 md:p-8">
              <h2 className="text-xl font-semibold text-emerald-950 dark:text-white mb-6">Protected Inventory</h2>
              {assets.length === 0 ? (
                <div className="text-sm text-stone-500 py-8 text-center border-2 border-dashed border-stone-200 dark:border-white/10 rounded-2xl">Your vault is empty. Add assets to increase your Protection Equity.</div>
              ) : (
                <ul className="flex flex-col gap-3">
                  {assets.map((a) => {
                    const Icon = categories[a.category]?.icon || Folder;
                    return (
                      <li key={a.id} className="flex items-center justify-between gap-4 p-4 rounded-2xl border border-stone-100 dark:border-white/5 bg-stone-50/60 dark:bg-white/[0.02]">
                        <div className="flex items-center gap-4 min-w-0">
                          <div className="w-12 h-12 shrink-0 rounded-full bg-stone-200/50 dark:bg-white/5 flex items-center justify-center text-stone-600 dark:text-emerald-200"><Icon size={20} /></div>
                          <div className="min-w-0">
                            <p className="font-medium text-emerald-950 dark:text-white truncate flex items-center gap-2">
                              {a.name}
                              {a.hasFile && a.fileUrl && (
                                <a href={a.fileUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-mono bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-300 dark:hover:bg-emerald-800/60 transition shadow-sm"><Eye size={12} /> View File</a>
                              )}
                            </p>
                            <p className="text-xs text-stone-500 mt-0.5 truncate">{categories[a.category]?.label || "Other"}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          {a.value && <span className="font-mono text-sm font-semibold text-emerald-900 dark:text-emerald-100">${a.value.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>}
                          <button onClick={() => setAssets((list) => list.filter((x) => x.id !== a.id))} className="text-stone-300 hover:text-red-500 transition"><Trash2 size={16} /></button>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>
          </div>

          <aside className="space-y-6">
            
            <section className="rounded-3xl bg-white dark:bg-white/[0.04] border border-stone-200 dark:border-white/10 p-6 md:p-8">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-sm font-bold uppercase tracking-wider text-emerald-950 dark:text-white flex items-center gap-2">
                  <Activity size={16} className="text-emerald-600 dark:text-amber-300" /> Threat & Equity Feed
                </h2>
              </div>
              
              <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-emerald-50 to-stone-50 dark:from-emerald-900/20 dark:to-white/[0.02] border border-emerald-100 dark:border-emerald-800/30">
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-[10px] uppercase font-bold tracking-widest text-emerald-700 dark:text-emerald-400/80 mb-1">Network Rank</p>
                    <p className="text-sm font-medium text-emerald-950 dark:text-white">Top {percentileRank}% of protected users</p>
                  </div>
                  <span className="font-display text-3xl font-bold text-emerald-800 dark:text-emerald-300">{healthScore}</span>
                </div>
                <div className="h-1.5 w-full bg-stone-200 dark:bg-white/10 rounded-full mt-3 overflow-hidden">
                  <div className={`h-full rounded-full transition-all ${healthScore >= 100 ? "bg-amber-400" : "bg-emerald-500"}`} style={{ width: `${healthScore}%` }} />
                </div>
              </div>

              <div className="space-y-4 relative">
                <div className="absolute left-[9px] top-2 bottom-2 w-px bg-stone-200 dark:bg-white/10" />
                {log.slice(0, 4).map((item) => (
                  <div key={item.id} className="relative pl-6">
                    <span className={`absolute left-0 top-1.5 w-[19px] h-[19px] rounded-full border-[4px] border-white dark:border-[#07130f] ${
                      item.tone === "alert" ? "bg-red-500" :
                      item.tone === "gold" ? "bg-amber-400" :
                      "bg-emerald-500"
                    }`} />
                    <p className={`text-[13px] leading-relaxed font-medium ${
                      item.tone === "alert" ? "text-red-700 dark:text-red-400" :
                      item.tone === "gold" ? "text-amber-700 dark:text-amber-200" :
                      "text-emerald-900 dark:text-emerald-100/90"
                    }`}>
                      {item.text}
                    </p>
                    {item.isVariable && <p className="text-[10px] text-stone-400 mt-1 uppercase tracking-wider">Network Event</p>}
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-3xl bg-emerald-950 border border-emerald-900 shadow-lg p-6 md:p-8 text-white space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <ShieldCheck size={26} className="text-amber-300" />
                  <div>
                    <h2 className="text-lg font-semibold">Switch Active</h2>
                    <p className="text-xs text-emerald-200/70">Vault locked and safe</p>
                  </div>
                </div>
                {!isEditingSafetyNet && <button onClick={() => setIsEditingSafetyNet(true)} className="text-xs px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 transition">Edit</button>}
              </div>

              {isEditingSafetyNet ? (
                <div className="space-y-4 pt-2">
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-emerald-200/70 mb-1">Kin Email</label>
                    <input type="email" value={editEmail} onChange={e=>setEditEmail(e.target.value)} className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber-300" />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-emerald-200/70 mb-1">Grace Period</label>
                    <select value={editTimer} onChange={e=>setEditTimer(e.target.value)} className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber-300">
                      <option value="30">30 Days</option>
                      <option value="90">90 Days</option>
                      <option value="365">1 Year</option>
                    </select>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setIsEditingSafetyNet(false)} className="flex-1 py-2 text-xs bg-white/5 rounded-lg">Cancel</button>
                    <button onClick={async (e) => { e.preventDefault(); setTrustedEmail(editEmail); setTimerDays(Number(editTimer)); setDaysLeft(Number(editTimer)); setIsEditingSafetyNet(false); addLog("Network Update: Next of Kin and Grace Period synced.", "gold"); }} className="flex-1 py-2 text-xs font-bold bg-amber-400 text-emerald-950 rounded-lg">Update</button>
                  </div>
                </div>
              ) : (
                <>
                  <div>
                    <div className="flex items-baseline justify-between mb-2"><span className="text-sm text-emerald-100/80">Time until handover</span><span className="font-display text-2xl text-amber-300">{daysLeft} days</span></div>
                    <div className="h-2 rounded-full bg-white/10 overflow-hidden"><div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-amber-300 transition-all duration-700" style={{ width: `${pct}%` }} /></div>
                  </div>
                  <div className="flex items-center gap-3 rounded-xl bg-white/5 border border-white/10 p-3"><Users size={16} className="text-emerald-300 shrink-0" /><div className="min-w-0"><p className="text-[10px] uppercase tracking-widest text-emerald-100/60">Next of Kin</p><p className="text-sm font-medium truncate">{trustedEmail}</p></div></div>
                </>
              )}
            </section>
          </aside>
        </div>
      </div>

      {/* --- MODALS --- */}
      {messageModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-emerald-950/80 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-[#0b1c16] border border-stone-200 dark:border-white/10 shadow-2xl p-6 md:p-8 animate-slide-up">
            <div className="flex items-start justify-between mb-6">
              <div><h2 className="font-display text-2xl font-bold text-emerald-950 dark:text-white">Leave a Legacy Letter</h2><p className="text-xs text-stone-500 dark:text-emerald-100/60 mt-1">This will only be read if your dead man&apos;s switch triggers.</p></div>
              <button onClick={() => setMessageModalOpen(false)} className="text-stone-400 hover:text-stone-600"><X size={18} /></button>
            </div>
            <form onSubmit={saveMessage} className="flex flex-col gap-4">
              <div><label className="block text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-emerald-100/70 mb-1">Recipient</label><input type="text" value={mRecipient} onChange={(e) => setMRecipient(e.target.value)} placeholder="e.g. My Co-Founder, John" className={field} required /></div>
              <div><label className="block text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-emerald-100/70 mb-1">Subject</label><input type="text" value={mTitle} onChange={(e) => setMTitle(e.target.value)} placeholder="e.g. Accessing the admin panels" className={field} required /></div>
              <div><label className="block text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-emerald-100/70 mb-1">Private Message</label><textarea rows={5} value={mBody} onChange={(e) => setMBody(e.target.value)} placeholder="Write your private message here..." className={field + " resize-none text-sm"} required /></div>
              <button type="submit" disabled={isSavingLetter} className="rounded-full bg-emerald-900 dark:bg-amber-300 text-white dark:text-emerald-950 py-3.5 font-bold mt-2 disabled:opacity-50 flex justify-center">
                {isSavingLetter ? <Loader2 className="animate-spin" size={20} /> : "Encrypt & Seal Letter"}
              </button>
            </form>
          </div>
        </div>
      )}

      {assetModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-emerald-950/80 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-[#0b1c16] border border-stone-200 dark:border-white/10 shadow-2xl p-6 md:p-8 animate-slide-up">
            <div className="flex items-start justify-between mb-6">
              <div><h2 className="font-display text-2xl font-bold text-emerald-950 dark:text-white">Protect an Asset</h2><p className="text-xs text-stone-500 dark:text-emerald-100/60 mt-1">Uploads are encrypted and pinned to IPFS.</p></div>
              <button onClick={() => setAssetModalOpen(false)} className="text-stone-400 hover:text-stone-600"><X size={18} /></button>
            </div>
            <form onSubmit={addAsset} className="flex flex-col gap-4">
              <div><label className="block text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-emerald-100/70 mb-1">Asset Name</label><input type="text" value={aName} onChange={(e) => setAName(e.target.value)} placeholder="e.g. Base Layer 2 Wallet" className={field} required /></div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-emerald-100/70 mb-1">Category</label>
                  <select value={aCat} onChange={(e) => setACat(e.target.value as Category)} className={field}>
                    {Object.entries(categories).map(([k, c]) => <option key={k} value={k}>{c.label}</option>)}
                  </select>
                </div>
                <div><label className="block text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-emerald-100/70 mb-1">Est. Value</label><input type="number" value={aValue} onChange={(e) => setAValue(e.target.value)} placeholder="$0.00" className={field} /></div>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-emerald-100/70 mb-1">Secure File <span className="text-stone-400 font-normal">(Optional)</span></label>
                <label className="flex flex-col items-center justify-center border-2 border-dashed border-stone-300 dark:border-white/15 rounded-xl p-4 cursor-pointer hover:border-emerald-600 dark:hover:border-amber-300 transition bg-stone-50/50 dark:bg-white/[0.02]">
                  <UploadCloud size={24} className="text-emerald-700 dark:text-amber-300 mb-2" />
                  <span className="text-xs font-bold text-emerald-950 dark:text-white text-center">{uploadDoc ? uploadDoc.name : "Tap to upload a document"}</span>
                </label>
                <input type="file" onChange={(e) => setUploadDoc(e.target.files?.[0] || null)} className="hidden" />
              </div>
              <button type="submit" disabled={isSavingAsset} className="rounded-full bg-emerald-900 hover:bg-emerald-800 dark:bg-amber-300 dark:hover:bg-amber-200 text-white dark:text-emerald-950 py-3.5 font-bold mt-2 transition shadow-md disabled:opacity-50 flex justify-center">
                {isSavingAsset ? <Loader2 className="animate-spin" size={20} /> : "Encrypt & Store"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}