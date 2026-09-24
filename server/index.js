require("dotenv").config();
const express  = require("express");
const cors     = require("cors");
const jwt      = require("jsonwebtoken");
const bcrypt   = require("bcryptjs");
const db       = require("./db");

const app  = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || "loka_secret";

app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());

// ─── Helpers ────────────────────────────────────────────
function makeToken(user) {
  return jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: "7d" });
}

function calcMembership(points) {
  if (points >= 5000) return "Platinum";
  if (points >= 2000) return "Gold";
  if (points >= 500)  return "Silver";
  return "Bronze";
}

// ─── Auth Middleware ─────────────────────────────────────
function auth(req, res, next) {
  const h = req.headers.authorization;
  if (!h || !h.startsWith("Bearer ")) return res.status(401).json({ message: "Unauthorized" });
  try {
    req.user = jwt.verify(h.slice(7), JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ message: "Token invalid" });
  }
}

function adminOnly(req, res, next) {
  if (req.user?.role !== "admin") return res.status(403).json({ message: "Forbidden" });
  next();
}

// ══════════════════════════════════
// AUTH ROUTES
// ══════════════════════════════════

// Register
app.post("/api/auth/register", (req, res) => {
  const { name, email, password, phone } = req.body;
  if (!name || !email || !password) return res.status(400).json({ message: "Data tidak lengkap" });

  const exists = db.prepare("SELECT id FROM users WHERE email = ?").get(email);
  if (exists) return res.status(409).json({ message: "Email sudah terdaftar" });

  const hash = bcrypt.hashSync(password, 10);
  const result = db.prepare(
    "INSERT INTO users (name, email, password, phone) VALUES (?,?,?,?)"
  ).run(name, email, hash, phone || null);

  const user = db.prepare("SELECT id, name, email, role, points, membership, phone, created_at FROM users WHERE id = ?").get(result.lastInsertRowid);
  res.status(201).json({ token: makeToken(user), user });
});

// Login
app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: "Email/password wajib diisi" });

  const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email);
  if (!user || !bcrypt.compareSync(password, user.password))
    return res.status(401).json({ message: "Email atau password salah" });

  const { password: _, ...safe } = user;
  res.json({ token: makeToken(safe), user: safe });
});

// Me
app.get("/api/auth/me", auth, (req, res) => {
  const user = db.prepare("SELECT id,name,email,role,points,membership,phone,total_spent,avatar,created_at FROM users WHERE id=?").get(req.user.id);
  if (!user) return res.status(404).json({ message: "User tidak ditemukan" });
  res.json(user);
});

// Update profile
app.put("/api/auth/profile", auth, (req, res) => {
  const { name, phone } = req.body;
  db.prepare("UPDATE users SET name=?, phone=? WHERE id=?").run(name, phone, req.user.id);
  const user = db.prepare("SELECT id,name,email,role,points,membership,phone,total_spent,created_at FROM users WHERE id=?").get(req.user.id);
  res.json(user);
});

// ══════════════════════════════════
// PRODUCT ROUTES
// ══════════════════════════════════

app.get("/api/products", (req, res) => {
  const rows = db.prepare("SELECT * FROM products ORDER BY category, name").all();
  res.json(rows);
});

app.post("/api/products", auth, adminOnly, (req, res) => {
  const { id, name, price, category, description, tag, image_url } = req.body;
  if (!id || !name || !price || !category) return res.status(400).json({ message: "Data tidak lengkap" });
  db.prepare(
    "INSERT INTO products (id,name,price,category,description,tag,image_url) VALUES (?,?,?,?,?,?,?)"
  ).run(id, name, price, category, description||"", tag||"", image_url||"");
  res.status(201).json({ message: "Produk ditambahkan" });
});

app.put("/api/products/:id", auth, adminOnly, (req, res) => {
  const { name, price, category, description, tag, is_available } = req.body;
  db.prepare(
    "UPDATE products SET name=?,price=?,category=?,description=?,tag=?,is_available=?,updated_at=datetime('now') WHERE id=?"
  ).run(name, price, category, description, tag, is_available ?? 1, req.params.id);
  res.json({ message: "Produk diperbarui" });
});

app.delete("/api/products/:id", auth, adminOnly, (req, res) => {
  db.prepare("DELETE FROM products WHERE id=?").run(req.params.id);
  res.json({ message: "Produk dihapus" });
});

// ══════════════════════════════════
// TRANSACTION ROUTES
// ══════════════════════════════════

function genOrderId() {
  return "LKA-" + Math.floor(Date.now() / 1000).toString().slice(-6).toUpperCase();
}

app.post("/api/transactions", auth, (req, res) => {
  const { customer_name, table_number, phone, note, payment_method, items, total_amount } = req.body;
  if (!customer_name || !items?.length) return res.status(400).json({ message: "Data tidak lengkap" });

  const orderId = genOrderId();
  const pointsEarned = Math.floor(total_amount / 1000); // 1 poin per Rp 1.000

  const insertTx = db.prepare(
    `INSERT INTO transactions (id,user_id,customer_name,table_number,phone,note,payment_method,total_amount,points_earned)
     VALUES (?,?,?,?,?,?,?,?,?)`
  );
  const insertItem = db.prepare(
    `INSERT INTO transaction_items (transaction_id,product_id,product_name,price,qty,subtotal)
     VALUES (?,?,?,?,?,?)`
  );

  const doTransaction = db.transaction(() => {
    insertTx.run(orderId, req.user.id, customer_name, table_number||"", phone||"", note||"", payment_method, total_amount, pointsEarned);
    for (const item of items) {
      insertItem.run(orderId, item.id, item.name, item.price, item.qty, item.price * item.qty);
    }
    // Update user points & total_spent
    const currentUser = db.prepare("SELECT points, total_spent FROM users WHERE id=?").get(req.user.id);
    const newPoints = (currentUser?.points || 0) + pointsEarned;
    const newSpent  = (currentUser?.total_spent || 0) + total_amount;
    const newMembership = calcMembership(newPoints);
    db.prepare("UPDATE users SET points=?,total_spent=?,membership=? WHERE id=?")
      .run(newPoints, newSpent, newMembership, req.user.id);
  });

  doTransaction();
  res.status(201).json({ orderId, pointsEarned, message: "Pesanan berhasil dibuat" });
});

// Get user transactions
app.get("/api/transactions/my", auth, (req, res) => {
  const txs = db.prepare(
    `SELECT t.*, GROUP_CONCAT(ti.product_name || 'x' || ti.qty, ', ') as items_summary
     FROM transactions t
     LEFT JOIN transaction_items ti ON ti.transaction_id = t.id
     WHERE t.user_id = ?
     GROUP BY t.id
     ORDER BY t.created_at DESC LIMIT 20`
  ).all(req.user.id);
  res.json(txs);
});

// Admin: Get all transactions
app.get("/api/transactions", auth, adminOnly, (req, res) => {
  const { limit = 50, offset = 0, status, date } = req.query;
  let query = `SELECT t.*, u.name as user_name, u.email as user_email,
    GROUP_CONCAT(ti.product_name || ' x' || ti.qty, ', ') as items_summary
    FROM transactions t
    LEFT JOIN users u ON u.id = t.user_id
    LEFT JOIN transaction_items ti ON ti.transaction_id = t.id`;
  const conds = [];
  const params = [];
  if (status) { conds.push("t.status = ?"); params.push(status); }
  if (date)   { conds.push("date(t.created_at) = ?"); params.push(date); }
  if (conds.length) query += " WHERE " + conds.join(" AND ");
  query += " GROUP BY t.id ORDER BY t.created_at DESC LIMIT ? OFFSET ?";
  params.push(Number(limit), Number(offset));

  const rows = db.prepare(query).all(...params);
  const total = db.prepare("SELECT COUNT(*) as c FROM transactions").get().c;
  res.json({ transactions: rows, total });
});

// Admin: Update transaction status
app.put("/api/transactions/:id/status", auth, adminOnly, (req, res) => {
  const { status, payment_status } = req.body;
  db.prepare("UPDATE transactions SET status=?,payment_status=?,updated_at=datetime('now') WHERE id=?")
    .run(status, payment_status, req.params.id);
  res.json({ message: "Status diperbarui" });
});

// Get single transaction items
app.get("/api/transactions/:id/items", auth, (req, res) => {
  const items = db.prepare("SELECT * FROM transaction_items WHERE transaction_id=?").all(req.params.id);
  res.json(items);
});

// ══════════════════════════════════
// ANALYTICS ROUTES
// ══════════════════════════════════

app.get("/api/analytics/summary", auth, adminOnly, (req, res) => {
  const today = new Date().toISOString().slice(0,10);

  const totalRevenue = db.prepare("SELECT COALESCE(SUM(total_amount),0) as v FROM transactions WHERE payment_status='paid'").get().v;
  const totalOrders  = db.prepare("SELECT COUNT(*) as v FROM transactions").get().v;
  const todayRevenue = db.prepare("SELECT COALESCE(SUM(total_amount),0) as v FROM transactions WHERE date(created_at)=? AND payment_status='paid'").get(today).v;
  const todayOrders  = db.prepare("SELECT COUNT(*) as v FROM transactions WHERE date(created_at)=?").get(today).v;
  const totalUsers   = db.prepare("SELECT COUNT(*) as v FROM users WHERE role='user'").get().v;
  const totalProducts= db.prepare("SELECT COUNT(*) as v FROM products").get().v;

  // Revenue last 7 days
  const revenueChart = db.prepare(`
    SELECT date(created_at) as date, COALESCE(SUM(total_amount),0) as revenue, COUNT(*) as orders
    FROM transactions WHERE payment_status='paid' AND date(created_at) >= date('now','-6 days')
    GROUP BY date(created_at) ORDER BY date
  `).all();

  // Top products
  const topProducts = db.prepare(`
    SELECT product_name, SUM(qty) as total_qty, SUM(subtotal) as total_revenue
    FROM transaction_items GROUP BY product_name ORDER BY total_qty DESC LIMIT 8
  `).all();

  // Category revenue
  const categoryRevenue = db.prepare(`
    SELECT p.category, COALESCE(SUM(ti.subtotal),0) as revenue
    FROM transaction_items ti LEFT JOIN products p ON p.id=ti.product_id
    WHERE p.category IS NOT NULL GROUP BY p.category
  `).all();

  // Membership breakdown
  const membership = db.prepare(
    "SELECT membership, COUNT(*) as count FROM users WHERE role='user' GROUP BY membership"
  ).all();

  res.json({
    totalRevenue, totalOrders, todayRevenue, todayOrders, totalUsers, totalProducts,
    revenueChart, topProducts, categoryRevenue, membership
  });
});

// ══════════════════════════════════
// GAME SCORE ROUTES
// ══════════════════════════════════

app.post("/api/scores", auth, (req, res) => {
  const { session_name, game_name, players, scores, winner } = req.body;
  if (!game_name || !players || !scores) return res.status(400).json({ message: "Data tidak lengkap" });

  const result = db.prepare(
    "INSERT INTO game_scores (user_id,session_name,game_name,players,scores,winner) VALUES (?,?,?,?,?,?)"
  ).run(req.user.id, session_name||"Sesi Baru", game_name, JSON.stringify(players), JSON.stringify(scores), winner||null);

  res.status(201).json({ id: result.lastInsertRowid, message: "Skor disimpan" });
});

app.get("/api/scores/my", auth, (req, res) => {
  const rows = db.prepare("SELECT * FROM game_scores WHERE user_id=? ORDER BY played_at DESC LIMIT 30").all(req.user.id);
  res.json(rows.map(r => ({ ...r, players: JSON.parse(r.players), scores: JSON.parse(r.scores) })));
});

app.delete("/api/scores/:id", auth, (req, res) => {
  db.prepare("DELETE FROM game_scores WHERE id=? AND user_id=?").run(req.params.id, req.user.id);
  res.json({ message: "Skor dihapus" });
});

// Admin: All users
app.get("/api/users", auth, adminOnly, (req, res) => {
  const users = db.prepare("SELECT id,name,email,role,points,membership,total_spent,phone,created_at FROM users ORDER BY created_at DESC").all();
  res.json(users);
});

// ── Mock Payment ─────────────────────────────────────────
app.post("/api/payment/initiate", auth, (req, res) => {
  const { orderId, amount, method } = req.body;
  setTimeout(() => {
    // Mock payment gateway response
    const mockSnap = {
      token: "mock_snap_token_" + Date.now(),
      redirect_url: `http://localhost:5173/payment/mock?order_id=${orderId}&amount=${amount}&method=${method}`,
      payment_details: {
        va_number: method === "transfer" ? "1234567890" : null,
        qr_code: method === "qris" ? "mock_qr_data" : null,
        expiry: new Date(Date.now() + 24*60*60*1000).toISOString(),
      }
    };
    res.json(mockSnap);
  }, 800);
});

app.post("/api/payment/confirm/:orderId", auth, (req, res) => {
  const { orderId } = req.params;
  db.prepare("UPDATE transactions SET payment_status='paid',status='confirmed',updated_at=datetime('now') WHERE id=?").run(orderId);
  res.json({ message: "Pembayaran dikonfirmasi", orderId });
});

// ─── Health ──────────────────────────────────────────────
app.get("/api/health", (_, res) => res.json({ status: "ok", time: new Date().toISOString() }));

if (!process.env.VERCEL) {
  app.listen(PORT, () => console.log(`🎲 Loka Server running on http://localhost:${PORT}`));
}

module.exports = app;
