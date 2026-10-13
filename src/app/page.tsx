"use client";

import dynamic from "next/dynamic";

const Storefront = dynamic(
  () => import("@/components/Storefront").then((mod) => mod.Storefront),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-screen flex flex-col bg-[#FAF8F5] text-[#1C1917] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#C2410C] flex items-center justify-center text-white shadow-md animate-pulse">
            <span className="font-serif font-bold text-xl text-white">RL</span>
          </div>
          <p className="font-serif text-sm font-semibold text-[#1C1917]">
            The Red Löffel • Le Bistro
          </p>
        </div>
      </div>
    ),
  }
);

export default function StorefrontPage() {
  return <Storefront />;
}
