"use client";

import React, { createContext, useContext, useState, useEffect, useMemo } from "react";
import { MenuItem, CartItem, Order, OrderStatus, Rider, UserProfile, OrderAddress, WhatsAppStatus, Category, SavedLocation } from "@/types";
import { INITIAL_MENU_ITEMS, INITIAL_ORDERS, RIDERS } from "@/data/mockData";

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
  grandTotal: number;

  // Orders
  orders: Order[];
  placeOrder: (details: {
    customerName: string;
    customerPhone: string;
    address?: OrderAddress;
    paymentMethod: "Cash on Delivery (COD)" | "Online UPI / Cards";
    whatsAppOptIn: boolean;
  }) => Order;
  updateOrderStatus: (orderId: string, newStatus: OrderStatus) => void;
  assignRider: (orderId: string, riderId: string) => void;
  sendRiderWhatsApp: (orderId: string) => void;
  retryWhatsApp: (orderId: string) => void;

  // Riders
  riders: Rider[];

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
  isLocationModalOpen: boolean;
  setIsLocationModalOpen: (open: boolean) => void;
  isMapPickerOpen: boolean;
  setIsMapPickerOpen: (open: boolean) => void;
  openMapPicker: (callback?: (loc: { label: string; address: string; detail?: string }) => void) => void;
  mapPickerCallback: ((loc: { label: string; address: string; detail?: string }) => void) | null;

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
  addSavedLocation: (location: { label: string; address: string; detail?: string }) => void;
  removeSavedLocation: (id: string) => void;

  // Notifications
  toasts: ToastMessage[];
  showToast: (message: string, type?: "success" | "info" | "warning") => void;
}

const KitchenContext = createContext<KitchenContextType | undefined>(undefined);

export function KitchenProvider({ children }: { children: React.ReactNode }) {
  const [menuItems, setMenuItems] = useState<MenuItem[]>(INITIAL_MENU_ITEMS);
  const [selectedCategory, setSelectedCategory] = useState<Category>("All");
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [riders, setRiders] = useState<Rider[]>(RIDERS);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [deliveryType, setDeliveryType] = useState<"Delivery" | "Pickup">("Delivery");
  const [cookingNotes, setCookingNotes] = useState<string>("");

  const [user, setUser] = useState<UserProfile>({
    name: "Aditya Roy",
    phone: "6297673521",
    isLoggedIn: true,
    defaultAddress: {
      house: "raghuma boys hostel block c",
      street: "near sharda university",
      landmark: "Knowledge Park III, Greater Noida",
      lat: 28.4744,
      lng: 77.504,
      accuracy: 10,
    },
  });

  // UI state
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isOrderHistoryOpen, setIsOrderHistoryOpen] = useState(false);
  const [selectedTrackingOrderId, setSelectedTrackingOrderId] = useState<string | null>(null);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [isMapPickerOpen, setIsMapPickerOpen] = useState(false);
  const [mapPickerCallback, setMapPickerCallback] = useState<((loc: { label: string; address: string; detail?: string }) => void) | null>(null);

  const openMapPicker = (callback?: (loc: { label: string; address: string; detail?: string }) => void) => {
    setMapPickerCallback(() => callback || null);
    setIsMapPickerOpen(true);
  };

  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Search & Veg filter
  const [searchQuery, setSearchQuery] = useState("");
  const [isVegOnly, setIsVegOnly] = useState(false);
  const [locationLabel, setLocationLabel] = useState("HOME");
  const [locationAddress, setLocationAddress] = useState("raghuma boys hostel block c, near sharda university, Knowledge Park III, Greater Noida");

  const [savedLocations, setSavedLocations] = useState<SavedLocation[]>([
    {
      id: "loc-1",
      label: "HOME",
      address: "raghuma boys hostel block c, near sharda university, Knowledge Park III, Greater Noida",
      detail: "raghuma boys hostel block c, near sharda university, Knowledge Park III, Greater Noida",
    },
    {
      id: "loc-2",
      label: "Sharda University",
      address: "sharda university, 2 Floor, vivekanand hostel, Sharda University, Knowledge Park III, Greater Noida",
      detail: "sharda university, 2 Floor, vivekanand hostel, Sharda University, Knowledge Park III, Greater Noida",
    },
    {
      id: "loc-3",
      label: "HOME",
      address: "Casaballa living, near vsk garden, Knowledge Park III, Greater Noida",
      detail: "Casaballa living, near vsk garden, Knowledge Park III, Greater Noida",
    },
  ]);

  // Load saved state from localStorage if available
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem("lebistro_user");
      if (savedUser) setUser(JSON.parse(savedUser));

      const savedCart = localStorage.getItem("lebistro_cart");
      if (savedCart) setCart(JSON.parse(savedCart));

      const savedOrders = localStorage.getItem("lebistro_orders");
      if (savedOrders) setOrders(JSON.parse(savedOrders));

      const savedMenu = localStorage.getItem("lebistro_menu");
      if (savedMenu) setMenuItems(JSON.parse(savedMenu));

      const storedLocations = localStorage.getItem("lebistro_saved_locations");
      if (storedLocations) setSavedLocations(JSON.parse(storedLocations));
    } catch {
      // Fallback to defaults
    }
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
    } catch {}
  }, [cart]);

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
  };

  const cartCount = useMemo(() => {
    return cart.reduce((acc, curr) => acc + curr.quantity, 0);
  }, [cart]);

  const cartSubtotal = useMemo(() => {
    return cart.reduce((acc, curr) => acc + curr.item.price * curr.quantity, 0);
  }, [cart]);

  const deliveryFee = deliveryType === "Delivery" ? 40 : 0;
  const tax = Math.round(cartSubtotal * 0.05 * 10) / 10;
  const grandTotal = cartSubtotal > 0 ? cartSubtotal + tax + deliveryFee : 0;

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
      tax,
      deliveryFee,
      total: grandTotal,
      status: "Pending",
      cookingNotes: cookingNotes.trim() || undefined,
      address: deliveryType === "Delivery" ? details.address : undefined,
      paymentMethod: details.paymentMethod,
      paymentStatus: details.paymentMethod === "Online UPI / Cards" ? "Paid" : "Pending",
      whatsAppNotificationStatus: details.whatsAppOptIn ? "Delivered" : "Sent",
      whatsAppOptIn: details.whatsAppOptIn,
      whatsAppSentTimestamp: nowTime,
    };

    setOrders((prev) => [newOrder, ...prev]);
    clearCart();
    setCookingNotes("");
    setSelectedTrackingOrderId(newOrderId);
    setIsCheckoutOpen(false);
    setIsCartOpen(false);
    setIsOrderHistoryOpen(true);
    showToast(`Order #${newOrderId} placed successfully!`, "success");

    return newOrder;
  };

  const updateOrderStatus = (orderId: string, newStatus: OrderStatus) => {
    setOrders((prev) =>
      prev.map((order) => {
        if (order.id === orderId) {
          const updated: Order = { ...order, status: newStatus };
          // If advancing status and rider is assigned
          if (newStatus === "Out for Delivery" && !order.riderId) {
            updated.riderId = "rider-1";
          }
          return updated;
        }
        return order;
      })
    );
    showToast(`Order #${orderId} marked as ${newStatus}`, "info");
  };

  const assignRider = (orderId: string, riderId: string) => {
    const rider = riders.find((r) => r.id === riderId);
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, riderId } : o))
    );
    if (rider) {
      showToast(`Assigned ${rider.name} to order #${orderId}`);
    }
  };

  const sendRiderWhatsApp = (orderId: string) => {
    const order = orders.find((o) => o.id === orderId);
    if (!order) return;
    const rider = riders.find((r) => r.id === order.riderId);
    const riderName = rider ? rider.name : "Rider";

    // Simulate WhatsApp dispatch
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
    showToast(`Dispatch summary shared with ${riderName} via WhatsApp!`, "success");
  };

  const retryWhatsApp = (orderId: string) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId ? { ...o, whatsAppNotificationStatus: "Delivered" } : o
      )
    );
    showToast(`WhatsApp message re-sent for order #${orderId}!`, "success");
  };

  // Menu items manager
  const toggleAvailability = (itemId: string) => {
    setMenuItems((prev) =>
      prev.map((item) => {
        if (item.id === itemId) {
          const updatedState = !item.isAvailable;
          showToast(
            `${item.name} is now ${updatedState ? "In Stock" : "Out of Stock"}`,
            updatedState ? "success" : "warning"
          );
          return { ...item, isAvailable: updatedState };
        }
        return item;
      })
    );
  };

  const updateItemPrice = (itemId: string, newPrice: number) => {
    setMenuItems((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, price: newPrice } : item))
    );
    showToast(`Price updated to ₹${newPrice}`, "info");
  };

  const updateItemDetails = (updatedItem: MenuItem) => {
    setMenuItems((prev) =>
      prev.map((item) => (item.id === updatedItem.id ? updatedItem : item))
    );
    showToast(`Dish details updated for ${updatedItem.name}`, "success");
  };

  // Location persistence
  useEffect(() => {
    try {
      localStorage.setItem("lebistro_saved_locations", JSON.stringify(savedLocations));
    } catch {}
  }, [savedLocations]);

  const addSavedLocation = ({ label, address, detail }: { label: string; address: string; detail?: string }) => {
    const cleanLabel = (label.trim() || "OTHER").toUpperCase();
    const cleanAddress = address.trim();
    const cleanDetail = detail?.trim() || "";

    const newLoc: SavedLocation = {
      id: `loc-${Date.now()}`,
      label: cleanLabel,
      address: cleanAddress,
      detail: cleanDetail,
    };

    setSavedLocations((prev) => {
      const filtered = prev.filter(
        (l) => l.address.toLowerCase() !== cleanAddress.toLowerCase()
      );
      return [newLoc, ...filtered];
    });

    setLocationLabel(cleanLabel);
    setLocationAddress(cleanAddress);
  };

  const removeSavedLocation = (id: string) => {
    setSavedLocations((prev) => prev.filter((l) => l.id !== id));
  };

  // User auth
  const loginWithPhone = (phone: string, name?: string) => {
    setUser({
      name: name || "Gourmet Member",
      phone: phone,
      isLoggedIn: true,
      defaultAddress: user.defaultAddress,
    });
    showToast(`Logged in successfully with +91 ${phone}!`, "success");
  };

  const logout = () => {
    setUser((prev) => ({ ...prev, isLoggedIn: false }));
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
        grandTotal,
        orders,
        placeOrder,
        updateOrderStatus,
        assignRider,
        sendRiderWhatsApp,
        retryWhatsApp,
        riders,
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
