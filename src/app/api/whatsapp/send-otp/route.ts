import { NextResponse } from "next/server";
import { sendWhatsAppOTP } from "@/lib/whatsapp";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { phone, otp } = body;

    if (!phone) {
      return NextResponse.json(
        { success: false, error: "Phone number is required" },
        { status: 400 }
      );
    }

    // Generate 6-digit OTP if not provided by caller
    const generatedOtp =
      otp || Math.floor(100000 + Math.random() * 900000).toString();

    let result: { success: boolean; messageId?: string; error?: string } = {
      success: false,
    };

    try {
      result = await sendWhatsAppOTP(phone, generatedOtp);
    } catch (err: any) {
      result = { success: false, error: err?.message || "WhatsApp service error" };
    }

    // Always return generated OTP with status 200 so driver verification flow continues
    return NextResponse.json({
      success: result.success,
      messageId: result.messageId,
      error: result.error,
      otp: generatedOtp,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to process request",
        otp: Math.floor(100000 + Math.random() * 900000).toString(),
      },
      { status: 200 }
    );
  }
}
