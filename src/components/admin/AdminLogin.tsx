"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ShieldCheck, Lock, Eye, EyeOff, ArrowRight, ArrowLeft, KeyRound, AlertCircle, CheckCircle2 } from "lucide-react";

interface AdminLoginProps {
  onLoginSuccess: () => void;
}

export function AdminLogin({ onLoginSuccess }: AdminLoginProps) {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);

  // Retrieve current admin password from localStorage or fallback to default
  const getStoredPassword = () => {
    if (typeof window === "undefined") return "admin123";
    return localStorage.getItem("lebistro_admin_password") || "admin123";
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!password.trim()) {
      setError("Please enter the admin password.");
      return;
    }

    setIsVerifying(true);

    setTimeout(() => {
      const currentPassword = getStoredPassword();
      if (password === currentPassword) {
        try {
          sessionStorage.setItem("lebistro_admin_logged_in", "true");
        } catch {}
        onLoginSuccess();
      } else {
        setIsVerifying(false);
        setError("Invalid password. Please check and try again.");
      }
    }, 400);
  };

  return (
    <div className="min-h-screen bg-[#141210] text-[#FAF8F5] flex flex-col justify-between selection:bg-[#FED7AA] selection:text-[#9A3412]">
      {/* Top Navbar Minimal */}
      <header className="px-6 py-5 border-b border-white/10 flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-2 text-xs font-semibold text-[#A8A29E] hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Storefront</span>
        </Link>
        <div className="flex items-center gap-2 text-[11px] font-mono text-[#78716C]">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>SECURE OPS GATEWAY</span>
        </div>
      </header>

      {/* Center Auth Card */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-[#1C1917] border border-[#292524] rounded-3xl p-8 sm:p-10 shadow-2xl space-y-6">
          {/* Header Icon & Title */}
          <div className="flex flex-col items-center text-center space-y-3">
            <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-white/20 shadow-xl shadow-black/40 bg-[#FAF8F5]">
              <Image
                src="/logo.jpeg"
                alt="The Red Löffel"
                width={80}
                height={80}
                priority
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h1 className="font-serif text-2xl font-bold tracking-tight text-white">
                Kitchen Command Center
              </h1>
              <p className="text-xs text-[#A8A29E] mt-1 leading-relaxed">
                Authorized Personnel Only • Enter your admin password to access live orders & dispatch management.
              </p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label
                htmlFor="admin-password"
                className="block text-xs font-bold uppercase tracking-wider text-[#A8A29E]"
              >
                Admin Passcode
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#78716C]">
                  <KeyRound className="w-4 h-4" />
                </div>
                <input
                  id="admin-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError("");
                  }}
                  autoFocus
                  placeholder="Enter admin password"
                  className="w-full pl-10 pr-11 py-3.5 bg-black/40 border border-[#292524] focus:border-[#C2410C] focus:ring-2 focus:ring-[#C2410C]/20 rounded-2xl text-sm text-white placeholder:text-[#57534E] outline-none transition-all font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#78716C] hover:text-white transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {error && (
                <div className="flex items-center gap-1.5 text-xs text-rose-400 mt-2 font-medium">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={isVerifying}
              className="w-full py-4 px-6 rounded-2xl bg-[#C2410C] hover:bg-[#9A3412] active:scale-98 text-white font-bold text-sm shadow-lg shadow-[#C2410C]/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
            >
              {isVerifying ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <span>Unlock Admin Panel</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Notice / Default Info */}
          <div className="pt-4 border-t border-[#292524] text-center">
            <div className="inline-flex items-center gap-1.5 text-[11px] text-[#78716C] bg-white/5 px-3 py-1.5 rounded-full border border-white/5">
              <Lock className="w-3 h-3 text-[#FED7AA]" />
              <span>Default password: <span className="font-mono text-[#FED7AA] font-bold">admin123</span> (editable in Settings)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Minimal */}
      <footer className="px-6 py-4 border-t border-white/10 text-center text-xs text-[#57534E]">
        The Red Löffel Cloud Kitchen • Indiranagar & Knowledge Park III Hub
      </footer>
    </div>
  );
}
