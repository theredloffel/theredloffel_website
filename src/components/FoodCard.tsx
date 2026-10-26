"use client";

import React from "react";
import { MenuItem } from "@/types";
import { useKitchen } from "@/context/KitchenContext";
import { Plus, Minus } from "lucide-react";

export const getBaseDishName = (name: string) => {
  return name.replace(/\s*\((Small|Large|Half|Full|Regular|Steam|Fried)\)/i, "").trim();
};

interface FoodCardProps {
  item: MenuItem;
  onCustomize?: (item: MenuItem) => void;
  dishVariantsMap?: Record<string, MenuItem[]>;
}

export function FoodCard({ item, onCustomize, dishVariantsMap }: FoodCardProps) {
  const { cart, addToCart, removeFromCart } = useKitchen();

  const cleanTitle = getBaseDishName(item.name);
  const cleanDesc = item.description.replace(/\s*\(Portion:\s*(Small|Large|Steam|Fried)\)/i, "");

  const variants = dishVariantsMap ? dishVariantsMap[cleanTitle] : null;
  const hasSizes = Boolean(variants && variants.length > 1);

  // Calculate quantity in cart
  const quantity = React.useMemo(() => {
    const variantList = variants || [item];
    const variantIds = variantList.map((v) => v.id);
    return cart
      .filter((ci) => variantIds.includes(ci.item.id) || ci.item.id.startsWith(item.id))
      .reduce((sum, ci) => sum + ci.quantity, 0);
  }, [cart, variants, item]);

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    const variantList = variants || [item];
    const variantIds = variantList.map((v) => v.id);
    const inCart = cart.find(
      (ci) => variantIds.includes(ci.item.id) || ci.item.id.startsWith(item.id)
    );
    if (inCart) {
      removeFromCart(inCart.item.id);
    } else {
      removeFromCart(item.id);
    }
  };

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (hasSizes && onCustomize) {
      onCustomize(item);
    } else {
      addToCart(item);
    }
  };

  return (
    <div
      onClick={() => {
        if (hasSizes && item.isAvailable && onCustomize) {
          onCustomize(item);
        }
      }}
      className={`group relative flex flex-col bg-transparent transition-all duration-300 ${
        hasSizes && item.isAvailable ? "cursor-pointer" : ""
      }`}
    >
      {/* Top: Image & Info strip container */}
      <div className="relative rounded-2xl sm:rounded-3xl border border-[#E2E8F0] bg-white shadow-2xs">
        {/* Food Image */}
        <div className="relative h-36 sm:h-44 md:h-48 w-full overflow-hidden rounded-t-2xl sm:rounded-t-3xl bg-[#F5EFEB]">
          <img
            src={item.image}
            alt={cleanTitle}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />

          {/* Top Badges overlay */}
          <div className="absolute top-2 left-2 flex flex-wrap gap-1">
            {item.tag && (
              <span className="px-2 py-0.5 rounded-md bg-[#1C1917]/85 backdrop-blur-xs text-[#FAF8F5] text-[9px] font-bold uppercase tracking-wider shadow-xs">
                {item.tag}
              </span>
            )}
            {item.price <= 99 && (
              <span className="px-1.5 py-0.5 rounded-md bg-emerald-600 text-white text-[9px] font-bold tracking-tight shadow-xs">
                Under ₹99
              </span>
            )}
          </div>

          {/* Out of Stock Banner */}
          {!item.isAvailable && (
            <div className="absolute bottom-0 inset-x-0 bg-black/60 backdrop-blur-xs py-1.5 px-3 flex items-center justify-center gap-1.5 border-t border-white/10 text-white shadow-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse shrink-0" />
              <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-widest text-[#FAF8F5]">
                Out of Stock
              </span>
            </div>
          )}
        </div>

        {/* Info Strip: Light Grey Bar */}
        <div className="bg-[#EDF2F2] pl-2 sm:pl-2.5 pr-1.5 sm:pr-2 py-2 sm:py-2.5 flex items-center justify-between rounded-b-2xl sm:rounded-b-3xl border-t border-[#E2E8F0]/60">
          {/* Left: Veg/Non-Veg indicator + Serves 1 */}
          <div className="flex items-center gap-1 shrink-0">
            {item.dietary === "non-veg" ? (
              <div className="w-3.5 h-3.5 rounded-xs border-[1.5px] border-[#991B1B] flex items-center justify-center bg-white shrink-0">
                <div className="w-0 h-0 border-l-[3px] border-l-transparent border-r-[3px] border-r-transparent border-b-[6px] border-b-[#991B1B]"></div>
              </div>
            ) : (
              <div className="w-3.5 h-3.5 rounded-xs border-[1.5px] border-emerald-600 flex items-center justify-center bg-white shrink-0">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-600"></div>
              </div>
            )}
            <span className="font-semibold text-[10px] sm:text-[11px] text-[#374151] whitespace-nowrap">
              Serves 1
            </span>
          </div>

          {/* Gap spacer to guarantee separation from the overlapping ADD button */}
          <div className="w-[80px] sm:w-[90px] shrink-0" />
        </div>

        {/* ADD / Stepper Button: Anchored overlapping the bottom-right of the info strip */}
        <div className="absolute right-1.5 sm:right-2 bottom-0 translate-y-1/2 z-10">
          {!item.isAvailable ? (
            <button
              type="button"
              disabled
              className="w-[78px] sm:w-[88px] h-9 sm:h-10 rounded-xl sm:rounded-2xl bg-gray-100 border-2 border-gray-400 text-gray-400 font-bold text-xs tracking-wider shadow-[2px_2px_0px_#9CA3AF] sm:shadow-[2.5px_2.5px_0px_#9CA3AF] cursor-not-allowed select-none flex items-center justify-center"
            >
              ADD
            </button>
          ) : quantity === 0 ? (
            <button
              type="button"
              onClick={handleAdd}
              className="w-[78px] sm:w-[88px] h-9 sm:h-10 rounded-xl sm:rounded-2xl bg-white border-2 border-[#1C1917] shadow-[2.5px_2.5px_0px_#1C1917] sm:shadow-[3px_3px_0px_#1C1917] hover:bg-emerald-50/50 active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0px_#1C1917] transition-all flex flex-col items-center justify-center cursor-pointer select-none px-1"
            >
              <span className="text-emerald-600 font-bold text-xs sm:text-sm tracking-wider leading-none">
                ADD
              </span>
              {hasSizes && (
                <span className="text-emerald-600 text-[8.5px] sm:text-[9.5px] font-semibold tracking-tight leading-none mt-0.5">
                  customise
                </span>
              )}
            </button>
          ) : (
            <div
              onClick={(e) => e.stopPropagation()}
              className="w-[78px] sm:w-[88px] h-9 sm:h-10 rounded-xl sm:rounded-2xl bg-emerald-600 border-2 border-[#1C1917] shadow-[2.5px_2.5px_0px_#1C1917] sm:shadow-[3px_3px_0px_#1C1917] flex items-center justify-between px-1.5 sm:px-2 text-white select-none"
            >
              <button
                type="button"
                onClick={handleRemove}
                className="w-5.5 h-5.5 flex items-center justify-center hover:bg-black/20 rounded-md active:scale-90 transition-transform cursor-pointer"
                aria-label="Decrease quantity"
              >
                <Minus className="w-3.5 h-3.5 stroke-[2.5]" />
              </button>
              <span className="font-bold text-xs sm:text-sm text-white px-0.5">
                {quantity}
              </span>
              <button
                type="button"
                onClick={handleAdd}
                className="w-5.5 h-5.5 flex items-center justify-center hover:bg-black/20 rounded-md active:scale-90 transition-transform cursor-pointer"
                aria-label="Increase quantity"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Bottom: Pricing & Title (Directly on page background, no white box) */}
      <div className="px-1 pt-3.5 sm:pt-4 pb-1 flex-1 flex flex-col">
        <div className="flex items-baseline">
          <span className="text-lg sm:text-xl md:text-2xl font-black text-[#1C1917] tracking-tight">
            ₹{item.price}
          </span>
        </div>

        <h3 className="font-bold text-xs sm:text-sm md:text-base text-[#1C1917] line-clamp-2 leading-snug group-hover:text-emerald-700 transition-colors mt-0.5">
          {cleanTitle}
        </h3>

        {cleanDesc && (
          <p className="text-[11px] sm:text-xs text-[#78716C] line-clamp-2 mt-1 leading-snug font-normal">
            {cleanDesc}
          </p>
        )}
      </div>
    </div>
  );
}
