"use client";

import React, { useState, useMemo } from "react";
import { useKitchen } from "@/context/KitchenContext";
import { Order, OrderStatus } from "@/types";
import {
  MapPin,
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
  X,
  XCircle,
  Filter,
  Bell,
  Copy,
} from "lucide-react";
import { OrderActionConfirmModal, OrderConfirmActionType } from "./OrderActionConfirmModal";
import { getGoogleMapsDirectionsUrl } from "@/lib/googleMaps";

export type BoardFilter = "All" | "New Order" | "Confirmed Order" | "In Road";

interface BoardFilterTab {
  id: BoardFilter;
  label: string;
}

const BOARD_FILTER_TABS: BoardFilterTab[] = [
  { id: "All", label: "All Active" },
  { id: "New Order", label: "New Order" },
  { id: "Confirmed Order", label: "Confirmed Order" },
  { id: "In Road", label: "In Road" },
];

const ORDER_UPDATE_OPTIONS: OrderStatus[] = [
  "Order Received",
  "Order Accepted",
  "In the Road",
  "Delivered",
  "Rejected",
];

export const getOrderStageRank = (status: OrderStatus): number => {
  // Strict arrangement:
  // 1: New Order (always stays first)
  // 2: Confirmed Order (stays second)
  // 3: In Road Order (stays third)
  if (status === "Order Received" || status === "Pending") return 1;
  if (status === "Order Status" || status === "Order Accepted" || status === "Preparing") return 2;
  if (status === "In the Road" || status === "Out for Delivery" || status === "Ready") return 3;
  return 4;
};

const KANBAN_STAGES: {
  id: BoardFilter;
  title: string;
  check: (status: OrderStatus) => boolean;
}[] = [
  {
    id: "New Order",
    title: "New Order",
    check: (s) => s === "Order Received" || s === "Pending",
  },
  {
    id: "Confirmed Order",
    title: "Confirmed Order",
    check: (s) => s === "Order Status" || s === "Order Accepted" || s === "Preparing",
  },
  {
    id: "In Road",
    title: "In Road",
    check: (s) => s === "In the Road" || s === "Out for Delivery" || s === "Ready",
  },
];

export function LiveOrdersBoard() {
  const {
    orders,
    updateOrderStatus,
    assignRider,
    sendRiderWhatsApp,
    retryWhatsApp,
    riders,
    adminOrderSearch,
    showToast,
  } = useKitchen();

  const [activeStatusFilter, setActiveStatusFilter] = useState<BoardFilter>("All");
  const [boardLayout, setBoardLayout] = useState<"kanban" | "list">("kanban");
  const [whatsAppPreviewOrder, setWhatsAppPreviewOrder] = useState<Order | null>(null);
  const [rejectingOrderId, setRejectingOrderId] = useState<string | null>(null);
  const [rejectionComment, setRejectionComment] = useState("out of stock");

  // Step-by-Step Action Confirmation Modal state (Accept, Assign Driver, Mark Delivered)
  const [confirmActionModal, setConfirmActionModal] = useState<{
    isOpen: boolean;
    action: OrderConfirmActionType | null;
    order: Order | null;
    riderId?: string;
    riderName?: string;
  }>({
    isOpen: false,
    action: null,
    order: null,
  });

  const handleExecuteConfirmedAction = () => {
    if (!confirmActionModal.order || !confirmActionModal.action) return;
    const { action, order, riderId, riderName } = confirmActionModal;

    if (action === "accept") {
      updateOrderStatus(order.id, "Order Accepted", undefined, true);
      showToast(`Order #${order.id} accepted! Moved to Confirmed Orders.`, "success");
    } else if (action === "assign") {
      if (riderId) {
        assignRider(order.id, riderId, true);
      }
      updateOrderStatus(order.id, "In the Road", undefined, true);
      sendRiderWhatsApp(order.id);
      showToast(
        `Order #${order.id} assigned to ${riderName || "Rider"} & dispatched to In Road!`,
        "success"
      );
    } else if (action === "deliver") {
      updateOrderStatus(order.id, "Delivered", undefined, true);
      showToast(
        `Order #${order.id} marked as delivered! Moved to Order History in Settings.`,
        "success"
      );
    }

    setConfirmActionModal({
      isOpen: false,
      action: null,
      order: null,
    });
  };

  // Live board displays active workflow orders ONLY, strictly arranged:
  // 1. New Order always stays first (FIFO: order that came first stays at the first)
  // 2. Confirmed Order stays second (FIFO: order that was accepted first stays at the first)
  // 3. In Road Order stays third (FIFO: order dispatched first stays at the first)
  // Changing an order's status automatically moves it to its new assigned position.
  const liveBoardOrders = useMemo(() => {
    return [...orders]
      .filter((o) => o.status !== "Delivered" && o.status !== "Rejected")
      .sort((a, b) => {
        const stageA = getOrderStageRank(a.status);
        const stageB = getOrderStageRank(b.status);

        if (stageA !== stageB) {
          return stageA - stageB;
        }

        // Within Stage 1 (New Order): order that came first will stay at the first (FIFO)
        if (stageA === 1) {
          const timeA = a.createdTimestamp ?? 0;
          const timeB = b.createdTimestamp ?? 0;
          if (timeA && timeB && timeA !== timeB) {
            return timeA - timeB; // earlier creation timestamp comes first
          }
          return a.id.localeCompare(b.id, undefined, { numeric: true });
        }

        // Within Stage 2 (Confirmed Order): order that was accepted first will stay at the first (FIFO)
        if (stageA === 2) {
          const timeA = a.acceptedTimestamp ?? a.createdTimestamp ?? 0;
          const timeB = b.acceptedTimestamp ?? b.createdTimestamp ?? 0;
          if (timeA && timeB && timeA !== timeB) {
            return timeA - timeB; // earlier acceptance timestamp comes first
          }
          return a.id.localeCompare(b.id, undefined, { numeric: true });
        }

        // Within Stage 3 (In Road): order dispatched first stays at the first (FIFO)
        if (stageA === 3) {
          const timeA = a.inRoadTimestamp ?? a.acceptedTimestamp ?? a.createdTimestamp ?? 0;
          const timeB = b.inRoadTimestamp ?? b.acceptedTimestamp ?? b.createdTimestamp ?? 0;
          if (timeA && timeB && timeA !== timeB) {
            return timeA - timeB;
          }
          return a.id.localeCompare(b.id, undefined, { numeric: true });
        }

        return a.id.localeCompare(b.id, undefined, { numeric: true });
      });
  }, [orders]);

  const isMatchingFilter = (status: OrderStatus, filter: BoardFilter): boolean => {
    switch (filter) {
      case "All":
        return status !== "Delivered" && status !== "Rejected";
      case "New Order":
        return status === "Order Received" || status === "Pending";
      case "Confirmed Order":
        return (
          status === "Order Status" ||
          status === "Order Accepted" ||
          status === "Preparing"
        );
      case "In Road":
        return (
          status === "In the Road" ||
          status === "Out for Delivery" ||
          status === "Ready"
        );
      default:
        return true;
    }
  };

  const filteredOrders = useMemo(() => {
    return liveBoardOrders.filter((o) => {
      const matchesStatus = isMatchingFilter(o.status, activeStatusFilter);
      if (!matchesStatus) return false;

      if (!adminOrderSearch?.trim()) return true;
      const q = adminOrderSearch.toLowerCase().trim();
      const idMatch = o.id.toLowerCase().includes(q);
      const nameMatch = o.customerName.toLowerCase().includes(q);
      const phoneMatch = o.customerPhone.toLowerCase().includes(q);
      const itemMatch = o.items.some((i) => i.name.toLowerCase().includes(q));
      const streetMatch = o.address?.street?.toLowerCase().includes(q);
      const houseMatch = o.address?.house?.toLowerCase().includes(q);
      return (
        idMatch ||
        nameMatch ||
        phoneMatch ||
        itemMatch ||
        Boolean(streetMatch) ||
        Boolean(houseMatch)
      );
    });
  }, [liveBoardOrders, activeStatusFilter, adminOrderSearch]);

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case "Order Received":
      case "Pending":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "Order Status":
      case "Order Accepted":
      case "Preparing":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "In the Road":
      case "Ready":
      case "Out for Delivery":
        return "bg-orange-100 text-[#C2410C] border-orange-200";
      case "Delivered":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "Rejected":
        return "bg-rose-100 text-rose-800 border-rose-200";
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
          label: "Dispatched",
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
          label: "Acknowledged",
        };
      case "Failed":
        return {
          color: "bg-rose-50 text-rose-700 border-rose-200",
          icon: <AlertCircle className="w-3 h-3" />,
          label: "Failed",
        };
      default:
        return {
          color: "bg-orange-50 text-[#C2410C] border-orange-200",
          icon: <Bell className="w-3 h-3" />,
          label: status,
        };
    }
  };

  const renderOrderCard = (order: Order, queueIdx?: number) => {
    const wa = getWhatsAppBadge(order);
    const googleMapsUrl = order.address
      ? getGoogleMapsDirectionsUrl(order.address)
      : undefined;

    const isNew = order.status === "Order Received" || order.status === "Pending";
    const isConfirmed =
      order.status === "Order Status" ||
      order.status === "Order Accepted" ||
      order.status === "Preparing";
    const isInRoad =
      order.status === "In the Road" ||
      order.status === "Out for Delivery" ||
      order.status === "Ready";

    // 1. New order: green color transparent card
    // 2. Confirmed order: yellow card
    // 3. In road order: small bike icon at the top of the card
    const cardBgClasses = isNew
      ? "bg-emerald-500/10 border-emerald-500/35 backdrop-blur-xs ring-1 ring-emerald-500/20 shadow-xs hover:border-emerald-600 hover:shadow-md"
      : isConfirmed
      ? "bg-yellow-50/90 border-yellow-300 ring-1 ring-yellow-400/20 shadow-xs hover:border-yellow-500 hover:shadow-md"
      : "bg-white border-orange-200/90 ring-1 ring-orange-300/20 shadow-xs hover:border-orange-400 hover:shadow-md";

    return (
      <div
        key={order.id}
        className={`rounded-3xl border p-5 transition-all space-y-4 flex flex-col justify-between ${cardBgClasses}`}
      >
        {/* Top Header */}
        <div>
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-serif text-lg font-bold text-[#1C1917]">
                #{order.id}
              </span>
              <span
                className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border ${
                  isNew
                    ? "bg-emerald-500/20 text-emerald-900 border-emerald-500/40 font-bold"
                    : isConfirmed
                    ? "bg-yellow-200/80 text-yellow-950 border-yellow-300 font-bold"
                    : isInRoad
                    ? "bg-orange-100 text-[#C2410C] border-orange-200 font-bold"
                    : getStatusBadge(order.status)
                }`}
              >
                {isNew
                  ? "New Order"
                  : isConfirmed
                  ? "Confirmed Order"
                  : isInRoad
                  ? "In Road"
                  : order.status}
              </span>

              {/* Priority badge for New Orders (Queue #1 Arrived 1st) and Confirmed Orders (Prep #1 Deliver 1st) */}
              {isNew && queueIdx !== undefined && (
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shadow-2xs ${
                    queueIdx === 0
                      ? "bg-emerald-600 text-white border-emerald-700"
                      : "bg-white text-emerald-900 border-emerald-300"
                  }`}
                  title={queueIdx === 0 ? "First order arrived - attend to first" : `Position #${queueIdx + 1} in queue`}
                >
                  {queueIdx === 0 ? "★ Arrived 1st" : `Queue #${queueIdx + 1}`}
                </span>
              )}

              {isConfirmed && queueIdx !== undefined && (
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shadow-2xs ${
                    queueIdx === 0
                      ? "bg-amber-600 text-white border-amber-700"
                      : "bg-white text-amber-900 border-amber-300"
                  }`}
                  title={queueIdx === 0 ? "Accepted first - deliver next to customer on time" : `Prep Priority #${queueIdx + 1}`}
                >
                  {queueIdx === 0 ? "★ Deliver 1st" : `Prep #${queueIdx + 1}`}
                </span>
              )}

              {/* Small bike icon at the top of card for In Road order */}
              {isInRoad && (
                <span
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-orange-100 text-[#C2410C] border border-orange-200 text-[10px] font-bold shadow-2xs animate-pulse"
                  title="On the road with rider"
                >
                  <Bike className="w-3.5 h-3.5 text-[#C2410C]" />
                  <span>On Road</span>
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {isInRoad && (
                <div
                  className="w-7 h-7 rounded-xl bg-orange-100 text-[#C2410C] border border-orange-300 flex items-center justify-center shrink-0 shadow-2xs"
                  title="Out for delivery"
                >
                  <Bike className="w-4 h-4 text-[#C2410C]" />
                </div>
              )}
              <span className="text-[11px] font-medium text-[#78716C] flex items-center gap-1">
                <Clock className="w-3 h-3 text-[#A8A29E]" />
                {order.createdAt}
              </span>
            </div>
          </div>

          {/* Rejection notice if order was rejected */}
          {order.status === "Rejected" && (
            <div className="mb-3 p-3 bg-rose-50 border border-rose-200 rounded-2xl space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-rose-800">
                <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>Order Rejected due to {order.rejectionReason || "out of stock"}</span>
              </div>
              <p className="text-[11px] text-rose-700">
                Customer notified: "Order rejected due to {order.rejectionReason || "out of stock"}". Final state recorded in order history.
              </p>
            </div>
          )}

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

        {/* Bottom Actions: Streamlined per-stage controls */}
        <div className="pt-3 border-t border-[#F5EFEB] space-y-3">
          {/* Stage 1: New Order (Green card) - Kitchen Decision Only */}
          {isNew && (
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setConfirmActionModal({
                      isOpen: true,
                      action: "accept",
                      order,
                    });
                  }}
                  className="w-full py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Accept Order</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setRejectingOrderId(order.id);
                    setRejectionComment("out of stock");
                  }}
                  className="w-full py-2.5 px-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Reject Order</span>
                </button>
              </div>
            </div>
          )}

          {/* Stage 2: Confirmed Order (Yellow card) - Assign Delivery Rider & Assign Button */}
          {isConfirmed && (
            <div className="space-y-2">
              {order.orderType === "Delivery" ? (
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#78716C] mb-1">
                    Assign Delivery Rider
                  </label>
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <select
                        value={order.riderId || ""}
                        onChange={(e) => assignRider(order.id, e.target.value, true)}
                        className="w-full px-3 py-2.5 rounded-xl border border-yellow-300 bg-white text-xs font-semibold text-[#1C1917] appearance-none focus:outline-hidden focus:border-[#C2410C]"
                      >
                        <option value="">-- Select Rider --</option>
                        {riders.map((r) => (
                          <option key={r.id} value={r.id}>
                            {r.name} ({r.vehicle.split(" ")[0]})
                          </option>
                        ))}
                      </select>
                      <Bike className="w-3.5 h-3.5 text-[#78716C] absolute right-3 top-3.5 pointer-events-none" />
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        const riderIdToAssign =
                          order.riderId || (riders.length > 0 ? riders[0].id : "");
                        if (!riderIdToAssign) {
                          showToast("Please select a delivery rider first.", "warning");
                          return;
                        }
                        const riderObj = riders.find((r) => r.id === riderIdToAssign);
                        setConfirmActionModal({
                          isOpen: true,
                          action: "assign",
                          order,
                          riderId: riderIdToAssign,
                          riderName: riderObj?.name || "Rider",
                        });
                      }}
                      className="px-4 py-2.5 rounded-xl bg-[#C2410C] hover:bg-[#9A3412] text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-2xs transition-colors shrink-0 cursor-pointer"
                    >
                      <Bike className="w-3.5 h-3.5" />
                      <span>Assign</span>
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    updateOrderStatus(order.id, "In the Road", undefined, true);
                    showToast(
                      `Order #${order.id} (${order.orderType}) marked ready for pickup!`,
                      "success"
                    );
                  }}
                  className="w-full py-2.5 px-3 rounded-xl bg-[#C2410C] hover:bg-[#9A3412] text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Mark Ready ({order.orderType})</span>
                </button>
              )}
            </div>
          )}

          {/* Stage 3: In Road (Bike icon card) - Mark as Delivered + WhatsApp Action */}
          {isInRoad && (
            <div className="space-y-3">
              <button
                type="button"
                onClick={() => {
                  setConfirmActionModal({
                    isOpen: true,
                    action: "deliver",
                    order,
                  });
                }}
                className="w-full py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Mark as Delivered</span>
              </button>

              {/* Notification Dispatch & Status Log Indicator */}
              <div className="pt-1 flex items-center justify-between gap-2">
                <div
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${wa.color}`}
                  title="Notification dispatch status"
                >
                  {wa.icon}
                  <span>{wa.label}</span>
                  {order.whatsAppNotificationStatus === "Failed" && (
                    <button
                      onClick={() => retryWhatsApp(order.id)}
                      className="ml-1 text-[10px] underline hover:text-black flex items-center gap-0.5"
                      title="Retry notification"
                    >
                      <RotateCcw className="w-2.5 h-2.5" /> Retry
                    </button>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    sendRiderWhatsApp(order.id);
                    setWhatsAppPreviewOrder(order);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#C2410C] hover:bg-[#9A3412] text-white text-xs font-semibold shadow-2xs transition-colors shrink-0 cursor-pointer"
                  title="Dispatch Notification to Driver & Customer"
                >
                  <Bell className="w-3.5 h-3.5" />
                  <span>Dispatch Alert</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Board Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 sm:p-4 rounded-3xl border border-[#E7E0D8]">
        {/* MOBILE FILTER DROPDOWN (Shown on phones < sm, hidden on desktop / Windows) */}
        <div className="sm:hidden w-full">
          <label
            htmlFor="mobile-status-filter"
            className="flex items-center gap-1.5 text-[11px] font-bold text-[#78716C] uppercase tracking-wider mb-1.5"
          >
            <Filter className="w-3.5 h-3.5 text-[#C2410C]" />
            <span>Filter Live Orders</span>
          </label>
          <div className="relative">
            <select
              id="mobile-status-filter"
              value={activeStatusFilter}
              onChange={(e) => setActiveStatusFilter(e.target.value as BoardFilter)}
              className="w-full appearance-none bg-[#FAF8F5] border border-[#E7E0D8] rounded-2xl px-4 py-3 text-xs font-bold text-[#1C1917] focus:outline-hidden focus:border-[#C2410C] focus:bg-white shadow-2xs pr-10 cursor-pointer"
            >
              {BOARD_FILTER_TABS.map((tab) => {
                const count =
                  tab.id === "All"
                    ? liveBoardOrders.length
                    : liveBoardOrders.filter((o) => isMatchingFilter(o.status, tab.id)).length;
                return (
                  <option key={tab.id} value={tab.id}>
                    {tab.label} ({count} orders)
                  </option>
                );
              })}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3.5 text-[#78716C]">
              <ChevronDown className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* DESKTOP / WINDOWS STATUS FILTER PILLS (Hidden on mobile phones, shown on Windows / desktop) */}
        <div className="hidden sm:flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {BOARD_FILTER_TABS.map((tab) => {
            const count =
              tab.id === "All"
                ? liveBoardOrders.length
                : liveBoardOrders.filter((o) => isMatchingFilter(o.status, tab.id)).length;
            const isSelected = activeStatusFilter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveStatusFilter(tab.id)}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all shrink-0 cursor-pointer ${
                  isSelected
                    ? "bg-[#C2410C] text-white shadow-2xs"
                    : "bg-[#F5EFEB] text-[#78716C] hover:text-[#1C1917]"
                }`}
              >
                <span>{tab.label}</span>
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

        {/* VIEW LAYOUT TOGGLE (Hidden on mobile phones, preserved strictly for Windows / Desktop) */}
        <div className="hidden sm:flex items-center gap-2 shrink-0">
          <span className="text-xs text-[#78716C] font-medium hidden md:inline">Layout:</span>
          <div className="flex bg-[#F5EFEB] p-1 rounded-xl border border-[#E7E0D8]">
            <button
              onClick={() => setBoardLayout("kanban")}
              className={`p-1.5 rounded-lg text-xs flex items-center gap-1 cursor-pointer ${
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
              className={`p-1.5 rounded-lg text-xs flex items-center gap-1 cursor-pointer ${
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

      {/* Kanban Column View (3 Stages: New Order, Confirmed Order, In Road) */}
      {boardLayout === "kanban" && activeStatusFilter === "All" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 overflow-x-auto pb-4">
          {KANBAN_STAGES.map((stage) => {
            const columnOrders = liveBoardOrders.filter((o) => stage.check(o.status));
            return (
              <div
                key={stage.id}
                className="bg-[#F5EFEB]/70 rounded-3xl p-4 border border-[#E7E0D8] flex flex-col space-y-4 min-w-[260px]"
              >
                {/* Column Header */}
                <div className="flex items-center justify-between pb-2 border-b border-[#E7E0D8]">
                  <div className="flex items-center gap-2">
                    <span className="font-serif text-sm font-bold text-[#1C1917]">
                      {stage.title}
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
                      No orders currently in {stage.title.toLowerCase()}
                    </div>
                  ) : (
                    columnOrders.map((order, idx) => renderOrderCard(order, idx))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : activeStatusFilter === "All" ? (
        /* Grid View with Stages Grouping (New Order -> Confirmed Order -> In Road) */
        <div className="space-y-8">
          {filteredOrders.length === 0 ? (
            <div className="col-span-full text-center py-16 bg-white rounded-3xl border border-[#E7E0D8]">
              <p className="font-serif text-lg text-[#1C1917] font-bold">
                No orders match your search criteria
              </p>
            </div>
          ) : (
            KANBAN_STAGES.map((stage) => {
              const stageOrders = filteredOrders.filter((o) => stage.check(o.status));
              if (stageOrders.length === 0) return null;
              return (
                <div key={stage.id} className="space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-[#E7E0D8]">
                    <div className="flex items-center gap-2">
                      <span className="font-serif text-base font-bold text-[#1C1917]">
                        {stage.title}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full bg-white text-xs font-bold text-[#78716C] border border-[#E7E0D8]">
                        {stageOrders.length}
                      </span>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {stageOrders.map((order, idx) => renderOrderCard(order, idx))}
                  </div>
                </div>
              );
            })
          )}
        </div>
      ) : (
        /* Filtered View (Specific status tab selected) */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredOrders.length === 0 ? (
            <div className="col-span-full text-center py-16 bg-white rounded-3xl border border-[#E7E0D8]">
              <p className="font-serif text-lg text-[#1C1917] font-bold">
                No orders match this status filter
              </p>
            </div>
          ) : (
            filteredOrders.map((order, idx) => renderOrderCard(order, idx))
          )}
        </div>
      )}

      {/* WhatsApp Message Dispatch Modal Preview */}
      {whatsAppPreviewOrder && (() => {
        const assignedRider = riders.find((r) => r.id === whatsAppPreviewOrder.riderId);
        const riderPhone = assignedRider?.phone || "";
        const deliveryAddress = whatsAppPreviewOrder.address
          ? `${whatsAppPreviewOrder.address.house ? `${whatsAppPreviewOrder.address.house}, ` : ""}${
              whatsAppPreviewOrder.address.street || ""
            }${whatsAppPreviewOrder.address.landmark ? `, Near ${whatsAppPreviewOrder.address.landmark}` : ""}`.trim()
          : "Greater Noida";

        // 1. Driver Task Text (Exact format requested)
        const driverTaskMsg = `Pending delivery - Location: ${deliveryAddress} - Order No: #${whatsAppPreviewOrder.id} - Name: ${whatsAppPreviewOrder.customerName} - Amount: ₹${whatsAppPreviewOrder.total}`;

        // 2. Customer Alert Text (Exact format requested)
        const customerAlertMsg = `Your order is out for delivery - Order ID: #${whatsAppPreviewOrder.id} - Amount: ₹${whatsAppPreviewOrder.total}${
          assignedRider?.name ? ` (Driver: ${assignedRider.name})` : ""
        }`;

        return (
          <div
            onClick={(e) => {
              if (e.target === e.currentTarget) setWhatsAppPreviewOrder(null);
            }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overscroll-contain animate-in fade-in"
          >
            <div className="bg-[#FAF8F5] rounded-3xl border border-[#E7E0D8] max-w-lg w-full p-6 shadow-2xl space-y-4 overscroll-contain">
              <div className="flex items-center justify-between border-b border-[#E7E0D8] pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-[#C2410C] text-white flex items-center justify-center">
                    <Bell className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-serif text-base font-bold text-[#1C1917]">
                      Order #{whatsAppPreviewOrder.id} Dispatch Notification
                    </h4>
                    <p className="text-[10px] text-[#78716C]">
                      Driver: {assignedRider?.name || "Assigned Driver"} ({riderPhone || "No Phone"})
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

              {/* Driver Message Card */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-bold text-[#1C1917]">
                  <span className="flex items-center gap-1.5">
                    <Bike className="w-3.5 h-3.5 text-[#C2410C]" />
                    <span>Notification to Driver:</span>
                  </span>
                  {riderPhone && (
                    <a
                      href={`sms:${riderPhone.replace(/\D/g, "")}`}
                      className="text-[11px] text-[#C2410C] hover:underline font-bold flex items-center gap-1"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>Send SMS to Driver</span>
                    </a>
                  )}
                </div>
                <div className="bg-[#1C1917] text-[#FAF8F5] p-3.5 rounded-2xl text-xs font-mono leading-relaxed border border-[#44403C]">
                  {driverTaskMsg}
                </div>
              </div>

              {/* Customer Message Card */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-bold text-[#1C1917]">
                  <span className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-[#C2410C]" />
                    <span>Notification to Customer:</span>
                  </span>
                  {whatsAppPreviewOrder.customerPhone && (
                    <a
                      href={`sms:${whatsAppPreviewOrder.customerPhone.replace(/\D/g, "")}`}
                      className="text-[11px] text-[#C2410C] hover:underline font-bold flex items-center gap-1"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>Send SMS to Customer</span>
                    </a>
                  )}
                </div>
                <div className="bg-[#292524] text-[#FAF8F5] p-3.5 rounded-2xl text-xs font-mono leading-relaxed border border-[#44403C]">
                  {customerAlertMsg}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    sendRiderWhatsApp(whatsAppPreviewOrder.id);
                    setWhatsAppPreviewOrder(null);
                  }}
                  className="py-3 px-3 rounded-xl bg-[#C2410C] hover:bg-[#9A3412] text-white text-xs font-bold shadow-md transition-all active:scale-98 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Re-dispatch Alert</span>
                </button>
                <button
                  type="button"
                  onClick={() => setWhatsAppPreviewOrder(null)}
                  className="py-3 px-3 rounded-xl bg-[#FAF8F5] hover:bg-[#F5EFEB] border border-[#E7E0D8] text-[#1C1917] text-xs font-bold transition-colors cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Admin Reject Order with Comment Modal */}
      {rejectingOrderId && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setRejectingOrderId(null);
          }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overscroll-contain animate-in fade-in"
        >
          <div className="bg-[#FAF8F5] rounded-3xl border border-[#E7E0D8] max-w-md w-full p-6 shadow-2xl space-y-4 overscroll-contain">
            <div className="flex items-center justify-between border-b border-[#E7E0D8] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center">
                  <XCircle className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-serif text-base font-bold text-[#1C1917]">
                    Reject Order #{rejectingOrderId}
                  </h4>
                  <p className="text-[10px] text-[#78716C]">
                    Add a reason for the customer
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setRejectingOrderId(null)}
                className="w-7 h-7 rounded-full bg-white border border-[#E7E0D8] flex items-center justify-center text-[#78716C] hover:text-[#1C1917]"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3">
              <label className="block text-xs font-semibold text-[#1C1917]">
                Rejection Comment / Reason:
              </label>

              {/* Quick Preset Buttons */}
              <div className="flex flex-wrap gap-1.5">
                {[
                  "out of stock",
                  "ingredient unavailable",
                  "kitchen overloaded",
                  "delivery address unreachable",
                ].map((reason) => (
                  <button
                    key={reason}
                    type="button"
                    onClick={() => setRejectionComment(reason)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all ${
                      rejectionComment.toLowerCase() === reason
                        ? "bg-rose-600 text-white border-rose-600 shadow-2xs"
                        : "bg-white text-[#78716C] border-[#E7E0D8] hover:border-rose-400"
                    }`}
                  >
                    {reason}
                  </button>
                ))}
              </div>

              {/* Editable Comment Input */}
              <input
                type="text"
                value={rejectionComment}
                onChange={(e) => setRejectionComment(e.target.value)}
                placeholder="e.g. out of stock"
                className="w-full px-4 py-2.5 rounded-xl border border-[#E7E0D8] bg-white text-xs font-semibold text-[#1C1917] focus:outline-hidden focus:border-rose-600"
              />

              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs space-y-1">
                <p className="font-bold text-rose-900">
                  Customer will see:
                </p>
                <p className="text-rose-700 italic">
                  &ldquo;Order rejected due to {rejectionComment.trim() || "out of stock"}&rdquo;
                </p>
                <p className="text-[10px] text-rose-600 pt-0.5">
                  This will be the final status and the order will move directly to order history.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E7E0D8]">
              <button
                type="button"
                onClick={() => setRejectingOrderId(null)}
                className="px-4 py-2 rounded-xl bg-white border border-[#E7E0D8] text-xs font-semibold text-[#78716C] hover:bg-[#F5EFEB] transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  const finalComment = rejectionComment.trim() || "out of stock";
                  updateOrderStatus(rejectingOrderId, "Rejected", finalComment, true);
                  const rejectedId = rejectingOrderId;
                  setRejectingOrderId(null);
                  showToast(
                    `Order #${rejectedId} rejected. Archived to Order History under Settings.`,
                    "info"
                  );
                }}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5"
              >
                <XCircle className="w-3.5 h-3.5" />
                <span>Confirm Reject Order</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3-Step Action Confirmation Modal: Accept, Assign Driver, Mark as Delivered */}
      <OrderActionConfirmModal
        isOpen={confirmActionModal.isOpen}
        action={confirmActionModal.action}
        order={confirmActionModal.order}
        riderName={confirmActionModal.riderName}
        onConfirm={handleExecuteConfirmedAction}
        onCancel={() =>
          setConfirmActionModal({
            isOpen: false,
            action: null,
            order: null,
          })
        }
      />
    </div>
  );
}
