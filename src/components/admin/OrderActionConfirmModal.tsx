"use client";

import React from "react";
import { X, CheckCircle2, Bike, AlertCircle, ShoppingBag } from "lucide-react";
import { Order } from "@/types";

export type OrderConfirmActionType = "accept" | "assign" | "deliver";

interface OrderActionConfirmModalProps {
  isOpen: boolean;
  action: OrderConfirmActionType | null;
  order: Order | null;
  riderName?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function OrderActionConfirmModal({
  isOpen,
  action,
  order,
  riderName,
  onConfirm,
  onCancel,
}: OrderActionConfirmModalProps) {
  if (!isOpen || !action || !order) return null;

  const config = {
    accept: {
      title: `Confirm Accept Order #${order.id}?`,
      subtitle: "Are you sure you want to accept this order? The order will be marked as Confirmed and move to kitchen preparation.",
      badge: "Stage 1 → Confirmed Order",
      badgeColor: "bg-emerald-500/10 border-emerald-500/30 text-emerald-300",
      iconBg: "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30",
      icon: <CheckCircle2 className="w-6 h-6 text-emerald-400" />,
      btnText: "Confirm & Accept Order",
      btnClass: "bg-emerald-600 hover:bg-emerald-700 text-white",
    },
    assign: {
      title: `Confirm Assign Rider for #${order.id}?`,
      subtitle: `Are you sure you want to assign ${riderName || "this rider"} to Order #${order.id}? This will dispatch the order and move it to In the Road.`,
      badge: `Stage 2 → In Road (${riderName || "Assigned Rider"})`,
      badgeColor: "bg-orange-500/10 border-orange-500/30 text-orange-300",
      iconBg: "bg-orange-500/20 text-orange-400 border border-orange-500/30",
      icon: <Bike className="w-6 h-6 text-[#FED7AA]" />,
      btnText: "Confirm & Assign Driver",
      btnClass: "bg-[#C2410C] hover:bg-[#9A3412] text-white",
    },
    deliver: {
      title: `Confirm Order #${order.id} Delivered?`,
      subtitle: `Are you sure Order #${order.id} has been delivered? It will be removed from the live board and archived to Order History.`,
      badge: "Stage 3 → Delivered (Archive)",
      badgeColor: "bg-emerald-500/10 border-emerald-500/30 text-emerald-300",
      iconBg: "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30",
      icon: <CheckCircle2 className="w-6 h-6 text-emerald-400" />,
      btnText: "Confirm Marked Delivered",
      btnClass: "bg-emerald-600 hover:bg-emerald-700 text-white",
    },
  }[action];

  return (
    <div className="fixed inset-0 z-60 overflow-hidden flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-xs transition-opacity"
        onClick={onCancel}
        aria-hidden="true"
      />

      {/* Confirmation Dialog Card */}
      <div
        role="dialog"
        aria-modal="true"
        className="relative w-full max-w-md bg-[#1C1917] text-[#FAF8F5] border border-[#292524] rounded-3xl p-6 sm:p-7 shadow-2xl space-y-5 z-10 animate-in zoom-in-95 duration-150"
      >
        {/* Top Header & Icon */}
        <div className="flex items-start justify-between">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${config.iconBg}`}>
            {config.icon}
          </div>

          <button
            type="button"
            onClick={onCancel}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-[#A8A29E] hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Text Details */}
        <div className="space-y-2">
          <h3 className="font-serif text-xl font-bold text-white tracking-tight">
            {config.title}
          </h3>
          <p className="text-xs text-[#A8A29E] leading-relaxed">
            {config.subtitle}
          </p>
        </div>

        {/* Order Summary Snapshot Pill */}
        <div className="p-3.5 rounded-2xl bg-[#292524]/60 border border-white/10 space-y-1.5 text-xs">
          <div className="flex items-center justify-between font-semibold text-white">
            <span>Customer: {order.customerName}</span>
            <span className="font-mono text-[#FED7AA]">₹{order.total}</span>
          </div>
          <div className="flex items-center justify-between text-[11px] text-[#A8A29E]">
            <span>Type: {order.orderType} • {order.items.length} item(s)</span>
            <span>{order.createdAt}</span>
          </div>
          {action === "assign" && riderName && (
            <div className="pt-1 border-t border-white/10 text-[11px] text-orange-300 font-medium flex items-center gap-1.5">
              <Bike className="w-3.5 h-3.5" />
              <span>Assigned Driver: {riderName}</span>
            </div>
          )}
        </div>

        {/* Stage Status Change Tag */}
        <div className={`p-3 rounded-2xl border text-xs flex items-center gap-2.5 ${config.badgeColor}`}>
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span className="font-medium">{config.badge}</span>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 flex items-center gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-3 px-4 rounded-xl border border-white/10 hover:bg-white/10 text-white font-semibold text-xs transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`flex-1 py-3 px-4 rounded-xl font-bold text-xs shadow-md transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${config.btnClass}`}
          >
            <span>{config.btnText}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
