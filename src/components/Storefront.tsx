"use client";

import React from "react";
import Link from "next/link";
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
  ShieldCheck,
  MapPin,
  MessageSquare,
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
              <span className="font-serif text-2xl font-bold tracking-tight">
                The Red Löffel
              </span>
              <p className="text-xs text-[#A8A29E] leading-relaxed">
                Cloud kitchen operating in Knowledge Park III, Greater Noida. Dedicated to
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

            {/* Col 3: Kitchen Location */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#FED7AA]">
                Kitchen Location
              </h4>
              <div className="text-xs text-[#A8A29E] space-y-2">
                <p className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-[#C2410C] shrink-0 mt-0.5" />
                  <span>Knowledge Park III, Near Sharda University, Greater Noida - 201310</span>
                </p>
                <p className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>WhatsApp Concierge: +91 62976 73521</span>
                </p>
              </div>
            </div>

            {/* Col 4: Quick Portals */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#FED7AA]">
                Staff & Operations
              </h4>
              <p className="text-xs text-[#A8A29E]">
                Kitchen managers and riders can access real-time dispatch, order status advancement, and menu stock controls.
              </p>
              <Link
                href="/admin"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#C2410C] text-white text-xs font-semibold hover:bg-[#9A3412] transition-colors"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Launch Admin Dashboard</span>
              </Link>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-[#292524] flex flex-col sm:flex-row items-center justify-between text-xs text-[#78716C] gap-4">
            <p>© 2026 The Red Löffel Cloud Kitchen. All rights reserved.</p>
            <div className="flex gap-6">
              <span>Privacy Policy</span>
              <span>Terms of Service</span>
              <span>Rider Portal</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
