"use client";

import React, { useState, useRef } from "react";
import { useKitchen } from "@/context/KitchenContext";
import {
  X,
  ArrowLeft,
  MapPin,
  ChevronRight,
  Home,
  Briefcase,
  Building,
  Check,
  Crosshair,
} from "lucide-react";
import { GoogleMapView, GoogleMapViewRef } from "@/components/GoogleMapView";
import { DEFAULT_MAP_CENTER, GeocodedAddress } from "@/lib/googleMaps";

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
  const mapRef = useRef<GoogleMapViewRef>(null);

  // Coordinates & Address from Google Maps
  const [currentCoords, setCurrentCoords] = useState<{ lat: number; lng: number }>({
    lat: DEFAULT_MAP_CENTER.lat,
    lng: DEFAULT_MAP_CENTER.lng,
  });
  const [currentLocality, setCurrentLocality] = useState(DEFAULT_MAP_CENTER.locality);
  const [currentCity, setCurrentCity] = useState(DEFAULT_MAP_CENTER.city);
  const [addressLine, setAddressLine] = useState(DEFAULT_MAP_CENTER.address);

  // Form Fields (Phase 2)
  const [receiverName, setReceiverName] = useState(user.name || "Customer");
  const [flatDetail, setFlatDetail] = useState("");
  const [selectedTag, setSelectedTag] = useState<"HOME" | "WORK" | "HOSTEL" | "OTHER">("HOME");

  if (!isOpen) return null;

  const handleAddressSelect = (geocoded: GeocodedAddress) => {
    setCurrentCoords({ lat: geocoded.lat, lng: geocoded.lng });
    setCurrentLocality(geocoded.locality || "Knowledge Park III");
    setCurrentCity(geocoded.city || "Greater Noida");
    setAddressLine(geocoded.formattedAddress);
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
    setPhase("map");
  };

  const handleModalClose = () => {
    setPhase("map");
    onClose();
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) handleModalClose();
      }}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-5 bg-black/40 backdrop-blur-xs overscroll-contain animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-lg sm:max-w-xl max-h-[92vh] overflow-y-auto overscroll-contain bg-[#FAF8F5] rounded-t-3xl sm:rounded-4xl border-t sm:border border-[#E7E0D8] shadow-2xl p-5 sm:p-7">
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
              {phase === "map" ? "Select on Google Maps" : "Additional Information"}
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
        {/* PHASE 1: GOOGLE MAPS WITH LIVE SEARCH & PIN               */}
        {/* ========================================================= */}
        {phase === "map" ? (
          <div className="space-y-3.5 pt-3">
            {/* Live Interactive Google Map */}
            <div className="relative w-full h-72 sm:h-80 rounded-2xl border border-[#E2E8F0] overflow-hidden bg-[#F1F5F9] shadow-inner select-none">
              <GoogleMapView
                ref={mapRef}
                initialLat={currentCoords.lat}
                initialLng={currentCoords.lng}
                onAddressSelect={handleAddressSelect}
                className="w-full h-full rounded-none"
                showSearchBar={true}
              />
            </div>

            {/* Address Banner Card */}
            <div className="p-3.5 sm:p-4 rounded-2xl bg-white border border-[#E7E0D8] shadow-xs flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-full bg-[#1C1917] text-[#FED7AA] flex items-center justify-center shrink-0 shadow-2xs">
                  <MapPin className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm font-extrabold text-[#1C1917] truncate leading-tight">
                    {currentLocality}
                  </p>
                  <p className="text-[11px] sm:text-xs text-[#78716C] truncate mt-0.5" title={addressLine}>
                    {addressLine}
                  </p>
                </div>
              </div>
            </div>

            {/* Use Current GPS Location Button */}
            <button
              type="button"
              onClick={() => mapRef.current?.locateCurrentPosition()}
              className="w-full py-2.5 px-3.5 rounded-xl border-2 border-[#00875A] bg-[#F0FDF4] text-[#00875A] hover:bg-emerald-100/70 text-xs font-black flex items-center justify-center gap-2 transition-all active:scale-98 shadow-xs cursor-pointer"
            >
              <Crosshair className="w-4 h-4 text-[#00875A]" />
              <span>Use current location (GPS)</span>
            </button>

            {/* Next Button */}
            <button
              type="button"
              onClick={handleProceedToAdditional}
              className="w-full py-3.5 px-4 rounded-2xl bg-[#C2410C] hover:bg-[#9A3412] text-white font-bold text-sm sm:text-base shadow-lg shadow-[#C2410C]/25 flex items-center justify-center gap-1.5 transition-all active:scale-98"
            >
              <span>Confirm Location & Add Details</span>
              <ChevronRight className="w-4 h-4 ml-0.5" />
            </button>
          </div>
        ) : (
          /* ========================================================= */
          /* PHASE 2: DETAILS FORM                                     */
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
                placeholder="e.g. Parikshit Singh"
                className="w-full px-4 py-3.5 rounded-2xl border border-[#E7E0D8] bg-white text-base text-[#1C1917] font-semibold focus:outline-hidden focus:border-[#C2410C]"
                required
              />
            </div>

            {/* 2. Delivery address (prefilled from Google Maps) */}
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

            {/* 4. Save As tags */}
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

            {/* 5. Save Address & Set as Active */}
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
