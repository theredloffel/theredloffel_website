"use client";

import React, { useState } from "react";
import { useKitchen } from "@/context/KitchenContext";
import { Order } from "@/types";
import { OrderActionConfirmModal } from "@/components/admin/OrderActionConfirmModal";
import { AddDriverModal } from "@/components/admin/AddDriverModal";
import {
  X,
  Bike,
  CheckCircle2,
  Phone,
  MapPin,
  Clock,
  ShoppingBag,
  ExternalLink,
  Plus,
  Trash2,
  Star,
  UserCheck,
} from "lucide-react";

interface OutForDeliveryModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: "orders" | "fleet";
}

export function OutForDeliveryModal({ isOpen, onClose, initialTab = "orders" }: OutForDeliveryModalProps) {
  const { orders, updateOrderStatus, riders, removeRider, showToast } = useKitchen();
  const [activeTab, setActiveTab] = useState<"orders" | "fleet">(initialTab);
  const [confirmingOrder, setConfirmingOrder] = useState<Order | null>(null);
  const [isAddDriverOpen, setIsAddDriverOpen] = useState(false);

  React.useEffect(() => {
    if (isOpen && initialTab) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  if (!isOpen) return null;

  // Filter orders currently out for delivery / in the road
  const activeDeliveryOrders = orders.filter(
    (o) => o.status === "In the Road" || o.status === "Out for Delivery"
  );

  const handleExecuteDelivery = () => {
    if (!confirmingOrder) return;
    const orderId = confirmingOrder.id;
    updateOrderStatus(orderId, "Delivered", undefined, true);
    showToast(`Order #${orderId} marked as delivered! Moved to Order History in Settings.`, "success");
    setConfirmingOrder(null);
  };

  return (
    <>
    <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-2xl bg-[#1C1917] text-[#FAF8F5] border border-[#292524] rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden z-10">
        {/* Header */}
        <div className="px-6 py-5 border-b border-[#292524] flex items-center justify-between bg-black/30 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#C2410C] text-white flex items-center justify-center shadow-md shadow-[#C2410C]/25 shrink-0">
              <Bike className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-serif text-lg sm:text-xl font-bold text-white">
                  {activeTab === "orders" ? "Out for Delivery Orders" : "Registered Delivery Fleet"}
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-[#FED7AA] text-[#9A3412] text-xs font-black">
                  {activeTab === "orders" ? `${activeDeliveryOrders.length} Active` : `${riders.length} Drivers`}
                </span>
              </div>
              <p className="text-xs text-[#A8A29E] mt-0.5">
                {activeTab === "orders"
                  ? "Orders currently dispatched on the road with delivery riders."
                  : "Active delivery partner drivers registered for dispatch."}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-[#A8A29E] hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Selector Bar */}
        <div className="flex border-b border-[#292524] bg-black/20 px-4 py-2 gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab("orders")}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === "orders"
                ? "bg-[#C2410C] text-white shadow-xs"
                : "bg-white/5 text-[#A8A29E] hover:text-white"
            }`}
          >
            <Bike className="w-4 h-4" />
            <span>On Road Orders ({activeDeliveryOrders.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("fleet")}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === "fleet"
                ? "bg-[#C2410C] text-white shadow-xs"
                : "bg-white/5 text-[#A8A29E] hover:text-white"
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>Driver Fleet ({riders.length})</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {activeTab === "fleet" ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white">Registered Drivers ({riders.length})</h3>
                  <p className="text-xs text-[#A8A29E]">Drivers eligible for dispatch assignments</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAddDriverOpen(true)}
                  className="px-3.5 py-2 rounded-xl bg-[#C2410C] hover:bg-[#9A3412] text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-[#C2410C]/25 transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Driver</span>
                </button>
              </div>

              {riders.length === 0 ? (
                <div className="py-12 flex flex-col items-center justify-center text-center space-y-3 bg-[#292524]/40 rounded-2xl border border-[#44403C]">
                  <Bike className="w-8 h-8 text-[#A8A29E]" />
                  <p className="text-xs text-[#A8A29E]">No drivers currently registered in the fleet.</p>
                  <button
                    type="button"
                    onClick={() => setIsAddDriverOpen(true)}
                    className="px-3.5 py-2 rounded-xl bg-[#C2410C] text-white text-xs font-bold cursor-pointer"
                  >
                    + Register Driver via OTP
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {riders.map((r) => (
                    <div
                      key={r.id}
                      className="bg-[#292524]/80 border border-[#44403C] rounded-2xl p-4 flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-orange-500/20 text-[#FED7AA] border border-orange-500/40 flex items-center justify-center shrink-0">
                          <Bike className="w-5 h-5 text-[#FED7AA]" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white text-sm truncate">{r.name}</span>
                            <span className="flex items-center text-[10px] text-amber-400 font-bold">
                              <Star className="w-3 h-3 fill-amber-400 mr-0.5" />
                              {r.rating || 5.0}
                            </span>
                          </div>
                          <p className="text-xs text-[#A8A29E] font-mono mt-0.5">+91 {r.phone}</p>
                          <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full mt-1 ${
                            r.activeOrders > 0
                              ? "bg-orange-500/20 text-orange-300 border border-orange-500/30"
                              : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                          }`}>
                            {r.activeOrders > 0 ? `On Road (${r.activeOrders} orders)` : "Available for Orders"}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <a
                          href={`tel:${r.phone.replace(/\D/g, "")}`}
                          className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-[#FED7AA] text-xs font-bold flex items-center gap-1.5 transition-colors"
                          title="Call Driver"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          <span>Call</span>
                        </a>
                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm(`Remove ${r.name} from fleet?`)) {
                              removeRider(r.id);
                            }
                          }}
                          className="p-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 transition-colors cursor-pointer"
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
          ) : activeDeliveryOrders.length === 0 ? (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
              <div className="w-16 h-16 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center text-[#78716C]">
                <Bike className="w-8 h-8 text-[#A8A29E]" />
              </div>
              <div>
                <h3 className="font-bold text-base text-white">No Orders on the Road</h3>
                <p className="text-xs text-[#A8A29E] mt-1 max-w-xs">
                  Orders marked as &quot;In the Road&quot; on the board will automatically appear here for rapid completion.
                </p>
              </div>
            </div>
          ) : (
            activeDeliveryOrders.map((order) => {
              const rider = riders.find((r) => r.id === order.riderId);

              return (
                <div
                  key={order.id}
                  className="bg-[#292524]/60 border border-[#44403C] rounded-2xl p-4 sm:p-5 space-y-3.5 hover:border-[#C2410C]/50 transition-all shadow-xs"
                >
                  {/* Top Row: Order ID, Time & Total */}
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-bold text-[#FED7AA]">
                        #{order.id}
                      </span>
                      <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-300 border border-orange-500/30">
                        In the Road
                      </span>
                      <span className="text-xs text-[#A8A29E] flex items-center gap-1">
                        <Clock className="w-3 h-3 text-[#A8A29E]" />
                        {order.createdAt}
                      </span>
                    </div>

                    <span className="font-serif text-base font-bold text-white">
                      ₹{order.total}
                    </span>
                  </div>

                  {/* Customer Info & Address */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    {/* Customer */}
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase font-bold text-[#A8A29E] block">
                        Customer
                      </span>
                      <p className="font-bold text-white text-sm">
                        {order.customerName}
                      </p>
                      <a
                        href={`tel:${order.customerPhone}`}
                        className="inline-flex items-center gap-1 text-[#FED7AA] hover:underline font-mono text-xs"
                      >
                        <Phone className="w-3 h-3" />
                        <span>{order.customerPhone}</span>
                      </a>
                    </div>

                    {/* Delivery Address */}
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase font-bold text-[#A8A29E] block">
                        Delivery Destination
                      </span>
                      <p className="text-white/90 flex items-start gap-1 leading-snug">
                        <MapPin className="w-3.5 h-3.5 text-[#C2410C] shrink-0 mt-0.5" />
                        <span>
                          {order.address
                            ? `${order.address.house ? order.address.house + ", " : ""}${order.address.street}`
                            : "Counter Pickup"}
                        </span>
                      </p>
                    </div>
                  </div>

                  {/* Items summary */}
                  <div className="p-2.5 rounded-xl bg-black/30 border border-white/5 text-xs text-[#D6D3D1]">
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#A8A29E] mb-1">
                      <ShoppingBag className="w-3.5 h-3.5 text-[#FED7AA]" />
                      <span>Items ({order.items.reduce((acc, curr) => acc + curr.quantity, 0)})</span>
                    </div>
                    <p className="truncate">
                      {order.items.map((i) => `${i.quantity}x ${i.name}`).join(" • ")}
                    </p>
                  </div>

                  {/* Bottom Actions Row: Rider Assigned & Complete Button */}
                  <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center text-[#FED7AA]">
                        <Bike className="w-4 h-4" />
                      </div>
                      <div className="text-xs">
                        <span className="text-[#A8A29E] text-[10px] block leading-tight">
                          Assigned Rider
                        </span>
                        <span className="font-semibold text-white leading-tight">
                          {rider ? rider.name : "Fleet Driver Assigned"}
                        </span>
                      </div>
                    </div>

                    {/* COMPLETE / MARK DELIVERED BUTTON */}
                    <button
                      type="button"
                      onClick={() => setConfirmingOrder(order)}
                      className="py-2.5 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-98 text-white text-xs font-bold shadow-md shadow-emerald-600/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4 text-white" />
                      <span>Complete Order (Delivered)</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#292524] bg-black/40 flex items-center justify-between text-xs text-[#A8A29E]">
          <span>
            {activeDeliveryOrders.length} order{activeDeliveryOrders.length === 1 ? "" : "s"} awaiting final delivery confirmation
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>

      {/* Delivery Confirmation Dialog */}
      <OrderActionConfirmModal
        isOpen={Boolean(confirmingOrder)}
        action="deliver"
        order={confirmingOrder}
        riderName={riders.find((r) => r.id === confirmingOrder?.riderId)?.name || "Assigned Rider"}
        onConfirm={handleExecuteDelivery}
        onCancel={() => setConfirmingOrder(null)}
      />

      {/* Add Driver Phone Auth Modal */}
      <AddDriverModal
        isOpen={isAddDriverOpen}
        onClose={() => setIsAddDriverOpen(false)}
      />
    </div>
    </>
  );
}
