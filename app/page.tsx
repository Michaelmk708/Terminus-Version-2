"use client";

import { useEffect } from "react";
import { AppProvider, useApp } from "@/lib/context";
import Navbar             from "@/components/layout/Navbar";
import LandingPage        from "@/components/layout/LandingPage";
import AuthScreen         from "@/components/auth/AuthScreen";
import CompleteProfile    from "@/components/auth/CompleteProfile";
import CreateVault        from "@/components/vault/CreateVault";
import VaultSuccess       from "@/components/vault/VaultSuccess";
import OwnerDashboard     from "@/components/dashboard/OwnerDashboard";
import BeneficiaryDashboard from "@/components/beneficiary/BeneficiaryDashboard";
import ClaimPortal        from "@/components/beneficiary/ClaimPortal";

function AppRouter() {
  const { state } = useApp();

  // Apply dark/light theme to the <html> tag for Tailwind dark mode
  useEffect(() => {
    if (state.isDark) {
      document.documentElement.classList.add("dark");
      document.documentElement.setAttribute("data-theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      document.documentElement.setAttribute("data-theme", "light");
    }
  }, [state.isDark]);

  const screens: Record<string, React.ReactNode> = {
    "landing":       <LandingPage />,
    "auth":          <AuthScreen />,
    "profile":       <CompleteProfile />,
    "create-vault":  <CreateVault />,
    "vault-success": <VaultSuccess />,
    "owner":         <OwnerDashboard />,
    "beneficiary":   <BeneficiaryDashboard />,
    "claim":         <ClaimPortal />,
  };

  // Default to landing page if no screen is explicitly set in context
  return (
    <div className="min-h-screen bg-white dark:bg-[#0b0c10] text-gray-900 dark:text-white transition-colors duration-500">
      <Navbar />
      <main className="pt-[66px]">
        {screens[state.screen] ?? <LandingPage />}
      </main>
    </div>
  );
}

export default function Page() {
  return (
    <AppProvider>
      <AppRouter />
    </AppProvider>
  );
}