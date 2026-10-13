"use client";

import React, { useState, useEffect } from "react";
import { useKitchen } from "@/context/KitchenContext";
import { MenuManager } from "@/components/admin/MenuManager";
import { AdminOrderHistory } from "@/components/admin/AdminOrderHistory";
import { CouponManager } from "@/components/admin/CouponManager";
import {
  Lock,
  KeyRound,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Clock,
  MapPin,
  Phone,
  Power,
  RotateCcw,
  Save,
  ArrowLeft,
  X,
  Settings,
  SlidersHorizontal,
  Bike,
  ExternalLink,
  Calendar,
  ChevronRight,
  UserCheck,
  Building2,
  FileText,
  MessageSquare,
  Ticket,
  Plus,
  Trash2,
} from "lucide-react";
import { StoreStatusConfirmModal } from "@/components/admin/StoreStatusConfirmModal";
import { AddDriverModal } from "@/components/admin/AddDriverModal";

export type AdminSettingsPage = "overview" | "fleet" | "details" | "preferences" | "menu" | "history" | "coupons";

interface AdminSettingsProps {
  isOpen?: boolean;
  onClose?: () => void;
  initialTab?: "menu" | "fleet" | "history" | "preferences" | "details" | "overview" | "coupons";
}

export function AdminSettings({
  isOpen = true,
  onClose,
  initialTab = "overview",
}: AdminSettingsProps) {
  const { riders, orders, showToast, isStoreOpen, toggleStoreOpen, removeRider } = useKitchen();
  const [isAddDriverModalOpen, setIsAddDriverModalOpen] = useState(false);

  // Active page: "overview" (row list) or dedicated page: "fleet" | "details" | "preferences" | "menu" | "history" | "coupons"
  const [activePage, setActivePage] = useState<AdminSettingsPage>(() => {
    if (initialTab === "fleet") return "fleet";
    if (initialTab === "menu") return "menu";
    if (initialTab === "history") return "history";
    if (initialTab === "preferences") return "preferences";
    if (initialTab === "coupons") return "coupons";
    if (initialTab === "details") return "details";
    return "overview";
  });

  // Sync initialTab when modal opens
  useEffect(() => {
    if (isOpen && initialTab) {
      if (initialTab === "fleet") setActivePage("fleet");
      else if (initialTab === "menu") setActivePage("menu");
      else if (initialTab === "history") setActivePage("history");
      else if (initialTab === "preferences") setActivePage("preferences");
      else if (initialTab === "coupons") setActivePage("coupons");
      else if (initialTab === "details") setActivePage("details");
      else setActivePage("overview");
    }
  }, [isOpen, initialTab]);

  // Password Management State
  const [currentPasswordInput, setCurrentPasswordInput] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  // Confirmation modal state for store open/closed
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<"open" | "close">("close");

  // Close on Escape key press when open in full screen
  useEffect(() => {
    if (!isOpen || !onClose) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (activePage !== "overview") {
          setActivePage("overview");
        } else {
          onClose();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose, activePage]);

  if (!isOpen) return null;

  const handlePromptToggle = () => {
    setConfirmAction(isStoreOpen ? "close" : "open");
    setIsConfirmModalOpen(true);
  };

  const handleConfirmToggle = () => {
    toggleStoreOpen();
    setIsConfirmModalOpen(false);
  };

  const getStoredPassword = () => {
    if (typeof window === "undefined") return "admin123";
    return localStorage.getItem("lebistro_admin_password") || "admin123";
  };

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");

    const storedPass = getStoredPassword();

    // 1. Verify current password
    if (currentPasswordInput !== storedPass) {
      setPasswordError("Current password is incorrect.");
      return;
    }

    // 2. Validate new password
    if (newPassword.trim().length < 4) {
      setPasswordError("New password must be at least 4 characters long.");
      return;
    }

    // 3. Confirm match
    if (newPassword !== confirmPassword) {
      setPasswordError("New password and confirm password do not match.");
      return;
    }

    setIsUpdatingPassword(true);

    setTimeout(() => {
      try {
        localStorage.setItem("lebistro_admin_password", newPassword);
      } catch {}
      setIsUpdatingPassword(false);
      setPasswordSuccess("Admin password updated successfully!");
      setCurrentPasswordInput("");
      setNewPassword("");
      setConfirmPassword("");
      showToast("Admin password updated successfully!", "success");
    }, 400);
  };

  const handleResetDefault = () => {
    try {
      localStorage.setItem("lebistro_admin_password", "admin123");
    } catch {}
    setPasswordSuccess("Password reset to default (admin123)");
    setPasswordError("");
    setCurrentPasswordInput("");
    setNewPassword("");
    setConfirmPassword("");
    showToast("Password reset to default: admin123", "info");
  };

  // Row items configuration for the Overview layout
  const SETTING_ROWS = [
    {
      id: "fleet" as AdminSettingsPage,
      title: "Delivery Fleet & Drivers",
      badge: `${riders.length} Drivers Added`,
      badgeColor: "bg-orange-100 text-[#C2410C] border-orange-200",
      description: "Manage registered delivery drivers, add drivers via SMS OTP, view on-road riders, and driver mobile numbers.",
      icon: <Bike className="w-6 h-6 text-[#C2410C]" />,
      iconBg: "bg-orange-100 text-[#C2410C] border border-orange-200",
    },
    {
      id: "details" as AdminSettingsPage,
      title: "Admin Details",
      badge: "Kitchen Profile & Facility",
      badgeColor: "bg-emerald-500/10 text-emerald-800 border-emerald-500/30",
      description: "Operational schedule (5 PM - 3 AM), hub location, contact info, FSSAI compliance & active fleet.",
      icon: <Building2 className="w-6 h-6 text-emerald-600" />,
      iconBg: "bg-emerald-500/20 text-emerald-700 border border-emerald-500/30",
    },
    {
      id: "preferences" as AdminSettingsPage,
      title: "Preferences and Password",
      badge: "Security & Controls",
      badgeColor: "bg-yellow-100 text-yellow-900 border-yellow-300",
      description: "Change admin login passcode, emergency store pause/resume, and notification configurations.",
      icon: <KeyRound className="w-6 h-6 text-yellow-700" />,
      iconBg: "bg-yellow-200/60 text-yellow-800 border border-yellow-300",
    },
    {
      id: "menu" as AdminSettingsPage,
      title: "Menu",
      badge: "Menu & Pricing Manager",
      badgeColor: "bg-orange-100 text-[#C2410C] border-orange-200",
      description: "Manage items catalog, update pricing, toggle ingredient availability, and edit dietary tags.",
      icon: <SlidersHorizontal className="w-6 h-6 text-[#C2410C]" />,
      iconBg: "bg-orange-100/70 text-[#C2410C] border border-orange-200",
    },
    {
      id: "history" as AdminSettingsPage,
      title: "Order History",
      badge: "Date-Wise Archive",
      badgeColor: "bg-blue-100 text-blue-800 border-blue-200",
      description: "Browse completed & delivered orders date-wise, search historical customers, and view revenue summaries.",
      icon: <Calendar className="w-6 h-6 text-blue-700" />,
      iconBg: "bg-blue-100 text-blue-700 border border-blue-200",
    },
    {
      id: "coupons" as AdminSettingsPage,
      title: "Coupons & Delivery Charges",
      badge: "Offers & Fees",
      badgeColor: "bg-purple-100 text-purple-800 border-purple-200",
      description: "Manage promo coupons, default free delivery threshold (₹199), and standard delivery fee editor.",
      icon: <Ticket className="w-6 h-6 text-purple-700" />,
      iconBg: "bg-purple-100 text-purple-700 border border-purple-200",
    },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-[#FAF8F5] text-[#1C1917] flex flex-col overflow-y-auto animate-in fade-in duration-200">
      {/* Top Header Bar */}
      <header className="sticky top-0 z-40 bg-[#1C1917] text-[#FAF8F5] border-b border-[#292524] shadow-md px-4 sm:px-8 py-3.5 sm:py-4 flex items-center justify-between">
        <div className="flex items-center gap-3 sm:gap-4">
          {activePage !== "overview" ? (
            <button
              type="button"
              onClick={() => setActivePage("overview")}
              className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-[#FAF8F5] transition-all flex items-center gap-2 text-xs font-semibold cursor-pointer shrink-0"
              title="Return to Settings Overview"
            >
              <ArrowLeft className="w-4 h-4 shrink-0" />
              <span>Back to Settings</span>
            </button>
          ) : onClose ? (
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-[#FAF8F5] transition-all flex items-center gap-2 text-xs font-semibold cursor-pointer shrink-0"
              title="Return to Live Orders Board (Esc)"
            >
              <ArrowLeft className="w-4 h-4 shrink-0" />
              <span className="hidden sm:inline">Back to Orders</span>
              <span className="sm:hidden">Back</span>
            </button>
          ) : null}

          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#C2410C] flex items-center justify-center text-white shadow-xs shrink-0">
              <Settings className="w-4 h-4" />
            </div>
            <div>
              <h1 className="font-serif text-base sm:text-lg font-bold text-white leading-tight">
                {activePage === "overview"
                  ? "Admin Settings & Controls"
                  : SETTING_ROWS.find((r) => r.id === activePage)?.title || "Settings"}
              </h1>
              <p className="text-[10px] text-[#A8A29E] leading-tight hidden sm:block">
                {activePage === "overview"
                  ? "Select a category below to open its dedicated management page"
                  : "The Red Löffel Kitchen Administration"}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span
            className={`hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${
              isStoreOpen
                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                : "bg-rose-500/20 text-rose-300 border border-rose-500/40"
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                isStoreOpen ? "bg-emerald-400 animate-pulse" : "bg-rose-500"
              }`}
            />
            <span>{isStoreOpen ? "Kitchen Active" : "Kitchen Paused"}</span>
          </span>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-[#A8A29E] hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              title="Close Settings (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full flex-1 space-y-6">
        {/* ============================================================== */}
        {/* ROW-WISE SETTINGS OVERVIEW (Main Screen)                       */}
        {/* ============================================================== */}
        {activePage === "overview" && (
          <div className="space-y-6 animate-in fade-in duration-150">
            {/* Header Introduction Banner */}
            <div className="bg-white rounded-3xl border border-[#E7E0D8] p-6 sm:p-7 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#C2410C]">
                    Kitchen Administration
                  </span>
                  <h2 className="font-serif text-2xl font-bold text-[#1C1917] mt-0.5">
                    System Settings & Management
                  </h2>
                  <p className="text-xs text-[#78716C] mt-1 max-w-xl">
                    Choose any section below to open its dedicated page. Manage your facility credentials, security passcode, menu catalog, and past orders.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-3 py-1.5 rounded-2xl bg-[#FAF8F5] border border-[#E7E0D8] text-xs font-semibold text-[#1C1917] flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-[#C2410C]" />
                    <span>Evening 5 PM – Morning 3 AM</span>
                  </span>
                </div>
              </div>
            </div>

            {/* ROW-WISE LIST (1. Admin Details, 2. Preferences & Password, 3. Menu, 4. Order History) */}
            <div className="space-y-3.5">
              {SETTING_ROWS.map((row, idx) => (
                <button
                  key={row.id}
                  type="button"
                  onClick={() => setActivePage(row.id)}
                  className="w-full bg-white hover:bg-[#FAF8F5] border border-[#E7E0D8] hover:border-[#C2410C] rounded-3xl p-5 sm:p-6 transition-all shadow-xs hover:shadow-md flex items-center justify-between gap-4 text-left group cursor-pointer"
                >
                  <div className="flex items-center gap-4 sm:gap-5 min-w-0">
                    {/* Index Number & Icon */}
                    <div className="relative shrink-0">
                      <div className={`w-12 sm:w-14 h-12 sm:h-14 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-105 ${row.iconBg}`}>
                        {row.icon}
                      </div>
                      <span className="w-5 h-5 rounded-full bg-[#1C1917] text-white text-[10px] font-bold flex items-center justify-center absolute -top-1.5 -left-1.5 shadow-2xs">
                        {idx + 1}
                      </span>
                    </div>

                    {/* Text Details */}
                    <div className="min-w-0">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <h3 className="font-serif text-base sm:text-lg font-bold text-[#1C1917] group-hover:text-[#C2410C] transition-colors">
                          {row.title}
                        </h3>
                        <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${row.badgeColor}`}>
                          {row.badge}
                        </span>
                      </div>
                      <p className="text-xs text-[#78716C] mt-1 line-clamp-1 sm:line-clamp-none">
                        {row.description}
                      </p>
                    </div>
                  </div>

                  {/* Open Arrow */}
                  <div className="flex items-center gap-2 text-[#78716C] group-hover:text-[#C2410C] shrink-0 font-semibold text-xs pl-2">
                    <span className="hidden sm:inline">Open Page</span>
                    <div className="w-8 h-8 rounded-full bg-[#FAF8F5] group-hover:bg-[#C2410C] text-[#78716C] group-hover:text-white flex items-center justify-center transition-all">
                      <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* SUB-PAGE NAVIGATION BAR (Shown on sub-pages for fast switching) */}
        {/* ============================================================== */}
        {activePage !== "overview" && (
          <div className="flex items-center justify-between gap-3 border-b border-[#E7E0D8] pb-3 overflow-x-auto scrollbar-none">
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setActivePage("overview")}
                className="px-3 py-1.5 rounded-xl bg-white border border-[#E7E0D8] hover:bg-[#F5EFEB] text-xs font-bold text-[#1C1917] flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>All Settings</span>
              </button>
            </div>

            {/* Direct Page Switcher Tabs */}
            <div className="flex items-center gap-1.5 shrink-0">
              {SETTING_ROWS.map((item) => {
                const isSelected = activePage === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActivePage(item.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                      isSelected
                        ? "bg-[#1C1917] text-white shadow-2xs"
                        : "bg-white border border-[#E7E0D8] text-[#78716C] hover:text-[#1C1917]"
                    }`}
                  >
                    <span>{item.title}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* PAGE: DELIVERY FLEET & DRIVERS                                 */}
        {/* ============================================================== */}
        {activePage === "fleet" && (
          <div className="space-y-6 animate-in fade-in duration-150">
            {/* Header info */}
            <div className="bg-white rounded-3xl border border-[#E7E0D8] p-6 sm:p-7 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-orange-100 text-[#C2410C] flex items-center justify-center shrink-0 border border-orange-200">
                  <Bike className="w-6 h-6 text-[#C2410C]" />
                </div>
                <div>
                  <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#1C1917]">
                    Delivery Fleet & Drivers
                  </h2>
                  <p className="text-xs text-[#78716C] mt-0.5">
                    Manage active delivery riders, verify new drivers via mobile OTP, and track on-road dispatch assignments.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsAddDriverModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#C2410C] hover:bg-[#9A3412] text-white text-xs font-bold shadow-md shadow-[#C2410C]/25 transition-all cursor-pointer shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Add Driver via OTP</span>
              </button>
            </div>

            {/* Drivers List Card */}
            <div className="bg-white rounded-3xl border border-[#E7E0D8] p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#F5EFEB]">
                <div>
                  <h3 className="font-bold text-sm text-[#1C1917]">Registered Drivers ({riders.length})</h3>
                  <p className="text-[11px] text-[#78716C]">Available for automatic and manual on-road order assignments</p>
                </div>

                <span className="px-2.5 py-0.5 rounded-full bg-orange-50 text-[#C2410C] border border-orange-200 text-xs font-bold">
                  {riders.filter((r) => r.activeOrders > 0).length} on Road
                </span>
              </div>

              {riders.length === 0 ? (
                <div className="p-10 text-center bg-[#FAF8F5] rounded-2xl border border-dashed border-[#E7E0D8] space-y-3">
                  <div className="w-14 h-14 rounded-2xl bg-orange-50 border border-orange-200 flex items-center justify-center mx-auto text-[#C2410C]">
                    <Bike className="w-7 h-7" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[#1C1917]">No Delivery Drivers Added Yet</p>
                    <p className="text-xs text-[#78716C] max-w-sm mx-auto mt-1">
                      Add delivery drivers with their mobile number and SMS OTP verification to assign them to on-road deliveries.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsAddDriverModalOpen(true)}
                    className="mt-2 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#C2410C] text-white text-xs font-bold cursor-pointer shadow-xs"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Driver via OTP</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {riders.map((rider) => (
                    <div
                      key={rider.id}
                      className="p-5 rounded-2xl bg-[#FAF8F5] border border-[#E7E0D8] space-y-3 flex flex-col justify-between hover:border-[#C2410C]/40 transition-colors shadow-2xs"
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-sm text-[#1C1917]">{rider.name}</span>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            rider.activeOrders > 0
                              ? "bg-orange-100 text-[#C2410C] border border-orange-200 animate-pulse"
                              : "bg-emerald-100 text-emerald-800"
                          }`}>
                            {rider.activeOrders > 0 ? `${rider.activeOrders} on Road` : "Available"}
                          </span>
                        </div>
                        <p className="text-xs text-[#78716C] mt-1 flex items-center gap-1.5">
                          <Bike className="w-3.5 h-3.5 text-[#C2410C]" />
                          <span>{rider.vehicle} • ★ {rider.rating}</span>
                        </p>
                      </div>

                      <div className="pt-3 border-t border-[#E7E0D8] flex items-center justify-between text-xs">
                        <span className="text-[#78716C] font-mono font-semibold">{rider.phone}</span>
                        <div className="flex items-center gap-2">
                          <a
                            href={`tel:${rider.phone.replace(/[^0-9+]/g, "")}`}
                            className="px-2.5 py-1 rounded-lg bg-white border border-[#E7E0D8] text-[#C2410C] hover:border-[#C2410C] font-bold text-xs flex items-center gap-1 transition-colors shadow-2xs"
                            title="Call Driver"
                          >
                            <Phone className="w-3.5 h-3.5" />
                            <span>Call</span>
                          </a>
                          <button
                            type="button"
                            onClick={() => {
                              if (window.confirm(`Remove ${rider.name} from fleet?`)) {
                                removeRider(rider.id);
                              }
                            }}
                            className="text-rose-600 hover:text-rose-700 p-1.5 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Remove Driver"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* PAGE 1: ADMIN DETAILS                                          */}
        {/* ============================================================== */}
        {activePage === "details" && (
          <div className="space-y-6 animate-in fade-in duration-150">
            {/* Header info */}
            <div className="bg-white rounded-3xl border border-[#E7E0D8] p-6 sm:p-7 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-500/30">
                  <Building2 className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#1C1917]">
                    Admin & Kitchen Facility Details
                  </h2>
                  <p className="text-xs text-[#78716C] mt-0.5">
                    Official operational schedule, registered hub location, FSSAI compliance & active delivery fleet.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handlePromptToggle}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shrink-0 shadow-2xs ${
                  isStoreOpen
                    ? "bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200"
                    : "bg-emerald-600 text-white hover:bg-emerald-700"
                }`}
              >
                <Power className="w-3.5 h-3.5" />
                <span>{isStoreOpen ? "Pause Kitchen Orders" : "Open Kitchen Orders"}</span>
              </button>
            </div>

            {/* ROW-WISE SECTION 1: Kitchen Operational Schedule */}
            <div className="bg-white rounded-3xl border border-[#E7E0D8] p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#F5EFEB]">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-orange-100 text-[#C2410C] flex items-center justify-center">
                    <Clock className="w-4 h-4 text-[#C2410C]" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-[#1C1917]">Operational Schedule</h3>
                    <p className="text-[11px] text-[#78716C]">Daily operating hours for order intake</p>
                  </div>
                </div>

                <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold">
                  Active Timings
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E7E0D8] space-y-1">
                  <span className="text-[10px] uppercase font-bold text-[#78716C] block">
                    Kitchen Operational Hours
                  </span>
                  <p className="font-serif text-lg font-bold text-[#1C1917]">
                    Evening 5:00 PM – Morning 3:00 AM
                  </p>
                  <p className="text-[11px] text-[#78716C]">
                    Open daily for late night gourmet delivery & takeout.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E7E0D8] space-y-1">
                  <span className="text-[10px] uppercase font-bold text-[#78716C] block">
                    Current Store Status
                  </span>
                  <div className="flex items-center gap-2 pt-0.5">
                    <span
                      className={`w-3 h-3 rounded-full ${
                        isStoreOpen ? "bg-emerald-500 animate-pulse" : "bg-rose-500"
                      }`}
                    />
                    <span className="font-bold text-sm text-[#1C1917]">
                      {isStoreOpen ? "STORE OPEN (Accepting Orders)" : "STORE CLOSED (Orders Paused)"}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#78716C]">
                    {isStoreOpen
                      ? "Customers can place orders on the website."
                      : "Customer checkout is currently paused."}
                  </p>
                </div>
              </div>
            </div>

            {/* ROW-WISE SECTION 2: Location & Compliance Details */}
            <div className="bg-white rounded-3xl border border-[#E7E0D8] p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#F5EFEB]">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-orange-100 text-[#C2410C] flex items-center justify-center">
                    <MapPin className="w-4 h-4 text-[#C2410C]" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-[#1C1917]">Hub Facility & Compliance</h3>
                    <p className="text-[11px] text-[#78716C]">Physical location and regulatory certificates</p>
                  </div>
                </div>

                <span className="px-2.5 py-0.5 rounded-full bg-white text-[#78716C] border border-[#E7E0D8] text-xs font-bold">
                  Registered Facility
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E7E0D8] space-y-1">
                  <span className="text-[10px] uppercase font-bold text-[#78716C] block">
                    Dark Kitchen Hub Address
                  </span>
                  <p className="font-bold text-[#1C1917] leading-snug">
                    Nalanda living boys hostel , near NIET BUISNESS SCHOOL, knowledge park 3
                  </p>
                  <p className="text-[#A8A29E] text-[11px]">Landmark: Near NIET Business School / Knowledge Park 3</p>
                </div>

                <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E7E0D8] space-y-1">
                  <span className="text-[10px] uppercase font-bold text-[#78716C] block">
                    FSSAI License & Food Safety
                  </span>
                  <p className="font-mono font-bold text-sm text-[#1C1917]">
                    11224334001928
                  </p>
                  <p className="text-emerald-700 font-semibold text-[11px]">
                    ✓ 100% Compliant Commercial Facility
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E7E0D8] space-y-1">
                  <span className="text-[10px] uppercase font-bold text-[#78716C] block">
                    Kitchen Dispatch Hotline
                  </span>
                  <p className="font-mono font-bold text-sm text-[#1C1917]">
                    +91 96257 50927
                  </p>
                  <p className="text-[#78716C] text-[11px]">
                    Direct line for delivery riders & kitchen queries
                  </p>
                </div>
              </div>
            </div>

            {/* ROW-WISE SECTION 3: Active Fleet Summary */}
            <div className="bg-white rounded-3xl border border-[#E7E0D8] p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#F5EFEB]">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-orange-100 text-[#C2410C] flex items-center justify-center">
                    <Bike className="w-4 h-4 text-[#C2410C]" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-[#1C1917]">Active Delivery Fleet ({riders.length})</h3>
                    <p className="text-[11px] text-[#78716C]">Riders assigned to on-road orders</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsAddDriverModalOpen(true)}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#C2410C] hover:bg-[#9A3412] text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Driver</span>
                </button>
              </div>

              {riders.length === 0 ? (
                <div className="p-8 text-center bg-[#FAF8F5] rounded-2xl border border-dashed border-[#E7E0D8] space-y-2">
                  <Bike className="w-8 h-8 text-[#A8A29E] mx-auto stroke-[1.5]" />
                  <p className="text-xs font-semibold text-[#1C1917]">No Delivery Drivers Added</p>
                  <p className="text-[11px] text-[#78716C] max-w-sm mx-auto">
                    Add delivery drivers with mobile number and OTP verification to assign them to on-road orders.
                  </p>
                  <button
                    type="button"
                    onClick={() => setIsAddDriverModalOpen(true)}
                    className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#C2410C] text-white text-xs font-bold cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Driver via OTP</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {riders.map((rider) => (
                    <div
                      key={rider.id}
                      className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E7E0D8] space-y-2 flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-sm text-[#1C1917]">{rider.name}</span>
                          <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                            {rider.activeOrders > 0 ? `${rider.activeOrders} on Road` : "Available"}
                          </span>
                        </div>
                        <p className="text-xs text-[#78716C] mt-0.5 flex items-center gap-1">
                          <Bike className="w-3 h-3 text-[#C2410C]" />
                          <span>{rider.vehicle}</span>
                        </p>
                      </div>

                      <div className="pt-2 border-t border-[#E7E0D8] flex items-center justify-between text-xs">
                        <span className="text-[#78716C] font-mono">{rider.phone}</span>
                        <div className="flex items-center gap-2">
                          <a
                            href={`tel:${rider.phone.replace(/[^0-9+]/g, "")}`}
                            className="text-[#C2410C] hover:underline font-semibold flex items-center gap-1"
                            title="Call Driver"
                          >
                            <Phone className="w-3.5 h-3.5" />
                            <span>Call Driver</span>
                          </a>
                          <button
                            type="button"
                            onClick={() => {
                              if (window.confirm(`Remove ${rider.name} from fleet?`)) {
                                removeRider(rider.id);
                              }
                            }}
                            className="text-rose-600 hover:text-rose-700 p-1 rounded-md hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Remove Driver"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* PAGE 2: PREFERENCES AND PASSWORD                               */}
        {/* ============================================================== */}
        {activePage === "preferences" && (
          <div className="space-y-6 animate-in fade-in duration-150">
            {/* Header info */}
            <div className="bg-white rounded-3xl border border-[#E7E0D8] p-6 sm:p-7 shadow-xs">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-yellow-200/60 text-yellow-800 flex items-center justify-center shrink-0 border border-yellow-300">
                  <KeyRound className="w-6 h-6 text-yellow-700" />
                </div>
                <div>
                  <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#1C1917]">
                    Preferences and Password
                  </h2>
                  <p className="text-xs text-[#78716C] mt-0.5">
                    Update the passcode required to access the /admin console, and adjust kitchen operational preferences.
                  </p>
                </div>
              </div>
            </div>

            {/* ROW 1: Change Admin Password Form (Full Width) */}
            <div className="bg-white rounded-3xl border border-[#E7E0D8] p-6 sm:p-8 shadow-xs space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-[#F5EFEB]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#FFF7ED] text-[#C2410C] flex items-center justify-center shrink-0">
                    <KeyRound className="w-5 h-5 text-[#C2410C]" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-[#1C1917]">
                      Change Admin Passcode
                    </h3>
                    <p className="text-xs text-[#78716C]">
                      Default passcode is: <span className="font-mono font-bold text-[#C2410C]">admin123</span>
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleResetDefault}
                  className="text-xs font-semibold text-[#78716C] hover:text-[#C2410C] flex items-center gap-1.5 transition-colors cursor-pointer px-3 py-1.5 rounded-xl border border-[#E7E0D8] bg-[#FAF8F5]"
                  title="Reset to default password (admin123)"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset Default (admin123)</span>
                </button>
              </div>

              {passwordSuccess && (
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{passwordSuccess}</span>
                </div>
              )}

              {passwordError && (
                <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{passwordError}</span>
                </div>
              )}

              <form onSubmit={handleUpdatePassword} className="space-y-4 max-w-2xl">
                {/* 1. Current Password */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#78716C]">
                    Current Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-[#A8A29E] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showCurrentPassword ? "text" : "password"}
                      required
                      value={currentPasswordInput}
                      onChange={(e) => setCurrentPasswordInput(e.target.value)}
                      placeholder="Enter current admin passcode"
                      className="w-full pl-10 pr-10 py-3 rounded-xl border border-[#E7E0D8] bg-[#FAF8F5] text-xs text-[#1C1917] placeholder:text-[#A8A29E] focus:outline-hidden focus:border-[#C2410C] focus:bg-white transition-all font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A8A29E] hover:text-[#1C1917]"
                    >
                      {showCurrentPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* 2. New Password */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#78716C]">
                    New Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-[#A8A29E] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showNewPassword ? "text" : "password"}
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter minimum 4 characters"
                      className="w-full pl-10 pr-10 py-3 rounded-xl border border-[#E7E0D8] bg-[#FAF8F5] text-xs text-[#1C1917] placeholder:text-[#A8A29E] focus:outline-hidden focus:border-[#C2410C] focus:bg-white transition-all font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A8A29E] hover:text-[#1C1917]"
                    >
                      {showNewPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* 3. Confirm New Password */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#78716C]">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-[#A8A29E] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showNewPassword ? "text" : "password"}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-type new password"
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#E7E0D8] bg-[#FAF8F5] text-xs text-[#1C1917] placeholder:text-[#A8A29E] focus:outline-hidden focus:border-[#C2410C] focus:bg-white transition-all font-mono"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isUpdatingPassword}
                    className="py-3 px-6 rounded-xl bg-[#C2410C] hover:bg-[#9A3412] active:scale-98 text-white font-semibold text-xs shadow-md shadow-[#C2410C]/25 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {isUpdatingPassword ? (
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        <span>Save New Admin Password</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* ROW 2: Master Kitchen Operational Preferences */}
            <div className="bg-white rounded-3xl border border-[#E7E0D8] p-6 sm:p-8 shadow-xs space-y-4">
              <div className="flex items-center gap-3 pb-3 border-b border-[#F5EFEB]">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-[#1C1917]">System Preferences</h3>
                  <p className="text-[11px] text-[#78716C]">Notification dispatches and kitchen automation</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E7E0D8] space-y-1">
                  <span className="font-bold text-[#1C1917] block">Driver Dispatch Alerts</span>
                  <p className="text-[#78716C]">
                    Automatically dispatches order details and delivery location navigation to assigned drivers.
                  </p>
                  <span className="text-emerald-700 font-semibold text-[11px] block pt-1">
                    ✓ Always Enabled
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E7E0D8] space-y-1">
                  <span className="font-bold text-[#1C1917] block">Kitchen Pipeline Audio Alerts</span>
                  <p className="text-[#78716C]">
                    Alerts sound when incoming orders are placed on the storefront.
                  </p>
                  <span className="text-emerald-700 font-semibold text-[11px] block pt-1">
                    ✓ Browser Sound Active
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* PAGE 3: MENU (Menu & Pricing Manager)                          */}
        {/* ============================================================== */}
        {activePage === "menu" && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <MenuManager />
          </div>
        )}

        {/* ============================================================== */}
        {/* PAGE 4: ORDER HISTORY                                          */}
        {/* ============================================================== */}
        {activePage === "history" && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <AdminOrderHistory />
          </div>
        )}

        {/* ============================================================== */}
        {/* PAGE 5: COUPONS & DELIVERY CHARGES                             */}
        {/* ============================================================== */}
        {activePage === "coupons" && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <CouponManager />
          </div>
        )}
      </main>

      {/* Confirmation Modal for Store Toggle */}
      <StoreStatusConfirmModal
        isOpen={isConfirmModalOpen}
        action={confirmAction}
        onConfirm={handleConfirmToggle}
        onCancel={() => setIsConfirmModalOpen(false)}
      />

      {/* Modal for Registering Driver with Phone OTP */}
      <AddDriverModal
        isOpen={isAddDriverModalOpen}
        onClose={() => setIsAddDriverModalOpen(false)}
      />
    </div>
  );
}
