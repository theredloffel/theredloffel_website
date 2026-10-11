"use client";

import React, { useState, useRef } from "react";
import { useKitchen } from "@/context/KitchenContext";
import {
  X,
  ArrowLeft,
  Search,
  Crosshair,
  MapPin,
  ChevronRight,
  Home,
  Briefcase,
  Building,
  Check,
} from "lucide-react";

interface AddAddressFlowModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (saved: { label: string; address: string; detail?: string }) => void;
}

export function AddAddressFlowModal({ isOpen, onClose, onSuccess }: AddAddressFlowModalProps) {
  const {
    user,
    addSavedLocation,
    setLocationLabel,
    setLocationAddress,
    showToast,
  } = useKitchen();

  // Phase: "map" (First Map) -> "details" (Then Additional Information)
  const [phase, setPhase] = useState<"map" | "details">("map");

  // Map Panning & Pin State
  const [mapOffset, setMapOffset] = useState({ x: 0, y: 0 });
  const [isDraggingMap, setIsDraggingMap] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const initialOffsetRef = useRef({ x: 0, y: 0 });

  const [mapSearchQuery, setMapSearchQuery] = useState("");
  const [isSearchDropdownOpen, setIsSearchDropdownOpen] = useState(false);
  const [currentLocality, setCurrentLocality] = useState(
    "Raghuma Boys Hostel Block C, Knowledge Park III"
  );
  const [currentCity, setCurrentCity] = useState("Greater Noida, Uttar Pradesh, 201310");

  // Form Fields (Phase 2)
  const [receiverName, setReceiverName] = useState(user.name || "Aditya Roy");
  const [addressLine, setAddressLine] = useState(
    "Raghuma Boys Hostel Block C, Knowledge Park III, Greater Noida"
  );
  const [flatDetail, setFlatDetail] = useState("");
  const [selectedTag, setSelectedTag] = useState<"HOME" | "WORK" | "HOSTEL" | "OTHER">("HOME");

  if (!isOpen) return null;

  // Map Drag Handlers
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
    setCurrentLocality("Raghuma Boys Hostel Block C, Knowledge Park III");
    setCurrentCity("Greater Noida, Uttar Pradesh, 201310");
    setAddressLine("Raghuma Boys Hostel Block C, Knowledge Park III, Greater Noida");
    showToast("GPS location detected!", "info");
  };

  const handleProceedToAdditional = () => {
    if (!addressLine.trim()) {
      setAddressLine(`${currentLocality}, ${currentCity}`);
    }
    setPhase("details");
  };

  const handleSaveAddressSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addressLine.trim()) {
      showToast("Please enter delivery address", "warning");
      return;
    }

    const finalDetail = flatDetail.trim()
      ? `${flatDetail.trim()}, ${currentCity}`
      : currentCity;

    addSavedLocation({
      label: selectedTag,
      address: addressLine.trim(),
      detail: finalDetail,
    });
    setLocationLabel(selectedTag);
    setLocationAddress(addressLine.trim());

    showToast(`New address saved as ${selectedTag} and set as active`, "success");
    onSuccess?.({
      label: selectedTag,
      address: addressLine.trim(),
      detail: finalDetail,
    });
    onClose();
    // Reset back to map phase for next time
    setPhase("map");
  };

  const handleModalClose = () => {
    setPhase("map");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-60 flex items-end sm:items-center justify-center p-0 sm:p-5 bg-black/60 backdrop-blur-xs">
      <div className="relative w-full max-w-lg sm:max-w-xl max-h-[92vh] overflow-y-auto bg-[#FAF8F5] rounded-t-3xl sm:rounded-4xl border-t sm:border border-[#E7E0D8] shadow-2xl p-5 sm:p-7">
        {/* Mobile handle indicator */}
        <div className="w-12 h-1.5 bg-[#D6D3D1] rounded-full mx-auto mb-3 sm:hidden" />

        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#E7E0D8]">
          <div className="flex items-center gap-2.5">
            {phase === "details" ? (
              <button
                type="button"
                onClick={() => setPhase("map")}
                className="w-8 h-8 -ml-1 rounded-full hover:bg-black/5 flex items-center justify-center text-[#1C1917] transition-colors"
                title="Back to map"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            ) : null}
            <h3 className="font-serif text-xl font-bold text-[#1C1917]">
              {phase === "map" ? "Select on Map" : "Additional Information"}
            </h3>
          </div>

          <button
            type="button"
            onClick={handleModalClose}
            className="w-8 h-8 rounded-full border border-[#E7E0D8] bg-white flex items-center justify-center text-[#78716C] hover:text-[#1C1917]"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ========================================================= */}
        {/* PHASE 1: FIRST MAP (Interactive Pin & Panning)            */}
        {/* ========================================================= */}
        {phase === "map" ? (
          <div className="space-y-3.5 pt-3">
            {/* Map Canvas */}
            <div className="relative w-full h-72 sm:h-80 rounded-2xl border border-[#E2E8F0] overflow-hidden bg-[#F1F5F9] shadow-inner select-none">
              {/* Search bar inside map */}
              <div className="absolute top-3 left-3 right-3 z-20">
                <div className="bg-white rounded-xl shadow-md border border-[#E2E8F0] flex items-center px-3 py-2 text-xs">
                  <Search className="w-4 h-4 text-[#64748B] shrink-0 mr-2" />
                  <input
                    type="text"
                    value={mapSearchQuery}
                    onFocus={() => setIsSearchDropdownOpen(true)}
                    onChange={(e) => setMapSearchQuery(e.target.value)}
                    placeholder="Search for area, landmark, hostel..."
                    className="w-full bg-transparent text-xs text-[#1C1917] placeholder:text-[#94A3B8] focus:outline-hidden font-medium"
                  />
                </div>

                {isSearchDropdownOpen && (
                  <div className="mt-1 bg-white rounded-xl shadow-xl border border-[#E2E8F0] overflow-hidden divide-y divide-[#F1F5F9]">
                    {[
                      "Raghuma Boys Hostel, Knowledge Park III",
                      "RCI Vidya Vihar, Knowledge Park III",
                      "The Circle Cafe, Knowledge Park III",
                      "Sharda University, Knowledge Park III",
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

              {/* Interactive Drag Layer */}
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
                {/* SVG Vector Map */}
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

                  {/* Raghuma Boys Hostel Blue Polygon */}
                  <polygon
                    points="150,110 240,60 280,100 190,150"
                    fill="#DBEAFE"
                    stroke="#60A5FA"
                    strokeWidth="2"
                  />
                  <rect x="170" y="90" width="60" height="30" fill="#BFDBFE" rx="3" />

                  {/* Landmark Labels */}
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
                      Raghuma Boys Hostel
                    </text>
                    <text
                      x="10"
                      y="9"
                      fontFamily="sans-serif"
                      fontSize="8"
                      fill="#3B82F6"
                    >
                      रघुमा बॉएज हॉस्टल
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

                {/* Center Pin With Floating Tooltip */}
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

                {/* Use Current GPS Location Button */}
                <div className="absolute bottom-3 left-0 right-0 flex justify-center z-10">
                  <button
                    type="button"
                    onClick={handleCenterGPS}
                    className="px-4 py-2 rounded-full bg-white border border-[#C2410C] text-[#C2410C] hover:bg-[#FFF7ED] shadow-md flex items-center gap-1.5 text-xs font-bold transition-all active:scale-95"
                  >
                    <Crosshair className="w-4 h-4 text-[#C2410C]" />
                    <span>Use current location (GPS)</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Delivering Card */}
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

              {/* Terracotta Action Button: Add more address details ▸ */}
              <button
                type="button"
                onClick={handleProceedToAdditional}
                className="w-full py-4 px-5 rounded-2xl bg-[#C2410C] hover:bg-[#9A3412] text-white font-bold text-base shadow-lg shadow-[#C2410C]/25 flex items-center justify-center gap-2 transition-all active:scale-98 mt-1"
              >
                <span>Add more address details</span>
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        ) : (
          /* ========================================================= */
          /* PHASE 2: THEN ADDITIONAL DETAILS & SAVE ("than add")      */
          /* ========================================================= */
          <form onSubmit={handleSaveAddressSubmit} className="space-y-4 pt-3">
            {/* Back to map link */}
            <button
              type="button"
              onClick={() => setPhase("map")}
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
                value={addressLine}
                onChange={(e) => setAddressLine(e.target.value)}
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
                value={flatDetail}
                onChange={(e) => setFlatDetail(e.target.value)}
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
                    onClick={() => setSelectedTag(tag as any)}
                    className={`py-2 px-1.5 rounded-xl text-xs font-extrabold flex flex-col items-center gap-1 border transition-all ${
                      selectedTag === tag
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

            {/* 6. Save Address & Set as Active */}
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
    </div>
  );
}
