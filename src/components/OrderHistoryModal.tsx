"use client";

import React, { useState } from "react";
import { useKitchen } from "@/context/KitchenContext";
import { OrderStatus } from "@/types";
import { X, Clock, CheckCircle2, Bike, ChefHat, Package, CheckCheck, MessageSquare, MapPin, ChevronRight, Sparkles, Phone, ArrowUpRight } from "lucide-react";

const STEPS: { status: OrderStatus; label: string; icon: React.ReactNode }[] = [
  { status: "Pending", label: "Order Received", icon: <Clock className="w-4 h-4" /> },
  { status: "Preparing", label: "In Kitchen", icon: <ChefHat className="w-4 h-4" /> },
  { status: "Ready", label: "Packaged Ready", icon: <Package className="w-4 h-4" /> },
  { status: "Out for Delivery", label: "On the Road", icon: <Bike className="w-4 h-4" /> },
  { status: "Delivered", label: "Delivered", icon: <CheckCheck className="w-4 h-4" /> },
];

export function OrderHistoryModal() {
  const {
    isOrderHistoryOpen,
    setIsOrderHistoryOpen,
    orders,
    selectedTrackingOrderId,
    setSelectedTrackingOrderId,
    updateOrderStatus,
    riders,
  } = useKitchen();

  const [activeTab, setActiveTab] = useState<"active" | "all">("active");

  if (!isOrderHistoryOpen) return null;

  const activeOrders = orders.filter((o) => o.status !== "Delivered");
  const pastOrders = orders.filter((o) => o.status === "Delivered");

  const displayedOrders = activeTab === "active" ? activeOrders : orders;
  const currentTrackingOrder = orders.find((o) => o.id === selectedTrackingOrderId) || orders[0];

  const getStepIndex = (status: OrderStatus) => {
    return STEPS.findIndex((s) => s.status === status);
  };

  const handleSimulateNextStep = (orderId: string, currentStatus: OrderStatus) => {
    const currentIndex = getStepIndex(currentStatus);
    if (currentIndex < STEPS.length - 1) {
      const nextStatus = STEPS[currentIndex + 1].status;
      updateOrderStatus(orderId, nextStatus);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-[#FAF8F5] rounded-3xl border border-[#E7E0D8] shadow-2xl overflow-hidden my-6">
        {/* Header */}
        <div className="p-6 border-b border-[#E7E0D8] bg-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#FED7AA]/60 flex items-center justify-center text-[#C2410C]">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif text-2xl font-bold text-[#1C1917]">
                Order Status & History
              </h2>
              <p className="text-xs text-[#78716C]">
                Real-time kitchen timeline & WhatsApp dispatch tracking
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsOrderHistoryOpen(false)}
            className="w-8 h-8 rounded-full border border-[#E7E0D8] bg-[#F5EFEB] flex items-center justify-center text-[#78716C] hover:text-[#1C1917]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="px-6 pt-4 bg-[#F5EFEB] border-b border-[#E7E0D8] flex items-center justify-between">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab("active")}
              className={`px-4 py-2 rounded-t-xl text-xs font-semibold transition-all ${
                activeTab === "active"
                  ? "bg-[#FAF8F5] text-[#C2410C] border-t-2 border-[#C2410C]"
                  : "text-[#78716C] hover:text-[#1C1917]"
              }`}
            >
              Active Kitchen Orders ({activeOrders.length})
            </button>
            <button
              onClick={() => setActiveTab("all")}
              className={`px-4 py-2 rounded-t-xl text-xs font-semibold transition-all ${
                activeTab === "all"
                  ? "bg-[#FAF8F5] text-[#C2410C] border-t-2 border-[#C2410C]"
                  : "text-[#78716C] hover:text-[#1C1917]"
              }`}
            >
              All Past Orders ({orders.length})
            </button>
          </div>

          <span className="text-[11px] text-[#78716C] hidden sm:inline">
            Syncs automatically with cloud kitchen dispatch
          </span>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 max-h-[75vh] overflow-y-auto space-y-6">
          {displayedOrders.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl border border-[#E7E0D8] p-8">
              <Package className="w-12 h-12 text-[#A8A29E] mx-auto mb-3" />
              <h3 className="font-serif text-lg font-bold text-[#1C1917]">
                No orders in this view
              </h3>
              <p className="text-xs text-[#78716C] mt-1">
                Your past orders and real-time live dispatches will appear here.
              </p>
            </div>
          ) : (
            displayedOrders.map((order) => {
              const currentStepIdx = getStepIndex(order.status);
              const assignedRider = riders.find((r) => r.id === order.riderId);

              return (
                <div
                  key={order.id}
                  className="bg-white rounded-3xl border border-[#E7E0D8] p-6 shadow-xs space-y-6"
                >
                  {/* Top Bar: Order ID, Type, Total, WhatsApp Badge */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#F5EFEB]">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-serif text-xl font-bold text-[#1C1917]">
                          #{order.id}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full bg-[#FED7AA]/60 text-[#9A3412] text-[10px] font-bold uppercase tracking-wider">
                          {order.orderType}
                        </span>
                        <span className="text-xs text-[#78716C]">
                          • Placed {order.createdAt}
                        </span>
                      </div>
                      <p className="text-xs text-[#78716C] mt-0.5">
                        {order.customerName} ({order.customerPhone})
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      {/* WhatsApp status badge */}
                      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium">
                        <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Updates on {order.customerPhone}</span>
                        <span className="text-[10px] uppercase font-bold text-emerald-700 bg-emerald-200/60 px-1.5 py-0.2 rounded-sm ml-1">
                          {order.whatsAppNotificationStatus}
                        </span>
                      </div>

                      <div className="text-right">
                        <span className="text-xs text-[#78716C] block">Total</span>
                        <span className="font-serif text-lg font-bold text-[#C2410C]">
                          ₹{order.total}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* 5-Step Visual Progress Bar */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-[#78716C]">
                        Live Kitchen Timeline
                      </span>

                      {/* Demo status simulation button */}
                      {order.status !== "Delivered" && (
                        <button
                          onClick={() => handleSimulateNextStep(order.id, order.status)}
                          className="flex items-center gap-1.5 text-xs font-semibold text-[#C2410C] hover:text-[#9A3412] bg-[#FFF7ED] px-3 py-1 rounded-full border border-orange-200"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Advance Step (Demo Live Simulation)</span>
                        </button>
                      )}
                    </div>

                    {/* Stepper Component */}
                    <div className="relative pt-2 pb-4">
                      {/* Progress Line */}
                      <div className="absolute top-6 left-6 right-6 h-1 bg-[#E7E0D8] -z-0">
                        <div
                          className="h-full bg-[#C2410C] transition-all duration-500"
                          style={{
                            width: `${(currentStepIdx / (STEPS.length - 1)) * 100}%`,
                          }}
                        />
                      </div>

                      {/* Step Nodes */}
                      <div className="relative z-10 flex items-center justify-between">
                        {STEPS.map((step, idx) => {
                          const isDone = idx < currentStepIdx;
                          const isCurrent = idx === currentStepIdx;

                          let circleClass = "bg-white border-2 border-[#E7E0D8] text-[#A8A29E]";
                          if (isDone) {
                            circleClass = "bg-[#C2410C] border-2 border-[#C2410C] text-white";
                          } else if (isCurrent) {
                            circleClass = "bg-[#FFF7ED] border-2 border-[#C2410C] text-[#C2410C] ring-4 ring-[#C2410C]/20 animate-pulse";
                          }

                          return (
                            <div key={step.status} className="flex flex-col items-center text-center">
                              <div
                                className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${circleClass}`}
                              >
                                {isDone ? (
                                  <CheckCircle2 className="w-5 h-5 text-white" />
                                ) : (
                                  step.icon
                                )}
                              </div>
                              <span
                                className={`text-[11px] font-medium mt-2 max-w-[80px] leading-tight ${
                                  isCurrent
                                    ? "text-[#C2410C] font-bold"
                                    : isDone
                                    ? "text-[#1C1917]"
                                    : "text-[#A8A29E]"
                                }`}
                              >
                                {step.label}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Rider / Delivery Card if Out for Delivery or Assigned */}
                  {order.orderType === "Delivery" && assignedRider && (
                    <div className="p-4 rounded-2xl bg-[#F5EFEB] border border-[#E7E0D8] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#1C1917] text-white flex items-center justify-center shrink-0">
                          <Bike className="w-5 h-5 text-[#FED7AA]" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-[#1C1917]">
                            {assignedRider.name}
                          </p>
                          <p className="text-[11px] text-[#78716C]">
                            {assignedRider.vehicle} • ★ {assignedRider.rating}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <a
                          href={`tel:${assignedRider.phone}`}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-[#E7E0D8] text-xs font-semibold text-[#1C1917] hover:border-[#C2410C]"
                        >
                          <Phone className="w-3.5 h-3.5 text-[#C2410C]" />
                          <span>Call Rider</span>
                        </a>

                        {order.address?.lat && (
                          <a
                            href={`https://www.google.com/maps/dir/?api=1&destination=${order.address.lat},${order.address.lng}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#1C1917] text-white text-xs font-semibold hover:bg-black"
                          >
                            <MapPin className="w-3.5 h-3.5 text-[#C2410C]" />
                            <span>Rider GPS Map</span>
                            <ArrowUpRight className="w-3 h-3 text-[#FED7AA]" />
                          </a>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Items Ordered List */}
                  <div className="bg-[#FAF8F5] p-4 rounded-2xl border border-[#E7E0D8] space-y-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#78716C] block">
                      Dishes in this order
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {order.items.map((item, i) => (
                        <div key={i} className="flex items-center justify-between text-xs py-1">
                          <span className="text-[#1C1917]">
                            <span className="font-bold text-[#C2410C] mr-1.5">{item.quantity}x</span>
                            {item.name}
                          </span>
                          <span className="font-semibold text-[#78716C]">
                            ₹{item.price * item.quantity}
                          </span>
                        </div>
                      ))}
                    </div>

                    {order.cookingNotes && (
                      <div className="pt-2 border-t border-[#E7E0D8] text-xs text-[#78716C]">
                        <span className="font-semibold text-[#1C1917]">Notes:</span> {order.cookingNotes}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
