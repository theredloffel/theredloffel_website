"use client";

import React, { useState, useEffect } from "react";
import { MenuItem } from "@/types";
import { X, Minus, Plus } from "lucide-react";

export interface CustomSizeOption {
  id: string;
  name: string;
  price: number;
  item?: MenuItem;
}

interface ItemCustomizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: MenuItem | null;
  sizeOptions?: CustomSizeOption[];
  onAddToCart?: (
    item: MenuItem,
    config: {
      size: string;
      quantity: number;
      unitPrice: number;
      totalPrice: number;
      selectedItem?: MenuItem;
    }
  ) => void;
}

export function ItemCustomizationModal({
  isOpen,
  onClose,
  item,
  sizeOptions: customSizeOptions,
  onAddToCart,
}: ItemCustomizationModalProps) {
  // Size selection (defaults to small / lower price)
  const [selectedSize, setSelectedSize] = useState<string>("small");
  // Quantity selector
  const [quantity, setQuantity] = useState<number>(1);

  // Compute available size options
  const sizeOptions: CustomSizeOption[] = React.useMemo(() => {
    if (!item) return [];
    if (customSizeOptions && customSizeOptions.length > 0) {
      return customSizeOptions;
    }

    const lowerName = item.name.toLowerCase();
    if (lowerName.includes("white sauce pasta")) {
      return [
        { id: "small", name: "Small", price: 120 },
        { id: "large", name: "Large", price: 175 },
      ];
    }
    if (item.category === "Pasta") {
      return [
        { id: "small", name: "Small", price: item.price },
        { id: "large", name: "Large", price: item.price + 55 },
      ];
    }
    return [
      { id: "small", name: "Small", price: item.price },
      { id: "large", name: "Large", price: item.price + 40 },
    ];
  }, [item, customSizeOptions]);

  // Reset state whenever modal is opened
  useEffect(() => {
    if (isOpen && sizeOptions.length > 0) {
      setSelectedSize(sizeOptions[0].id);
      setQuantity(1);
    }
  }, [isOpen, item, sizeOptions]);

  if (!isOpen || !item) return null;

  const currentSizeObj =
    sizeOptions.find((s) => s.id === selectedSize) || sizeOptions[0];
  const unitPrice = currentSizeObj?.price || item.price;
  const totalPrice = unitPrice * quantity;

  // Clean title for modal header (strip any "(Small)" or "(Large)" if present)
  const cleanTitle = item.name.replace(/\s*\((Small|Large)\)/i, "").trim();

  const handleConfirm = () => {
    if (onAddToCart && item && currentSizeObj) {
      onAddToCart(item, {
        size: currentSizeObj.name,
        quantity,
        unitPrice,
        totalPrice,
        selectedItem: currentSizeObj.item,
      });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end sm:justify-center items-center">
      {/* Dimmed backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Close button positioned directly floating above modal top */}
      <div className="relative z-10 w-full max-w-md flex justify-center mb-3 px-4">
        <button
          type="button"
          onClick={onClose}
          className="w-10 h-10 rounded-full bg-[#323238] hover:bg-black text-white flex items-center justify-center shadow-lg transition-transform active:scale-90 cursor-pointer"
          aria-label="Close"
        >
          <X className="w-5 h-5 stroke-[2.5]" />
        </button>
      </div>

      {/* Bottom Sheet Card */}
      <div className="relative z-10 w-full max-w-md bg-white rounded-t-[28px] sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in slide-in-from-bottom duration-300">
        {/* Top Header: Food image + Clean Item Name */}
        <div className="px-5 py-4 bg-white flex items-center gap-4 border-b border-gray-100">
          <div className="w-13 h-13 rounded-xl overflow-hidden border border-gray-200 shadow-2xs shrink-0 bg-[#F5EFEB]">
            <img
              src={item.image}
              alt={cleanTitle}
              className="w-full h-full object-cover"
            />
          </div>
          <h2 className="text-xl font-bold text-[#1F2937] tracking-tight leading-snug">
            {cleanTitle}
          </h2>
        </div>

        {/* Customization Body (ONLY Size section, Extra Veggies and all addons removed) */}
        <div className="p-4 bg-[#F6F6F9] overflow-y-auto space-y-4">
          <div>
            <div className="mb-2">
              <h3 className="text-base font-bold text-[#1F2937] leading-tight">
                Select Size
              </h3>
              <p className="text-xs text-gray-500 font-medium">Select 1</p>
            </div>

            <div className="bg-white rounded-2xl p-3 border border-gray-100/90 shadow-2xs space-y-3">
              {sizeOptions.map((opt) => {
                const isSelected = selectedSize === opt.id;
                return (
                  <label
                    key={opt.id}
                    onClick={() => setSelectedSize(opt.id)}
                    className="flex items-center justify-between cursor-pointer py-1 group select-none"
                  >
                    <div className="flex items-center gap-3">
                      {/* Veg Indicator Icon */}
                      <div className="w-4 h-4 rounded-xs border-1.5 border-emerald-600 flex items-center justify-center bg-white p-0.5 shrink-0">
                        <div className="w-2 h-2 rounded-full bg-emerald-600"></div>
                      </div>
                      <span className="text-sm sm:text-base font-medium text-[#1F2937]">
                        {opt.name}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      {/* ORIGINAL PRICE SHOWN DIRECTLY - NO +40 */}
                      <span className="text-sm font-bold text-gray-800">
                        ₹{opt.price}
                      </span>

                      {/* Custom radio button */}
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                          isSelected
                            ? "border-emerald-600 bg-emerald-600 text-white"
                            : "border-gray-300 bg-white"
                        }`}
                      >
                        {isSelected && (
                          <div className="w-2 h-2 rounded-full bg-white" />
                        )}
                      </div>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>
        </div>

        {/* Bottom Sticky Action Footer */}
        <div className="p-4 bg-white border-t border-gray-100 flex items-center gap-3.5 shadow-md">
          {/* Magenta / Pink outlined Quantity Selector Pill */}
          <div className="border-2 border-[#E11D74] rounded-full flex items-center justify-between px-3.5 py-2 min-w-[110px] text-[#E11D74] font-bold select-none">
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="w-5 h-5 flex items-center justify-center active:scale-90 transition-transform"
            >
              <Minus className="w-4 h-4 stroke-[2.5]" />
            </button>
            <span className="text-base font-extrabold px-2">{quantity}</span>
            <button
              type="button"
              onClick={() => setQuantity((q) => q + 1)}
              className="w-5 h-5 flex items-center justify-center active:scale-90 transition-transform"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>

          {/* Green Add Item Pill Button */}
          <button
            type="button"
            onClick={handleConfirm}
            className="flex-1 bg-[#00833E] hover:bg-[#007034] active:scale-[0.98] transition-all text-white font-extrabold text-base py-3 px-5 rounded-full shadow-md flex items-center justify-center tracking-wide"
          >
            Add Item | ₹{totalPrice}
          </button>
        </div>

        {/* Home Bar Indicator */}
        <div className="bg-white pb-2 pt-0.5">
          <div className="w-32 h-1 bg-gray-400/80 rounded-full mx-auto" />
        </div>
      </div>
    </div>
  );
}
