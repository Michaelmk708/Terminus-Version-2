"use client";

import { useState, useEffect } from "react";
import { useApp } from "@/lib/context";
import {
  ShieldCheck,
  LayoutDashboard,
  Users,
  Lock,
  ArrowRight,
  Check,
  Sun,
  Moon,
  Zap
} from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

const heroSlides = [
  {
    src: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&q=80&w=1800",
    caption: "Your business, in good hands",
  },
  {
    src: "https://images.unsplash.com/photo-1556761175-5973dc0f32b7?auto=format&fit=crop&q=80&w=1800",
    caption: "Built for founders and teams",
  },
  {
    src: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80&w=1800",
    caption: "Everything you own, one calm view",
  },
];

const steps = [
  {
    title: "Create your vault",
    text: "Sign up in minutes. Your vault is private from the very first click.",
  },
  {
    title: "Add what matters",
    text: "Upload contracts, accounts, investments and key documents. We keep them tidy for you.",
  },
  {
    title: "Name your trusted people",
    text: "Choose who can step in if you ever can't, and exactly what they can see.",
  },
];

const benefits = [
  {
    icon: LayoutDashboard,
    title: "Everything in one place",
    text: "No more digging through emails, folders and old chats. See your assets, documents and deadlines on a single clear page.",
  },
  {
    icon: ShieldCheck,
    title: "Truly private",
    text: "Only you hold the key. Not even our team can open your vault, so your business stays yours.",
  },
  {
    icon: Users,
    title: "Your business keeps going",
    text: "If you lose access, the co-founders you've chosen are given safe, limited access, so work never stops.",
  },
];

const promises = [
  "Only you hold the key",
  "Access for trusted people only",
  "Set up in under 10 minutes",
];

// Fallback technical facts if the backend endpoint is unreachable
const fallbackTips = [
  "Terminus uses zero-knowledge architecture—we never see your private keys.",
  "Your digital estate is protected by an automated Solana Dead Man's Switch.",
  "Live wallet tracking syncs directly with Solana RPC nodes in real-time.",
  "Assets are encrypted client-side before being pinned to decentralized storage.",
  "Your Vault Health Score actively tracks and protects your Value at Risk."
];

export default function LandingPage() {
  const { dispatch, state } = useApp();
  const [current, setCurrent] = useState(0);
  const [dynamicTip, setDynamicTip] = useState("Establishing secure connection...");

  // Rotate background images
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % heroSlides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  // Fetch dynamic, factual tip from the backend on load
  useEffect(() => {
    const fetchTip = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/v1/public/random-tip`);
        if (res.ok) {
          const data = await res.json();
          setDynamicTip(data.tip);
        } else {
          throw new Error("Backend unavailable");
        }
      } catch (error) {
        // Fallback to random local fact if API fails
        const randomFact = fallbackTips[Math.floor(Math.random() * fallbackTips.length)];
        setDynamicTip(randomFact);
      }
    };
    
    fetchTip();
  }, []);

  const toggleTheme = () =>
    dispatch({ type: "SET_THEME", payload: !state.isDark });

  const openVault = () => dispatch({ type: "SET_SCREEN", payload: "auth" });

  const scrollToFeatures = () =>
    document.getElementById("platform-features")?.scrollIntoView({ behavior: "smooth" });

  return (
    <div className="relative min-h-[calc(100vh-66px)] bg-stone-50 text-stone-800 dark:bg-[#07130f] dark:text-emerald-50 transition-colors duration-500">
      {/* Theme toggle */}
      <button
        onClick={toggleTheme}
        aria-label="Switch light or dark theme"
        className="absolute top-5 right-5 z-50 p-2.5 rounded-full bg-white/15 text-white backdrop-blur-md border border-white/25 hover:bg-white/25 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 transition"
      >
        {state.isDark ? <Sun size={18} /> : <Moon size={18} />}
      </button>

      {/* HERO: full-width slideshow with the message on top */}
      <section className="relative w-full min-h-[88vh] flex items-end overflow-hidden bg-emerald-950">
        {heroSlides.map((slide, i) => (
          <img
            key={slide.src}
            src={slide.src}
            alt={slide.caption}
            className="absolute inset-0 w-full h-full object-cover"
            style={{
              opacity: i === current ? 1 : 0,
              transform: i === current ? "scale(1.08)" : "scale(1)",
              transition: "opacity 1.6s ease-in-out, transform 8s ease-out",
            }}
          />
        ))}

        {/* Dark green wash keeps the words readable on any photo */}
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-950/90 via-emerald-950/55 to-emerald-950/10" />
        <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/80 via-transparent to-transparent" />

        <div className="relative z-10 w-full max-w-6xl mx-auto px-6 pb-16 pt-32 md:pb-24">
          <div className="max-w-2xl">
            
            {/* DYNAMIC BACKEND TIP */}
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/20 backdrop-blur px-4 py-1.5 text-sm text-emerald-100 mb-7 shadow-lg">
              <Zap size={14} className="text-amber-300" />
              {dynamicTip}
            </span>

            <h1 className="font-display text-5xl md:text-7xl font-semibold tracking-tight leading-[1.05] text-white mb-6">
              Everything you've built,
              <br />
              safe and in your hands.
            </h1>

            <p className="text-lg md:text-xl leading-relaxed text-emerald-50/85 max-w-xl mb-10">
              Terminus is a private vault for your business. Keep your assets,
              documents and accounts in one place, and make sure the right
              people can step in if you ever can't.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-10">
              <button
                onClick={openVault}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-amber-300 hover:bg-amber-200 text-emerald-950 font-semibold px-8 py-4 shadow-xl shadow-black/20 hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-white transition"
              >
                Open your vault <ArrowRight size={18} />
              </button>
              <button
                onClick={scrollToFeatures}
                className="inline-flex items-center justify-center rounded-full border border-white/40 text-white px-8 py-4 font-medium hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white transition"
              >
                See how it works
              </button>
            </div>

            <ul className="flex flex-col sm:flex-row sm:flex-wrap gap-x-6 gap-y-2 text-sm text-emerald-100/90">
              {promises.map((p) => (
                <li key={p} className="flex items-center gap-2">
                  <Check size={16} className="text-amber-300" />
                  {p}
                </li>
              ))}
            </ul>
          </div>

          {/* Slide indicators */}
          <div className="absolute right-6 bottom-8 md:bottom-12 flex gap-2">
            {heroSlides.map((slide, i) => (
              <button
                key={slide.src}
                onClick={() => setCurrent(i)}
                aria-label={`Show image ${i + 1}`}
                className={`h-1.5 rounded-full transition-all duration-500 ${
                  i === current ? "w-10 bg-amber-300" : "w-4 bg-white/40 hover:bg-white/70"
                }`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* BENEFITS */}
      <section
        id="platform-features"
        className="scroll-mt-20 max-w-6xl mx-auto px-6 py-24"
      >
        <div className="max-w-2xl mb-14">
          <h2 className="font-display text-3xl md:text-5xl font-semibold tracking-tight text-emerald-950 dark:text-white mb-4">
            Peace of mind, without the paperwork.
          </h2>
          <p className="text-lg text-stone-600 dark:text-emerald-100/70 leading-relaxed">
            Running a business is hard enough. Terminus quietly looks after the
            important things so you can focus on growing.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {benefits.map(({ icon: Icon, title, text }) => (
            <div
              key={title}
              className="rounded-3xl bg-white dark:bg-white/[0.04] border border-stone-200 dark:border-white/10 p-8 hover:border-emerald-600/50 dark:hover:border-emerald-400/40 transition-colors"
            >
              <div className="w-12 h-12 rounded-2xl bg-emerald-900 dark:bg-emerald-400/15 text-amber-300 dark:text-emerald-300 flex items-center justify-center mb-6">
                <Icon size={24} />
              </div>
              <h3 className="text-xl font-semibold text-emerald-950 dark:text-white mb-3">
                {title}
              </h3>
              <p className="text-stone-600 dark:text-emerald-100/70 leading-relaxed">
                {text}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="bg-emerald-950 text-white">
        <div className="max-w-6xl mx-auto px-6 py-24">
          <h2 className="font-display text-3xl md:text-5xl font-semibold tracking-tight max-w-xl mb-14">
            Ready in three simple steps.
          </h2>

          <ol className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {steps.map((step, i) => (
              <li key={step.title} className="border-t border-emerald-100/20 pt-6">
                <span className="font-display text-5xl text-amber-300/90">
                  {i + 1}
                </span>
                <h3 className="text-xl font-semibold mt-4 mb-2">{step.title}</h3>
                <p className="text-emerald-100/75 leading-relaxed">{step.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* FINAL CALL TO ACTION */}
      <section className="max-w-4xl mx-auto px-6 py-24 text-center">
        <div className="mx-auto w-14 h-14 rounded-full bg-emerald-900 dark:bg-emerald-400/15 text-amber-300 dark:text-emerald-300 flex items-center justify-center mb-6">
          <Lock size={24} />
        </div>
        <h2 className="font-display text-3xl md:text-5xl font-semibold tracking-tight text-emerald-950 dark:text-white mb-4">
          Your future self will thank you.
        </h2>
        <p className="text-lg text-stone-600 dark:text-emerald-100/70 max-w-xl mx-auto mb-10 leading-relaxed">
          Take ten minutes today to protect everything you've worked for.
        </p>
        <button
          onClick={openVault}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-900 hover:bg-emerald-800 dark:bg-amber-300 dark:hover:bg-amber-200 text-white dark:text-emerald-950 font-semibold px-10 py-4 shadow-xl shadow-emerald-900/20 hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 transition"
        >
          Open your vault <ArrowRight size={18} />
        </button>
      </section>
    </div>
  );
}