"use client";

import React from "react";
import { useKitchen } from "@/context/KitchenContext";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

export function NotificationToast() {
  const { toasts } = useKitchen();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 sm:bottom-6 left-1/2 -translate-x-1/2 z-70 flex flex-col items-center gap-2 max-w-md w-[90%] sm:w-auto pointer-events-none text-center">
      {toasts.map((toast) => {
        let icon = <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600 shrink-0" />;
        let borderClass = "border-emerald-200 bg-[#FAF8F5]/98";

        if (toast.type === "warning") {
          icon = <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600 shrink-0" />;
          borderClass = "border-amber-200 bg-[#FAF8F5]/98";
        } else if (toast.type === "info") {
          icon = <Info className="w-4 h-4 sm:w-5 sm:h-5 text-[#C2410C] shrink-0" />;
          borderClass = "border-orange-200 bg-[#FAF8F5]/98";
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center justify-center gap-2.5 px-4 py-2.5 sm:py-3 rounded-full border shadow-2xl backdrop-blur-md transition-opacity duration-150 animate-in fade-in ${borderClass}`}
          >
            <div className="flex items-center justify-center gap-2">
              {icon}
              <p className="text-xs sm:text-sm font-bold text-[#1C1917] text-center">{toast.message}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
