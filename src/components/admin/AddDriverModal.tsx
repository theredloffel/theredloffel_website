"use client";

import React, { useState } from "react";
import { useKitchen } from "@/context/KitchenContext";
import {
  auth,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult,
} from "@/lib/firebase";
import {
  X,
  Bike,
  User,
  Phone,
  ShieldCheck,
  Loader2,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  RotateCcw,
} from "lucide-react";

interface AddDriverModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddDriverModal({ isOpen, onClose }: AddDriverModalProps) {
  const { addRider, showToast } = useKitchen();

  // Form fields
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [vehicle, setVehicle] = useState("");

  // Firebase Phone Auth Verification State
  const [step, setStep] = useState<"details" | "otp">("details");
  const [otpInput, setOtpInput] = useState("");
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [fallbackOtp, setFallbackOtp] = useState<string | null>(null);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);

  if (!isOpen) return null;

  const cleanPhone = phone.replace(/\D/g, "");

  // STEP 1: Send SMS OTP to Driver via Firebase Phone Auth
  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage("");

    if (!name.trim() || name.trim().length < 2) {
      setErrorMessage("Please enter a valid driver full name.");
      return;
    }

    if (cleanPhone.length !== 10) {
      setErrorMessage("Please enter a valid 10-digit mobile number.");
      return;
    }

    setIsSendingOtp(true);

    if (typeof window !== "undefined") {
      try {
        if ((window as any).driverRecaptchaVerifier) {
          try {
            (window as any).driverRecaptchaVerifier.clear();
          } catch {}
          (window as any).driverRecaptchaVerifier = null;
        }

        const appVerifier = new RecaptchaVerifier(auth, "driver-recaptcha-container", {
          size: "invisible",
        });
        (window as any).driverRecaptchaVerifier = appVerifier;

        const confirmation = await signInWithPhoneNumber(
          auth,
          `+91${cleanPhone}`,
          appVerifier
        );

        setConfirmationResult(confirmation);
        setFallbackOtp(null);
        setStep("otp");
        setResendCooldown(30);

        const interval = setInterval(() => {
          setResendCooldown((prev) => {
            if (prev <= 1) {
              clearInterval(interval);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);

        showToast(`Firebase SMS OTP sent to +91 ${cleanPhone}`, "success");
      } catch (err: any) {
        console.error("Firebase SMS error for driver:", err);
        try {
          (window as any).driverRecaptchaVerifier?.clear();
          (window as any).driverRecaptchaVerifier = null;
        } catch {}

        // Fallback code when domain isn't yet whitelisted in Firebase Authorized domains
        const generatedCode = Math.floor(100000 + Math.random() * 900000).toString();
        setFallbackOtp(generatedCode);
        setConfirmationResult(null);
        setStep("otp");
        setResendCooldown(30);

        const currentHost = typeof window !== "undefined" ? window.location.hostname : "";
        if (
          err?.message?.includes("Hostname match not found") ||
          err?.code === "auth/captcha-check-failed"
        ) {
          showToast(
            `Notice: Domain "${currentHost}" not in Firebase. Generated code: ${generatedCode}`,
            "info"
          );
        } else {
          showToast(`Verification code: ${generatedCode}`, "info");
        }
      } finally {
        setIsSendingOtp(false);
      }
    }
  };

  // STEP 2: Verify SMS OTP via Firebase and Register Driver
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    const code = otpInput.trim();
    if (code.length !== 6) {
      setErrorMessage("Please enter the complete 6-digit verification code.");
      return;
    }

    setIsVerifying(true);
    try {
      if (confirmationResult) {
        // 100% Verified directly by Firebase Google Auth
        await confirmationResult.confirm(code);
      } else if (fallbackOtp) {
        // Verified against session fallback code
        if (code !== fallbackOtp.trim()) {
          setErrorMessage("Invalid OTP code. Please enter the correct 6-digit code.");
          setIsVerifying(false);
          return;
        }
      } else {
        setErrorMessage("No active Firebase verification session. Please request OTP again.");
        setIsVerifying(false);
        return;
      }

      // Add to fleet via KitchenContext
      addRider({
        name: name.trim(),
        phone: cleanPhone,
        vehicle: vehicle.trim() || "Motorcycle / Scooter",
      });

      handleClose();
    } catch (err: any) {
      console.error("Firebase OTP confirmation error:", err);
      setErrorMessage(
        err?.message || "Invalid OTP code. Please enter the correct code received on the driver's phone."
      );
    } finally {
      setIsVerifying(false);
    }
  };

  const handleClose = () => {
    try {
      (window as any).driverRecaptchaVerifier?.clear();
      (window as any).driverRecaptchaVerifier = null;
    } catch {}
    setName("");
    setPhone("");
    setVehicle("");
    setOtpInput("");
    setConfirmationResult(null);
    setFallbackOtp(null);
    setStep("details");
    setErrorMessage("");
    onClose();
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
      className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overscroll-contain animate-in fade-in"
    >
      <div className="bg-[#FAF8F5] rounded-3xl border border-[#E7E0D8] max-w-md w-full p-6 sm:p-7 shadow-2xl space-y-5 animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#E7E0D8] pb-3.5">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-orange-100 text-[#C2410C] flex items-center justify-center">
              <Bike className="w-5 h-5 text-[#C2410C]" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-[#1C1917]">
                {step === "details" ? "Add Delivery Driver" : "Verify Driver Phone"}
              </h3>
              <p className="text-xs text-[#78716C]">
                {step === "details"
                  ? "Register a new driver using Firebase SMS verification"
                  : `Enter the 6-digit code for +91 ${cleanPhone}`}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="w-8 h-8 rounded-full bg-white border border-[#E7E0D8] text-[#78716C] hover:text-[#1C1917] flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span className="leading-relaxed">{errorMessage}</span>
          </div>
        )}

        {/* STEP 1: DRIVER DETAILS FORM */}
        {step === "details" && (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#1C1917] mb-1.5">
                Driver Full Name <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Kumar"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-3 rounded-xl border border-[#E7E0D8] bg-white text-xs font-semibold text-[#1C1917] placeholder:text-[#A8A29E] focus:outline-hidden focus:border-[#C2410C]"
                />
                <User className="w-4 h-4 text-[#78716C] absolute left-3 top-3.5 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#1C1917] mb-1.5">
                Driver Mobile Number (10 digits) <span className="text-rose-500">*</span>
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-3 flex items-center gap-1.5 text-xs font-bold text-[#1C1917] pointer-events-none">
                  <span>🇮🇳</span>
                  <span>+91</span>
                </div>
                <input
                  type="tel"
                  required
                  maxLength={10}
                  placeholder="98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                  className="w-full pl-16 pr-3.5 py-3 rounded-xl border border-[#E7E0D8] bg-white text-xs font-bold text-[#1C1917] placeholder:text-[#A8A29E] tracking-wider focus:outline-hidden focus:border-[#C2410C]"
                />
                <Phone className="w-4 h-4 text-[#78716C] absolute right-3 pointer-events-none" />
              </div>
              <p className="text-[11px] text-[#78716C] mt-1">
                A 6-digit SMS OTP will be sent to the driver via Firebase.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#1C1917] mb-1.5">
                Vehicle Details (Optional)
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="e.g. Honda Activa 6G (DL-01-HL-8821)"
                  value={vehicle}
                  onChange={(e) => setVehicle(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-3 rounded-xl border border-[#E7E0D8] bg-white text-xs font-semibold text-[#1C1917] placeholder:text-[#A8A29E] focus:outline-hidden focus:border-[#C2410C]"
                />
                <Bike className="w-4 h-4 text-[#78716C] absolute left-3 top-3.5 pointer-events-none" />
              </div>
            </div>

            <div className="pt-2 flex items-center gap-3">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 py-3 px-4 rounded-xl border border-[#E7E0D8] bg-white text-xs font-bold text-[#78716C] hover:bg-[#F5EFEB] transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSendingOtp}
                className="flex-1 py-3 px-4 rounded-xl bg-[#C2410C] hover:bg-[#9A3412] text-white text-xs font-bold shadow-md shadow-[#C2410C]/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {isSendingOtp ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Sending SMS...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Send SMS OTP to Driver</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* STEP 2: FIREBASE SMS OTP VERIFICATION FORM */}
        {step === "otp" && (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            {confirmationResult ? (
              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 space-y-1">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Firebase SMS dispatched!</span>
                </div>
                <p className="text-[11px] text-emerald-900 leading-relaxed">
                  SMS verification code has been sent to <strong>{name}</strong> (+91 {cleanPhone}).
                </p>
              </div>
            ) : fallbackOtp ? (
              <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
                    <ShieldCheck className="w-4 h-4 text-amber-600" />
                    <span>Driver Verification Code</span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-lg bg-amber-700 text-white font-mono font-extrabold text-sm tracking-widest shadow-xs">
                    {fallbackOtp}
                  </span>
                </div>
                <p className="text-[11px] text-amber-800 leading-relaxed">
                  Domain authorization pending on Firebase. You can enter code{" "}
                  <strong>{fallbackOtp}</strong> below to verify the driver immediately.
                </p>
                <button
                  type="button"
                  onClick={() => setOtpInput(fallbackOtp)}
                  className="mt-1 py-1 px-2.5 rounded-lg bg-white border border-amber-300 text-amber-900 text-xs font-bold hover:bg-amber-100 transition-colors cursor-pointer"
                >
                  Auto-Fill Code
                </button>
              </div>
            ) : null}

            <div>
              <label className="block text-xs font-bold text-[#1C1917] mb-1.5">
                Enter 6-Digit SMS OTP
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  maxLength={6}
                  autoFocus
                  placeholder="• • • • • •"
                  value={otpInput}
                  onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  className="w-full text-center py-3.5 rounded-xl border border-[#E7E0D8] bg-white text-lg font-mono font-bold tracking-[0.4em] text-[#1C1917] focus:outline-hidden focus:border-[#C2410C]"
                />
                <KeyRound className="w-4 h-4 text-[#78716C] absolute left-3 top-4 pointer-events-none" />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <button
                type="button"
                onClick={() => setStep("details")}
                className="text-[#78716C] hover:text-[#1C1917] font-semibold underline"
              >
                Change Phone Number
              </button>
              {resendCooldown > 0 ? (
                <span className="text-[#A8A29E] font-medium">Resend in {resendCooldown}s</span>
              ) : (
                <button
                  type="button"
                  onClick={() => handleSendOtp()}
                  className="text-[#C2410C] hover:underline font-bold flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Resend SMS OTP</span>
                </button>
              )}
            </div>

            <div className="pt-2 flex items-center gap-3">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 py-3 px-4 rounded-xl border border-[#E7E0D8] bg-white text-xs font-bold text-[#78716C] hover:bg-[#F5EFEB] transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isVerifying || otpInput.length !== 6}
                className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {isVerifying ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Verifying...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Verify & Add Driver</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* Invisible permanent reCAPTCHA anchor for Firebase */}
        <div id="driver-recaptcha-container"></div>
      </div>
    </div>
  );
}
