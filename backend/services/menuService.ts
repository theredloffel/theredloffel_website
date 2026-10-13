import { supabase } from "../client";
import { mapDbMenuItemToFrontend, mapFrontendMenuItemToDb } from "../mappers";
import { MenuItem } from "@/types";

export const menuService = {
  /**
   * Fetch all menu items from Supabase
   */
  async fetchMenuItems(): Promise<{ items: MenuItem[]; error: string | null }> {
    try {
      const { data, error } = await supabase.from("menu_items").select("*");
      if (error) return { items: [], error: error.message };
      return { items: (data || []).map(mapDbMenuItemToFrontend), error: null };
    } catch (err: any) {
      return { items: [], error: err.message || "Failed to fetch menu items" };
    }
  },

  /**
   * Update item price
   */
  async updateItemPrice(itemId: string, newPrice: number): Promise<{ success: boolean; error: string | null }> {
    try {
      const { error } = await supabase
        .from("menu_items")
        .update({ price: newPrice })
        .eq("id", itemId);
      if (error) return { success: false, error: error.message };
      return { success: true, error: null };
    } catch (err: any) {
      return { success: false, error: err.message || "Failed to update item price" };
    }
  },

  /**
   * Toggle item availability
   */
  async toggleAvailability(itemId: string, isAvailable: boolean): Promise<{ success: boolean; error: string | null }> {
    try {
      const { error } = await supabase
        .from("menu_items")
        .update({ is_available: isAvailable })
        .eq("id", itemId);
      if (error) return { success: false, error: error.message };
      return { success: true, error: null };
    } catch (err: any) {
      return { success: false, error: err.message || "Failed to toggle availability" };
    }
  },

  /**
   * Update full item details
   */
  async updateItemDetails(item: MenuItem): Promise<{ success: boolean; error: string | null }> {
    try {
      const row = mapFrontendMenuItemToDb(item);
      const { error } = await supabase.from("menu_items").upsert(row);
      if (error) return { success: false, error: error.message };
      return { success: true, error: null };
    } catch (err: any) {
      return { success: false, error: err.message || "Failed to update item details" };
    }
  },

  /**
   * Realtime subscription for menu changes
   */
  subscribeToMenu(callbacks: {
    onChange?: () => void;
  }) {
    const channel = supabase
      .channel("backend-menu-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "menu_items" }, () => {
        if (callbacks.onChange) callbacks.onChange();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  },
};
