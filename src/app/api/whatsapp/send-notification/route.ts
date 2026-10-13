import { NextResponse } from "next/server";
import { sendWhatsAppStatusNotification, NotificationType } from "@/lib/whatsapp";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      phone,
      orderId,
      status,
      type,
      rejectionReason,
      amount,
      riderName,
      riderPhone,
      customerName,
      location,
    } = body;

    let notifType: NotificationType = "CONFIRMED_PREPARING";
    const rawType = type || status;

    if (rawType === "CONFIRMED_PREPARING" || rawType === "PREPARING" || rawType === "Order Accepted") {
      notifType = "CONFIRMED_PREPARING";
    } else if (rawType === "REJECTED" || rawType === "Rejected") {
      notifType = "REJECTED";
    } else if (rawType === "OUT_FOR_DELIVERY" || rawType === "In the Road" || rawType === "Out for Delivery") {
      notifType = "OUT_FOR_DELIVERY";
    } else if (rawType === "DRIVER_TASK") {
      notifType = "DRIVER_TASK";
    } else if (rawType === "DELIVERED" || rawType === "Delivered") {
      notifType = "DELIVERED";
    }

    if (!phone || !orderId) {
      return NextResponse.json(
        { success: false, error: "Phone and orderId are required" },
        { status: 400 }
      );
    }

    const result = await sendWhatsAppStatusNotification({
      toPhone: phone,
      orderId,
      type: notifType,
      rejectionReason,
      amount: typeof amount === "number" ? amount : undefined,
      riderName,
      riderPhone,
      customerName,
      location,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to process notification" },
      { status: 500 }
    );
  }
}

