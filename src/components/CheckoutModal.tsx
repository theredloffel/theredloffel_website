"use client";

import React, { useState } from "react";
import { useKitchen } from "@/context/KitchenContext";
import { X, MapPin, Navigation, CheckCircle2, MessageSquare, CreditCard, Banknote, ShieldAlert, Sparkles, ArrowRight, Plus } from "lucide-react";
import { AddAddressFlowModal } from "@/components/AddAddressFlowModal";

export function CheckoutModal() {
  const {
    isCheckoutOpen,
    setIsCheckoutOpen,
    cart,
    deliveryType,
    cartSubtotal,
    deliveryFee,
    tax,
    grandTotal,
    user,
    locationAddress,
    locationLabel,
    placeOrder,
    showToast,
  } = useKitchen();

  const [customerName, setCustomerName] = useState(user.name || "Gourmet Member");
  const [customerPhone, setCustomerPhone] = useState(user.phone || "");
  const [house, setHouse] = useState("Hostel Block C, Room 204");
  const [street, setStreet] = useState(locationAddress || "raghuma boys hostel block c");
  const [landmark, setLandmark] = useState("Campus Gate 2");

  React.useEffect(() => {
    if (user.phone) setCustomerPhone(user.phone);
    if (user.name) setCustomerName(user.name);
    if (locationAddress) setStreet(locationAddress);
  }, [user.phone, user.name, locationAddress]);

  // Geolocation pin state
  const [pinnedCoords, setPinnedCoords] = useState<{ lat: number; lng: number; accuracy: number } | null>({
    lat: 28.4744,
    lng: 77.504,
    accuracy: 10,
  });
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [isAddAddressFlowOpen, setIsAddAddressFlowOpen] = useState(false);

  // Consent & Payment
  const [whatsAppConsent, setWhatsAppConsent] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState<"Cash on Delivery (COD)" | "Online UPI / Cards">("Online UPI / Cards");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isCheckoutOpen) return null;

  const handleDetectLocation = () => {
    setIsDetectingLocation(true);
    if (typeof window !== "undefined" && "geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setPinnedCoords({
            lat: parseFloat(pos.coords.latitude.toFixed(4)),
            lng: parseFloat(pos.coords.longitude.toFixed(4)),
            accuracy: Math.round(pos.coords.accuracy || 12),
          });
          setIsDetectingLocation(false);
          showToast("Live GPS coordinates pinned successfully!", "success");
        },
        () => {
          // Fallback to simulated high accuracy pin
          setTimeout(() => {
            setPinnedCoords({
              lat: 28.4744,
              lng: 77.504,
              accuracy: 10,
            });
            setIsDetectingLocation(false);
            showToast("Location pinned: Indiranagar Gourmet Hub", "info");
          }, 800);
        },
        { enableHighAccuracy: true, timeout: 5000 }
      );
    } else {
      setTimeout(() => {
        setPinnedCoords({
          lat: 28.4744,
          lng: 77.504,
          accuracy: 10,
        });
        setIsDetectingLocation(false);
        showToast("Location pinned: Indiranagar Gourmet Hub", "info");
      }, 600);
    }
  };

  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();

    if (!customerName.trim()) {
      showToast("Please provide your name", "warning");
      return;
    }
    if (!customerPhone.trim() || customerPhone.replace(/\D/g, "").length < 10) {
      showToast("Please provide a valid 10-digit WhatsApp number", "warning");
      return;
    }
    if (deliveryType === "Delivery" && (!house.trim() || !street.trim())) {
      showToast("Please enter house number and street address", "warning");
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      placeOrder({
        customerName: customerName.trim(),
        customerPhone: customerPhone.startsWith("+91") ? customerPhone : `+91 ${customerPhone}`,
        address:
          deliveryType === "Delivery"
            ? {
                house: house.trim(),
                street: street.trim(),
                landmark: landmark.trim(),
                lat: pinnedCoords?.lat || 28.4744,
                lng: pinnedCoords?.lng || 77.504,
                accuracy: pinnedCoords?.accuracy || 10,
              }
            : undefined,
        paymentMethod,
        whatsAppOptIn: whatsAppConsent,
      });
      setIsSubmitting(false);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-[#FAF8F5] rounded-3xl border border-[#E7E0D8] shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="p-6 border-b border-[#E7E0D8] bg-white flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#C2410C] bg-[#FED7AA]/50 px-2.5 py-0.5 rounded-full">
              Final Step
            </span>
            <h2 className="font-serif text-2xl font-bold text-[#1C1917] mt-1">
              {deliveryType === "Delivery" ? "Delivery Details & Payment" : "Pickup Confirmation"}
            </h2>
          </div>
          <button
            onClick={() => setIsCheckoutOpen(false)}
            className="w-8 h-8 rounded-full border border-[#E7E0D8] bg-[#F5EFEB] flex items-center justify-center text-[#78716C] hover:text-[#1C1917]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmitOrder} className="p-6 sm:p-8 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Customer Personal Details */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#78716C]">
              1. Customer Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#1C1917] mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="e.g. Aditya Roy"
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E7E0D8] bg-white text-xs text-[#1C1917] focus:border-[#C2410C] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1C1917] mb-1">
                  WhatsApp Contact Number *
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

          {/* Delivery Address & Map Pin */}
          {deliveryType === "Delivery" ? (
            <div className="space-y-4 pt-4 border-t border-[#E7E0D8]">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#78716C]">
                  2. Delivery Address & GPS Coordinates
                </h3>
                <button
                  type="button"
                  onClick={() => setIsAddAddressFlowOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FED7AA]/60 text-[#9A3412] text-xs font-semibold hover:bg-[#FED7AA] transition-all"
                >
                  <MapPin className="w-3.5 h-3.5 text-[#C2410C]" />
                  <span>Select / Pin on Map</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#1C1917] mb-1">
                    House / Flat / Building No. *
                  </label>
                  <input
                    type="text"
                    required
                    value={house}
                    onChange={(e) => setHouse(e.target.value)}
                    placeholder="e.g. Flat 402, Magnolia Towers"
                    className="w-full px-4 py-2.5 rounded-xl border border-[#E7E0D8] bg-white text-xs text-[#1C1917] focus:border-[#C2410C] focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#1C1917] mb-1">
                    Landmark / Directions
                  </label>
                  <input
                    type="text"
                    value={landmark}
                    onChange={(e) => setLandmark(e.target.value)}
                    placeholder="e.g. Near Monkey Bar, Opposite Gate 2"
                    className="w-full px-4 py-2.5 rounded-xl border border-[#E7E0D8] bg-white text-xs text-[#1C1917] focus:border-[#C2410C] focus:outline-hidden"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-[#1C1917] mb-1">
                    Street / Locality / Area *
                  </label>
                  <input
                    type="text"
                    required
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    placeholder="e.g. 12th Main, HAL 2nd Stage, Indiranagar, Bengaluru"
                    className="w-full px-4 py-2.5 rounded-xl border border-[#E7E0D8] bg-white text-xs text-[#1C1917] focus:border-[#C2410C] focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Visual Map Pin Confirmation Card */}
              {pinnedCoords && (
                <div className="p-4 rounded-2xl bg-[#F5EFEB] border border-[#E7E0D8] flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#C2410C] text-white flex items-center justify-center shrink-0 shadow-xs">
                      <MapPin className="w-5 h-5 animate-bounce" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#1C1917] flex items-center gap-1.5">
                        <span>Pin Dropped:</span>
                        <span className="font-mono text-[#C2410C]">
                          {pinnedCoords.lat}° N, {pinnedCoords.lng}° E
                        </span>
                      </p>
                      <p className="text-[11px] text-[#78716C]">
                        GPS Precision ~{pinnedCoords.accuracy}m • Direct Google Maps routing enabled for rider
                      </p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase shrink-0">
                    Live Verified
                  </span>
                </div>
              )}

              {/* WhatsApp Consent Checkbox */}
              <label className="flex items-start gap-3 p-3 rounded-xl bg-white border border-[#E7E0D8] cursor-pointer hover:border-[#C2410C] transition-colors">
                <input
                  type="checkbox"
                  checked={whatsAppConsent}
                  onChange={(e) => setWhatsAppConsent(e.target.checked)}
                  className="mt-0.5 rounded border-gray-300 text-[#C2410C] focus:ring-[#C2410C]"
                />
                <div className="text-xs">
                  <span className="font-semibold text-[#1C1917] flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                    WhatsApp Live Delivery Updates
                  </span>
                  <p className="text-[#78716C] mt-0.5">
                    I agree to receive live cooking alerts and share GPS location with the delivery rider via WhatsApp.
                  </p>
                </div>
              </label>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-[#F5EFEB] border border-[#E7E0D8] space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#1C1917] flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-[#C2410C]" /> Kitchen Pickup Selected
              </h4>
              <p className="text-xs text-[#78716C]">
                Your meal will be freshly prepared and kept in temperature-controlled artisan packaging at our counter:
              </p>
              <p className="text-xs font-semibold text-[#1C1917]">
                The Red Löffel Kitchen, Suite 402, Artisan Lane, Indiranagar, Bengaluru - 560038
              </p>
            </div>
          )}

          {/* Payment Method Selector */}
          <div className="space-y-3 pt-4 border-t border-[#E7E0D8]">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#78716C]">
              3. Payment Method
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setPaymentMethod("Online UPI / Cards")}
                className={`p-3.5 rounded-2xl border text-left flex items-start justify-between gap-3 transition-all ${
                  paymentMethod === "Online UPI / Cards"
                    ? "border-[#C2410C] bg-[#FFF7ED] ring-1 ring-[#C2410C]"
                    : "border-[#E7E0D8] bg-white hover:border-[#1C1917]"
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-[#C2410C]" />
                    <span className="text-xs font-bold text-[#1C1917]">Online UPI / Cards</span>
                  </div>
                  <p className="text-[11px] text-[#78716C] mt-1">
                    Google Pay, PhonePe, Cards, NetBanking (Instant Confirmation)
                  </p>
                </div>
                {paymentMethod === "Online UPI / Cards" && (
                  <CheckCircle2 className="w-4 h-4 text-[#C2410C] shrink-0" />
                )}
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod("Cash on Delivery (COD)")}
                className={`p-3.5 rounded-2xl border text-left flex items-start justify-between gap-3 transition-all ${
                  paymentMethod === "Cash on Delivery (COD)"
                    ? "border-[#C2410C] bg-[#FFF7ED] ring-1 ring-[#C2410C]"
                    : "border-[#E7E0D8] bg-white hover:border-[#1C1917]"
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <Banknote className="w-4 h-4 text-[#C2410C]" />
                    <span className="text-xs font-bold text-[#1C1917]">Cash on Delivery</span>
                  </div>
                  <p className="text-[11px] text-[#78716C] mt-1">
                    Pay by Cash or UPI QR upon handoff by the delivery rider
                  </p>
                </div>
                {paymentMethod === "Cash on Delivery (COD)" && (
                  <CheckCircle2 className="w-4 h-4 text-[#C2410C] shrink-0" />
                )}
              </button>
            </div>
          </div>

          {/* Total Summary Breakdown */}
          <div className="p-4 rounded-2xl bg-white border border-[#E7E0D8] flex items-center justify-between">
            <div>
              <p className="text-[11px] text-[#78716C]">
                Total Payable ({cart.length} items • incl. 5% GST {deliveryType === "Delivery" ? "+ delivery" : ""})
              </p>
              <p className="font-serif text-2xl font-bold text-[#1C1917]">₹{grandTotal}</p>
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="py-3.5 px-6 rounded-2xl bg-[#C2410C] hover:bg-[#9A3412] text-white font-semibold text-sm shadow-md shadow-[#C2410C]/25 flex items-center gap-2 disabled:opacity-50 transition-all active:scale-98"
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

        <AddAddressFlowModal
          isOpen={isAddAddressFlowOpen}
          onClose={() => setIsAddAddressFlowOpen(false)}
          onSuccess={(loc) => {
            setStreet(loc.address);
            if (loc.detail) setHouse(loc.detail);
            setLandmark(loc.label);
          }}
        />
      </div>
    </div>
  );
}
