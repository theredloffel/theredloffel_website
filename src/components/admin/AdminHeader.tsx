"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { UtensilsCrossed, ArrowLeft, ShieldCheck, Clock, RefreshCw, Bell, User } from "lucide-react";
import { useKitchen } from "@/context/KitchenContext";

export function AdminHeader() {
  const { orders, showToast } = useKitchen();
  const [currentTime, setCurrentTime] = useState<string>("");

  useEffect(() => {
    setCurrentTime(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const pendingCount = orders.filter((o) => o.status === "Pending").length;

  return (
    <header className="sticky top-0 z-40 bg-[#1C1917] text-[#FAF8F5] border-b border-[#292524] shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        {/* Left: Brand & Return to Storefront */}
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-[#FAF8F5] transition-colors flex items-center gap-2 text-xs font-semibold"
            title="Return to Customer Storefront"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Storefront</span>
          </Link>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#C2410C] flex items-center justify-center text-white shadow-xs">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif text-xl font-bold tracking-tight">
                  Kitchen Command
                </span>
                <span className="text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full bg-[#FED7AA] text-[#9A3412] font-bold">
                  Ops Live
                </span>
              </div>
              <p className="text-xs text-[#A8A29E]">
                The Red Löffel • Indiranagar Hub
              </p>
            </div>
          </div>
        </div>

        {/* Center / Right: Live Clock & Quick Info */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Live Clock */}
          <div className="hidden md:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/10 text-xs font-mono">
            <Clock className="w-3.5 h-3.5 text-[#FED7AA]" />
            <span>{currentTime || "11:48 AM"}</span>
          </div>

          {/* Pending Alerts Badge */}
          {pendingCount > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-semibold animate-pulse">
              <Bell className="w-3.5 h-3.5" />
              <span>{pendingCount} Pending</span>
            </div>
          )}

          {/* Manual Refresh Button */}
          <button
            onClick={() => showToast("Order queue synchronized with dispatch servers", "info")}
            className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
            title="Sync Orders"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          {/* Manager profile avatar */}
          <div className="flex items-center gap-2 pl-2 border-l border-white/15">
            <div className="w-8 h-8 rounded-full bg-[#FED7AA] text-[#9A3412] font-bold text-xs flex items-center justify-center">
              KM
            </div>
            <div className="hidden lg:block text-left">
              <span className="text-xs font-semibold block leading-tight">Chef Arnaud</span>
              <span className="text-[10px] text-[#A8A29E] block">Kitchen Master</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
