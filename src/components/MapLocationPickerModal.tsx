"use client";

import React, { useState, useRef } from "react";
import { useKitchen } from "@/context/KitchenContext";
import {
  ArrowLeft,
  MapPin,
  ChevronRight,
  Home,
  Briefcase,
  Building,
  Check,
  X,
  Crosshair,
} from "lucide-react";
import { GoogleMapView, GoogleMapViewRef } from "@/components/GoogleMapView";
import { DEFAULT_MAP_CENTER, GeocodedAddress } from "@/lib/googleMaps";

export function MapLocationPickerModal() {
  const {
    isMapPickerOpen,
    setIsMapPickerOpen,
    addSavedLocation,
    mapPickerCallback,
    showToast,
    setLocationAddress,
    setLocationLabel,
  } = useKitchen();

  // Step state: "map" | "details"
  const [viewMode, setViewMode] = useState<"map" | "details">("map");
  const mapRef = useRef<GoogleMapViewRef>(null);

  // Current active location details from Google Maps
  const [currentCoords, setCurrentCoords] = useState<{ lat: number; lng: number }>({
    lat: DEFAULT_MAP_CENTER.lat,
    lng: DEFAULT_MAP_CENTER.lng,
  });
  const [currentLocality, setCurrentLocality] = useState(DEFAULT_MAP_CENTER.locality);
  const [currentCity, setCurrentCity] = useState(DEFAULT_MAP_CENTER.city);
  const [currentAddress, setCurrentAddress] = useState(DEFAULT_MAP_CENTER.address);

  // Details form inputs (when clicking "Add more address details")
  const [formAddress, setFormAddress] = useState(DEFAULT_MAP_CENTER.address);
  const [formFlat, setFormFlat] = useState("");
  const [formTag, setFormTag] = useState<"HOME" | "WORK" | "HOSTEL" | "OTHER">("HOME");

  if (!isMapPickerOpen) return null;

  // Called whenever the Google Map pin is dragged or a search prediction is clicked
  const handleAddressSelect = (geocoded: GeocodedAddress) => {
    setCurrentCoords({ lat: geocoded.lat, lng: geocoded.lng });
    setCurrentLocality(geocoded.locality || "Knowledge Park III");
    setCurrentCity(geocoded.city || "Greater Noida");
    setCurrentAddress(geocoded.formattedAddress);
    setFormAddress(geocoded.formattedAddress);
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
    setLocationLabel(formTag);
    setLocationAddress(formAddress.trim());

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs overscroll-contain animate-in fade-in duration-200 p-0 sm:p-4">
      <div className="relative w-full h-full sm:h-[88vh] sm:max-w-md sm:rounded-3xl bg-white shadow-2xl flex flex-col overflow-hidden overscroll-contain">
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
              {viewMode === "details" ? "Address details" : "Pin location on map"}
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
        {/* VIEW 1: LIVE INTERACTIVE GOOGLE MAP WITH MOVABLE PIN     */}
        {/* ======================================================== */}
        {viewMode === "map" ? (
          <div className="relative flex-1 flex flex-col min-h-0 bg-[#F1F5F9] select-none overflow-hidden">
            {/* Live Interactive Google Map with live Places search */}
            <div className="flex-1 relative w-full h-full min-h-[300px]">
              <GoogleMapView
                ref={mapRef}
                initialLat={currentCoords.lat}
                initialLng={currentCoords.lng}
                onAddressSelect={handleAddressSelect}
                className="w-full h-full rounded-none"
                showSearchBar={true}
              />
            </div>

            {/* ==================================================== */}
            {/* BOTTOM SHEET: DELIVERING YOUR ORDER TO               */}
            {/* ==================================================== */}
            <div className="bg-white rounded-t-3xl shadow-2xl border-t border-[#E2E8F0] px-5 pt-4 pb-5 z-20 shrink-0">
              <h2 className="text-xs font-bold uppercase tracking-wider text-[#78716C] mb-2">
                Delivering your order to
              </h2>

              {/* Address Preview Box */}
              <div className="p-3 sm:p-3.5 rounded-2xl border border-[#E2E8F0] bg-[#FAF8F5]/80 flex items-center justify-between gap-3 mb-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-[#1C1917] flex items-center justify-center text-white shrink-0 shadow-2xs">
                    <MapPin className="w-4 h-4 text-[#FED7AA]" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-extrabold text-[#1C1917] truncate leading-tight">
                      {currentLocality}
                    </p>
                    <p className="text-xs text-[#64748B] truncate mt-0.5" title={currentAddress}>
                      {currentAddress}
                    </p>
                  </div>
                </div>

                <div className="shrink-0 px-2.5 py-1 rounded-xl bg-orange-50 border border-orange-200 text-[#C2410C] text-[11px] font-bold">
                  Pinned
                </div>
              </div>

              {/* Secondary Option: Locate GPS */}
              <button
                type="button"
                onClick={() => mapRef.current?.locateCurrentPosition()}
                className="w-full py-2.5 px-3.5 mb-3 rounded-xl border-2 border-[#00875A] bg-[#F0FDF4] text-[#00875A] hover:bg-emerald-100/70 text-xs font-black flex items-center justify-center gap-2 transition-all active:scale-98 shadow-xs cursor-pointer"
              >
                <Crosshair className="w-4 h-4 text-[#00875A]" />
                <span>Use current location (GPS)</span>
              </button>

              {/* Primary Action Button: "Add more address details ▸" */}
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
          <div className="flex-1 overflow-y-auto overscroll-contain p-5 sm:p-6 bg-[#FAF8F5]">
            <div className="mb-4">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#00875A] bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                Google Maps Verified
              </span>
              <p className="text-xs text-[#64748B] mt-1 line-clamp-2">
                {currentAddress}
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
                    placeholder="Complete delivery address, building, or street"
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
