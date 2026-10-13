"use client";

import React from "react";
import Image from "next/image";
import { Header } from "@/components/Header";
import { CategoryCarousel } from "@/components/CategoryCarousel";
import { MenuSection } from "@/components/MenuSection";
import { CartDrawer } from "@/components/CartDrawer";
import { AuthModal } from "@/components/AuthModal";
import { CheckoutModal } from "@/components/CheckoutModal";
import { OrderHistoryModal } from "@/components/OrderHistoryModal";
import { LocationModal } from "@/components/LocationModal";
import { FloatingMenuCartWidget } from "@/components/FloatingMenuCartWidget";
import {
  MapPin,
  Phone,
} from "lucide-react";

export function Storefront() {
  return (
    <div
      suppressHydrationWarning
      className="min-h-screen flex flex-col bg-[#FAF8F5] text-[#1C1917] overflow-x-clip w-full max-w-full"
    >
      {/* 1. Nav Bar */}
      <Header />

      {/* 2. Category List: WHAT'S ON YOUR MIND?_ */}
      <CategoryCarousel />

      {/* 3. Menu Section with Categories & Cards */}
      <main className="flex-1">
        <MenuSection />
      </main>

      {/* Floating Bottom Cart & Menu Widget */}
      <FloatingMenuCartWidget />

      {/* Modals & Slide-overs */}
      <CartDrawer />
      <AuthModal />
      <CheckoutModal />
      <OrderHistoryModal />
      <LocationModal />

      {/* Footer */}
      <footer className="mt-20 border-t border-[#E7E0D8] bg-[#1C1917] text-[#FAF8F5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
            {/* Col 1: Brand */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full overflow-hidden border border-white/20 shadow-xs bg-[#FAF8F5] shrink-0">
                  <Image
                    src="/logo.jpeg"
                    alt="The Red Löffel"
                    width={40}
                    height={40}
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="font-serif text-2xl font-bold tracking-tight">
                  The Red Löffel
                </span>
              </div>
              <p className="text-xs text-[#A8A29E] leading-relaxed">
                Cloud kitchen operating in Knowledge Park 3, Greater Noida. Dedicated to
                fresh gourmet burgers, bowls, sides, and zero-compromise packaging.
              </p>
              <div className="text-[11px] text-[#78716C]">
                FSSAI Lic. No: 11224334001928 • Compliant Gourmet Facility
              </div>
            </div>

            {/* Col 2: Service & Dispatch */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#FED7AA]">
                Kitchen Service
              </h4>
              <ul className="text-xs text-[#A8A29E] space-y-2">
                <li>Fresh Gourmet Delicacies</li>
                <li>Wood-Fired Oven & Fresh Burgers</li>
                <li>Zero-Compromise Thermal Packaging</li>
                <li className="text-emerald-400 font-semibold">• Live Orders Active</li>
              </ul>
            </div>

            {/* Col 3: Kitchen Timings & Fresh Delivery */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#FED7AA]">
                Kitchen Hours
              </h4>
              <ul className="text-xs text-[#A8A29E] space-y-2">
                <li>Monday – Sunday: 11:00 AM – 3:00 AM</li>
                <li>Late night doorstep delivery</li>
                <li>Serving hostels & colleges across Knowledge Park</li>
              </ul>
            </div>

            {/* Col 4: Kitchen Location & Contact */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#FED7AA]">
                Kitchen Location & Helpline
              </h4>
              <div className="text-xs text-[#A8A29E] space-y-2.5">
                <p className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-[#C2410C] shrink-0 mt-0.5" />
                  <span>Nalanda living boys hostel , near NIET BUISNESS SCHOOL, knowledge park 3</span>
                </p>
                <p className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-[#C2410C] shrink-0" />
                  <a
                    href="tel:9625750927"
                    className="font-bold text-white hover:text-[#FED7AA] transition-colors"
                  >
                    Helpline: +91 96257 50927
                  </a>
                </p>
              </div>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-[#292524] flex flex-col sm:flex-row items-center justify-between text-xs text-[#78716C] gap-4">
            <p>© 2026 The Red Löffel Cloud Kitchen. All rights reserved.</p>
            <div className="flex gap-6">
              <span>Privacy Policy</span>
              <span>Terms of Service</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
