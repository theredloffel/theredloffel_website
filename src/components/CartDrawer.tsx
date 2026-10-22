"use client";

import React, { useState } from "react";
import { useKitchen } from "@/context/KitchenContext";
import {
  X,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  Utensils,
  MapPin,
  ShoppingBag,
  Sparkles,
  User,
  Tag,
  Percent,
  Check,
} from "lucide-react";

export function CartDrawer() {
  const {
    isCartOpen,
    setIsCartOpen,
    cart,
    addToCart,
    removeFromCart,
    updateCartQuantity,
    clearCart,
    cartCount,
    cartSubtotal,
    deliveryType,
    setDeliveryType,
    cookingNotes,
    setCookingNotes,
    deliveryFee,
    tax,
    packagingCharge,
    grandTotal,
    baseDeliveryCharge,
    freeDeliveryThreshold,
    coupons,
    appliedCoupon,
    applyCoupon,
    removeAppliedCoupon,
    couponDiscount,
    setIsCheckoutOpen,
    user,
    setIsAuthOpen,
    showToast,
    isStoreOpen,
  } = useKitchen();

  const [couponCodeInput, setCouponCodeInput] = useState("");

  if (!isCartOpen) return null;

  const handleProceedToCheckout = () => {
    if (!isStoreOpen) {
      showToast("Kitchen is currently closed and not accepting orders right now.", "warning");
      return;
    }
    if (!user.isLoggedIn) {
      showToast("Please log in to proceed to checkout", "info");
      setIsCartOpen(false);
      setIsAuthOpen(true);
      return;
    }
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  const isFreeDeliveryUnlocked = cartSubtotal >= freeDeliveryThreshold;
  const freeDeliveryAmountNeeded = Math.max(0, freeDeliveryThreshold - cartSubtotal);
  const freeDeliveryProgress = Math.min(100, Math.round((cartSubtotal / freeDeliveryThreshold) * 100));

  return (
    <div className="fixed inset-0 z-50 overflow-hidden overscroll-contain animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity overscroll-none"
        onClick={() => setIsCartOpen(false)}
        onTouchMove={(e) => e.preventDefault()}
      />

      <div className="fixed inset-y-0 right-0 w-full sm:w-auto max-w-full flex sm:pl-10">
        <div className="w-full sm:w-screen sm:max-w-md bg-[#FAF8F5] border-l border-[#E7E0D8] shadow-2xl flex flex-col justify-between overscroll-contain">
          {/* Header */}
          <div className="p-6 border-b border-[#E7E0D8] flex items-center justify-between bg-white shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#FED7AA]/60 flex items-center justify-center text-[#9A3412]">
                <ShoppingBag className="w-5 h-5 text-[#C2410C]" />
              </div>
              <div>
                <h2 className="font-serif text-xl font-bold text-[#1C1917]">Your Cart</h2>
                <p className="text-xs text-[#78716C]">
                  {cartCount} {cartCount === 1 ? "item" : "items"} selected
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {cart.length > 0 && (
                <button
                  onClick={clearCart}
                  className="text-xs text-[#78716C] hover:text-red-600 transition-colors px-2 py-1"
                  title="Clear all items"
                >
                  Clear
                </button>
              )}
              <button
                onClick={() => setIsCartOpen(false)}
                className="w-8 h-8 rounded-full border border-[#E7E0D8] bg-[#F5EFEB] flex items-center justify-center text-[#78716C] hover:text-[#1C1917]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto overscroll-contain p-6 space-y-6">
            {cart.length === 0 ? (
              <div className="text-center py-16 space-y-4">
                <div className="w-16 h-16 rounded-full bg-[#F5EFEB] flex items-center justify-center mx-auto text-[#A8A29E]">
                  <Utensils className="w-8 h-8" />
                </div>
                <h3 className="font-serif text-lg font-bold text-[#1C1917]">
                  Your cart is empty
                </h3>
                <p className="text-xs text-[#78716C] max-w-xs mx-auto">
                  Explore our cloud kitchen menu to add fresh burgers, delicious bowls, and signature sides.
                </p>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="px-5 py-2.5 rounded-full bg-[#C2410C] text-white text-xs font-semibold hover:bg-[#9A3412]"
                >
                  Browse Menu
                </button>
              </div>
            ) : (
              <>
                {/* Free Delivery Automatic Progress Banner */}
                {deliveryType === "Delivery" && (
                  <div
                    className={`p-3.5 rounded-2xl border transition-all ${
                      isFreeDeliveryUnlocked
                        ? "bg-emerald-50/90 border-emerald-300 text-emerald-950 shadow-2xs"
                        : "bg-gradient-to-r from-orange-50/90 via-[#FFF7ED] to-white border-orange-200 text-[#1C1917] shadow-2xs"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-base shrink-0">
                          {isFreeDeliveryUnlocked ? "🎉" : "🛵"}
                        </span>
                        <div className="min-w-0">
                          {isFreeDeliveryUnlocked ? (
                            <p className="font-bold text-emerald-900 truncate">
                              You unlocked FREE Delivery!
                            </p>
                          ) : (
                            <p className="text-[#1C1917] truncate font-medium">
                              Add <span className="font-bold text-[#C2410C]">₹{freeDeliveryAmountNeeded}</span> more for <span className="font-bold text-emerald-700">FREE Delivery</span>
                            </p>
                          )}
                          <p className="text-[10px] text-[#78716C] mt-0.5">
                            {isFreeDeliveryUnlocked
                              ? "100% free doorstep delivery applied automatically"
                              : `Free delivery on all orders above ₹${freeDeliveryThreshold}`}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                          isFreeDeliveryUnlocked
                            ? "bg-emerald-600 text-white"
                            : "bg-orange-100 text-[#C2410C] border border-orange-200"
                        }`}
                      >
                        {isFreeDeliveryUnlocked ? "FREE" : `₹${baseDeliveryCharge}`}
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-black/5 rounded-full h-1.5 mt-2.5 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          isFreeDeliveryUnlocked ? "bg-emerald-600" : "bg-[#C2410C]"
                        }`}
                        style={{ width: `${freeDeliveryProgress}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Items List */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#78716C]">
                    Order Items
                  </h4>
                  <div className="space-y-3">
                    {cart.map(({ item, quantity }) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between gap-3 p-3.5 rounded-2xl bg-white border border-[#E7E0D8]"
                      >
                        {/* Food icon / diet indicator */}
                        <div className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0 bg-[#F5EFEB]">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        {/* Name and price */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            {item.dietary === "veg" ? (
                              <div className="w-3 h-3 rounded-xs border border-emerald-600 flex items-center justify-center shrink-0">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-600"></div>
                              </div>
                            ) : (
                              <div className="w-3 h-3 rounded-xs border border-rose-600 flex items-center justify-center shrink-0">
                                <div className="w-0 h-0 border-l-[3px] border-l-transparent border-r-[3px] border-r-transparent border-b-[5px] border-b-rose-600"></div>
                              </div>
                            )}
                            <h5 className="text-xs font-semibold text-[#1C1917] truncate">
                              {item.name}
                            </h5>
                          </div>
                          <p className="text-xs font-bold text-[#C2410C] mt-0.5">
                            ₹{item.price * quantity}{" "}
                            <span className="text-[10px] text-[#A8A29E] font-normal">
                              (₹{item.price} each)
                            </span>
                          </p>
                        </div>

                        {/* Quantity Counter */}
                        <div className="flex items-center gap-1 bg-[#F5EFEB] rounded-full p-1 shrink-0 border border-[#E7E0D8]">
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="w-6 h-6 rounded-full flex items-center justify-center text-[#1C1917] hover:bg-white transition-colors"
                          >
                            {quantity === 1 ? (
                              <Trash2 className="w-3 h-3 text-red-600" />
                            ) : (
                              <Minus className="w-3 h-3" />
                            )}
                          </button>
                          <span className="w-5 text-center text-xs font-bold text-[#1C1917]">
                            {quantity}
                          </span>
                          <button
                            onClick={() => addToCart(item)}
                            className="w-6 h-6 rounded-full flex items-center justify-center text-[#1C1917] hover:bg-white transition-colors"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Cooking Notes */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#78716C]">
                    Cooking & Packaging Notes
                  </label>
                  <textarea
                    rows={2}
                    value={cookingNotes}
                    onChange={(e) => setCookingNotes(e.target.value)}
                    placeholder="e.g. Less spicy, dressing on side, eco-friendly cutlery..."
                    className="w-full p-3 rounded-xl border border-[#E7E0D8] bg-white text-xs text-[#1C1917] placeholder:text-[#A8A29E] focus:outline-hidden focus:border-[#C2410C] transition-all resize-none"
                  />
                </div>

                {/* Available Coupons Slider Section */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold uppercase tracking-wider text-[#78716C] flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5 text-[#C2410C]" />
                      <span>Available Coupons & Offers</span>
                    </label>
                    {appliedCoupon && (
                      <button
                        type="button"
                        onClick={removeAppliedCoupon}
                        className="text-[11px] font-semibold text-rose-600 hover:underline cursor-pointer"
                      >
                        Remove Coupon
                      </button>
                    )}
                  </div>

                  {/* Active Applied Coupon Banner */}
                  {appliedCoupon && (
                    <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-300 flex items-center justify-between text-xs animate-in fade-in">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
                          <Check className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <p className="font-bold text-emerald-950 font-mono">
                            {appliedCoupon.code} Applied!
                          </p>
                          <p className="text-[11px] text-emerald-700">
                            {appliedCoupon.discountType === "free_delivery"
                              ? "Free delivery unlocked on this order!"
                              : `Saved ₹${couponDiscount} on this order`}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={removeAppliedCoupon}
                        className="w-6 h-6 rounded-full bg-white border border-emerald-300 text-emerald-800 flex items-center justify-center hover:bg-emerald-100 cursor-pointer"
                        title="Remove coupon"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                  {/* Coupon Code Manual Input */}
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (!couponCodeInput.trim()) return;
                      applyCoupon(couponCodeInput.trim());
                      setCouponCodeInput("");
                    }}
                    className="flex gap-2"
                  >
                    <input
                      type="text"
                      value={couponCodeInput}
                      onChange={(e) => setCouponCodeInput(e.target.value)}
                      placeholder="Enter coupon code..."
                      className="flex-1 px-3 py-2 rounded-xl border border-[#E7E0D8] bg-white text-xs font-mono uppercase text-[#1C1917] placeholder:normal-case placeholder:font-sans placeholder:text-[#A8A29E] focus:outline-hidden focus:border-[#C2410C]"
                    />
                    <button
                      type="submit"
                      disabled={!couponCodeInput.trim()}
                      className="px-4 py-2 rounded-xl bg-[#1C1917] hover:bg-black text-white text-xs font-bold transition-all disabled:opacity-40 cursor-pointer"
                    >
                      Apply
                    </button>
                  </form>

                  {/* Horizontal Scroll Slider of Available Coupons */}
                  <div className="flex gap-2.5 overflow-x-auto pb-1 scrollbar-none snap-x -mx-1 px-1">
                    {coupons
                      .filter((c) => c.isActive)
                      .map((coupon) => {
                        const isApplied = appliedCoupon?.id === coupon.id;
                        const isEligible = cartSubtotal >= coupon.minOrderAmount;
                        const amountShort = coupon.minOrderAmount - cartSubtotal;

                        return (
                          <div
                            key={coupon.id}
                            className={`min-w-[210px] max-w-[230px] p-3 rounded-2xl border transition-all flex flex-col justify-between shrink-0 snap-start shadow-2xs ${
                              isApplied
                                ? "bg-emerald-50/70 border-emerald-400 ring-1 ring-emerald-400/30"
                                : "bg-white border-[#E7E0D8] hover:border-[#C2410C]"
                            }`}
                          >
                            <div className="space-y-1">
                              <div className="flex items-center justify-between">
                                <span className="font-mono text-xs font-black text-[#C2410C] px-2 py-0.5 rounded-lg bg-[#FFF7ED] border border-orange-200">
                                  {coupon.code}
                                </span>
                                {coupon.isDefault && (
                                  <span className="text-[9px] uppercase font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded-md">
                                    Default
                                  </span>
                                )}
                              </div>
                              <h5 className="font-bold text-xs text-[#1C1917] line-clamp-1 pt-0.5">
                                {coupon.title}
                              </h5>
                              <p className="text-[10px] text-[#78716C] leading-snug line-clamp-2">
                                {coupon.description}
                              </p>
                            </div>

                            <div className="pt-2.5 mt-2 border-t border-[#F5EFEB] flex items-center justify-between text-[11px]">
                              {isEligible ? (
                                <span className="text-emerald-700 font-bold text-[10px]">
                                  ✓ Eligible
                                </span>
                              ) : (
                                <span className="text-[#A8A29E] text-[10px]">
                                  Add ₹{amountShort} more
                                </span>
                              )}

                              <button
                                type="button"
                                onClick={() => {
                                  if (isApplied) {
                                    removeAppliedCoupon();
                                  } else {
                                    applyCoupon(coupon.code);
                                  }
                                }}
                                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                  isApplied
                                    ? "bg-emerald-600 text-white"
                                    : isEligible
                                    ? "bg-[#C2410C] text-white hover:bg-[#9A3412]"
                                    : "bg-[#F5EFEB] text-[#78716C] hover:bg-[#E7E0D8]"
                                }`}
                              >
                                {isApplied ? "Applied ✓" : "APPLY"}
                              </button>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>

                {/* Bill Breakdown */}
                <div className="bg-white p-4 rounded-2xl border border-[#E7E0D8] space-y-2.5 text-xs">
                  <h4 className="font-bold uppercase tracking-wider text-[#78716C] mb-1">
                    Bill Summary
                  </h4>
                  <div className="flex justify-between text-[#78716C]">
                    <span>Item Subtotal</span>
                    <span className="font-semibold text-[#1C1917]">₹{cartSubtotal}</span>
                  </div>

                  {couponDiscount > 0 && (
                    <div className="flex justify-between text-emerald-700 font-semibold animate-in fade-in">
                      <span>Coupon Discount ({appliedCoupon?.code})</span>
                      <span>-₹{couponDiscount}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-[#78716C]">
                    <span>Packaging Charges</span>
                    <span className="font-semibold text-[#1C1917]">₹{packagingCharge}</span>
                  </div>

                  <div className="flex justify-between text-[#78716C]">
                    <span>Delivery Charge</span>
                    {deliveryFee === 0 ? (
                      <span className="font-semibold text-emerald-600 flex items-center gap-1">
                        {cartSubtotal > 0 && baseDeliveryCharge > 0 && (
                          <span className="text-[#A8A29E] line-through text-[11px]">
                            ₹{baseDeliveryCharge}
                          </span>
                        )}
                        <span>FREE</span>
                      </span>
                    ) : (
                      <span className="font-semibold text-[#1C1917]">
                        ₹{deliveryFee}{" "}
                        <span className="text-[10px] text-[#78716C] font-normal">
                          (Free above ₹{freeDeliveryThreshold})
                        </span>
                      </span>
                    )}
                  </div>

                  <div className="pt-2 border-t border-[#F5EFEB] flex justify-between items-center text-sm font-bold text-[#1C1917]">
                    <span>Grand Total</span>
                    <span className="font-serif text-lg text-[#C2410C]">
                      ₹{grandTotal}
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Footer Checkout CTA */}
          {cart.length > 0 && (
            <div className="p-6 border-t border-[#E7E0D8] bg-white space-y-3">
              {!isStoreOpen ? (
                <div className="px-3.5 py-3 rounded-2xl bg-rose-50 border border-rose-200 flex items-center gap-2.5 text-xs text-rose-700">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0" />
                  <span className="font-semibold">
                    The kitchen is currently closed.
                  </span>
                </div>
              ) : !user.isLoggedIn ? (
                <div className="px-3.5 py-2.5 rounded-2xl bg-[#FFF7ED] border border-[#FED7AA] flex items-center justify-between text-xs text-[#9A3412]">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-[#C2410C] shrink-0" />
                    <span className="font-semibold">Log in required to place order</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setIsCartOpen(false);
                      setIsAuthOpen(true);
                    }}
                    className="font-bold underline text-[#C2410C] hover:text-[#9A3412] cursor-pointer"
                  >
                    Log In
                  </button>
                </div>
              ) : null}
              <button
                onClick={handleProceedToCheckout}
                disabled={!isStoreOpen}
                className={`w-full py-4 px-6 rounded-2xl font-semibold text-sm shadow-lg flex items-center justify-between transition-all ${
                  !isStoreOpen
                    ? "bg-[#78716C] text-white opacity-60 cursor-not-allowed shadow-none"
                    : "bg-[#C2410C] hover:bg-[#9A3412] active:scale-98 text-white shadow-[#C2410C]/25 cursor-pointer"
                }`}
              >
                <div className="text-left">
                  <span className="text-[11px] block uppercase opacity-80 tracking-wider">
                    Doorstep Delivery • {cartCount} items
                  </span>
                  <span className="font-serif text-lg font-bold">₹{grandTotal}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>
                    {!isStoreOpen
                      ? "Kitchen Closed"
                      : user.isLoggedIn
                      ? "Proceed to Checkout"
                      : "Login to Checkout"}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
