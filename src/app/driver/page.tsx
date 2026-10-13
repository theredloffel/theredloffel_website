"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useKitchen } from "@/context/KitchenContext";
import { Rider, Order } from "@/types";
import {
  auth,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult,
} from "@/lib/firebase";
import {
  playChimeSound,
  requestNotificationPermission,
  getNotificationPermission,
  sendBrowserNotification,
} from "@/lib/pushNotifications";
import {
  Bike,
  Phone,
  MapPin,
  Navigation,
  CheckCircle2,
  Clock,
  ShieldCheck,
  LogOut,
  Bell,
  BellRing,
  ExternalLink,
  ShoppingBag,
  DollarSign,
  AlertCircle,
  Loader2,
  ChevronRight,
  ArrowRight,
  RotateCcw,
  Sparkles,
  Utensils,
  Check,
} from "lucide-react";

export default function DriverPortalPage() {
  const { riders, orders, updateOrderStatus, showToast } = useKitchen();

  // Authentication State
  const [loggedDriver, setLoggedDriver] = useState<Rider | null>(null);
  const [phoneInput, setPhoneInput] = useState("");
  const [authStep, setAuthStep] = useState<"phone" | "otp">("phone");
  const [otpDigits, setOtpDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [authError, setAuthError] = useState("");
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [activeTab, setActiveTab] = useState<"active" | "history">("active");

  // Notification status
  const [notifPermission, setNotifPermission] = useState<NotificationPermission | "unsupported">("default");
  const [confirmDeliveryOrder, setConfirmDeliveryOrder] = useState<Order | null>(null);

  // Track previous active order count to detect incoming dispatches
  const previousActiveCountRef = useRef<number>(0);

  // Restore logged-in driver session from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      setNotifPermission(getNotificationPermission());

      const savedId = localStorage.getItem("trl_driver_session_id");
      if (savedId) {
        const found = riders.find((r) => r.id === savedId);
        if (found) {
          setLoggedDriver(found);
        }
      }
    }
  }, [riders]);

  // Clean phone helper
  const cleanEnteredPhone = phoneInput.replace(/\D/g, "").slice(-10);

  // Active Assigned Orders (Pending / In the road / Preparing)
  const activeOrders = useMemo(() => {
    if (!loggedDriver) return [];
    return orders.filter(
      (o) =>
        o.riderId === loggedDriver.id &&
        o.status !== "Delivered" &&
        o.status !== "Rejected"
    );
  }, [orders, loggedDriver]);

  // Completed deliveries by this driver today
  const completedOrders = useMemo(() => {
    if (!loggedDriver) return [];
    return orders.filter(
      (o) => o.riderId === loggedDriver.id && o.status === "Delivered"
    );
  }, [orders, loggedDriver]);

  const totalCashCollectedToday = useMemo(() => {
    return completedOrders.reduce((sum, o) => sum + (o.total || 0), 0);
  }, [completedOrders]);

  // Real-time audio and browser push alert when a new order is assigned
  useEffect(() => {
    if (!loggedDriver) return;

    if (activeOrders.length > previousActiveCountRef.current) {
      // New delivery task detected!
      const newestOrder = activeOrders[activeOrders.length - 1];
      playChimeSound();

      const deliveryLoc = newestOrder?.address
        ? `${newestOrder.address.house ? `${newestOrder.address.house}, ` : ""}${newestOrder.address.street || ""}`
        : "Customer Location";

      sendBrowserNotification("🛵 New Order Assigned to You!", {
        body: `Order #${newestOrder?.id} at ${deliveryLoc}. Collect COD: ₹${newestOrder?.total}`,
      });

      showToast(`🔔 New Order #${newestOrder?.id} assigned to you!`, "info");
    }

    previousActiveCountRef.current = activeOrders.length;
  }, [activeOrders, loggedDriver, showToast]);

  // Request notification permission
  const handleEnableNotifications = async () => {
    const result = await requestNotificationPermission();
    setNotifPermission(result);
    if (result === "granted") {
      showToast("Sound & Push notifications active! You will hear alerts for incoming orders.", "success");
    } else {
      showToast("Notification permission was not granted.", "warning");
    }
  };

  // STEP 1: Send OTP to Driver
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");

    if (cleanEnteredPhone.length !== 10) {
      setAuthError("Please enter a valid 10-digit mobile number.");
      return;
    }

    // Verify if this phone number is registered in fleet
    const matchedRider = riders.find(
      (r) => r.phone.replace(/\D/g, "").slice(-10) === cleanEnteredPhone
    );

    if (!matchedRider) {
      setAuthError(
        `Mobile +91 ${cleanEnteredPhone} is not registered in the delivery fleet. Please ask the kitchen admin to add you in fleet settings.`
      );
      return;
    }

    setIsSendingOtp(true);
    if (typeof window !== "undefined") {
      try {
        if ((window as any).driverPortalRecaptcha) {
          try {
            (window as any).driverPortalRecaptcha.clear();
          } catch {}
          (window as any).driverPortalRecaptcha = null;
        }

        const appVerifier = new RecaptchaVerifier(auth, "driver-login-recaptcha", {
          size: "invisible",
        });
        (window as any).driverPortalRecaptcha = appVerifier;

        const confirmation = await signInWithPhoneNumber(
          auth,
          `+91${cleanEnteredPhone}`,
          appVerifier
        );

        setConfirmationResult(confirmation);
        setAuthStep("otp");
        showToast(`SMS OTP sent to +91 ${cleanEnteredPhone}`, "success");
      } catch (err: any) {
        console.error("Firebase driver login error:", err);
        try {
          (window as any).driverPortalRecaptcha?.clear();
          (window as any).driverPortalRecaptcha = null;
        } catch {}

        setAuthError(err?.message || "Failed to send SMS OTP. Please check your network and try again.");
      } finally {
        setIsSendingOtp(false);
      }
    }
  };

  // STEP 2: Verify OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");

    const code = otpDigits.join("");
    if (code.length !== 6) {
      setAuthError("Please enter the complete 6-digit verification code.");
      return;
    }

    if (!confirmationResult) {
      setAuthError("No active verification session. Please request OTP again.");
      return;
    }

    setIsVerifyingOtp(true);
    try {
      await confirmationResult.confirm(code);

      // Match rider
      const matchedRider = riders.find(
        (r) => r.phone.replace(/\D/g, "").slice(-10) === cleanEnteredPhone
      );

      if (matchedRider) {
        setLoggedDriver(matchedRider);
        localStorage.setItem("trl_driver_session_id", matchedRider.id);
        showToast(`Welcome back, ${matchedRider.name}!`, "success");
        playChimeSound();
      }
    } catch (err: any) {
      console.error("OTP verification error:", err);
      setAuthError("Incorrect code! Firebase rejected this OTP. Please try again.");
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  // OTP Digits input handlers
  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const next = [...otpDigits];
    next[index] = value.slice(-1);
    setOtpDigits(next);

    if (value && index < 5) {
      const nextInput = document.getElementById(`driver-otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      const prevInput = document.getElementById(`driver-otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  // Logout Driver
  const handleLogout = () => {
    localStorage.removeItem("trl_driver_session_id");
    setLoggedDriver(null);
    setAuthStep("phone");
    setPhoneInput("");
    setOtpDigits(["", "", "", "", "", ""]);
    showToast("Signed out from driver portal", "info");
  };

  // Mark Doorstep Delivery Complete
  const handleConfirmDoorstepDelivery = () => {
    if (!confirmDeliveryOrder) return;

    updateOrderStatus(confirmDeliveryOrder.id, "Delivered");
    playChimeSound();

    // Trigger delivered status notification
    fetch("/api/notifications/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        phone: confirmDeliveryOrder.customerPhone,
        orderId: confirmDeliveryOrder.id,
        type: "DELIVERED",
        amount: confirmDeliveryOrder.total,
        riderName: loggedDriver?.name,
      }),
    }).catch(() => {});

    showToast(
      `🎉 Order #${confirmDeliveryOrder.id} marked as Delivered at Doorstep! Collected: ₹${confirmDeliveryOrder.total}`,
      "success"
    );

    setConfirmDeliveryOrder(null);
  };

  // =========================================================================
  // VIEW A: DRIVER LOGIN SCREEN (PHONE + SMS OTP)
  // =========================================================================
  if (!loggedDriver) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex flex-col justify-between p-4 sm:p-6 md:p-10 font-sans">
        {/* Top Header */}
        <div className="max-w-md w-full mx-auto flex items-center justify-between pb-6">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-full overflow-hidden border border-[#E7E0D8] bg-white shadow-xs">
              <Image
                src="/logo.jpeg"
                alt="The Red Löffel"
                width={40}
                height={40}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <span className="font-serif font-black text-lg text-[#1C1917] tracking-tight block">
                The Red Löffel
              </span>
              <span className="text-[10px] uppercase font-extrabold tracking-widest text-[#C2410C]">
                Driver Hub
              </span>
            </div>
          </Link>
          <Link
            href="/"
            className="text-xs font-bold text-[#78716C] hover:text-[#1C1917] flex items-center gap-1"
          >
            <span>Customer Store</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Login Card */}
        <div className="max-w-md w-full mx-auto bg-white rounded-3xl border border-[#E7E0D8] p-6 sm:p-8 shadow-xl space-y-6 my-auto">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-[#FFF7ED] border border-[#FDBA74] text-[#C2410C] flex items-center justify-center mx-auto shadow-inner">
              <Bike className="w-7 h-7" />
            </div>
            <h1 className="font-serif text-2xl font-bold text-[#1C1917]">
              {authStep === "phone" ? "Driver Fleet Login" : "Verify Driver Phone"}
            </h1>
            <p className="text-xs text-[#78716C] max-w-xs mx-auto leading-relaxed">
              {authStep === "phone"
                ? "Enter your registered mobile number to view your assigned deliveries."
                : `Enter the 6-digit SMS OTP sent via Firebase to +91 ${cleanEnteredPhone}.`}
            </p>
          </div>

          {authError && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <p className="leading-snug">{authError}</p>
            </div>
          )}

          {authStep === "phone" ? (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#1C1917] mb-1.5 uppercase tracking-wider">
                  Mobile Number
                </label>
                <div className="relative flex">
                  <span className="inline-flex items-center px-4 rounded-l-2xl border border-r-0 border-[#E7E0D8] bg-[#F5EFEB] text-[#1C1917] text-sm font-bold">
                    🇮🇳 +91
                  </span>
                  <input
                    type="tel"
                    maxLength={10}
                    autoFocus
                    value={phoneInput}
                    onChange={(e) => {
                      setPhoneInput(e.target.value.replace(/\D/g, ""));
                      setAuthError("");
                    }}
                    placeholder="98765 43210"
                    className="w-full px-4 py-3.5 rounded-r-2xl border border-[#E7E0D8] bg-white text-base text-[#1C1917] font-bold tracking-wider placeholder:text-[#A8A29E] focus:outline-hidden focus:border-[#C2410C] focus:ring-2 focus:ring-[#C2410C]/20 transition-all"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSendingOtp}
                className="w-full py-4 px-5 rounded-2xl bg-[#C2410C] hover:bg-[#9A3412] disabled:opacity-60 text-white font-bold text-sm shadow-lg shadow-[#C2410C]/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                {isSendingOtp ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Verifying Fleet...</span>
                  </>
                ) : (
                  <>
                    <span>Send SMS Verification Code</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="flex items-center justify-between gap-1.5 sm:gap-2">
                {otpDigits.map((digit, i) => (
                  <input
                    key={i}
                    id={`driver-otp-${i}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(i, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(i, e)}
                    className="w-11 sm:w-12 h-14 text-center text-2xl font-black rounded-2xl border border-[#E7E0D8] bg-white text-[#1C1917] focus:outline-hidden focus:border-[#C2410C] focus:ring-2 focus:ring-[#C2410C]/20 transition-all shadow-2xs"
                    autoFocus={i === 0}
                  />
                ))}
              </div>

              <button
                type="submit"
                disabled={isVerifyingOtp}
                className="w-full py-4 px-5 rounded-2xl bg-[#C2410C] hover:bg-[#9A3412] disabled:opacity-60 text-white font-bold text-sm shadow-lg shadow-[#C2410C]/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                {isVerifyingOtp ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Verifying Code...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Verify & Open Driver Dashboard</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setAuthStep("phone");
                  setOtpDigits(["", "", "", "", "", ""]);
                  setAuthError("");
                }}
                className="w-full text-center text-xs font-semibold text-[#78716C] hover:text-[#1C1917] py-1"
              >
                Change mobile number (+91 {cleanEnteredPhone})
              </button>
            </form>
          )}

          <div className="pt-2 border-t border-[#E7E0D8] text-center">
            <p className="text-[11px] text-[#A8A29E]">
              Are you kitchen staff?{" "}
              <Link href="/admin" className="text-[#C2410C] font-bold hover:underline">
                Open Admin Portal
              </Link>
            </p>
          </div>
        </div>

        {/* Invisible ReCAPTCHA Container */}
        <div id="driver-login-recaptcha"></div>

        {/* Footer */}
        <footer className="text-center text-xs text-[#A8A29E] pt-6">
          © 2026 The Red Löffel Delivery Network • Greater Noida
        </footer>
      </div>
    );
  }

  // =========================================================================
  // VIEW B: AUTHENTICATED DRIVER DASHBOARD (ASSIGNED DELIVERIES & DOORSTEP)
  // =========================================================================
  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#1C1917] font-sans pb-16">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#E7E0D8] shadow-2xs">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden border border-[#E7E0D8] bg-[#FAF8F5] shrink-0">
              <Image
                src="/logo.jpeg"
                alt="The Red Löffel"
                width={40}
                height={40}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-sm sm:text-base text-[#1C1917]">
                  {loggedDriver.name}
                </h1>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold uppercase">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                  Active
                </span>
              </div>
              <p className="text-[11px] text-[#78716C] flex items-center gap-2">
                <span>{loggedDriver.phone}</span>
                <span>•</span>
                <span>{loggedDriver.vehicle}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={handleLogout}
              className="p-2 sm:px-3 sm:py-2 rounded-xl border border-[#E7E0D8] hover:bg-[#FAF8F5] text-xs font-bold text-[#78716C] hover:text-[#1C1917] flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Logout from driver portal"
            >
              <LogOut className="w-4 h-4 text-rose-600" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-5 space-y-5">
        {/* Sound & Web Push Permission Banner */}
        {notifPermission !== "granted" && (
          <div className="p-4 rounded-3xl bg-linear-to-r from-amber-50 to-orange-50 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                <BellRing className="w-5 h-5 animate-bounce" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-[#1C1917]">
                  Turn On Sound & Push Alerts
                </h3>
                <p className="text-xs text-[#78716C]">
                  Get instant audio chimes and screen popups when the kitchen assigns an order to you.
                </p>
              </div>
            </div>
            <button
              onClick={handleEnableNotifications}
              className="py-2.5 px-4 rounded-xl bg-[#C2410C] hover:bg-[#9A3412] text-white text-xs font-bold shrink-0 shadow-md shadow-[#C2410C]/20 transition-all cursor-pointer"
            >
              Enable Sound Alerts
            </button>
          </div>
        )}

        {/* Tab Switcher & Stats Bar */}
        <div className="grid grid-cols-2 gap-3 bg-white p-1.5 rounded-2xl border border-[#E7E0D8] shadow-2xs">
          <button
            type="button"
            onClick={() => setActiveTab("active")}
            className={`py-3 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === "active"
                ? "bg-[#C2410C] text-white shadow-md shadow-[#C2410C]/25"
                : "text-[#78716C] hover:text-[#1C1917]"
            }`}
          >
            <Bike className="w-4 h-4" />
            <span>Assigned Tasks</span>
            <span
              className={`px-2 py-0.5 rounded-full text-xs font-extrabold ${
                activeTab === "active" ? "bg-white/20 text-white" : "bg-black/5 text-[#1C1917]"
              }`}
            >
              {activeOrders.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("history")}
            className={`py-3 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === "history"
                ? "bg-[#C2410C] text-white shadow-md shadow-[#C2410C]/25"
                : "text-[#78716C] hover:text-[#1C1917]"
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Delivered Today</span>
            <span
              className={`px-2 py-0.5 rounded-full text-xs font-extrabold ${
                activeTab === "history" ? "bg-white/20 text-white" : "bg-black/5 text-[#1C1917]"
              }`}
            >
              {completedOrders.length}
            </span>
          </button>
        </div>

        {/* Summary Card for Today's Deliveries */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div className="bg-white p-4 rounded-2xl border border-[#E7E0D8] shadow-2xs">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#78716C] block">
              Active Deliveries
            </span>
            <span className="font-serif text-2xl font-black text-[#C2410C] mt-1 block">
              {activeOrders.length}
            </span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-[#E7E0D8] shadow-2xs">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#78716C] block">
              Completed Today
            </span>
            <span className="font-serif text-2xl font-black text-emerald-600 mt-1 block">
              {completedOrders.length}
            </span>
          </div>

          <div className="col-span-2 sm:col-span-1 bg-white p-4 rounded-2xl border border-[#E7E0D8] shadow-2xs">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#78716C] block">
              Cash Collected
            </span>
            <span className="font-serif text-2xl font-black text-[#1C1917] mt-1 block">
              ₹{totalCashCollectedToday}
            </span>
          </div>
        </div>

        {/* TAB 1: ACTIVE ASSIGNED DELIVERIES */}
        {activeTab === "active" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-lg font-bold text-[#1C1917]">
                Your Assigned Orders ({activeOrders.length})
              </h2>
              <span className="text-xs text-[#78716C]">
                Deliver at doorstep only
              </span>
            </div>

            {activeOrders.length === 0 ? (
              /* Empty State */
              <div className="bg-white rounded-3xl border border-[#E7E0D8] p-10 sm:p-14 text-center space-y-4 shadow-2xs">
                <div className="w-16 h-16 rounded-full bg-[#FAF8F5] border border-[#E7E0D8] text-[#C2410C] flex items-center justify-center mx-auto shadow-inner">
                  <Bike className="w-8 h-8 animate-pulse" />
                </div>
                <div className="max-w-xs mx-auto space-y-1">
                  <h3 className="font-serif text-lg font-bold text-[#1C1917]">
                    No Orders Assigned Yet
                  </h3>
                  <p className="text-xs text-[#78716C] leading-relaxed">
                    You are online and ready! Whenever the kitchen assigns an order to you, it will appear right here with an audio chime.
                  </p>
                </div>
              </div>
            ) : (
              /* List of Active Orders */
              <div className="space-y-4">
                {activeOrders.map((order) => {
                  const hasCoordinates = Boolean(order.address?.lat && order.address?.lng);
                  const googleMapsUrl = hasCoordinates
                    ? `https://www.google.com/maps/dir/?api=1&destination=${order.address!.lat},${order.address!.lng}`
                    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(order.address?.street || "Knowledge Park III, Greater Noida")}`;

                  return (
                    <div
                      key={order.id}
                      className="bg-white rounded-3xl border-2 border-[#FED7AA] p-5 sm:p-6 shadow-md space-y-4 relative overflow-hidden"
                    >
                      {/* Top Bar: Order ID & Status */}
                      <div className="flex items-start justify-between gap-3 border-b border-[#E7E0D8] pb-3.5">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-sm font-black text-[#1C1917]">
                              #{order.id}
                            </span>
                            <span className="px-2.5 py-0.5 rounded-full bg-orange-100 text-[#C2410C] text-[10px] font-extrabold uppercase">
                              {order.status}
                            </span>
                          </div>
                          <p className="text-xs text-[#78716C] mt-0.5">
                            Placed at {order.createdAt || "Recently"}
                          </p>
                        </div>

                        {/* Collect COD Badge */}
                        <div className="text-right">
                          <span className="text-[10px] uppercase font-bold text-[#78716C] block">
                            Collect on Delivery
                          </span>
                          <span className="font-serif text-xl sm:text-2xl font-black text-[#C2410C]">
                            ₹{order.total}
                          </span>
                        </div>
                      </div>

                      {/* Customer Info & 1-Click Call */}
                      <div className="p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#E7E0D8] flex items-center justify-between gap-3">
                        <div className="space-y-0.5">
                          <span className="text-[10px] uppercase font-bold text-[#A8A29E] block">
                            Customer Details
                          </span>
                          <p className="text-sm font-bold text-[#1C1917]">
                            {order.customerName}
                          </p>
                          <p className="text-xs text-[#78716C]">
                            {order.customerPhone}
                          </p>
                        </div>

                        {order.customerPhone && (
                          <a
                            href={`tel:${order.customerPhone.replace(/[^0-9+]/g, "")}`}
                            className="py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-600/20 transition-all shrink-0 cursor-pointer"
                          >
                            <Phone className="w-3.5 h-3.5" />
                            <span>Call Customer</span>
                          </a>
                        )}
                      </div>

                      {/* Delivery Address & 1-Click Google Maps */}
                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-3">
                          <div className="space-y-0.5">
                            <span className="text-[10px] uppercase font-bold text-[#A8A29E] block">
                              Delivery Location
                            </span>
                            <p className="text-xs sm:text-sm font-bold text-[#1C1917] leading-snug">
                              {order.address
                                ? `${order.address.house ? `${order.address.house}, ` : ""}${order.address.street || ""}`
                                : "Greater Noida Delivery Point"}
                            </p>
                            {order.address?.landmark && (
                              <p className="text-xs text-[#C2410C] font-semibold">
                                📍 Near {order.address.landmark}
                              </p>
                            )}
                          </div>

                          <a
                            href={googleMapsUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="py-2.5 px-3.5 rounded-xl bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-[#0284C7]/20 transition-all shrink-0 cursor-pointer"
                            title="Open Google Maps turn-by-turn navigation to customer's pinned coordinates"
                          >
                            <Navigation className="w-3.5 h-3.5" />
                            <span>Open Maps</span>
                          </a>
                        </div>
                      </div>

                      {/* Food Items Preview */}
                      <div className="pt-2 border-t border-[#E7E0D8]/80">
                        <span className="text-[10px] uppercase font-bold text-[#A8A29E] block mb-1">
                          Food Items ({order.items.reduce((acc, i) => acc + i.quantity, 0)})
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {order.items.map((item, idx) => (
                            <span
                              key={idx}
                              className="px-2.5 py-1 rounded-lg bg-[#FAF8F5] border border-[#E7E0D8] text-xs font-semibold text-[#1C1917]"
                            >
                              {item.quantity}x {item.name}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Primary Action Button: DELIVERED AT DOORSTEP */}
                      <div className="pt-2">
                        <button
                          type="button"
                          onClick={() => setConfirmDeliveryOrder(order)}
                          className="w-full py-4 px-5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm sm:text-base shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 transition-all active:scale-98 cursor-pointer"
                        >
                          <CheckCircle2 className="w-5 h-5" />
                          <span>Delivered at Doorstep</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: DELIVERED TODAY (HISTORY & EARNINGS) */}
        {activeTab === "history" && (
          <div className="space-y-4">
            <h2 className="font-serif text-lg font-bold text-[#1C1917]">
              Today&apos;s Delivered Orders ({completedOrders.length})
            </h2>

            {completedOrders.length === 0 ? (
              <div className="bg-white rounded-3xl border border-[#E7E0D8] p-10 text-center space-y-2 shadow-2xs">
                <p className="text-xs text-[#78716C]">
                  No completed deliveries recorded yet today.
                </p>
              </div>
            ) : (
              <div className="bg-white rounded-3xl border border-[#E7E0D8] divide-y divide-[#E7E0D8] shadow-2xs overflow-hidden">
                {completedOrders.map((order) => (
                  <div key={order.id} className="p-4 sm:p-5 flex items-center justify-between gap-3">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm font-bold text-[#1C1917]">
                          #{order.id}
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                          ✓ Delivered
                        </span>
                      </div>
                      <p className="text-xs text-[#78716C]">
                        {order.customerName} • {order.items.length} items
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="font-serif text-base font-black text-[#1C1917]">
                        ₹{order.total}
                      </span>
                      <span className="text-[10px] text-emerald-600 font-bold block">
                        COD Collected
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Doorstep Delivery Confirmation Modal */}
      {confirmDeliveryOrder && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setConfirmDeliveryOrder(null);
          }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in"
        >
          <div className="bg-white rounded-3xl border border-[#E7E0D8] max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="font-serif text-xl font-bold text-[#1C1917]">
                Confirm Doorstep Delivery?
              </h3>
              <p className="text-xs text-[#78716C] leading-relaxed">
                Order <strong>#{confirmDeliveryOrder.id}</strong> will be marked as completed. Please ensure you have handed over the meal and collected the cash amount.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#E7E0D8] flex items-center justify-between">
              <span className="text-xs font-semibold text-[#78716C]">Cash Amount to Collect:</span>
              <span className="font-serif text-xl font-black text-emerald-600">
                ₹{confirmDeliveryOrder.total}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setConfirmDeliveryOrder(null)}
                className="py-3 px-4 rounded-xl border border-[#E7E0D8] text-xs font-bold text-[#78716C] hover:bg-[#FAF8F5] transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDoorstepDelivery}
                className="py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold shadow-md shadow-emerald-600/25 transition-all cursor-pointer"
              >
                Yes, Delivered!
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
