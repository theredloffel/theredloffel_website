"use client";

import React, { useState } from "react";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { KpiCards } from "@/components/admin/KpiCards";
import { LiveOrdersBoard } from "@/components/admin/LiveOrdersBoard";
import { MenuManager } from "@/components/admin/MenuManager";
import { useKitchen } from "@/context/KitchenContext";
import {
  UtensilsCrossed,
  ChefHat,
  Bike,
  SlidersHorizontal,
  Flame,
  Phone,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
} from "lucide-react";

export default function AdminPage() {
  const { riders, orders } = useKitchen();
  const [activeTab, setActiveTab] = useState<"orders" | "menu" | "riders">("orders");

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#1C1917] flex flex-col">
      {/* 1. Admin Header */}
      <AdminHeader />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-8">
        {/* 2. Daily Sales & Stats Header */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h1 className="font-serif text-3xl font-bold tracking-tight text-[#1C1917]">
                Live Kitchen Operations
              </h1>
              <p className="text-xs text-[#78716C] mt-1">
                Real-time dispatch board, WhatsApp notification status & menu stock management
              </p>
            </div>
          </div>

          {/* KPI Cards */}
          <KpiCards />
        </div>

        {/* Section Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-[#E7E0D8] pb-1">
          <button
            onClick={() => setActiveTab("orders")}
            className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-bold transition-all ${
              activeTab === "orders"
                ? "bg-[#1C1917] text-white shadow-xs"
                : "text-[#78716C] hover:text-[#1C1917] hover:bg-[#F5EFEB]"
            }`}
          >
            <ChefHat className="w-4 h-4 text-[#FED7AA]" />
            <span>Live Orders Board ({orders.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("menu")}
            className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-bold transition-all ${
              activeTab === "menu"
                ? "bg-[#1C1917] text-white shadow-xs"
                : "text-[#78716C] hover:text-[#1C1917] hover:bg-[#F5EFEB]"
            }`}
          >
            <SlidersHorizontal className="w-4 h-4 text-[#FED7AA]" />
            <span>Menu & Pricing Manager</span>
          </button>

          <button
            onClick={() => setActiveTab("riders")}
            className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-bold transition-all ${
              activeTab === "riders"
                ? "bg-[#1C1917] text-white shadow-xs"
                : "text-[#78716C] hover:text-[#1C1917] hover:bg-[#F5EFEB]"
            }`}
          >
            <Bike className="w-4 h-4 text-[#FED7AA]" />
            <span>Active Fleet ({riders.length})</span>
          </button>
        </div>

        {/* Tab 1: Live Orders Management Board */}
        {activeTab === "orders" && <LiveOrdersBoard />}

        {/* Tab 2: Menu & Pricing Manager */}
        {activeTab === "menu" && <MenuManager />}

        {/* Tab 3: Active Fleet Status */}
        {activeTab === "riders" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {riders.map((rider) => {
              const assignedOrders = orders.filter((o) => o.riderId === rider.id && o.status !== "Delivered");

              return (
                <div
                  key={rider.id}
                  className="bg-white rounded-3xl border border-[#E7E0D8] p-6 shadow-xs space-y-4"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-[#1C1917] text-white flex items-center justify-center">
                        <Bike className="w-6 h-6 text-[#FED7AA]" />
                      </div>
                      <div>
                        <h3 className="font-serif text-lg font-bold text-[#1C1917]">
                          {rider.name}
                        </h3>
                        <p className="text-xs text-[#78716C]">{rider.vehicle}</p>
                      </div>
                    </div>

                    <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold">
                      ★ {rider.rating}
                    </span>
                  </div>

                  <div className="p-3 rounded-2xl bg-[#FAF8F5] border border-[#E7E0D8] text-xs space-y-1">
                    <div className="flex justify-between text-[#78716C]">
                      <span>Contact:</span>
                      <span className="font-medium text-[#1C1917]">{rider.phone}</span>
                    </div>
                    <div className="flex justify-between text-[#78716C]">
                      <span>Active Trips:</span>
                      <span className="font-bold text-[#C2410C]">
                        {assignedOrders.length} In Progress
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 flex gap-2">
                    <a
                      href={`tel:${rider.phone}`}
                      className="flex-1 py-2 px-3 rounded-xl border border-[#E7E0D8] bg-white text-[#1C1917] text-xs font-semibold hover:border-[#C2410C] flex items-center justify-center gap-1.5"
                    >
                      <Phone className="w-3.5 h-3.5 text-[#C2410C]" />
                      <span>Call</span>
                    </a>
                    <a
                      href={`https://api.whatsapp.com/send?phone=${rider.phone.replace(/\D/g, "")}&text=Hello%20${encodeURIComponent(rider.name)},%20please%20check%20your%20cloud%20kitchen%20dispatch%20task.`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 flex items-center justify-center gap-1.5"
                    >
                      <span>WhatsApp</span>
                      <ExternalLink className="w-3 h-3 text-white/80" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
