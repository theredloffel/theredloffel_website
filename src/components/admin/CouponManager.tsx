"use client";

import React, { useState } from "react";
import { useKitchen } from "@/context/KitchenContext";
import { Coupon, DiscountType } from "@/types";
import {
  Tag,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Percent,
  Bike,
  Sparkles,
  Save,
  RotateCcw,
  Sliders,
  DollarSign,
  ShieldCheck,
} from "lucide-react";

export function CouponManager() {
  const {
    coupons,
    addCoupon,
    removeCoupon,
    toggleCouponStatus,
    baseDeliveryCharge,
    updateBaseDeliveryCharge,
    freeDeliveryThreshold,
    updateFreeDeliveryThreshold,
    showToast,
  } = useKitchen();

  // Delivery charge & Free delivery threshold editing state
  const [deliveryChargeInput, setDeliveryChargeInput] = useState<number>(baseDeliveryCharge);
  const [freeDeliveryThresholdInput, setFreeDeliveryThresholdInput] = useState<number>(freeDeliveryThreshold);
  const [isDeliveryChargeSaving, setIsDeliveryChargeSaving] = useState(false);
  const [isThresholdSaving, setIsThresholdSaving] = useState(false);

  React.useEffect(() => {
    setDeliveryChargeInput(baseDeliveryCharge);
  }, [baseDeliveryCharge]);

  React.useEffect(() => {
    setFreeDeliveryThresholdInput(freeDeliveryThreshold);
  }, [freeDeliveryThreshold]);

  // New coupon form state
  const [isAddFormOpen, setIsAddFormOpen] = useState(false);
  const [code, setCode] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [discountType, setDiscountType] = useState<DiscountType>("flat");
  const [discountValue, setDiscountValue] = useState<number>(50);
  const [minOrderAmount, setMinOrderAmount] = useState<number>(249);
  const [maxDiscount, setMaxDiscount] = useState<number>(100);

  const handleSaveDeliveryCharge = (e: React.FormEvent) => {
    e.preventDefault();
    setIsDeliveryChargeSaving(true);
    updateBaseDeliveryCharge(deliveryChargeInput);
    setTimeout(() => {
      setIsDeliveryChargeSaving(false);
    }, 300);
  };

  const handleSaveFreeDeliveryThreshold = (e: React.FormEvent) => {
    e.preventDefault();
    setIsThresholdSaving(true);
    updateFreeDeliveryThreshold(freeDeliveryThresholdInput);
    setTimeout(() => {
      setIsThresholdSaving(false);
    }, 300);
  };

  const handleCreateCoupon = (e: React.FormEvent) => {
    e.preventDefault();

    if (!code.trim()) {
      showToast("Please enter a coupon code", "warning");
      return;
    }

    if (coupons.some((c) => c.code.toUpperCase() === code.trim().toUpperCase())) {
      showToast("A coupon with this code already exists", "warning");
      return;
    }

    addCoupon({
      code: code.trim().toUpperCase(),
      title: title.trim() || `${code.toUpperCase()} Special`,
      description:
        description.trim() ||
        (discountType === "free_delivery"
          ? `Free delivery on orders above ₹${minOrderAmount}`
          : discountType === "flat"
          ? `Flat ₹${discountValue} off on orders above ₹${minOrderAmount}`
          : `${discountValue}% off on orders above ₹${minOrderAmount}`),
      discountType,
      discountValue: discountType === "free_delivery" ? 0 : Number(discountValue),
      minOrderAmount: Number(minOrderAmount) || 0,
      maxDiscount: discountType === "percentage" ? Number(maxDiscount) || undefined : undefined,
      isActive: true,
    });

    // Reset form
    setCode("");
    setTitle("");
    setDescription("");
    setDiscountValue(50);
    setMinOrderAmount(249);
    setMaxDiscount(100);
    setIsAddFormOpen(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-150">
      {/* 1. TOP HEADER & DELIVERY CHARGES / FREE DELIVERY THRESHOLD SECTION */}
      <div className="bg-white rounded-3xl border border-[#E7E0D8] p-6 sm:p-7 shadow-xs space-y-6">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-[#FFF7ED] text-[#C2410C] flex items-center justify-center shrink-0 border border-orange-200">
            <Tag className="w-6 h-6 text-[#C2410C]" />
          </div>
          <div>
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#1C1917]">
              Coupons & Delivery Fee Management
            </h2>
            <p className="text-xs text-[#78716C] mt-0.5">
              Set custom free delivery order threshold, standard delivery charges, and promotional coupon codes.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {/* EDIT FREE DELIVERY THRESHOLD FORM */}
          <form
            onSubmit={handleSaveFreeDeliveryThreshold}
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-gradient-to-r from-emerald-50/70 to-emerald-50/30 border border-emerald-200"
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600/10 text-emerald-800 flex items-center justify-center shrink-0 mt-0.5">
                <Sparkles className="w-5 h-5 text-emerald-700" />
              </div>
              <div>
                <span className="font-bold text-xs text-emerald-950 block">
                  Free Delivery Above
                </span>
                <span className="text-[11px] text-emerald-800 leading-snug block mt-0.5">
                  Customers automatically get free delivery once cart reaches this amount (no coupon needed).
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <div className="relative w-24">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-[#78716C]">
                  ₹
                </span>
                <input
                  type="number"
                  min="0"
                  max="5000"
                  value={freeDeliveryThresholdInput}
                  onChange={(e) => setFreeDeliveryThresholdInput(Number(e.target.value))}
                  className="w-full pl-7 pr-3 py-1.5 rounded-xl border border-emerald-300 bg-white font-mono font-bold text-xs text-[#1C1917] focus:outline-hidden focus:border-emerald-600"
                />
              </div>

              <button
                type="submit"
                disabled={isThresholdSaving}
                className="px-3.5 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save</span>
              </button>
            </div>
          </form>

          {/* EDIT STANDARD DELIVERY CHARGE FORM */}
          <form
            onSubmit={handleSaveDeliveryCharge}
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-[#FAF8F5] border border-[#E7E0D8]"
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-100 text-[#C2410C] flex items-center justify-center shrink-0 mt-0.5">
                <Bike className="w-5 h-5 text-[#C2410C]" />
              </div>
              <div>
                <span className="font-bold text-xs text-[#1C1917] block">
                  Standard Delivery Fee
                </span>
                <span className="text-[11px] text-[#78716C] leading-snug block mt-0.5">
                  Charged only when cart subtotal is below ₹{freeDeliveryThreshold}.
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <div className="relative w-24">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-[#78716C]">
                  ₹
                </span>
                <input
                  type="number"
                  min="0"
                  max="500"
                  value={deliveryChargeInput}
                  onChange={(e) => setDeliveryChargeInput(Number(e.target.value))}
                  className="w-full pl-7 pr-3 py-1.5 rounded-xl border border-[#E7E0D8] bg-white font-mono font-bold text-xs text-[#1C1917] focus:outline-hidden focus:border-[#C2410C]"
                />
              </div>

              <button
                type="submit"
                disabled={isDeliveryChargeSaving}
                className="px-3.5 py-1.5 rounded-xl bg-[#C2410C] hover:bg-[#9A3412] text-white text-xs font-bold shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* 3. COUPONS LIST & ADD COUPON ACTION BAR */}
      <div className="bg-white rounded-3xl border border-[#E7E0D8] p-6 sm:p-7 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#F5EFEB]">
          <div>
            <h3 className="font-serif text-lg font-bold text-[#1C1917]">
              Active Promotional Coupons ({coupons.length})
            </h3>
            <p className="text-xs text-[#78716C] mt-0.5">
              Customers can slide and 1-click apply these coupons directly in their cart drawer.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsAddFormOpen(!isAddFormOpen)}
            className="px-4 py-2.5 rounded-xl bg-[#1C1917] hover:bg-black text-white text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-2xs shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>{isAddFormOpen ? "Close Add Form" : "Create New Coupon"}</span>
          </button>
        </div>

        {/* CREATE NEW COUPON FORM */}
        {isAddFormOpen && (
          <form
            onSubmit={handleCreateCoupon}
            className="p-5 sm:p-6 rounded-2xl bg-[#FAF8F5] border border-[#E7E0D8] space-y-4 animate-in fade-in"
          >
            <h4 className="font-bold text-sm text-[#1C1917] flex items-center gap-2">
              <Tag className="w-4 h-4 text-[#C2410C]" />
              <span>Create New Promotional Coupon</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
              {/* Code */}
              <div className="space-y-1">
                <label className="font-bold uppercase tracking-wider text-[#78716C] text-[10px]">
                  Coupon Code *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. FESTIVE100"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  className="w-full px-3 py-2.5 rounded-xl border border-[#E7E0D8] bg-white text-xs font-mono font-bold uppercase text-[#1C1917] focus:outline-hidden focus:border-[#C2410C]"
                />
              </div>

              {/* Title */}
              <div className="space-y-1">
                <label className="font-bold uppercase tracking-wider text-[#78716C] text-[10px]">
                  Headline / Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Flat ₹100 OFF"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-[#E7E0D8] bg-white text-xs font-semibold text-[#1C1917] focus:outline-hidden focus:border-[#C2410C]"
                />
              </div>

              {/* Discount Type */}
              <div className="space-y-1">
                <label className="font-bold uppercase tracking-wider text-[#78716C] text-[10px]">
                  Discount Type *
                </label>
                <select
                  value={discountType}
                  onChange={(e) => setDiscountType(e.target.value as DiscountType)}
                  className="w-full px-3 py-2.5 rounded-xl border border-[#E7E0D8] bg-white text-xs font-semibold text-[#1C1917] focus:outline-hidden focus:border-[#C2410C]"
                >
                  <option value="flat">Flat ₹ Amount Discount</option>
                  <option value="percentage">% Percentage Discount</option>
                  <option value="free_delivery">Free Delivery Offer</option>
                </select>
              </div>

              {/* Discount Value */}
              {discountType !== "free_delivery" && (
                <div className="space-y-1">
                  <label className="font-bold uppercase tracking-wider text-[#78716C] text-[10px]">
                    {discountType === "flat" ? "Discount Amount (₹) *" : "Discount Percentage (%) *"}
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={discountValue}
                    onChange={(e) => setDiscountValue(Number(e.target.value))}
                    className="w-full px-3 py-2.5 rounded-xl border border-[#E7E0D8] bg-white text-xs font-mono text-[#1C1917] focus:outline-hidden focus:border-[#C2410C]"
                  />
                </div>
              )}

              {/* Min Order Amount */}
              <div className="space-y-1">
                <label className="font-bold uppercase tracking-wider text-[#78716C] text-[10px]">
                  Minimum Order Subtotal (₹) *
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={minOrderAmount}
                  onChange={(e) => setMinOrderAmount(Number(e.target.value))}
                  className="w-full px-3 py-2.5 rounded-xl border border-[#E7E0D8] bg-white text-xs font-mono text-[#1C1917] focus:outline-hidden focus:border-[#C2410C]"
                />
              </div>

              {/* Max Discount Cap (for percentage) */}
              {discountType === "percentage" && (
                <div className="space-y-1">
                  <label className="font-bold uppercase tracking-wider text-[#78716C] text-[10px]">
                    Max Discount Cap (₹)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={maxDiscount}
                    onChange={(e) => setMaxDiscount(Number(e.target.value))}
                    className="w-full px-3 py-2.5 rounded-xl border border-[#E7E0D8] bg-white text-xs font-mono text-[#1C1917] focus:outline-hidden focus:border-[#C2410C]"
                  />
                </div>
              )}
            </div>

            {/* Description */}
            <div className="space-y-1">
              <label className="font-bold uppercase tracking-wider text-[#78716C] text-[10px]">
                Description / Condition Note
              </label>
              <input
                type="text"
                placeholder="e.g. Valid on all gourmet burgers, pasta, and bowls"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-[#E7E0D8] bg-white text-xs text-[#1C1917] focus:outline-hidden focus:border-[#C2410C]"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsAddFormOpen(false)}
                className="px-4 py-2 rounded-xl bg-white border border-[#E7E0D8] text-xs font-semibold text-[#78716C] hover:bg-[#F5EFEB] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-[#C2410C] hover:bg-[#9A3412] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                Save & Activate Coupon
              </button>
            </div>
          </form>
        )}

        {/* COUPONS CARDS GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {coupons.map((coupon) => (
            <div
              key={coupon.id}
              className={`p-5 rounded-3xl border transition-all flex flex-col justify-between space-y-4 ${
                coupon.isActive
                  ? "bg-[#FAF8F5] border-[#E7E0D8] hover:border-[#C2410C] shadow-2xs"
                  : "bg-gray-50 border-gray-200 opacity-60"
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-sm font-black text-[#C2410C] px-2.5 py-1 rounded-xl bg-[#FFF7ED] border border-orange-200">
                    {coupon.code}
                  </span>

                  <div className="flex items-center gap-1.5">
                    {coupon.isDefault ? (
                      <span className="text-[10px] uppercase font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300">
                        Default
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => toggleCouponStatus(coupon.id)}
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border cursor-pointer ${
                          coupon.isActive
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-gray-100 text-gray-600 border-gray-300"
                        }`}
                      >
                        {coupon.isActive ? "Active" : "Paused"}
                      </button>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="font-bold text-sm text-[#1C1917]">{coupon.title}</h4>
                  <p className="text-xs text-[#78716C] mt-0.5 leading-relaxed">
                    {coupon.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-[#E7E0D8]/60 space-y-1 text-xs text-[#78716C]">
                  <div className="flex justify-between">
                    <span>Min. Order Value:</span>
                    <span className="font-bold text-[#1C1917]">₹{coupon.minOrderAmount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Discount:</span>
                    <span className="font-bold text-[#C2410C]">
                      {coupon.discountType === "free_delivery"
                        ? "Free Delivery"
                        : coupon.discountType === "flat"
                        ? `₹${coupon.discountValue} OFF`
                        : `${coupon.discountValue}% OFF`}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="pt-3 border-t border-[#E7E0D8] flex items-center justify-between text-xs">
                <span className="text-[11px] text-[#A8A29E]">
                  {coupon.isActive ? "Visible in Cart Slider" : "Hidden from Cart"}
                </span>

                {!coupon.isDefault && (
                  <button
                    type="button"
                    onClick={() => removeCoupon(coupon.id)}
                    className="p-1.5 rounded-lg text-[#A8A29E] hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                    title="Delete Coupon"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
