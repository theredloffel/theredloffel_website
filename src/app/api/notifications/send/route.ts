import { NextResponse } from "next/server";

export type NotificationType =
  | "CONFIRMED_PREPARING"
  | "REJECTED"
  | "OUT_FOR_DELIVERY"
  | "DRIVER_TASK"
  | "DELIVERED";

export interface NotificationPayload {
  phone: string;
  orderId: string;
  type: NotificationType;
  rejectionReason?: string;
  amount?: number;
  riderName?: string;
  riderPhone?: string;
  customerName?: string;
  location?: string;
}

export function buildNotificationText(payload: NotificationPayload): string {
  const { type, orderId, rejectionReason, amount, riderName, customerName, location } = payload;

  switch (type) {
    case "CONFIRMED_PREPARING":
      return `🍳 The Red Löffel: Your order #${orderId} has been confirmed and is being prepared! Fresh & hot dishes are currently being crafted in our kitchen.`;

    case "REJECTED":
      return `❌ The Red Löffel: Your order #${orderId} is rejected due to: ${rejectionReason || "out of stock"}.`;

    case "OUT_FOR_DELIVERY":
      return `🛵 The Red Löffel: Your order is out for delivery - Order ID: #${orderId} - Amount: ₹${amount || 0}${
        riderName ? ` (Driver: ${riderName})` : ""
      }.`;

    case "DRIVER_TASK":
      return `📋 The Red Löffel — Driver Task: Pending delivery - Location: ${location || "Customer Location"} - Order No: #${orderId} - Name: ${
        customerName || "Customer"
      } - Amount: ₹${amount || 0}`;

    case "DELIVERED":
      return `🎉 The Red Löffel: Order #${orderId} has been successfully delivered. Enjoy your meal! 🥄❤️`;

    default:
      return `The Red Löffel: Update on order #${orderId}.`;
  }
}

export async function POST(req: Request) {
  try {
    const body: NotificationPayload = await req.json();
    const { phone, orderId, type, rejectionReason, amount, riderName, riderPhone, customerName, location } = body;

    if (!phone || !orderId) {
      return NextResponse.json(
        { success: false, error: "Phone and orderId are required" },
        { status: 400 }
      );
    }

    const messageText = buildNotificationText({
      phone,
      orderId,
      type: type || "CONFIRMED_PREPARING",
      rejectionReason,
      amount,
      riderName,
      riderPhone,
      customerName,
      location,
    });

    console.log(`[Notification Dispatched] To: ${phone} | Type: ${type} | Content: ${messageText}`);

    // Return successful notification response with formatted text and dispatch metadata
    return NextResponse.json({
      success: true,
      messageId: `notif-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
      recipient: phone,
      orderId,
      type,
      text: messageText,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("[Notification Route Error]:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to process notification" },
      { status: 500 }
    );
  }
}
