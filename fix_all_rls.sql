-- 1. Berikan Hak Akses Dasar (PostgreSQL GRANTS) ke Role anon dan authenticated
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- 2. Fix RLS Policies for all tables
-- ==============================================

-- PRODUCTS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow select for everyone on products" ON products;
CREATE POLICY "Allow select for everyone on products" ON products FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow all for authenticated on products" ON products;
CREATE POLICY "Allow all for authenticated on products" ON products FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- SETTINGS
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow select for everyone on settings" ON settings;
CREATE POLICY "Allow select for everyone on settings" ON settings FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow all for authenticated on settings" ON settings;
CREATE POLICY "Allow all for authenticated on settings" ON settings FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- BOARDGAMES
ALTER TABLE boardgames ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow select for everyone on boardgames" ON boardgames;
CREATE POLICY "Allow select for everyone on boardgames" ON boardgames FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow all for authenticated on boardgames" ON boardgames;
CREATE POLICY "Allow all for authenticated on boardgames" ON boardgames FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- PAYMENT METHODS
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow select for everyone on payment_methods" ON payment_methods;
CREATE POLICY "Allow select for everyone on payment_methods" ON payment_methods FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow all for authenticated on payment_methods" ON payment_methods;
CREATE POLICY "Allow all for authenticated on payment_methods" ON payment_methods FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- TRANSACTIONS & ITEMS
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow insert for everyone on transactions" ON transactions;
CREATE POLICY "Allow insert for everyone on transactions" ON transactions FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Allow all for authenticated on transactions" ON transactions;
CREATE POLICY "Allow all for authenticated on transactions" ON transactions FOR ALL TO authenticated USING (true) WITH CHECK (true);

ALTER TABLE transaction_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow insert for everyone on transaction_items" ON transaction_items;
CREATE POLICY "Allow insert for everyone on transaction_items" ON transaction_items FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Allow all for authenticated on transaction_items" ON transaction_items;
CREATE POLICY "Allow all for authenticated on transaction_items" ON transaction_items FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- SEED SETTINGS (Ensure settings exist so blog works)
INSERT INTO settings (key, value, label) VALUES
  ('blogger_url', 'https://arutiaa.blogspot.com/', 'URL Blog Blogger'),
  ('instagram_handle', 'lokaboardgamecafe', 'Username Instagram (tanpa @)'),
  ('instagram_embed_code', '', 'Embed Code Widget Instagram'),
  ('whatsapp_number', '6285327639133', 'Nomor WhatsApp Admin')
ON CONFLICT (key) DO NOTHING;
