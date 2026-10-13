import { supabase } from "../client";
import { mapDbOrderToFrontend, mapFrontendOrderToDb } from "../mappers";
import { Order, OrderStatus } from "@/types";

export const orderService = {
  /**
   * Fetch all orders from Supabase ordered by creation time
   */
  async fetchOrders(): Promise<{ orders: Order[]; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .order("created_timestamp", { ascending: false });

      if (error) {
        return { orders: [], error: error.message };
      }

      const orders = (data || []).map(mapDbOrderToFrontend);
      return { orders, error: null };
    } catch (err: any) {
      return { orders: [], error: err.message || "Unknown error fetching orders" };
    }
  },

  /**
   * Insert a newly placed order into Supabase
   */
  async createOrder(order: Order): Promise<{ success: boolean; error: string | null }> {
    try {
      const row = mapFrontendOrderToDb(order);
      const { error } = await supabase.from("orders").insert(row);
      if (error) return { success: false, error: error.message };
      return { success: true, error: null };
    } catch (err: any) {
      return { success: false, error: err.message || "Failed to create order" };
    }
  },

  /**
   * Update the status of an existing order
   */
  async updateOrderStatus(
    orderId: string,
    newStatus: OrderStatus,
    rejectionReason?: string
  ): Promise<{ success: boolean; error: string | null }> {
    try {
      const updates: any = {
        status: newStatus,
      };

      if (rejectionReason) {
        updates.rejection_reason = rejectionReason;
      }

      if (newStatus === "Order Status" || newStatus === "Order Accepted" || newStatus === "Preparing") {
        updates.accepted_timestamp = Date.now();
      }

      if (newStatus === "In the Road" || newStatus === "Out for Delivery") {
        updates.in_road_timestamp = Date.now();
      }

      const { error } = await supabase.from("orders").update(updates).eq("id", orderId);
      if (error) return { success: false, error: error.message };
      return { success: true, error: null };
    } catch (err: any) {
      return { success: false, error: err.message || "Failed to update order status" };
    }
  },

  /**
   * Assign a delivery rider to an order
   */
  async assignRider(
    orderId: string,
    riderId: string
  ): Promise<{ success: boolean; error: string | null }> {
    try {
      const { error } = await supabase.from("orders").update({ rider_id: riderId }).eq("id", orderId);
      if (error) return { success: false, error: error.message };
      return { success: true, error: null };
    } catch (err: any) {
      return { success: false, error: err.message || "Failed to assign rider" };
    }
  },

  /**
   * Subscribe to real-time order updates via Supabase WebSockets
   */
  subscribeToOrders(callbacks: {
    onInsert?: (order: Order) => void;
    onUpdate?: (order: Order) => void;
    onDelete?: (orderId: string) => void;
  }) {
    const channel = supabase
      .channel("backend-orders-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders" },
        (payload) => {
          if (payload.eventType === "INSERT" && callbacks.onInsert) {
            callbacks.onInsert(mapDbOrderToFrontend(payload.new));
          } else if (payload.eventType === "UPDATE" && callbacks.onUpdate) {
            callbacks.onUpdate(mapDbOrderToFrontend(payload.new));
          } else if (payload.eventType === "DELETE" && callbacks.onDelete) {
            const deletedId = (payload.old as any)?.id;
            if (deletedId) callbacks.onDelete(deletedId);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  },
};
