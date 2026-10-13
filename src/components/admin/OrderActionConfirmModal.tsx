"use client";

import React from "react";
import { X, CheckCircle2, Bike, AlertCircle, ShoppingBag } from "lucide-react";
import { Order } from "@/types";
import { getGoogleMapsDirectionsUrl } from "@/lib/googleMaps";

function WhatsAppIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
    </svg>
  );
}

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

        {/* WhatsApp Share Button for Driver Assignment */}
        {action === "assign" && (
          <button
            type="button"
            onClick={() => {
              const addressText = order.address
                ? `${order.address.house ? `${order.address.house}, ` : ""}${order.address.street || ""}${
                    order.address.landmark ? ` (Landmark: ${order.address.landmark})` : ""
                  }`.trim()
                : "Counter Pickup";
              const mapLink = order.address ? getGoogleMapsDirectionsUrl(order.address) : "";
              const message = [
                `🛵 *The Red Löffel - Delivery Details*`,
                `━━━━━━━━━━━━━━━━━━━━`,
                `📋 *Order ID:* #${order.id}`,
                `👤 *Customer Name:* ${order.customerName}`,
                `📞 *Customer Phone:* ${order.customerPhone}`,
                `💰 *Amount to Collect:* ₹${order.total} (${order.paymentMethod || "Cash on Delivery"})`,
                riderName ? `🏍️ *Driver:* ${riderName}` : "",
                `━━━━━━━━━━━━━━━━━━━━`,
                `📍 *Delivery Address:*`,
                `${addressText}`,
                mapLink ? `\n🗺️ *Location Link:* \n${mapLink}` : "",
                `━━━━━━━━━━━━━━━━━━━━`,
                `🍽️ *Items (${order.items.reduce((s, i) => s + i.quantity, 0)}):*`,
                ...order.items.map((i) => `• ${i.quantity}x ${i.name}`),
              ]
                .filter(Boolean)
                .join("\n");
              window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`, "_blank");
            }}
            className="w-full py-2.5 px-3 rounded-xl bg-[#25D366] hover:bg-[#1EBE5D] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer"
          >
            <WhatsAppIcon className="w-4 h-4 fill-current" />
            <span>Share Details on WhatsApp</span>
          </button>
        )}

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
