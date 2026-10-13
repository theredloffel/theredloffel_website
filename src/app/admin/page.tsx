"use client";

import dynamic from "next/dynamic";
import Image from "next/image";

const AdminDashboard = dynamic(
  () => import("@/components/admin/AdminDashboard").then((mod) => mod.AdminDashboard),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-screen bg-[#FAF8F5] text-[#1C1917] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-14 h-14 rounded-full overflow-hidden shadow-md border border-[#E7E0D8] animate-pulse bg-white">
            <Image
              src="/logo.jpeg"
              alt="The Red Löffel"
              width={56}
              height={56}
              priority
              className="w-full h-full object-cover"
            />
          </div>
          <span className="font-serif text-sm font-semibold text-[#1C1917]">
            Loading Operations Dashboard...
          </span>
        </div>
      </div>
    ),
  }
);

export default function AdminPage() {
  return <AdminDashboard />;
}
