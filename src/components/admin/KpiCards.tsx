"use client";

import React from "react";
import { useKitchen } from "@/context/KitchenContext";
import { Sparkles, Flame, Bike } from "lucide-react";

export function KpiCards() {
  const { orders } = useKitchen();

  // 1. New Orders (Stage 1: Order Received / Pending)
  const newOrdersCount = orders.filter(
    (o) => o.status === "Order Received" || o.status === "Pending"
  ).length;

  // 2. Confirmed Orders (Stage 2: Kitchen Cooking / Order Status / Order Accepted / Preparing)
  const confirmedOrdersCount = orders.filter(
    (o) =>
      o.status === "Order Status" ||
      o.status === "Order Accepted" ||
      o.status === "Preparing"
  ).length;

  // 3. Pending Deliveries (Stage 3: Out for Delivery / In the Road / Ready)
  const pendingDeliveriesCount = orders.filter(
    (o) =>
      o.status === "In the Road" ||
      o.status === "Out for Delivery" ||
      o.status === "Ready"
  ).length;

  return (
    <div className="grid grid-cols-3 gap-2 sm:gap-4 lg:gap-6">
      {/* 1. NEW ORDER (Green transparent card) */}
      <div className="bg-emerald-500/10 backdrop-blur-xs rounded-2xl sm:rounded-3xl p-2.5 sm:p-5 lg:p-6 border border-emerald-500/30 ring-1 ring-emerald-500/20 shadow-xs relative overflow-hidden group hover:border-emerald-600 hover:shadow-md transition-all flex flex-col justify-between">
        <div className="flex items-center justify-between mb-1.5 sm:mb-3">
          <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-emerald-900 truncate">
            New Order
          </span>
          <div className="w-6 h-6 sm:w-10 sm:h-10 rounded-lg sm:rounded-2xl bg-emerald-500/20 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-500/30">
            <Sparkles className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-emerald-600" />
          </div>
        </div>

        <div className="flex items-baseline gap-1.5 sm:gap-2.5">
          <span className="font-serif text-xl sm:text-3xl lg:text-4xl font-bold text-[#1C1917]">
            {newOrdersCount}
          </span>
          <span
            className={`text-[9px] sm:text-[11px] font-semibold px-1.5 py-0.5 sm:px-2 rounded-full hidden sm:inline-flex items-center gap-1 ${
              newOrdersCount > 0
                ? "bg-emerald-500/20 text-emerald-900 animate-pulse border border-emerald-500/30"
                : "bg-white/60 text-[#78716C]"
            }`}
          >
            {newOrdersCount > 0 ? "Action Required" : "No Pending"}
          </span>
        </div>

        <p className="hidden sm:block text-[11px] text-emerald-800/80 mt-2 font-medium">
          Incoming orders waiting for kitchen acceptance
        </p>
      </div>

      {/* 2. CONFIRMED ORDER (Yellow card) */}
      <div className="bg-yellow-50/90 rounded-2xl sm:rounded-3xl p-2.5 sm:p-5 lg:p-6 border border-yellow-300 ring-1 ring-yellow-400/20 shadow-xs relative overflow-hidden group hover:border-yellow-500 hover:shadow-md transition-all flex flex-col justify-between">
        <div className="flex items-center justify-between mb-1.5 sm:mb-3">
          <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-yellow-900 truncate">
            Confirmed Order
          </span>
          <div className="w-6 h-6 sm:w-10 sm:h-10 rounded-lg sm:rounded-2xl bg-yellow-200/60 text-yellow-800 flex items-center justify-center shrink-0 border border-yellow-300">
            <Flame className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-yellow-700" />
          </div>
        </div>

        <div className="flex items-baseline gap-1.5 sm:gap-2.5">
          <span className="font-serif text-xl sm:text-3xl lg:text-4xl font-bold text-[#1C1917]">
            {confirmedOrdersCount}
          </span>
          <span className="text-[9px] sm:text-[11px] font-semibold bg-yellow-200/80 text-yellow-900 px-1.5 py-0.5 sm:px-2 rounded-full border border-yellow-300 hidden sm:inline-flex">
            Kitchen Cooking
          </span>
        </div>

        <p className="hidden sm:block text-[11px] text-yellow-800/80 mt-2 font-medium">
          Accepted orders currently being prepared
        </p>
      </div>

      {/* 3. PENDING DELIVERIES (Bike icon card) */}
      <div className="bg-white rounded-2xl sm:rounded-3xl p-2.5 sm:p-5 lg:p-6 border border-orange-200/90 ring-1 ring-orange-300/20 shadow-xs relative overflow-hidden group hover:border-orange-400 hover:shadow-md transition-all flex flex-col justify-between">
        <div className="flex items-center justify-between mb-1.5 sm:mb-3">
          <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-[#78716C] truncate">
            Pending Deliveries
          </span>
          <div className="w-6 h-6 sm:w-10 sm:h-10 rounded-lg sm:rounded-2xl bg-orange-100/70 text-[#C2410C] flex items-center justify-center shrink-0 border border-orange-200">
            <Bike className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-[#C2410C]" />
          </div>
        </div>

        <div className="flex items-baseline gap-1.5 sm:gap-2.5">
          <span className="font-serif text-xl sm:text-3xl lg:text-4xl font-bold text-[#1C1917]">
            {pendingDeliveriesCount}
          </span>
          <span className="text-[9px] sm:text-[11px] font-semibold bg-orange-100 text-[#9A3412] px-1.5 py-0.5 sm:px-2 rounded-full hidden sm:inline-flex items-center gap-1 border border-orange-200">
            <Bike className="w-3.5 h-3.5 text-[#C2410C]" />
            <span>In the Road</span>
          </span>
        </div>

        <p className="hidden sm:block text-[11px] text-[#A8A29E] mt-2">
          Dispatched orders on the way to customers
        </p>
      </div>
    </div>
  );
}
