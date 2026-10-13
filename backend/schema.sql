-- ====================================================================
-- THE RED LÖFFEL - SUPABASE DATABASE INITIALIZATION SCRIPT
-- Run this script in your Supabase Dashboard: SQL Editor -> New query -> Run
-- ====================================================================

-- 1. ORDERS TABLE
CREATE TABLE IF NOT EXISTS public.orders (
    id TEXT PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_at_label TEXT,
    created_timestamp BIGINT NOT NULL,
    accepted_timestamp BIGINT,
    in_road_timestamp BIGINT,
    date TEXT,
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    order_type TEXT NOT NULL DEFAULT 'Delivery',
    items JSONB NOT NULL DEFAULT '[]'::jsonb,
    subtotal NUMERIC NOT NULL DEFAULT 0,
    packaging_charge NUMERIC NOT NULL DEFAULT 7,
    tax NUMERIC NOT NULL DEFAULT 0,
    delivery_fee NUMERIC NOT NULL DEFAULT 0,
    total NUMERIC NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'Order Received',
    rejection_reason TEXT,
    cooking_notes TEXT,
    address JSONB,
    rider_id TEXT,
    payment_method TEXT NOT NULL DEFAULT 'Cash on Delivery (COD)',
    payment_status TEXT NOT NULL DEFAULT 'Pending',
    whatsapp_status TEXT NOT NULL DEFAULT 'Sent',
    whatsapp_opt_in BOOLEAN NOT NULL DEFAULT true,
    whatsapp_sent_timestamp TEXT
);

-- 2. MENU ITEMS TABLE
CREATE TABLE IF NOT EXISTS public.menu_items (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    price NUMERIC NOT NULL,
    description TEXT,
    dietary TEXT NOT NULL DEFAULT 'veg',
    is_available BOOLEAN NOT NULL DEFAULT true,
    image TEXT,
    tag TEXT,
    preparation_time TEXT,
    calories TEXT
);

-- 3. COUPONS TABLE
CREATE TABLE IF NOT EXISTS public.coupons (
    id TEXT PRIMARY KEY,
    code TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    description TEXT,
    discount_type TEXT NOT NULL,
    discount_value NUMERIC NOT NULL DEFAULT 0,
    min_order_amount NUMERIC NOT NULL DEFAULT 0,
    max_discount NUMERIC,
    is_active BOOLEAN NOT NULL DEFAULT true,
    is_default BOOLEAN NOT NULL DEFAULT false
);

-- 4. STORE SETTINGS TABLE
CREATE TABLE IF NOT EXISTS public.store_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL
);

-- ====================================================================
-- 5. ROW LEVEL SECURITY (RLS) POLICIES
-- Allow public anon read/write for food ordering storefront & admin board
-- ====================================================================
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;

-- Orders policies
DROP POLICY IF EXISTS "Public can view orders" ON public.orders;
CREATE POLICY "Public can view orders" ON public.orders FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public can insert orders" ON public.orders;
CREATE POLICY "Public can insert orders" ON public.orders FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public can update orders" ON public.orders;
CREATE POLICY "Public can update orders" ON public.orders FOR UPDATE USING (true);

-- Menu items policies
DROP POLICY IF EXISTS "Public can view menu" ON public.menu_items;
CREATE POLICY "Public can view menu" ON public.menu_items FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public can modify menu" ON public.menu_items;
CREATE POLICY "Public can modify menu" ON public.menu_items FOR ALL USING (true);

-- Coupons policies
DROP POLICY IF EXISTS "Public can view coupons" ON public.coupons;
CREATE POLICY "Public can view coupons" ON public.coupons FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public can modify coupons" ON public.coupons;
CREATE POLICY "Public can modify coupons" ON public.coupons FOR ALL USING (true);

-- Store settings policies
DROP POLICY IF EXISTS "Public can view settings" ON public.store_settings;
CREATE POLICY "Public can view settings" ON public.store_settings FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public can modify settings" ON public.store_settings;
CREATE POLICY "Public can modify settings" ON public.store_settings FOR ALL USING (true);

-- ====================================================================
-- 6. ENABLE SUPABASE REALTIME REPLICATION (For live websocket sync)
-- ====================================================================
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
ALTER PUBLICATION supabase_realtime ADD TABLE public.menu_items;
ALTER PUBLICATION supabase_realtime ADD TABLE public.coupons;
ALTER PUBLICATION supabase_realtime ADD TABLE public.store_settings;

-- 7. INITIAL STORE SETTINGS SEED
INSERT INTO public.store_settings (key, value)
VALUES 
    ('base_delivery_charge', '35'::jsonb),
    ('is_store_open', 'true'::jsonb)
ON CONFLICT (key) DO NOTHING;
