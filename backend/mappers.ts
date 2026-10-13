import { Order, MenuItem, Coupon } from "@/types";

// ==========================================
// ORDER MAPPERS
// ==========================================
export function mapDbOrderToFrontend(row: any): Order {
  return {
    id: row.id,
    createdAt:
      row.created_at_label ||
      new Date(row.created_at).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    createdTimestamp:
      Number(row.created_timestamp) || new Date(row.created_at).getTime(),
    acceptedTimestamp: row.accepted_timestamp
      ? Number(row.accepted_timestamp)
      : undefined,
    inRoadTimestamp: row.in_road_timestamp
      ? Number(row.in_road_timestamp)
      : undefined,
    date:
      row.date ||
      new Date(row.created_at).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }),
    customerName: row.customer_name,
    customerPhone: row.customer_phone,
    orderType: row.order_type as "Delivery" | "Pickup",
    items: row.items || [],
    subtotal: Number(row.subtotal),
    packagingCharge: Number(row.packaging_charge ?? 7),
    tax: Number(row.tax ?? 0),
    deliveryFee: Number(row.delivery_fee ?? 0),
    total: Number(row.total),
    status: row.status,
    rejectionReason: row.rejection_reason || undefined,
    cookingNotes: row.cooking_notes || undefined,
    address: row.address || undefined,
    riderId: row.rider_id || undefined,
    paymentMethod: row.payment_method || "Cash on Delivery (COD)",
    paymentStatus: row.payment_status || "Pending",
    whatsAppNotificationStatus: row.whatsapp_status || "Sent",
    whatsAppOptIn: Boolean(row.whatsapp_opt_in),
    whatsAppSentTimestamp: row.whatsapp_sent_timestamp || undefined,
  };
}

export function mapFrontendOrderToDb(order: Order) {
  return {
    id: order.id,
    created_at_label: order.createdAt,
    created_timestamp: order.createdTimestamp || Date.now(),
    accepted_timestamp: order.acceptedTimestamp || null,
    in_road_timestamp: order.inRoadTimestamp || null,
    date: order.date,
    customer_name: order.customerName,
    customer_phone: order.customerPhone,
    order_type: order.orderType,
    items: order.items,
    subtotal: order.subtotal,
    packaging_charge: order.packagingCharge ?? 7,
    tax: order.tax ?? 0,
    delivery_fee: order.deliveryFee,
    total: order.total,
    status: order.status,
    rejection_reason: order.rejectionReason || null,
    cooking_notes: order.cookingNotes || null,
    address: order.address || null,
    rider_id: order.riderId || null,
    payment_method: order.paymentMethod,
    payment_status: order.paymentStatus,
    whatsapp_status: order.whatsAppNotificationStatus,
    whatsapp_opt_in: order.whatsAppOptIn,
    whatsapp_sent_timestamp: order.whatsAppSentTimestamp || null,
  };
}

// ==========================================
// MENU ITEM MAPPERS
// ==========================================
export function mapDbMenuItemToFrontend(row: any): MenuItem {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    price: Number(row.price),
    description: row.description || "",
    dietary: row.dietary,
    isAvailable: Boolean(row.is_available),
    image: row.image,
    tag: row.tag || undefined,
    preparationTime: row.preparation_time || undefined,
    calories: row.calories || undefined,
  };
}

export function mapFrontendMenuItemToDb(item: MenuItem) {
  return {
    id: item.id,
    name: item.name,
    category: item.category,
    price: item.price,
    description: item.description,
    dietary: item.dietary,
    is_available: item.isAvailable,
    image: item.image,
    tag: item.tag || null,
    preparation_time: item.preparationTime || null,
    calories: item.calories || null,
  };
}

// ==========================================
// COUPON MAPPERS
// ==========================================
export function mapDbCouponToFrontend(row: any): Coupon {
  return {
    id: row.id,
    code: row.code,
    title: row.title,
    description: row.description || "",
    discountType: row.discount_type,
    discountValue: Number(row.discount_value),
    minOrderAmount: Number(row.min_order_amount),
    maxDiscount: row.max_discount ? Number(row.max_discount) : undefined,
    isActive: Boolean(row.is_active),
    isDefault: Boolean(row.is_default),
  };
}

export function mapFrontendCouponToDb(coupon: Coupon) {
  return {
    id: coupon.id,
    code: coupon.code,
    title: coupon.title,
    description: coupon.description,
    discount_type: coupon.discountType,
    discount_value: coupon.discountValue,
    min_order_amount: coupon.minOrderAmount,
    max_discount: coupon.maxDiscount || null,
    is_active: coupon.isActive,
    is_default: Boolean(coupon.isDefault),
  };
}
