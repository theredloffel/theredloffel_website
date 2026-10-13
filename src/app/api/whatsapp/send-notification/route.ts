import { NextResponse } from "next/server";
import { sendWhatsAppStatusUpdate } from "@/lib/whatsapp";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { phone, orderId, status, riderName, riderPhone } = body;

    if (!phone || !orderId || !status) {
      return NextResponse.json(
        { success: false, error: "Phone, orderId, and status are required" },
        { status: 400 }
      );
    }

    const result = await sendWhatsAppStatusUpdate(
      phone,
      orderId,
      status,
      riderName,
      riderPhone
    );

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to process notification" },
      { status: 500 }
    );
  }
}
