"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useKitchen } from "@/context/KitchenContext";
import {
  Clock,
  ChevronDown,
  Search,
  Mic,
  User,
  UserCheck,
  History,
  X,
  MapPin,
} from "lucide-react";

export function Header() {
  const {
    setIsAuthOpen,
    setIsOrderHistoryOpen,
    setSelectedTrackingOrderId,
    setIsLocationModalOpen,
    user,
    orders,
    searchQuery,
    setSearchQuery,
    isVegOnly,
    setIsVegOnly,
    locationLabel,
    locationAddress,
    showToast,
    isStoreOpen,
    userOrders,
  } = useKitchen();

  const [isMicListening, setIsMicListening] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const activeOrdersCount = user.isLoggedIn
    ? userOrders.filter((o) => o.status !== "Delivered" && o.status !== "Rejected").length
    : 0;

  React.useEffect(() => {
    const handleScroll = () => {
      // Pin search and veg bar as soon as user slides past initial header padding
      setIsScrolled(window.scrollY > 50);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleMicClick = () => {
    setIsMicListening(true);
    showToast("Listening... Try saying 'Truffle Pasta' or 'Burrata'", "info");
    setTimeout(() => {
      setIsMicListening(false);
      setSearchQuery("Truffle");
      showToast("Filtered by 'Truffle'", "success");
    }, 1500);
  };

  return (
    <header suppressHydrationWarning className="relative w-full z-40">
      {/* ========================================================= */}
      {/* DESKTOP HEADER (Fixed at top when scrolled) */}
      {/* ========================================================= */}
      {isScrolled && <div className="hidden md:block h-[72px]" aria-hidden="true" />}
      <div
        className={`hidden md:block ${
          isScrolled
            ? "fixed top-0 left-0 right-0 z-50 bg-[#FAF8F5]/98 backdrop-blur-md border-b border-[#E7E0D8] shadow-md"
            : "relative bg-[#FAF8F5] border-b border-[#E7E0D8] shadow-xs"
        } transition-all`}
      >
        {/* Desktop Main Unified Row */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-[72px]">
          <div className="flex items-center justify-between gap-4 lg:gap-6 h-full">
            {/* 1. LOGO AND NAME */}
            <Link href="/" className="flex items-center gap-3 shrink-0 group">
              <div className="relative w-11 h-11 rounded-full overflow-hidden border border-[#E7E0D8] shadow-xs group-hover:scale-105 transition-transform duration-300 bg-[#FAF8F5] shrink-0">
                <Image
                  src="/logo.jpeg"
                  alt="The Red Löffel"
                  width={44}
                  height={44}
                  priority
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-serif text-xl lg:text-2xl font-bold tracking-tight text-[#1C1917] leading-none">
                    The Red Löffel
                  </span>
                </div>
                <p className="text-[10px] text-[#78716C] tracking-wider uppercase font-medium mt-0.5">
                  Cloud Kitchen
                </p>
              </div>
            </Link>

            {/* 2. UNIFIED LOCATION & SEARCH BAR (Zomato-style pill container) */}
            <div className="flex-1 max-w-2xl bg-white rounded-2xl border border-[#E7E0D8] shadow-xs flex items-center h-12 px-3 hover:border-[#D6CEB4] focus-within:border-[#C2410C] focus-within:ring-2 focus-within:ring-[#C2410C]/15 transition-all">
              {/* Location Sub-element */}
              <button
                type="button"
                onClick={() => setIsLocationModalOpen(true)}
                className="flex items-center gap-2 max-w-[210px] lg:max-w-[250px] text-left px-2 py-1.5 rounded-xl hover:bg-[#FAF8F5] transition-colors shrink-0 group"
                title="Change Delivery Location"
              >
                <MapPin className="w-4 h-4 text-[#C2410C] shrink-0" />
                <span className="text-xs font-semibold text-[#1C1917] truncate">
                  {locationAddress || "Select Delivery Location"}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-[#78716C] shrink-0 group-hover:text-[#1C1917] transition-colors" />
              </button>

              {/* Vertical Divider */}
              <div className="h-6 w-[1px] bg-[#E7E0D8] mx-2 shrink-0" />

              {/* Search Sub-element */}
              <div className="flex-1 flex items-center gap-2 px-1 min-w-0">
                <Search className="w-4 h-4 text-[#A8A29E] shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for restaurant, cuisine or a dish"
                  className="w-full bg-transparent text-xs text-[#1C1917] placeholder:text-[#A8A29E] focus:outline-hidden"
                />
                {searchQuery ? (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="p-1 text-[#78716C] hover:text-[#1C1917] shrink-0"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleMicClick}
                    className={`p-1 rounded-full shrink-0 transition-colors ${
                      isMicListening ? "text-[#C2410C] animate-pulse" : "text-[#A8A29E] hover:text-[#C2410C]"
                    }`}
                    title="Voice Search"
                  >
                    <Mic className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* 3. VEG TOGGLE */}
            <div className="bg-white rounded-2xl border border-[#E7E0D8] p-1.5 px-3 flex items-center gap-2 shadow-xs shrink-0 select-none">
              <span className="text-[11px] font-extrabold tracking-wider text-[#1C1917]">
                VEG
              </span>
              <button
                type="button"
                onClick={() => setIsVegOnly((prev) => !prev)}
                className={`w-9 h-5 rounded-full p-0.5 transition-colors flex items-center ${
                  isVegOnly ? "bg-emerald-600 justify-end" : "bg-[#D7CCC8] justify-start"
                }`}
                title={isVegOnly ? "Show All Items" : "Show Veg Only"}
              >
                <div className="w-4 h-4 rounded-full bg-white shadow-xs transition-transform" />
              </button>
            </div>

            {/* 4. SIGN IN OR USER LOGO */}
            <div className="flex items-center gap-3 shrink-0">
              {user.isLoggedIn ? (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedTrackingOrderId(null);
                      setIsOrderHistoryOpen(true);
                    }}
                    className="relative p-2 rounded-xl text-xs font-semibold text-[#78716C] hover:text-[#1C1917] hover:bg-white transition-colors"
                    title="Order History"
                  >
                    <History className="w-4 h-4" />
                    {activeOrdersCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#C2410C] text-white text-[9px] font-bold flex items-center justify-center">
                        {activeOrdersCount}
                      </span>
                    )}
                  </button>
                  <Link
                    href="/profile"
                    className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white border border-[#E7E0D8] hover:border-[#C2410C] text-xs font-semibold text-[#1C1917] transition-all shadow-xs"
                  >
                    <UserCheck className="w-4 h-4 text-emerald-600" />
                    <span className="max-w-[100px] truncate">{user.name.split(" ")[0]}</span>
                  </Link>
                </div>
              ) : (
                <div className="flex items-center gap-3 text-xs font-medium">
                  <button
                    type="button"
                    onClick={() => setIsAuthOpen(true)}
                    className="text-[#78716C] hover:text-[#1C1917] px-2 py-1.5 transition-colors font-medium"
                  >
                    Log in
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsAuthOpen(true)}
                    className="px-4 py-2 rounded-xl bg-[#1C1917] text-white hover:bg-black font-semibold transition-all shadow-xs"
                  >
                    Sign up
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* MOBILE MODE: Row 1 scrolls naturally, Row 2 gets FIXED at top! */}
      {/* ========================================================= */}
      <div className="md:hidden">
        {/* Mobile Row 1 (Non-sticky: scrolls smoothly away with page) */}
        <div className="bg-[#FAF8F5] px-3.5 pt-2.5 pb-2">
          <div className="flex items-center justify-between gap-2">
            {/* 1. LOGO BADGE */}
            <Link
              href="/"
              className="shrink-0 flex items-center justify-center w-11 h-11 rounded-full overflow-hidden border border-[#E7E0D8] shadow-xs active:scale-95 transition-transform bg-[#FAF8F5]"
              title="The Red Löffel - Cloud Kitchen"
            >
              <Image
                src="/logo.jpeg"
                alt="The Red Löffel"
                width={44}
                height={44}
                priority
                className="w-full h-full object-cover"
              />
            </Link>

            {/* 2. LOCATION & STATUS */}
            <button
              type="button"
              onClick={() => setIsLocationModalOpen(true)}
              className="flex-1 min-w-0 text-left px-2 py-0.5 rounded-xl hover:bg-[#F5EFEB]/80 transition-colors"
            >
              <div
                className={`flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider ${
                  isStoreOpen ? "text-[#C2410C]" : "text-rose-600"
                }`}
              >
                <Clock className="w-3 h-3 shrink-0" />
                <span>{isStoreOpen ? "OPEN" : "STORE CLOSED"}</span>
                {isStoreOpen && <span className="text-[#A8A29E] font-normal">• 30m</span>}
              </div>

              <div className="flex items-center gap-1 mt-0.5">
                <p className="text-xs font-bold text-[#1C1917] truncate leading-tight">
                  {locationAddress ? (
                    <>
                      <span className="text-[#C2410C]">{locationLabel || "Deliver to"}</span>
                      <span className="text-[#78716C] font-normal"> - {locationAddress}</span>
                    </>
                  ) : (
                    <span className="text-[#78716C] font-normal">Select Delivery Location</span>
                  )}
                </p>
                <ChevronDown className="w-3.5 h-3.5 text-[#1C1917] shrink-0" />
              </div>
            </button>

            {/* 3. USER PROFILE / SIGN IN */}
            <div className="flex items-center gap-1.5 shrink-0">
              {user.isLoggedIn ? (
                <Link
                  href="/profile"
                  className="w-10 h-10 rounded-full bg-[#1C1917] text-white flex items-center justify-center hover:bg-black transition-colors shadow-2xs"
                  title="Account / Profile"
                >
                  <UserCheck className="w-4 h-4 text-emerald-400" />
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsAuthOpen(true)}
                  className="w-10 h-10 rounded-full bg-[#1C1917] text-white flex items-center justify-center hover:bg-black transition-colors shadow-2xs active:scale-95"
                  title="Sign In / Register"
                >
                  <User className="w-4 h-4 text-[#FAF8F5]" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Row 2 (FIXED AT TOP ON SLIDE): Search Bar + VEG Switch Toggle */}
        {isScrolled && <div className="h-[52px]" aria-hidden="true" />}
        <div
          className={`${
            isScrolled
              ? "fixed top-0 left-0 right-0 z-50 bg-[#FAF8F5]/98 backdrop-blur-md border-b border-[#E7E0D8] px-3.5 py-2 shadow-md animate-in slide-in-from-top-1"
              : "relative bg-[#FAF8F5] border-b border-[#E7E0D8] px-3.5 py-2"
          } transition-all`}
        >
          <div className="flex items-center gap-2">
            {/* Search Input Box */}
            <div className="relative flex-1 bg-white rounded-2xl border border-[#E7E0D8] shadow-xs flex items-center px-3 py-2 focus-within:border-[#C2410C] focus-within:ring-2 focus-within:ring-[#C2410C]/20 transition-all">
              <Search className="w-4 h-4 text-[#78716C] shrink-0 mr-2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder='Search "wood-fired pizza, truffle pasta..."'
                className="w-full bg-transparent text-xs text-[#1C1917] placeholder:text-[#A8A29E] focus:outline-hidden"
              />
              {searchQuery ? (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="p-1 text-[#78716C] hover:text-[#1C1917]"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              ) : (
                <div className="flex items-center gap-1.5 pl-2 border-l border-[#E7E0D8]">
                  <button
                    type="button"
                    onClick={handleMicClick}
                    className={`p-1 rounded-full transition-colors ${
                      isMicListening ? "text-[#C2410C] animate-pulse" : "text-[#78716C] hover:text-[#C2410C]"
                    }`}
                    title="Voice Search"
                  >
                    <Mic className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* VEG Switch Toggle */}
            <div className="bg-white rounded-2xl border border-[#E7E0D8] p-1.5 px-2.5 flex flex-col items-center justify-center shadow-xs shrink-0 select-none">
              <span className="text-[10px] font-extrabold tracking-wider text-[#1C1917] leading-none mb-1">
                VEG
              </span>
              <button
                type="button"
                onClick={() => setIsVegOnly((prev) => !prev)}
                className={`w-9 h-5 rounded-full p-0.5 transition-colors flex items-center ${
                  isVegOnly ? "bg-emerald-600 justify-end" : "bg-[#D7CCC8] justify-start"
                }`}
                title={isVegOnly ? "Show All Items" : "Show Veg Only"}
              >
                <div className="w-4 h-4 rounded-full bg-white shadow-xs transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
