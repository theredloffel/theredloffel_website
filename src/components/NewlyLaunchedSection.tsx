"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { MenuItem } from "@/types";
import { Clock, ChevronLeft, ChevronRight, Plus, Minus } from "lucide-react";

interface NewlyLaunchedSectionProps {
  onCustomize: (item: MenuItem) => void;
  momoItem?: MenuItem;
  springRollItem?: MenuItem;
  momoQuantity?: number;
  springRollQuantity?: number;
  onAddToCart?: (item: MenuItem) => void;
  onRemoveFromCart?: (itemId: string) => void;
}

export function NewlyLaunchedSection({
  onCustomize,
  momoItem,
  springRollItem,
  momoQuantity = 0,
  springRollQuantity = 0,
  onAddToCart,
  onRemoveFromCart,
}: NewlyLaunchedSectionProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  // Touch and drag swipe state refs
  const touchStartXRef = useRef<number | null>(null);
  const touchStartYRef = useRef<number | null>(null);
  const isHorizontalSwipeRef = useRef<boolean | null>(null);
  const dragOffsetRef = useRef<number>(0);
  const isMouseDownRef = useRef(false);
  const mouseStartXRef = useRef<number | null>(null);

  // Keep dragOffsetRef in sync for click-prevention check
  useEffect(() => {
    dragOffsetRef.current = dragOffset;
  }, [dragOffset]);

  // Fallback Green Veg Momos item
  const momo: MenuItem = momoItem || {
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

  // Fallback Crispy Veg Spring Rolls item
  const springRoll: MenuItem = springRollItem || {
    id: "c10",
    name: "Crispy Veg Spring Rolls",
    category: "Chinese",
    price: 80,
    description:
      "Enjoy our crispy, golden spring rolls, filled with a flavourful blend of fresh vegetables and aromatic seasonings. Perfectly fried for a crunchy bite and served with sweet chilli dipping sauce. A delicious snack for any time of the day!",
    dietary: "veg",
    isAvailable: true,
    image: "/foodpic/Chinese_Rolls_Menu_Photos/Crispy_Veg_Spring_Rolls.png",
    tag: "Newly Launched",
    preparationTime: "10 mins",
    calories: "240 kcal",
  };

  const items = [
    {
      item: momo,
      price: 119,
      portionLabel: "Steam & Fried",
      prepTime: "12 mins",
      quantity: momoQuantity,
      isCustomizable: true,
    },
    {
      item: springRoll,
      price: 80,
      portionLabel: "2 Large Pieces",
      prepTime: "10 mins",
      quantity: springRollQuantity,
      isCustomizable: false,
    },
  ];

  const handlePrev = () => {
    setActiveIndex((prev) => (prev === 0 ? items.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev === items.length - 1 ? 0 : prev + 1));
  };

  // Touch handlers for mobile swipe with real-time finger tracking
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
    touchStartYRef.current = e.touches[0].clientY;
    isHorizontalSwipeRef.current = null;
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null || touchStartYRef.current === null) return;
    const currentX = e.touches[0].clientX;
    const currentY = e.touches[0].clientY;
    const deltaX = currentX - touchStartXRef.current;
    const deltaY = currentY - touchStartYRef.current;

    // Determine swipe direction once
    if (isHorizontalSwipeRef.current === null) {
      if (Math.abs(deltaX) > 6 || Math.abs(deltaY) > 6) {
        isHorizontalSwipeRef.current = Math.abs(deltaX) > Math.abs(deltaY);
      }
    }

    if (isHorizontalSwipeRef.current) {
      setDragOffset(deltaX);
    }
  };

  const handleTouchEnd = () => {
    if (isHorizontalSwipeRef.current && Math.abs(dragOffsetRef.current) > 40) {
      if (dragOffsetRef.current < -40) {
        handleNext();
      } else {
        handlePrev();
      }
    }
    setDragOffset(0);
    setIsDragging(false);
    touchStartXRef.current = null;
    touchStartYRef.current = null;
    isHorizontalSwipeRef.current = null;
  };

  const handleTouchCancel = () => {
    setDragOffset(0);
    setIsDragging(false);
    touchStartXRef.current = null;
    touchStartYRef.current = null;
    isHorizontalSwipeRef.current = null;
  };

  // Mouse drag handlers for desktop swipe
  const handleMouseDown = (e: React.MouseEvent) => {
    isMouseDownRef.current = true;
    mouseStartXRef.current = e.clientX;
    setIsDragging(true);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isMouseDownRef.current || mouseStartXRef.current === null) return;
    const deltaX = e.clientX - mouseStartXRef.current;
    setDragOffset(deltaX);
  };

  const handleMouseUp = () => {
    if (!isMouseDownRef.current) return;
    if (Math.abs(dragOffsetRef.current) > 40) {
      if (dragOffsetRef.current < -40) {
        handleNext();
      } else {
        handlePrev();
      }
    }
    setDragOffset(0);
    setIsDragging(false);
    isMouseDownRef.current = false;
    mouseStartXRef.current = null;
  };

  const handleMouseLeave = () => {
    if (isMouseDownRef.current) {
      handleMouseUp();
    }
  };

  const handleItemAdd = (target: (typeof items)[0]) => {
    // Prevent accidental clicks while swiping
    if (Math.abs(dragOffsetRef.current) > 10) return;

    if (target.isCustomizable) {
      onCustomize(target.item);
    } else {
      if (onAddToCart) {
        onAddToCart(target.item);
      }
    }
  };

  const handleItemRemove = (target: (typeof items)[0]) => {
    if (Math.abs(dragOffsetRef.current) > 10) return;

    if (onRemoveFromCart) {
      onRemoveFromCart(target.item.id);
    }
  };

  return (
    <div className="relative z-20 w-full mb-6 sm:mb-10 pt-2 select-none">
      {/* 1. TITLE: "NEWLY LAUNCHED" - Exact replica of reference photo typography */}
      <div className="flex items-center justify-center mb-6 sm:mb-8 px-4">
        <svg
          viewBox="0 0 540 85"
          className="w-full max-w-[320px] sm:max-w-[440px] md:max-w-[490px] overflow-visible select-none drop-shadow-sm pointer-events-none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <filter id="black-block-shadow" x="-10%" y="-10%" width="130%" height="140%">
              <feDropShadow dx="0" dy="5" stdDeviation="0" floodColor="#000000" floodOpacity="1" />
            </filter>
          </defs>

          {/* Sparkle 1 */}
          <path
            d="M124 16 L127 25 L136 28 L127 31 L124 40 L121 31 L112 28 L121 25 Z"
            fill="#00E676"
            stroke="#000000"
            strokeWidth="2.2"
            strokeLinejoin="round"
          />

          {/* Sparkle 2 */}
          <path
            d="M416 11 L419 18 L427 21 L419 24 L416 31 L413 24 L405 21 L413 18 Z"
            fill="#00E676"
            stroke="#000000"
            strokeWidth="2.2"
            strokeLinejoin="round"
          />

          {/* Text with outline */}
          <text
            x="270"
            y="64"
            textAnchor="middle"
            fill="#00E676"
            stroke="#000000"
            strokeWidth="10"
            strokeLinejoin="round"
            paintOrder="stroke fill"
            filter="url(#black-block-shadow)"
            style={{
              fontFamily: "'Impact', 'Arial Black', sans-serif",
              fontSize: "58px",
              fontWeight: 900,
              letterSpacing: "1px",
            }}
          >
            NEWLY LAUNCHED
          </text>
        </svg>
      </div>

      {/* 2. SLIDER WRAPPER WITH ARROWS */}
      <div className="relative max-w-[440px] sm:max-w-[470px] mx-auto px-4 sm:px-6">
        {/* Navigation Arrow Left */}
        <button
          type="button"
          onClick={handlePrev}
          aria-label="Previous item"
          className="absolute -left-2 sm:-left-4 md:-left-5 top-1/2 -translate-y-1/2 z-40 w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-white text-[#014725] border-2 border-[#00E676] shadow-md hover:bg-[#00E676] hover:text-black active:scale-95 transition-all flex items-center justify-center cursor-pointer select-none"
        >
          <ChevronLeft className="w-6 h-6 stroke-[3]" />
        </button>

        {/* Navigation Arrow Right */}
        <button
          type="button"
          onClick={handleNext}
          aria-label="Next item"
          className="absolute -right-2 sm:-right-4 md:-right-5 top-1/2 -translate-y-1/2 z-40 w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-white text-[#014725] border-2 border-[#00E676] shadow-md hover:bg-[#00E676] hover:text-black active:scale-95 transition-all flex items-center justify-center cursor-pointer select-none"
        >
          <ChevronRight className="w-6 h-6 stroke-[3]" />
        </button>

        {/* Slide Viewport - touch-action: pan-y allows vertical scrolling while capturing horizontal swipes */}
        <div
          className="overflow-hidden w-full cursor-grab active:cursor-grabbing"
          style={{ touchAction: "pan-y" }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onTouchCancel={handleTouchCancel}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
        >
          {/* Sliding Track - smoothly animates or tracks finger/mouse in real time */}
          <div
            className="flex w-full select-none"
            style={{
              transform: `translateX(calc(-${activeIndex * 100}% + ${dragOffset}px))`,
              transition: isDragging ? "none" : "transform 340ms cubic-bezier(0.2, 0.9, 0.3, 1)",
            }}
          >
            {items.map((entry) => (
              <div
                key={entry.item.id}
                className="w-full shrink-0 flex flex-col items-center px-2 pt-2 pb-14 select-none"
              >
                {/* Hero Card Box - Clean neutral shadow without any green glow/tint */}
                <div className="relative z-10 w-full max-w-[340px] sm:max-w-[360px] bg-[#014725] rounded-[36px] p-4 sm:p-5 shadow-[0_12px_28px_rgba(0,0,0,0.15)] flex flex-col items-center">
                  {/* Halftone / Radial dot pattern in top half behind food */}
                  <div
                    className="absolute top-0 inset-x-0 h-64 rounded-t-[36px] opacity-25 pointer-events-none"
                    style={{
                      backgroundImage: "radial-gradient(#00E676 1.8px, transparent 1.8px)",
                      backgroundSize: "13px 13px",
                      maskImage: "radial-gradient(circle at 50% 40%, black 50%, transparent 85%)",
                      WebkitMaskImage: "radial-gradient(circle at 50% 40%, black 50%, transparent 85%)",
                    }}
                  />

                  {/* Food Picture Box */}
                  <div className="relative w-full aspect-4/3 rounded-2xl overflow-hidden bg-black/20 shadow-sm pointer-events-none">
                    <Image
                      src={entry.item.image}
                      alt={entry.item.name}
                      fill
                      priority
                      className="object-cover pointer-events-none"
                    />
                  </div>

                  {/* Lightning / Energy Wave Graphic behind Price Pill */}
                  <div className="w-full flex items-center justify-center -mt-3.5 mb-1 relative z-10 pointer-events-none opacity-40">
                    <svg
                      viewBox="0 0 320 28"
                      className="w-full h-7 text-[#00E676]"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    >
                      <path d="M10 14 L75 14 L95 24 L110 5 L130 18 L190 18 L210 5 L225 24 L245 14 L310 14" />
                    </svg>
                  </div>

                  {/* Floating Dark Green Price Pill */}
                  <div className="relative z-20 -mt-6">
                    <div className="bg-[#012613] rounded-full py-1.5 px-7 shadow-lg border border-white/10 flex items-center justify-center">
                      <span className="text-[#00E676] font-black text-2xl sm:text-3xl tracking-tight leading-tight">
                        ₹{entry.price}
                      </span>
                    </div>
                  </div>

                  {/* Details Row */}
                  <div className="mt-3.5 flex items-center justify-center gap-3.5 text-xs font-semibold text-white">
                    {/* Veg indicator */}
                    <div className="flex items-center gap-1.5">
                      <div className="w-4 h-4 rounded-xs border-2 border-emerald-400 flex items-center justify-center bg-white p-0.5 shrink-0">
                        <div className="w-2 h-2 rounded-full bg-emerald-600"></div>
                      </div>
                      <span className="text-white text-xs font-medium tracking-wide">
                        {entry.portionLabel}
                      </span>
                    </div>

                    {/* Prep Time */}
                    <div className="flex items-center gap-1.5 text-white text-xs font-medium">
                      <Clock className="w-4 h-4 text-white stroke-[2.2]" />
                      <span>{entry.prepTime}</span>
                    </div>
                  </div>

                  {/* Dish Name */}
                  <div className="text-center mt-2 mb-6">
                    <h3 className="font-serif font-bold text-xl sm:text-2xl text-white tracking-tight drop-shadow-sm truncate max-w-[280px]">
                      {entry.item.name.replace(/\s*\([^)]+\)/i, "").trim()}
                    </h3>
                  </div>

                  {/* Elevated 3D White ADD Button overlapping the bottom border - fully unclipped inside pb-14 padding */}
                  <div className="absolute left-1/2 -bottom-5 sm:-bottom-6 -translate-x-1/2 z-30 pointer-events-auto">
                    {entry.quantity === 0 ? (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleItemAdd(entry);
                        }}
                        className="w-44 sm:w-48 py-3 rounded-[22px] bg-white text-[#014725] font-black text-lg sm:text-xl uppercase tracking-wider shadow-[0_7px_0_#012613] hover:bg-emerald-50 active:translate-y-1 active:shadow-[0_2px_0_#012613] transition-all cursor-pointer flex items-center justify-center select-none"
                      >
                        <span>ADD</span>
                      </button>
                    ) : (
                      <div
                        onClick={(e) => e.stopPropagation()}
                        className="w-44 sm:w-48 py-2.5 sm:py-3 rounded-[22px] bg-white border-2 border-[#013F20] text-[#025E30] font-black text-base sm:text-lg shadow-[0_7px_0_#012613] flex items-center justify-between px-3 select-none"
                      >
                        <button
                          type="button"
                          onClick={() => handleItemRemove(entry)}
                          className="w-7 h-7 flex items-center justify-center rounded-lg bg-emerald-100 hover:bg-emerald-200 active:scale-95 text-[#025E30] transition-all cursor-pointer"
                          aria-label="Decrease"
                        >
                          <Minus className="w-4 h-4 stroke-[3]" />
                        </button>
                        <span className="text-[#025E30] font-black text-base">
                          {entry.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleItemAdd(entry)}
                          className="w-7 h-7 flex items-center justify-center rounded-lg bg-[#025E30] hover:bg-[#013F20] active:scale-95 text-white transition-all cursor-pointer"
                          aria-label="Increase"
                        >
                          <Plus className="w-4 h-4 stroke-[3]" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 3. SLIDER DOTS INDICATORS - positioned with comfortable margin below unclipped ADD button */}
        <div className="flex items-center justify-center gap-2.5 -mt-4 relative z-40">
          {items.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setActiveIndex(i)}
              className={`h-2.5 rounded-full transition-all cursor-pointer ${
                activeIndex === i
                  ? "w-8 bg-[#00E676] shadow-[0_0_8px_#00E676]"
                  : "w-2.5 bg-[#014725]/30 hover:bg-[#014725]/60"
              }`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
