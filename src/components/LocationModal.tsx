"use client";

import React, { useState } from "react";
import { useKitchen } from "@/context/KitchenContext";
import {
  X,
  MapPin,
  Navigation,
  Home,
  Briefcase,
  Building,
  Check,
  ArrowRight,
  Trash2,
  Plus,
} from "lucide-react";
import { AddAddressFlowModal } from "@/components/AddAddressFlowModal";

export function LocationModal() {
  const {
    isLocationModalOpen,
    setIsLocationModalOpen,
    locationLabel,
    setLocationLabel,
    locationAddress,
    setLocationAddress,
    savedLocations,
    addSavedLocation,
    removeSavedLocation,
    openMapPicker,
    showToast,
  } = useKitchen();

  const [customAddress, setCustomAddress] = useState("");
  const [customLabel, setCustomLabel] = useState<"HOME" | "WORK" | "HOSTEL" | "OTHER">("OTHER");
  const [isDetecting, setIsDetecting] = useState(false);
  const [isAddAddressFlowOpen, setIsAddAddressFlowOpen] = useState(false);

  if (!isLocationModalOpen) return null;

  const handleSelectLocation = (label: string, address: string) => {
    setLocationLabel(label);
    setLocationAddress(address);
    setIsLocationModalOpen(false);
    showToast(`Delivery location set to ${label}`, "success");
  };

  const handleDetectGPS = () => {
    setIsAddAddressFlowOpen(true);
  };

  const handleSaveCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customAddress.trim()) return;

    addSavedLocation({
      label: customLabel,
      address: customAddress.trim(),
    });
    setCustomAddress("");
    setIsLocationModalOpen(false);
    showToast(`Delivery location added and set to ${customLabel}`, "success");
  };

  const getIconForLabel = (label: string) => {
    const l = label.toUpperCase();
    if (l === "HOME") return <Home className="w-4 h-4 text-[#C2410C]" />;
    if (l === "WORK") return <Briefcase className="w-4 h-4 text-[#C2410C]" />;
    if (l === "HOSTEL") return <Building className="w-4 h-4 text-[#C2410C]" />;
    return <MapPin className="w-4 h-4 text-[#C2410C]" />;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full sm:max-w-md bg-[#FAF8F5] rounded-t-3xl sm:rounded-3xl border border-[#E7E0D8] shadow-2xl p-6 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#E7E0D8] shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#FED7AA]/60 flex items-center justify-center text-[#9A3412]">
              <MapPin className="w-4 h-4 text-[#C2410C]" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-[#1C1917]">
                Select Delivery Location
              </h3>
              <p className="text-[11px] text-[#78716C]">
                Delivering gourmet delicacies hot & fresh
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsLocationModalOpen(false)}
            className="w-8 h-8 rounded-full border border-[#E7E0D8] bg-white flex items-center justify-center text-[#78716C] hover:text-[#1C1917]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* GPS Quick Detect Button */}
        <div className="py-3 shrink-0">
          <button
            type="button"
            onClick={handleDetectGPS}
            disabled={isDetecting}
            className="w-full py-3 px-4 rounded-2xl bg-[#FFF7ED] border border-[#FDBA74] text-[#C2410C] hover:bg-[#FED7AA]/40 transition-all flex items-center justify-between text-xs font-bold group shadow-2xs"
          >
            <div className="flex items-center gap-2.5">
              <Navigation
                className={`w-4 h-4 ${
                  isDetecting ? "animate-spin" : "group-hover:scale-110"
                } transition-transform`}
              />
              <span>{isDetecting ? "Detecting GPS Pin..." : "Use Current GPS Location"}</span>
            </div>
            <span className="text-[10px] uppercase font-extrabold text-[#9A3412] bg-[#FED7AA] px-2 py-0.5 rounded-full">
              Instant
            </span>
          </button>
        </div>

        {/* Saved Addresses List (Scrollable) */}
        <div className="overflow-y-auto space-y-2 mb-3 flex-1 pr-0.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#A8A29E] block">
            Saved Addresses ({savedLocations.length})
          </span>
          {savedLocations.map((loc) => {
            const isSelected =
              locationLabel === loc.label && locationAddress === loc.address;
            return (
              <div
                key={loc.id}
                className={`w-full p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                  isSelected
                    ? "bg-white border-[#C2410C] ring-1 ring-[#C2410C] shadow-xs"
                    : "bg-white border-[#E7E0D8] hover:border-[#1C1917]"
                }`}
              >
                <button
                  type="button"
                  onClick={() => handleSelectLocation(loc.label, loc.address)}
                  className="flex items-start gap-3 min-w-0 flex-1 text-left"
                >
                  <div className="p-2 rounded-xl bg-[#FAF8F5] border border-[#E7E0D8] shrink-0 mt-0.5">
                    {getIconForLabel(loc.label)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-[#1C1917] truncate">
                      {loc.label} - {loc.address}
                    </p>
                    {loc.detail && (
                      <p className="text-[11px] text-[#78716C] truncate mt-0.5">
                        {loc.detail}
                      </p>
                    )}
                  </div>
                </button>

                <div className="flex items-center gap-1.5 shrink-0">
                  {isSelected && (
                    <div className="w-5 h-5 rounded-full bg-[#C2410C] text-white flex items-center justify-center">
                      <Check className="w-3 h-3" />
                    </div>
                  )}
                  {savedLocations.length > 1 && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeSavedLocation(loc.id);
                      }}
                      className="p-1 text-[#A8A29E] hover:text-red-600 transition-colors rounded-md"
                      title="Delete saved address"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Add new address button (First Map -> Then Additional Details -> Then Add) */}
        <div className="pt-3 border-t border-[#E7E0D8] shrink-0">
          <button
            type="button"
            onClick={() => setIsAddAddressFlowOpen(true)}
            className="w-full py-3.5 px-4 rounded-2xl bg-[#C2410C] hover:bg-[#9A3412] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-[#C2410C]/25 transition-all active:scale-98"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Add New Address (Select on Map)</span>
          </button>
        </div>

        <AddAddressFlowModal
          isOpen={isAddAddressFlowOpen}
          onClose={() => setIsAddAddressFlowOpen(false)}
        />
      </div>
    </div>
  );
}
