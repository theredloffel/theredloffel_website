"use client";

import React from "react";
import Image from "next/image";
import { MenuItem } from "@/types";
import { Clock, Plus, Minus } from "lucide-react";

interface NewlyLaunchedSectionProps {
  onCustomize: (item: MenuItem) => void;
  momoItem?: MenuItem;
  quantityInCart?: number;
  onRemoveFromCart?: (itemId: string) => void;
  onAddToCart?: (item: MenuItem) => void;
}

export function NewlyLaunchedSection({
  onCustomize,
  momoItem,
  quantityInCart = 0,
  onRemoveFromCart,
  onAddToCart,
}: NewlyLaunchedSectionProps) {
  // Fallback Green Veg Momos item representation if not passed
  const item: MenuItem = momoItem || {
    id: "c9-steam",
    name: "Green Veg Momos (Steam)",
    category: "Chinese",
    price: 119,
    description:
      "Delicious green momos filled with flavourful veggie stuffing, steamed to perfection and served with our signature spicy red chutney and creamy orange dip. A perfect bite of freshness, flavour, and comfort in every piece!",
    dietary: "veg",
    isAvailable: true,
    image: "/foodpic/momos/greenmomos.png",
    tag: "Chef's Special",
    preparationTime: "12 mins",
    calories: "220 kcal",
  };

  const handleAddClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onCustomize(item);
  };

  return (
    <div className="w-full mb-10 sm:mb-14 pt-2">
      {/* 1. Header: NEWLY LAUNCHED with bubbly text and sparkle stars */}
      <div className="flex flex-col items-center justify-center mb-6">
        <div className="relative inline-block select-none">
          {/* Sparkle top-left */}
          <svg
            className="absolute -top-3.5 -left-4 sm:-left-5 w-6 h-6 sm:w-7 sm:h-7 text-[#00E676] drop-shadow-[0_2px_0_#000]"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M12 0L14.5 9.5L24 12L14.5 14.5L12 24L9.5 14.5L0 12L9.5 9.5L12 0Z" stroke="#000" strokeWidth="1.5" />
          </svg>

          {/* Sparkle top-right */}
          <svg
            className="absolute -top-3 -right-4 sm:-right-5 w-5 h-5 sm:w-6 sm:h-6 text-[#00E676] drop-shadow-[0_2px_0_#000]"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M12 0L14.5 9.5L24 12L14.5 14.5L12 24L9.5 14.5L0 12L9.5 9.5L12 0Z" stroke="#000" strokeWidth="1.5" />
          </svg>

          <h2
            className="font-black text-3xl sm:text-4xl md:text-5xl uppercase tracking-wider text-[#00E676] text-center"
            style={{
              WebkitTextStroke: "2.5px #000",
              textShadow: "0 4px 0 #000, 0 5px 0 #000, 0 6px 0 #000",
              fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Impact', sans-serif",
            }}
          >
            NEWLY LAUNCHED
          </h2>
        </div>
      </div>

      {/* 2. Carousel / Showcase container with side peek cards and center card */}
      <div className="relative max-w-4xl mx-auto flex items-center justify-center px-2 sm:px-4">
        {/* Left Peeking Card */}
        <div className="hidden sm:flex relative -mr-6 md:-mr-10 h-72 sm:h-84 md:h-96 w-20 sm:w-28 md:w-36 rounded-3xl bg-gradient-to-br from-[#00E676] via-[#00C853] to-[#00A844] border-2 border-[#004D25] shadow-lg overflow-hidden shrink-0 items-center justify-center opacity-90 transition-transform hover:scale-102">
          {/* Waiter arm holding cloche plate tray pointing right */}
          <div className="absolute inset-y-0 right-0 w-full flex items-center justify-end pr-1 sm:pr-2 pointer-events-none">
            <svg
              viewBox="0 0 120 120"
              className="w-16 h-16 sm:w-20 sm:h-20 text-[#1C1917]"
              fill="currentColor"
            >
              {/* Sleeve */}
              <path d="M0 45 L60 48 L60 72 L0 75 Z" fill="#1C1917" />
              {/* White cuff */}
              <path d="M60 48 L70 49 L70 71 L60 72 Z" fill="#FFFFFF" />
              {/* Hand */}
              <ellipse cx="78" cy="60" rx="8" ry="7" fill="#FBCFE8" />
              {/* Tray */}
              <rect x="75" y="65" width="40" height="6" rx="3" fill="#1C1917" />
              {/* Cloche Dome */}
              <path d="M80 65 Q95 40 110 65 Z" fill="#1C1917" />
              {/* Cloche Knob */}
              <circle cx="95" cy="38" r="3" fill="#1C1917" />
            </svg>
          </div>
        </div>

        {/* Center Main Spotlight Card */}
        <div
          className="relative z-10 w-full max-w-[340px] sm:max-w-[370px] bg-gradient-to-b from-[#027A3F] via-[#025E30] to-[#013F20] rounded-[32px] border-2 border-emerald-400/40 p-4 sm:p-5 shadow-[0_16px_35px_-8px_rgba(2,94,48,0.5)] transition-all duration-300"
        >
          {/* Halftone / Dot pattern overlay in background */}
          <div
            className="absolute inset-0 rounded-[32px] opacity-15 pointer-events-none"
            style={{
              backgroundImage: "radial-gradient(#FFFFFF 1.5px, transparent 1.5px)",
              backgroundSize: "14px 14px",
            }}
          />

          {/* Food Picture Box */}
          <div className="relative w-full aspect-4/3 rounded-2xl overflow-hidden bg-emerald-950/40 border border-white/15 shadow-inner">
            <Image
              src="/foodpic/momos/greenmomos.png"
              alt="Green Veg Momos"
              fill
              priority
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
            {/* Soft lighting highlight vignette */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
          </div>

          {/* Floating Price Pill badge */}
          <div className="flex justify-center -mt-6 sm:-mt-7 relative z-10">
            <div className="bg-[#012E17] border-2 border-[#00E676]/60 rounded-full py-1.5 px-6 shadow-xl flex items-center justify-center">
              <span className="text-[#00E676] font-black text-xl sm:text-2xl tracking-tight">
                ₹119
              </span>
            </div>
          </div>

          {/* Details Row */}
          <div className="mt-4 flex items-center justify-center gap-4 text-xs font-semibold text-white">
            {/* Veg Indicator */}
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-4 rounded-xs border-1.5 border-emerald-400 flex items-center justify-center bg-white p-0.5 shrink-0">
                <div className="w-2 h-2 rounded-full bg-emerald-600"></div>
              </div>
              <span className="tracking-wide">Steam & Fried</span>
            </div>

            <span className="w-1 h-1 rounded-full bg-white/40" />

            {/* Preparation Time */}
            <div className="flex items-center gap-1 text-emerald-100">
              <Clock className="w-3.5 h-3.5 text-emerald-300 stroke-[2.5]" />
              <span>12 mins</span>
            </div>
          </div>

          {/* Dish Name */}
          <div className="text-center mt-2.5 mb-5 sm:mb-6">
            <h3 className="font-serif font-bold text-xl sm:text-2xl text-white tracking-tight drop-shadow-xs">
              Green Veg Momos
            </h3>
            <p className="text-[11px] sm:text-xs text-emerald-100/80 font-normal line-clamp-1 mt-0.5 px-2">
              Flavourful veggie stuffing • Spicy red chutney & creamy orange dip
            </p>
          </div>

          {/* Elevated ADD Button centered overlapping bottom edge */}
          <div className="absolute left-1/2 -bottom-5 sm:-bottom-6 -translate-x-1/2 z-20">
            {quantityInCart === 0 ? (
              <button
                type="button"
                onClick={handleAddClick}
                className="w-40 sm:w-44 py-2.5 sm:py-3 rounded-2xl bg-white border-2 border-[#013F20] text-[#025E30] font-black text-base sm:text-lg uppercase tracking-wider shadow-[0_5px_0_#012613] hover:bg-emerald-50 active:translate-y-1 active:shadow-[0_1px_0_#012613] transition-all cursor-pointer flex flex-col items-center justify-center"
              >
                <span>ADD</span>
              </button>
            ) : (
              <div
                onClick={(e) => e.stopPropagation()}
                className="w-40 sm:w-44 py-2.5 sm:py-3 rounded-2xl bg-white border-2 border-[#013F20] text-[#025E30] font-black text-base sm:text-lg shadow-[0_5px_0_#012613] flex items-center justify-between px-3 select-none"
              >
                <button
                  type="button"
                  onClick={() => {
                    if (onRemoveFromCart) onRemoveFromCart(item.id);
                  }}
                  className="w-7 h-7 flex items-center justify-center rounded-lg bg-emerald-100 hover:bg-emerald-200 active:scale-95 text-[#025E30] transition-all cursor-pointer"
                  aria-label="Decrease"
                >
                  <Minus className="w-4 h-4 stroke-[3]" />
                </button>
                <span className="text-[#025E30] font-black text-base">
                  {quantityInCart}
                </span>
                <button
                  type="button"
                  onClick={handleAddClick}
                  className="w-7 h-7 flex items-center justify-center rounded-lg bg-[#025E30] hover:bg-[#013F20] active:scale-95 text-white transition-all cursor-pointer"
                  aria-label="Increase"
                >
                  <Plus className="w-4 h-4 stroke-[3]" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Peeking Card */}
        <div className="hidden sm:flex relative -ml-6 md:-ml-10 h-72 sm:h-84 md:h-96 w-20 sm:w-28 md:w-36 rounded-3xl bg-gradient-to-bl from-[#00E676] via-[#00C853] to-[#00A844] border-2 border-[#004D25] shadow-lg overflow-hidden shrink-0 items-center justify-center opacity-90 transition-transform hover:scale-102">
          {/* Waiter arm holding cloche plate tray pointing left */}
          <div className="absolute inset-y-0 left-0 w-full flex items-center justify-start pl-1 sm:pl-2 pointer-events-none">
            <svg
              viewBox="0 0 120 120"
              className="w-16 h-16 sm:w-20 sm:h-20 text-[#1C1917]"
              fill="currentColor"
            >
              {/* Sleeve */}
              <path d="M120 45 L60 48 L60 72 L120 75 Z" fill="#1C1917" />
              {/* White cuff */}
              <path d="M60 48 L50 49 L50 71 L60 72 Z" fill="#FFFFFF" />
              {/* Hand */}
              <ellipse cx="42" cy="60" rx="8" ry="7" fill="#FBCFE8" />
              {/* Tray */}
              <rect x="5" y="65" width="40" height="6" rx="3" fill="#1C1917" />
              {/* Cloche Dome */}
              <path d="M10 65 Q25 40 40 65 Z" fill="#1C1917" />
              {/* Cloche Knob */}
              <circle cx="25" cy="38" r="3" fill="#1C1917" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
