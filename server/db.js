const Database = require("better-sqlite3");
const path = require("path");

const isVercel = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
const dbDir = isVercel ? "/tmp" : __dirname;
const dbPath = path.join(dbDir, "loka.db");

const db = new Database(dbPath);

// Enable WAL mode for better performance (local only)
if (!isVercel) {
  db.pragma("journal_mode = WAL");
}
db.pragma("foreign_keys = ON");

// ============ SCHEMA ============
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'user',
    avatar TEXT,
    phone TEXT,
    points INTEGER NOT NULL DEFAULT 0,
    total_spent INTEGER NOT NULL DEFAULT 0,
    membership TEXT NOT NULL DEFAULT 'Bronze',
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    price INTEGER NOT NULL,
    category TEXT NOT NULL,
    description TEXT,
    tag TEXT,
    image_url TEXT,
    is_available INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS transactions (
    id TEXT PRIMARY KEY,
    user_id INTEGER,
    customer_name TEXT NOT NULL,
    table_number TEXT,
    phone TEXT,
    note TEXT,
    payment_method TEXT NOT NULL DEFAULT 'cash',
    payment_status TEXT NOT NULL DEFAULT 'pending',
    total_amount INTEGER NOT NULL,
    points_earned INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'pending',
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS transaction_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    transaction_id TEXT NOT NULL,
    product_id TEXT,
    product_name TEXT NOT NULL,
    price INTEGER NOT NULL,
    qty INTEGER NOT NULL,
    subtotal INTEGER NOT NULL,
    FOREIGN KEY (transaction_id) REFERENCES transactions(id)
  );

  CREATE TABLE IF NOT EXISTS game_scores (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    session_name TEXT NOT NULL,
    game_name TEXT NOT NULL,
    players TEXT NOT NULL,
    scores TEXT NOT NULL,
    winner TEXT,
    played_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id)
  );
`);

// ─── Seed admin user if not exists ───
const adminExists = db.prepare("SELECT id FROM users WHERE email = ?").get("admin@loka.cafe");
if (!adminExists) {
  const bcrypt = require("bcryptjs");
  const hash = bcrypt.hashSync("admin123", 10);
  db.prepare(
    "INSERT INTO users (name, email, password, role, membership) VALUES (?, ?, ?, ?, ?)"
  ).run("Admin Loka", "admin@loka.cafe", hash, "admin", "Gold");
  console.log("✅ Admin seeded: admin@loka.cafe / admin123");
}

module.exports = db;
