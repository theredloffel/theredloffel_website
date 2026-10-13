"use client";

import React from "react";
import { X, Power, AlertTriangle, CheckCircle2, ShieldAlert } from "lucide-react";

interface StoreStatusConfirmModalProps {
  isOpen: boolean;
  action: "open" | "close";
  onConfirm: () => void;
  onCancel: () => void;
}

export function StoreStatusConfirmModal({
  isOpen,
  action,
  onConfirm,
  onCancel,
}: StoreStatusConfirmModalProps) {
  if (!isOpen) return null;

  const isClosing = action === "close";

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
        {/* Top Header & Icon */}
        <div className="flex items-start justify-between">
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
              isClosing
                ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
            }`}
          >
            {isClosing ? (
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
        <div className="space-y-2">
          <h3 className="font-serif text-xl font-bold text-white tracking-tight">
            {isClosing ? "Confirm Closing Store?" : "Confirm Opening Store?"}
          </h3>
          <p className="text-xs text-[#A8A29E] leading-relaxed">
            {isClosing
              ? "Are you sure you want to mark the store as CLOSED? New customer orders will be paused on the storefront, and order placement will be temporarily disabled."
              : "Are you sure you want to mark the store as OPEN? Customers on the website will be notified that the kitchen is active and accepting orders."}
          </p>
        </div>

        {/* Warning or Info Pill */}
        <div
          className={`p-3 rounded-2xl border text-xs flex items-center gap-2.5 ${
            isClosing
              ? "bg-rose-500/10 border-rose-500/20 text-rose-300"
              : "bg-emerald-500/10 border-emerald-500/20 text-emerald-300"
          }`}
        >
          <Power className="w-4 h-4 shrink-0" />
          <span className="font-medium">
            {isClosing
              ? "Store status will change to STORE CLOSED"
              : "Store status will change to STORE OPEN"}
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
            className={`flex-1 py-3 px-4 rounded-xl font-bold text-xs text-white shadow-lg transition-all active:scale-98 cursor-pointer ${
              isClosing
                ? "bg-rose-600 hover:bg-rose-500 shadow-rose-600/30"
                : "bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/30"
            }`}
          >
            {isClosing ? "Yes, Close Store" : "Yes, Open Store"}
          </button>
        </div>
      </div>
    </div>
  );
}
