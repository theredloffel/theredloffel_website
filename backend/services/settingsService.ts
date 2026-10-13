import { supabase } from "../client";
import { Rider } from "@/types";

export const settingsService = {
  /**
   * Fetch all store settings
   */
  async fetchSettings(): Promise<{
    baseDeliveryCharge?: number;
    isStoreOpen?: boolean;
    deliveryRiders?: Rider[];
    error: string | null;
  }> {
    try {
      const { data, error } = await supabase.from("store_settings").select("*");
      if (error) return { error: error.message };

      let baseDeliveryCharge: number | undefined;
      let isStoreOpen: boolean | undefined;
      let deliveryRiders: Rider[] | undefined;

      (data || []).forEach((row) => {
        if (row.key === "base_delivery_charge") {
          baseDeliveryCharge = Number(row.value);
        } else if (row.key === "is_store_open") {
          isStoreOpen = Boolean(row.value);
        } else if (row.key === "delivery_riders" && Array.isArray(row.value)) {
          deliveryRiders = row.value;
        }
      });

      return { baseDeliveryCharge, isStoreOpen, deliveryRiders, error: null };
    } catch (err: any) {
      return { error: err.message || "Failed to fetch settings" };
    }
  },

  /**
   * Update base delivery fee
   */
  async updateDeliveryCharge(fee: number): Promise<{ success: boolean; error: string | null }> {
    try {
      const { error } = await supabase
        .from("store_settings")
        .upsert({ key: "base_delivery_charge", value: fee });
      if (error) return { success: false, error: error.message };
      return { success: true, error: null };
    } catch (err: any) {
      return { success: false, error: err.message || "Failed to update delivery charge" };
    }
  },

  /**
   * Update store open/closed status
   */
  async updateStoreOpen(isOpen: boolean): Promise<{ success: boolean; error: string | null }> {
    try {
      const { error } = await supabase
        .from("store_settings")
        .upsert({ key: "is_store_open", value: isOpen });
      if (error) return { success: false, error: error.message };
      return { success: true, error: null };
    } catch (err: any) {
      return { success: false, error: err.message || "Failed to update store status" };
    }
  },

  /**
   * Update active delivery fleet riders
   */
  async updateRiders(riders: Rider[]): Promise<{ success: boolean; error: string | null }> {
    try {
      const { error } = await supabase
        .from("store_settings")
        .upsert({ key: "delivery_riders", value: riders });
      if (error) return { success: false, error: error.message };
      return { success: true, error: null };
    } catch (err: any) {
      return { success: false, error: err.message || "Failed to update fleet riders" };
    }
  },

  /**
   * Subscribe to settings changes
   */
  subscribeToSettings(callbacks: { onChange?: () => void }) {
    const channel = supabase
      .channel("backend-settings-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "store_settings" }, () => {
        if (callbacks.onChange) callbacks.onChange();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  },
};
