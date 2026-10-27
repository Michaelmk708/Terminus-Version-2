"use client";

import { useState } from "react";
import { useApp } from "@/lib/context";
import { Card, FormInput, PasswordInput, Button } from "@/components/ui";
import { ShieldCheck, Key, Lock, ArrowRight, Wallet, Loader2, AlertCircle } from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function AuthScreen() {
  const { dispatch, login } = useApp();
  const [isLogin, setIsLogin] = useState(true);
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [walletAddress, setWalletAddress] = useState(""); 
  
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleAuthenticate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      if (isLogin) {
        const fd = new FormData();
        fd.append("email_or_pubkey", email);
        fd.append("password", password);

        const res = await fetch(`${API_BASE}/api/v1/auth/login`, {
          method: "POST",
          body: fd,
        });

        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.detail || "Incorrect email or security key.");
        }

        const data = await res.json();
        
        login({
          name: data.user?.email?.split("@")[0] || "Vault Owner",
          email: data.user?.email,
          type: data.user?.pubkey?.startsWith("web2_") ? "web2" : "web3",
          pubkey: data.user?.pubkey
        });
        
        dispatch({ type: "SET_SCREEN", payload: "owner" });

      } else {
        // Generate an internal pubkey if the user doesn't provide a Web3 wallet
        const finalPubkey = walletAddress.trim() || `web2_${Math.random().toString(36).slice(2, 16)}`;

        const fd = new FormData();
        fd.append("email", email);
        fd.append("password", password);
        fd.append("pubkey", finalPubkey);
        fd.append("role", "OWNER");

        const res = await fetch(`${API_BASE}/api/v1/auth/register`, {
          method: "POST",
          body: fd,
        });

        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.detail || "Could not create account. Please try again.");
        }

        const data = await res.json();
        login({
          name: email.split("@")[0],
          email: email,
          type: finalPubkey.startsWith("web2_") ? "web2" : "web3",
          pubkey: data.pubkey
        });

        dispatch({ type: "SET_SCREEN", payload: "profile" });
      }
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex flex-col items-center justify-center min-h-[calc(100vh-66px)] px-6 py-12 overflow-hidden bg-stone-50 dark:bg-[#07130f] transition-colors duration-500">
      
      {/* Background Soft Glow */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-emerald-500/10 dark:bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none animate-pulse-slow" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-amber-400/10 dark:bg-amber-600/5 rounded-full blur-[150px] pointer-events-none" />

      <div className="w-full max-w-md animate-fade-up relative z-10">
        
        <div className="text-center mb-10 flex flex-col items-center">
          <div className="w-16 h-16 bg-emerald-900 dark:bg-emerald-400/15 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-900/10 mb-6 border border-stone-200 dark:border-white/10">
            <ShieldCheck size={32} className="text-amber-400 dark:text-emerald-300" />
          </div>
          
          <h1 className="font-display text-3xl md:text-4xl text-emerald-950 dark:text-white mb-3 font-semibold tracking-tight">
            {isLogin ? "Welcome Back" : "Protect Your Legacy"}
          </h1>
          <p className="text-stone-500 dark:text-emerald-100/70 text-sm leading-relaxed max-w-[300px]">
            {isLogin 
              ? "Access your private vault and manage your protected assets." 
              : "Create a private, encrypted vault to protect and pass on what matters most."}
          </p>
        </div>

        {errorMsg && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 text-red-700 dark:text-red-300 text-sm flex items-start gap-3">
            <AlertCircle size={18} className="shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        <Card className="p-8 backdrop-blur-xl bg-white/80 dark:bg-white/[0.04] border-stone-200 dark:border-white/10 shadow-2xl relative overflow-hidden rounded-3xl">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-600 to-amber-300 opacity-90" />

          <form onSubmit={handleAuthenticate} className="flex flex-col gap-6 mt-2">
            
            <div className="relative">
              <FormInput
                label="Email Address"
                type="email"
                placeholder="founder@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="pl-11 bg-stone-50 dark:bg-[#07130f] border-stone-200 dark:border-white/10 text-emerald-950 dark:text-white focus:border-emerald-600/50"
              />
              <Lock size={18} className="absolute left-4 top-[38px] text-stone-400 pointer-events-none" />
            </div>
            
            {!isLogin && (
              <div className="relative">
                <FormInput
                  label="Crypto Wallet Address (Optional)"
                  type="text"
                  placeholder="e.g. Solana, Ethereum, etc."
                  hint="Leave blank if you only want to store documents and passwords."
                  value={walletAddress}
                  onChange={(e) => setWalletAddress(e.target.value)}
                  className="pl-11 bg-stone-50 dark:bg-[#07130f] border-stone-200 dark:border-white/10 text-emerald-950 dark:text-white focus:border-emerald-600/50"
                />
                <Wallet size={18} className="absolute left-4 top-[38px] text-stone-400 pointer-events-none" />
              </div>
            )}

            <div className="relative">
              <PasswordInput
                label="Master Security Key"
                placeholder="Enter a strong passcode"
                hint={!isLogin ? "This locks your vault. We cannot recover it if lost." : ""}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="pl-11 bg-stone-50 dark:bg-[#07130f] border-stone-200 dark:border-white/10 text-emerald-950 dark:text-white focus:border-emerald-600/50"
              />
              <Key size={18} className="absolute left-4 top-[38px] text-stone-400 pointer-events-none" />
            </div>

            <Button 
              type="submit" 
              full 
              lg 
              disabled={loading}
              className="mt-4 bg-emerald-900 hover:bg-emerald-800 dark:bg-amber-300 dark:hover:bg-amber-200 text-white dark:text-emerald-950 shadow-lg border-0 transition-all rounded-full py-4"
            >
              {loading ? (
                <span className="flex items-center gap-2 text-sm font-semibold">
                  <Loader2 size={16} className="animate-spin" /> Securing connection...
                </span>
              ) : (
                <span className="flex items-center gap-2 text-sm font-semibold">
                  {isLogin ? "Unlock Vault" : "Create My Vault"}
                  {isLogin ? <Lock size={16} /> : <ArrowRight size={16} />}
                </span>
              )}
            </Button>
          </form>
        </Card>

        <div className="text-center mt-8">
          <button 
            type="button"
            onClick={() => {
              setIsLogin(!isLogin);
              setErrorMsg("");
            }}
            className="text-stone-500 dark:text-emerald-100/60 hover:text-emerald-700 dark:hover:text-amber-300 text-sm font-medium transition-colors"
          >
            {isLogin 
              ? "Need to protect your assets? Create a vault here." 
              : "Already have a secure vault? Log in."}
          </button>
        </div>
      </div>
    </div>
  );
}