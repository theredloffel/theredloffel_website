"use client";

import React, { createContext, useContext, useState, useEffect, useMemo } from "react";
import { MenuItem, CartItem, Order, OrderStatus, Rider, UserProfile, OrderAddress, WhatsAppStatus, Category, SavedLocation, Coupon } from "@/types";
import { INITIAL_MENU_ITEMS, INITIAL_ORDERS, RIDERS, INITIAL_COUPONS, DEFAULT_DELIVERY_CHARGE, DEFAULT_FREE_DELIVERY_THRESHOLD } from "@/data/mockData";
import { orderService, menuService, couponService, settingsService } from "@backend";
import { sendBrowserNotification } from "@/lib/pushNotifications";

export interface ToastMessage {
  id: string;
  message: string;
  type: "success" | "info" | "warning";
}

interface KitchenContextType {
  // Menu & Categories
  menuItems: MenuItem[];
  selectedCategory: Category;
  setSelectedCategory: (category: Category) => void;
  toggleAvailability: (itemId: string) => void;
  updateItemPrice: (itemId: string, newPrice: number) => void;
  updateItemDetails: (updatedItem: MenuItem) => void;

  // Cart
  cart: CartItem[];
  addToCart: (item: MenuItem) => void;
  removeFromCart: (itemId: string) => void;
  updateCartQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  cartCount: number;
  cartSubtotal: number;
  deliveryType: "Delivery" | "Pickup";
  setDeliveryType: (type: "Delivery" | "Pickup") => void;
  cookingNotes: string;
  setCookingNotes: (notes: string) => void;
  deliveryFee: number;
  tax: number;
  packagingCharge: number;
  grandTotal: number;

  // Delivery Fee & Coupons
  baseDeliveryCharge: number;
  updateBaseDeliveryCharge: (charge: number) => void;
  freeDeliveryThreshold: number;
  updateFreeDeliveryThreshold: (threshold: number) => void;
  coupons: Coupon[];
  addCoupon: (coupon: Omit<Coupon, "id">) => void;
  removeCoupon: (couponId: string) => void;
  toggleCouponStatus: (couponId: string) => void;
  appliedCoupon: Coupon | null;
  applyCoupon: (couponCode: string) => { success: boolean; message: string };
  removeAppliedCoupon: () => void;
  couponDiscount: number;

  // Orders
  orders: Order[];
  userOrders: Order[];
  placeOrder: (details: {
    customerName: string;
    customerPhone: string;
    address?: OrderAddress;
    paymentMethod: "Cash on Delivery (COD)" | "Online UPI / Cards";
    whatsAppOptIn: boolean;
  }) => Order;
  updateOrderStatus: (orderId: string, newStatus: OrderStatus, rejectionReason?: string, silent?: boolean) => void;
  assignRider: (orderId: string, riderId: string, silent?: boolean) => void;
  sendRiderWhatsApp: (orderId: string) => void;
  retryWhatsApp: (orderId: string) => void;

  // Riders
  riders: Rider[];
  addRider: (rider: { name: string; phone: string; vehicle?: string }) => Rider;
  removeRider: (riderId: string) => void;

  // User Auth
  user: UserProfile;
  loginWithPhone: (phone: string, name?: string) => void;
  logout: () => void;

  // Modals & UI States
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  isAuthOpen: boolean;
  setIsAuthOpen: (open: boolean) => void;
  isCheckoutOpen: boolean;
  setIsCheckoutOpen: (open: boolean) => void;
  isOrderHistoryOpen: boolean;
  setIsOrderHistoryOpen: (open: boolean) => void;
  selectedTrackingOrderId: string | null;
  setSelectedTrackingOrderId: (id: string | null) => void;
  activeOrderId: string | null;
  setActiveOrderId: (id: string | null) => void;
  isLocationModalOpen: boolean;
  setIsLocationModalOpen: (open: boolean) => void;
  isMapPickerOpen: boolean;
  setIsMapPickerOpen: (open: boolean) => void;
  openMapPicker: (callback?: (loc: { label: string; address: string; detail?: string; house?: string; street?: string; landmark?: string; lat?: number; lng?: number; accuracy?: number }) => void) => void;
  mapPickerCallback: ((loc: { label: string; address: string; detail?: string; house?: string; street?: string; landmark?: string; lat?: number; lng?: number; accuracy?: number }) => void) | null;

  // Search & Dietary Quick Filters (Synced with Nav Bar)
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isVegOnly: boolean;
  setIsVegOnly: (value: boolean | ((prev: boolean) => boolean)) => void;
  locationLabel: string;
  setLocationLabel: (label: string) => void;
  locationAddress: string;
  setLocationAddress: (address: string) => void;
  savedLocations: SavedLocation[];
  addSavedLocation: (location: {
    label: string;
    address: string;
    detail?: string;
    house?: string;
    street?: string;
    landmark?: string;
    lat?: number;
    lng?: number;
    accuracy?: number;
  }) => void;
  removeSavedLocation: (id: string) => void;

  // Store Operational Status
  isStoreOpen: boolean;
  setIsStoreOpen: (open: boolean | ((prev: boolean) => boolean)) => void;
  toggleStoreOpen: () => void;

  // Admin Order Search
  adminOrderSearch: string;
  setAdminOrderSearch: (query: string) => void;

  // Notifications
  toasts: ToastMessage[];
  showToast: (message: string, type?: "success" | "info" | "warning") => void;
}

const KitchenContext = createContext<KitchenContextType | undefined>(undefined);

export function KitchenProvider({ children }: { children: React.ReactNode }) {
  const [menuItems, setMenuItems] = useState<MenuItem[]>(INITIAL_MENU_ITEMS);
  const [selectedCategory, setSelectedCategory] = useState<Category>("All");
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [riders, setRiders] = useState<Rider[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("lebistro_riders");
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) return parsed;
        }
      } catch {}
    }
    return RIDERS;
  });

  useEffect(() => {
    try {
      localStorage.setItem("lebistro_riders", JSON.stringify(riders));
    } catch {}
  }, [riders]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [deliveryType, setDeliveryType] = useState<"Delivery" | "Pickup">("Delivery");
  const [cookingNotes, setCookingNotes] = useState<string>("");

  const [user, setUser] = useState<UserProfile>({
    name: "",
    phone: "",
    isLoggedIn: false,
  });

  // UI state
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isOrderHistoryOpen, setIsOrderHistoryOpen] = useState(false);
  const [selectedTrackingOrderId, setSelectedTrackingOrderId] = useState<string | null>(null);
  const [activeOrderId, setActiveOrderId] = useState<string | null>(null);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [isMapPickerOpen, setIsMapPickerOpen] = useState(false);
  const [mapPickerCallback, setMapPickerCallback] = useState<((loc: { label: string; address: string; detail?: string; house?: string; street?: string; landmark?: string; lat?: number; lng?: number; accuracy?: number }) => void) | null>(null);

  const openMapPicker = (callback?: (loc: { label: string; address: string; detail?: string; house?: string; street?: string; landmark?: string; lat?: number; lng?: number; accuracy?: number }) => void) => {
    setMapPickerCallback(() => callback || null);
    setIsMapPickerOpen(true);
  };

  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Search & Veg filter
  const [searchQuery, setSearchQuery] = useState("");
  const [isVegOnly, setIsVegOnly] = useState(false);
  const [locationLabel, setLocationLabel] = useState("");
  const [locationAddress, setLocationAddress] = useState("");

  // Admin Search & Store Open Status
  const [isStoreOpen, setIsStoreOpen] = useState(true);
  const [adminOrderSearch, setAdminOrderSearch] = useState("");

  const toggleStoreOpen = () => {
    setIsStoreOpen((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("lebistro_store_open", String(next));
      } catch {}
      settingsService.updateStoreOpen(next);
      showToast(
        next ? "Store is now OPEN for online orders!" : "Store is now CLOSED. Orders paused.",
        next ? "success" : "warning"
      );
      return next;
    });
  };

  const [savedLocations, setSavedLocations] = useState<SavedLocation[]>([]);

  // Load saved state from localStorage if available
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem("lebistro_user");
      let currentUserPhone = "";
      if (savedUser) {
        const parsed = JSON.parse(savedUser);
        if (parsed.name === "Gourmet Member") {
          parsed.name = "";
          try {
            localStorage.setItem("lebistro_user", JSON.stringify(parsed));
          } catch {}
        }
        setUser(parsed);
        if (parsed.isLoggedIn && parsed.phone) {
          currentUserPhone = parsed.phone.replace(/\D/g, "");
        }
      }

      // ONLY restore active order ID and cart if user IS actually logged in!
      if (currentUserPhone) {
        const storedActiveOrderId = localStorage.getItem("lebistro_active_order_id");
        if (storedActiveOrderId) setActiveOrderId(storedActiveOrderId);

        const savedUserCart =
          localStorage.getItem(`lebistro_cart_${currentUserPhone}`) ||
          localStorage.getItem("lebistro_cart");
        if (savedUserCart) setCart(JSON.parse(savedUserCart));
      } else {
        // If not logged in, ensure activeOrderId and cart are completely cleared
        setActiveOrderId(null);
        setSelectedTrackingOrderId(null);
        try {
          localStorage.removeItem("lebistro_active_order_id");
          localStorage.removeItem("lebistro_cart");
        } catch {}
      }

      // Purge any stale legacy orders cache on app load so demo orders never persist
      try {
        localStorage.removeItem("lebistro_orders");
      } catch {}

      // Load any saved coupons cache
      try {
        const storedCoupons = localStorage.getItem("lebistro_coupons");
        if (storedCoupons) {
          const parsed = JSON.parse(storedCoupons);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setCoupons(parsed);
          }
        }
      } catch {}

      const savedMenu = localStorage.getItem("lebistro_menu");
      if (savedMenu && !savedMenu.includes("unsplash.com")) {
        try {
          const parsed: MenuItem[] = JSON.parse(savedMenu);
          const existingIds = new Set(parsed.map((p) => p.id));
          const missing = INITIAL_MENU_ITEMS.filter((i) => !existingIds.has(i.id));
          setMenuItems(missing.length > 0 ? [...parsed, ...missing] : parsed);
        } catch {
          setMenuItems(INITIAL_MENU_ITEMS);
        }
      } else if (savedMenu) {
        localStorage.removeItem("lebistro_menu");
      }

      // Clear any legacy demo saved locations
      localStorage.removeItem("lebistro_saved_locations");

      const storedStoreOpen = localStorage.getItem("lebistro_store_open");
      if (storedStoreOpen !== null) setIsStoreOpen(storedStoreOpen === "true");
    } catch {
      // Fallback to defaults
    }
  }, []);

  // Load live data from Backend & listen for real-time WebSocket updates
  useEffect(() => {
    let isMounted = true;

    // 1. Initial Backend Data Fetch
    const loadBackendData = async () => {
      // Orders
      const { orders: remoteOrders } = await orderService.fetchOrders();
      if (isMounted) {
        setOrders(remoteOrders);
        try {
          localStorage.setItem("lebistro_orders", JSON.stringify(remoteOrders));
        } catch {}
      }

      // Menu
      const { items: remoteMenu } = await menuService.fetchMenuItems();
      if (isMounted && remoteMenu.length > 0) {
        const existingIds = new Set(remoteMenu.map((p) => p.id));
        const missing = INITIAL_MENU_ITEMS.filter((i) => !existingIds.has(i.id));
        setMenuItems(missing.length > 0 ? [...remoteMenu, ...missing] : remoteMenu);
      }

      // Coupons - fetch all promotional and default coupons
      const { coupons: remoteCoupons } = await couponService.fetchCoupons();
      if (isMounted) {
        if (remoteCoupons && remoteCoupons.length > 0) {
          setCoupons(remoteCoupons);
          try {
            localStorage.setItem("lebistro_coupons", JSON.stringify(remoteCoupons));
          } catch {}
        } else {
          setCoupons(INITIAL_COUPONS);
        }
      }

      // Settings
      const {
        baseDeliveryCharge: remoteFee,
        freeDeliveryThreshold: remoteThreshold,
        isStoreOpen: remoteStoreState,
        deliveryRiders: remoteRiders,
      } = await settingsService.fetchSettings();
      if (isMounted) {
        if (remoteFee !== undefined) setBaseDeliveryCharge(remoteFee);
        if (remoteThreshold !== undefined) setFreeDeliveryThreshold(remoteThreshold);
        if (remoteStoreState !== undefined) setIsStoreOpen(remoteStoreState);
        if (remoteRiders !== undefined) {
          setRiders(remoteRiders);
          try {
            localStorage.setItem("lebistro_riders", JSON.stringify(remoteRiders));
          } catch {}
        }
      }
    };

    loadBackendData();

    // 2. Real-time Subscriptions through Backend Services
    const unsubOrders = orderService.subscribeToOrders({
      onInsert: (newOrder) => {
        if (!isMounted) return;
        setOrders((prev) => {
          if (prev.some((o) => o.id === newOrder.id)) return prev;
          return [newOrder, ...prev];
        });
      },
      onUpdate: (updatedOrder) => {
        if (!isMounted) return;
        setOrders((prev) => {
          const prevOrder = prev.find((o) => o.id === updatedOrder.id);
          if (prevOrder && prevOrder.status !== updatedOrder.status) {
            // Check if this order belongs to the currently logged in customer
            const userPhoneClean = (user?.phone || "").replace(/\D/g, "");
            const orderPhoneClean = (updatedOrder.customerPhone || "").replace(/\D/g, "");
            if (userPhoneClean && orderPhoneClean && userPhoneClean === orderPhoneClean) {
              if (updatedOrder.status === "Order Accepted" || updatedOrder.status === "Preparing") {
                showToast(`Your order #${updatedOrder.id} is confirmed and preparing! 🍳`, "success");
                if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
                  try {
                    new Notification("The Red Löffel", {
                      body: `Your order #${updatedOrder.id} is confirmed and preparing! 🍳`,
                      icon: "/favicon.ico",
                    });
                  } catch {}
                }
              } else if (updatedOrder.status === "Rejected") {
                showToast(
                  `Your order #${updatedOrder.id} is rejected due to: ${updatedOrder.rejectionReason || "out of stock"}`,
                  "warning"
                );
                if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
                  try {
                    new Notification("The Red Löffel", {
                      body: `Your order #${updatedOrder.id} is rejected due to: ${updatedOrder.rejectionReason || "out of stock"}`,
                      icon: "/favicon.ico",
                    });
                  } catch {}
                }
              } else if (updatedOrder.status === "In the Road" || updatedOrder.status === "Out for Delivery") {
                showToast(
                  `Your order is out for delivery - Order ID: #${updatedOrder.id} - Amount: ₹${updatedOrder.total}`,
                  "info"
                );
                if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
                  try {
                    new Notification("The Red Löffel", {
                      body: `Your order is out for delivery - Order ID: #${updatedOrder.id} - Amount: ₹${updatedOrder.total}`,
                      icon: "/favicon.ico",
                    });
                  } catch {}
                }
              }
            }
          }
          return prev.map((o) => (o.id === updatedOrder.id ? updatedOrder : o));
        });
      },
      onDelete: (deletedId) => {
        if (!isMounted) return;
        setOrders((prev) => prev.filter((o) => o.id !== deletedId));
      },
    });

    const unsubMenu = menuService.subscribeToMenu({
      onChange: async () => {
        const { items } = await menuService.fetchMenuItems();
        if (isMounted && items.length > 0) setMenuItems(items);
      },
    });

    const unsubCoupons = couponService.subscribeToCoupons({
      onChange: async () => {
        const { coupons: latest } = await couponService.fetchCoupons();
        if (isMounted && latest && latest.length > 0) {
          setCoupons(latest);
          try {
            localStorage.setItem("lebistro_coupons", JSON.stringify(latest));
          } catch {}
        }
      },
    });

    const unsubSettings = settingsService.subscribeToSettings({
      onChange: async () => {
        const {
          baseDeliveryCharge: fee,
          freeDeliveryThreshold: threshold,
          isStoreOpen: open,
          deliveryRiders: remoteRiders,
        } = await settingsService.fetchSettings();
        if (isMounted) {
          if (fee !== undefined) setBaseDeliveryCharge(fee);
          if (threshold !== undefined) setFreeDeliveryThreshold(threshold);
          if (open !== undefined) setIsStoreOpen(open);
          if (remoteRiders !== undefined) {
            setRiders(remoteRiders);
            try {
              localStorage.setItem("lebistro_riders", JSON.stringify(remoteRiders));
            } catch {}
          }
        }
      },
    });

    return () => {
      isMounted = false;
      unsubOrders();
      unsubMenu();
      unsubCoupons();
      unsubSettings();
    };
  }, []);

  // Save changes
  useEffect(() => {
    try {
      localStorage.setItem("lebistro_user", JSON.stringify(user));
    } catch {}
  }, [user]);

  useEffect(() => {
    try {
      localStorage.setItem("lebistro_cart", JSON.stringify(cart));
      if (user.isLoggedIn && user.phone) {
        const cleanPhone = user.phone.replace(/\D/g, "");
        if (cleanPhone) {
          localStorage.setItem(`lebistro_cart_${cleanPhone}`, JSON.stringify(cart));
        }
      }
    } catch {}
  }, [cart, user.isLoggedIn, user.phone]);

  useEffect(() => {
    try {
      localStorage.setItem("lebistro_orders", JSON.stringify(orders));
    } catch {}
  }, [orders]);

  useEffect(() => {
    try {
      localStorage.setItem("lebistro_menu", JSON.stringify(menuItems));
    } catch {}
  }, [menuItems]);

  // Freeze background scrolling whenever any modal, drawer, or slide-over is open
  useEffect(() => {
    if (typeof window === "undefined") return;

    const isAnyModalOpen =
      isCartOpen ||
      isOrderHistoryOpen ||
      isCheckoutOpen ||
      isAuthOpen ||
      isLocationModalOpen ||
      isMapPickerOpen;

    if (isAnyModalOpen) {
      document.documentElement.classList.add("modal-open");
      document.body.classList.add("modal-open");
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
      return () => {
        document.documentElement.classList.remove("modal-open");
        document.body.classList.remove("modal-open");
        document.body.style.overflow = "";
        document.documentElement.style.overflow = "";
      };
    } else {
      document.documentElement.classList.remove("modal-open");
      document.body.classList.remove("modal-open");
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    }
  }, [
    isCartOpen,
    isOrderHistoryOpen,
    isCheckoutOpen,
    isAuthOpen,
    isLocationModalOpen,
    isMapPickerOpen,
  ]);

  const showToast = (message: string, type: "success" | "info" | "warning" = "success") => {
    const id = Date.now().toString() + Math.random().toString().slice(2, 6);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  // Cart operations
  const addToCart = (item: MenuItem) => {
    if (!item.isAvailable) {
      showToast(`${item.name} is currently out of stock`, "warning");
      return;
    }
    setCart((prev) => {
      const existing = prev.find((ci) => ci.item.id === item.id);
      if (existing) {
        return prev.map((ci) =>
          ci.item.id === item.id ? { ...ci, quantity: ci.quantity + 1 } : ci
        );
      }
      return [...prev, { item, quantity: 1 }];
    });
  };

  const removeFromCart = (itemId: string) => {
    setCart((prev) => {
      const existing = prev.find((ci) => ci.item.id === itemId);
      if (existing && existing.quantity > 1) {
        return prev.map((ci) =>
          ci.item.id === itemId ? { ...ci, quantity: ci.quantity - 1 } : ci
        );
      }
      return prev.filter((ci) => ci.item.id !== itemId);
    });
  };

  const updateCartQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      setCart((prev) => prev.filter((ci) => ci.item.id !== itemId));
    } else {
      setCart((prev) =>
        prev.map((ci) => (ci.item.id === itemId ? { ...ci, quantity } : ci))
      );
    }
  };

  const clearCart = () => {
    setCart([]);
    try {
      localStorage.removeItem("lebistro_cart");
      if (user.phone) {
        const clean = user.phone.replace(/\D/g, "");
        if (clean) localStorage.removeItem(`lebistro_cart_${clean}`);
      }
    } catch {}
  };

  const cartCount = useMemo(() => {
    return cart.reduce((acc, curr) => acc + curr.quantity, 0);
  }, [cart]);

  const cartSubtotal = useMemo(() => {
    return cart.reduce((acc, curr) => acc + curr.item.price * curr.quantity, 0);
  }, [cart]);

  // Delivery Fee Management
  const [baseDeliveryCharge, setBaseDeliveryCharge] = useState<number>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("lebistro_delivery_charge");
      if (saved) return Number(saved);
    }
    return DEFAULT_DELIVERY_CHARGE;
  });

  const updateBaseDeliveryCharge = (charge: number) => {
    const val = Math.max(0, Math.round(charge));
    setBaseDeliveryCharge(val);
    try {
      localStorage.setItem("lebistro_delivery_charge", String(val));
    } catch {}
    settingsService.updateDeliveryCharge(val);
    showToast(`Base delivery charge updated to ₹${val}`, "success");
  };

  const [freeDeliveryThreshold, setFreeDeliveryThreshold] = useState<number>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("lebistro_free_delivery_threshold");
        if (stored) return Number(stored) || DEFAULT_FREE_DELIVERY_THRESHOLD;
      } catch {}
    }
    return DEFAULT_FREE_DELIVERY_THRESHOLD;
  });

  const updateFreeDeliveryThreshold = (threshold: number) => {
    const val = Math.max(0, Math.round(threshold));
    setFreeDeliveryThreshold(val);
    try {
      localStorage.setItem("lebistro_free_delivery_threshold", String(val));
    } catch {}
    settingsService.updateFreeDeliveryThreshold(val);
    showToast(`Free delivery threshold updated to ₹${val}`, "success");
  };

  // Coupons Management
  const [coupons, setCoupons] = useState<Coupon[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("lebistro_coupons");
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed;
          }
        }
      } catch {}
      try {
        localStorage.setItem("lebistro_coupons", JSON.stringify(INITIAL_COUPONS));
      } catch {}
    }
    return INITIAL_COUPONS;
  });

  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);

  const saveCoupons = (newCoupons: Coupon[]) => {
    setCoupons(newCoupons);
    try {
      localStorage.setItem("lebistro_coupons", JSON.stringify(newCoupons));
    } catch {}
  };

  const addCoupon = (couponData: Omit<Coupon, "id">) => {
    const newCoupon: Coupon = {
      ...couponData,
      id: `cp-${Date.now()}`,
      code: couponData.code.toUpperCase().trim(),
    };
    const updated = [newCoupon, ...coupons];
    saveCoupons(updated);
    couponService.addCoupon(newCoupon);
    showToast(`Coupon ${newCoupon.code} added successfully!`, "success");
  };

  const removeCoupon = (couponId: string) => {
    const target = coupons.find((c) => c.id === couponId);
    if (target?.isDefault) {
      showToast("Default coupon cannot be deleted.", "warning");
      return;
    }
    const updated = coupons.filter((c) => c.id !== couponId);
    saveCoupons(updated);
    if (appliedCoupon?.id === couponId) {
      setAppliedCoupon(null);
    }
    couponService.removeCoupon(couponId);
    showToast(`Coupon removed.`, "info");
  };

  const toggleCouponStatus = (couponId: string) => {
    let targetState = false;
    const updated = coupons.map((c) => {
      if (c.id === couponId) {
        targetState = !c.isActive;
        return { ...c, isActive: targetState };
      }
      return c;
    });
    saveCoupons(updated);
    couponService.toggleCouponStatus(couponId, targetState);
    showToast("Coupon status updated", "info");
  };

  const applyCoupon = (code: string): { success: boolean; message: string } => {
    const clean = code.trim().toUpperCase();
    const found = coupons.find((c) => c.code.toUpperCase() === clean && c.isActive);

    if (!found) {
      showToast("Invalid or inactive coupon code", "warning");
      return { success: false, message: "Invalid or inactive coupon code" };
    }

    if (cartSubtotal < found.minOrderAmount) {
      const msg = `Minimum order of ₹${found.minOrderAmount} required for ${found.code}`;
      showToast(msg, "warning");
      return {
        success: false,
        message: msg,
      };
    }

    setAppliedCoupon(found);
    showToast(`Coupon ${found.code} applied successfully!`, "success");
    return {
      success: true,
      message: `Coupon ${found.code} applied!`,
    };
  };

  const removeAppliedCoupon = () => {
    setAppliedCoupon(null);
    showToast("Coupon removed", "info");
  };

  // Coupon discount calculation
  const couponDiscount = useMemo(() => {
    if (!appliedCoupon || cartSubtotal === 0) return 0;
    if (cartSubtotal < appliedCoupon.minOrderAmount) return 0;

    if (appliedCoupon.discountType === "flat") {
      return Math.min(appliedCoupon.discountValue, cartSubtotal);
    }
    if (appliedCoupon.discountType === "percentage") {
      const disc = Math.round(cartSubtotal * (appliedCoupon.discountValue / 100));
      return appliedCoupon.maxDiscount ? Math.min(disc, appliedCoupon.maxDiscount) : disc;
    }
    return 0;
  }, [appliedCoupon, cartSubtotal]);

  // Packaging charges: flat ₹7 when cart has items (replaces tax/gst per requirement)
  const packagingCharge = cartSubtotal > 0 ? 7 : 0;
  const tax = 0;

  // Delivery fee calculation
  // Free delivery applies automatically for orders at or above freeDeliveryThreshold (configurable by admin).
  const deliveryFee = useMemo(() => {
    if (cartSubtotal === 0 || deliveryType === "Pickup") return 0;

    if (
      cartSubtotal >= freeDeliveryThreshold ||
      (appliedCoupon &&
        appliedCoupon.discountType === "free_delivery" &&
        cartSubtotal >= appliedCoupon.minOrderAmount)
    ) {
      return 0;
    }

    return baseDeliveryCharge;
  }, [cartSubtotal, deliveryType, freeDeliveryThreshold, appliedCoupon, baseDeliveryCharge]);

  const grandTotal =
    cartSubtotal > 0
      ? Math.max(0, cartSubtotal - couponDiscount) + packagingCharge + deliveryFee
      : 0;

  // Filtered orders belonging ONLY to currently active logged-in customer
  const userOrders = useMemo(() => {
    if (!user.isLoggedIn || !user.phone) {
      return [];
    }
    const cleanUserPhone = user.phone.replace(/\D/g, "");
    if (!cleanUserPhone) return [];
    return orders.filter((o) => {
      const cleanOPhone = o.customerPhone.replace(/\D/g, "");
      return cleanOPhone.endsWith(cleanUserPhone) || cleanUserPhone.endsWith(cleanOPhone);
    });
  }, [orders, user.isLoggedIn, user.phone]);

  // Order placement
  const placeOrder = (details: {
    customerName: string;
    customerPhone: string;
    address?: OrderAddress;
    paymentMethod: "Cash on Delivery (COD)" | "Online UPI / Cards";
    whatsAppOptIn: boolean;
  }): Order => {
    const newOrderId = `ORD-${Math.floor(1000 + Math.random() * 9000)}`;
    const nowTime = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    const newOrder: Order = {
      id: newOrderId,
      createdAt: "Just now",
      createdTimestamp: Date.now(),
      date: new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }),
      customerName: details.customerName,
      customerPhone: details.customerPhone,
      orderType: deliveryType,
      items: cart.map((ci) => ({
        itemId: ci.item.id,
        name: ci.item.name,
        price: ci.item.price,
        quantity: ci.quantity,
        dietary: ci.item.dietary,
      })),
      subtotal: cartSubtotal,
      packagingCharge,
      tax: 0,
      deliveryFee,
      total: grandTotal,
      status: "Order Received",
      cookingNotes: cookingNotes.trim() || undefined,
      address: deliveryType === "Delivery" ? details.address : undefined,
      paymentMethod: details.paymentMethod,
      paymentStatus: details.paymentMethod === "Online UPI / Cards" ? "Paid" : "Pending",
      whatsAppNotificationStatus: details.whatsAppOptIn ? "Delivered" : "Sent",
      whatsAppOptIn: details.whatsAppOptIn,
      whatsAppSentTimestamp: nowTime,
    };

    setOrders((prev) => [newOrder, ...prev]);

    // Asynchronously sync to Backend
    orderService.createOrder(newOrder);
    clearCart();
    setCookingNotes("");
    setAppliedCoupon(null);
    setActiveOrderId(newOrderId);
    try {
      localStorage.setItem("lebistro_active_order_id", newOrderId);
    } catch {
      // storage unavailable
    }
    setSelectedTrackingOrderId(newOrderId);
    setIsCheckoutOpen(false);
    setIsCartOpen(false);
    setIsOrderHistoryOpen(false);
    showToast(`Order #${newOrderId} placed successfully!`, "success");

    return newOrder;
  };

  const updateOrderStatus = (
    orderId: string,
    newStatus: OrderStatus,
    rejectionReason?: string,
    silent: boolean = false
  ) => {
    let targetOrder = orders.find((o) => o.id === orderId);

    setOrders((prev) =>
      prev.map((order) => {
        if (order.id === orderId) {
          targetOrder = order;
          const updated: Order = { ...order, status: newStatus };
          if (newStatus === "Rejected") {
            updated.rejectionReason = rejectionReason || "out of stock";
          }
          // Record acceptance timestamp for FIFO priority in Confirmed Orders
          if (
            (newStatus === "Order Status" || newStatus === "Order Accepted" || newStatus === "Preparing") &&
            !order.acceptedTimestamp
          ) {
            updated.acceptedTimestamp = Date.now();
          }
          // Record dispatch timestamp for FIFO priority in On Road Orders
          if (
            (newStatus === "In the Road" || newStatus === "Out for Delivery") &&
            !order.inRoadTimestamp
          ) {
            updated.inRoadTimestamp = Date.now();
          }
          // If advancing status and rider is assigned
          if ((newStatus === "In the Road" || newStatus === "Out for Delivery") && !order.riderId) {
            updated.riderId = "rider-1";
          }
          return updated;
        }
        return order;
      })
    );

    // Asynchronously update status in Backend
    orderService.updateOrderStatus(orderId, newStatus, rejectionReason);
    if (newStatus === "Delivered" || newStatus === "Rejected") {
      setActiveOrderId((curr) => (curr === orderId ? null : curr));
      try {
        localStorage.removeItem("lebistro_active_order_id");
      } catch {}
    }

    // Trigger Notification for 1. Confirmed & Preparing OR Rejection with reason
    if (targetOrder) {
      const cleanPhone = ((targetOrder as Order).customerPhone || "").replace(/\D/g, "");
      if (cleanPhone) {
        if (newStatus === "Order Accepted" || newStatus === "Preparing") {
          sendBrowserNotification(`🍳 Order #${(targetOrder as Order).id} Confirmed!`, {
            body: "Your order is confirmed and hot dishes are being prepared in the kitchen.",
          });
          fetch("/api/notifications/send", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              phone: cleanPhone,
              orderId: (targetOrder as Order).id,
              type: "CONFIRMED_PREPARING",
            }),
          }).catch((e) => console.error("Notification alert for confirmed order failed:", e));
        } else if (newStatus === "Rejected") {
          sendBrowserNotification(`❌ Order #${(targetOrder as Order).id} Rejected`, {
            body: `Order rejected due to: ${rejectionReason || "out of stock"}`,
          });
          fetch("/api/notifications/send", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              phone: cleanPhone,
              orderId: (targetOrder as Order).id,
              type: "REJECTED",
              rejectionReason: rejectionReason || "out of stock",
            }),
          }).catch((e) => console.error("Notification alert for rejected order failed:", e));
        }
      }
    }

    if (!silent) {
      if (newStatus === "Rejected") {
        showToast(`Order #${orderId} rejected: ${rejectionReason || "out of stock"}`, "warning");
      } else {
        showToast(`Order #${orderId} marked as ${newStatus}`, "info");
      }
    }
  };

  const addRider = (newRider: { name: string; phone: string; vehicle?: string }): Rider => {
    const rawPhone = newRider.phone.trim();
    const cleanDigits = rawPhone.replace(/\D/g, "");
    const last10 = cleanDigits.slice(-10);
    const formattedPhone = `+91 ${last10}`;

    const rider: Rider = {
      id: `rider-${Date.now()}`,
      name: newRider.name.trim(),
      phone: formattedPhone,
      vehicle: (newRider.vehicle || "Motorcycle / Scooter").trim(),
      rating: 5.0,
      activeOrders: 0,
    };

    setRiders((prev) => {
      // Prevent duplicate phone numbers
      const filtered = prev.filter(
        (r) => r.phone.replace(/\D/g, "").slice(-10) !== last10
      );
      const updated = [...filtered, rider];
      try {
        localStorage.setItem("lebistro_riders", JSON.stringify(updated));
      } catch {}
      settingsService.updateRiders(updated);
      return updated;
    });

    showToast(`Driver ${rider.name} verified & added to fleet!`, "success");
    return rider;
  };

  const removeRider = (riderId: string) => {
    setRiders((prev) => {
      const updated = prev.filter((r) => r.id !== riderId);
      try {
        localStorage.setItem("lebistro_riders", JSON.stringify(updated));
      } catch {}
      settingsService.updateRiders(updated);
      return updated;
    });
    showToast("Driver removed from fleet", "info");
  };

  const assignRider = (orderId: string, riderId: string, silent: boolean = false) => {
    const rider = riders.find((r) => r.id === riderId);
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, riderId } : o))
    );
    if (rider && !silent) {
      showToast(`Assigned ${rider.name} to order #${orderId}`, "info");
    }

    // Asynchronously update assigned rider in Backend
    orderService.assignRider(orderId, riderId);
  };

  const sendRiderWhatsApp = (orderId: string) => {
    const order = orders.find((o) => o.id === orderId);
    if (!order) return;
    const rider = riders.find((r) => r.id === order.riderId);
    const riderName = rider ? rider.name : "Rider";

    const deliveryAddress = order.address
      ? `${order.address.house ? `${order.address.house}, ` : ""}${order.address.street || ""}${
          order.address.landmark ? `, Near ${order.address.landmark}` : ""
        }`.trim()
      : "Greater Noida";

    // 1. Notify Customer: "Your order is out for delivery - Order ID: #[id] - Amount: ₹[amount]"
    const cleanCustomerPhone = (order.customerPhone || "").replace(/\D/g, "");
    if (cleanCustomerPhone) {
      sendBrowserNotification(`🛵 Order #${order.id} Out for Delivery!`, {
        body: `Your food is on the way with driver ${riderName}. Amount: ₹${order.total}`,
      });
      fetch("/api/notifications/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: cleanCustomerPhone,
          orderId: order.id,
          type: "OUT_FOR_DELIVERY",
          amount: order.total,
          riderName: rider?.name,
          riderPhone: rider?.phone,
        }),
      }).catch((e) => console.error("Dispatch alert to customer failed:", e));
    }

    // 2. Notify Driver: "Pending delivery - Location: [location] - Order No: #[id] - Name: [name] - Amount: ₹[amount]"
    const cleanRiderPhone = (rider?.phone || "").replace(/\D/g, "");
    if (cleanRiderPhone) {
      sendBrowserNotification(`📋 Delivery Task for ${riderName}!`, {
        body: `Order #${order.id} at ${deliveryAddress} - Collect COD: ₹${order.total}`,
      });
      fetch("/api/notifications/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: cleanRiderPhone,
          orderId: order.id,
          type: "DRIVER_TASK",
          customerName: order.customerName,
          location: deliveryAddress,
          amount: order.total,
        }),
      }).catch((e) => console.error("Dispatch alert to driver failed:", e));
    }

    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              whatsAppNotificationStatus: "Delivered",
              whatsAppSentTimestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            }
          : o
      )
    );
    showToast(`Dispatch notifications sent: Customer & Driver ${riderName} alerted for Order #${orderId}!`, "success");
  };

  const retryWhatsApp = (orderId: string) => {
    sendRiderWhatsApp(orderId);
  };

  // Menu items manager
  const toggleAvailability = (itemId: string) => {
    setMenuItems((prev) => {
      const target = prev.find((item) => item.id === itemId);
      if (!target) return prev;

      const baseName = target.name.replace(/\s*\([^)]+\)/i, "").trim();
      const updatedState = !target.isAvailable;

      // Find all matching items (both small/large and steam/fried)
      const matchingItems = prev.filter((item) => {
        const itemBase = item.name.replace(/\s*\([^)]+\)/i, "").trim();
        return item.id === itemId || (itemBase === baseName && item.category === target.category);
      });

      // Update in Supabase backend for all variants
      matchingItems.forEach((mItem) => {
        menuService.toggleAvailability(mItem.id, updatedState);
      });

      showToast(
        `${baseName} is now ${updatedState ? "In Stock" : "Out of Stock"}`,
        updatedState ? "success" : "warning"
      );

      const matchingIds = matchingItems.map((m) => m.id);
      const updated = prev.map((item) =>
        matchingIds.includes(item.id) ? { ...item, isAvailable: updatedState } : item
      );

      try {
        localStorage.setItem("lebistro_menu", JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const updateItemPrice = (itemId: string, newPrice: number) => {
    setMenuItems((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, price: newPrice } : item))
    );
    menuService.updateItemPrice(itemId, newPrice);
    showToast(`Price updated to ₹${newPrice}`, "info");
  };

  const updateItemDetails = (updatedItem: MenuItem) => {
    setMenuItems((prev) => {
      const target = prev.find((item) => item.id === updatedItem.id);
      if (!target) return prev;

      const baseName = target.name.replace(/\s*\([^)]+\)/i, "").trim();
      const isMultiSize = Boolean(target.name.match(/\(([^)]+)\)/));

      if (isMultiSize) {
        const cleanUpdatedName = updatedItem.name.replace(/\s*\([^)]+\)/i, "").trim();
        const updated = prev.map((item) => {
          const itemBase = item.name.replace(/\s*\([^)]+\)/i, "").trim();
          if (itemBase === baseName && item.category === target.category) {
            const sizeSuffixMatch = item.name.match(/\(([^)]+)\)/);
            const sizeSuffix = sizeSuffixMatch ? ` (${sizeSuffixMatch[1]})` : "";
            const syncedItem: MenuItem = {
              ...item,
              name: `${cleanUpdatedName}${sizeSuffix}`,
              category: updatedItem.category,
              description: updatedItem.description,
              dietary: updatedItem.dietary,
              tag: updatedItem.tag,
              image: updatedItem.image,
              preparationTime: updatedItem.preparationTime,
              price: item.id === updatedItem.id ? updatedItem.price : item.price,
            };
            menuService.updateItemDetails(syncedItem);
            return syncedItem;
          }
          return item;
        });

        try {
          localStorage.setItem("lebistro_menu", JSON.stringify(updated));
        } catch {}

        showToast(`Dish details updated for ${cleanUpdatedName}`, "success");
        return updated;
      }

      menuService.updateItemDetails(updatedItem);
      showToast(`Dish details updated for ${updatedItem.name}`, "success");
      const updated = prev.map((item) => (item.id === updatedItem.id ? updatedItem : item));
      try {
        localStorage.setItem("lebistro_menu", JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  // User-specific saved locations management
  useEffect(() => {
    if (user.isLoggedIn && user.phone) {
      const cleanPhone = user.phone.replace(/\D/g, "");
      const stored = localStorage.getItem(`lebistro_saved_locations_${cleanPhone}`);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            setSavedLocations(parsed);
            if (parsed.length > 0 && !locationAddress) {
              setLocationLabel(parsed[0].label);
              setLocationAddress(parsed[0].address);
            }
          }
        } catch {}
      }
    } else {
      setSavedLocations([]);
      setLocationAddress("");
      setLocationLabel("");
    }
  }, [user.isLoggedIn, user.phone]);

  useEffect(() => {
    if (user.isLoggedIn && user.phone) {
      const cleanPhone = user.phone.replace(/\D/g, "");
      try {
        localStorage.setItem(`lebistro_saved_locations_${cleanPhone}`, JSON.stringify(savedLocations));
      } catch {}
    }
  }, [savedLocations, user.isLoggedIn, user.phone]);

  const addSavedLocation = ({
    label,
    address,
    detail,
    house,
    street,
    landmark,
    lat,
    lng,
    accuracy,
  }: {
    label: string;
    address: string;
    detail?: string;
    house?: string;
    street?: string;
    landmark?: string;
    lat?: number;
    lng?: number;
    accuracy?: number;
  }) => {
    const cleanLabel = (label.trim() || "OTHER").toUpperCase();
    const cleanAddress = address.trim();
    const cleanDetail = detail?.trim() || "";
    const cleanHouse = (house?.trim() || cleanDetail).trim();
    const cleanStreet = (street?.trim() || cleanAddress).trim();
    const cleanLandmark = landmark?.trim() || "";
    const cleanLat = lat ?? 28.4744;
    const cleanLng = lng ?? 77.4917;
    const cleanAccuracy = accuracy ?? 10;

    const newLoc: SavedLocation = {
      id: `loc-${Date.now()}`,
      label: cleanLabel,
      address: cleanAddress,
      detail: cleanDetail,
      house: cleanHouse,
      street: cleanStreet,
      landmark: cleanLandmark,
      lat: cleanLat,
      lng: cleanLng,
      accuracy: cleanAccuracy,
    };

    setSavedLocations((prev) => {
      const filtered = prev.filter(
        (l) => l.address.toLowerCase() !== cleanAddress.toLowerCase()
      );
      const updated = [newLoc, ...filtered];
      if (user.phone) {
        const cleanPhone = user.phone.replace(/\D/g, "");
        try {
          localStorage.setItem(`lebistro_saved_locations_${cleanPhone}`, JSON.stringify(updated));
        } catch {}
      }
      return updated;
    });

    setLocationLabel(cleanLabel);
    setLocationAddress(cleanAddress);

    setUser((prev) => {
      const updatedUser: UserProfile = {
        ...prev,
        defaultAddress: {
          house: cleanHouse,
          street: cleanStreet,
          landmark: cleanLandmark,
          lat: cleanLat,
          lng: cleanLng,
          accuracy: cleanAccuracy,
        },
      };
      try {
        localStorage.setItem("lebistro_user", JSON.stringify(updatedUser));
      } catch {}
      return updatedUser;
    });
  };

  const removeSavedLocation = (id: string) => {
    setSavedLocations((prev) => prev.filter((l) => l.id !== id));
  };

  // User auth
  const loginWithPhone = (phone: string, name?: string) => {
    const cleanPhone = phone.replace(/\D/g, "");

    // 0. Check and load user's saved locations immediately
    let userLocations: SavedLocation[] = [];
    try {
      const storedLocs = localStorage.getItem(`lebistro_saved_locations_${cleanPhone}`);
      if (storedLocs) {
        userLocations = JSON.parse(storedLocs);
      }
    } catch {}

    const firstLoc = userLocations[0];
    const defaultAddr: OrderAddress | undefined = firstLoc
      ? {
          house: firstLoc.house || firstLoc.detail || "",
          street: firstLoc.street || firstLoc.address,
          landmark: firstLoc.landmark || "",
          lat: firstLoc.lat || 28.4744,
          lng: firstLoc.lng || 77.4917,
          accuracy: firstLoc.accuracy || 10,
        }
      : user.defaultAddress;

    const resolvedName =
      (name && name !== "Gourmet Member" ? name.trim() : "") ||
      (user.name && user.name !== "Gourmet Member" ? user.name.trim() : "");

    const loggedInUser: UserProfile = {
      name: resolvedName,
      phone: phone,
      isLoggedIn: true,
      defaultAddress: defaultAddr,
    };
    setUser(loggedInUser);
    try {
      localStorage.setItem("lebistro_user", JSON.stringify(loggedInUser));
    } catch {}

    if (userLocations.length > 0) {
      setSavedLocations(userLocations);
      setLocationLabel(userLocations[0].label);
      setLocationAddress(userLocations[0].address);
    }

    // 1. Restore this specific user's saved cart from localStorage if exists
    try {
      const savedUserCart = localStorage.getItem(`lebistro_cart_${cleanPhone}`);
      if (savedUserCart) {
        const parsed = JSON.parse(savedUserCart);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setCart(parsed);
        }
      }
    } catch {}

    // 2. Restore active order for this specific user
    const userActive = orders.find((o) => {
      const cleanOPhone = o.customerPhone.replace(/\D/g, "");
      return (
        (cleanOPhone.endsWith(cleanPhone) || cleanPhone.endsWith(cleanOPhone)) &&
        o.status !== "Delivered" &&
        o.status !== "Rejected"
      );
    });

    if (userActive) {
      setActiveOrderId(userActive.id);
      try {
        localStorage.setItem("lebistro_active_order_id", userActive.id);
      } catch {}
    } else {
      setActiveOrderId(null);
      try {
        localStorage.removeItem("lebistro_active_order_id");
      } catch {}
    }

    showToast(`Logged in successfully with +91 ${phone}!`, "success");
  };

  const logout = () => {
    // 1. Save user's current cart under their phone key before logout
    if (user.phone) {
      const cleanPhone = user.phone.replace(/\D/g, "");
      if (cleanPhone) {
        try {
          localStorage.setItem(`lebistro_cart_${cleanPhone}`, JSON.stringify(cart));
        } catch {}
      }
    }

    // 2. Clear user profile
    setUser({
      name: "",
      phone: "",
      isLoggedIn: false,
      defaultAddress: undefined,
    });

    // 3. Clear cart and active order tracking for the logged-out state
    setCart([]);
    setAppliedCoupon(null);
    setCookingNotes("");
    setActiveOrderId(null);
    setSelectedTrackingOrderId(null);
    setSavedLocations([]);
    setLocationAddress("");
    setLocationLabel("");

    // 4. Remove active session storage keys
    try {
      localStorage.removeItem("lebistro_user");
      localStorage.removeItem("lebistro_cart");
      localStorage.removeItem("lebistro_active_order_id");
    } catch {}

    showToast("Logged out successfully", "info");
  };

  return (
    <KitchenContext.Provider
      value={{
        menuItems,
        selectedCategory,
        setSelectedCategory,
        toggleAvailability,
        updateItemPrice,
        updateItemDetails,
        cart,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        cartCount,
        cartSubtotal,
        deliveryType,
        setDeliveryType,
        cookingNotes,
        setCookingNotes,
        deliveryFee,
        tax,
        packagingCharge,
        grandTotal,
        baseDeliveryCharge,
        updateBaseDeliveryCharge,
        freeDeliveryThreshold,
        updateFreeDeliveryThreshold,
        coupons,
        addCoupon,
        removeCoupon,
        toggleCouponStatus,
        appliedCoupon,
        applyCoupon,
        removeAppliedCoupon,
        couponDiscount,
        orders,
        userOrders,
        placeOrder,
        updateOrderStatus,
        assignRider,
        sendRiderWhatsApp,
        retryWhatsApp,
        riders,
        addRider,
        removeRider,
        user,
        loginWithPhone,
        logout,
        isCartOpen,
        setIsCartOpen,
        isAuthOpen,
        setIsAuthOpen,
        isCheckoutOpen,
        setIsCheckoutOpen,
        isOrderHistoryOpen,
        setIsOrderHistoryOpen,
        selectedTrackingOrderId,
        setSelectedTrackingOrderId,
        activeOrderId,
        setActiveOrderId,
        isLocationModalOpen,
        setIsLocationModalOpen,
        isMapPickerOpen,
        setIsMapPickerOpen,
        openMapPicker,
        mapPickerCallback,
        searchQuery,
        setSearchQuery,
        isVegOnly,
        setIsVegOnly,
        locationLabel,
        setLocationLabel,
        locationAddress,
        setLocationAddress,
        savedLocations,
        addSavedLocation,
        removeSavedLocation,
        isStoreOpen,
        setIsStoreOpen,
        toggleStoreOpen,
        adminOrderSearch,
        setAdminOrderSearch,
        toasts,
        showToast,
      }}
    >
      {children}
    </KitchenContext.Provider>
  );
}

export function useKitchen() {
  const context = useContext(KitchenContext);
  if (!context) {
    throw new Error("useKitchen must be used within a KitchenProvider");
  }
  return context;
}
