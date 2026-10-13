"use client";

import React, { useState } from "react";
import { useKitchen } from "@/context/KitchenContext";
import {
  X,
  MapPin,
  Home,
  Briefcase,
  Building,
  Check,
  Crosshair,
  ExternalLink,
  Loader2,
} from "lucide-react";
import {
  DEFAULT_MAP_CENTER,
  getCurrentGPSLocation,
  getGoogleMapsDirectionsUrl,
} from "@/lib/googleMaps";

interface AddAddressFlowModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (saved: {
    label: string;
    address: string;
    detail?: string;
    house?: string;
    street?: string;
    landmark?: string;
    lat?: number;
    lng?: number;
  }) => void;
}

export function AddAddressFlowModal({ isOpen, onClose, onSuccess }: AddAddressFlowModalProps) {
  const {
    user,
    addSavedLocation,
    setLocationLabel,
    setLocationAddress,
    showToast,
  } = useKitchen();

  // Form Fields
  const [receiverName, setReceiverName] = useState(user.name || "Customer");
  const [house, setHouse] = useState("");
  const [street, setStreet] = useState("Knowledge Park 3, Greater Noida");
  const [landmark, setLandmark] = useState("Near NIET Business School");
  const [selectedTag, setSelectedTag] = useState<"HOME" | "WORK" | "HOSTEL" | "OTHER">("HOSTEL");

  // Coordinates
  const [currentCoords, setCurrentCoords] = useState<{ lat?: number; lng?: number }>({
    lat: DEFAULT_MAP_CENTER.lat,
    lng: DEFAULT_MAP_CENTER.lng,
  });
  const [isDetectingGps, setIsDetectingGps] = useState(false);

  if (!isOpen) return null;

  const handleUseCurrentGPS = async () => {
    setIsDetectingGps(true);
    try {
      const coords = await getCurrentGPSLocation();
      setCurrentCoords({ lat: coords.lat, lng: coords.lng });
      showToast("Current GPS coordinates pinned successfully", "success");
    } catch {
      showToast("Could not detect GPS. Using default Greater Noida location", "info");
    } finally {
      setIsDetectingGps(false);
    }
  };

  const handleSaveAddressSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!house.trim() && !street.trim()) {
      showToast("Please enter house or street address", "warning");
      return;
    }

    const fullAddress = [
      house.trim(),
      street.trim(),
      landmark.trim() ? `near ${landmark.trim()}` : "",
      "Greater Noida",
    ]
      .filter(Boolean)
      .join(", ");

    const savedData = {
      label: selectedTag,
      address: fullAddress,
      detail: house.trim() || street.trim(),
      house: house.trim() || "Delivery Point",
      street: street.trim() || "Knowledge Park 3, Greater Noida",
      landmark: landmark.trim(),
      lat: currentCoords.lat || DEFAULT_MAP_CENTER.lat,
      lng: currentCoords.lng || DEFAULT_MAP_CENTER.lng,
      accuracy: 10,
    };

    addSavedLocation(savedData);
    setLocationLabel(selectedTag);
    setLocationAddress(fullAddress);

    showToast(`Address saved as ${selectedTag} and set as active delivery location`, "success");
    onSuccess?.(savedData);
    onClose();
  };

  const previewGoogleMapsUrl = getGoogleMapsDirectionsUrl({
    lat: currentCoords.lat,
    lng: currentCoords.lng,
    house: house.trim() || "Delivery Point",
    street: street.trim() || "Knowledge Park 3, Greater Noida",
    landmark: landmark.trim(),
  });

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-5 bg-black/40 backdrop-blur-xs overscroll-contain animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-lg max-h-[92vh] overflow-y-auto overscroll-contain bg-[#FAF8F5] rounded-t-3xl sm:rounded-4xl border-t sm:border border-[#E7E0D8] shadow-2xl p-5 sm:p-7">
        {/* Mobile handle indicator */}
        <div className="w-12 h-1.5 bg-[#D6D3D1] rounded-full mx-auto mb-3 sm:hidden" />

        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#E7E0D8]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#1C1917] text-[#FED7AA] flex items-center justify-center">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif text-lg sm:text-xl font-bold text-[#1C1917]">
                Add Delivery Address
              </h3>
              <p className="text-[11px] text-[#78716C]">
                Saved addresses allow 1-click turn-by-turn navigation for drivers
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full border border-[#E7E0D8] bg-white flex items-center justify-center text-[#78716C] hover:text-[#1C1917] cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSaveAddressSubmit} className="space-y-4 pt-4">
          {/* Receiver Name */}
          <div>
            <label className="block text-xs font-bold text-[#1C1917] mb-1.5 uppercase tracking-wider">
              Receiver Full Name
            </label>
            <input
              type="text"
              value={receiverName}
              onChange={(e) => setReceiverName(e.target.value)}
              placeholder="e.g. Parikshit Singh"
              className="w-full px-4 py-3 rounded-2xl border border-[#E7E0D8] bg-white text-sm text-[#1C1917] font-semibold focus:outline-hidden focus:border-[#C2410C]"
              required
            />
          </div>

          {/* House / Flat / Hostel */}
          <div>
            <label className="block text-xs font-bold text-[#1C1917] mb-1.5 uppercase tracking-wider">
              House / Hostel / Flat / Room No. *
            </label>
            <input
              type="text"
              autoFocus
              value={house}
              onChange={(e) => setHouse(e.target.value)}
              placeholder="e.g. Nalanda Living Boys Hostel, Room 204"
              className="w-full px-4 py-3 rounded-2xl border border-[#E7E0D8] bg-white text-sm text-[#1C1917] font-semibold focus:outline-hidden focus:border-[#C2410C]"
              required
            />
          </div>

          {/* Street / Building / Area */}
          <div>
            <label className="block text-xs font-bold text-[#1C1917] mb-1.5 uppercase tracking-wider">
              Street / Building / Area *
            </label>
            <input
              type="text"
              value={street}
              onChange={(e) => setStreet(e.target.value)}
              placeholder="e.g. Knowledge Park 3, Greater Noida"
              className="w-full px-4 py-3 rounded-2xl border border-[#E7E0D8] bg-white text-sm text-[#1C1917] font-semibold focus:outline-hidden focus:border-[#C2410C]"
              required
            />
          </div>

          {/* Landmark */}
          <div>
            <label className="block text-xs font-bold text-[#1C1917] mb-1.5 uppercase tracking-wider">
              Landmark (Optional)
            </label>
            <input
              type="text"
              value={landmark}
              onChange={(e) => setLandmark(e.target.value)}
              placeholder="e.g. Near NIET Business School / Sharda University"
              className="w-full px-4 py-3 rounded-2xl border border-[#E7E0D8] bg-white text-sm text-[#1C1917] font-semibold focus:outline-hidden focus:border-[#C2410C]"
            />
          </div>

          {/* Save As Tag */}
          <div>
            <label className="block text-xs font-bold text-[#1C1917] mb-1.5 uppercase tracking-wider">
              Save Address As
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { tag: "HOSTEL", icon: <Building className="w-3.5 h-3.5" /> },
                { tag: "HOME", icon: <Home className="w-3.5 h-3.5" /> },
                { tag: "WORK", icon: <Briefcase className="w-3.5 h-3.5" /> },
                { tag: "OTHER", icon: <MapPin className="w-3.5 h-3.5" /> },
              ].map(({ tag, icon }) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setSelectedTag(tag as any)}
                  className={`py-2 px-1.5 rounded-xl text-xs font-extrabold flex flex-col items-center gap-1 border transition-all cursor-pointer ${
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

          {/* GPS Coordinate Pin Button */}
          <button
            type="button"
            onClick={handleUseCurrentGPS}
            disabled={isDetectingGps}
            className="w-full py-2.5 px-3.5 rounded-xl border border-emerald-300 bg-[#F0FDF4] text-emerald-800 hover:bg-emerald-100 text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            {isDetectingGps ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
                <span>Detecting GPS Coordinates...</span>
              </>
            ) : (
              <>
                <Crosshair className="w-4 h-4 text-emerald-600" />
                <span>Pin My Exact Live GPS Location</span>
              </>
            )}
          </button>

          {/* Exact Address Preview Card with "Open in Google Maps" */}
          <div className="space-y-1.5 pt-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#78716C] block">
              Driver Navigation Preview
            </span>
            <div className="p-3.5 rounded-2xl bg-[#F5EFEB] border border-[#E7E0D8] space-y-2.5">
              <div className="text-[11px] text-[#78716C] space-y-0.5">
                <p className="font-semibold text-[#1C1917] flex items-center gap-1.5 text-xs">
                  <MapPin className="w-3.5 h-3.5 text-[#C2410C] shrink-0" />
                  <span>{house.trim() || "House / Hostel Name"}</span>
                </p>
                <p className="truncate text-[#57534E] text-xs">
                  {street.trim() || "Knowledge Park 3, Greater Noida"}
                </p>
                {landmark.trim() && (
                  <p className="text-[#A8A29E] text-[10px]">
                    Landmark: {landmark.trim()}
                  </p>
                )}
              </div>

              {/* Clickable Google Maps Action Button (Directions from driver to customer) */}
              <a
                href={previewGoogleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2 px-3 rounded-xl bg-white border border-[#E7E0D8] hover:border-[#1C1917] text-xs font-semibold text-[#1C1917] flex items-center justify-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
              >
                <MapPin className="w-3.5 h-3.5 text-rose-600" />
                <span>Open in Google Maps</span>
                <ExternalLink className="w-3 h-3 text-[#A8A29E]" />
              </a>
            </div>
          </div>

          {/* Save Address Button */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3.5 px-5 rounded-2xl bg-[#C2410C] hover:bg-[#9A3412] text-white font-bold text-sm shadow-lg shadow-[#C2410C]/25 flex items-center justify-center gap-2 transition-all active:scale-98 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>Save Address & Select for Delivery</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
