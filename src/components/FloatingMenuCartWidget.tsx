"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useKitchen } from "@/context/KitchenContext";
import { Category, MenuItem } from "@/types";
import { ChevronRight, X, Clock, Flame, ShoppingBag, CheckCircle2, Utensils, ChefHat } from "lucide-react";

const CATEGORIES_CONFIG: { category: Category; label: string }[] = [
  { category: "All", label: "All Items" },
  { category: "Under ₹99", label: "Under ₹99 Specials" },
  { category: "Burgers", label: "Burgers" },
  { category: "Parathas", label: "Parathas" },
  { category: "Chinese", label: "Chinese" },
  { category: "Fried Rice", label: "Fried Rice" },
  { category: "Pasta", label: "Pasta" },
  { category: "Maggi", label: "Maggi" },
  { category: "Fries", label: "Fries" },
  { category: "Bowls", label: "Bowls" },
];

function CutleryIcon({ className = "w-5 h-5 text-[#1C1917]" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Vertical Spoon */}
      <path d="M8 2.2C6.4 2.2 5.2 3.7 5.2 5.5C5.2 7.1 6.2 8.4 7.5 8.7V17.5C7.5 18.05 7.95 18.5 8.5 18.5C9.05 18.5 9.5 18.05 9.5 17.5V8.7C10.8 8.4 11.8 7.1 11.8 5.5C11.8 3.7 10.6 2.2 8 2.2Z" />
      {/* Vertical Knife */}
      <path d="M15.5 2.2C14.7 2.2 14 3.7 14 6.2V10.2H15V17.5C15 18.05 15.45 18.5 16 18.5C16.55 18.5 17 18.05 17 17.5V2.7C17 2.4 16.7 2.2 16.4 2.2C16.1 2.2 15.8 2.2 15.5 2.2Z" />
    </svg>
  );
}

function getOrderStatusDisplay(status: string) {
  switch (status) {
    case "Order Received":
    case "Pending":
      return {
        label: "Order Received",
        badgeColor: "bg-amber-500",
        textColor: "text-amber-400",
        icon: <Clock className="w-4 h-4 text-white" />,
      };
    case "Order Status":
    case "Order Accepted":
    case "Preparing":
      return {
        label: "Order Accepted",
        badgeColor: "bg-blue-500",
        textColor: "text-blue-400",
        icon: <ChefHat className="w-4 h-4 text-white" />,
      };
    case "In the Road":
    case "Out for Delivery":
    case "Ready":
      return {
        label: "In the Road",
        badgeColor: "bg-orange-500",
        textColor: "text-orange-400",
        icon: <ShoppingBag className="w-4 h-4 text-white" />,
      };
    case "Delivered":
      return {
        label: "Delivered",
        badgeColor: "bg-emerald-500",
        textColor: "text-emerald-400",
        icon: <CheckCircle2 className="w-4 h-4 text-white" />,
      };
    default:
      return {
        label: status,
        badgeColor: "bg-stone-500",
        textColor: "text-stone-300",
        icon: <Clock className="w-4 h-4 text-white" />,
      };
  }
}

export function FloatingMenuCartWidget() {
  const {
    cart,
    cartCount,
    cartSubtotal,
    setIsCartOpen,
    menuItems,
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery,
    isVegOnly,
    user,
    userOrders,
    activeOrderId,
    setSelectedTrackingOrderId,
    setIsOrderHistoryOpen,
  } = useKitchen();

  // Active un-delivered order to track in place of cart (belonging exclusively to logged-in user)
  const activeOrder = useMemo(() => {
    if (!user.isLoggedIn || !user.phone || !activeOrderId) return null;
    const found = userOrders.find((o) => o.id === activeOrderId);
    if (found && found.status !== "Delivered" && found.status !== "Rejected") {
      return found;
    }
    return null;
  }, [userOrders, activeOrderId, user.isLoggedIn, user.phone]);

  const [isMenuSheetOpen, setIsMenuSheetOpen] = useState(false);

  // Close sheet on escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsMenuSheetOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Lock background screen scroll when menu sheet is open
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (isMenuSheetOpen) {
      document.documentElement.classList.add("modal-open");
      document.body.classList.add("modal-open");
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
      return () => {
        document.documentElement.classList.remove("modal-open");
        document.body.classList.remove("modal-open");
        document.body.style.overflow = "";
        document.documentElement.style.overflow = "";
      };
    }
  }, [isMenuSheetOpen]);

  // Compute item count per category respecting veg filter
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};

    const availableItems = menuItems.filter((item) =>
      isVegOnly ? item.dietary === "veg" : true
    );

    counts["All"] = availableItems.length;
    counts["Under ₹99"] = availableItems.filter((i) => i.price <= 99).length;

    CATEGORIES_CONFIG.slice(2).forEach(({ category }) => {
      counts[category] = availableItems.filter((i) => i.category === category).length;
    });

    return counts;
  }, [menuItems, isVegOnly]);

  const handleSelectCategory = (cat: Category) => {
    setSearchQuery("");
    setSelectedCategory(cat);
    setIsMenuSheetOpen(false);

    const isDesktop = typeof window !== "undefined" && window.innerWidth >= 768;
    const headerOffset = isDesktop ? 160 : 115;

    if (cat === "Under ₹99" || cat === "All") {
      const menuElem = document.getElementById("menu");
      if (menuElem) {
        const y = menuElem.getBoundingClientRect().top + window.pageYOffset - (isDesktop ? 150 : 105);
        window.scrollTo({ top: Math.max(0, y), behavior: "smooth" });
      }
      return;
    }

    setTimeout(() => {
      const catId = `cat-${cat.replace(/\s+/g, "-")}`;
      const catElem = document.getElementById(catId);
      if (catElem) {
        const y = catElem.getBoundingClientRect().top + window.pageYOffset - headerOffset;
        window.scrollTo({ top: Math.max(0, y), behavior: "smooth" });
      } else {
        const menuElem = document.getElementById("menu");
        if (menuElem) {
          const y = menuElem.getBoundingClientRect().top + window.pageYOffset - (isDesktop ? 150 : 105);
          window.scrollTo({ top: Math.max(0, y), behavior: "smooth" });
        }
      }
    }, 60);
  };

  // Get first item image from cart for thumbnail
  const firstItemImage =
    cart.length > 0 && cart[0]?.item?.image
      ? cart[0].item.image
      : "https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=200&q=80";

  return (
    <>
      {/* Backdrop when Menu sheet is open */}
      {isMenuSheetOpen && (
        <div
          className="fixed inset-0 bg-black/45 backdrop-blur-[2px] z-40 transition-opacity animate-in fade-in duration-200 overscroll-none"
          onClick={() => setIsMenuSheetOpen(false)}
          onTouchMove={(e) => e.preventDefault()}
        />
      )}

      {/* Floating Menu Category Popup Sheet */}
      {isMenuSheetOpen && (
        <div
          className="fixed bottom-24 right-4 z-50 w-[88vw] max-w-sm max-h-[68vh] bg-white rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.35)] border border-[#E7E0D8] overflow-hidden flex flex-col overscroll-contain animate-in fade-in slide-in-from-bottom-5 duration-200"
          role="dialog"
          aria-label="Category Selection Menu"
        >
          {/* Subtle drag pill at top */}
          <div className="pt-3 pb-1 flex justify-center shrink-0">
            <div className="w-10 h-1 rounded-full bg-stone-300"></div>
          </div>

          {/* Categories List */}
          <div className="overflow-y-auto overscroll-contain px-4 py-2 space-y-1 scrollbar-none divide-y divide-[#F5EFEB]">
            {CATEGORIES_CONFIG.map(({ category, label }) => {
              const count = categoryCounts[category] || 0;
              const isSelected = selectedCategory === category;

              return (
                <button
                  key={category}
                  type="button"
                  onClick={() => handleSelectCategory(category)}
                  className={`w-full py-3 px-2 flex items-center justify-between text-left transition-colors rounded-xl ${
                    isSelected
                      ? "text-[#C2410C] bg-[#FFF7ED] font-black"
                      : "text-[#1C1917] hover:bg-[#FAF8F5] hover:text-[#C2410C] font-bold"
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    {/* Active vertical pill indicator */}
                    {isSelected ? (
                      <div className="w-1.5 h-5 rounded-full bg-[#C2410C] shrink-0" />
                    ) : (
                      <div className="w-1.5 h-5 shrink-0 opacity-0" />
                    )}
                    <span className="text-sm sm:text-[15px] truncate">{label}</span>
                  </div>

                  <span
                    className={`text-sm sm:text-[15px] tabular-nums font-extrabold shrink-0 ml-3 ${
                      isSelected ? "text-[#C2410C]" : "text-[#78716C]"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Floating Bottom Bar: [View Cart Pill OR Active Order Status Pill] + [MENU Circle Button] */}
      <div className="fixed bottom-5 right-4 z-50 flex items-center gap-3">
        {/* Case 1: If cart has items, show View Cart Pill */}
        {cartCount > 0 ? (
          <div className="transition-all duration-300 ease-out origin-right transform opacity-100 scale-100 translate-x-0">
            <button
              type="button"
              onClick={() => setIsCartOpen(true)}
              className="flex items-center gap-2.5 sm:gap-3 bg-[#C2410C] hover:bg-[#9A3412] text-white pl-2 pr-3 py-1.5 sm:py-2 rounded-full border-2 border-[#1C1917] shadow-[0_6px_20px_rgba(194,65,12,0.35)] active:scale-95 transition-all select-none group"
              aria-label="View Cart"
            >
              {/* Food item thumbnail */}
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border-2 border-white/70 overflow-hidden shrink-0 bg-white/30 shadow-xs">
                <img
                  src={firstItemImage}
                  alt="Cart thumbnail"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Cart Info Text */}
              <div className="flex flex-col text-left justify-center pr-1">
                <span className="font-extrabold text-sm sm:text-[15px] text-white leading-tight tracking-tight">
                  View cart
                </span>
                <span className="text-[10px] sm:text-[11px] font-semibold text-[#FED7AA] flex items-center gap-1 mt-0.5">
                  <span>
                    {cartCount} {cartCount === 1 ? "item" : "items"}
                  </span>
                  <span className="text-[9px]">✦</span>
                  <span>₹{cartSubtotal}</span>
                </span>
              </div>

              {/* Right Arrow Circle */}
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#9A3412] group-hover:bg-[#7C2D12] flex items-center justify-center shrink-0 shadow-xs transition-colors">
                <ChevronRight className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-white stroke-[3]" />
              </div>
            </button>
          </div>
        ) : activeOrder ? (
          /* Case 2: Once order is confirmed and cart is empty, show Order Status Pill in place of Cart until delivered */
          (() => {
            const statusConfig = getOrderStatusDisplay(activeOrder.status);
            return (
              <div className="transition-all duration-300 ease-out origin-right transform opacity-100 scale-100 translate-x-0">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedTrackingOrderId(activeOrder.id);
                    setIsOrderHistoryOpen(true);
                  }}
                  className="flex items-center gap-2.5 sm:gap-3 bg-[#1C1917] hover:bg-black text-white pl-2.5 pr-4 py-1.5 sm:py-2 rounded-full border-2 border-[#C2410C] shadow-[0_8px_25px_rgba(0,0,0,0.35)] cursor-pointer active:scale-95 transition-all select-none animate-in fade-in slide-in-from-right-4 duration-300 text-left group"
                  title="Click to view live order status"
                >
                  {/* Status Icon */}
                  <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full ${statusConfig.badgeColor} flex items-center justify-center shrink-0 shadow-md transition-transform group-hover:scale-105`}>
                    {statusConfig.icon}
                  </div>

                  {/* Order Info & Live Status */}
                  <div className="flex flex-col text-left justify-center pr-1">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                      <span className="font-extrabold text-xs sm:text-[13px] text-white leading-tight tracking-tight">
                        Order #{activeOrder.id}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className={`text-[10px] sm:text-[11px] font-bold ${statusConfig.textColor}`}>
                        {statusConfig.label}
                      </span>
                      <span className="text-[8px] text-[#A8A29E] uppercase tracking-wider font-semibold">
                        • View Status →
                      </span>
                    </div>
                  </div>
                </button>
              </div>
            );
          })()
        ) : null}

        {/* Floating MENU / Close Circle Button */}
        <button
          type="button"
          onClick={() => setIsMenuSheetOpen((prev) => !prev)}
          className="w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-[#FFF7ED] hover:bg-[#FFEDD5] border-2 border-[#1C1917] shadow-[0_6px_20px_rgba(0,0,0,0.18)] flex flex-col items-center justify-center shrink-0 cursor-pointer active:scale-90 transition-all select-none"
          aria-label={isMenuSheetOpen ? "Close menu" : "Open menu"}
        >
          {isMenuSheetOpen ? (
            <X className="w-5 h-5 sm:w-6 sm:h-6 text-[#C2410C] stroke-[2.5] transition-transform rotate-0" />
          ) : (
            <>
              <CutleryIcon className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-[#C2410C]" />
              <span className="text-[8px] sm:text-[9px] font-black tracking-wider text-[#C2410C] leading-none mt-0.5">
                MENU
              </span>
            </>
          )}
        </button>
      </div>
    </>
  );
}
