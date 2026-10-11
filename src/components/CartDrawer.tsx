"use client";

import React from "react";
import { useKitchen } from "@/context/KitchenContext";
import { X, Trash2, Plus, Minus, ArrowRight, Utensils, MapPin, Bike, ShoppingBag, Sparkles } from "lucide-react";

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
    grandTotal,
    setIsCheckoutOpen,
  } = useKitchen();

  if (!isCartOpen) return null;

  const handleProceedToCheckout = () => {
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={() => setIsCartOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#FAF8F5] border-l border-[#E7E0D8] shadow-2xl flex flex-col justify-between">
          {/* Header */}
          <div className="p-6 border-b border-[#E7E0D8] flex items-center justify-between bg-white">
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
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {cart.length === 0 ? (
              <div className="text-center py-16 space-y-4">
                <div className="w-16 h-16 rounded-full bg-[#F5EFEB] flex items-center justify-center mx-auto text-[#A8A29E]">
                  <Utensils className="w-8 h-8" />
                </div>
                <h3 className="font-serif text-lg font-bold text-[#1C1917]">
                  Your cart is empty
                </h3>
                <p className="text-xs text-[#78716C] max-w-xs mx-auto">
                  Explore our artisanal carte to add wood-fired delicacies, fresh pastas, and signature desserts.
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
                {/* Delivery vs Pickup Switch Toggle */}
                <div className="bg-white p-2 rounded-2xl border border-[#E7E0D8]">
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setDeliveryType("Delivery")}
                      className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-semibold transition-all ${
                        deliveryType === "Delivery"
                          ? "bg-[#1C1917] text-white shadow-xs"
                          : "text-[#78716C] hover:bg-[#F5EFEB]"
                      }`}
                    >
                      <Bike className="w-4 h-4" />
                      <span>Delivery (₹40)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeliveryType("Pickup")}
                      className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-semibold transition-all ${
                        deliveryType === "Pickup"
                          ? "bg-[#1C1917] text-white shadow-xs"
                          : "text-[#78716C] hover:bg-[#F5EFEB]"
                      }`}
                    >
                      <MapPin className="w-4 h-4" />
                      <span>Kitchen Pickup (₹0)</span>
                    </button>
                  </div>

                  {/* Pickup address callout */}
                  {deliveryType === "Pickup" && (
                    <div className="mt-3 p-3 rounded-xl bg-[#F5EFEB] border border-[#E7E0D8] text-[11px] text-[#78716C] space-y-1">
                      <p className="font-semibold text-[#1C1917] flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-[#C2410C]" /> Kitchen Pickup Address
                      </p>
                      <p>The Red Löffel Kitchen, Suite 402, Artisan Lane, Indiranagar, Bengaluru - 560038</p>
                      <p className="text-[#C2410C] font-medium">Ready in ~25-30 minutes</p>
                    </div>
                  )}
                </div>

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

                {/* Bill Breakdown */}
                <div className="bg-white p-4 rounded-2xl border border-[#E7E0D8] space-y-2.5 text-xs">
                  <h4 className="font-bold uppercase tracking-wider text-[#78716C] mb-1">
                    Bill Summary
                  </h4>
                  <div className="flex justify-between text-[#78716C]">
                    <span>Item Subtotal</span>
                    <span className="font-semibold text-[#1C1917]">₹{cartSubtotal}</span>
                  </div>
                  <div className="flex justify-between text-[#78716C]">
                    <span>Taxes & GST (5%)</span>
                    <span className="font-semibold text-[#1C1917]">₹{tax}</span>
                  </div>
                  <div className="flex justify-between text-[#78716C]">
                    <span>Delivery Charge</span>
                    <span className="font-semibold text-[#1C1917]">
                      {deliveryFee === 0 ? (
                        <span className="text-emerald-600 font-bold">FREE (Pickup)</span>
                      ) : (
                        `₹${deliveryFee}`
                      )}
                    </span>
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
            <div className="p-6 border-t border-[#E7E0D8] bg-white">
              <button
                onClick={handleProceedToCheckout}
                className="w-full py-4 px-6 rounded-2xl bg-[#C2410C] hover:bg-[#9A3412] active:scale-98 text-white font-semibold text-sm shadow-lg shadow-[#C2410C]/25 flex items-center justify-between transition-all"
              >
                <div className="text-left">
                  <span className="text-[11px] block uppercase opacity-80 tracking-wider">
                    {deliveryType} • {cartCount} items
                  </span>
                  <span className="font-serif text-lg font-bold">₹{grandTotal}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>Proceed to Checkout</span>
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
