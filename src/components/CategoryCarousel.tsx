"use client";

import React, { useRef } from "react";
import { useKitchen } from "@/context/KitchenContext";
import { Category } from "@/types";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface CategoryItem {
  id: Category;
  title: string;
  subtitle: string;
  image: string;
}

const CATEGORIES_DATA: CategoryItem[] = [
  {
    id: "All",
    title: "All Items",
    subtitle: "Complete Carte",
    image: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=300&q=80",
  },
  {
    id: "Under ₹99",
    title: "Under ₹99",
    subtitle: "Pocket Friendly",
    image: "https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=300&q=80",
  },
  {
    id: "Burgers",
    title: "Burgers",
    subtitle: "From ₹50",
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=300&q=80",
  },
  {
    id: "Parathas",
    title: "Parathas",
    subtitle: "From ₹40",
    image: "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=300&q=80",
  },
  {
    id: "Chinese",
    title: "Chinese",
    subtitle: "Noodles & Rolls",
    image: "https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&w=300&q=80",
  },
  {
    id: "Fried Rice",
    title: "Fried Rice",
    subtitle: "From ₹90",
    image: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=300&q=80",
  },
  {
    id: "Pasta",
    title: "Pasta",
    subtitle: "White & Red",
    image: "https://images.unsplash.com/photo-1645112411341-6c4fd023714a?auto=format&fit=crop&w=300&q=80",
  },
  {
    id: "Maggi",
    title: "Maggi",
    subtitle: "Cheese & Paneer",
    image: "https://images.unsplash.com/photo-1612927601601-6638404737ce?auto=format&fit=crop&w=300&q=80",
  },
  {
    id: "Fries",
    title: "Fries",
    subtitle: "Peri Peri",
    image: "https://images.unsplash.com/photo-1630384060421-cb20d0e0649d?auto=format&fit=crop&w=300&q=80",
  },
  {
    id: "Bowls",
    title: "Meal Bowls",
    subtitle: "Rajma & Chole",
    image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=300&q=80",
  },
];

export function CategoryCarousel() {
  const { selectedCategory, setSelectedCategory, setSearchQuery } = useKitchen();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === "left" ? -280 : 280;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  const handleCategorySelect = (category: Category) => {
    setSearchQuery("");
    setSelectedCategory(category);

    const isDesktop = typeof window !== "undefined" && window.innerWidth >= 768;
    const headerOffset = isDesktop ? 160 : 115;

    if (category === "Under ₹99" || category === "All") {
      const menuEl = document.getElementById("menu");
      if (menuEl) {
        const y = menuEl.getBoundingClientRect().top + window.pageYOffset - (isDesktop ? 150 : 105);
        window.scrollTo({ top: Math.max(0, y), behavior: "smooth" });
      }
      return;
    }

    setTimeout(() => {
      const catId = `cat-${category.replace(/\s+/g, "-")}`;
      const catEl = document.getElementById(catId);
      if (catEl) {
        const y = catEl.getBoundingClientRect().top + window.pageYOffset - headerOffset;
        window.scrollTo({ top: Math.max(0, y), behavior: "smooth" });
      } else {
        const menuEl = document.getElementById("menu");
        if (menuEl) {
          const y = menuEl.getBoundingClientRect().top + window.pageYOffset - (isDesktop ? 150 : 105);
          window.scrollTo({ top: Math.max(0, y), behavior: "smooth" });
        }
      }
    }, 60);
  };

  return (
    <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-5 pb-3 sm:pt-7 sm:pb-5 overflow-hidden">
      {/* Header Row: "WHAT'S ON YOUR MIND?_" + Navigation Arrows */}
      <div className="flex items-center justify-between mb-3 sm:mb-5">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <h2 className="font-extrabold text-lg sm:text-2xl lg:text-3xl text-[#1C1917] tracking-tight uppercase flex items-center">
            <span>WHAT&apos;S ON YOUR MIND?</span>
            <span className="w-3.5 h-1.5 sm:w-5 sm:h-2 bg-emerald-600 rounded-full inline-block ml-1"></span>
          </h2>
        </div>

        {/* Scroll Controls (Desktop & Tablet) */}
        <div className="hidden sm:flex items-center gap-2">
          <button
            type="button"
            onClick={() => scroll("left")}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white border border-[#E7E0D8] hover:border-[#1C1917] hover:bg-[#FAF8F5] flex items-center justify-center text-[#1C1917] transition-all shadow-2xs active:scale-95"
            aria-label="Scroll categories left"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => scroll("right")}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white border border-[#E7E0D8] hover:border-[#1C1917] hover:bg-[#FAF8F5] flex items-center justify-center text-[#1C1917] transition-all shadow-2xs active:scale-95"
            aria-label="Scroll categories right"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Horizontal Scrollable Categories Container */}
      {/* overscroll-x-contain and touch-pan-x lock horizontal swipe strictly inside this element */}
      <div
        ref={scrollContainerRef}
        className="w-full max-w-full overflow-x-auto overflow-y-hidden overscroll-x-contain touch-pan-x scrollbar-none pb-2 pt-1 scroll-smooth"
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        {/* On Mobile: 2 rows grid with generous plate sizes */}
        {/* On Desktop: flex row with larger circular category plates */}
        <div className="grid grid-rows-2 grid-flow-col auto-cols-[98px] sm:auto-cols-[116px] md:flex md:items-start md:gap-6 gap-x-3.5 gap-y-3.5 sm:gap-x-5 sm:gap-y-4 w-max">
          {CATEGORIES_DATA.map((cat) => {
            const isSelected = selectedCategory === cat.id;

            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => handleCategorySelect(cat.id)}
                className={`group flex flex-col items-center text-center shrink-0 focus:outline-hidden transition-all duration-200 w-[98px] sm:w-[116px] md:w-28 lg:w-32 ${
                  isSelected ? "scale-105" : "hover:scale-102 active:scale-95"
                }`}
              >
                {/* Image Circle / Plate with splash glow */}
                <div
                  className={`relative w-20 h-20 sm:w-24 sm:h-24 md:w-26 md:h-26 rounded-full p-1 transition-all duration-300 ${
                    isSelected
                      ? "ring-2.5 ring-[#C2410C] shadow-md shadow-[#C2410C]/25"
                      : "ring-1.5 ring-[#E7E0D8] group-hover:ring-[#C2410C]/50 shadow-xs"
                  }`}
                >
                  <div
                    className={`w-full h-full rounded-full overflow-hidden transition-transform duration-300 ${
                      isSelected ? "bg-[#FFF7ED]" : "bg-[#F5EFEB] group-hover:bg-[#FAF8F5]"
                    }`}
                  >
                    <img
                      src={cat.image}
                      alt={cat.title}
                      className="w-full h-full object-cover rounded-full group-hover:scale-110 transition-transform duration-500"
                      loading="lazy"
                    />
                  </div>

                  {isSelected && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#C2410C] text-white flex items-center justify-center text-[10px] font-bold shadow-xs">
                      ✓
                    </div>
                  )}
                </div>

                {/* Category Title & Subtitle */}
                <div className="mt-2 space-y-0.5 max-w-full px-1">
                  <span
                    className={`text-xs sm:text-sm md:text-base font-bold block leading-tight truncate transition-colors ${
                      isSelected
                        ? "text-[#C2410C]"
                        : "text-[#1C1917] group-hover:text-[#C2410C]"
                    }`}
                  >
                    {cat.title}
                  </span>
                  <span className="text-[10px] sm:text-xs text-[#78716C] block leading-none font-medium truncate mt-0.5">
                    {cat.subtitle}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
