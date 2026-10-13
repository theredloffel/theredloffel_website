"use client";

import React, { useState, useEffect } from "react";
import { useKitchen } from "@/context/KitchenContext";
import {
  X,
  MapPin,
  CheckCircle2,
  Banknote,
  ArrowRight,
  Plus,
  Home,
  Briefcase,
  Building,
  Edit3,
  ChevronDown,
  ExternalLink,
} from "lucide-react";
import { SavedLocation } from "@/types";
import { getGoogleMapsDirectionsUrl } from "@/lib/googleMaps";

export function CheckoutModal() {
  const {
    isCheckoutOpen,
    setIsCheckoutOpen,
    cart,
    deliveryType,
    cartSubtotal,
    deliveryFee,
    packagingCharge,
    grandTotal,
    user,
    locationAddress,
    locationLabel,
    setLocationAddress,
    setLocationLabel,
    savedLocations,
    placeOrder,
    showToast,
    setIsAuthOpen,
    openMapPicker,
    loginWithPhone,
  } = useKitchen();

  // Redirect to login if unauthenticated
  useEffect(() => {
    if (isCheckoutOpen && !user.isLoggedIn) {
      setIsCheckoutOpen(false);
      setIsAuthOpen(true);
      showToast("Please log in to continue to checkout", "info");
    }
  }, [isCheckoutOpen, user.isLoggedIn, setIsCheckoutOpen, setIsAuthOpen, showToast]);

  const [customerName, setCustomerName] = useState(
    user.name && user.name.toLowerCase() !== "gourmet member" ? user.name : ""
  );
  const [customerPhone, setCustomerPhone] = useState(user.phone || "");

  // Active / Selected Saved Location ID
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null);

  // Fallback or customized flat/house/landmark fields
  const [customHouse, setCustomHouse] = useState("");
  const [customLandmark, setCustomLandmark] = useState("");
  const [isEditingDetails, setIsEditingDetails] = useState(false);

  // Pin coords state
  const [pinnedCoords, setPinnedCoords] = useState<{ lat: number; lng: number; accuracy: number }>({
    lat: 28.4744,
    lng: 77.4917,
    accuracy: 10,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleOpenMapPicker = () => {
    openMapPicker((loc) => {
      if (loc.lat && loc.lng) {
        setPinnedCoords({ lat: loc.lat, lng: loc.lng, accuracy: 10 });
      }
      if (loc.house || loc.detail) setCustomHouse(loc.house || loc.detail || "");
      if (loc.landmark) setCustomLandmark(loc.landmark);
    });
  };

  // Synchronize customer profile & auto-select saved location
  useEffect(() => {
    if (user.phone) setCustomerPhone(user.phone);
    if (user.name && user.name.toLowerCase() !== "gourmet member") {
      setCustomerName(user.name);
    }
  }, [user.phone, user.name]);

  // Determine active saved location
  useEffect(() => {
    if (savedLocations.length > 0) {
      const match =
        savedLocations.find((l) => l.id === selectedLocationId) ||
        savedLocations.find((l) => l.address.toLowerCase() === locationAddress.toLowerCase()) ||
        savedLocations[0];

      if (match) {
        setSelectedLocationId(match.id);
        if (match.lat && match.lng) {
          setPinnedCoords({
            lat: match.lat,
            lng: match.lng,
            accuracy: match.accuracy || 10,
          });
        }
      }
    } else if (user.defaultAddress) {
      if (user.defaultAddress.lat && user.defaultAddress.lng) {
        setPinnedCoords({
          lat: user.defaultAddress.lat,
          lng: user.defaultAddress.lng,
          accuracy: user.defaultAddress.accuracy || 10,
        });
      }
    }
  }, [savedLocations, locationAddress, selectedLocationId, user.defaultAddress]);

  if (!isCheckoutOpen) return null;

  // Active location object
  const activeLocation: SavedLocation | undefined =
    savedLocations.find((l) => l.id === selectedLocationId) ||
    savedLocations[0] ||
    undefined;

  const activeHouse =
    customHouse.trim() ||
    activeLocation?.house ||
    activeLocation?.detail ||
    user.defaultAddress?.house ||
    "Doorstep";

  const activeStreet =
    activeLocation?.street ||
    activeLocation?.address ||
    locationAddress ||
    user.defaultAddress?.street ||
    "";

  const activeLandmark =
    customLandmark.trim() ||
    activeLocation?.landmark ||
    user.defaultAddress?.landmark ||
    "";

  const activeLat =
    activeLocation?.lat ||
    pinnedCoords.lat ||
    user.defaultAddress?.lat ||
    28.4744;

  const activeLng =
    activeLocation?.lng ||
    pinnedCoords.lng ||
    user.defaultAddress?.lng ||
    77.4917;

  const handleSelectLocation = (loc: SavedLocation) => {
    setSelectedLocationId(loc.id);
    setLocationLabel(loc.label);
    setLocationAddress(loc.address);
    if (loc.lat && loc.lng) {
      setPinnedCoords({
        lat: loc.lat,
        lng: loc.lng,
        accuracy: loc.accuracy || 10,
      });
    }
    setCustomHouse("");
    setCustomLandmark("");
    setIsEditingDetails(false);
    showToast(`Delivery address set to ${loc.label}`, "info");
  };

  const getTagIcon = (label: string) => {
    const l = label.toUpperCase();
    if (l.includes("HOME")) return <Home className="w-3.5 h-3.5" />;
    if (l.includes("WORK") || l.includes("OFFICE")) return <Briefcase className="w-3.5 h-3.5" />;
    if (l.includes("HOSTEL") || l.includes("COLLEGE")) return <Building className="w-3.5 h-3.5" />;
    return <MapPin className="w-3.5 h-3.5" />;
  };

  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedName = customerName.trim();
    if (!trimmedName || trimmedName.toLowerCase() === "gourmet member") {
      showToast("Please enter your Full Name before confirming order", "warning");
      return;
    }
    if (!customerPhone.trim() || customerPhone.replace(/\D/g, "").length < 10) {
      showToast("Please provide a valid 10-digit mobile number", "warning");
      return;
    }
    if (!activeStreet.trim()) {
      showToast("Please select or add a delivery address", "warning");
      return;
    }

    setIsSubmitting(true);

    const fullPhone = customerPhone.startsWith("+91") ? customerPhone : `+91 ${customerPhone}`;
    const cleanPhone = customerPhone.replace(/\D/g, "");

    // Persist real customer name into profile
    loginWithPhone(customerPhone, trimmedName);

    const orderData = {
      customerName: trimmedName,
      customerPhone: fullPhone,
      address: {
        house: activeHouse.trim(),
        street: activeStreet.trim(),
        landmark: activeLandmark.trim(),
        lat: activeLat,
        lng: activeLng,
        accuracy: pinnedCoords.accuracy || 10,
      },
      paymentMethod: "Cash on Delivery (COD)" as const,
      whatsAppOptIn: true,
    };

    placeOrder(orderData);

    // Silent background dispatch of order notification
    fetch("/api/notifications/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        phone: cleanPhone,
        orderId: `TRL-${Math.floor(1000 + Math.random() * 9000)}`,
        type: "CONFIRMED_PREPARING",
        customerName: customerName.trim(),
        amount: grandTotal,
      }),
    }).catch((e) => console.error("Notification send failed:", e));

    setIsSubmitting(false);
    setIsCheckoutOpen(false);
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) setIsCheckoutOpen(false);
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs overflow-y-auto overscroll-contain animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-2xl bg-[#FAF8F5] rounded-3xl border border-[#E7E0D8] shadow-2xl overflow-hidden my-8 overscroll-contain">
        {/* Header */}
        <div className="p-6 border-b border-[#E7E0D8] bg-white flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#C2410C] bg-[#FED7AA]/50 px-2.5 py-0.5 rounded-full">
              Final Step
            </span>
            <h2 className="font-serif text-2xl font-bold text-[#1C1917] mt-1">
              Delivery Details & Confirmation
            </h2>
          </div>
          <button
            onClick={() => setIsCheckoutOpen(false)}
            className="w-8 h-8 rounded-full border border-[#E7E0D8] bg-[#F5EFEB] flex items-center justify-center text-[#78716C] hover:text-[#1C1917] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Form */}
        <form
          onSubmit={handleSubmitOrder}
          className="p-6 sm:p-8 space-y-6 max-h-[80vh] overflow-y-auto overscroll-contain"
        >
          {/* 1. Customer Personal Details */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#78716C]">
              1. Customer Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#1C1917] mb-1">
                  Full Name <span className="text-red-500 font-bold">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Enter your full name (Mandatory)"
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E7E0D8] bg-white text-xs text-[#1C1917] font-medium focus:border-[#C2410C] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1C1917] mb-1">
                  Contact Mobile Number *
                </label>
                <div className="relative flex">
                  <span className="inline-flex items-center px-3 rounded-l-xl border border-r-0 border-[#E7E0D8] bg-[#F5EFEB] text-[#1C1917] text-xs font-semibold">
                    +91
                  </span>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={customerPhone.replace("+91", "").trim()}
                    onChange={(e) => setCustomerPhone(e.target.value.replace(/\D/g, ""))}
                    placeholder="98765 43210"
                    className="w-full px-4 py-2.5 rounded-r-xl border border-[#E7E0D8] bg-white text-xs text-[#1C1917] focus:border-[#C2410C] focus:outline-hidden"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 2. Delivery Address - Dropdown Form for Multiple Addresses */}
          <div className="space-y-4 pt-4 border-t border-[#E7E0D8]">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#78716C]">
                2. Delivery Address
              </h3>

              <button
                type="button"
                onClick={handleOpenMapPicker}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FED7AA]/60 text-[#9A3412] hover:bg-[#FED7AA] text-xs font-bold transition-all cursor-pointer shrink-0"
              >
                <Plus className="w-3.5 h-3.5 text-[#C2410C]" />
                <span>Add Address</span>
              </button>
            </div>

            {/* Dropdown Form for Selecting Between Multiple Addresses */}
            {savedLocations.length > 0 && (
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-[#1C1917]">
                  Select Saved Address
                </label>
                <div className="relative">
                  <select
                    value={activeLocation?.id || ""}
                    onChange={(e) => {
                      if (e.target.value === "__ADD_NEW__") {
                        handleOpenMapPicker();
                        return;
                      }
                      const found = savedLocations.find((l) => l.id === e.target.value);
                      if (found) handleSelectLocation(found);
                    }}
                    className="w-full appearance-none pl-10 pr-9 py-2.5 rounded-xl border border-[#E7E0D8] bg-white text-xs font-bold text-[#1C1917] focus:border-[#C2410C] focus:ring-1 focus:ring-[#C2410C]/20 focus:outline-hidden cursor-pointer shadow-2xs"
                  >
                    {savedLocations.map((loc) => (
                      <option key={loc.id} value={loc.id}>
                        {loc.label}: {loc.house ? `${loc.house}, ` : ""}{loc.street || loc.address}
                      </option>
                    ))}
                    <option value="__ADD_NEW__">+ Add New Address...</option>
                  </select>
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#C2410C]">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#78716C]">
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </div>
              </div>
            )}

            {/* Active Selected Address Details Card */}
            {/* Active Selected Address Details Card (Exact Reference Design) */}
            {activeStreet ? (
              <div className="p-3.5 rounded-2xl bg-[#F5EFEB] border border-[#E7E0D8] space-y-2.5">
                <div className="flex items-start justify-between gap-2">
                  <div className="text-[11px] text-[#78716C] min-w-0">
                    <p className="font-semibold text-[#1C1917] flex items-center gap-1.5 text-xs">
                      <MapPin className="w-3.5 h-3.5 text-[#C2410C] shrink-0" />
                      <span className="truncate">{activeHouse || "Delivery Destination"}</span>
                    </p>
                    <p className="truncate text-xs text-[#57534E] mt-0.5">
                      {activeStreet}
                    </p>
                    {activeLandmark && (
                      <p className="text-[#A8A29E] text-[10px] mt-0.5">
                        Landmark: {activeLandmark}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-md bg-white border border-[#E7E0D8] text-[#9A3412]">
                      {activeLocation?.label || "HOME"}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setCustomHouse(activeHouse);
                        setCustomLandmark(activeLandmark);
                        setIsEditingDetails((prev) => !prev);
                      }}
                      className="text-xs text-[#C2410C] font-bold hover:underline cursor-pointer flex items-center gap-1"
                      title="Edit address notes"
                    >
                      <Edit3 className="w-3 h-3" />
                      <span>Edit</span>
                    </button>
                  </div>
                </div>

                {/* Clickable Google Maps Action Button (Directions from driver to customer) */}
                <a
                  href={getGoogleMapsDirectionsUrl({
                    lat: activeLocation?.lat,
                    lng: activeLocation?.lng,
                    house: activeHouse,
                    street: activeStreet,
                    landmark: activeLandmark,
                  })}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2 px-3 rounded-xl bg-white border border-[#E7E0D8] hover:border-[#1C1917] text-xs font-semibold text-[#1C1917] flex items-center justify-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                >
                  <MapPin className="w-3.5 h-3.5 text-rose-600" />
                  <span>Open in Google Maps</span>
                  <ExternalLink className="w-3 h-3 text-[#A8A29E]" />
                </a>

                {/* Optional toggle to tweak flat / landmark */}
                {isEditingDetails && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2.5 border-t border-[#E7E0D8]/60">
                    <div>
                      <label className="block text-[11px] font-semibold text-[#1C1917] mb-1">
                        House / Flat / Floor
                      </label>
                      <input
                        type="text"
                        value={customHouse}
                        onChange={(e) => setCustomHouse(e.target.value)}
                        placeholder="e.g. Room 204"
                        className="w-full px-3 py-2 rounded-xl border border-[#E7E0D8] bg-white text-xs text-[#1C1917] font-medium focus:border-[#C2410C] focus:outline-hidden"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-[#1C1917] mb-1">
                        Landmark / Note
                      </label>
                      <input
                        type="text"
                        value={customLandmark}
                        onChange={(e) => setCustomLandmark(e.target.value)}
                        placeholder="e.g. Near gate 2"
                        className="w-full px-3 py-2 rounded-xl border border-[#E7E0D8] bg-white text-xs text-[#1C1917] font-medium focus:border-[#C2410C] focus:outline-hidden"
                      />
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* No Address Saved Yet State */
              <div className="p-6 rounded-2xl bg-white border-2 border-dashed border-[#E7E0D8] text-center space-y-3">
                <div className="w-10 h-10 rounded-full bg-[#FED7AA]/50 text-[#C2410C] flex items-center justify-center mx-auto">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#1C1917]">No Delivery Address Selected</h4>
                  <p className="text-xs text-[#78716C] mt-0.5">
                    Pin your location on Google Maps so we can deliver to your door.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleOpenMapPicker}
                  className="px-4 py-2.5 rounded-xl bg-[#C2410C] text-white text-xs font-bold hover:bg-[#9A3412] inline-flex items-center gap-1.5 transition-all shadow-md shadow-[#C2410C]/20 cursor-pointer"
                >
                  <MapPin className="w-4 h-4" />
                  <span>Pin Delivery Location on Map</span>
                </button>
              </div>
            )}
          </div>

          {/* 3. Payment Method (Cash on Delivery Only) */}
          <div className="space-y-3 pt-4 border-t border-[#E7E0D8]">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#78716C]">
              3. Payment Method
            </h3>
            <div className="p-4 rounded-2xl border border-[#C2410C] bg-[#FFF7ED] ring-1 ring-[#C2410C] flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <Banknote className="w-4 h-4 text-[#C2410C]" />
                  <span className="text-xs font-bold text-[#1C1917]">Cash on Delivery (COD)</span>
                  <span className="text-[10px] bg-[#FED7AA] text-[#9A3412] px-2 py-0.5 rounded-full font-bold">
                    Only Option Available
                  </span>
                </div>
                <p className="text-[11px] text-[#78716C] mt-1">
                  Pay with Cash or UPI scan upon food delivery at your door.
                </p>
              </div>
              <CheckCircle2 className="w-5 h-5 text-[#C2410C] shrink-0" />
            </div>
          </div>

          {/* Total Summary Breakdown */}
          <div className="p-4 rounded-2xl bg-white border border-[#E7E0D8] flex items-center justify-between">
            <div>
              <p className="text-[11px] text-[#78716C]">
                Total Payable ({cart.length} items • incl. ₹{packagingCharge} packaging
                {deliveryFee === 0 ? " • Free Delivery" : ""})
              </p>
              <p className="font-serif text-2xl font-bold text-[#1C1917]">₹{grandTotal}</p>
            </div>
            <button
              type="submit"
              disabled={isSubmitting || !activeStreet}
              className="py-3.5 px-6 rounded-2xl bg-[#C2410C] hover:bg-[#9A3412] text-white font-semibold text-sm shadow-md shadow-[#C2410C]/25 flex items-center gap-2 disabled:opacity-50 transition-all active:scale-98 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  <span>Confirming Order...</span>
                </>
              ) : (
                <>
                  <span>Confirm & Place Order</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
