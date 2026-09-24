# Loka Server

## Menjalankan Server
```bash
cd server
node index.js
```
Server berjalan di http://localhost:3001

## Akun Admin Default
- Email   : admin@loka.cafe
- Password: admin123

## Endpoints Utama
- POST /api/auth/register   - Daftar user baru
- POST /api/auth/login      - Login
- GET  /api/auth/me         - Data user saat ini
- GET  /api/products        - Daftar produk
- POST /api/transactions    - Buat transaksi
- GET  /api/analytics/summary - Data dashboard (admin)
- POST /api/scores          - Simpan skor game
