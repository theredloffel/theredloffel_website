"use client";

import React from "react";
import { X, AlertTriangle, CheckCircle2 } from "lucide-react";
import { MenuItem } from "@/types";

interface ItemStockConfirmModalProps {
  isOpen: boolean;
  item: MenuItem | null;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ItemStockConfirmModal({
  isOpen,
  item,
  onConfirm,
  onCancel,
}: ItemStockConfirmModalProps) {
  if (!isOpen || !item) return null;

  // If item is currently available, clicking will mark it OUT of stock
  const isMarkingOutOfStock = item.isAvailable;

  return (
    <div className="fixed inset-0 z-60 overflow-hidden flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-xs transition-opacity"
        onClick={onCancel}
        aria-hidden="true"
      />

      {/* Confirmation Dialog Card */}
      <div
        role="dialog"
        aria-modal="true"
        className="relative w-full max-w-md bg-[#1C1917] text-[#FAF8F5] border border-[#292524] rounded-3xl p-6 sm:p-7 shadow-2xl space-y-5 z-10 animate-in zoom-in-95 duration-150"
      >
        {/* Top Header & Close Icon */}
        <div className="flex items-start justify-between">
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
              isMarkingOutOfStock
                ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
            }`}
          >
            {isMarkingOutOfStock ? (
              <AlertTriangle className="w-6 h-6 text-rose-400" />
            ) : (
              <CheckCircle2 className="w-6 h-6 text-emerald-400" />
            )}
          </div>

          <button
            type="button"
            onClick={onCancel}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-[#A8A29E] hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Text Details */}
        <div className="space-y-1.5">
          <h3 className="font-serif text-xl font-bold text-white tracking-tight">
            {isMarkingOutOfStock
              ? "Mark Item as Out of Stock?"
              : "Restore Item to In Stock?"}
          </h3>
          <p className="text-xs text-[#A8A29E] leading-relaxed">
            {isMarkingOutOfStock
              ? "Are you sure you want to mark this item as Out of Stock? Customers will see this dish marked as unavailable in the kitchen."
              : "Are you sure you want to mark this item as In Stock? The dish will be restored to active ordering."}
          </p>
        </div>

        {/* Dish Preview Card */}
        <div className="p-3.5 rounded-2xl bg-[#292524]/60 border border-[#3E3835] flex items-center gap-3">
          <img
            src={item.image}
            alt={item.name}
            className="w-12 h-12 rounded-xl object-cover border border-[#3E3835] shrink-0"
          />
          <div className="min-w-0 flex-1">
            <h4 className="font-serif text-sm font-bold text-white truncate">
              {item.name}
            </h4>
            <div className="flex items-center gap-2 text-[11px] text-[#A8A29E] mt-0.5">
              <span>{item.category}</span>
              <span>•</span>
              <span className="font-bold text-[#FAF8F5]">₹{item.price}</span>
            </div>
          </div>
        </div>

        {/* Status pill warning */}
        <div
          className={`p-3 rounded-2xl border text-xs flex items-center gap-2.5 ${
            isMarkingOutOfStock
              ? "bg-rose-500/10 border-rose-500/20 text-rose-300"
              : "bg-emerald-500/10 border-emerald-500/20 text-emerald-300"
          }`}
        >
          {isMarkingOutOfStock ? (
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
          ) : (
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
          )}
          <span className="font-medium">
            {isMarkingOutOfStock
              ? "Stock status will change to: OUT OF STOCK"
              : "Stock status will change to: IN STOCK"}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 flex items-center gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-3 px-4 rounded-xl border border-white/10 hover:bg-white/10 text-white font-semibold text-xs transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`flex-1 py-3 px-4 rounded-xl font-bold text-xs transition-all shadow-md cursor-pointer ${
              isMarkingOutOfStock
                ? "bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/25"
                : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/25"
            }`}
          >
            {isMarkingOutOfStock
              ? "Yes, Mark Out of Stock"
              : "Yes, Mark In Stock"}
          </button>
        </div>
      </div>
    </div>
  );
}
