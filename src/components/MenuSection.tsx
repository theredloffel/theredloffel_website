"use client";

import React, { useMemo, useState } from "react";
import { useKitchen } from "@/context/KitchenContext";
import { Category, MenuItem } from "@/types";
import { Plus, Minus, AlertCircle, Flame, Star, Check } from "lucide-react";
import { ItemCustomizationModal, CustomSizeOption } from "./ItemCustomizationModal";
import { FoodCard } from "./FoodCard";

const MENU_CATEGORIES: Category[] = [
  "All",
  "Under ₹99",
  "Burgers",
  "Parathas",
  "Chinese",
  "Fried Rice",
  "Pasta",
  "Maggi",
  "Fries",
  "Bowls",
  "Cold Coffee & Shakes",
  "Chai & Coffee",
];

const ALL_SECTION_CATEGORIES: Category[] = [
  "Burgers",
  "Parathas",
  "Chinese",
  "Fried Rice",
  "Pasta",
  "Maggi",
  "Fries",
  "Bowls",
  "Cold Coffee & Shakes",
  "Chai & Coffee",
];

export function MenuSection() {
  const {
    menuItems,
    cart,
    addToCart,
    removeFromCart,
    searchQuery,
    setSearchQuery,
    isVegOnly,
    setIsVegOnly,
    selectedCategory,
    setSelectedCategory,
    showToast,
  } = useKitchen();

  const [customizingItem, setCustomizingItem] = useState<MenuItem | null>(null);

  // Helper to extract clean base name without size suffixes like "(Small)" or "(Large)"
  const getBaseDishName = (name: string) => {
    return name.replace(/\s*\((Small|Large|Half|Full|Regular)\)/i, "").trim();
  };

  // Group menu items by base dish name
  const dishVariantsMap = useMemo(() => {
    const map: Record<string, MenuItem[]> = {};
    menuItems.forEach((item) => {
      const base = getBaseDishName(item.name);
      if (!map[base]) {
        map[base] = [];
      }
      map[base].push(item);
    });
    // Sort variants by price ascending (lowest price first)
    Object.keys(map).forEach((key) => {
      map[key].sort((a, b) => a.price - b.price);
    });
    return map;
  }, [menuItems]);

  // Keep only ONE card in the front for items with different sizes, keeping the lower price one
  const deduplicateMenuForFront = (items: MenuItem[]) => {
    const seenBaseNames = new Set<string>();
    const result: MenuItem[] = [];

    for (const item of items) {
      const base = getBaseDishName(item.name);
      const variants = dishVariantsMap[base];
      if (variants && variants.length > 1) {
        if (!seenBaseNames.has(base)) {
          seenBaseNames.add(base);
          // Lowest price one is placed in the front
          result.push(variants[0]);
        }
      } else {
        result.push(item);
      }
    }
    return result;
  };

  // Only items with genuine Small and Large options will open the size selector modal
  const hasSmallAndLarge = (itm: MenuItem) => {
    const base = getBaseDishName(itm.name);
    const variants = dishVariantsMap[base];
    return Boolean(variants && variants.length > 1);
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
          price: v.price, // Exact price from the menu! (e.g. Chilli Potato: Small ₹70, Large ₹100)
          item: v,
        };
      });
    }

    return [
      { id: item.id, name: "Regular", price: item.price, item },
    ];
  };

  const getItemQuantityInCart = (item: MenuItem) => {
    const base = getBaseDishName(item.name);
    const variants = dishVariantsMap[base] || [item];
    const variantIds = variants.map((v) => v.id);
    return cart
      .filter((ci) => variantIds.includes(ci.item.id) || ci.item.id.startsWith(item.id))
      .reduce((sum, ci) => sum + ci.quantity, 0);
  };

  // Helper to filter items by search and veg flag
  const filterItem = (item: MenuItem) => {
    if (isVegOnly && item.dietary !== "veg") return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = item.name.toLowerCase().includes(q);
      const matchDesc = item.description.toLowerCase().includes(q);
      const matchCat = item.category.toLowerCase().includes(q);
      const matchTag = item.tag?.toLowerCase().includes(q);
      if (!matchName && !matchDesc && !matchCat && !matchTag) return false;
    }
    return true;
  };

  const handleRemoveFromCart = (item: MenuItem) => {
    const base = getBaseDishName(item.name);
    const variants = dishVariantsMap[base] || [item];
    const variantIds = variants.map((v) => v.id);
    const inCart = cart.find(
      (ci) => variantIds.includes(ci.item.id) || ci.item.id.startsWith(item.id)
    );
    if (inCart) {
      removeFromCart(inCart.item.id);
    } else {
      removeFromCart(item.id);
    }
  };

  // Render individual 2-column food card
  const renderFoodCard = (item: MenuItem) => (
    <FoodCard
      key={item.id}
      item={item}
      onCustomize={(itm) => setCustomizingItem(itm)}
      dishVariantsMap={dishVariantsMap}
    />
  );



  const pillRefs = React.useRef<{ [key: string]: HTMLButtonElement | null }>({});
  const pillBarAnchorRef = React.useRef<HTMLDivElement>(null);
  const [isPillsFixed, setIsPillsFixed] = React.useState(false);
  const isClickScrollingRef = React.useRef(false);

  // Monitor scroll to pin the category pill bar directly below the search section
  React.useEffect(() => {
    const handleScroll = () => {
      if (!pillBarAnchorRef.current) return;
      const rect = pillBarAnchorRef.current.getBoundingClientRect();
      const searchHeight = window.innerWidth >= 768 ? 72 : 52;
      // Fixed when the category bar anchor meets or scrolls past the bottom of the fixed search bar
      setIsPillsFixed(rect.top <= searchHeight);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, []);

  // Scroll spy to highlight active category as the user scrolls through dishes
  React.useEffect(() => {
    if (selectedCategory === "Under ₹99" || searchQuery.trim()) return;

    const handleScrollSpy = () => {
      if (isClickScrollingRef.current) return;

      const headerOffset = window.innerWidth >= 768 ? 130 : 110;

      for (let i = ALL_SECTION_CATEGORIES.length - 1; i >= 0; i--) {
        const catName = ALL_SECTION_CATEGORIES[i];
        const catId = `cat-${catName.replace(/\s+/g, "-")}`;
        const elem = document.getElementById(catId);
        if (elem) {
          const rect = elem.getBoundingClientRect();
          if (rect.top <= headerOffset + 80) {
            setSelectedCategory(catName);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScrollSpy, { passive: true });
    return () => window.removeEventListener("scroll", handleScrollSpy);
  }, [selectedCategory, searchQuery, setSelectedCategory]);

  const scrollToCategory = (category: Category) => {
    isClickScrollingRef.current = true;
    if (searchQuery) setSearchQuery("");
    setSelectedCategory(category);

    const isDesktop = window.innerWidth >= 768;
    const headerOffset = isDesktop ? 130 : 110;

    if (category === "Under ₹99" || category === "All") {
      const menuElem = document.getElementById("menu");
      if (menuElem) {
        const y = menuElem.getBoundingClientRect().top + window.pageYOffset - (isDesktop ? 120 : 100);
        window.scrollTo({ top: Math.max(0, y), behavior: "smooth" });
      }
      setTimeout(() => {
        isClickScrollingRef.current = false;
      }, 700);
      return;
    }

    // Category click (e.g. Burgers, Parathas, Chinese, etc.)
    setTimeout(() => {
      const catId = `cat-${category.replace(/\s+/g, "-")}`;
      const elem = document.getElementById(catId);
      if (elem) {
        const y = elem.getBoundingClientRect().top + window.pageYOffset - headerOffset;
        window.scrollTo({ top: Math.max(0, y), behavior: "smooth" });
      }
      setTimeout(() => {
        isClickScrollingRef.current = false;
      }, 700);
    }, 100);
  };

  // Auto-scroll pill bar to keep active pill visible
  React.useEffect(() => {
    if (selectedCategory && pillRefs.current[selectedCategory]) {
      pillRefs.current[selectedCategory]?.scrollIntoView({
        behavior: "smooth",
        inline: "center",
        block: "nearest",
      });
    }
  }, [selectedCategory]);

  return (
    <section id="menu" className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 py-6 sm:py-8">
      {/* 1. Header: EXPLORE OUR MENU */}
      <div className="text-center mb-3">
        <span className="text-[11px] sm:text-xs font-bold tracking-[0.25em] text-[#78716C] uppercase inline-block">
          EXPLORE OUR MENU
        </span>
      </div>

      {/* Anchor point to calculate when category pill bar reaches the fixed search bar */}
      <div ref={pillBarAnchorRef} className="h-0 w-full" aria-hidden="true" />

      {/* Spacer placeholder to preserve layout flow when bar is fixed */}
      {isPillsFixed && <div className="h-[52px] sm:h-[56px] mb-6" aria-hidden="true" />}

      {/* 2. Category Pill Bar: FIXED just below Search Bar on scroll */}
      <div
        className={`${
          isPillsFixed
            ? "fixed top-[52px] md:top-[72px] left-0 right-0 z-40 bg-[#FAF8F5]/98 backdrop-blur-md border-b border-[#E7E0D8] px-3.5 sm:px-6 lg:px-8 py-2.5 shadow-xs transition-all"
            : "relative py-3 bg-[#FAF8F5] border-b border-[#E7E0D8] mb-6 -mx-3.5 sm:mx-0 px-3.5 sm:px-0"
        }`}
      >
        <div className="max-w-7xl mx-auto flex items-center gap-2.5 overflow-x-auto pb-1 scrollbar-none">
          {/* Veg Only Filter Pill */}
          <button
            type="button"
            onClick={() => setIsVegOnly((prev) => !prev)}
            className={`shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs sm:text-sm font-bold border transition-all ${
              isVegOnly
                ? "bg-emerald-100 text-emerald-900 border-emerald-400 ring-1 ring-emerald-500 shadow-xs"
                : "bg-white text-[#1C1917] border-[#E7E0D8] hover:border-[#1C1917]"
            }`}
          >
            <div className="w-3.5 h-3.5 rounded-xs border border-emerald-600 flex items-center justify-center bg-white shrink-0">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-600"></div>
            </div>
            <span>Veg</span>
            {isVegOnly && <Check className="w-3.5 h-3.5 text-emerald-700 ml-0.5" />}
          </button>

          <div className="h-5 w-[1px] bg-[#E7E0D8] shrink-0" />

          {/* Category Navigation Pills */}
          {MENU_CATEGORIES.map((category) => {
            const isSelected = selectedCategory === category;
            return (
              <button
                key={category}
                ref={(el) => {
                  pillRefs.current[category] = el;
                }}
                type="button"
                onClick={() => scrollToCategory(category)}
                className={`shrink-0 px-4 py-2 rounded-full text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
                  isSelected
                    ? "bg-[#1C1917] text-[#FAF8F5] shadow-xs scale-102"
                    : "bg-white text-[#57534E] border border-[#E7E0D8] hover:border-[#C2410C] hover:text-[#1C1917]"
                }`}
              >
                {category}
              </button>
            );
          })}
        </div>

        {/* Active search query feedback */}
        {searchQuery && (
          <div className="max-w-7xl mx-auto mt-2 flex items-center gap-2">
            <span className="text-xs text-[#78716C]">
              Showing results for:{" "}
              <span className="font-bold text-[#1C1917]">&quot;{searchQuery}&quot;</span>
            </span>
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="text-xs text-[#C2410C] underline hover:text-black font-semibold"
            >
              Clear Search
            </button>
          </div>
        )}
      </div>

      {/* 3. Items Rendering */}
      {searchQuery.trim() ? (
        /* Search Query Mode */
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-extrabold text-xl sm:text-2xl text-[#1C1917] tracking-tight uppercase">
              Search Results
            </h2>
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="text-xs text-[#C2410C] hover:underline font-semibold"
            >
              Back to Full Menu
            </button>
          </div>

          {menuItems.filter(filterItem).length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl border border-[#E7E0D8] p-6">
              <AlertCircle className="w-8 h-8 text-[#C2410C] mx-auto mb-2" />
              <p className="font-bold text-[#1C1917]">No dishes match your search</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
              {deduplicateMenuForFront(menuItems.filter(filterItem)).map(renderFoodCard)}
            </div>
          )}
        </div>
      ) : selectedCategory === "Under ₹99" ? (
        /* Under ₹99 View (Shown when user clicks Under ₹99) */
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <h2 className="font-extrabold text-xl sm:text-2xl text-[#1C1917] tracking-tight uppercase flex items-center">
                <span>UNDER ₹99 SPECIALS</span>
                <span className="w-3.5 h-1.5 sm:w-5 sm:h-2 bg-emerald-600 rounded-full inline-block ml-1"></span>
              </h2>
              <span className="text-xs text-[#78716C] font-semibold ml-2">
                (Pocket-friendly menu)
              </span>
            </div>

            <button
              type="button"
              onClick={() => scrollToCategory("All")}
              className="text-xs text-[#C2410C] hover:underline font-semibold"
            >
              View Full Menu
            </button>
          </div>

          {menuItems.filter((i) => i.price <= 99 && filterItem(i)).length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl border border-[#E7E0D8] p-6">
              <AlertCircle className="w-8 h-8 text-[#C2410C] mx-auto mb-2" />
              <p className="font-bold text-[#1C1917]">No items found under ₹99</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
              {deduplicateMenuForFront(
                menuItems.filter((item) => item.price <= 99 && filterItem(item))
              ).map(renderFoodCard)}
            </div>
          )}
        </div>
      ) : (
        /* Full Menu Mode: Starts directly from Burgers, then Parathas, Chinese, etc. All categories stay rendered! */
        <div className="space-y-10 sm:space-y-12">
          {ALL_SECTION_CATEGORIES.map((catName) => {
            const rawItems = menuItems.filter(
              (item) => item.category === catName && filterItem(item)
            );
            const categoryItems = deduplicateMenuForFront(rawItems);

            if (categoryItems.length === 0) return null;

            return (
              <div
                key={catName}
                id={`cat-${catName.replace(/\s+/g, "-")}`}
                className="space-y-4 scroll-mt-36"
              >
                {/* Section Title */}
                <div className="flex items-center gap-1.5">
                  <h2 className="font-extrabold text-xl sm:text-2xl text-[#1C1917] tracking-tight uppercase flex items-center">
                    <span>{catName}</span>
                    <span className="w-3.5 h-1.5 sm:w-5 sm:h-2 bg-emerald-600 rounded-full inline-block ml-1"></span>
                  </h2>
                  <span className="text-xs text-[#78716C] font-semibold ml-2">
                    ({categoryItems.length})
                  </span>
                </div>

                {/* TWO COLUMNS ON MOBILE */}
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
                  {categoryItems.map(renderFoodCard)}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Item Customization Bottom Sheet Modal */}
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
          if (showToast) {
            showToast(
              `${getBaseDishName(itm.name)} (${config.size}) added to order!`,
              "success"
            );
          }
        }}
      />
    </section>
  );
}
