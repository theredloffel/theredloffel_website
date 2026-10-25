"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useKitchen } from "@/context/KitchenContext";
import { MenuItem, Category } from "@/types";
import { FoodCard, getBaseDishName } from "@/components/FoodCard";
import { ItemCustomizationModal, CustomSizeOption } from "@/components/ItemCustomizationModal";
import { CartDrawer } from "@/components/CartDrawer";
import { FloatingMenuCartWidget } from "@/components/FloatingMenuCartWidget";
import {
  ArrowLeft,
  Search,
  X,
  Mic,
  Flame,
  Heart,
  Sparkles,
  AlertCircle,
} from "lucide-react";

interface MoodCard {
  id: string;
  title: string;
  query: string;
  category?: Category;
  bgColor: string;
  image: string;
}

const MOODS: MoodCard[] = [
  {
    id: "filling",
    title: "FILLING",
    query: "Rice",
    bgColor: "bg-[#FEF9C3] hover:bg-[#FEF08A]",
    image: "/foodpic/Rice_Bowls_Menu_Photos/01_Rajma_Rice_Bowl.jpg",
  },
  {
    id: "hot",
    title: "HOT",
    query: "Chai",
    bgColor: "bg-[#FFEDD5] hover:bg-[#FED7AA]",
    image: "/foodpic/The_Red_Loffel_Chai_Coffee 2/01_Kulhad_Chai.jpg",
  },
  {
    id: "chilled",
    title: "CHILLED",
    query: "Cold Coffee",
    bgColor: "bg-[#E0F2FE] hover:bg-[#BAE6FD]",
    image: "/foodpic/The_Red_Loffel_Shakes/01_Classic_Cold_Coffee.jpg",
  },
  {
    id: "spicy",
    title: "SPICY",
    query: "Chilli",
    bgColor: "bg-[#FFE4E6] hover:bg-[#FECDD3]",
    image: "/foodpic/Chinese_Rolls_Menu_Photos/04_Chilli_Potato.jpg",
  },
];

type PopularTab = "All" | "Rice" | "Pasta" | "Burger";

export default function SearchPage() {
  const router = useRouter();
  const {
    menuItems,
    searchQuery,
    setSearchQuery,
    isVegOnly,
    setIsVegOnly,
    showToast,
    addToCart,
  } = useKitchen();

  const [inputVal, setInputVal] = useState(searchQuery || "");
  const [selectedPopularTab, setSelectedPopularTab] = useState<PopularTab>("All");
  const [filterTag, setFilterTag] = useState<string | null>(null);
  const [customizingItem, setCustomizingItem] = useState<MenuItem | null>(null);
  const [isMicListening, setIsMicListening] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Sync internal input state with kitchen context searchQuery
  useEffect(() => {
    setInputVal(searchQuery);
  }, [searchQuery]);

  // Focus input automatically on mount
  useEffect(() => {
    searchInputRef.current?.focus();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputVal(val);
    setSearchQuery(val);
    if (filterTag) setFilterTag(null);
  };

  const handleClear = () => {
    setInputVal("");
    setSearchQuery("");
    setFilterTag(null);
    searchInputRef.current?.focus();
  };

  const handleMicClick = () => {
    setIsMicListening(true);
    showToast("Listening... Try saying 'Burger' or 'Pasta'", "info");
    setTimeout(() => {
      setIsMicListening(false);
      setInputVal("Pasta");
      setSearchQuery("Pasta");
      showToast("Filtered by 'Pasta'", "success");
    }, 1500);
  };

  // Group items by base name for size variants
  const dishVariantsMap = useMemo(() => {
    const map: Record<string, MenuItem[]> = {};
    menuItems.forEach((item) => {
      const base = getBaseDishName(item.name);
      if (!map[base]) {
        map[base] = [];
      }
      map[base].push(item);
    });
    Object.keys(map).forEach((key) => {
      map[key].sort((a, b) => a.price - b.price);
    });
    return map;
  }, [menuItems]);

  const deduplicateMenu = (items: MenuItem[]) => {
    const seenBaseNames = new Set<string>();
    const result: MenuItem[] = [];

    for (const item of items) {
      const base = getBaseDishName(item.name);
      const variants = dishVariantsMap[base];
      if (variants && variants.length > 1) {
        if (!seenBaseNames.has(base)) {
          seenBaseNames.add(base);
          result.push(variants[0]);
        }
      } else {
        result.push(item);
      }
    }
    return result;
  };

  const getSizeOptionsForItem = (item: MenuItem): CustomSizeOption[] => {
    const base = getBaseDishName(item.name);
    const variants = dishVariantsMap[base];
    if (variants && variants.length > 1) {
      return variants.map((v) => {
        const isSmall = v.name.toLowerCase().includes("small");
        return {
          id: v.id,
          name: isSmall ? "Small" : "Large",
          price: v.price,
          item: v,
        };
      });
    }
    return [{ id: item.id, name: "Regular", price: item.price, item }];
  };

  // Filter items matching active search query
  const searchResults = useMemo(() => {
    if (!inputVal.trim()) return [];
    const q = inputVal.toLowerCase().trim();

    return menuItems.filter((item) => {
      if (isVegOnly && item.dietary !== "veg") return false;

      // Filter tags if selected
      if (filterTag === "reordered" && !item.tag?.toLowerCase().includes("bestseller") && !item.tag?.toLowerCase().includes("popular")) {
        return false;
      }
      if (filterTag === "crowd" && !item.tag?.toLowerCase().includes("favorite") && !item.tag?.toLowerCase().includes("special")) {
        return false;
      }
      if (filterTag === "under99" && item.price > 99) {
        return false;
      }

      const matchName = item.name.toLowerCase().includes(q);
      const matchDesc = item.description.toLowerCase().includes(q);
      const matchCat = item.category.toLowerCase().includes(q);
      const matchTag = item.tag?.toLowerCase().includes(q);

      return matchName || matchDesc || matchCat || matchTag;
    });
  }, [menuItems, inputVal, isVegOnly, filterTag]);

  // Items for POPULAR AROUND YOU (Rice, Pasta, Burger)
  const popularItems = useMemo(() => {
    let categories: Category[] = [];
    if (selectedPopularTab === "Rice") {
      categories = ["Fried Rice", "Bowls"];
    } else if (selectedPopularTab === "Pasta") {
      categories = ["Pasta"];
    } else if (selectedPopularTab === "Burger") {
      categories = ["Burgers"];
    } else {
      categories = ["Burgers", "Pasta", "Fried Rice", "Bowls"];
    }

    const filtered = menuItems.filter((item) => {
      if (isVegOnly && item.dietary !== "veg") return false;
      return categories.includes(item.category);
    });

    return deduplicateMenu(filtered);
  }, [menuItems, selectedPopularTab, isVegOnly, dishVariantsMap]);

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#1C1917] pb-28">
      {/* ========================================================= */}
      {/* 1. TOP STICKY SEARCH BAR */}
      {/* ========================================================= */}
      <div className="sticky top-0 z-40 bg-[#FAF8F5]/98 backdrop-blur-md border-b border-[#E7E0D8] px-3 sm:px-6 py-2.5 shadow-xs">
        <div className="max-w-4xl mx-auto flex items-center gap-2 sm:gap-3">
          {/* Back button */}
          <button
            type="button"
            onClick={() => {
              setSearchQuery("");
              router.push("/");
            }}
            className="w-10 h-10 rounded-2xl bg-white border border-[#E7E0D8] flex items-center justify-center hover:bg-gray-100 active:scale-95 transition-all shrink-0 cursor-pointer shadow-2xs"
            aria-label="Go Back"
          >
            <ArrowLeft className="w-5 h-5 text-[#1C1917]" />
          </button>

          {/* Search Input Box */}
          <div className="flex-1 bg-white rounded-2xl border border-[#E7E0D8] shadow-xs flex items-center px-3.5 py-2.5 focus-within:border-[#C2410C] focus-within:ring-2 focus-within:ring-[#C2410C]/20 transition-all">
            <input
              ref={searchInputRef}
              type="text"
              value={inputVal}
              onChange={handleInputChange}
              placeholder="Search for burger, chai and more"
              className="w-full bg-transparent text-sm sm:text-base text-[#1C1917] placeholder:text-[#A8A29E] focus:outline-hidden"
            />

            {inputVal ? (
              <button
                type="button"
                onClick={handleClear}
                className="p-1 text-[#78716C] hover:text-[#1C1917] transition-colors cursor-pointer shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            ) : null}

            {/* Mic divider & button */}
            <div className="flex items-center pl-2 ml-1 border-l border-[#E7E0D8] shrink-0">
              <button
                type="button"
                onClick={handleMicClick}
                className={`p-1 rounded-full transition-colors cursor-pointer ${
                  isMicListening ? "text-[#C2410C] animate-pulse" : "text-[#78716C] hover:text-[#C2410C]"
                }`}
                title="Voice Search"
              >
                <Mic className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Quick Filter Pills (Shown when search is active or always as sub-filters) */}
        {inputVal.trim() && (
          <div className="max-w-4xl mx-auto flex items-center gap-2 overflow-x-auto pt-2.5 pb-0.5 no-scrollbar">
            <button
              type="button"
              onClick={() => setFilterTag(filterTag === "reordered" ? null : "reordered")}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 shrink-0 transition-all cursor-pointer border ${
                filterTag === "reordered"
                  ? "bg-amber-100 text-amber-900 border-amber-300 shadow-xs"
                  : "bg-white text-stone-700 border-stone-200 hover:border-stone-300"
              }`}
            >
              <Flame className="w-3.5 h-3.5 text-amber-600" />
              <span>Highly Reordered</span>
            </button>

            <button
              type="button"
              onClick={() => setFilterTag(filterTag === "crowd" ? null : "crowd")}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 shrink-0 transition-all cursor-pointer border ${
                filterTag === "crowd"
                  ? "bg-rose-100 text-rose-900 border-rose-300 shadow-xs"
                  : "bg-white text-stone-700 border-stone-200 hover:border-stone-300"
              }`}
            >
              <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
              <span>Crowd&apos;s Favorite</span>
            </button>

            <button
              type="button"
              onClick={() => setFilterTag(filterTag === "under99" ? null : "under99")}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 shrink-0 transition-all cursor-pointer border ${
                filterTag === "under99"
                  ? "bg-emerald-100 text-emerald-900 border-emerald-300 shadow-xs"
                  : "bg-white text-stone-700 border-stone-200 hover:border-stone-300"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>Under ₹99</span>
            </button>

            <button
              type="button"
              onClick={() => setIsVegOnly(!isVegOnly)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 shrink-0 transition-all cursor-pointer border ${
                isVegOnly
                  ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                  : "bg-white text-stone-700 border-stone-200 hover:border-stone-300"
              }`}
            >
              <div className="w-2.5 h-2.5 rounded-xs border border-emerald-600 flex items-center justify-center bg-white">
                <div className="w-1 h-1 rounded-full bg-emerald-600" />
              </div>
              <span>Veg Only</span>
            </button>
          </div>
        )}
      </div>

      <div className="max-w-4xl mx-auto px-3.5 sm:px-6 pt-5 space-y-7 sm:space-y-9">
        {/* ========================================================= */}
        {/* 2. IF SEARCH QUERY IS EMPTY: SHOW "WHAT'S YOUR MOOD?" & "POPULAR" */}
        {/* ========================================================= */}
        {!inputVal.trim() ? (
          <>
            {/* SECTION 1: WHAT'S YOUR MOOD?_ (Ignored for now, preserved for later) */}
            {false && (
              <section>
                <div className="flex items-center gap-1 mb-3.5 sm:mb-4">
                  <h2 className="font-black text-xl sm:text-2xl text-[#1C1917] tracking-tight uppercase">
                    WHAT&apos;S YOUR MOOD?
                  </h2>
                  <span className="w-3.5 h-1.5 sm:w-4 sm:h-2 bg-emerald-600 rounded-xs inline-block ml-1" />
                </div>

                {/* 4 MOOD CARDS: FILLING, HOT, CHILLED, SPICY */}
                <div className="grid grid-cols-4 gap-2 sm:gap-3.5">
                  {MOODS.map((mood) => (
                    <div
                      key={mood.id}
                      onClick={() => {
                        setInputVal(mood.query);
                        setSearchQuery(mood.query);
                      }}
                      className={`group relative flex flex-col justify-between ${mood.bgColor} rounded-2xl sm:rounded-3xl border border-black/8 overflow-hidden shadow-2xs hover:shadow-md hover:scale-[1.03] active:scale-95 transition-all duration-200 cursor-pointer p-2 sm:p-3 aspect-[4/5]`}
                    >
                      {/* Sticker Heading */}
                      <div className="w-full text-center pt-1 z-10">
                        <span className="text-white font-black text-[11px] sm:text-sm md:text-base tracking-wider uppercase [text-shadow:_1.5px_1.5px_0px_#1C1917,_-1px_-1px_0px_#1C1917,_1px_-1px_0px_#1C1917,_-1px_1px_0px_#1C1917]">
                          {mood.title}
                        </span>
                      </div>

                      {/* Food Photo */}
                      <div className="relative w-full h-16 sm:h-24 md:h-28 overflow-hidden rounded-xl sm:rounded-2xl mt-1">
                        <Image
                          src={mood.image}
                          alt={mood.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                          sizes="(max-width: 768px) 25vw, 20vw"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* SECTION 2: POPULAR AROUND YOU_ */}
            <section className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <div className="flex items-center gap-1">
                  <h2 className="font-black text-xl sm:text-2xl text-[#1C1917] tracking-tight uppercase">
                    POPULAR AROUND YOU
                  </h2>
                  <span className="w-3.5 h-1.5 sm:w-4 sm:h-2 bg-emerald-600 rounded-xs inline-block ml-1" />
                </div>

                {/* Popular Tabs: All, Rice, Pasta, Burger */}
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                  {(["All", "Rice", "Pasta", "Burger"] as PopularTab[]).map((tab) => (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => setSelectedPopularTab(tab)}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer ${
                        selectedPopularTab === tab
                          ? "bg-[#1C1917] text-white shadow-xs"
                          : "bg-white text-stone-700 border border-stone-200 hover:border-stone-400"
                      }`}
                    >
                      {tab === "All" ? "All Popular" : tab}
                    </button>
                  ))}
                </div>
              </div>

              {/* Grid of Popular Food Cards (matching exactly the 2-column food card design) */}
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                {popularItems.map((item) => (
                  <FoodCard
                    key={item.id}
                    item={item}
                    onCustomize={(itm) => setCustomizingItem(itm)}
                    dishVariantsMap={dishVariantsMap}
                  />
                ))}
              </div>
            </section>
          </>
        ) : (
          /* ========================================================= */
          /* 3. IF SEARCH QUERY IS ACTIVE: SHOW SEARCH RESULTS GRID */
          /* ========================================================= */
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-base sm:text-lg text-[#1C1917]">
                Results for <span className="text-emerald-700 font-black">&quot;{inputVal}&quot;</span>
                <span className="text-xs text-[#78716C] font-semibold ml-2">
                  ({searchResults.length} {searchResults.length === 1 ? "dish" : "dishes"})
                </span>
              </h2>

              <button
                type="button"
                onClick={handleClear}
                className="text-xs text-[#C2410C] hover:underline font-semibold cursor-pointer"
              >
                Clear Search
              </button>
            </div>

            {searchResults.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-3xl border border-[#E7E0D8] p-6 shadow-2xs">
                <AlertCircle className="w-10 h-10 text-stone-400 mx-auto mb-2.5" />
                <h3 className="font-bold text-base text-[#1C1917]">No dishes match &quot;{inputVal}&quot;</h3>
                <p className="text-xs text-[#78716C] mt-1 max-w-sm mx-auto">
                  Try searching for something else like &quot;rice&quot;, &quot;pasta&quot;, &quot;burger&quot;, or &quot;maggi&quot;.
                </p>
                <button
                  type="button"
                  onClick={handleClear}
                  className="mt-4 px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 active:scale-95 transition-all cursor-pointer shadow-xs"
                >
                  Explore All Popular Dishes
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                {deduplicateMenu(searchResults).map((item) => (
                  <FoodCard
                    key={item.id}
                    item={item}
                    onCustomize={(itm) => setCustomizingItem(itm)}
                    dishVariantsMap={dishVariantsMap}
                  />
                ))}
              </div>
            )}
          </section>
        )}
      </div>

      {/* Item Customization Modal */}
      <ItemCustomizationModal
        isOpen={!!customizingItem}
        onClose={() => setCustomizingItem(null)}
        item={customizingItem}
        sizeOptions={customizingItem ? getSizeOptionsForItem(customizingItem) : []}
        onAddToCart={(itm, config) => {
          const targetItem: MenuItem = config.selectedItem || {
            ...itm,
            id: `${itm.id}-${config.size.toLowerCase()}`,
            name: `${getBaseDishName(itm.name)} (${config.size})`,
            price: config.unitPrice,
          };
          for (let i = 0; i < config.quantity; i++) {
            addToCart(targetItem);
          }
          setCustomizingItem(null);
          showToast(`Added ${config.quantity}x ${targetItem.name}`, "success");
        }}
      />

      {/* Floating Bottom Cart & Menu Widget */}
      <FloatingMenuCartWidget />

      {/* Cart Drawer */}
      <CartDrawer />
    </div>
  );
}
