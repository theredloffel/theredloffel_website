"use client";

import dynamic from "next/dynamic";
import Image from "next/image";

const Storefront = dynamic(
  () => import("@/components/Storefront").then((mod) => mod.Storefront),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-screen flex flex-col bg-[#FAF8F5] text-[#1C1917] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-16 h-16 rounded-full overflow-hidden shadow-md border border-[#E7E0D8] animate-pulse bg-white">
            <Image
              src="/logo.jpeg"
              alt="The Red Löffel"
              width={64}
              height={64}
              priority
              className="w-full h-full object-cover"
            />
          </div>
          <p className="font-serif text-sm font-semibold text-[#1C1917]">
            The Red Löffel • Cloud Kitchen
          </p>
        </div>
      </div>
    ),
  }
);

export default function StorefrontPage() {
  return <Storefront />;
}
