export type Category = 
  | "All"
  | "Burgers"
  | "Parathas"
  | "Chinese"
  | "Fried Rice"
  | "Pasta"
  | "Maggi"
  | "Fries"
  | "Bowls"
  | "Under ₹99";

export type DietaryType = "veg" | "non-veg";

export interface MenuItem {
  id: string;
  name: string;
  category: Category;
  price: number;
  description: string;
  dietary: DietaryType;
  isAvailable: boolean;
  image: string;
  tag?: string;
  calories?: string;
  preparationTime?: string;
}

export interface CartItem {
  item: MenuItem;
  quantity: number;
}

export type OrderStatus = 
  | "Order Received"
  | "Order Status"
  | "Order Accepted"
  | "In the Road"
  | "Delivered"
  | "Rejected"
  | "Pending" 
  | "Preparing" 
  | "Ready" 
  | "Out for Delivery";

export type WhatsAppStatus = "Sent" | "Delivered" | "Read" | "Failed";

export interface Rider {
  id: string;
  name: string;
  phone: string;
  vehicle: string;
  rating: number;
  activeOrders: number;
}

export interface OrderAddress {
  house: string;
  street: string;
  landmark: string;
  lat?: number;
  lng?: number;
  accuracy?: number;
}

export interface OrderItemDetail {
  itemId: string;
  name: string;
  price: number;
  quantity: number;
  dietary: DietaryType;
}

export interface Order {
  id: string;
  createdAt: string;
  createdTimestamp?: number;
  acceptedTimestamp?: number;
  inRoadTimestamp?: number;
  date?: string;
  customerName: string;
  customerPhone: string;
  orderType: "Delivery" | "Pickup";
  items: OrderItemDetail[];
  subtotal: number;
  tax?: number;
  packagingCharge?: number;
  deliveryFee: number;
  total: number;
  status: OrderStatus;
  rejectionReason?: string;
  cookingNotes?: string;
  address?: OrderAddress;
  riderId?: string;
  paymentMethod: "Cash on Delivery (COD)" | "Online UPI / Cards";
  paymentStatus: "Paid" | "Pending";
  whatsAppNotificationStatus: WhatsAppStatus;
  whatsAppOptIn: boolean;
  whatsAppSentTimestamp?: string;
}

export interface UserProfile {
  name: string;
  phone: string;
  isLoggedIn: boolean;
  defaultAddress?: OrderAddress;
}

export interface SavedLocation {
  id: string;
  label: string;
  address: string;
  detail?: string;
}

export type DiscountType = "free_delivery" | "flat" | "percentage";

export interface Coupon {
  id: string;
  code: string;
  title: string;
  description: string;
  discountType: DiscountType;
  discountValue: number;
  minOrderAmount: number;
  maxDiscount?: number;
  isActive: boolean;
  isDefault?: boolean;
}

