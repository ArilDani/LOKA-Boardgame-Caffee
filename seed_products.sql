-- Fix RLS untuk table products
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all for authenticated on products" ON products;
CREATE POLICY "Allow all for authenticated on products"
ON products FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Insert atau Update data produk beserta path gambar
INSERT INTO products (id, name, price, category, description, tag, image_url, is_available)
VALUES 
  ('f1', 'Bakso Ala Loka', 25000, 'food', 'Bakso sapi premium dengan kuah kaldu spesial, mie, tahu, dan topping pilihan khas Loka.', 'Best Seller', '/img/Bakso ala loka.jpg', true),
  ('f2', 'Nasi Goreng Loka', 28000, 'food', 'Nasi goreng special recipe khas Loka dengan telur ceplok, acar, dan kerupuk renyah.', 'Chef''s Pick', '/img/Nasi Goreng Loka.jpg', true),
  ('f3', 'Mix Platter', 20000, 'food', 'Kombinasi berbagai camilan gorengan pilihan: tahu, tempe, pisang, dan lainnya.', 'Sharing', '/img/Mix Platter.jpg', true),
  ('f4', 'Seblak Ala Loka', 25000, 'food', 'Seblak khas Bandung dengan level pedas pilihan, kerupuk kenyal, telur, dan topping sosis.', 'Spicy 🌶', '/img/Seblak ala loka.jpg', true),
  ('f5', 'Mie Nyemek Loka', 25000, 'food', 'Mie kuah kental semi-kering dengan bumbu rempah yang kaya, bakso, dan sayuran segar.', null, '/img/Mie Nyemek.jpg', true),
  ('f6', 'Pisang Goreng Sambal', 25000, 'food', 'Pisang kepok goreng crispy dengan sambal matah khas Loka yang segar dan pedas.', null, '/img/Pisang Goreng Sambal.jpg', true),
  ('f7', 'Mie Instan Loka', 18000, 'food', 'Mie instan dimasak ala Loka dengan tambahan telur, sayur, dan sambal spesial.', 'Hemat', '/img/Mie Instan ala loka.jpg', true),
  ('d1', 'Juice Alpukat', 25000, 'non-coffee', 'Alpukat segar blended dengan susu, cokelat meses, dan sedikit kental manis.', 'Favorit', '/img/Juice Alpukat.jpg', true),
  ('d2', 'Lokacitrus', 15000, 'non-coffee', 'Minuman segar perpaduan lemon, jeruk nipis, dan soda dengan sejumput mint.', null, '/img/Lokalcitrus.jpg', true),
  ('d3', 'Lokamilk', 18000, 'non-coffee', 'Fresh milk khas Loka dengan pilihan rasa original, cokelat, atau strawberry.', null, '/img/Lokamilk.jpg', true),
  ('d4', 'Loka Orange', 20000, 'non-coffee', 'Jeruk peras segar dicampur madu dan soda, menyegarkan selama main game.', null, '/img/Lokaorange.jpg', true),
  ('d5', 'Air Mineral', 7000, 'non-coffee', 'Air mineral dingin segar.', null, '/img/Air Mineral.jpg', true),
  ('c1', 'Lokachino', 21000, 'coffee', 'Cappuccino khas Loka dengan crema espresso sempurna dan latte art istimewa.', 'Signature', '/img/Lokachino.jpg', true),
  ('c2', 'Mango Lokachino', 22000, 'coffee', 'Perpaduan unik espresso, susu, dan mango segar — manis dengan sentuhan kopi.', null, '/img/Manggo Lokachino.jpg', true),
  ('c3', 'Berry Lokachino', 22000, 'coffee', 'Espresso segar dengan berry mix puree, susu, dan foam lembut nan menawan.', null, '/img/Berry Lokachino.jpg', true),
  ('c4', 'Orange Lokachino', 25000, 'coffee', 'Espresso dengan jeruk segar, soda, dan twist oranye yang refreshing.', null, '/img/Orangecino.jpg', true),
  ('c5', 'French Press', 25000, 'coffee', 'Kopi French Press dengan biji kopi pilihan yang diseduh dengan sempurna.', null, '/img/French Press.jpg', true),
  ('c6', 'Loka V60', 35000, 'coffee', 'Pour-over V60 manual brew dengan single origin beans, bright & complex flavor.', 'Premium', '/img/Loka V60.jpg', true),
  ('p1', 'Main Per Jam', 10000, 'play', 'Akses main semua koleksi boardgame selama 1 jam. Cocok untuk sesi singkat bersama teman.', null, null, true),
  ('p2', 'All Day Play', 30000, 'play', 'Bermain sepuasnya seharian penuh! Akses ke 200+ judul boardgame mulai buka hingga tutup.', 'Best Value', null, true)
ON CONFLICT (id) DO UPDATE 
SET 
  name = EXCLUDED.name,
  price = EXCLUDED.price,
  image_url = EXCLUDED.image_url,
  tag = EXCLUDED.tag;
