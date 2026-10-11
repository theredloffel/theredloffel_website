"use client";

import React, { useState } from "react";
import { useKitchen } from "@/context/KitchenContext";
import { Order, OrderStatus } from "@/types";
import {
  MapPin,
  MessageSquare,
  Bike,
  User,
  Phone,
  Clock,
  ExternalLink,
  ChevronDown,
  RotateCcw,
  Send,
  CheckCircle2,
  AlertCircle,
  LayoutGrid,
  Columns3,
  Flame,
} from "lucide-react";

const STATUSES: OrderStatus[] = [
  "Pending",
  "Preparing",
  "Ready",
  "Out for Delivery",
  "Delivered",
];

export function LiveOrdersBoard() {
  const {
    orders,
    updateOrderStatus,
    assignRider,
    sendRiderWhatsApp,
    retryWhatsApp,
    riders,
  } = useKitchen();

  const [activeStatusFilter, setActiveStatusFilter] = useState<OrderStatus | "All">("All");
  const [boardLayout, setBoardLayout] = useState<"kanban" | "list">("kanban");
  const [whatsAppPreviewOrder, setWhatsAppPreviewOrder] = useState<Order | null>(null);

  const filteredOrders =
    activeStatusFilter === "All"
      ? orders
      : orders.filter((o) => o.status === activeStatusFilter);

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case "Pending":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "Preparing":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "Ready":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "Out for Delivery":
        return "bg-orange-100 text-[#C2410C] border-orange-200";
      case "Delivered":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getWhatsAppBadge = (order: Order) => {
    const status = order.whatsAppNotificationStatus;
    switch (status) {
      case "Sent":
        return {
          color: "bg-blue-50 text-blue-700 border-blue-200",
          icon: <Send className="w-3 h-3" />,
          label: "Sent",
        };
      case "Delivered":
        return {
          color: "bg-emerald-50 text-emerald-700 border-emerald-200",
          icon: <CheckCircle2 className="w-3 h-3" />,
          label: "Delivered",
        };
      case "Read":
        return {
          color: "bg-cyan-50 text-cyan-800 border-cyan-200",
          icon: <CheckCircle2 className="w-3 h-3" />,
          label: "Read",
        };
      case "Failed":
        return {
          color: "bg-rose-50 text-rose-700 border-rose-200",
          icon: <AlertCircle className="w-3 h-3" />,
          label: "Failed",
        };
      default:
        return {
          color: "bg-gray-50 text-gray-700 border-gray-200",
          icon: <MessageSquare className="w-3 h-3" />,
          label: status,
        };
    }
  };

  const renderOrderCard = (order: Order) => {
    const assignedRider = riders.find((r) => r.id === order.riderId);
    const wa = getWhatsAppBadge(order);
    const lat = order.address?.lat || 12.9716;
    const lng = order.address?.lng || 77.6412;
    const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;

    return (
      <div
        key={order.id}
        className="bg-white rounded-3xl border border-[#E7E0D8] p-5 shadow-xs hover:shadow-md transition-all space-y-4 flex flex-col justify-between"
      >
        {/* Top Header */}
        <div>
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              <span className="font-serif text-lg font-bold text-[#1C1917]">
                #{order.id}
              </span>
              <span
                className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border ${getStatusBadge(
                  order.status
                )}`}
              >
                {order.status}
              </span>
            </div>

            <span className="text-[11px] font-medium text-[#78716C] flex items-center gap-1">
              <Clock className="w-3 h-3 text-[#A8A29E]" />
              {order.createdAt}
            </span>
          </div>

          {/* Customer info */}
          <div className="p-3 rounded-2xl bg-[#FAF8F5] border border-[#E7E0D8] space-y-1 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-[#1C1917] flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-[#C2410C]" />
                {order.customerName}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-white border border-[#E7E0D8] text-[10px] font-bold text-[#78716C]">
                {order.orderType}
              </span>
            </div>

            <div className="flex items-center justify-between text-[#78716C]">
              <span className="flex items-center gap-1">
                <Phone className="w-3 h-3" /> {order.customerPhone}
              </span>
              <span className="font-medium text-[#1C1917]">
                {order.paymentMethod === "Online UPI / Cards" ? "UPI (Paid)" : "COD (Pending)"}
              </span>
            </div>
          </div>

          {/* Items & Total */}
          <div className="mt-3 space-y-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#A8A29E] block">
              Items Ordered ({order.items.length})
            </span>
            <div className="space-y-1 max-h-32 overflow-y-auto pr-1">
              {order.items.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between text-xs text-[#1C1917] py-0.5 border-b border-[#F5EFEB] last:border-0"
                >
                  <span className="truncate pr-2">
                    <span className="font-bold text-[#C2410C] mr-1.5">{item.quantity}x</span>
                    {item.name}
                  </span>
                  <span className="text-[#78716C] font-mono shrink-0">
                    ₹{item.price * item.quantity}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-2 flex justify-between items-center text-xs font-bold text-[#1C1917]">
              <span>Grand Total</span>
              <span className="font-serif text-base text-[#C2410C]">₹{order.total}</span>
            </div>

            {order.cookingNotes && (
              <p className="text-[11px] text-[#C2410C] bg-[#FFF7ED] p-2 rounded-xl border border-orange-200 mt-2">
                <span className="font-bold">Kitchen Note:</span> {order.cookingNotes}
              </p>
            )}
          </div>

          {/* Address & Google Maps link */}
          {order.orderType === "Delivery" && order.address && (
            <div className="mt-3 p-3 rounded-2xl bg-[#F5EFEB] border border-[#E7E0D8] space-y-2">
              <div className="text-[11px] text-[#78716C]">
                <p className="font-semibold text-[#1C1917] flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[#C2410C]" /> {order.address.house}
                </p>
                <p className="truncate">{order.address.street}</p>
                {order.address.landmark && (
                  <p className="text-[#A8A29E] text-[10px]">Landmark: {order.address.landmark}</p>
                )}
              </div>

              {/* Clickable Google Maps Action Button */}
              <a
                href={googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-1.5 px-3 rounded-xl bg-white border border-[#E7E0D8] hover:border-[#1C1917] text-xs font-semibold text-[#1C1917] flex items-center justify-center gap-1.5 shadow-2xs transition-colors"
              >
                <MapPin className="w-3.5 h-3.5 text-rose-600" />
                <span>Open in Google Maps</span>
                <ExternalLink className="w-3 h-3 text-[#A8A29E]" />
              </a>
            </div>
          )}
        </div>

        {/* Bottom Actions: Status Dropdown, Rider Assignment, WhatsApp Dispatch */}
        <div className="pt-3 border-t border-[#F5EFEB] space-y-3">
          {/* Status Dropdown */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-[#78716C] mb-1">
              Advance Order State
            </label>
            <div className="relative">
              <select
                value={order.status}
                onChange={(e) => updateOrderStatus(order.id, e.target.value as OrderStatus)}
                className="w-full px-3 py-2 rounded-xl border border-[#E7E0D8] bg-white text-xs font-semibold text-[#1C1917] appearance-none focus:outline-hidden focus:border-[#C2410C]"
              >
                {STATUSES.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-[#78716C] absolute right-3 top-3 pointer-events-none" />
            </div>
          </div>

          {/* Rider Assignment Dropdown (for Delivery orders) */}
          {order.orderType === "Delivery" && (
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-[#78716C] mb-1">
                Assign Delivery Rider
              </label>
              <div className="relative">
                <select
                  value={order.riderId || ""}
                  onChange={(e) => assignRider(order.id, e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#E7E0D8] bg-white text-xs font-medium text-[#1C1917] appearance-none focus:outline-hidden focus:border-[#C2410C]"
                >
                  <option value="">-- Select Rider --</option>
                  {riders.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name} ({r.vehicle.split(" ")[0]})
                    </option>
                  ))}
                </select>
                <Bike className="w-3.5 h-3.5 text-[#78716C] absolute right-3 top-3 pointer-events-none" />
              </div>
            </div>
          )}

          {/* WhatsApp Rider Action & Status Log Indicator */}
          <div className="pt-1 flex items-center justify-between gap-2">
            {/* Status Log Indicator */}
            <div
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${wa.color}`}
              title="WhatsApp notification dispatch status"
            >
              {wa.icon}
              <span>{wa.label}</span>
              {order.whatsAppNotificationStatus === "Failed" && (
                <button
                  onClick={() => retryWhatsApp(order.id)}
                  className="ml-1 text-[10px] underline hover:text-black flex items-center gap-0.5"
                  title="Retry sending WhatsApp"
                >
                  <RotateCcw className="w-2.5 h-2.5" /> Retry
                </button>
              )}
            </div>

            {/* Share to Rider via WhatsApp Action Button */}
            <button
              type="button"
              onClick={() => {
                sendRiderWhatsApp(order.id);
                setWhatsAppPreviewOrder(order);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-2xs transition-colors shrink-0"
              title="Share Task to Rider via WhatsApp"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Share Task to Rider</span>
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Board Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-3xl border border-[#E7E0D8]">
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <button
            onClick={() => setActiveStatusFilter("All")}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all shrink-0 ${
              activeStatusFilter === "All"
                ? "bg-[#1C1917] text-white"
                : "bg-[#F5EFEB] text-[#78716C] hover:text-[#1C1917]"
            }`}
          >
            All ({orders.length})
          </button>
          {STATUSES.map((st) => {
            const count = orders.filter((o) => o.status === st).length;
            const isSelected = activeStatusFilter === st;
            return (
              <button
                key={st}
                onClick={() => setActiveStatusFilter(st)}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all shrink-0 ${
                  isSelected
                    ? "bg-[#C2410C] text-white"
                    : "bg-[#F5EFEB] text-[#78716C] hover:text-[#1C1917]"
                }`}
              >
                <span>{st}</span>
                <span
                  className={`w-4 h-4 rounded-full text-[10px] flex items-center justify-center font-bold ${
                    isSelected ? "bg-white text-[#C2410C]" : "bg-white text-[#78716C]"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* View Layout Toggle */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs text-[#78716C] font-medium hidden md:inline">Layout:</span>
          <div className="flex bg-[#F5EFEB] p-1 rounded-xl border border-[#E7E0D8]">
            <button
              onClick={() => setBoardLayout("kanban")}
              className={`p-1.5 rounded-lg text-xs flex items-center gap-1 ${
                boardLayout === "kanban"
                  ? "bg-white text-[#1C1917] font-semibold shadow-2xs"
                  : "text-[#78716C]"
              }`}
              title="Kanban Column Board"
            >
              <Columns3 className="w-4 h-4" />
              <span className="hidden sm:inline">Columns</span>
            </button>
            <button
              onClick={() => setBoardLayout("list")}
              className={`p-1.5 rounded-lg text-xs flex items-center gap-1 ${
                boardLayout === "list"
                  ? "bg-white text-[#1C1917] font-semibold shadow-2xs"
                  : "text-[#78716C]"
              }`}
              title="Grid/List View"
            >
              <LayoutGrid className="w-4 h-4" />
              <span className="hidden sm:inline">Grid</span>
            </button>
          </div>
        </div>
      </div>

      {/* Kanban Column View */}
      {boardLayout === "kanban" && activeStatusFilter === "All" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5 overflow-x-auto pb-4">
          {STATUSES.map((status) => {
            const columnOrders = orders.filter((o) => o.status === status);
            return (
              <div
                key={status}
                className="bg-[#F5EFEB]/70 rounded-3xl p-4 border border-[#E7E0D8] flex flex-col space-y-4 min-w-[280px]"
              >
                {/* Column Header */}
                <div className="flex items-center justify-between pb-2 border-b border-[#E7E0D8]">
                  <div className="flex items-center gap-2">
                    <span className="font-serif text-sm font-bold text-[#1C1917]">
                      {status}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-white text-[10px] font-bold text-[#78716C] border border-[#E7E0D8]">
                      {columnOrders.length}
                    </span>
                  </div>
                </div>

                {/* Column Cards */}
                <div className="space-y-4 flex-1">
                  {columnOrders.length === 0 ? (
                    <div className="text-center py-10 text-xs text-[#A8A29E] italic">
                      No orders currently {status.toLowerCase()}
                    </div>
                  ) : (
                    columnOrders.map(renderOrderCard)
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Grid / Filtered View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredOrders.length === 0 ? (
            <div className="col-span-full text-center py-16 bg-white rounded-3xl border border-[#E7E0D8]">
              <p className="font-serif text-lg text-[#1C1917] font-bold">
                No orders match this status filter
              </p>
            </div>
          ) : (
            filteredOrders.map(renderOrderCard)
          )}
        </div>
      )}

      {/* WhatsApp Message Dispatch Modal Preview */}
      {whatsAppPreviewOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-[#FAF8F5] rounded-3xl border border-[#E7E0D8] max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#E7E0D8] pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-serif text-base font-bold text-[#1C1917]">
                    WhatsApp Task Shared
                  </h4>
                  <p className="text-[10px] text-[#78716C]">
                    Dispatched to {riders.find((r) => r.id === whatsAppPreviewOrder.riderId)?.name || "Assigned Rider"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setWhatsAppPreviewOrder(null)}
                className="text-xs text-[#78716C] hover:text-black font-bold p-1"
              >
                ✕
              </button>
            </div>

            <div className="bg-[#075E54] text-white p-4 rounded-2xl text-xs space-y-2 font-mono">
              <p className="font-bold text-[#FED7AA]">🛵 THE RED LÖFFEL DISPATCH TASK</p>
              <p>Order: #{whatsAppPreviewOrder.id} ({whatsAppPreviewOrder.orderType})</p>
              <p>Customer: {whatsAppPreviewOrder.customerName} ({whatsAppPreviewOrder.customerPhone})</p>
              {whatsAppPreviewOrder.address && (
                <>
                  <p>Address: {whatsAppPreviewOrder.address.house}, {whatsAppPreviewOrder.address.street}</p>
                  <p className="text-emerald-200">
                    Maps: https://www.google.com/maps/dir/?api=1&destination={whatsAppPreviewOrder.address.lat},{whatsAppPreviewOrder.address.lng}
                  </p>
                </>
              )}
              <div className="pt-1 border-t border-white/20">
                <p>Items: {whatsAppPreviewOrder.items.map((i) => `${i.quantity}x ${i.name}`).join(", ")}</p>
                <p>Total: ₹{whatsAppPreviewOrder.total} ({whatsAppPreviewOrder.paymentStatus === "Paid" ? "PREPAID - DO NOT COLLECT" : "COLLECT CASH / UPI"})</p>
              </div>
            </div>

            <button
              onClick={() => setWhatsAppPreviewOrder(null)}
              className="w-full py-2.5 rounded-xl bg-[#1C1917] text-white text-xs font-semibold hover:bg-black transition-colors"
            >
              Dismiss Preview
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
