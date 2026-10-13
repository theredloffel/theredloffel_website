import { supabase } from "../client";
import { mapDbCouponToFrontend, mapFrontendCouponToDb } from "../mappers";
import { Coupon } from "@/types";

export const couponService = {
  /**
   * Fetch all promotional coupons from Supabase
   */
  async fetchCoupons(): Promise<{ coupons: Coupon[]; error: string | null }> {
    try {
      const { data, error } = await supabase.from("coupons").select("*");
      if (error) return { coupons: [], error: error.message };
      return { coupons: (data || []).map(mapDbCouponToFrontend), error: null };
    } catch (err: any) {
      return { coupons: [], error: err.message || "Failed to fetch coupons" };
    }
  },

  /**
   * Add a new promotional coupon
   */
  async addCoupon(coupon: Coupon): Promise<{ success: boolean; error: string | null }> {
    try {
      const row = mapFrontendCouponToDb(coupon);
      const { error } = await supabase.from("coupons").insert(row);
      if (error) return { success: false, error: error.message };
      return { success: true, error: null };
    } catch (err: any) {
      return { success: false, error: err.message || "Failed to add coupon" };
    }
  },

  /**
   * Remove a coupon
   */
  async removeCoupon(couponId: string): Promise<{ success: boolean; error: string | null }> {
    try {
      const { error } = await supabase.from("coupons").delete().eq("id", couponId);
      if (error) return { success: false, error: error.message };
      return { success: true, error: null };
    } catch (err: any) {
      return { success: false, error: err.message || "Failed to remove coupon" };
    }
  },

  /**
   * Toggle coupon active state
   */
  async toggleCouponStatus(couponId: string, isActive: boolean): Promise<{ success: boolean; error: string | null }> {
    try {
      const { error } = await supabase
        .from("coupons")
        .update({ is_active: isActive })
        .eq("id", couponId);
      if (error) return { success: false, error: error.message };
      return { success: true, error: null };
    } catch (err: any) {
      return { success: false, error: err.message || "Failed to toggle coupon status" };
    }
  },

  /**
   * Realtime subscription for coupons
   */
  subscribeToCoupons(callbacks: { onChange?: () => void }) {
    const channel = supabase
      .channel("backend-coupons-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "coupons" }, () => {
        if (callbacks.onChange) callbacks.onChange();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  },
};
