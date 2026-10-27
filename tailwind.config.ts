import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class", // <-- This tells Tailwind to use your manual toggle
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ["var(--font-cormorant)", "Georgia", "serif"],
        mono:    ["var(--font-dm-mono)",   "Courier New", "monospace"],
        sans:    ["var(--font-instrument)", "sans-serif"],
      },
      colors: {
        ink: {
          DEFAULT: "#0b0c10",
          2:       "#12131a",
          3:       "#1a1c26",
          4:       "#22253a",
        },
        gold: {
          DEFAULT: "#c9a96e",
          light:   "#e8cfa0",
        },
        cream:   "#e8e2d5",
        muted: {
          DEFAULT: "#7a7c8e",
          2:       "#4e5168",
        },
        // Beneficiary palette
        bene: {
          bg:      "#0b1220",
          bg2:     "#101a2e",
          bg3:     "#162338",
          accent:  "#4a9ec4",
          accent2: "#7ec4df",
          text:    "#d4dde8",
          muted:   "#627a94",
        },
      },
      animation: {
        "pulse-dot":  "pulseDot 2s ease-in-out infinite",
        "heartbeat":  "heartbeat 1.4s ease-in-out infinite",
        "fade-up":    "fadeUp 0.7s ease forwards",
        "slide-up":   "slideUp 0.35s ease both",
        "pop-in":     "popIn 0.5s ease forwards",
        spin:         "spin 1.2s linear infinite",
        shimmer:      "shimmer 1.8s infinite",
      },
      keyframes: {
        pulseDot: { "0%,100%": { opacity: "1" }, "50%": { opacity: "0.35" } },
        heartbeat: {
          "0%,100%": { transform: "scale(1)" },
          "14%":     { transform: "scale(1.12)" },
          "28%":     { transform: "scale(1)" },
          "42%":     { transform: "scale(1.08)" },
          "56%":     { transform: "scale(1)" },
        },
        fadeUp:  { from: { opacity: "0", transform: "translateY(18px)" }, to: { opacity: "1", transform: "translateY(0)" } },
        slideUp: { from: { opacity: "0", transform: "translateY(20px)" }, to: { opacity: "1", transform: "translateY(0)" } },
        popIn: {
          "0%":   { transform: "scale(0.65)", opacity: "0" },
          "70%":  { transform: "scale(1.06)" },
          "100%": { transform: "scale(1)",    opacity: "1" },
        },
        shimmer: {
          "0%":   { backgroundPosition: "-600px 0" },
          "100%": { backgroundPosition:  "600px 0" },
        },
      },
    },
  },
  plugins: [],
};
export default config;