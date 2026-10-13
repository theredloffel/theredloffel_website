"use client";

import dynamic from "next/dynamic";

const AdminDashboard = dynamic(
  () => import("@/components/admin/AdminDashboard").then((mod) => mod.AdminDashboard),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-screen bg-[#FAF8F5] text-[#1C1917] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#C2410C] flex items-center justify-center text-white shadow-md animate-pulse">
            <span className="font-serif font-bold text-lg">RL</span>
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
