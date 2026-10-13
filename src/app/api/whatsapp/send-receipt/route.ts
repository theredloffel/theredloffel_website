import { NextResponse } from "next/server";
import { sendWhatsAppOrderReceipt } from "@/lib/whatsapp";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { phone, order } = body;

    if (!phone || !order) {
      return NextResponse.json(
        { success: false, error: "Phone number and order details are required" },
        { status: 400 }
      );
    }

    const result = await sendWhatsAppOrderReceipt(phone, order);

    return NextResponse.json({
      success: result.success,
      messageId: result.messageId,
      error: result.error,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to process request" },
      { status: 500 }
    );
  }
}
