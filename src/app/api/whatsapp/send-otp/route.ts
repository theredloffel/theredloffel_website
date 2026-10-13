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

    const result = await sendWhatsAppOTP(phone, generatedOtp);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error,
          // Return simulated fallback in dev if token is not yet configured
          isSimulated: !process.env.WHATSAPP_ACCESS_TOKEN,
          otp: generatedOtp,
        },
        { status: result.error?.includes("not configured") ? 200 : 500 }
      );
    }

    return NextResponse.json({
      success: true,
      messageId: result.messageId,
      otp: generatedOtp,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to process request" },
      { status: 500 }
    );
  }
}
