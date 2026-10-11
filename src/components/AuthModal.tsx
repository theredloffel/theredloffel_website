"use client";

import React, { useState, useEffect, useRef } from "react";
import { useKitchen } from "@/context/KitchenContext";
import {
  X,
  Phone,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  RotateCcw,
  CheckCircle2,
  User,
  UserCheck,
  MapPin,
  Crosshair,
  Search,
  Home,
  Briefcase,
  Building,
  Check,
  ChevronRight,
  ArrowLeft,
  ShoppingBag,
  BookOpen,
  Share2,
  Info,
  Bell,
  LogOut,
  Plus,
  Pin,
} from "lucide-react";
import { AddAddressFlowModal } from "@/components/AddAddressFlowModal";

type AuthStep = "phone" | "otp" | "location";
type Step3SubView = "map" | "form";
type ProfileViewType = "main" | "orders" | "addresses" | "about" | "notifications";

export function AuthModal() {
  const {
    isAuthOpen,
    setIsAuthOpen,
    user,
    loginWithPhone,
    logout,
    locationLabel,
    setLocationLabel,
    locationAddress,
    setLocationAddress,
    savedLocations,
    addSavedLocation,
    setIsLocationModalOpen,
    showToast,
  } = useKitchen();

  const [phone, setPhone] = useState(user.phone || "");
  const [step, setStep] = useState<AuthStep>("phone");
  const [otpDigits, setOtpDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const [timer, setTimer] = useState(30);
  const [isVerifying, setIsVerifying] = useState(false);
  const [phoneError, setPhoneError] = useState("");

  // Profile Sub-views (Your account, orders, addresses, etc.)
  const [profileView, setProfileView] = useState<ProfileViewType>("main");
  const [showShareBanner, setShowShareBanner] = useState(true);
  const [isAddAddressFlowOpen, setIsAddAddressFlowOpen] = useState(false);
  const [notifPreferences, setNotifPreferences] = useState({
    orderUpdates: true,
    whatsapp: true,
    offers: false,
  });

  // Step 3 Sub-view: "map" (pin picker like screenshot) | "form" (name, address, flat, save as)
  const [step3View, setStep3View] = useState<Step3SubView>("map");

  // Step 3 Form State
  const [nameInput, setNameInput] = useState(user.name || "");
  const [nameError, setNameError] = useState("");
  const [addressInput, setAddressInput] = useState(
    "Raghuma Boys Hostel Block C, Knowledge Park III"
  );
  const [addressError, setAddressError] = useState("");
  const [detailInput, setDetailInput] = useState("");
  const [locationTag, setLocationTag] = useState<"HOME" | "WORK" | "HOSTEL" | "OTHER">("HOSTEL");

  // Map state inside Step 3
  const [mapOffset, setMapOffset] = useState({ x: 0, y: 0 });
  const [isDraggingMap, setIsDraggingMap] = useState(false);
  const dragStartRef = useRef({ mouseX: 0, mouseY: 0, startOffsetX: 0, startOffsetY: 0 });
  const [currentLocality, setCurrentLocality] = useState("Knowledge Park III");
  const [currentCity, setCurrentCity] = useState("Greater Noida");
  const [mapSearchQuery, setMapSearchQuery] = useState("");
  const [isSearchDropdownOpen, setIsSearchDropdownOpen] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (step === "otp" && timer > 0) {
      interval = setInterval(() => setTimer((t) => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  if (!isAuthOpen) return null;

  // STEP 1: Phone submit
  const handlePhoneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPhone = phone.replace(/\D/g, "");
    if (cleanPhone.length !== 10) {
      setPhoneError("Please enter a valid 10-digit mobile number");
      return;
    }
    setPhoneError("");
    setStep("otp");
    setTimer(30);
    showToast("OTP sent: 123456 (demo code)", "info");
  };

  // STEP 2: OTP handlers
  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otpDigits];
    newOtp[index] = value.slice(-1);
    setOtpDigits(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`auth-otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      const prevInput = document.getElementById(`auth-otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleAutoFillDemoOtp = () => {
    setOtpDigits(["1", "2", "3", "4", "5", "6"]);
  };

  const handleVerifyOtp = () => {
    const code = otpDigits.join("");
    if (code.length < 6) {
      showToast("Please enter complete 6-digit code", "warning");
      return;
    }
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      // Advance to step 3 directly in map pin view!
      setStep("location");
      setStep3View("map");
      if (!nameInput && user.name) setNameInput(user.name);
      showToast("Phone verified! Pin your delivery location on map.", "success");
    }, 500);
  };

  // Map Dragging / Panning Handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDraggingMap(true);
    dragStartRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      startOffsetX: mapOffset.x,
      startOffsetY: mapOffset.y,
    };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingMap) return;
    const deltaX = e.clientX - dragStartRef.current.mouseX;
    const deltaY = e.clientY - dragStartRef.current.mouseY;
    setMapOffset({
      x: dragStartRef.current.startOffsetX + deltaX,
      y: dragStartRef.current.startOffsetY + deltaY,
    });
  };

  const handleMouseUp = () => {
    if (!isDraggingMap) return;
    setIsDraggingMap(false);
    updateLocationFromOffset(mapOffset.x, mapOffset.y);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length !== 1) return;
    setIsDraggingMap(true);
    dragStartRef.current = {
      mouseX: e.touches[0].clientX,
      mouseY: e.touches[0].clientY,
      startOffsetX: mapOffset.x,
      startOffsetY: mapOffset.y,
    };
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDraggingMap || e.touches.length !== 1) return;
    const deltaX = e.touches[0].clientX - dragStartRef.current.mouseX;
    const deltaY = e.touches[0].clientY - dragStartRef.current.mouseY;
    setMapOffset({
      x: dragStartRef.current.startOffsetX + deltaX,
      y: dragStartRef.current.startOffsetY + deltaY,
    });
  };

  const handleTouchEnd = () => {
    setIsDraggingMap(false);
    updateLocationFromOffset(mapOffset.x, mapOffset.y);
  };

  const updateLocationFromOffset = (x: number, y: number) => {
    if (Math.abs(x) < 70 && Math.abs(y) < 70) {
      setCurrentLocality("Knowledge Park III");
      setCurrentCity("Greater Noida");
      setAddressInput("Raghuma Boys Hostel Block C, Knowledge Park III");
    } else if (x > 50) {
      setCurrentLocality("Knowledge Park III (East)");
      setCurrentCity("Greater Noida");
      setAddressInput("Near RCI Vidya Vihar, Knowledge Park III, Greater Noida");
    } else {
      setCurrentLocality("Circle Cafe / Sector Road");
      setCurrentCity("Greater Noida");
      setAddressInput("Near The Circle Cafe, Knowledge Park III, Greater Noida");
    }
  };

  const handleCenterGPS = () => {
    setMapOffset({ x: 0, y: 0 });
    setCurrentLocality("Knowledge Park III");
    setCurrentCity("Greater Noida");
    setAddressInput("Raghuma Boys Hostel Block C, Knowledge Park III");
    showToast("GPS centered on Raghuma Boys Hostel (~10m)", "success");
  };

  // Transition from Map view to Address Details form
  const handleProceedToAddDetails = () => {
    setStep3View("form");
  };

  // STEP 3: Final Form Submit
  const handleLocationSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!nameInput.trim()) {
      setNameError("Please enter your name");
      return;
    }
    setNameError("");

    if (!addressInput.trim()) {
      setAddressError("Please enter delivery address / building / street");
      return;
    }
    setAddressError("");

    const finalName = nameInput.trim();
    const finalAddress = addressInput.trim();
    const finalDetail = detailInput.trim();

    // 1. Add to saved locations and set as active location
    addSavedLocation({
      label: locationTag,
      address: finalAddress,
      detail: finalDetail,
    });

    // 2. Complete login with phone and name
    loginWithPhone(phone, finalName);

    // 3. Close modal & reset
    setIsAuthOpen(false);
    setStep("phone");
    setStep3View("map");
    setOtpDigits(["", "", "", "", "", ""]);
    showToast(`Welcome, ${finalName}! Address saved to ${locationTag}`, "success");
  };

  const handleClose = () => {
    setIsAuthOpen(false);
    setProfileView("main");
    setStep("phone");
    setStep3View("map");
    setOtpDigits(["", "", "", "", "", ""]);
  };

  const DEMO_PAST_ORDERS = [
    {
      id: "ord-881",
      status: "Order arrived",
      price: 213,
      date: "17 Jul, 6:51 pm",
      items: [
        { name: "Aloo Tikki Burger", image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=200&q=80" },
        { name: "Butter Maggi Bowl", image: "https://images.unsplash.com/photo-1612927601601-6638404737ce?auto=format&fit=crop&w=200&q=80" },
      ],
    },
    {
      id: "ord-882",
      status: "Order arrived",
      price: 302,
      date: "17 Jul, 10:24 am",
      items: [
        { name: "Aloo Pyaaz Paratha", image: "https://images.unsplash.com/photo-1626074353765-517a681e40be?auto=format&fit=crop&w=200&q=80" },
        { name: "Cold Coffee", image: "https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?auto=format&fit=crop&w=200&q=80" },
        { name: "Paneer Burger", image: "https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=200&q=80" },
      ],
    },
    {
      id: "ord-883",
      status: "Order arrived",
      price: 220,
      date: "16 Jul, 8:53 pm",
      items: [
        { name: "Cheese Maggi", image: "https://images.unsplash.com/photo-1612927601601-6638404737ce?auto=format&fit=crop&w=200&q=80" },
        { name: "Fresh Lime Soda", image: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=200&q=80" },
      ],
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-5 bg-black/60 backdrop-blur-xs">
      <div className="relative w-full max-w-lg sm:max-w-xl max-h-[90vh] sm:max-h-[92vh] overflow-y-auto bg-[#FAF8F5] rounded-t-3xl sm:rounded-4xl border-t sm:border border-[#E7E0D8] shadow-2xl p-5 sm:p-7 md:p-8">
        {/* Mobile handle indicator */}
        <div className="w-12 h-1.5 bg-[#D6D3D1] rounded-full mx-auto mb-3 sm:hidden" />

        {/* Subtle decorative background gradient */}
        <div className="absolute top-0 right-0 w-52 h-52 bg-[#FED7AA]/35 rounded-full blur-3xl pointer-events-none -mr-16 -mt-16"></div>

        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 sm:top-5 sm:right-5 w-9 h-9 rounded-full border border-[#E7E0D8] bg-white flex items-center justify-center text-[#78716C] hover:text-[#1C1917] hover:border-[#1C1917] transition-all shadow-2xs z-30"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {user.isLoggedIn ? (
          /* ======================================================== */
          /* LOGGED IN USER PROFILE FLOW (MATCHING SCREENSHOTS)       */
          /* Only includes:                                           */
          /* - your account & number                                  */
          /* - YOUR INFORMATION: your orders, address book            */
          /* - OTHER INFORMATION: share, about us, notification, logout */
          /* ======================================================== */
          <div>
            {/* ---------------------------------------------------- */}
            {/* VIEW 1: MAIN PROFILE MENU                            */}
            {/* ---------------------------------------------------- */}
            {profileView === "main" && (
              <div>
                {/* Header Back & Title */}
                <div className="flex items-center gap-2 pb-2.5 border-b border-[#E7E0D8]">
                  <button
                    onClick={handleClose}
                    className="w-8 h-8 -ml-1 rounded-full hover:bg-black/5 flex items-center justify-center text-[#1C1917] transition-colors"
                    aria-label="Back"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <h3 className="font-bold text-lg text-[#1C1917]">Profile</h3>
                </div>

                {/* Title & Phone Number Section */}
                <div className="pt-4 pb-2">
                  <h2 className="font-serif text-2xl sm:text-3xl font-extrabold text-[#1C1917] tracking-tight">
                    Your account
                  </h2>
                  <div className="flex items-center gap-2 mt-1.5 text-sm font-semibold text-[#57534E]">
                    <Phone className="w-4 h-4 text-[#78716C]" />
                    <span>{user.phone || "6297673521"}</span>
                    {user.name && (
                      <span className="text-xs text-[#A8A29E] font-medium ml-1">({user.name})</span>
                    )}
                  </div>
                </div>

                {/* 1. YOUR INFORMATION SECTION */}
                <div className="mt-5">
                  <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#78716C] block mb-2 px-1">
                    YOUR INFORMATION
                  </span>
                  <div className="bg-white rounded-2xl border border-[#E7E0D8] divide-y divide-[#E7E0D8] shadow-2xs overflow-hidden">
                    {/* Your orders */}
                    <button
                      type="button"
                      onClick={() => setProfileView("orders")}
                      className="w-full p-4 flex items-center justify-between hover:bg-[#FAF8F5] transition-colors text-left group"
                    >
                      <div className="flex items-center gap-3.5">
                        <div className="w-10 h-10 rounded-2xl bg-[#EDE9FE] text-[#7C3AED] flex items-center justify-center shrink-0">
                          <ShoppingBag className="w-5 h-5" />
                        </div>
                        <span className="text-base font-bold text-[#1C1917] group-hover:text-[#C2410C] transition-colors">
                          Your orders
                        </span>
                      </div>
                      <ChevronRight className="w-5 h-5 text-[#A8A29E] group-hover:text-[#1C1917] transition-colors" />
                    </button>

                    {/* Address book */}
                    <button
                      type="button"
                      onClick={() => setProfileView("addresses")}
                      className="w-full p-4 flex items-center justify-between hover:bg-[#FAF8F5] transition-colors text-left group"
                    >
                      <div className="flex items-center gap-3.5">
                        <div className="w-10 h-10 rounded-2xl bg-[#E0F2FE] text-[#0284C7] flex items-center justify-center shrink-0">
                          <BookOpen className="w-5 h-5" />
                        </div>
                        <span className="text-base font-bold text-[#1C1917] group-hover:text-[#C2410C] transition-colors">
                          Address book
                        </span>
                      </div>
                      <ChevronRight className="w-5 h-5 text-[#A8A29E] group-hover:text-[#1C1917] transition-colors" />
                    </button>
                  </div>
                </div>

                {/* 2. OTHER INFORMATION SECTION */}
                <div className="mt-6">
                  <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#78716C] block mb-2 px-1">
                    OTHER INFORMATION
                  </span>
                  <div className="bg-white rounded-2xl border border-[#E7E0D8] divide-y divide-[#E7E0D8] shadow-2xs overflow-hidden">
                    {/* Share the app */}
                    <button
                      type="button"
                      onClick={() => {
                        if (typeof navigator !== "undefined" && navigator.share) {
                          navigator
                            .share({
                              title: "The Red Löffel",
                              text: "Order gourmet bowls & burgers from The Red Löffel!",
                              url: window.location.origin,
                            })
                            .catch(() => {});
                        } else {
                          navigator.clipboard?.writeText(window.location.origin);
                          showToast("The Red Löffel link copied to clipboard!", "success");
                        }
                      }}
                      className="w-full p-4 flex items-center justify-between hover:bg-[#FAF8F5] transition-colors text-left group"
                    >
                      <div className="flex items-center gap-3.5">
                        <div className="w-10 h-10 rounded-2xl bg-[#F3F4F6] text-[#4B5563] flex items-center justify-center shrink-0">
                          <Share2 className="w-5 h-5" />
                        </div>
                        <span className="text-base font-bold text-[#1C1917] group-hover:text-[#C2410C] transition-colors">
                          Share the app
                        </span>
                      </div>
                      <ChevronRight className="w-5 h-5 text-[#A8A29E] group-hover:text-[#1C1917] transition-colors" />
                    </button>

                    {/* About us */}
                    <button
                      type="button"
                      onClick={() => setProfileView("about")}
                      className="w-full p-4 flex items-center justify-between hover:bg-[#FAF8F5] transition-colors text-left group"
                    >
                      <div className="flex items-center gap-3.5">
                        <div className="w-10 h-10 rounded-2xl bg-[#F3F4F6] text-[#4B5563] flex items-center justify-center shrink-0">
                          <Info className="w-5 h-5" />
                        </div>
                        <span className="text-base font-bold text-[#1C1917] group-hover:text-[#C2410C] transition-colors">
                          About us
                        </span>
                      </div>
                      <ChevronRight className="w-5 h-5 text-[#A8A29E] group-hover:text-[#1C1917] transition-colors" />
                    </button>

                    {/* Notification preferences */}
                    <button
                      type="button"
                      onClick={() => setProfileView("notifications")}
                      className="w-full p-4 flex items-center justify-between hover:bg-[#FAF8F5] transition-colors text-left group"
                    >
                      <div className="flex items-center gap-3.5">
                        <div className="w-10 h-10 rounded-2xl bg-[#F3F4F6] text-[#4B5563] flex items-center justify-center shrink-0">
                          <Bell className="w-5 h-5" />
                        </div>
                        <span className="text-base font-bold text-[#1C1917] group-hover:text-[#C2410C] transition-colors">
                          Notification preferences
                        </span>
                      </div>
                      <ChevronRight className="w-5 h-5 text-[#A8A29E] group-hover:text-[#1C1917] transition-colors" />
                    </button>

                    {/* Log out */}
                    <button
                      type="button"
                      onClick={() => {
                        logout();
                        setProfileView("main");
                        showToast("Logged out successfully", "info");
                      }}
                      className="w-full p-4 flex items-center justify-between hover:bg-red-50/50 transition-colors text-left group"
                    >
                      <div className="flex items-center gap-3.5">
                        <div className="w-10 h-10 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center shrink-0">
                          <LogOut className="w-5 h-5" />
                        </div>
                        <span className="text-base font-bold text-red-600 group-hover:text-red-700 transition-colors">
                          Log out
                        </span>
                      </div>
                      <ChevronRight className="w-5 h-5 text-red-300 group-hover:text-red-600 transition-colors" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ---------------------------------------------------- */}
            {/* VIEW 2: YOUR ORDERS (MATCHING SCREENSHOT 2)          */}
            {/* ---------------------------------------------------- */}
            {profileView === "orders" && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-3 border-b border-[#E7E0D8]">
                  <button
                    onClick={() => setProfileView("main")}
                    className="w-8 h-8 -ml-1 rounded-full hover:bg-black/5 flex items-center justify-center text-[#1C1917] transition-colors"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <h3 className="font-bold text-lg text-[#1C1917]">Your orders</h3>
                </div>

                <div className="space-y-3.5 max-h-[68vh] overflow-y-auto pr-1">
                  {DEMO_PAST_ORDERS.map((order) => (
                    <div
                      key={order.id}
                      className="bg-white rounded-2xl border border-[#E7E0D8] shadow-2xs overflow-hidden"
                    >
                      <div className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                              <Check className="w-4 h-4 stroke-[3]" />
                            </div>
                            <div>
                              <h4 className="font-bold text-base text-[#1C1917]">
                                {order.status}
                              </h4>
                              <p className="text-xs text-[#78716C]">
                                ₹{order.price} • {order.date}
                              </p>
                            </div>
                          </div>
                          <ChevronRight className="w-5 h-5 text-[#A8A29E]" />
                        </div>

                        {/* Dish Thumbnails */}
                        <div className="flex items-center gap-2.5 mt-3.5">
                          {order.items.map((item, idx) => (
                            <div
                              key={idx}
                              className="w-14 h-14 rounded-xl overflow-hidden border border-[#E7E0D8] bg-[#FAF8F5] relative shrink-0"
                            >
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Reorder and Rate Order Action Buttons */}
                      <div className="grid grid-cols-2 border-t border-[#E7E0D8] bg-[#FAF8F5]/50">
                        <button
                          type="button"
                          onClick={() => {
                            showToast("Order items added to your cart!", "success");
                          }}
                          className="py-3 text-center text-sm font-bold text-emerald-700 hover:bg-emerald-50/80 transition-colors"
                        >
                          Reorder
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            showToast("Thank you for rating 5 stars! ⭐⭐⭐⭐⭐", "success");
                          }}
                          className="py-3 text-center text-sm font-bold text-emerald-700 border-l border-[#E7E0D8] hover:bg-emerald-50/80 transition-colors"
                        >
                          Rate order
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ---------------------------------------------------- */}
            {/* VIEW 3: ADDRESS BOOK (MATCHING SCREENSHOT 3)         */}
            {/* ---------------------------------------------------- */}
            {profileView === "addresses" && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-3 border-b border-[#E7E0D8]">
                  <button
                    onClick={() => setProfileView("main")}
                    className="w-8 h-8 -ml-1 rounded-full hover:bg-black/5 flex items-center justify-center text-[#1C1917] transition-colors"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <h3 className="font-bold text-lg text-[#1C1917]">My addresses</h3>
                </div>

                {/* + Add new address Card (First Map -> Then Additional Details -> Then Add) */}
                <button
                  type="button"
                  onClick={() => setIsAddAddressFlowOpen(true)}
                  className="w-full p-4 rounded-2xl bg-white border border-[#E7E0D8] hover:border-emerald-600 flex items-center justify-between shadow-2xs group transition-all text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                      <Plus className="w-4 h-4 stroke-[3]" />
                    </div>
                    <span className="font-bold text-sm text-emerald-700 group-hover:text-emerald-800 transition-colors">
                      Add new address
                    </span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-[#A8A29E]" />
                </button>

                {/* Unified Add Address Flow Modal */}
                <AddAddressFlowModal
                  isOpen={isAddAddressFlowOpen}
                  onClose={() => setIsAddAddressFlowOpen(false)}
                />

                <div className="pt-1">
                  <span className="text-xs font-bold text-[#78716C] uppercase tracking-wider block mb-2 px-1">
                    Your saved addresses
                  </span>

                  <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
                    {/* Card 1: Home (raghuma boys hostel) */}
                    <div
                      onClick={() => {
                        setLocationLabel("HOME");
                        setLocationAddress(
                          "raghuma boys hostel block c, near sharda university, Knowledge Park III, Greater Noida"
                        );
                        showToast("Delivery address set to Home", "success");
                      }}
                      className={`p-4 rounded-2xl bg-white border transition-all cursor-pointer relative shadow-2xs ${
                        locationLabel === "HOME"
                          ? "border-emerald-500 ring-2 ring-emerald-500/15"
                          : "border-[#E7E0D8] hover:border-[#1C1917]"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <div className="flex flex-col items-center">
                            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                              <Home className="w-5 h-5" />
                            </div>
                            <span className="text-[9px] font-bold text-emerald-700 mt-1 bg-emerald-100/70 px-1.5 py-0.5 rounded-full whitespace-nowrap">
                              You&apos;re here
                            </span>
                          </div>
                          <div>
                            <h4 className="font-bold text-base text-[#1C1917]">Home</h4>
                            <p className="text-xs text-[#57534E] mt-1 leading-relaxed">
                              raghuma boys hostel block c, near sharda university, Knowledge Park III,
                              Greater Noida
                            </p>
                            <p className="text-xs font-semibold text-[#78716C] mt-1.5">
                              Phone number:{" "}
                              <span className="text-[#1C1917]">
                                {user.phone || "6297673521"}
                              </span>
                            </p>
                          </div>
                        </div>
                        <Pin className="w-4 h-4 text-[#A8A29E] shrink-0" />
                      </div>

                      {/* Share banner from screenshot 3 */}
                      {showShareBanner && (
                        <div className="mt-3 p-2.5 rounded-xl bg-[#FFF7ED] border border-[#FFEDD5] flex items-center justify-between text-xs text-[#9A3412]">
                          <div className="flex items-center gap-2">
                            <Share2 className="w-3.5 h-3.5 text-[#C2410C]" />
                            <span className="font-medium">
                              Now share your addresses with friends and family
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowShareBanner(false);
                            }}
                            className="text-[#9A3412] hover:text-[#C2410C] p-0.5"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Card 2: Sharda University */}
                    <div
                      onClick={() => {
                        setLocationLabel("Sharda University");
                        setLocationAddress(
                          "sharda university, 2 Floor, vivekanand hostel, Sharda University, Knowledge Park III, Greater Noida"
                        );
                        showToast("Delivery address set to Sharda University", "success");
                      }}
                      className={`p-4 rounded-2xl bg-white border transition-all cursor-pointer relative shadow-2xs ${
                        locationLabel === "Sharda University"
                          ? "border-emerald-500 ring-2 ring-emerald-500/15"
                          : "border-[#E7E0D8] hover:border-[#1C1917]"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <div className="flex flex-col items-center">
                            <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center">
                              <MapPin className="w-5 h-5" />
                            </div>
                            <span className="text-[9px] font-bold text-teal-700 mt-1 bg-teal-100/70 px-1.5 py-0.5 rounded-full whitespace-nowrap">
                              481.10 m
                            </span>
                          </div>
                          <div>
                            <h4 className="font-bold text-base text-[#1C1917]">
                              Sharda University
                            </h4>
                            <p className="text-xs text-[#57534E] mt-1 leading-relaxed">
                              sharda university, 2 Floor, vivekanand hostel, Sharda University,
                              Knowledge Park III, Greater Noida
                            </p>
                            <p className="text-xs font-semibold text-[#78716C] mt-1.5">
                              Phone number:{" "}
                              <span className="text-[#1C1917]">
                                {user.phone || "6297673521"}
                              </span>
                            </p>
                          </div>
                        </div>
                        <Pin className="w-4 h-4 text-[#A8A29E] shrink-0" />
                      </div>
                    </div>

                    {/* Card 3: Casaballa Living */}
                    <div
                      onClick={() => {
                        setLocationLabel("HOME");
                        setLocationAddress(
                          "Casaballa living, near vsk garden, Knowledge Park III, Greater Noida"
                        );
                        showToast("Delivery address set to Casaballa living", "success");
                      }}
                      className="p-4 rounded-2xl bg-white border border-[#E7E0D8] hover:border-[#1C1917] transition-all cursor-pointer relative shadow-2xs"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <div className="flex flex-col items-center">
                            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                              <Home className="w-5 h-5" />
                            </div>
                            <span className="text-[9px] font-bold text-emerald-700 mt-1 bg-emerald-100/70 px-1.5 py-0.5 rounded-full whitespace-nowrap">
                              1.98 km
                            </span>
                          </div>
                          <div>
                            <h4 className="font-bold text-base text-[#1C1917]">Home</h4>
                            <p className="text-xs text-[#57534E] mt-1 leading-relaxed">
                              Casaballa living, near vsk garden, Knowledge Park III, Greater Noida
                            </p>
                            <p className="text-xs font-semibold text-[#78716C] mt-1.5">
                              Phone number: <span className="text-[#1C1917]">8900593986</span>
                            </p>
                          </div>
                        </div>
                        <Pin className="w-4 h-4 text-[#A8A29E] shrink-0" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ---------------------------------------------------- */}
            {/* VIEW 4: ABOUT US                                     */}
            {/* ---------------------------------------------------- */}
            {profileView === "about" && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-3 border-b border-[#E7E0D8]">
                  <button
                    onClick={() => setProfileView("main")}
                    className="w-8 h-8 -ml-1 rounded-full hover:bg-black/5 flex items-center justify-center text-[#1C1917] transition-colors"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <h3 className="font-bold text-lg text-[#1C1917]">About us</h3>
                </div>
                <div className="bg-white rounded-2xl border border-[#E7E0D8] p-5 space-y-3.5 shadow-2xs">
                  <div className="w-12 h-12 rounded-2xl bg-[#C2410C] text-white flex items-center justify-center font-serif font-black text-xl shadow-md shadow-[#C2410C]/25">
                    TL
                  </div>
                  <h3 className="font-serif text-xl font-bold text-[#1C1917]">The Red Löffel</h3>
                  <p className="text-xs text-[#78716C] leading-relaxed">
                    The Red Löffel is an artisanal gourmet cloud kitchen located in Knowledge Park
                    III, Greater Noida. We handcraft artisanal burgers, rice bowls, loaded fries,
                    and cold beverages prepared fresh with 100% premium ingredients.
                  </p>
                  <div className="pt-2 border-t border-[#E7E0D8] text-xs text-[#57534E] space-y-1.5 font-medium">
                    <p>📍 Kitchen: Knowledge Park III, Near Sharda University, Greater Noida</p>
                    <p>⏰ Open Hours: 11:00 AM – 11:45 PM Daily</p>
                    <p>📞 Phone: +91 6297673521</p>
                  </div>
                </div>
              </div>
            )}

            {/* ---------------------------------------------------- */}
            {/* VIEW 5: NOTIFICATION PREFERENCES                     */}
            {/* ---------------------------------------------------- */}
            {profileView === "notifications" && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-3 border-b border-[#E7E0D8]">
                  <button
                    onClick={() => setProfileView("main")}
                    className="w-8 h-8 -ml-1 rounded-full hover:bg-black/5 flex items-center justify-center text-[#1C1917] transition-colors"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <h3 className="font-bold text-lg text-[#1C1917]">
                    Notification preferences
                  </h3>
                </div>
                <div className="bg-white rounded-2xl border border-[#E7E0D8] divide-y divide-[#E7E0D8] shadow-2xs overflow-hidden">
                  <div className="p-4 flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-sm text-[#1C1917]">Order Status Alerts</h4>
                      <p className="text-xs text-[#78716C]">
                        Receive real-time order updates via SMS & WhatsApp
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={notifPreferences.orderUpdates}
                      onChange={(e) =>
                        setNotifPreferences((prev) => ({
                          ...prev,
                          orderUpdates: e.target.checked,
                        }))
                      }
                      className="w-5 h-5 accent-[#C2410C] rounded cursor-pointer"
                    />
                  </div>
                  <div className="p-4 flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-sm text-[#1C1917]">WhatsApp Receipts</h4>
                      <p className="text-xs text-[#78716C]">
                        Get digital bills and rider tracking links on WhatsApp
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={notifPreferences.whatsapp}
                      onChange={(e) =>
                        setNotifPreferences((prev) => ({
                          ...prev,
                          whatsapp: e.target.checked,
                        }))
                      }
                      className="w-5 h-5 accent-[#C2410C] rounded cursor-pointer"
                    />
                  </div>
                  <div className="p-4 flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-sm text-[#1C1917]">Exclusive Offers</h4>
                      <p className="text-xs text-[#78716C]">
                        Weekend discount vouchers and special menu drops
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={notifPreferences.offers}
                      onChange={(e) =>
                        setNotifPreferences((prev) => ({
                          ...prev,
                          offers: e.target.checked,
                        }))
                      }
                      className="w-5 h-5 accent-[#C2410C] rounded cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* ======================================================== */
          /* 3-STEP LOGIN FLOW                                        */
          /* Step 1: Phone                                            */
          /* Step 2: OTP                                              */
          /* Step 3: Map Pin -> Address Details (All in Step 3!)      */
          /* ======================================================== */
          <div>
            {/* Header Titles */}
            <div className="mb-5 text-center sm:text-left">
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#1C1917]">
                {step === "phone" && "Sign In with Mobile"}
                {step === "otp" && "Verify OTP Code"}
                {step === "location" &&
                  (step3View === "map" ? "Pin Your Location on Map" : "Complete Address Details")}
              </h2>
              <p className="text-xs text-[#78716C] mt-1 leading-relaxed">
                {step === "phone" &&
                  "Enter your 10-digit mobile number to view orders and receive updates."}
                {step === "otp" &&
                  `Enter the 6-digit verification code sent to +91 ${phone}.`}
                {step === "location" &&
                  (step3View === "map"
                    ? "Adjust the pin on the map to set where we should deliver your food."
                    : "Enter your name, flat, and save your address tag.")}
              </p>
            </div>

            {/* -------------------------------------------------------- */}
            {/* STEP 1: PHONE NUMBER ONLY                                */}
            {/* -------------------------------------------------------- */}
            {step === "phone" && (
              <form onSubmit={handlePhoneSubmit} className="space-y-4">
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
                      value={phone}
                      onChange={(e) => {
                        setPhone(e.target.value.replace(/\D/g, ""));
                        setPhoneError("");
                      }}
                      placeholder="98765 43210"
                      className="w-full px-4 py-3.5 rounded-r-2xl border border-[#E7E0D8] bg-white text-base text-[#1C1917] font-bold tracking-wider placeholder:text-[#A8A29E] focus:outline-hidden focus:border-[#C2410C] focus:ring-2 focus:ring-[#C2410C]/20 transition-all"
                      required
                    />
                  </div>
                  {phoneError && (
                    <p className="text-xs text-red-600 font-semibold mt-1">{phoneError}</p>
                  )}
                </div>

                <div className="pt-1">
                  <button
                    type="submit"
                    className="w-full py-4 px-5 rounded-2xl bg-[#C2410C] hover:bg-[#9A3412] text-white font-bold text-base shadow-lg shadow-[#C2410C]/25 flex items-center justify-center gap-2.5 transition-all active:scale-98"
                  >
                    <span>Get Verification OTP</span>
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </form>
            )}

            {/* -------------------------------------------------------- */}
            {/* STEP 2: OTP VERIFICATION                                 */}
            {/* -------------------------------------------------------- */}
            {step === "otp" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-1.5 sm:gap-2.5">
                  {otpDigits.map((digit, i) => (
                    <input
                      key={i}
                      id={`auth-otp-${i}`}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(i, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(i, e)}
                      className="w-11 sm:w-13 h-14 sm:h-16 text-center text-2xl font-black rounded-2xl border border-[#E7E0D8] bg-white text-[#1C1917] focus:outline-hidden focus:border-[#C2410C] focus:ring-2 focus:ring-[#C2410C]/20 transition-all shadow-2xs"
                      autoFocus={i === 0}
                    />
                  ))}
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <button
                    type="button"
                    onClick={handleAutoFillDemoOtp}
                    className="flex items-center gap-1.5 text-[#C2410C] font-bold hover:underline"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    Auto-fill Demo OTP (123456)
                  </button>

                  {timer > 0 ? (
                    <span className="text-[#78716C] font-semibold">Resend in {timer}s</span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setTimer(30);
                        showToast("New OTP sent: 123456", "info");
                      }}
                      className="flex items-center gap-1 text-[#1C1917] font-bold hover:text-[#C2410C]"
                    >
                      <RotateCcw className="w-3 h-3" /> Resend Code
                    </button>
                  )}
                </div>

                <div className="pt-1 flex flex-col gap-2.5">
                  <button
                    type="button"
                    onClick={handleVerifyOtp}
                    disabled={isVerifying}
                    className="w-full py-4 px-5 rounded-2xl bg-[#C2410C] hover:bg-[#9A3412] text-white font-bold text-base shadow-lg shadow-[#C2410C]/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                  >
                    {isVerifying ? (
                      <span className="flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                        Verifying...
                      </span>
                    ) : (
                      <>
                        <ShieldCheck className="w-5 h-5" />
                        <span>Verify & Continue</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setStep("phone")}
                    className="text-xs text-[#78716C] hover:text-[#1C1917] text-center py-1 font-semibold"
                  >
                    Change mobile number (+91 {phone})
                  </button>
                </div>
              </div>
            )}

            {/* -------------------------------------------------------- */}
            {/* STEP 3: OPENS MAP VIEW & THEN DETAILS RIGHT HERE!        */}
            {/* -------------------------------------------------------- */}
            {step === "location" && (
              <div>
                {/* SUB-VIEW A: MAP PIN PICKER (Exact layout like reference image!) */}
                {step3View === "map" ? (
                  <div className="space-y-3">
                    {/* Map Box Container */}
                    <div className="relative w-full h-64 sm:h-72 rounded-2xl border border-[#E2E8F0] overflow-hidden bg-[#F1F5F9] shadow-inner select-none">
                      {/* Top Search bar over Map */}
                      <div className="absolute top-2.5 left-3 right-3 z-20">
                        <div className="bg-white rounded-xl shadow-md border border-[#E2E8F0] flex items-center px-3 py-2 text-xs">
                          <Search className="w-3.5 h-3.5 text-[#64748B] shrink-0 mr-2" />
                          <input
                            type="text"
                            value={mapSearchQuery}
                            onFocus={() => setIsSearchDropdownOpen(true)}
                            onChange={(e) => setMapSearchQuery(e.target.value)}
                            placeholder="Search for a new area, locality..."
                            className="w-full bg-transparent text-xs text-[#1C1917] placeholder:text-[#94A3B8] focus:outline-hidden"
                          />
                        </div>

                        {/* Search Dropdown */}
                        {isSearchDropdownOpen && (
                          <div className="mt-1 bg-white rounded-xl shadow-xl border border-[#E2E8F0] overflow-hidden divide-y divide-[#F1F5F9]">
                            {[
                              "Raghuma Boys Hostel, Knowledge Park III",
                              "RCI Vidya Vihar, Knowledge Park III",
                              "The Circle Cafe, Knowledge Park III",
                            ].map((loc) => (
                              <button
                                key={loc}
                                type="button"
                                onClick={() => {
                                  setMapSearchQuery("");
                                  setIsSearchDropdownOpen(false);
                                  handleCenterGPS();
                                }}
                                className="w-full text-left px-3 py-2 hover:bg-[#F8FAFC] flex items-center gap-2 text-xs text-[#1C1917]"
                              >
                                <MapPin className="w-3 h-3 text-[#00875A] shrink-0" />
                                <span className="truncate">{loc}</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Interactive Drag Canvas */}
                      <div
                        className={`absolute inset-0 cursor-grab active:cursor-grabbing ${
                          isDraggingMap ? "cursor-grabbing" : ""
                        }`}
                        onMouseDown={handleMouseDown}
                        onMouseMove={handleMouseMove}
                        onMouseUp={handleMouseUp}
                        onTouchStart={handleTouchStart}
                        onTouchMove={handleTouchMove}
                        onTouchEnd={handleTouchEnd}
                      >
                        {/* Map Vector Layer */}
                        <svg
                          className="w-full h-full pointer-events-none transition-transform duration-75 ease-out"
                          style={{
                            transform: `translate(${mapOffset.x}px, ${mapOffset.y}px)`,
                          }}
                          viewBox="0 0 400 300"
                          preserveAspectRatio="xMidYMid slice"
                        >
                          <rect width="100%" height="100%" fill="#F1F5F9" />
                          <path d="M-80,220 Q-20,180 50,200 T180,240 L180,350 L-80,350 Z" fill="#E2F5EA" />
                          <path d="M-50,60 L450,100 M-50,260 L450,240 M80,-50 L60,350 M280,-50 L300,350" stroke="#FFFFFF" strokeWidth="16" />
                          <path d="M-80,300 L420,50" stroke="#FFFFFF" strokeWidth="32" strokeLinecap="round" />
                          <path d="M-80,300 L420,50" stroke="#CBD5E1" strokeWidth="1.5" fill="none" />

                          {/* Raghuma Boys Hostel Blue Polygon */}
                          <polygon points="150,110 240,60 280,100 190,150" fill="#DBEAFE" stroke="#60A5FA" strokeWidth="2" />
                          <rect x="170" y="90" width="60" height="30" fill="#BFDBFE" rx="3" />

                          {/* Landmark Label */}
                          <g transform="translate(180, 85)">
                            <circle cx="0" cy="0" r="10" fill="#93C5FD" opacity="0.6" />
                            <circle cx="0" cy="0" r="5" fill="#3B82F6" />
                            <text x="10" y="-2" fontFamily="sans-serif" fontSize="10" fontWeight="bold" fill="#1E3A8A">
                              Raghuma Boys Hostel
                            </text>
                            <text x="10" y="9" fontFamily="sans-serif" fontSize="8" fill="#3B82F6">
                              रघुमा बॉएज हॉस्टल
                            </text>
                          </g>

                          <g transform="translate(260, 180)">
                            <circle cx="0" cy="0" r="7" fill="#64748B" />
                            <text x="10" y="2" fontFamily="sans-serif" fontSize="9" fontWeight="bold" fill="#475569">
                              RCI Vidya Vihar
                            </text>
                          </g>
                        </svg>

                        {/* CENTER PIN WITH TOOLTIP */}
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                          <div
                            className={`relative flex flex-col items-center -mt-12 transition-transform duration-150 ${
                              isDraggingMap ? "-translate-y-2.5 scale-105" : ""
                            }`}
                          >
                            <div className="bg-[#1C1917] text-white text-[10px] font-bold px-2.5 py-1 rounded-lg shadow-lg mb-1 whitespace-nowrap">
                              Move the pin to adjust your location
                              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-[#1C1917] rotate-45" />
                            </div>

                            <div className="relative w-8 h-8 rounded-full bg-[#1C1917] flex items-center justify-center shadow-xl ring-2 ring-white">
                              <div className="w-3 h-3 rounded-full bg-white" />
                              <div className="absolute -bottom-1.5 w-1.5 h-2.5 bg-[#1C1917] rounded-b-full" />
                            </div>
                            <div className="w-3.5 h-1.5 rounded-full bg-[#3B82F6] opacity-80 blur-[0.5px] mt-1.5 animate-pulse" />
                          </div>
                        </div>

                        {/* Google Logo */}
                        <div className="absolute bottom-2 left-3 select-none opacity-60">
                          <span className="font-sans font-bold text-xs text-[#64748B]">Google</span>
                        </div>

                        {/* Floating "Use current location" button */}
                        <div className="absolute bottom-2.5 left-0 right-0 flex justify-center z-10">
                          <button
                            type="button"
                            onClick={handleCenterGPS}
                            className="px-3.5 py-1.5 rounded-full bg-white border border-[#C2410C] text-[#C2410C] hover:bg-[#FFF7ED] shadow-md flex items-center gap-1.5 text-xs font-bold transition-all active:scale-95"
                          >
                            <Crosshair className="w-3.5 h-3.5 text-[#C2410C]" />
                            <span>Use current location</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Delivering Box matching brand theme */}
                    <div className="p-3.5 rounded-2xl border border-[#E7E0D8] bg-white shadow-xs space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#1C1917]">
                          Delivering your order to
                        </span>
                      </div>

                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-7 h-7 rounded-full bg-[#1C1917] flex items-center justify-center text-white shrink-0">
                            <MapPin className="w-3.5 h-3.5" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs sm:text-sm font-extrabold text-[#1C1917] truncate leading-tight">
                              {currentLocality}
                            </p>
                            <p className="text-[11px] text-[#64748B] truncate mt-0.5">
                              {currentCity}
                            </p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => setIsSearchDropdownOpen(true)}
                          className="px-2.5 py-1 rounded-lg border border-[#C2410C] text-[#C2410C] text-xs font-bold hover:bg-[#FFF7ED]"
                        >
                          Change
                        </button>
                      </div>

                      {/* Primary Brand Button: Add more address details ▸ */}
                      <button
                        type="button"
                        onClick={handleProceedToAddDetails}
                        className="w-full py-3.5 px-4 rounded-xl bg-[#C2410C] hover:bg-[#9A3412] text-white text-sm font-bold shadow-lg shadow-[#C2410C]/25 flex items-center justify-center gap-1.5 transition-all active:scale-98 mt-1"
                      >
                        <span>Add more address details</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  /* SUB-VIEW B: EXACT FORM FIELDS REQUESTED IN ORDER: */
                  /* 1. Name                                          */
                  /* 2. Delivery address / building / street          */
                  /* 3. Flat                                          */
                  /* 4. Use current location / Adjust on Map          */
                  /* 5. Save as                                       */
                  /* 6. Save Location & Start Ordering                */
                  <form onSubmit={handleLocationSubmit} className="space-y-3.5 sm:space-y-4">
                    {/* Back to map button */}
                    <button
                      type="button"
                      onClick={() => setStep3View("map")}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-[#C2410C] hover:underline mb-1"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Adjust pin on map</span>
                    </button>

                    {/* 1. NAME */}
                    <div>
                      <label className="block text-xs font-bold text-[#1C1917] mb-1 uppercase tracking-wider">
                        Full Name *
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          autoFocus
                          value={nameInput}
                          onChange={(e) => {
                            setNameInput(e.target.value);
                            setNameError("");
                          }}
                          placeholder="e.g. Aditya Roy"
                          className="w-full px-4 py-3 pl-11 rounded-2xl border border-[#E7E0D8] bg-white text-sm text-[#1C1917] font-semibold placeholder:text-[#A8A29E] focus:outline-hidden focus:border-[#C2410C] focus:ring-2 focus:ring-[#C2410C]/20 transition-all"
                          required
                        />
                        <User className="w-4 h-4 text-[#C2410C] absolute left-3.5 top-3.5" />
                      </div>
                      {nameError && (
                        <p className="text-xs text-red-600 font-semibold mt-1">{nameError}</p>
                      )}
                    </div>

                    {/* 2. DELIVERY ADDRESS / BUILDING / STREET */}
                    <div>
                      <label className="block text-xs font-bold text-[#1C1917] mb-1 uppercase tracking-wider">
                        Delivery Address / Building / Street *
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={addressInput}
                          onChange={(e) => {
                            setAddressInput(e.target.value);
                            setAddressError("");
                          }}
                          placeholder="e.g. Raghuma Boys Hostel Block C, Knowledge Park III"
                          className="w-full px-4 py-3 pl-11 rounded-2xl border border-[#E7E0D8] bg-white text-sm text-[#1C1917] font-semibold placeholder:text-[#A8A29E] focus:outline-hidden focus:border-[#C2410C] focus:ring-2 focus:ring-[#C2410C]/20 transition-all"
                          required
                        />
                        <MapPin className="w-4 h-4 text-[#C2410C] absolute left-3.5 top-3.5" />
                      </div>
                      {addressError && (
                        <p className="text-xs text-red-600 font-semibold mt-1">{addressError}</p>
                      )}
                    </div>

                    {/* 3. FLAT */}
                    <div>
                      <label className="block text-xs font-bold text-[#1C1917] mb-1 uppercase tracking-wider">
                        Flat / Room / Floor / House No. (Optional)
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={detailInput}
                          onChange={(e) => setDetailInput(e.target.value)}
                          placeholder="e.g. Room 204, Block C, 2nd Floor"
                          className="w-full px-4 py-3 pl-11 rounded-2xl border border-[#E7E0D8] bg-white text-sm text-[#1C1917] font-semibold placeholder:text-[#A8A29E] focus:outline-hidden focus:border-[#C2410C] transition-all"
                        />
                        <Building className="w-4 h-4 text-[#A8A29E] absolute left-3.5 top-3.5" />
                      </div>
                    </div>

                    {/* 4. USE CURRENT LOCATION / PIN ON MAP */}
                    <div>
                      <button
                        type="button"
                        onClick={() => setStep3View("map")}
                        className="w-full py-3 px-4 rounded-2xl bg-[#FFF7ED] border border-[#FDBA74] text-[#C2410C] hover:bg-[#FED7AA]/40 transition-all flex items-center justify-between text-xs font-bold group shadow-2xs"
                      >
                        <div className="flex items-center gap-2">
                          <Crosshair className="w-4 h-4 text-[#C2410C] group-hover:scale-110 transition-transform" />
                          <span>Pin on Map / Use GPS Location</span>
                        </div>
                        <span className="text-[10px] uppercase font-extrabold text-[#9A3412] bg-[#FED7AA] px-2.5 py-0.5 rounded-full border border-[#FDBA74]">
                          Adjust Pin
                        </span>
                      </button>
                    </div>

                    {/* 5. SAVE AS */}
                    <div>
                      <label className="block text-xs font-bold text-[#1C1917] mb-1.5 uppercase tracking-wider">
                        Save As
                      </label>
                      <div className="grid grid-cols-4 gap-2">
                        {[
                          { tag: "HOME", icon: <Home className="w-3.5 h-3.5" /> },
                          { tag: "WORK", icon: <Briefcase className="w-3.5 h-3.5" /> },
                          { tag: "HOSTEL", icon: <Building className="w-3.5 h-3.5" /> },
                          { tag: "OTHER", icon: <MapPin className="w-3.5 h-3.5" /> },
                        ].map(({ tag, icon }) => (
                          <button
                            key={tag}
                            type="button"
                            onClick={() => setLocationTag(tag as any)}
                            className={`py-2 px-1.5 rounded-xl text-xs font-extrabold flex flex-col items-center gap-1 border transition-all ${
                              locationTag === tag
                                ? "bg-[#C2410C] text-white border-[#C2410C] shadow-md shadow-[#C2410C]/25"
                                : "bg-white text-[#78716C] border-[#E7E0D8] hover:border-[#1C1917]"
                            }`}
                          >
                            {icon}
                            <span className="text-[10px]">{tag}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* 6. SUBMIT BUTTON */}
                    <div className="pt-2">
                      <button
                        type="submit"
                        className="w-full py-4 px-5 rounded-2xl bg-[#C2410C] hover:bg-[#9A3412] text-white font-bold text-base shadow-lg shadow-[#C2410C]/25 flex items-center justify-center gap-2 transition-all active:scale-98"
                      >
                        <Check className="w-5 h-5" />
                        <span>Save Location & Start Ordering</span>
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}

            {/* Bottom Center Step Indicator (Clean, non-sliding) */}
            <div className="mt-6 pt-3.5 border-t border-[#E7E0D8]/80 flex items-center justify-center gap-2.5 text-center">
              <div className="flex items-center gap-1.5">
                <span
                  className={`w-2.5 h-2.5 rounded-full transition-all ${
                    step === "phone" ? "bg-[#C2410C] ring-4 ring-[#FED7AA]" : "bg-[#D6D3D1]"
                  }`}
                />
                <span
                  className={`w-2.5 h-2.5 rounded-full transition-all ${
                    step === "otp" ? "bg-[#C2410C] ring-4 ring-[#FED7AA]" : "bg-[#D6D3D1]"
                  }`}
                />
                <span
                  className={`w-2.5 h-2.5 rounded-full transition-all ${
                    step === "location" ? "bg-[#C2410C] ring-4 ring-[#FED7AA]" : "bg-[#D6D3D1]"
                  }`}
                />
              </div>
              <span className="text-xs font-bold text-[#1C1917]">
                Step {step === "phone" ? "1" : step === "otp" ? "2" : "3"} of 3
              </span>
              <span className="text-xs text-[#78716C] font-medium hidden sm:inline">
                • {step === "phone" ? "Mobile Number" : step === "otp" ? "Verify OTP" : "Delivery Location"}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
