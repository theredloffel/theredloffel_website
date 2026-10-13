"use client";

import React, { useState, useEffect } from "react";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { KpiCards } from "@/components/admin/KpiCards";
import { LiveOrdersBoard } from "@/components/admin/LiveOrdersBoard";
import { AdminSettings } from "@/components/admin/AdminSettings";
import { AdminLogin } from "@/components/admin/AdminLogin";
import { AddDriverModal } from "@/components/admin/AddDriverModal";
import { useKitchen } from "@/context/KitchenContext";
import { Flame, Bike, Plus, Phone, Trash2 } from "lucide-react";

export function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [activeAdminView, setActiveAdminView] = useState<"orders" | "fleet">("orders");
  const [isAddDriverModalOpen, setIsAddDriverModalOpen] = useState(false);

  const { riders, orders, removeRider } = useKitchen();

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

  const activeLiveOrdersCount = orders.filter(
    (o) => o.status !== "Delivered" && o.status !== "Rejected"
  ).length;

  return (
    <div suppressHydrationWarning className="min-h-screen bg-[#FAF8F5] text-[#1C1917] flex flex-col">
      {/* 1. Admin Header */}
      <AdminHeader
        activeTab={isSettingsOpen ? "settings" : undefined}
        onOpenSettings={() => setIsSettingsOpen(true)}
        activeAdminView={activeAdminView}
        onOpenFleet={() => setActiveAdminView(activeAdminView === "fleet" ? "orders" : "fleet")}
        onLogout={() => {
          try {
            sessionStorage.removeItem("lebistro_admin_logged_in");
          } catch {}
          setIsAuthenticated(false);
        }}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 w-full space-y-6">
        {/* Primary View Switcher: Live Orders vs Delivery Fleet (Prominent on Mobile & Desktop) */}
        <div className="flex items-center justify-between gap-3 bg-white p-2 sm:p-2.5 rounded-2xl sm:rounded-3xl border border-[#E7E0D8] shadow-xs">
          <div className="flex items-center gap-2 flex-1">
            <button
              type="button"
              onClick={() => setActiveAdminView("orders")}
              className={`flex-1 py-2.5 px-3 sm:px-4 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                activeAdminView === "orders"
                  ? "bg-[#1C1917] text-white shadow-xs"
                  : "text-[#78716C] hover:text-[#1C1917] hover:bg-[#FAF8F5]"
              }`}
            >
              <Flame className="w-4 h-4 text-[#C2410C]" />
              <span>Live Orders</span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                  activeAdminView === "orders"
                    ? "bg-white text-[#1C1917]"
                    : "bg-[#F5EFEB] text-[#78716C]"
                }`}
              >
                {activeLiveOrdersCount}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveAdminView("fleet")}
              className={`flex-1 py-2.5 px-3 sm:px-4 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                activeAdminView === "fleet"
                  ? "bg-[#C2410C] text-white shadow-xs"
                  : "text-[#78716C] hover:text-[#1C1917] hover:bg-[#FAF8F5]"
              }`}
            >
              <Bike className="w-4 h-4" />
              <span>Delivery Fleet</span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                  activeAdminView === "fleet"
                    ? "bg-white text-[#C2410C]"
                    : "bg-orange-100 text-[#C2410C]"
                }`}
              >
                {riders.length} Drivers
              </span>
            </button>
          </div>
        </div>

        {activeAdminView === "orders" ? (
          <>
            {/* KPI Pipeline Cards: New Order, Confirmed Order, Pending Deliveries */}
            <KpiCards />

            {/* Live Orders Management Board */}
            <LiveOrdersBoard />
          </>
        ) : (
          /* Dedicated Delivery Fleet Management Board */
          <div className="space-y-6 animate-in fade-in duration-150">
            {/* Fleet Overview Hero Card */}
            <div className="bg-white rounded-3xl border border-[#E7E0D8] p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-orange-100 text-[#C2410C] flex items-center justify-center shrink-0">
                    <Bike className="w-4 h-4" />
                  </div>
                  <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#1C1917]">
                    Delivery Fleet & Drivers
                  </h2>
                </div>
                <p className="text-xs text-[#78716C] mt-1">
                  Active delivery partners registered for order dispatch. Verified via Firebase SMS OTP.
                </p>
                <div className="flex items-center gap-2 mt-3 flex-wrap">
                  <span className="px-3 py-1 rounded-full bg-orange-100 text-[#C2410C] font-bold text-xs border border-orange-200">
                    {riders.length} Registered Drivers
                  </span>
                  <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs border border-emerald-200">
                    {riders.filter((r) => r.activeOrders > 0).length} On Road
                  </span>
                  <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-800 font-bold text-xs border border-blue-200">
                    {riders.filter((r) => r.activeOrders === 0).length} Available
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsAddDriverModalOpen(true)}
                className="px-4 py-2.5 rounded-xl bg-[#C2410C] hover:bg-[#9A3412] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-[#C2410C]/25 transition-all cursor-pointer shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>+ Add Driver via OTP</span>
              </button>
            </div>

            {/* Drivers Grid */}
            {riders.length === 0 ? (
              <div className="bg-white rounded-3xl border border-[#E7E0D8] p-12 text-center flex flex-col items-center justify-center space-y-3">
                <div className="w-16 h-16 rounded-2xl bg-orange-50 border border-orange-200 flex items-center justify-center text-[#C2410C]">
                  <Bike className="w-8 h-8" />
                </div>
                <h3 className="font-bold text-base text-[#1C1917]">No Drivers Registered Yet</h3>
                <p className="text-xs text-[#78716C] max-w-sm">
                  Add delivery partner drivers to enable automatic SMS dispatch notifications and live turn-by-turn routing.
                </p>
                <button
                  type="button"
                  onClick={() => setIsAddDriverModalOpen(true)}
                  className="px-4 py-2 rounded-xl bg-[#C2410C] text-white text-xs font-bold cursor-pointer"
                >
                  + Add Driver via OTP
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {riders.map((rider) => (
                  <div
                    key={rider.id}
                    className="bg-white rounded-3xl border border-[#E7E0D8] p-5 shadow-xs flex flex-col justify-between hover:border-[#C2410C] transition-all space-y-4"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-2xl bg-orange-100 text-[#C2410C] flex items-center justify-center shrink-0 border border-orange-200">
                            <Bike className="w-6 h-6" />
                          </div>
                          <div>
                            <h3 className="font-bold text-base text-[#1C1917] leading-tight">
                              {rider.name}
                            </h3>
                            <p className="text-xs text-[#78716C] font-mono mt-0.5">
                              +91 {rider.phone}
                            </p>
                          </div>
                        </div>

                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold border shrink-0 ${
                            rider.activeOrders > 0
                              ? "bg-orange-50 text-[#C2410C] border-orange-200"
                              : "bg-emerald-50 text-emerald-700 border-emerald-200"
                          }`}
                        >
                          {rider.activeOrders > 0
                            ? `On Road (${rider.activeOrders})`
                            : "Available"}
                        </span>
                      </div>

                      <div className="mt-4 pt-3 border-t border-[#F5EFEB] flex items-center justify-between text-xs text-[#78716C]">
                        <span className="flex items-center gap-1">
                          <span className="text-amber-500 font-bold">★ {rider.rating || 5.0}</span>
                          <span>• {rider.vehicle || "Bike Dispatch"}</span>
                        </span>
                        <span className="text-[11px] font-semibold text-emerald-700">
                          OTP Verified
                        </span>
                      </div>
                    </div>

                    <div className="pt-2 flex items-center gap-2">
                      <a
                        href={`tel:${rider.phone.replace(/\D/g, "")}`}
                        className="flex-1 py-2 px-3 rounded-xl bg-orange-50 hover:bg-orange-100 border border-orange-200 text-[#C2410C] text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>Call Driver</span>
                      </a>

                      <a
                        href={`sms:${rider.phone.replace(/\D/g, "")}`}
                        className="py-2 px-3 rounded-xl bg-[#FAF8F5] hover:bg-[#F5EFEB] border border-[#E7E0D8] text-[#1C1917] text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                        title="Send SMS"
                      >
                        <span>SMS</span>
                      </a>

                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm(`Are you sure you want to remove ${rider.name} from the fleet?`)) {
                            removeRider(rider.id);
                          }
                        }}
                        className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-600 transition-colors cursor-pointer"
                        title="Remove Driver"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Full-Screen Admin Settings Modal (contains Menu & Pricing, Active Fleet, Preferences) */}
      <AdminSettings
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

      {/* Add Driver Modal */}
      <AddDriverModal
        isOpen={isAddDriverModalOpen}
        onClose={() => setIsAddDriverModalOpen(false)}
      />
    </div>
  );
}
