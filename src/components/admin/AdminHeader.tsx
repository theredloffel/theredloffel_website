"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Search, X, Settings, LogOut, Bike } from "lucide-react";
import { useKitchen } from "@/context/KitchenContext";
import { OutForDeliveryModal } from "@/components/admin/OutForDeliveryModal";
import { StoreStatusConfirmModal } from "@/components/admin/StoreStatusConfirmModal";

interface AdminHeaderProps {
  onLogout?: () => void;
  onOpenSettings?: () => void;
  activeTab?: string;
}

export function AdminHeader({ onLogout, onOpenSettings, activeTab }: AdminHeaderProps) {
  const {
    orders,
    isStoreOpen,
    toggleStoreOpen,
    adminOrderSearch,
    setAdminOrderSearch,
  } = useKitchen();

  const [isDeliveryModalOpen, setIsDeliveryModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<"open" | "close">("close");

  const handlePromptToggleStore = () => {
    setConfirmAction(isStoreOpen ? "close" : "open");
    setIsConfirmModalOpen(true);
  };

  const handleConfirmToggleStore = () => {
    toggleStoreOpen();
    setIsConfirmModalOpen(false);
  };

  // Count active delivery orders
  const outForDeliveryCount = orders.filter(
    (o) => o.status === "In the Road" || o.status === "Out for Delivery"
  ).length;

  return (
    <>
      <header className="sticky top-0 z-40 bg-[#1C1917] text-[#FAF8F5] border-b border-[#292524] shadow-md">
        {/* ======================================================== */}
        {/* DESKTOP BAR (Single Clean Row)                           */}
        {/* ======================================================== */}
        <div className="hidden md:flex max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 items-center justify-between gap-3 lg:gap-4">
          {/* 1. STORE FRONT */}
          <Link
            href="/"
            className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-[#FAF8F5] transition-all flex items-center gap-2 text-xs font-semibold shrink-0 cursor-pointer"
            title="Return to Customer Storefront"
          >
            <ArrowLeft className="w-4 h-4 shrink-0" />
            <span>Storefront</span>
          </Link>

          {/* 2. LOGO */}
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="w-9 h-9 rounded-xl bg-[#C2410C] flex items-center justify-center text-white shadow-xs font-serif font-black text-sm shrink-0">
              RL
            </div>
            <div>
              <span className="font-serif text-base font-bold tracking-tight block leading-tight text-white">
                The Red Löffel
              </span>
              <span className="text-[10px] text-[#A8A29E] block leading-tight">
                Kitchen Command
              </span>
            </div>
          </div>

          {/* 3. SEARCH ORDER */}
          <div className="flex-1 max-w-sm mx-2 lg:mx-4 min-w-[140px]">
            <div className="relative">
              <Search className="w-4 h-4 text-[#A8A29E] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none shrink-0" />
              <input
                type="text"
                value={adminOrderSearch}
                onChange={(e) => setAdminOrderSearch(e.target.value)}
                placeholder="Search order ID, customer, phone..."
                className="w-full bg-white/10 hover:bg-white/15 focus:bg-white/20 text-white placeholder:text-[#A8A29E] text-xs font-medium pl-8.5 pr-7 py-2 rounded-xl border border-white/10 focus:border-[#C2410C] focus:outline-hidden transition-all"
              />
              {adminOrderSearch && (
                <button
                  type="button"
                  onClick={() => setAdminOrderSearch("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-[#A8A29E] hover:text-white transition-colors cursor-pointer"
                  title="Clear Search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* 4. OUT FOR DELIVERY QUICK LOGO / BUTTON */}
          <button
            type="button"
            onClick={() => setIsDeliveryModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-orange-500/20 hover:bg-orange-500/30 text-[#FED7AA] border border-orange-500/40 flex items-center gap-2 text-xs font-bold transition-all cursor-pointer shrink-0"
            title="View Out for Delivery Orders"
          >
            <Bike className="w-4 h-4 text-[#FED7AA]" />
            <span className="hidden xl:inline">Out for Delivery</span>
            {outForDeliveryCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-[#C2410C] text-white text-[10px] font-black flex items-center justify-center">
                {outForDeliveryCount}
              </span>
            )}
          </button>

          {/* 5. STORE OPEN OR CLOSED BUTTON */}
          <button
            type="button"
            onClick={handlePromptToggleStore}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer border shrink-0 ${
              isStoreOpen
                ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30"
                : "bg-rose-500/20 text-rose-300 border-rose-500/40 hover:bg-rose-500/30"
            }`}
            title={isStoreOpen ? "Store is ONLINE • Click to Close" : "Store is CLOSED • Click to Open"}
          >
            <span
              className={`w-2 h-2 rounded-full shrink-0 ${
                isStoreOpen ? "bg-emerald-400 animate-pulse" : "bg-rose-500"
              }`}
            />
            <span className="tracking-wide">
              {isStoreOpen ? "STORE OPEN" : "STORE CLOSED"}
            </span>
          </button>

          {/* 6. SETTING */}
          {onOpenSettings && (
            <button
              type="button"
              onClick={onOpenSettings}
              className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shrink-0 ${
                activeTab === "settings"
                  ? "bg-[#C2410C] text-white shadow-xs"
                  : "bg-white/10 hover:bg-white/20 text-[#FAF8F5]"
              }`}
              title="Admin Settings & Password"
            >
              <Settings className="w-4 h-4 shrink-0" />
              <span>Settings</span>
            </button>
          )}

          {/* 7. LOGOUT */}
          {onLogout && (
            <button
              type="button"
              onClick={onLogout}
              className="px-3 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/35 text-rose-300 border border-rose-500/30 transition-all flex items-center gap-1.5 text-xs font-semibold cursor-pointer shrink-0"
              title="Lock Admin Console (Logout)"
            >
              <LogOut className="w-4 h-4 shrink-0" />
              <span>Logout</span>
            </button>
          )}
        </div>

        {/* ======================================================== */}
        {/* MOBILE MODE: Row 1 = Controls, Row 2 = Search Order      */}
        {/* ======================================================== */}
        <div className="md:hidden px-3.5 pt-3 pb-2.5 space-y-2.5">
          {/* Row 1: Storefront, Logo, Out for Delivery Logo, Store Open/Closed, Settings, Logout */}
          <div className="flex items-center justify-between gap-1.5">
            {/* Left: Storefront & Logo */}
            <div className="flex items-center gap-1.5 shrink-0">
              <Link
                href="/"
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-[#FAF8F5] transition-all flex items-center justify-center shrink-0"
                title="Return to Storefront"
              >
                <ArrowLeft className="w-4 h-4" />
              </Link>

              <div className="flex items-center gap-1.5">
                <div className="w-8 h-8 rounded-xl bg-[#C2410C] flex items-center justify-center text-white shadow-xs font-serif font-black text-xs shrink-0">
                  RL
                </div>
                <span className="font-serif text-sm font-bold tracking-tight text-white hidden min-[400px]:inline">
                  Red Löffel
                </span>
              </div>
            </div>

            {/* Right: Store Open/Closed, Settings, Logout */}
            <div className="flex items-center gap-1.5 shrink-0">
              {/* STORE OPEN OR CLOSED BUTTON */}
              <button
                type="button"
                onClick={handlePromptToggleStore}
                className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer border shrink-0 ${
                  isStoreOpen
                    ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                    : "bg-rose-500/20 text-rose-300 border-rose-500/40"
                }`}
                title={isStoreOpen ? "Store is ONLINE • Click to Close" : "Store is CLOSED • Click to Open"}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                    isStoreOpen ? "bg-emerald-400 animate-pulse" : "bg-rose-500"
                  }`}
                />
                <span>{isStoreOpen ? "OPEN" : "CLOSED"}</span>
              </button>

              {/* SETTINGS */}
              {onOpenSettings && (
                <button
                  type="button"
                  onClick={onOpenSettings}
                  className={`p-2 rounded-xl transition-all cursor-pointer shrink-0 ${
                    activeTab === "settings"
                      ? "bg-[#C2410C] text-white shadow-xs"
                      : "bg-white/10 text-[#FAF8F5]"
                  }`}
                  title="Admin Settings"
                >
                  <Settings className="w-4 h-4" />
                </button>
              )}

              {/* LOGOUT */}
              {onLogout && (
                <button
                  type="button"
                  onClick={onLogout}
                  className="p-2 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-500/30 transition-all cursor-pointer shrink-0"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Row 2: SEARCH ORDER + DELIVERY LOGO AT THE RIGHT */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1 min-w-0">
              <Search className="w-4 h-4 text-[#A8A29E] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none shrink-0" />
              <input
                type="text"
                value={adminOrderSearch}
                onChange={(e) => setAdminOrderSearch(e.target.value)}
                placeholder="Search order ID, customer, phone..."
                className="w-full bg-white/10 focus:bg-white/20 text-white placeholder:text-[#A8A29E] text-xs font-medium pl-9 pr-8 py-2.5 rounded-xl border border-white/10 focus:border-[#C2410C] focus:outline-hidden transition-all shadow-inner"
              />
              {adminOrderSearch && (
                <button
                  type="button"
                  onClick={() => setAdminOrderSearch("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#A8A29E] hover:text-white transition-colors cursor-pointer"
                  title="Clear Search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* DELIVERY LOGO BUTTON AT THE RIGHT OF THE SEARCH BAR */}
            <button
              type="button"
              onClick={() => setIsDeliveryModalOpen(true)}
              className="relative p-2.5 rounded-xl bg-orange-500/20 active:bg-orange-500/30 text-[#FED7AA] border border-orange-500/40 flex items-center justify-center transition-all cursor-pointer shrink-0 shadow-xs"
              title="View Out for Delivery Orders"
              aria-label="View Out for Delivery Orders"
            >
              <Bike className="w-5 h-5 text-[#FED7AA]" />
              {outForDeliveryCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4.5 h-4.5 rounded-full bg-[#C2410C] text-white text-[9px] font-black flex items-center justify-center ring-2 ring-[#1C1917]">
                  {outForDeliveryCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Out for Delivery Slide-over / Modal */}
      <OutForDeliveryModal
        isOpen={isDeliveryModalOpen}
        onClose={() => setIsDeliveryModalOpen(false)}
      />

      {/* Store Status Confirmation Dialog (Open / Close) */}
      <StoreStatusConfirmModal
        isOpen={isConfirmModalOpen}
        action={confirmAction}
        onConfirm={handleConfirmToggleStore}
        onCancel={() => setIsConfirmModalOpen(false)}
      />
    </>
  );
}
