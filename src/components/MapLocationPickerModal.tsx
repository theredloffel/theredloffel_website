"use client";

import React, { useState, useRef } from "react";
import { useKitchen } from "@/context/KitchenContext";
import {
  ArrowLeft,
  Search,
  Crosshair,
  MapPin,
  ChevronRight,
  Home,
  Briefcase,
  Building,
  Check,
  X,
  Compass,
} from "lucide-react";

interface Landmark {
  name: string;
  subname?: string;
  x: number;
  y: number;
  address: string;
  locality: string;
  city: string;
}

const LANDMARKS: Landmark[] = [
  {
    name: "Raghuma Boys Hostel",
    subname: "रघुमा बॉएज हॉस्टल",
    x: 0,
    y: 0,
    address: "Raghuma Boys Hostel Block C, Knowledge Park III",
    locality: "Knowledge Park III",
    city: "Greater Noida",
  },
  {
    name: "Garden Restaurant (The Circle Cafe)",
    subname: "कैफे द सर्कल • Family-friendly",
    x: -120,
    y: 80,
    address: "Garden Restaurant, Sector Road",
    locality: "Knowledge Park III",
    city: "Greater Noida",
  },
  {
    name: "RCI Vidya Vihar",
    subname: "आर. सी. आई. विद्या विहार",
    x: 140,
    y: 70,
    address: "RCI Vidya Vihar Campus Gate",
    locality: "Knowledge Park III",
    city: "Greater Noida",
  },
];

export function MapLocationPickerModal() {
  const {
    isMapPickerOpen,
    setIsMapPickerOpen,
    addSavedLocation,
    mapPickerCallback,
    showToast,
  } = useKitchen();

  // Current map center offset (simulated panning)
  const [mapOffset, setMapOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ mouseX: 0, mouseY: 0, startOffsetX: 0, startOffsetY: 0 });

  // Current active location details
  const [currentLocality, setCurrentLocality] = useState("Knowledge Park III");
  const [currentCity, setCurrentCity] = useState("Greater Noida");
  const [currentAddress, setCurrentAddress] = useState(
    "Raghuma Boys Hostel, Knowledge Park III"
  );

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  // Step state: "map" | "details"
  const [viewMode, setViewMode] = useState<"map" | "details">("map");

  // Details form inputs (when clicking "Add more address details")
  const [formAddress, setFormAddress] = useState("Raghuma Boys Hostel, Knowledge Park III");
  const [formFlat, setFormFlat] = useState("");
  const [formTag, setFormTag] = useState<"HOME" | "WORK" | "HOSTEL" | "OTHER">("HOSTEL");

  if (!isMapPickerOpen) return null;

  // Handle Pan / Dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    dragStartRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      startOffsetX: mapOffset.x,
      startOffsetY: mapOffset.y,
    };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const deltaX = e.clientX - dragStartRef.current.mouseX;
    const deltaY = e.clientY - dragStartRef.current.mouseY;
    const newX = dragStartRef.current.startOffsetX + deltaX;
    const newY = dragStartRef.current.startOffsetY + deltaY;
    setMapOffset({ x: newX, y: newY });
  };

  const handleMouseUp = () => {
    if (!isDragging) return;
    setIsDragging(false);
    updateLocationFromOffset(mapOffset.x, mapOffset.y);
  };

  // Touch support for mobile dragging
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length !== 1) return;
    setIsDragging(true);
    dragStartRef.current = {
      mouseX: e.touches[0].clientX,
      mouseY: e.touches[0].clientY,
      startOffsetX: mapOffset.x,
      startOffsetY: mapOffset.y,
    };
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || e.touches.length !== 1) return;
    const deltaX = e.touches[0].clientX - dragStartRef.current.mouseX;
    const deltaY = e.touches[0].clientY - dragStartRef.current.mouseY;
    setMapOffset({
      x: dragStartRef.current.startOffsetX + deltaX,
      y: dragStartRef.current.startOffsetY + deltaY,
    });
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    updateLocationFromOffset(mapOffset.x, mapOffset.y);
  };

  const updateLocationFromOffset = (x: number, y: number) => {
    // Find closest landmark or interpolate
    if (Math.abs(x) < 70 && Math.abs(y) < 70) {
      setCurrentLocality("Knowledge Park III");
      setCurrentCity("Greater Noida");
      setCurrentAddress("Raghuma Boys Hostel, Knowledge Park III");
    } else if (x > 50) {
      setCurrentLocality("Knowledge Park III (East)");
      setCurrentCity("Greater Noida");
      setCurrentAddress("Near RCI Vidya Vihar, Knowledge Park III");
    } else {
      setCurrentLocality("Circle Cafe / Sector Road");
      setCurrentCity("Greater Noida");
      setCurrentAddress("Near The Circle Cafe, Knowledge Park III");
    }
  };

  // Click on "Use current location" button
  const handleResetToGPS = () => {
    setMapOffset({ x: 0, y: 0 });
    setCurrentLocality("Knowledge Park III");
    setCurrentCity("Greater Noida");
    setCurrentAddress("Raghuma Boys Hostel Block C, Knowledge Park III");
    setFormAddress("Raghuma Boys Hostel Block C, Knowledge Park III");
    showToast("GPS centered on Raghuma Boys Hostel (~10m accuracy)", "success");
  };

  // Step 2: Proceed to "Add more address details"
  const handleProceedToDetails = () => {
    setFormAddress(currentAddress);
    setViewMode("details");
  };

  // Final Save handler
  const handleSaveFinalAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formAddress.trim()) return;

    const locData = {
      label: formTag,
      address: formAddress.trim(),
      detail: formFlat.trim() || undefined,
    };

    // 1. Add to context saved locations and activate
    addSavedLocation(locData);

    // 2. Invoke callback if modal was opened by AuthModal or other caller
    if (mapPickerCallback) {
      mapPickerCallback(locData);
    }

    // 3. Close modal & reset view
    setIsMapPickerOpen(false);
    setViewMode("map");
    showToast(`Delivery location pinned and saved to ${formTag}!`, "success");
  };

  const handleClose = () => {
    setIsMapPickerOpen(false);
    setViewMode("map");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full h-full sm:h-[88vh] sm:max-w-md sm:rounded-3xl bg-white shadow-2xl flex flex-col overflow-hidden">
        {/* ======================================================== */}
        {/* TOP BAR: Back Arrow + "Add address"                      */}
        {/* ======================================================== */}
        <div className="bg-white px-4 py-3.5 flex items-center justify-between border-b border-[#E7E0D8] z-20 shrink-0">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={viewMode === "details" ? () => setViewMode("map") : handleClose}
              className="p-1 rounded-full text-[#1C1917] hover:bg-[#F5EFEB] active:scale-95 transition-all"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-base sm:text-lg font-bold text-[#1C1917]">
              {viewMode === "details" ? "Address details" : "Add address"}
            </h1>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="p-1.5 rounded-full text-[#78716C] hover:bg-[#F5EFEB] transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ======================================================== */}
        {/* VIEW 1: INTERACTIVE GOOGLE MAP WITH MOVABLE PIN          */}
        {/* ======================================================== */}
        {viewMode === "map" ? (
          <div className="relative flex-1 flex flex-col min-h-0 bg-[#F1F5F9] select-none overflow-hidden">
            {/* Top Search Pill over Map */}
            <div className="absolute top-3 left-4 right-4 z-20">
              <div className="relative bg-white rounded-2xl shadow-lg border border-[#E2E8F0] flex items-center px-3.5 py-3 transition-all focus-within:ring-2 focus-within:ring-[#00875A]/25">
                <Search className="w-4 h-4 text-[#64748B] shrink-0 mr-2.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onFocus={() => setIsSearchFocused(true)}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for a new area, locality..."
                  className="w-full bg-transparent text-xs sm:text-sm text-[#1C1917] placeholder:text-[#94A3B8] focus:outline-hidden"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="p-1 text-[#94A3B8] hover:text-[#1C1917]"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Autocomplete Dropdown */}
              {isSearchFocused && (
                <div className="mt-1.5 bg-white rounded-2xl shadow-xl border border-[#E2E8F0] overflow-hidden divide-y divide-[#F1F5F9]">
                  {[
                    "Raghuma Boys Hostel, Knowledge Park III, Greater Noida",
                    "RCI Vidya Vihar, Knowledge Park III",
                    "The Circle Cafe, Knowledge Park III",
                    "Knowledge Park II Metro Station",
                  ].map((loc) => (
                    <button
                      key={loc}
                      type="button"
                      onClick={() => {
                        setSearchQuery("");
                        setIsSearchFocused(false);
                        setCurrentAddress(loc);
                        setCurrentLocality("Knowledge Park III");
                        setCurrentCity("Greater Noida");
                        handleResetToGPS();
                      }}
                      className="w-full text-left px-3.5 py-2.5 hover:bg-[#F8FAFC] flex items-center gap-2.5 text-xs text-[#1C1917] transition-colors"
                    >
                      <MapPin className="w-3.5 h-3.5 text-[#00875A] shrink-0" />
                      <span className="truncate">{loc}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Simulated Interactive Map Canvas */}
            <div
              className={`relative flex-1 cursor-grab active:cursor-grabbing overflow-hidden ${
                isDragging ? "cursor-grabbing" : ""
              }`}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              {/* Map Layer (SVG styling matching real Google Maps) */}
              <svg
                className="absolute inset-0 w-full h-full pointer-events-none transition-transform duration-75 ease-out"
                style={{
                  transform: `translate(${mapOffset.x}px, ${mapOffset.y}px)`,
                }}
                viewBox="0 0 500 600"
                preserveAspectRatio="xMidYMid slice"
              >
                {/* Background Land */}
                <rect width="100%" height="100%" fill="#F1F5F9" />

                {/* Park / Greenery patches */}
                <path
                  d="M-150,400 Q-80,360 0,380 T150,420 L150,600 L-150,600 Z"
                  fill="#E2F5EA"
                />

                {/* Secondary Roads */}
                <path
                  d="M-100,100 L600,160 M-100,480 L600,450 M120,-100 L80,700 M380,-100 L420,700"
                  stroke="#FFFFFF"
                  strokeWidth="24"
                  strokeLinecap="round"
                />
                <path
                  d="M-100,100 L600,160 M-100,480 L600,450 M120,-100 L80,700 M380,-100 L420,700"
                  stroke="#E2E8F0"
                  strokeWidth="1.5"
                  fill="none"
                />

                {/* Main Arterial Diagonal Road (Matching reference image) */}
                <path
                  d="M-120,550 L550,140"
                  stroke="#FFFFFF"
                  strokeWidth="48"
                  strokeLinecap="round"
                />
                <path
                  d="M-120,550 L550,140"
                  stroke="#CBD5E1"
                  strokeWidth="1.5"
                  fill="none"
                />
                {/* Center Road divider line */}
                <path
                  d="M-120,550 L550,140"
                  stroke="#F8FAFC"
                  strokeWidth="2"
                  strokeDasharray="8 8"
                  fill="none"
                />

                {/* Raghuma Boys Hostel Building Polygon (Blue boundary matching screenshot) */}
                <polygon
                  points="210,180 340,110 390,160 260,240"
                  fill="#DBEAFE"
                  stroke="#60A5FA"
                  strokeWidth="2"
                />
                <rect x="230" y="160" width="80" height="40" fill="#BFDBFE" rx="4" />

                {/* Vidya Vihar Building */}
                <rect x="360" y="270" width="90" height="60" fill="#E2E8F0" rx="4" stroke="#CBD5E1" />
                {/* Circle Cafe Building */}
                <rect x="50" y="380" width="85" height="50" fill="#FEF3C7" rx="4" stroke="#FDE68A" />

                {/* Labels & Landmarks matching user screenshot */}
                <g transform="translate(250, 150)">
                  <circle cx="0" cy="0" r="14" fill="#93C5FD" opacity="0.5" />
                  <circle cx="0" cy="0" r="8" fill="#3B82F6" />
                  <text
                    x="14"
                    y="-4"
                    fontFamily="sans-serif"
                    fontSize="12"
                    fontWeight="bold"
                    fill="#1E3A8A"
                  >
                    Raghuma Boys Hostel
                  </text>
                  <text
                    x="14"
                    y="10"
                    fontFamily="sans-serif"
                    fontSize="10"
                    fill="#3B82F6"
                  >
                    रघुमा बॉएज हॉस्टल
                  </text>
                </g>

                <g transform="translate(370, 310)">
                  <circle cx="0" cy="0" r="10" fill="#94A3B8" opacity="0.4" />
                  <circle cx="0" cy="0" r="6" fill="#64748B" />
                  <text
                    x="-12"
                    y="20"
                    fontFamily="sans-serif"
                    fontSize="11"
                    fontWeight="bold"
                    fill="#475569"
                  >
                    RCI Vidya Vihar
                  </text>
                  <text
                    x="-12"
                    y="32"
                    fontFamily="sans-serif"
                    fontSize="9"
                    fill="#64748B"
                  >
                    आर. सी. आई. विद्या विहार
                  </text>
                </g>

                <g transform="translate(60, 420)">
                  <circle cx="0" cy="0" r="10" fill="#FCD34D" opacity="0.5" />
                  <circle cx="0" cy="0" r="6" fill="#D97706" />
                  <text
                    x="14"
                    y="2"
                    fontFamily="sans-serif"
                    fontSize="11"
                    fontWeight="bold"
                    fill="#92400E"
                  >
                    Garden Restaurant (The Circle Cafe)
                  </text>
                  <text
                    x="14"
                    y="14"
                    fontFamily="sans-serif"
                    fontSize="9"
                    fill="#B45309"
                  >
                    कैफे द सर्कल • Family-friendly
                  </text>
                </g>
              </svg>

              {/* ==================================================== */}
              {/* CENTER PIN (STAYS FIXED AT CENTER WHILE MAP MOVES)   */}
              {/* ==================================================== */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                <div
                  className={`relative flex flex-col items-center -mt-16 transition-transform duration-150 ${
                    isDragging ? "-translate-y-3 scale-105" : "translate-y-0"
                  }`}
                >
                  {/* Tooltip Bubble: "Move the pin to adjust your location" */}
                  <div className="relative bg-[#1C1917] text-white text-[11px] sm:text-xs font-semibold px-3 py-1.5 rounded-xl shadow-xl flex items-center gap-1.5 mb-1.5 animate-bounce-subtle whitespace-nowrap">
                    <span>Move the pin to adjust your location</span>
                    {/* Downward triangle pointer */}
                    <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-[#1C1917] rotate-45" />
                  </div>

                  {/* Black Circular Pin matching reference image */}
                  <div className="relative w-9 h-9 rounded-full bg-[#1C1917] flex items-center justify-center shadow-2xl ring-2 ring-white">
                    <div className="w-3.5 h-3.5 rounded-full bg-white" />
                    {/* Pin pointer leg */}
                    <div className="absolute -bottom-2 w-1.5 h-3 bg-[#1C1917] rounded-b-full" />
                  </div>

                  {/* Pulsing Shadow / Blue GPS Ground Dot */}
                  <div className="w-4 h-2 rounded-full bg-[#3B82F6] opacity-80 shadow-md blur-[0.5px] mt-2 animate-pulse" />
                </div>
              </div>

              {/* Google Watermark in bottom left */}
              <div className="absolute bottom-3 left-4 pointer-events-none z-10 select-none opacity-60">
                <span className="font-sans font-bold text-base text-[#64748B] tracking-tight">
                  Google
                </span>
              </div>

              {/* Floating "Use current location" button above bottom sheet */}
              <div className="absolute bottom-4 left-0 right-0 flex justify-center z-10 pointer-events-auto">
                <button
                  type="button"
                  onClick={handleResetToGPS}
                  className="px-4 py-2.5 rounded-full bg-white border border-[#00875A] text-[#00875A] hover:bg-[#F0FDF4] active:scale-95 shadow-md flex items-center gap-2 text-xs font-bold transition-all"
                >
                  <Crosshair className="w-4 h-4 text-[#00875A]" />
                  <span>Use current location</span>
                </button>
              </div>
            </div>

            {/* ==================================================== */}
            {/* BOTTOM SHEET: DELIVERING YOUR ORDER TO               */}
            {/* ==================================================== */}
            <div className="bg-white rounded-t-3xl shadow-2xl border-t border-[#E2E8F0] px-5 pt-4 pb-5 z-20 shrink-0">
              <h2 className="text-sm font-bold text-[#1C1917] mb-2.5">
                Delivering your order to
              </h2>

              {/* Address Preview Box */}
              <div className="p-3 sm:p-3.5 rounded-2xl border border-[#E2E8F0] bg-[#FAF8F5]/60 flex items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-[#1C1917] flex items-center justify-center text-white shrink-0 shadow-2xs">
                    <div className="w-3 h-3 rounded-full border-2 border-white bg-transparent" />
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
                  onClick={() => setIsSearchFocused(true)}
                  className="px-3 py-1 rounded-xl border border-[#00875A] text-[#00875A] text-xs font-bold hover:bg-[#F0FDF4] transition-colors shrink-0"
                >
                  Change
                </button>
              </div>

              {/* Primary Green Action Button: "Add more address details ▸" */}
              <button
                type="button"
                onClick={handleProceedToDetails}
                className="w-full py-3.5 px-4 rounded-2xl bg-[#00875A] hover:bg-[#00704A] text-white text-sm sm:text-base font-bold shadow-lg shadow-[#00875A]/25 flex items-center justify-center gap-1.5 transition-all active:scale-98"
              >
                <span>Add more address details</span>
                <ChevronRight className="w-4 h-4 ml-0.5" />
              </button>
            </div>
          </div>
        ) : (
          /* ======================================================== */
          /* VIEW 2: COMPLETE ADDRESS DETAILS FORM                    */
          /* ======================================================== */
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 bg-[#FAF8F5]">
            <div className="mb-4">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#00875A] bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                Pinned Location
              </span>
              <p className="text-xs text-[#64748B] mt-1 truncate">
                Near: {currentAddress}
              </p>
            </div>

            <form onSubmit={handleSaveFinalAddress} className="space-y-4">
              {/* Delivery Address / Building / Street */}
              <div>
                <label className="block text-xs font-bold text-[#1C1917] mb-1.5 uppercase tracking-wider">
                  Delivery Address / Building / Street *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={formAddress}
                    onChange={(e) => setFormAddress(e.target.value)}
                    placeholder="e.g. Raghuma Boys Hostel Block C, Knowledge Park III"
                    className="w-full px-4 py-3 pl-11 rounded-2xl border border-[#E7E0D8] bg-white text-xs sm:text-sm text-[#1C1917] font-semibold placeholder:text-[#94A3B8] focus:outline-hidden focus:border-[#00875A] focus:ring-2 focus:ring-[#00875A]/20 transition-all"
                  />
                  <MapPin className="w-4 h-4 text-[#00875A] absolute left-3.5 top-3.5" />
                </div>
              </div>

              {/* Flat / Room / Floor */}
              <div>
                <label className="block text-xs font-bold text-[#1C1917] mb-1.5 uppercase tracking-wider">
                  Flat / Room / Floor / House No. (Optional)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={formFlat}
                    onChange={(e) => setFormFlat(e.target.value)}
                    placeholder="e.g. Room 204, 2nd Floor, Block C"
                    className="w-full px-4 py-3 pl-11 rounded-2xl border border-[#E7E0D8] bg-white text-xs sm:text-sm text-[#1C1917] font-semibold placeholder:text-[#94A3B8] focus:outline-hidden focus:border-[#00875A] focus:ring-2 focus:ring-[#00875A]/20 transition-all"
                  />
                  <Building className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-3.5" />
                </div>
              </div>

              {/* Save As Tag Selection */}
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
                      onClick={() => setFormTag(tag as any)}
                      className={`py-2.5 px-2 rounded-2xl text-xs font-extrabold flex flex-col items-center gap-1 border transition-all ${
                        formTag === tag
                          ? "bg-[#00875A] text-white border-[#00875A] shadow-md shadow-[#00875A]/25"
                          : "bg-white text-[#64748B] border-[#E7E0D8] hover:border-[#1C1917]"
                      }`}
                    >
                      {icon}
                      <span className="text-[10px]">{tag}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Save & Confirm Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3.5 px-4 rounded-2xl bg-[#00875A] hover:bg-[#00704A] text-white text-sm sm:text-base font-bold shadow-lg shadow-[#00875A]/25 flex items-center justify-center gap-2 transition-all active:scale-98"
                >
                  <Check className="w-4 h-4" />
                  <span>Save Address & Confirm</span>
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
