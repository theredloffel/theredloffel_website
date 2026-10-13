/**
 * Meta WhatsApp Cloud API Client
 * Official Meta Graph API v21.0 integration for The Red Löffel
 */

const GRAPH_API_VERSION = "v21.0";

interface SendMessageResponse {
  messaging_product: string;
  contacts?: Array<{ input: string; wa_id: string }>;
  messages?: Array<{ id: string }>;
  error?: any;
}

/**
 * Clean phone number to ensure proper international format (e.g., 919876543210)
 */
export function formatWhatsAppNumber(phone: string): string {
  // Strip spaces, dashes, parentheses, plus
  const cleaned = phone.replace(/[^0-9]/g, "");
  // If 10 digits without country code, prefix India (+91)
  if (cleaned.length === 10) {
    return `91${cleaned}`;
  }
  return cleaned;
}

/**
 * Base helper to send messages via Meta WhatsApp Cloud API
 */
export async function sendWhatsAppMessage(payload: any): Promise<{
  success: boolean;
  messageId?: string;
  error?: string;
}> {
  const token = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

  if (!token || !phoneNumberId) {
    console.warn(
      "[WhatsApp] WHATSAPP_ACCESS_TOKEN or WHATSAPP_PHONE_NUMBER_ID not configured in .env.local"
    );
    return {
      success: false,
      error: "WhatsApp API credentials not configured in environment",
    };
  }

  const endpoint = `https://graph.facebook.com/${GRAPH_API_VERSION}/${phoneNumberId}/messages`;

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data: SendMessageResponse = await res.json();

    if (!res.ok || data.error) {
      console.error("[WhatsApp Cloud API Error]:", data.error || data);
      return {
        success: false,
        error: data.error?.message || "Failed to send WhatsApp message",
      };
    }

    const messageId = data.messages?.[0]?.id;
    return {
      success: true,
      messageId,
    };
  } catch (err: any) {
    console.error("[WhatsApp Network Error]:", err);
    return {
      success: false,
      error: err.message || "Network error connecting to WhatsApp API",
    };
  }
}

/**
 * Helper to send messages via Twilio WhatsApp Sandbox
 */
export async function sendTwilioWhatsApp(
  toPhone: string,
  bodyText: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.TWILIO_WHATSAPP_NUMBER || "whatsapp:+14155238886";

  if (!accountSid || !authToken) {
    return {
      success: false,
      error: "Twilio credentials not configured",
    };
  }

  const formattedTo = formatWhatsAppNumber(toPhone);
  const endpoint = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;

  const authHeader = "Basic " + Buffer.from(`${accountSid}:${authToken}`).toString("base64");
  const params = new URLSearchParams();
  params.append("From", fromNumber);
  params.append("To", `whatsapp:+${formattedTo}`);
  params.append("Body", bodyText);

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    });

    const data = await res.json();
    if (!res.ok || data.error_code) {
      console.error("[Twilio WhatsApp Error]:", data);
      return {
        success: false,
        error: data.message || `Twilio error: ${data.error_code}`,
      };
    }

    return {
      success: true,
      messageId: data.sid,
    };
  } catch (err: any) {
    console.error("[Twilio Network Error]:", err);
    return {
      success: false,
      error: err.message || "Network error connecting to Twilio API",
    };
  }
}

/**
 * 1. Send Plain Text WhatsApp message (auto-routes via Twilio Sandbox or Meta Cloud API)
 */
export async function sendWhatsAppText(
  toPhone: string,
  messageText: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  // If Twilio credentials are provided, use Twilio Sandbox (no business verification required)
  if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
    return sendTwilioWhatsApp(toPhone, messageText);
  }

  // Otherwise, use Meta WhatsApp Cloud API
  const formattedTo = formatWhatsAppNumber(toPhone);

  const payload = {
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to: formattedTo,
    type: "text",
    text: {
      preview_url: false,
      body: messageText,
    },
  };

  return sendWhatsAppMessage(payload);
}

/**
 * Send pre-approved Template message (e.g. 'hello_world' or custom business templates)
 */
export async function sendWhatsAppTemplate(
  toPhone: string,
  templateName: string = "hello_world",
  languageCode: string = "en_US",
  components?: any[]
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const formattedTo = formatWhatsAppNumber(toPhone);

  const payload: any = {
    messaging_product: "whatsapp",
    to: formattedTo,
    type: "template",
    template: {
      name: templateName,
      language: {
        code: languageCode,
      },
    },
  };

  if (components) {
    payload.template.components = components;
  }

  return sendWhatsAppMessage(payload);
}

/**
 * 2. Send 6-Digit Login / Verification OTP via WhatsApp
 */
export async function sendWhatsAppOTP(
  toPhone: string,
  otpCode: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const formattedTo = formatWhatsAppNumber(toPhone);

  // Note: For initial testing before template approval, standard text message or 'hello_world' template works
  const messageBody = `🥄 *The Red Löffel* — Verification Code\n\nYour login OTP is: *${otpCode}*\n\nValid for 5 minutes. Please do not share this code with anyone. Enjoy your culinary experience!`;

  return sendWhatsAppText(formattedTo, messageBody);
}

/**
 * 3. Send Order Confirmation Receipt via WhatsApp
 */
export async function sendWhatsAppOrderReceipt(
  toPhone: string,
  order: {
    orderId: string;
    customerName: string;
    items: Array<{ name: string; quantity: number; price: number }>;
    totalAmount: number;
    deliveryAddress: string;
    deliveryEta?: string;
  }
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const formattedTo = formatWhatsAppNumber(toPhone);

  const itemsList = order.items
    .map((item) => `• ${item.quantity}x ${item.name} — ₹${item.price * item.quantity}`)
    .join("\n");

  const messageBody = `✨ *Order Confirmed! — The Red Löffel*\n\nHi ${order.customerName},\nYour order *#${order.orderId}* has been received by our kitchen!\n\n📋 *Order Summary:*\n${itemsList}\n\n💰 *Total Amount:* ₹${order.totalAmount} (COD)\n📍 *Delivery Location:* ${order.deliveryAddress}\n⏱️ *Estimated Delivery:* ${order.deliveryEta || "25-35 mins"}\n\nOur culinary team has begun crafting your meal with love. We'll send live updates here! 👨‍🍳🔥`;

  return sendWhatsAppText(formattedTo, messageBody);
}

/**
 * 4. Send Live Kitchen Status Alert (Preparing, Out for Delivery, Delivered)
 */
export async function sendWhatsAppStatusUpdate(
  toPhone: string,
  orderId: string,
  status: "PREPARING" | "OUT_FOR_DELIVERY" | "DELIVERED",
  riderName?: string,
  riderPhone?: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const formattedTo = formatWhatsAppNumber(toPhone);

  let messageBody = "";

  if (status === "PREPARING") {
    messageBody = `🔥 *Kitchen Update — Order #${orderId}*\n\nYour gourmet dishes are currently sizzling on the fire and being artisanal plated. Fresh ingredients only!`;
  } else if (status === "OUT_FOR_DELIVERY") {
    const riderInfo = riderName
      ? `\n🚴 Rider: *${riderName}*${riderPhone ? ` (${riderPhone})` : ""}`
      : "";
    messageBody = `🛵 *Out for Delivery! — Order #${orderId}*\n\nYour warm meal is sealed in heat-lock packaging and on its way to your hostel/address.${riderInfo}\n\nPlease keep cash ready for handoff.`;
  } else if (status === "DELIVERED") {
    messageBody = `🎉 *Delivered — Bon Appétit!*\n\nOrder *#${orderId}* has been delivered to you. We hope every bite delights your palate. Thank you for choosing The Red Löffel! 🥄❤️`;
  }

  return sendWhatsAppText(formattedTo, messageBody);
}
