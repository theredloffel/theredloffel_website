"use client";

import React, { useState, useEffect } from "react";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { KpiCards } from "@/components/admin/KpiCards";
import { LiveOrdersBoard } from "@/components/admin/LiveOrdersBoard";
import { AdminSettings } from "@/components/admin/AdminSettings";
import { AdminLogin } from "@/components/admin/AdminLogin";

export function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  useEffect(() => {
    try {
      const auth = sessionStorage.getItem("lebistro_admin_logged_in") === "true";
      setIsAuthenticated(auth);
    } catch {
      setIsAuthenticated(false);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-[#141210] flex items-center justify-center text-[#FAF8F5]">
        <div className="w-8 h-8 rounded-full border-2 border-[#C2410C] border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AdminLogin onLoginSuccess={() => setIsAuthenticated(true)} />;
  }

  return (
    <div suppressHydrationWarning className="min-h-screen bg-[#FAF8F5] text-[#1C1917] flex flex-col">
      {/* 1. Admin Header */}
      <AdminHeader
        activeTab={isSettingsOpen ? "settings" : undefined}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onLogout={() => {
          try {
            sessionStorage.removeItem("lebistro_admin_logged_in");
          } catch {}
          setIsAuthenticated(false);
        }}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 w-full space-y-6">
        {/* KPI Pipeline Cards: New Order, Confirmed Order, Pending Deliveries */}
        <KpiCards />

        {/* Live Orders Management Board (Only this kept in front) */}
        <LiveOrdersBoard />
      </main>

      {/* Full-Screen Admin Settings Modal (contains Menu & Pricing, Active Fleet, Preferences) */}
      <AdminSettings
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
}
