import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Package, ClipboardList, Users, TrendingUp,
  Plus, Edit2, Trash2, Save, X, ChevronDown, Search, ArrowUp, ArrowDown,
  DollarSign, ShoppingBag, UserCheck, Star, RefreshCw, CheckCircle, Clock, XCircle
} from "lucide-react";
import { formatPrice } from "../data/menuData";
import "./Admin.css";

const API = import.meta.env.VITE_API_URL || "/api";
const CATS = ["food", "non-coffee", "coffee", "play"];

// ── Mini chart bars ───────────────────────────────────
function MiniBar({ value, max, color = "var(--clr-primary)" }) {
  const pct = max ? Math.round((value / max) * 100) : 0;
  return <div className="mini-bar"><div className="mini-bar__fill" style={{ width: `${pct}%`, background: color }} /></div>;
}

// ── Stat Card ─────────────────────────────────────────
function StatCard({ label, value, icon: Icon, sub, color }) {
  return (
    <div className="admin-stat glass-card" style={{ "--sc": color }}>
      <div className="admin-stat__icon"><Icon size={22} /></div>
      <div className="admin-stat__body">
        <p className="admin-stat__label">{label}</p>
        <p className="admin-stat__value">{value}</p>
        {sub && <p className="admin-stat__sub">{sub}</p>}
      </div>
    </div>
  );
}

export default function Admin() {
  const { user, authFetch, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [page, setPage] = useState("dashboard");

  useEffect(() => {
    if (!user) navigate("/login");
    else if (!isAdmin) navigate("/");
    window.scrollTo(0, 0);
  }, [user, isAdmin]);

  if (!user || !isAdmin) return null;

  const navItems = [
    { id: "dashboard",    label: "Dashboard",    icon: LayoutDashboard },
    { id: "products",     label: "Produk",        icon: Package },
    { id: "transactions", label: "Transaksi",     icon: ClipboardList },
    { id: "users",        label: "Pengguna",      icon: Users },
  ];

  return (
    <div className="admin-page">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar__brand">
          <span>⚙️</span> Admin Panel
        </div>
        <nav className="admin-sidebar__nav">
          {navItems.map(n => (
            <button key={n.id} className={`admin-nav-item ${page === n.id ? "active" : ""}`} onClick={() => setPage(n.id)}>
              <n.icon size={18} /> {n.label}
            </button>
          ))}
        </nav>
        <button className="admin-sidebar__back btn btn-ghost btn-sm" onClick={() => navigate("/")}>← Kembali ke Web</button>
      </aside>

      {/* Content */}
      <div className="admin-content">
        <div className="admin-topbar">
          <h3 className="admin-topbar__title">{navItems.find(n => n.id === page)?.label}</h3>
          <div className="admin-topbar__user">
            <div className="admin-topbar__avatar">{user.name?.[0]}</div>
            <span>{user.name}</span>
          </div>
        </div>
        <div className="admin-body">
          {page === "dashboard"    && <DashboardPanel authFetch={authFetch} />}
          {page === "products"     && <ProductsPanel  authFetch={authFetch} />}
          {page === "transactions" && <TransactionsPanel authFetch={authFetch} />}
          {page === "users"        && <UsersPanel     authFetch={authFetch} />}
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════
// DASHBOARD PANEL
// ══════════════════════════════════════════════════════
function DashboardPanel({ authFetch }) {
  const [data, setData]   = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await authFetch(`${API}/analytics/summary`);
      if (res.ok) setData(await res.json());
    } finally { setLoading(false); }
  }, [authFetch]);

  useEffect(() => { load(); }, [load]);

  if (loading) return <div className="admin-loading"><RefreshCw size={24} className="spin-icon" /> Memuat data...</div>;
  if (!data)   return <div className="admin-loading">Gagal memuat data</div>;

  const maxRev = Math.max(...(data.revenueChart.map(r => r.revenue) || [1]));

  return (
    <div className="dashboard-panel">
      {/* Stats */}
      <div className="dashboard-stats">
        <StatCard label="Total Pendapatan"  value={formatPrice(data.totalRevenue)} icon={DollarSign} color="var(--clr-primary)" sub={`Hari ini: ${formatPrice(data.todayRevenue)}`} />
        <StatCard label="Total Pesanan"     value={data.totalOrders}               icon={ShoppingBag} color="#52b788"           sub={`Hari ini: ${data.todayOrders}`} />
        <StatCard label="Total Pengguna"    value={data.totalUsers}                icon={UserCheck}   color="#6366f1" />
        <StatCard label="Total Produk"      value={data.totalProducts}             icon={Package}     color="var(--clr-primary)" />
      </div>

      {/* Revenue Chart */}
      <div className="dashboard-row">
        <div className="dashboard-chart glass-card">
          <h4>Pendapatan 7 Hari Terakhir</h4>
          {data.revenueChart.length === 0 ? (
            <p style={{ color: "var(--clr-text-muted)", fontSize: "0.85rem" }}>Belum ada data transaksi.</p>
          ) : (
            <div className="rev-chart">
              {data.revenueChart.map(r => (
                <div key={r.date} className="rev-bar-wrap">
                  <span className="rev-bar-value">{r.revenue > 0 ? `${Math.round(r.revenue/1000)}k` : "0"}</span>
                  <div className="rev-bar" style={{ height: `${maxRev ? (r.revenue/maxRev)*120 : 4}px` }} />
                  <span className="rev-bar-label">{new Date(r.date).toLocaleDateString("id-ID",{weekday:"short"})}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Membership */}
        <div className="dashboard-membership glass-card">
          <h4>Distribusi Membership</h4>
          {data.membership.map(m => (
            <div key={m.membership} className="mem-row">
              <span className="mem-row__tier">{m.membership}</span>
              <MiniBar value={m.count} max={data.totalUsers || 1} />
              <span className="mem-row__count">{m.count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Top Products */}
      <div className="glass-card dashboard-top-products">
        <h4><TrendingUp size={16}/> Produk Terlaris</h4>
        <table className="admin-table">
          <thead><tr><th>#</th><th>Produk</th><th>Terjual</th><th>Pendapatan</th></tr></thead>
          <tbody>
            {data.topProducts.map((p, i) => (
              <tr key={i}>
                <td><span className="rank-badge">{i+1}</span></td>
                <td>{p.product_name}</td>
                <td>{p.total_qty}x</td>
                <td style={{ color: "var(--clr-primary)" }}>{formatPrice(p.total_revenue)}</td>
              </tr>
            ))}
            {data.topProducts.length === 0 && (
              <tr><td colSpan={4} style={{ textAlign:"center", color:"var(--clr-text-muted)" }}>Belum ada data</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════
// PRODUCTS PANEL
// ══════════════════════════════════════════════════════
function ProductsPanel({ authFetch }) {
  const [products, setProducts] = useState([]);
  const [modal,    setModal]    = useState(null); // null | "add" | product-obj
  const [form,     setForm]     = useState({ id:"", name:"", price:"", category:"food", description:"", tag:"", image_url:"" });
  const [saving,   setSaving]   = useState(false);
  const [search,   setSearch]   = useState("");

  const load = useCallback(async () => {
    const res = await authFetch(`${API}/products`);
    if (res.ok) setProducts(await res.json());
  }, [authFetch]);

  useEffect(() => { load(); }, [load]);

  const openAdd  = () => { setForm({ id: "p"+Date.now(), name:"", price:"", category:"food", description:"", tag:"", image_url:"" }); setModal("add"); };
  const openEdit = (p) => { setForm({ ...p, price: String(p.price) }); setModal("edit"); };

  const save = async () => {
    setSaving(true);
    try {
      const url    = modal === "add" ? `${API}/products` : `${API}/products/${form.id}`;
      const method = modal === "add" ? "POST" : "PUT";
      const res = await authFetch(url, { method, body: JSON.stringify({ ...form, price: Number(form.price) }) });
      if (res.ok) { await load(); setModal(null); }
    } finally { setSaving(false); }
  };

  const del = async (id) => {
    if (!confirm("Hapus produk ini?")) return;
    await authFetch(`${API}/products/${id}`, { method: "DELETE" });
    await load();
  };

  const filtered = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="products-panel">
      <div className="panel-toolbar">
        <div className="admin-search-wrap"><Search size={15} className="admin-search-icon" />
          <input className="form-input admin-search" placeholder="Cari produk..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <button className="btn btn-primary btn-sm" onClick={openAdd}><Plus size={15}/> Tambah Produk</button>
      </div>

      <div className="glass-card admin-table-wrap">
        <table className="admin-table">
          <thead><tr><th>ID</th><th>Nama</th><th>Kategori</th><th>Harga</th><th>Tag</th><th>Status</th><th>Aksi</th></tr></thead>
          <tbody>
            {filtered.map(p => (
              <tr key={p.id}>
                <td><code style={{fontSize:"0.72rem"}}>{p.id}</code></td>
                <td><strong>{p.name}</strong></td>
                <td><span className="cat-chip">{p.category}</span></td>
                <td style={{ color:"var(--clr-primary)" }}>{formatPrice(p.price)}</td>
                <td>{p.tag || "-"}</td>
                <td><span className={`tx-status ${p.is_available ? "tx-status--confirmed" : "tx-status--cancelled"}`}>{p.is_available ? "Aktif" : "Nonaktif"}</span></td>
                <td>
                  <div style={{ display:"flex", gap:"6px" }}>
                    <button className="btn-icon btn-ghost" onClick={() => openEdit(p)} style={{ padding:"6px" }}><Edit2 size={14}/></button>
                    <button className="btn-icon btn-ghost" onClick={() => del(p.id)} style={{ padding:"6px", color:"#f87171" }}><Trash2 size={14}/></button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && <tr><td colSpan={7} style={{ textAlign:"center", color:"var(--clr-text-muted)" }}>Tidak ada produk</td></tr>}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {modal && (
        <div className="admin-modal-overlay" onClick={e => e.target === e.currentTarget && setModal(null)}>
          <div className="admin-modal glass-card">
            <div className="admin-modal__header">
              <h4>{modal === "add" ? "Tambah Produk" : "Edit Produk"}</h4>
              <button onClick={() => setModal(null)}><X size={18}/></button>
            </div>
            <div className="admin-modal__body">
              <div className="admin-form-grid">
                <div className="form-group"><label className="form-label">Nama Produk</label><input className="form-input" value={form.name} onChange={e => setForm(f=>({...f,name:e.target.value}))} /></div>
                <div className="form-group"><label className="form-label">Harga (Rp)</label><input className="form-input" type="number" value={form.price} onChange={e => setForm(f=>({...f,price:e.target.value}))} /></div>
                <div className="form-group"><label className="form-label">Kategori</label>
                  <select className="form-input" value={form.category} onChange={e => setForm(f=>({...f,category:e.target.value}))}>
                    {CATS.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="form-group"><label className="form-label">Tag (opsional)</label><input className="form-input" value={form.tag} onChange={e => setForm(f=>({...f,tag:e.target.value}))} placeholder="Best Seller" /></div>
              </div>
              <div className="form-group"><label className="form-label">Deskripsi</label><textarea className="form-input" rows={3} value={form.description} onChange={e => setForm(f=>({...f,description:e.target.value}))} /></div>
              <div className="form-group"><label className="form-label">URL Gambar</label><input className="form-input" value={form.image_url} onChange={e => setForm(f=>({...f,image_url:e.target.value}))} placeholder="https://..." /></div>
            </div>
            <div className="admin-modal__footer">
              <button className="btn btn-secondary btn-sm" onClick={() => setModal(null)}>Batal</button>
              <button className="btn btn-primary btn-sm" onClick={save} disabled={saving}>{saving ? "Menyimpan..." : <><Save size={14}/> Simpan</>}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════
// TRANSACTIONS PANEL
// ══════════════════════════════════════════════════════
function TransactionsPanel({ authFetch }) {
  const [txs,     setTxs]     = useState([]);
  const [total,   setTotal]   = useState(0);
  const [search,  setSearch]  = useState("");
  const [expanded, setExpanded] = useState(null);
  const [txItems, setTxItems]  = useState({});

  const load = useCallback(async () => {
    const res = await authFetch(`${API}/transactions`);
    if (res.ok) { const d = await res.json(); setTxs(d.transactions); setTotal(d.total); }
  }, [authFetch]);

  useEffect(() => { load(); }, [load]);

  const updateStatus = async (id, status, payment_status) => {
    await authFetch(`${API}/transactions/${id}/status`, { method: "PUT", body: JSON.stringify({ status, payment_status }) });
    await load();
  };

  const toggleExpand = async (id) => {
    if (expanded === id) { setExpanded(null); return; }
    setExpanded(id);
    if (!txItems[id]) {
      const res = await authFetch(`${API}/transactions/${id}/items`);
      if (res.ok) {
        const data = await res.json();
        setTxItems(prev => ({ ...prev, [id]: data }));
      }
    }
  };

  const filtered = txs.filter(t =>
    t.id.toLowerCase().includes(search.toLowerCase()) ||
    t.customer_name.toLowerCase().includes(search.toLowerCase())
  );

  const statusIcon = (s) => s === "confirmed" ? <CheckCircle size={14}/> : s === "cancelled" ? <XCircle size={14}/> : <Clock size={14}/>;

  return (
    <div className="transactions-panel">
      <div className="panel-toolbar">
        <div className="admin-search-wrap"><Search size={15} className="admin-search-icon" />
          <input className="form-input admin-search" placeholder="Cari ID / nama pelanggan..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <span style={{ fontSize:"0.82rem", color:"var(--clr-text-muted)" }}>{total} total transaksi</span>
        <button className="btn btn-ghost btn-sm" onClick={load}><RefreshCw size={14}/></button>
      </div>

      <div className="tx-list">
        {filtered.map(tx => (
          <div key={tx.id} className="tx-admin-card glass-card">
            <div className="tx-admin-header" onClick={() => toggleExpand(tx.id)} style={{ cursor:"pointer" }}>
              <div className="tx-admin-id">
                <strong>{tx.id}</strong>
                <span>{tx.customer_name}</span>
                {tx.table_number && <span className="tx-table-chip">Meja {tx.table_number}</span>}
              </div>
              <div className="tx-admin-meta">
                <span style={{ color:"var(--clr-primary)", fontWeight:700 }}>{formatPrice(tx.total_amount)}</span>
                <span className={`tx-status tx-status--${tx.status}`}>{statusIcon(tx.status)} {tx.status}</span>
                <span className={`tx-status tx-status--${tx.payment_status === "paid" ? "confirmed" : "pending"}`}>{tx.payment_status}</span>
                <span style={{ fontSize:"0.75rem", color:"var(--clr-text-muted)" }}>{new Date(tx.created_at).toLocaleDateString("id-ID")}</span>
                {expanded === tx.id ? <ChevronDown size={16}/> : <ChevronDown size={16} style={{ transform:"rotate(-90deg)" }}/>}
              </div>
            </div>
            {expanded === tx.id && (
              <div className="tx-admin-detail">
                <p style={{ fontSize:"0.82rem", color:"var(--clr-text-muted)" }}>
                  {tx.user_name ? `Pengguna: ${tx.user_name} (${tx.user_email})` : "Tamu"} · Pembayaran: {tx.payment_method}
                </p>
                {tx.note && <p style={{ fontSize:"0.82rem", fontStyle:"italic" }}>📝 {tx.note}</p>}
                {txItems[tx.id] && (
                  <div className="tx-items-list">
                    {txItems[tx.id].map((item, i) => (
                      <div key={i} className="tx-item-row">
                        <span>{item.product_name}</span>
                        <span>x{item.qty}</span>
                        <span>{formatPrice(item.subtotal)}</span>
                      </div>
                    ))}
                  </div>
                )}
                <div className="tx-admin-actions">
                  {tx.status !== "confirmed" && (
                    <button className="btn btn-accent btn-sm" onClick={() => updateStatus(tx.id, "confirmed", "paid")}>
                      <CheckCircle size={14}/> Konfirmasi
                    </button>
                  )}
                  {tx.status !== "cancelled" && (
                    <button className="btn btn-secondary btn-sm" onClick={() => updateStatus(tx.id, "cancelled", "failed")}>
                      <XCircle size={14}/> Batalkan
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
        {filtered.length === 0 && <div className="admin-empty">Tidak ada transaksi ditemukan</div>}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════
// USERS PANEL
// ══════════════════════════════════════════════════════
function UsersPanel({ authFetch }) {
  const [users,  setUsers]  = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    authFetch(`${API}/users`).then(r => r.ok && r.json()).then(d => d && setUsers(d));
  }, [authFetch]);

  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  const MEM_COLOR = { Bronze:"#cd7f32", Silver:"#c0c0c0", Gold:"#ffd700", Platinum:"#e5e4e2" };

  return (
    <div className="users-panel">
      <div className="panel-toolbar">
        <div className="admin-search-wrap"><Search size={15} className="admin-search-icon"/>
          <input className="form-input admin-search" placeholder="Cari nama / email..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <span style={{ fontSize:"0.82rem", color:"var(--clr-text-muted)" }}>{users.length} pengguna terdaftar</span>
      </div>
      <div className="glass-card admin-table-wrap">
        <table className="admin-table">
          <thead><tr><th>Nama</th><th>Email</th><th>Membership</th><th>Poin</th><th>Total Belanja</th><th>Bergabung</th></tr></thead>
          <tbody>
            {filtered.map(u => (
              <tr key={u.id}>
                <td>
                  <div style={{ display:"flex", alignItems:"center", gap:"8px" }}>
                    <div style={{ width:28, height:28, borderRadius:"50%", background:`color-mix(in srgb, ${MEM_COLOR[u.membership]} 20%, transparent)`, color:MEM_COLOR[u.membership], display:"flex",alignItems:"center",justifyContent:"center", fontSize:"0.8rem", fontWeight:700 }}>
                      {u.name?.[0]}
                    </div>
                    {u.name}
                  </div>
                </td>
                <td style={{ fontSize:"0.82rem", color:"var(--clr-text-muted)" }}>{u.email}</td>
                <td><span style={{ color:MEM_COLOR[u.membership], fontWeight:600, fontSize:"0.82rem" }}>{u.membership}</span></td>
                <td style={{ color:"var(--clr-primary)" }}>{u.points.toLocaleString("id-ID")}</td>
                <td>{formatPrice(u.total_spent)}</td>
                <td style={{ fontSize:"0.78rem", color:"var(--clr-text-muted)" }}>{new Date(u.created_at).toLocaleDateString("id-ID")}</td>
              </tr>
            ))}
            {filtered.length === 0 && <tr><td colSpan={6} style={{ textAlign:"center", color:"var(--clr-text-muted)" }}>Tidak ada pengguna</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
