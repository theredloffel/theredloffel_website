"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useKitchen } from "@/context/KitchenContext";
import {
  ArrowLeft,
  Phone,
  ShoppingBag,
  BookOpen,
  Share2,
  Info,
  Bell,
  LogOut,
  ChevronRight,
  Check,
  Plus,
  Pin,
  Home,
  MapPin,
  X,
  User,
  ArrowRight,
  ShieldCheck,
  Building,
  Briefcase,
  Crosshair,
  Search,
  Sparkles,
  RotateCcw,
} from "lucide-react";
import { isRegisteredUser, registerUserPhone } from "@/lib/auth";
import { MapLocationPickerModal } from "@/components/MapLocationPickerModal";

type ProfileTab = "main" | "orders" | "addresses" | "about" | "notifications" | "add-address";



export function ProfileView() {
  const router = useRouter();
  const {
    user,
    orders,
    userOrders,
    loginWithPhone,
    logout,
    locationLabel,
    setLocationLabel,
    locationAddress,
    setLocationAddress,
    savedLocations,
    addSavedLocation,
    removeSavedLocation,
    openMapPicker,
    setIsAuthOpen,
    showToast,
  } = useKitchen();

  const [activeTab, setActiveTab] = useState<ProfileTab>("main");
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showShareBanner, setShowShareBanner] = useState(true);
  const [notifPreferences, setNotifPreferences] = useState({
    orderUpdates: true,
    whatsapp: true,
    offers: false,
  });

  // ============================================================
  // ADD NEW ADDRESS 2-STEP FLOW ("first map then additional than add")
  // ============================================================
  const [addAddressStep, setAddAddressStep] = useState<"map" | "details">("map");
  const [mapOffset, setMapOffset] = useState({ x: 0, y: 0 });
  const [isDraggingMap, setIsDraggingMap] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const initialOffsetRef = useRef({ x: 0, y: 0 });

  const [mapSearchQuery, setMapSearchQuery] = useState("");
  const [isSearchDropdownOpen, setIsSearchDropdownOpen] = useState(false);
  const [currentLocality, setCurrentLocality] = useState(
    "Knowledge Park III, Greater Noida"
  );
  const [currentCity, setCurrentCity] = useState("Greater Noida, Uttar Pradesh, 201310");

  // Form Fields
  const [newTag, setNewTag] = useState<"HOME" | "WORK" | "HOSTEL" | "OTHER">("HOME");
  const [receiverName, setReceiverName] = useState(user.name || "Customer");
  const [newAddressText, setNewAddressText] = useState("");
  const [newDetailText, setNewDetailText] = useState("");

  const handleBack = () => {
    if (activeTab === "add-address") {
      if (addAddressStep === "details") {
        setAddAddressStep("map");
      } else {
        setActiveTab("addresses");
      }
    } else if (activeTab !== "main") {
      setActiveTab("main");
    } else {
      router.push("/");
    }
  };

  // Map drag event handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDraggingMap(true);
    dragStartRef.current = { x: e.clientX, y: e.clientY };
    initialOffsetRef.current = { ...mapOffset };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingMap) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    setMapOffset({
      x: initialOffsetRef.current.x + dx,
      y: initialOffsetRef.current.y + dy,
    });
  };

  const handleMouseUp = () => {
    setIsDraggingMap(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsDraggingMap(true);
      dragStartRef.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
      };
      initialOffsetRef.current = { ...mapOffset };
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDraggingMap || e.touches.length !== 1) return;
    const dx = e.touches[0].clientX - dragStartRef.current.x;
    const dy = e.touches[0].clientY - dragStartRef.current.y;
    setMapOffset({
      x: initialOffsetRef.current.x + dx,
      y: initialOffsetRef.current.y + dy,
    });
  };

  const handleTouchEnd = () => {
    setIsDraggingMap(false);
  };

  const handleCenterGPS = () => {
    setMapOffset({ x: 0, y: 0 });
    setCurrentLocality("Knowledge Park III");
    setCurrentCity("Greater Noida, Uttar Pradesh, 201310");
    setNewAddressText("Knowledge Park III, Greater Noida");
    showToast("GPS location centered!", "info");
  };

  const handleProceedToAddDetails = () => {
    if (!newAddressText.trim()) {
      setNewAddressText(`${currentLocality}, ${currentCity}`);
    }
    setAddAddressStep("details");
  };

  const handleAddNewAddressSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddressText.trim()) {
      showToast("Please enter delivery address", "warning");
      return;
    }
    const finalDetail = newDetailText.trim()
      ? `${newDetailText.trim()}, ${currentCity}`
      : currentCity;

    addSavedLocation({
      label: newTag,
      address: newAddressText.trim(),
      detail: finalDetail,
    });
    setLocationLabel(newTag);
    setLocationAddress(newAddressText.trim());
    setActiveTab("addresses");
    setAddAddressStep("map");
    setNewDetailText("");
    showToast(`New address saved as ${newTag} and set as active`, "success");
  };

  // If user is not logged in, show mobile login on profile page
  if (!user.isLoggedIn) {
    return (
      <main className="min-h-screen bg-[#FAF8F5] flex flex-col justify-between max-w-lg mx-auto p-4 sm:p-6">
        <div>
          {/* Header */}
          <div className="flex items-center gap-3 pt-2 pb-4">
            <button
              type="button"
              onClick={() => router.push("/")}
              className="w-10 h-10 rounded-full bg-white border border-[#E7E0D8] flex items-center justify-center text-[#1C1917] hover:bg-[#FAF8F5] transition-colors shadow-2xs"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="font-serif text-xl font-bold text-[#1C1917]">Account</h1>
          </div>

          <div className="mt-8 bg-white rounded-3xl border border-[#E7E0D8] p-6 shadow-sm">
            <div className="w-20 h-20 rounded-full overflow-hidden border border-[#E7E0D8] shadow-sm bg-[#FAF8F5] mx-auto mb-4">
              <Image
                src="/logo.jpeg"
                alt="The Red Löffel"
                width={80}
                height={80}
                priority
                className="w-full h-full object-cover"
              />
            </div>
            <h2 className="font-serif text-2xl font-bold text-[#1C1917] text-center">
              Sign In to Your Account
            </h2>
            <p className="text-xs text-[#78716C] text-center mt-1 mb-6 leading-relaxed">
              Sign in with your mobile number to view past orders, track live food delivery, and manage saved addresses.
            </p>

            <button
              type="button"
              onClick={() => setIsAuthOpen(true)}
              className="w-full py-4 px-5 rounded-2xl bg-[#C2410C] hover:bg-[#9A3412] text-white font-bold text-base shadow-lg shadow-[#C2410C]/25 flex items-center justify-center gap-2.5 transition-all active:scale-98 cursor-pointer"
            >
              <span>Sign In with Mobile</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        <p className="text-center text-xs text-[#A8A29E] py-4">
          The Red Löffel • Cloud Kitchen, Greater Noida
        </p>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF8F5] pb-12">
      <div className="max-w-md mx-auto px-4 pt-3 sm:pt-6">
        {/* ========================================================= */}
        {/* VIEW 1: MAIN PROFILE MENU (MATCHING SCREENSHOT 1)         */}
        {/* ========================================================= */}
        {activeTab === "main" && (
          <div className="space-y-4">
            {/* Top Navigation Bar: ← Profile */}
            <div className="flex items-center gap-3 py-2 border-b border-[#E7E0D8]">
              <button
                type="button"
                onClick={handleBack}
                className="w-10 h-10 -ml-2 rounded-full hover:bg-black/5 flex items-center justify-center text-[#1C1917] transition-colors"
                aria-label="Back to home"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h1 className="font-bold text-xl text-[#1C1917]">Profile</h1>
            </div>

            {/* Title & Phone Number Section */}
            <div className="pt-2 pb-1">
              <h2 className="font-serif text-3xl font-extrabold text-[#1C1917] tracking-tight">
                Your account
              </h2>
              <div className="flex items-center gap-2 mt-1.5 text-sm font-semibold text-[#57534E]">
                <Phone className="w-4 h-4 text-[#78716C]" />
                <span>{user.phone}</span>
              </div>
            </div>

            {/* 1. YOUR INFORMATION SECTION */}
            <div className="pt-2">
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#78716C] block mb-2 px-1">
                YOUR INFORMATION
              </span>
              <div className="bg-white rounded-2xl border border-[#E7E0D8] divide-y divide-[#E7E0D8] shadow-2xs overflow-hidden">
                {/* Your orders */}
                <button
                  type="button"
                  onClick={() => setActiveTab("orders")}
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
                  onClick={() => setActiveTab("addresses")}
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
            <div className="pt-2">
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
                  onClick={() => setActiveTab("about")}
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
                  onClick={() => setActiveTab("notifications")}
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
                  onClick={() => setShowLogoutConfirm(true)}
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

            {/* Logout Confirmation Modal */}
            {showLogoutConfirm && (
              <div
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150"
                onClick={() => setShowLogoutConfirm(false)}
              >
                <div
                  className="bg-white rounded-3xl border border-[#E7E0D8] p-6 max-w-sm w-full shadow-2xl text-center space-y-4 animate-in zoom-in-95 duration-150"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="w-14 h-14 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
                    <LogOut className="w-6 h-6 stroke-[2.5]" />
                  </div>
                  <div>
                    <h3 className="font-serif text-xl font-bold text-[#1C1917]">
                      Log out of your account?
                    </h3>
                    <p className="text-xs text-[#78716C] mt-1.5 leading-relaxed">
                      Are you sure you want to log out? You will need to sign in with your mobile number again to view your orders and saved addresses.
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowLogoutConfirm(false)}
                      className="py-3 px-4 rounded-xl border border-[#E7E0D8] bg-[#FAF8F5] text-xs font-bold text-[#1C1917] hover:bg-[#F5EFEB] transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowLogoutConfirm(false);
                        logout();
                        showToast("Logged out successfully", "info");
                      }}
                      className="py-3 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md shadow-rose-600/20 transition-all active:scale-95 cursor-pointer"
                    >
                      Yes, Log Out
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* VIEW 2: YOUR ORDERS (MATCHING SCREENSHOT 2)               */}
        {/* ========================================================= */}
        {activeTab === "orders" && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 py-2 border-b border-[#E7E0D8]">
              <button
                type="button"
                onClick={() => setActiveTab("main")}
                className="w-10 h-10 -ml-2 rounded-full hover:bg-black/5 flex items-center justify-center text-[#1C1917] transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h1 className="font-bold text-xl text-[#1C1917]">Your orders</h1>
            </div>

            <div className="space-y-3.5 pt-1">
              {userOrders.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-2xl border border-[#E7E0D8] p-6 shadow-2xs">
                  <ShoppingBag className="w-10 h-10 text-[#A8A29E] mx-auto mb-2" />
                  <h3 className="font-serif text-base font-bold text-[#1C1917]">No orders yet</h3>
                  <p className="text-xs text-[#78716C] mt-1 mb-4">
                    Orders placed under your mobile number will appear here.
                  </p>
                  <button
                    type="button"
                    onClick={() => router.push("/")}
                    className="px-5 py-2.5 rounded-xl bg-[#C2410C] text-white text-xs font-bold hover:bg-[#9A3412] transition-colors"
                  >
                    Browse Menu
                  </button>
                </div>
              ) : (
                userOrders.map((order) => (
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
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold text-base text-[#1C1917]">Order Delivered</h4>
                              <span className="text-[10px] font-bold text-[#C2410C] bg-[#FED7AA]/50 px-2 py-0.5 rounded-full">
                                #{order.id}
                              </span>
                            </div>
                            <p className="text-xs text-[#78716C]">
                              ₹{order.total} • {order.createdAt}
                            </p>
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-[#A8A29E]" />
                      </div>

                      {/* Dish List */}
                      <div className="mt-3 text-xs text-[#78716C] space-y-1">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex justify-between">
                            <span>
                              {item.quantity}x {item.name}
                            </span>
                            <span className="font-medium text-[#1C1917]">
                              ₹{item.price * item.quantity}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 border-t border-[#E7E0D8] bg-[#FAF8F5]/50">
                      <button
                        type="button"
                        onClick={() => {
                          showToast("Order items added to your cart!", "success");
                          router.push("/");
                        }}
                        className="py-3 text-center text-sm font-bold text-emerald-700 hover:bg-emerald-50/80 transition-colors"
                      >
                        Reorder
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          showToast("Thank you for your rating!", "success");
                        }}
                        className="py-3 text-center text-sm font-bold text-[#78716C] hover:bg-[#F5EFEB] transition-colors border-l border-[#E7E0D8]"
                      >
                        Rate Order
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* VIEW 3: ADDRESS BOOK (MATCHING SCREENSHOT 3)              */}
        {/* ========================================================= */}
        {activeTab === "addresses" && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 py-2 border-b border-[#E7E0D8]">
              <button
                type="button"
                onClick={() => setActiveTab("main")}
                className="w-10 h-10 -ml-2 rounded-full hover:bg-black/5 flex items-center justify-center text-[#1C1917] transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h1 className="font-bold text-xl text-[#1C1917]">My addresses</h1>
            </div>

            {/* + Add new address Card (Opens Map with draggable pin, then details!) */}
            <button
              type="button"
              onClick={() => openMapPicker()}
              className="w-full p-4 rounded-2xl bg-white border border-[#E7E0D8] hover:border-emerald-600 flex items-center justify-between shadow-2xs group transition-all text-left cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                  <Plus className="w-4 h-4 stroke-[3]" />
                </div>
                <span className="font-bold text-sm text-emerald-700 group-hover:text-emerald-800 transition-colors">
                  Add new address (Pin on Map)
                </span>
              </div>
              <ChevronRight className="w-5 h-5 text-[#A8A29E]" />
            </button>

            <div className="pt-1">
              <span className="text-xs font-bold text-[#78716C] uppercase tracking-wider block mb-2 px-1">
                Your saved addresses
              </span>

              <div className="space-y-3">
                {savedLocations.length === 0 ? (
                  <div className="p-8 rounded-2xl bg-white border border-[#E7E0D8] text-center space-y-2">
                    <MapPin className="w-8 h-8 text-[#A8A29E] mx-auto" />
                    <p className="text-sm font-bold text-[#1C1917]">No saved addresses yet</p>
                    <p className="text-xs text-[#78716C]">
                      Click &quot;Add new address&quot; above to save your delivery location.
                    </p>
                  </div>
                ) : (
                  savedLocations.map((loc) => {
                    const isSelected = locationAddress === loc.address;
                    return (
                      <div
                        key={loc.id}
                        onClick={() => {
                          setLocationLabel(loc.label);
                          setLocationAddress(loc.address);
                          showToast(`Delivery address set to ${loc.label}`, "success");
                        }}
                        className={`p-4 rounded-2xl bg-white border transition-all cursor-pointer relative shadow-2xs ${
                          isSelected
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
                              {isSelected && (
                                <span className="text-[9px] font-bold text-emerald-700 mt-1 bg-emerald-100/70 px-1.5 py-0.5 rounded-full whitespace-nowrap">
                                  Active
                                </span>
                              )}
                            </div>
                            <div>
                              <h4 className="font-bold text-base text-[#1C1917]">{loc.label}</h4>
                              <p className="text-xs text-[#57534E] mt-1 leading-relaxed">
                                {loc.address}
                              </p>
                              {loc.detail && (
                                <p className="text-xs text-[#78716C] mt-0.5">
                                  {loc.detail}
                                </p>
                              )}
                              {user.phone && (
                                <p className="text-xs font-semibold text-[#78716C] mt-1.5">
                                  Phone number: <span className="text-[#1C1917]">{user.phone}</span>
                                </p>
                              )}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeSavedLocation(loc.id);
                            }}
                            className="p-1 text-[#A8A29E] hover:text-rose-600 transition-colors"
                            title="Remove address"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* VIEW 4: ADD NEW ADDRESS ("FIRST MAP, THEN ADDITIONAL, THEN ADD") */}
        {/* ========================================================= */}
        {activeTab === "add-address" && (
          <div className="space-y-4">
            {/* Top Bar */}
            <div className="flex items-center gap-3 py-2 border-b border-[#E7E0D8]">
              <button
                type="button"
                onClick={handleBack}
                className="w-10 h-10 -ml-2 rounded-full hover:bg-black/5 flex items-center justify-center text-[#1C1917] transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h1 className="font-bold text-xl text-[#1C1917]">
                {addAddressStep === "map" ? "Pin Location on Map" : "Complete Address Details"}
              </h1>
            </div>

            {/* ---------------------------------------------------- */}
            {/* PHASE 1: FIRST MAP VIEW                              */}
            {/* ---------------------------------------------------- */}
            {addAddressStep === "map" ? (
              <div className="space-y-3.5 pt-1">
                {/* Map Box Container */}
                <div className="relative w-full h-80 sm:h-96 rounded-2xl border border-[#E2E8F0] overflow-hidden bg-[#F1F5F9] shadow-inner select-none">
                  {/* Top Search bar over Map */}
                  <div className="absolute top-3 left-3 right-3 z-20">
                    <div className="bg-white rounded-xl shadow-md border border-[#E2E8F0] flex items-center px-3 py-2.5 text-xs">
                      <Search className="w-4 h-4 text-[#64748B] shrink-0 mr-2" />
                      <input
                        type="text"
                        value={mapSearchQuery}
                        onFocus={() => setIsSearchDropdownOpen(true)}
                        onChange={(e) => setMapSearchQuery(e.target.value)}
                        placeholder="Search for a new area, locality..."
                        className="w-full bg-transparent text-xs text-[#1C1917] placeholder:text-[#94A3B8] focus:outline-hidden font-medium"
                      />
                    </div>

                    {/* Search Suggestions Dropdown */}
                    {isSearchDropdownOpen && (
                      <div className="mt-1 bg-white rounded-xl shadow-xl border border-[#E2E8F0] overflow-hidden divide-y divide-[#F1F5F9]">
                        {[
                          "Knowledge Park III, Greater Noida",
                          "Near Sharda University, Knowledge Park III",
                          "RCI Vidya Vihar, Knowledge Park III",
                          "Pari Chowk, Greater Noida",
                        ].map((loc) => (
                          <button
                            key={loc}
                            type="button"
                            onClick={() => {
                              setMapSearchQuery("");
                              setIsSearchDropdownOpen(false);
                              handleCenterGPS();
                            }}
                            className="w-full text-left px-3.5 py-2.5 hover:bg-[#F8FAFC] flex items-center gap-2 text-xs text-[#1C1917]"
                          >
                            <MapPin className="w-3.5 h-3.5 text-[#00875A] shrink-0" />
                            <span className="truncate font-semibold">{loc}</span>
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
                    {/* SVG Map Vector Layer */}
                    <svg
                      className="w-full h-full pointer-events-none transition-transform duration-75 ease-out"
                      style={{
                        transform: `translate(${mapOffset.x}px, ${mapOffset.y}px)`,
                      }}
                      viewBox="0 0 400 300"
                      preserveAspectRatio="xMidYMid slice"
                    >
                      <rect width="100%" height="100%" fill="#F1F5F9" />
                      <path
                        d="M-80,220 Q-20,180 50,200 T180,240 L180,350 L-80,350 Z"
                        fill="#E2F5EA"
                      />
                      <path
                        d="M-50,60 L450,100 M-50,260 L450,240 M80,-50 L60,350 M280,-50 L300,350"
                        stroke="#FFFFFF"
                        strokeWidth="16"
                      />
                      <path
                        d="M-80,300 L420,50"
                        stroke="#FFFFFF"
                        strokeWidth="32"
                        strokeLinecap="round"
                      />
                      <path
                        d="M-80,300 L420,50"
                        stroke="#CBD5E1"
                        strokeWidth="1.5"
                        fill="none"
                      />

                      {/* Knowledge Park III Hub Polygon */}
                      <polygon
                        points="150,110 240,60 280,100 190,150"
                        fill="#DBEAFE"
                        stroke="#60A5FA"
                        strokeWidth="2"
                      />
                      <rect x="170" y="90" width="60" height="30" fill="#BFDBFE" rx="3" />

                      {/* Landmark Label */}
                      <g transform="translate(180, 85)">
                        <circle cx="0" cy="0" r="10" fill="#93C5FD" opacity="0.6" />
                        <circle cx="0" cy="0" r="5" fill="#3B82F6" />
                        <text
                          x="10"
                          y="-2"
                          fontFamily="sans-serif"
                          fontSize="10"
                          fontWeight="bold"
                          fill="#1E3A8A"
                        >
                          Knowledge Park III
                        </text>
                        <text
                          x="10"
                          y="9"
                          fontFamily="sans-serif"
                          fontSize="8"
                          fill="#3B82F6"
                        >
                          नॉलेज पार्क III
                        </text>
                      </g>

                      <g transform="translate(260, 180)">
                        <circle cx="0" cy="0" r="7" fill="#64748B" />
                        <text
                          x="10"
                          y="2"
                          fontFamily="sans-serif"
                          fontSize="9"
                          fontWeight="bold"
                          fill="#475569"
                        >
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

                    {/* Google Watermark */}
                    <div className="absolute bottom-2 left-3 select-none opacity-60">
                      <span className="font-sans font-bold text-xs text-[#64748B]">Google</span>
                    </div>

                    {/* Floating "Use current location" button */}
                    <div className="absolute bottom-3 left-0 right-0 flex justify-center z-10">
                      <button
                        type="button"
                        onClick={handleCenterGPS}
                        className="px-4 py-2 rounded-full bg-white border border-[#C2410C] text-[#C2410C] hover:bg-[#FFF7ED] shadow-md flex items-center gap-1.5 text-xs font-bold transition-all active:scale-95"
                      >
                        <Crosshair className="w-4 h-4 text-[#C2410C]" />
                        <span>Use current location</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Delivering Box */}
                <div className="p-4 rounded-2xl border border-[#E7E0D8] bg-white shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#78716C]">
                      Delivering your order to
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-[#1C1917] flex items-center justify-center text-white shrink-0">
                        <MapPin className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-extrabold text-[#1C1917] truncate leading-tight">
                          {currentLocality}
                        </p>
                        <p className="text-xs text-[#64748B] truncate mt-0.5">
                          {currentCity}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setIsSearchDropdownOpen(true)}
                      className="px-3 py-1.5 rounded-lg border border-[#C2410C] text-[#C2410C] text-xs font-bold hover:bg-[#FFF7ED]"
                    >
                      Change
                    </button>
                  </div>

                  {/* Primary Action Button: "Add more address details ▸" */}
                  <button
                    type="button"
                    onClick={handleProceedToAddDetails}
                    className="w-full py-4 px-5 rounded-2xl bg-[#C2410C] hover:bg-[#9A3412] text-white font-bold text-base shadow-lg shadow-[#C2410C]/25 flex items-center justify-center gap-2 transition-all active:scale-98 mt-1"
                  >
                    <span>Add more address details</span>
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ) : (
              /* ---------------------------------------------------- */
              /* PHASE 2: THEN ADDITIONAL DETAILS FORM & ADD BUTTON   */
              /* ---------------------------------------------------- */
              <form onSubmit={handleAddNewAddressSubmit} className="space-y-4 pt-1">
                {/* Back to map button */}
                <button
                  type="button"
                  onClick={() => setAddAddressStep("map")}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#C2410C] hover:underline"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Adjust pin on map</span>
                </button>

                {/* 1. Name */}
                <div>
                  <label className="block text-xs font-bold text-[#1C1917] mb-1.5 uppercase tracking-wider">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={receiverName}
                    onChange={(e) => setReceiverName(e.target.value)}
                    placeholder="e.g. Aditya Roy"
                    className="w-full px-4 py-3.5 rounded-2xl border border-[#E7E0D8] bg-white text-base text-[#1C1917] font-semibold focus:outline-hidden focus:border-[#C2410C]"
                    required
                  />
                </div>

                {/* 2. Delivery address / building / street (prefilled from map) */}
                <div>
                  <label className="block text-xs font-bold text-[#1C1917] mb-1.5 uppercase tracking-wider">
                    Delivery Address / Building / Street *
                  </label>
                  <textarea
                    rows={3}
                    value={newAddressText}
                    onChange={(e) => setNewAddressText(e.target.value)}
                    placeholder="Building name, street, locality..."
                    className="w-full px-4 py-3 rounded-2xl border border-[#E7E0D8] bg-white text-sm text-[#1C1917] font-semibold focus:outline-hidden focus:border-[#C2410C] resize-none"
                    required
                  />
                </div>

                {/* 3. Flat / Room / Floor */}
                <div>
                  <label className="block text-xs font-bold text-[#1C1917] mb-1.5 uppercase tracking-wider">
                    Flat / Room / Floor (Optional)
                  </label>
                  <input
                    type="text"
                    value={newDetailText}
                    onChange={(e) => setNewDetailText(e.target.value)}
                    placeholder="e.g. Room 204, Block C, 2nd Floor"
                    className="w-full px-4 py-3.5 rounded-2xl border border-[#E7E0D8] bg-white text-sm text-[#1C1917] font-semibold focus:outline-hidden focus:border-[#C2410C]"
                  />
                </div>

                {/* 4. Use Current Location GPS button */}
                <div className="pt-0.5">
                  <button
                    type="button"
                    onClick={handleCenterGPS}
                    className="w-full py-2.5 px-3 rounded-xl border border-dashed border-[#C2410C] bg-[#FFF7ED] text-[#C2410C] text-xs font-bold hover:bg-[#FFEDD5] flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Crosshair className="w-3.5 h-3.5 text-[#C2410C]" />
                    <span>Use current location (GPS)</span>
                  </button>
                </div>

                {/* 5. Save As tags */}
                <div>
                  <label className="block text-xs font-bold text-[#1C1917] mb-1.5 uppercase tracking-wider">
                    Save Address As
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
                        onClick={() => setNewTag(tag as any)}
                        className={`py-2 px-1.5 rounded-xl text-xs font-extrabold flex flex-col items-center gap-1 border transition-all ${
                          newTag === tag
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

                {/* 6. Save Address & Set Active Button ("than add") */}
                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-4 px-5 rounded-2xl bg-[#C2410C] hover:bg-[#9A3412] text-white font-bold text-base shadow-lg shadow-[#C2410C]/25 flex items-center justify-center gap-2 transition-all active:scale-98"
                  >
                    <Check className="w-5 h-5" />
                    <span>Save Address & Set as Active</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* VIEW 5: ABOUT US                                          */}
        {/* ========================================================= */}
        {activeTab === "about" && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 py-2 border-b border-[#E7E0D8]">
              <button
                type="button"
                onClick={() => setActiveTab("main")}
                className="w-10 h-10 -ml-2 rounded-full hover:bg-black/5 flex items-center justify-center text-[#1C1917] transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h1 className="font-bold text-xl text-[#1C1917]">About us</h1>
            </div>

            <div className="bg-white rounded-3xl border border-[#E7E0D8] p-6 space-y-4 shadow-2xs">
              <div className="w-16 h-16 rounded-full overflow-hidden border border-[#E7E0D8] shadow-md bg-[#FAF8F5]">
                <Image
                  src="/logo.jpeg"
                  alt="The Red Löffel"
                  width={64}
                  height={64}
                  className="w-full h-full object-cover"
                />
              </div>
              <h2 className="font-serif text-2xl font-bold text-[#1C1917]">The Red Löffel</h2>
              <p className="text-sm text-[#78716C] leading-relaxed">
                The Red Löffel is a gourmet cloud kitchen located in Knowledge Park
                III, Greater Noida. We handcraft gourmet burgers, rich bowls, loaded snacks, and
                refreshing beverages using fresh ingredients and chef-curated recipes.
              </p>
              <div className="pt-3 border-t border-[#E7E0D8] text-xs text-[#57534E] space-y-2 font-medium">
                <p>📍 Kitchen: Nalanda living boys hostel , near NIET BUISNESS SCHOOL, knowledge park 3</p>
                <p>📞 Phone: +91 96257 50927</p>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* VIEW 6: NOTIFICATION PREFERENCES                          */}
        {/* ========================================================= */}
        {activeTab === "notifications" && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 py-2 border-b border-[#E7E0D8]">
              <button
                type="button"
                onClick={() => setActiveTab("main")}
                className="w-10 h-10 -ml-2 rounded-full hover:bg-black/5 flex items-center justify-center text-[#1C1917] transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h1 className="font-bold text-xl text-[#1C1917]">Notification preferences</h1>
            </div>

            <div className="bg-white rounded-2xl border border-[#E7E0D8] divide-y divide-[#E7E0D8] shadow-2xs overflow-hidden">
              <div className="p-4 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sm text-[#1C1917]">Order Status Alerts</h4>
                  <p className="text-xs text-[#78716C]">
                    Receive real-time cooking and delivery updates
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
                  <h4 className="font-bold text-sm text-[#1C1917]">Digital Receipts</h4>
                  <p className="text-xs text-[#78716C]">
                    Get digital bills and driver tracking alerts
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

      <MapLocationPickerModal />
    </div>
  );
}
