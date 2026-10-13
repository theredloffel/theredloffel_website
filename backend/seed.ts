import { createClient } from "@supabase/supabase-js";
import { INITIAL_MENU_ITEMS, INITIAL_COUPONS, INITIAL_ORDERS } from "../src/data/mockData";
import { mapFrontendOrderToDb } from "./mappers";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

const supabase = createClient(supabaseUrl, supabaseKey);

async function seed() {
  console.log("Seeding Supabase database...");

  // 1. Seed Menu Items
  const { data: existingMenu } = await supabase.from("menu_items").select("id").limit(1);
  if (!existingMenu || existingMenu.length === 0) {
    const formattedMenu = INITIAL_MENU_ITEMS.map((item) => ({
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
    }));

    const { error: menuErr } = await supabase.from("menu_items").insert(formattedMenu);
    if (menuErr) console.error("Error seeding menu:", menuErr);
    else console.log(`✓ Seeded ${formattedMenu.length} menu items.`);
  } else {
    console.log("Menu items already present. Skipping.");
  }

  // 2. Seed Coupons
  const { data: existingCoupons } = await supabase.from("coupons").select("id").limit(1);
  if (!existingCoupons || existingCoupons.length === 0) {
    const formattedCoupons = INITIAL_COUPONS.map((cp) => ({
      id: cp.id,
      code: cp.code,
      title: cp.title,
      description: cp.description,
      discount_type: cp.discountType,
      discount_value: cp.discountValue,
      min_order_amount: cp.minOrderAmount,
      max_discount: cp.maxDiscount || null,
      is_active: cp.isActive,
      is_default: Boolean(cp.isDefault),
    }));

    const { error: cpErr } = await supabase.from("coupons").insert(formattedCoupons);
    if (cpErr) console.error("Error seeding coupons:", cpErr);
    else console.log(`✓ Seeded ${formattedCoupons.length} coupons.`);
  } else {
    console.log("Coupons already present. Skipping.");
  }

  // 3. Seed Initial Orders
  const { data: existingOrders } = await supabase.from("orders").select("id").limit(1);
  if (!existingOrders || existingOrders.length === 0) {
    const formattedOrders = INITIAL_ORDERS.map(mapFrontendOrderToDb);
    const { error: orderErr } = await supabase.from("orders").insert(formattedOrders);
    if (orderErr) console.error("Error seeding orders:", orderErr);
    else console.log(`✓ Seeded ${formattedOrders.length} initial orders.`);
  } else {
    console.log("Orders already present. Skipping.");
  }

  // 4. Ensure Settings are present
  await supabase.from("store_settings").upsert([
    { key: "base_delivery_charge", value: 35 },
    { key: "is_store_open", value: true },
  ]);
  console.log("✓ Store settings verified.");

  console.log("Database seed complete!");
}

seed().catch(console.error);
