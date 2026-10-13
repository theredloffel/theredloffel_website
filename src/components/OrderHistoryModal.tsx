"use client";

import React, { useState } from "react";
import { useKitchen } from "@/context/KitchenContext";
import { OrderStatus } from "@/types";
import { X, Clock, CheckCircle2, Bike, ChefHat, Package, CheckCheck, MessageSquare, ChevronRight, Sparkles, Phone, XCircle } from "lucide-react";

const STEPS: { status: OrderStatus; label: string; icon: React.ReactNode }[] = [
  { status: "Order Received", label: "Order Received", icon: <Clock className="w-4 h-4" /> },
  { status: "Order Accepted", label: "Order Accepted", icon: <ChefHat className="w-4 h-4" /> },
  { status: "In the Road", label: "In the Road", icon: <Bike className="w-4 h-4" /> },
  { status: "Delivered", label: "Delivered", icon: <CheckCheck className="w-4 h-4" /> },
];

export function OrderHistoryModal() {
  const {
    isOrderHistoryOpen,
    setIsOrderHistoryOpen,
    orders,
    userOrders,
    selectedTrackingOrderId,
    setSelectedTrackingOrderId,
    updateOrderStatus,
    riders,
    user,
    setIsAuthOpen,
  } = useKitchen();

  const [activeTab, setActiveTab] = useState<"completed" | "all">("completed");

  if (!isOrderHistoryOpen) return null;

  if (!user.isLoggedIn) {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
        onClick={() => {
          setSelectedTrackingOrderId(null);
          setIsOrderHistoryOpen(false);
        }}
      >
        <div
          className="relative w-full max-w-sm bg-[#FAF8F5] rounded-3xl p-6 sm:p-8 shadow-2xl border border-[#E7E0D8] text-center"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => {
              setSelectedTrackingOrderId(null);
              setIsOrderHistoryOpen(false);
            }}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-stone-200 transition-colors"
          >
            <X className="w-5 h-5 text-stone-600" />
          </button>
          <div className="w-14 h-14 rounded-full bg-[#FED7AA]/50 text-[#C2410C] flex items-center justify-center mx-auto mb-3">
            <Package className="w-7 h-7" />
          </div>
          <h3 className="font-serif text-xl font-bold text-[#1C1917]">Please Sign In</h3>
          <p className="text-xs text-[#78716C] mt-2 mb-6">
            Log in with your mobile number to view active order status and past orders.
          </p>
          <button
            onClick={() => {
              setIsOrderHistoryOpen(false);
              setIsAuthOpen(true);
            }}
            className="w-full py-3.5 px-4 rounded-2xl bg-[#C2410C] hover:bg-[#9A3412] text-white font-bold text-sm shadow-md"
          >
            Sign In with Mobile
          </button>
        </div>
      </div>
    );
  }

  const activeOrders = userOrders.filter((o) => o.status !== "Delivered" && o.status !== "Rejected");
  const pastOrders = userOrders.filter((o) => o.status === "Delivered" || o.status === "Rejected");

  const singleOrder = selectedTrackingOrderId
    ? userOrders.find((o) => o.id === selectedTrackingOrderId) || null
    : null;

  const displayedOrders = singleOrder
    ? [singleOrder]
    : activeTab === "completed"
    ? pastOrders
    : userOrders;

  const getStepIndex = (status: OrderStatus | string) => {
    if (status === "Order Received" || status === "Pending") return 0;
    if (status === "Order Status" || status === "Order Accepted" || status === "Preparing") return 1;
    if (status === "In the Road" || status === "Ready" || status === "Out for Delivery") return 2;
    if (status === "Delivered") return 3;
    return 0;
  };

  const handleClose = () => {
    setSelectedTrackingOrderId(null);
    setIsOrderHistoryOpen(false);
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto overscroll-contain animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-4xl bg-[#FAF8F5] rounded-3xl border border-[#E7E0D8] shadow-2xl overflow-hidden my-6 overscroll-contain">
        {/* Header */}
        <div className="p-6 border-b border-[#E7E0D8] bg-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
              singleOrder?.status === "Rejected"
                ? "bg-rose-100 text-rose-600"
                : "bg-[#FED7AA]/60 text-[#C2410C]"
            }`}>
              {singleOrder?.status === "Rejected" ? (
                <XCircle className="w-5 h-5" />
              ) : (
                <Clock className="w-5 h-5" />
              )}
            </div>
            <div>
              <h2 className="font-serif text-2xl font-bold text-[#1C1917]">
                {singleOrder
                  ? singleOrder.status === "Rejected"
                    ? `Order Rejected • #${singleOrder.id}`
                    : `Live Order Status • #${singleOrder.id}`
                  : "Order History"}
              </h2>
              <p className="text-xs text-[#78716C]">
                {singleOrder
                  ? singleOrder.status === "Rejected"
                    ? `Order rejected due to ${singleOrder.rejectionReason || "out of stock"} • For any help, please convey on WhatsApp`
                    : `Current Status: ${singleOrder.status} • For any help, please convey on WhatsApp`
                  : "Completed orders and dispatch history from The Red Löffel Kitchen"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {singleOrder && (
              <button
                type="button"
                onClick={() => setSelectedTrackingOrderId(null)}
                className="text-xs text-[#C2410C] hover:underline font-semibold px-2 py-1 mr-2 hidden sm:inline-block"
              >
                View Full History →
              </button>
            )}
            <button
              onClick={handleClose}
              className="w-8 h-8 rounded-full border border-[#E7E0D8] bg-[#F5EFEB] flex items-center justify-center text-[#78716C] hover:text-[#1C1917]"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab switch (only shown when in full Order History view, NOT single order view) */}
        {!singleOrder && (
          <div className="px-6 pt-4 bg-[#F5EFEB] border-b border-[#E7E0D8] flex items-center justify-between">
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab("completed")}
                className={`px-4 py-2 rounded-t-xl text-xs font-semibold transition-all ${
                  activeTab === "completed"
                    ? "bg-[#FAF8F5] text-[#C2410C] border-t-2 border-[#C2410C]"
                    : "text-[#78716C] hover:text-[#1C1917]"
                }`}
              >
                Order History ({pastOrders.length})
              </button>
              <button
                onClick={() => setActiveTab("all")}
                className={`px-4 py-2 rounded-t-xl text-xs font-semibold transition-all ${
                  activeTab === "all"
                    ? "bg-[#FAF8F5] text-[#C2410C] border-t-2 border-[#C2410C]"
                    : "text-[#78716C] hover:text-[#1C1917]"
                }`}
              >
                All Orders ({userOrders.length})
              </button>
            </div>

            <span className="text-[11px] text-[#78716C] hidden sm:inline">
              Automatically saved upon completion by kitchen
            </span>
          </div>
        )}

        {/* Content Body */}
        <div className="p-6 sm:p-8 max-h-[75vh] overflow-y-auto overscroll-contain space-y-6">
          {displayedOrders.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl border border-[#E7E0D8] p-8">
              <Package className="w-12 h-12 text-[#A8A29E] mx-auto mb-3" />
              <h3 className="font-serif text-lg font-bold text-[#1C1917]">
                No orders yet
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
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          order.status === "Rejected"
                            ? "bg-rose-100 text-rose-700 border border-rose-200"
                            : "bg-[#FED7AA]/60 text-[#9A3412]"
                        }`}>
                          {order.status === "Rejected"
                            ? `Rejected: ${order.rejectionReason || "out of stock"}`
                            : order.orderType}
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

                  {/* Visual Progress Bar or Rejection Final State */}
                  {order.status === "Rejected" ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-rose-700">
                          Order Status: Terminal
                        </span>
                        <span className="px-3 py-1 rounded-full bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold flex items-center gap-1">
                          <XCircle className="w-3.5 h-3.5" />
                          Order Rejected
                        </span>
                      </div>

                      {/* 2-Step Terminal Progress: Order Received -> Order Rejected */}
                      <div className="relative pt-2 pb-3">
                        <div className="grid grid-cols-2 gap-0 relative">
                          {/* Segment connector */}
                          <div className="absolute top-5 left-1/4 right-1/4 h-1 -translate-y-1/2 z-0">
                            <div className="w-full h-full bg-rose-500 rounded-full" />
                          </div>

                          <div className="relative flex flex-col items-center text-center px-1 z-10">
                            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-emerald-600 text-white border-2 border-emerald-600">
                              <CheckCircle2 className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-[11px] sm:text-xs font-medium mt-2 text-[#1C1917]">
                              Order Received
                            </span>
                          </div>

                          <div className="relative flex flex-col items-center text-center px-1 z-10">
                            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-rose-600 text-white border-2 border-rose-600 ring-4 ring-rose-600/20">
                              <XCircle className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-[11px] sm:text-xs font-bold mt-2 text-rose-600">
                              Order Rejected (Final)
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Explicit Rejection Message */}
                      <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-3">
                        <div className="w-9 h-9 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 shrink-0 mt-0.5">
                          <XCircle className="w-5 h-5" />
                        </div>
                        <div className="space-y-1">
                          <h4 className="text-sm font-bold text-rose-900">
                            Order rejected due to {order.rejectionReason || "out of stock"}
                          </h4>
                          <p className="text-xs text-rose-700 leading-relaxed">
                            The kitchen could not fulfill your order due to {order.rejectionReason || "out of stock"}. This is the final status and the order has been archived to your order history.
                          </p>
                          <p className="text-[11px] font-medium text-rose-600 pt-0.5">
                            For any help, please convey on WhatsApp.
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-[#78716C]">
                          Live Kitchen Timeline
                        </span>
                      </div>

                      {/* Stepper Component (Grid-centered alignment for circles, connectors, and labels) */}
                      <div className="relative pt-2 pb-3">
                        <div className="grid grid-cols-4 gap-0 relative">
                          {STEPS.map((step, idx) => {
                            const isDone = idx < currentStepIdx;
                            const isCurrent = idx === currentStepIdx;

                            let circleClass = "bg-white border-2 border-[#E7E0D8] text-[#A8A29E]";
                            if (isDone) {
                              circleClass = "bg-[#C2410C] border-2 border-[#C2410C] text-white shadow-xs";
                            } else if (isCurrent) {
                              circleClass =
                                "bg-[#FFF7ED] border-2 border-[#C2410C] text-[#C2410C] ring-4 ring-[#C2410C]/20 animate-pulse shadow-sm";
                            }

                            return (
                              <div
                                key={step.status}
                                className="relative flex flex-col items-center text-center px-0.5 sm:px-1"
                              >
                                {/* Connector line to the next step node */}
                                {idx < STEPS.length - 1 && (
                                  <div className="absolute top-5 left-1/2 w-full h-1 -translate-y-1/2 z-0">
                                    <div className="w-full h-full bg-[#E7E0D8] rounded-full overflow-hidden">
                                      <div
                                        className={`h-full bg-[#C2410C] transition-all duration-500 ${
                                          idx < currentStepIdx ? "w-full" : "w-0"
                                        }`}
                                      />
                                    </div>
                                  </div>
                                )}

                                {/* Step Circle Node */}
                                <div
                                  className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center transition-all ${circleClass}`}
                                >
                                  {isDone ? (
                                    <CheckCircle2 className="w-5 h-5 text-white" />
                                  ) : (
                                    step.icon
                                  )}
                                </div>

                                {/* Step Label */}
                                <span
                                  className={`text-[11px] sm:text-xs font-medium mt-2 leading-tight text-center max-w-[85px] ${
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
                  )}

                  {/* Rider / Delivery Card if Out for Delivery or Assigned */}
                  {order.orderType === "Delivery" && assignedRider && order.status !== "Rejected" && (
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

                  {/* WhatsApp Support & Help Notice */}
                  <div className="p-3.5 rounded-2xl bg-emerald-50/90 border border-emerald-200 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                      <MessageSquare className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-emerald-950">
                        Need any help with your order?
                      </p>
                      <p className="text-[11px] text-emerald-700">
                        For any help, please convey on WhatsApp. We are live and ready to assist you!
                      </p>
                    </div>
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
