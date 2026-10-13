"use client";

import React, { useState, useMemo } from "react";
import { useKitchen } from "@/context/KitchenContext";
import { Order, OrderStatus } from "@/types";
import {
  Calendar,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  Bike,
  IndianRupee,
  User,
  Phone,
  MapPin,
  Utensils,
  ChevronDown,
  Filter,
  PackageCheck,
  RotateCcw,
} from "lucide-react";

export function AdminOrderHistory() {
  const { orders, riders } = useKitchen();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDate, setSelectedDate] = useState<string>("All");
  const [statusFilter, setStatusFilter] = useState<"All" | "Delivered" | "Rejected" | "Active">("All");

  // Helper to get formatted date string for an order
  const getOrderDate = (order: Order) => {
    if (order.date) return order.date;
    if (order.createdTimestamp) {
      return new Date(order.createdTimestamp).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    }
    return new Date().toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  // Extract all distinct dates in descending order
  const distinctDates = useMemo(() => {
    const datesSet = new Set<string>();
    orders.forEach((o) => datesSet.add(getOrderDate(o)));
    return Array.from(datesSet);
  }, [orders]);

  // Filter orders by date, status, and search query
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const orderDate = getOrderDate(order);

      // Date filter
      if (selectedDate !== "All" && orderDate !== selectedDate) {
        return false;
      }

      // Status filter
      if (statusFilter === "Delivered" && order.status !== "Delivered") return false;
      if (statusFilter === "Rejected" && order.status !== "Rejected") return false;
      if (
        statusFilter === "Active" &&
        (order.status === "Delivered" || order.status === "Rejected")
      )
        return false;

      // Text search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const idMatch = order.id.toLowerCase().includes(q);
        const nameMatch = order.customerName.toLowerCase().includes(q);
        const phoneMatch = order.customerPhone.toLowerCase().includes(q);
        const itemMatch = order.items.some((i) => i.name.toLowerCase().includes(q));
        const addressMatch =
          order.address?.street?.toLowerCase().includes(q) ||
          order.address?.house?.toLowerCase().includes(q);
        return idMatch || nameMatch || phoneMatch || itemMatch || Boolean(addressMatch);
      }

      return true;
    });
  }, [orders, selectedDate, statusFilter, searchQuery]);

  // Group filtered orders by date
  const groupedOrdersByDate = useMemo(() => {
    const groups: { [date: string]: Order[] } = {};
    filteredOrders.forEach((o) => {
      const d = getOrderDate(o);
      if (!groups[d]) groups[d] = [];
      groups[d].push(o);
    });
    return groups;
  }, [filteredOrders]);

  // Global historical metrics
  const totalOrdersCount = orders.length;
  const deliveredCount = orders.filter((o) => o.status === "Delivered").length;
  const rejectedCount = orders.filter((o) => o.status === "Rejected").length;
  const totalRevenue = orders
    .filter((o) => o.status !== "Rejected")
    .reduce((sum, o) => sum + o.total, 0);

  const getStatusBadge = (status: OrderStatus, rejectionReason?: string) => {
    switch (status) {
      case "Delivered":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            <span>Delivered</span>
          </span>
        );
      case "Rejected":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
            <XCircle className="w-3 h-3 text-rose-600" />
            <span>Rejected{rejectionReason ? `: ${rejectionReason}` : ""}</span>
          </span>
        );
      case "In the Road":
      case "Out for Delivery":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-orange-100 text-[#C2410C] border border-orange-200">
            <Bike className="w-3 h-3 text-[#C2410C]" />
            <span>In Road</span>
          </span>
        );
      case "Order Status":
      case "Order Accepted":
      case "Preparing":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
            <Clock className="w-3 h-3 text-blue-600" />
            <span>Confirmed</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
            <Clock className="w-3 h-3 text-amber-600" />
            <span>New Order</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* 1. Header Banner & Stats Summary */}
      <div className="bg-white rounded-3xl border border-[#E7E0D8] p-6 sm:p-7 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#F5EFEB]">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-[#FFF7ED] text-[#C2410C] flex items-center justify-center shrink-0">
              <Calendar className="w-6 h-6 text-[#C2410C]" />
            </div>
            <div>
              <h2 className="font-serif text-2xl font-bold text-[#1C1917]">
                Historical Orders Log (Date-Wise)
              </h2>
              <p className="text-xs text-[#78716C] mt-0.5">
                Complete archive of delivered, rejected, and archived cloud kitchen orders organized by date.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1.5 rounded-full bg-[#FAF8F5] border border-[#E7E0D8] text-xs font-bold text-[#1C1917]">
              Total {totalOrdersCount} Recorded Orders
            </span>
          </div>
        </div>

        {/* 4 Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pt-5">
          <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E7E0D8]">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#78716C] block">
              Total Logged Orders
            </span>
            <span className="font-serif text-2xl font-bold text-[#1C1917] mt-1 block">
              {totalOrdersCount}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200/80">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 block">
              Successfully Delivered
            </span>
            <span className="font-serif text-2xl font-bold text-emerald-700 mt-1 block">
              {deliveredCount}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-rose-50/60 border border-rose-200/80">
            <span className="text-[11px] font-bold uppercase tracking-wider text-rose-800 block">
              Rejected / Cancelled
            </span>
            <span className="font-serif text-2xl font-bold text-rose-700 mt-1 block">
              {rejectedCount}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-[#FFF7ED] border border-[#FED7AA]">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#9A3412] block">
              Total Revenue (₹)
            </span>
            <span className="font-serif text-2xl font-bold text-[#C2410C] mt-1 block">
              ₹{Math.round(totalRevenue).toLocaleString("en-IN")}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Search & Date Filter Bar */}
      <div className="bg-white rounded-3xl border border-[#E7E0D8] p-4 sm:p-5 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search box */}
          <div className="relative flex-1 min-w-[220px]">
            <Search className="w-4 h-4 text-[#A8A29E] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Order ID, customer, phone number, dish..."
              className="w-full bg-[#FAF8F5] text-xs font-medium pl-10 pr-4 py-2.5 rounded-xl border border-[#E7E0D8] focus:border-[#C2410C] focus:bg-white focus:outline-hidden transition-all text-[#1C1917]"
            />
          </div>

          {/* Date Selector Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1 md:pb-0">
            <button
              type="button"
              onClick={() => setSelectedDate("All")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                selectedDate === "All"
                  ? "bg-[#1C1917] text-white shadow-2xs"
                  : "bg-[#F5EFEB] text-[#78716C] hover:text-[#1C1917]"
              }`}
            >
              All Dates
            </button>
            {distinctDates.map((date) => (
              <button
                key={date}
                type="button"
                onClick={() => setSelectedDate(date)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  selectedDate === date
                    ? "bg-[#C2410C] text-white shadow-2xs"
                    : "bg-[#F5EFEB] text-[#78716C] hover:text-[#1C1917]"
                }`}
              >
                {date}
              </button>
            ))}
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1 shrink-0">
            <span className="text-xs text-[#78716C] font-semibold hidden lg:inline mr-1">
              Status:
            </span>
            {(["All", "Delivered", "Rejected", "Active"] as const).map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  statusFilter === st
                    ? "bg-[#1C1917] text-white"
                    : "bg-[#FAF8F5] text-[#78716C] hover:text-[#1C1917] border border-[#E7E0D8]"
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Date-Wise Grouped Order Cards */}
      {Object.keys(groupedOrdersByDate).length === 0 ? (
        <div className="bg-white rounded-3xl border border-[#E7E0D8] p-12 text-center space-y-3">
          <Calendar className="w-10 h-10 text-[#A8A29E] mx-auto" />
          <h3 className="font-serif text-lg font-bold text-[#1C1917]">
            No Orders Found
          </h3>
          <p className="text-xs text-[#78716C] max-w-sm mx-auto">
            No past orders match the chosen date or search criteria.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedOrdersByDate).map(([date, dateOrders]) => {
            const dateRevenue = dateOrders
              .filter((o) => o.status !== "Rejected")
              .reduce((sum, o) => sum + o.total, 0);
            const dateDelivered = dateOrders.filter((o) => o.status === "Delivered").length;
            const dateRejected = dateOrders.filter((o) => o.status === "Rejected").length;

            return (
              <div
                key={date}
                className="bg-white rounded-3xl border border-[#E7E0D8] p-5 sm:p-7 shadow-xs space-y-5"
              >
                {/* Date Group Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#F5EFEB]">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#FFF7ED] text-[#C2410C] flex items-center justify-center font-bold text-xs shrink-0">
                      <Calendar className="w-5 h-5 text-[#C2410C]" />
                    </div>
                    <div>
                      <h3 className="font-serif text-lg font-bold text-[#1C1917]">
                        {date}
                      </h3>
                      <div className="flex items-center gap-3 text-xs text-[#78716C] mt-0.5">
                        <span>{dateOrders.length} Orders</span>
                        <span>•</span>
                        <span className="font-semibold text-[#1C1917]">
                          ₹{Math.round(dateRevenue).toLocaleString("en-IN")} Subtotal
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {dateDelivered > 0 && (
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {dateDelivered} Delivered
                      </span>
                    )}
                    {dateRejected > 0 && (
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                        {dateRejected} Rejected
                      </span>
                    )}
                  </div>
                </div>

                {/* Orders List for this Date */}
                <div className="divide-y divide-[#F5EFEB]">
                  {dateOrders.map((order) => {
                    const assignedRider = riders.find((r) => r.id === order.riderId);

                    return (
                      <div
                        key={order.id}
                        className="py-4.5 first:pt-0 last:pb-0 flex flex-col lg:flex-row lg:items-center justify-between gap-4 hover:bg-[#FAF8F5]/60 -mx-3 px-3 rounded-2xl transition-colors"
                      >
                        {/* Left: ID, Time, Customer & Address */}
                        <div className="space-y-2 flex-1 min-w-0">
                          <div className="flex items-center gap-2.5 flex-wrap">
                            <span className="font-serif text-base font-bold text-[#1C1917]">
                              #{order.id}
                            </span>
                            <span className="text-xs text-[#78716C] flex items-center gap-1">
                              <Clock className="w-3 h-3 text-[#A8A29E]" />
                              {order.createdAt}
                            </span>
                            {getStatusBadge(order.status, order.rejectionReason)}
                          </div>

                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#57534E]">
                            <span className="font-semibold text-[#1C1917] flex items-center gap-1.5">
                              <User className="w-3.5 h-3.5 text-[#C2410C]" />
                              {order.customerName}
                            </span>
                            <span className="flex items-center gap-1">
                              <Phone className="w-3 h-3 text-[#78716C]" />
                              {order.customerPhone}
                            </span>
                            {order.address?.street && (
                              <span className="flex items-center gap-1 text-[#78716C]">
                                <MapPin className="w-3 h-3 text-rose-500" />
                                {order.address.house ? `${order.address.house}, ` : ""}
                                {order.address.street}
                              </span>
                            )}
                          </div>

                          {/* Items summary */}
                          <div className="text-xs text-[#78716C] flex items-center gap-1.5 flex-wrap">
                            <Utensils className="w-3.5 h-3.5 text-[#C2410C] shrink-0" />
                            <span className="font-medium text-[#1C1917]">
                              {order.items
                                .map((i) => `${i.quantity}x ${i.name}`)
                                .join(", ")}
                            </span>
                          </div>
                        </div>

                        {/* Right: Payment & Total Amount */}
                        <div className="flex items-center justify-between lg:justify-end gap-6 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-[#F5EFEB]">
                          {/* Rider Info if assigned */}
                          {assignedRider && (
                            <div className="text-left lg:text-right hidden sm:block">
                              <span className="text-[10px] uppercase font-bold tracking-wider text-[#A8A29E] block">
                                Rider Assigned
                              </span>
                              <span className="text-xs font-semibold text-[#1C1917]">
                                {assignedRider.name}
                              </span>
                            </div>
                          )}

                          {/* Total & Payment Method */}
                          <div className="text-right">
                            <div className="flex items-center gap-1 justify-end">
                              <span className="text-xs font-medium text-[#78716C]">Total:</span>
                              <span className="font-serif text-lg font-bold text-[#C2410C]">
                                ₹{order.total}
                              </span>
                            </div>
                            <span className="text-[11px] font-semibold text-[#78716C] block mt-0.5">
                              {order.paymentMethod === "Cash on Delivery (COD)"
                                ? order.status === "Delivered"
                                  ? "COD • Paid"
                                  : "COD • Pending"
                                : "Online UPI • Paid"}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
