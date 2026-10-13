import { NextResponse } from "next/server";
import { sendWhatsAppTemplate, sendWhatsAppText } from "@/lib/whatsapp";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { phone, type } = body;

    if (!phone) {
      return NextResponse.json(
        { success: false, error: "Phone number is required (e.g. 919876543210)" },
        { status: 400 }
      );
    }

    let result;
    if (type === "text") {
      result = await sendWhatsAppText(
        phone,
        "👋 Welcome to The Red Löffel! Your WhatsApp notifications are connected successfully."
      );
    } else {
      // Default: hello_world template (pre-approved for all WhatsApp accounts by Meta)
      result = await sendWhatsAppTemplate(phone, "hello_world", "en_US");
    }

    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to send test message" },
      { status: 500 }
    );
  }
}
