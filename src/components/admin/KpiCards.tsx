"use client";

import React from "react";
import { useKitchen } from "@/context/KitchenContext";
import { ShoppingCart, IndianRupee, Clock, Bike, TrendingUp, CheckCircle2 } from "lucide-react";

export function KpiCards() {
  const { orders, riders } = useKitchen();

  const totalOrders = orders.length;
  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
  const pendingDeliveries = orders.filter(
    (o) => o.orderType === "Delivery" && o.status !== "Delivered"
  ).length;
  const activeRidersCount = riders.length;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {/* 1. Today's Orders */}
      <div className="bg-white rounded-3xl p-6 border border-[#E7E0D8] shadow-xs relative overflow-hidden group hover:border-[#D6CEB4] transition-all">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-bold uppercase tracking-wider text-[#78716C]">
            Today's Orders
          </span>
          <div className="w-10 h-10 rounded-2xl bg-[#FED7AA]/50 flex items-center justify-center text-[#C2410C]">
            <ShoppingCart className="w-5 h-5" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="font-serif text-3xl font-bold text-[#1C1917]">
            {totalOrders}
          </span>
          <span className="text-xs font-semibold text-emerald-600 flex items-center">
            <TrendingUp className="w-3.5 h-3.5 mr-0.5" /> +14% vs y'day
          </span>
        </div>
        <p className="text-[11px] text-[#A8A29E] mt-2">
          {orders.filter((o) => o.status === "Delivered").length} completed • {totalOrders - orders.filter((o) => o.status === "Delivered").length} in pipeline
        </p>
      </div>

      {/* 2. Total Revenue */}
      <div className="bg-white rounded-3xl p-6 border border-[#E7E0D8] shadow-xs relative overflow-hidden group hover:border-[#D6CEB4] transition-all">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-bold uppercase tracking-wider text-[#78716C]">
            Total Revenue (₹)
          </span>
          <div className="w-10 h-10 rounded-2xl bg-[#FFF7ED] flex items-center justify-center text-[#C2410C]">
            <IndianRupee className="w-5 h-5" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="font-serif text-3xl font-bold text-[#1C1917]">
            ₹{Math.round(totalRevenue).toLocaleString("en-IN")}
          </span>
          <span className="text-xs font-semibold text-emerald-600 flex items-center">
            <TrendingUp className="w-3.5 h-3.5 mr-0.5" /> +18.2%
          </span>
        </div>
        <p className="text-[11px] text-[#A8A29E] mt-2">
          Average Order Value: ₹{totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0}
        </p>
      </div>

      {/* 3. Pending Deliveries */}
      <div className="bg-white rounded-3xl p-6 border border-[#E7E0D8] shadow-xs relative overflow-hidden group hover:border-[#D6CEB4] transition-all">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-bold uppercase tracking-wider text-[#78716C]">
            Pending Deliveries
          </span>
          <div className="w-10 h-10 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600">
            <Clock className="w-5 h-5" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="font-serif text-3xl font-bold text-[#1C1917]">
            {pendingDeliveries}
          </span>
          <span className="text-xs font-medium text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
            Active Dispatches
          </span>
        </div>
        <p className="text-[11px] text-[#A8A29E] mt-2">
          Target fulfillment: &lt; 35 mins per order
        </p>
      </div>

      {/* 4. Active Riders */}
      <div className="bg-white rounded-3xl p-6 border border-[#E7E0D8] shadow-xs relative overflow-hidden group hover:border-[#D6CEB4] transition-all">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-bold uppercase tracking-wider text-[#78716C]">
            Active Riders (3)
          </span>
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600">
            <Bike className="w-5 h-5" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="font-serif text-3xl font-bold text-[#1C1917]">
            {activeRidersCount} / 3
          </span>
          <span className="text-xs font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> All Online
          </span>
        </div>
        <p className="text-[11px] text-[#A8A29E] mt-2">
          Rajesh (EV), Vikram (Activa), Amit (Ather)
        </p>
      </div>
    </div>
  );
}
