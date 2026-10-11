-- ============================================================
-- LOKA BOARDGAME CAFE — SUPABASE DATABASE SCHEMA
-- Jalankan script ini di Supabase Dashboard → SQL Editor
-- ============================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── PRODUCTS ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  price INTEGER NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('food','non-coffee','coffee','play')),
  description TEXT DEFAULT '',
  tag TEXT DEFAULT '',
  image_url TEXT DEFAULT '',
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ── PROFILES (extends auth.users) ───────────────────────────
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT 'User',
  phone TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user','admin')),
  points INTEGER DEFAULT 0,
  total_spent INTEGER DEFAULT 0,
  membership TEXT DEFAULT 'Bronze',
  avatar_url TEXT,
  email_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ── TRANSACTIONS ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS transactions (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  customer_name TEXT NOT NULL,
  table_number TEXT DEFAULT '',
  phone TEXT DEFAULT '',
  note TEXT DEFAULT '',
  payment_method TEXT DEFAULT 'cash',
  payment_status TEXT DEFAULT 'pending',
  total_amount INTEGER NOT NULL,
  points_earned INTEGER DEFAULT 0,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ── TRANSACTION ITEMS ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS transaction_items (
  id SERIAL PRIMARY KEY,
  transaction_id TEXT REFERENCES transactions(id) ON DELETE CASCADE,
  product_id TEXT,
  product_name TEXT NOT NULL,
  price INTEGER NOT NULL,
  qty INTEGER NOT NULL,
  subtotal INTEGER NOT NULL
);

-- ── GAME SCORES ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS game_scores (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  session_name TEXT DEFAULT 'Sesi Baru',
  game_name TEXT NOT NULL,
  players JSONB NOT NULL DEFAULT '[]',
  scores JSONB NOT NULL DEFAULT '{}',
  winner TEXT,
  played_at TIMESTAMPTZ DEFAULT now()
);

-- ── RATINGS (NEW) ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS ratings (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  product_id TEXT REFERENCES products(id) ON DELETE CASCADE,
  rating INTEGER CHECK (rating BETWEEN 1 AND 5) NOT NULL,
  review TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (user_id, product_id)
);

-- ── SETTINGS (Blog URL, Instagram, etc.) ────────────────────
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL DEFAULT '',
  label TEXT DEFAULT '',
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Default settings
INSERT INTO settings (key, value, label) VALUES
  ('blogger_url', 'https://arutiaa.blogspot.com/', 'URL Blog Blogger'),
  ('instagram_handle', 'lokaboardgamecafe', 'Username Instagram'),
  ('instagram_embed_code', '', 'Embed Code Widget Instagram'),
  ('whatsapp_number', '6281234567890', 'Nomor WhatsApp')
ON CONFLICT (key) DO NOTHING;

-- ── MEMBERSHIP TIERS (Coming Soon) ──────────────────────────
CREATE TABLE IF NOT EXISTS membership_tiers (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  min_points INTEGER NOT NULL DEFAULT 0,
  color TEXT DEFAULT '#CD7F32',
  icon TEXT DEFAULT '🥉',
  benefits TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

INSERT INTO membership_tiers (name, min_points, color, icon, benefits) VALUES
  ('Bronze',   0,    '#CD7F32', '🥉', ARRAY['Akses semua koleksi boardgame','Poin setiap transaksi','Diskon 0%']),
  ('Silver',   500,  '#C0C0C0', '🥈', ARRAY['Diskon 5% untuk semua menu','2x poin di hari weekend','Priority table booking']),
  ('Gold',     2000, '#FFD700', '🥇', ARRAY['Diskon 10% untuk semua','3x poin setiap hari','Free play 1x per bulan','Early access event']),
  ('Platinum', 5000, '#E5E4E2', '💎', ARRAY['Diskon 15% untuk semua','5x poin setiap hari','Free play 2x per bulan','VIP lounge access','Invite private event'])
ON CONFLICT DO NOTHING;

-- ══════════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY
-- ══════════════════════════════════════════════════════════════

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE transaction_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE membership_tiers ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if re-running
DROP POLICY IF EXISTS "Public read profiles" ON profiles;
DROP POLICY IF EXISTS "Users read own profile" ON profiles;
DROP POLICY IF EXISTS "Users update own profile" ON profiles;
DROP POLICY IF EXISTS "Admin full profiles" ON profiles;
DROP POLICY IF EXISTS "Users read own tx" ON transactions;
DROP POLICY IF EXISTS "Users insert tx" ON transactions;
DROP POLICY IF EXISTS "Admin full tx" ON transactions;
DROP POLICY IF EXISTS "Users read own tx items" ON transaction_items;
DROP POLICY IF EXISTS "Users insert tx items" ON transaction_items;
DROP POLICY IF EXISTS "Admin full tx items" ON transaction_items;
DROP POLICY IF EXISTS "Users read own scores" ON game_scores;
DROP POLICY IF EXISTS "Users manage own scores" ON game_scores;
DROP POLICY IF EXISTS "Anyone read ratings" ON ratings;
DROP POLICY IF EXISTS "Auth users rate" ON ratings;
DROP POLICY IF EXISTS "Users update own rating" ON ratings;
DROP POLICY IF EXISTS "Users delete own rating" ON ratings;
DROP POLICY IF EXISTS "Anyone read products" ON products;
DROP POLICY IF EXISTS "Admin write products" ON products;
DROP POLICY IF EXISTS "Anyone read settings" ON settings;
DROP POLICY IF EXISTS "Admin write settings" ON settings;
DROP POLICY IF EXISTS "Anyone read tiers" ON membership_tiers;

-- PROFILES policies
CREATE POLICY "Users read own profile"   ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admin full profiles"      ON profiles FOR ALL    USING (
  EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
);

-- TRANSACTIONS policies
CREATE POLICY "Users read own tx"   ON transactions FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users insert tx"     ON transactions FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Admin full tx"       ON transactions FOR ALL    USING (
  EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
);

-- TRANSACTION ITEMS policies
CREATE POLICY "Users read own tx items" ON transaction_items FOR SELECT USING (
  EXISTS (SELECT 1 FROM transactions t WHERE t.id = transaction_items.transaction_id AND t.user_id = auth.uid())
);
CREATE POLICY "Users insert tx items" ON transaction_items FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM transactions t WHERE t.id = transaction_items.transaction_id AND t.user_id = auth.uid())
);
CREATE POLICY "Admin full tx items" ON transaction_items FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
);

-- GAME SCORES policies
CREATE POLICY "Users read own scores"   ON game_scores FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users manage own scores" ON game_scores FOR ALL    USING (user_id = auth.uid());

-- RATINGS policies
CREATE POLICY "Anyone read ratings"   ON ratings FOR SELECT USING (true);
CREATE POLICY "Auth users rate"       ON ratings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own rating" ON ratings FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own rating" ON ratings FOR DELETE USING (auth.uid() = user_id);

-- PRODUCTS policies
CREATE POLICY "Anyone read products" ON products FOR SELECT USING (true);
CREATE POLICY "Admin write products" ON products FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
);

-- SETTINGS policies
CREATE POLICY "Anyone read settings" ON settings FOR SELECT USING (true);
CREATE POLICY "Admin write settings" ON settings FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
);

-- MEMBERSHIP TIERS policies
CREATE POLICY "Anyone read tiers" ON membership_tiers FOR SELECT USING (true);

-- ══════════════════════════════════════════════════════════════
-- SUPABASE STORAGE — bucket for product images
-- ══════════════════════════════════════════════════════════════
INSERT INTO storage.buckets (id, name, public) 
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
DROP POLICY IF EXISTS "Public read product images" ON storage.objects;
DROP POLICY IF EXISTS "Admin upload product images" ON storage.objects;
DROP POLICY IF EXISTS "Admin delete product images" ON storage.objects;

CREATE POLICY "Public read product images" ON storage.objects 
  FOR SELECT USING (bucket_id = 'product-images');

CREATE POLICY "Admin upload product images" ON storage.objects 
  FOR INSERT WITH CHECK (
    bucket_id = 'product-images' AND
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

CREATE POLICY "Admin delete product images" ON storage.objects 
  FOR DELETE USING (
    bucket_id = 'product-images' AND
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

-- ══════════════════════════════════════════════════════════════
-- TRIGGER: Auto-create profile when user signs up
-- ══════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, phone, email_verified)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', 'User'),
    NEW.raw_user_meta_data->>'phone',
    COALESCE(NEW.email_confirmed_at IS NOT NULL, false)
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ══════════════════════════════════════════════════════════════
-- SEED: Insert all products from menu catalog
-- ══════════════════════════════════════════════════════════════
INSERT INTO products (id, name, price, category, description, tag) VALUES
  -- FOOD
  ('f1','Bakso Ala Loka',25000,'food','Bakso sapi premium dengan kuah kaldu spesial, mie, tahu, dan topping pilihan khas Loka.','Best Seller'),
  ('f2','Nasi Goreng Loka',28000,'food','Nasi goreng special recipe khas Loka dengan telur ceplok, acar, dan kerupuk renyah.','Chef''s Pick'),
  ('f3','Mix Platter',20000,'food','Kombinasi berbagai camilan gorengan pilihan: tahu, tempe, pisang, dan lainnya.','Sharing'),
  ('f4','Seblak Ala Loka',25000,'food','Seblak khas Bandung dengan level pedas pilihan, kerupuk kenyal, telur, dan topping sosis.','Spicy 🌶'),
  ('f5','Mie Nyemek Loka',25000,'food','Mie kuah kental semi-kering dengan bumbu rempah yang kaya, bakso, dan sayuran segar.',''),
  ('f6','Pisang Goreng Sambal',25000,'food','Pisang kepok goreng crispy dengan sambal matah khas Loka yang segar dan pedas.',''),
  ('f7','Mie Instan Loka',18000,'food','Mie instan dimasak ala Loka dengan tambahan telur, sayur, dan sambal spesial.','Hemat'),
  -- NON-COFFEE
  ('d1','Juice Alpukat',25000,'non-coffee','Alpukat segar blended dengan susu, cokelat meses, dan sedikit kental manis.','Favorit'),
  ('d2','Lokacitrus',15000,'non-coffee','Minuman segar perpaduan lemon, jeruk nipis, dan soda dengan sejumput mint.',''),
  ('d3','Lokamilk',18000,'non-coffee','Fresh milk khas Loka dengan pilihan rasa original, cokelat, atau strawberry.',''),
  ('d4','Loka Orange',20000,'non-coffee','Jeruk peras segar dicampur madu dan soda, menyegarkan selama main game.',''),
  ('d5','Air Mineral',7000,'non-coffee','Air mineral dingin segar.',''),
  -- COFFEE
  ('c1','Lokachino',21000,'coffee','Cappuccino khas Loka dengan crema espresso sempurna dan latte art istimewa.','Signature'),
  ('c2','Mango Lokachino',22000,'coffee','Perpaduan unik espresso, susu, dan mango segar — manis dengan sentuhan kopi.',''),
  ('c3','Berry Lokachino',22000,'coffee','Espresso segar dengan berry mix puree, susu, dan foam lembut nan menawan.',''),
  ('c4','Orange Lokachino',25000,'coffee','Espresso dengan jeruk segar, soda, dan twist oranye yang refreshing.',''),
  ('c5','French Press',25000,'coffee','Kopi French Press dengan biji kopi pilihan yang diseduh dengan sempurna.',''),
  ('c6','Loka V60',35000,'coffee','Pour-over V60 manual brew dengan single origin beans, bright & complex flavor.','Premium'),
  -- PLAY
  ('p1','Main Per Jam',10000,'play','Akses main semua koleksi boardgame selama 1 jam. Cocok untuk sesi singkat bersama teman.',''),
  ('p2','All Day Play',30000,'play','Bermain sepuasnya seharian penuh! Akses ke 200+ judul boardgame mulai buka hingga tutup.','Best Value')
ON CONFLICT (id) DO NOTHING;

-- ══════════════════════════════════════════════════════════════
-- HELPER: Admin helper function to bypass RLS for admin queries
-- ══════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION get_all_profiles()
RETURNS SETOF profiles AS $$
  SELECT * FROM profiles ORDER BY created_at DESC;
$$ LANGUAGE sql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_analytics_summary()
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'totalRevenue', COALESCE((SELECT SUM(total_amount) FROM transactions WHERE payment_status='paid'), 0),
    'totalOrders', (SELECT COUNT(*) FROM transactions),
    'todayOrders', (SELECT COUNT(*) FROM transactions WHERE created_at::date = CURRENT_DATE),
    'todayRevenue', COALESCE((SELECT SUM(total_amount) FROM transactions WHERE payment_status='paid' AND created_at::date = CURRENT_DATE), 0),
    'totalUsers', (SELECT COUNT(*) FROM profiles WHERE role='user'),
    'totalProducts', (SELECT COUNT(*) FROM products)
  ) INTO result;
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
