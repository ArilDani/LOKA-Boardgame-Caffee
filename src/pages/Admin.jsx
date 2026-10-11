import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Package, ClipboardList, Users, TrendingUp,
  Plus, Edit2, Trash2, Save, X, Search, RefreshCw,
  DollarSign, ShoppingBag, UserCheck, Star, CheckCircle, Clock, XCircle,
  Rss, Instagram, Upload, Image, Settings, Crown, MessageSquare,
  Dices, CreditCard, Banknote, QrCode, Eye, EyeOff, Calendar,
  ChevronDown, Filter, Download, AlertCircle, Wrench, Database, BookOpen,
  SlidersHorizontal
} from "lucide-react";
import { formatPrice, FOOD_ITEMS, DRINK_NON_COFFEE, DRINK_COFFEE, PLAY_PACKAGES } from "../data/menuData";
import { supabase } from "../lib/supabase";
import "./Admin.css";

const CATS = ["food", "non-coffee", "coffee", "play"];
const GAME_CATS = ["Strategy", "Family", "Party", "Cooperative", "Card Game", "Classic", "Dexterity", "Social"];
const GAME_DIFFICULTIES = ["Easy", "Medium", "Hard"];
const GAME_STATUSES = ["available", "rented", "maintenance", "unavailable"];
const GAME_STATUS_LABEL = { available: "Tersedia", rented: "Disewa", maintenance: "Perbaikan", unavailable: "Tidak Tersedia" };

// Utility Export CSV
const exportToCSV = (filename, rows) => {
  if (!rows || rows.length === 0) return alert("Tidak ada data untuk diekspor");
  const headers = Object.keys(rows[0]);
  const csvContent = [
    headers.join(","),
    ...rows.map(row => headers.map(header => {
      let val = row[header];
      if (val === null || val === undefined) val = "";
      if (typeof val === "object") val = JSON.stringify(val);
      val = String(val).replace(/"/g, '""');
      return `"${val}"`;
    }).join(","))
  ].join("\n");
  
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};


// ── Mini bar chart
function MiniBar({ value, max, color = "var(--clr-primary)" }) {
  const pct = max ? Math.round((value / max) * 100) : 0;
  return <div className="mini-bar"><div className="mini-bar__fill" style={{ width: `${pct}%`, background: color }} /></div>;
}

// ── Stat Card
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
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [page, setPage] = useState("dashboard");
  const [pendingCount, setPendingCount] = useState(0);

  const fetchPendingCount = useCallback(async () => {
    try {
      const { count } = await supabase
        .from("transactions")
        .select("id", { count: "exact", head: true })
        .eq("status", "pending");
      setPendingCount(count || 0);
    } catch {}
  }, []);

  useEffect(() => {
    if (!user) navigate("/login");
    else if (!isAdmin) navigate("/");
    window.scrollTo(0, 0);
  }, [user, isAdmin, navigate]);

  useEffect(() => {
    if (!user || !isAdmin) return;
    fetchPendingCount();
    const interval = setInterval(fetchPendingCount, 3000);
    return () => clearInterval(interval);
  }, [user, isAdmin, fetchPendingCount]);

  if (!user || !isAdmin) return null;

  const navItems = [
    { id: "dashboard",    label: "Dashboard",    icon: LayoutDashboard },
    { id: "products",     label: "Produk",        icon: Package },
    { id: "games",        label: "Games",         icon: Dices },
    { id: "transactions", label: "Transaksi",     icon: ClipboardList },
    { id: "payments",     label: "Pembayaran",    icon: CreditCard },
    { id: "users",        label: "Pengguna",      icon: Users },
    { id: "ratings",      label: "Rating",        icon: Star },
    { id: "settings",     label: "Blog & Sosmed", icon: Settings },
  ];

  return (
    <div className="admin-page">
      <aside className="admin-sidebar">
        <div className="admin-sidebar__brand"><span>⚙️</span> Admin Panel</div>
        <nav className="admin-sidebar__nav">
          {navItems.map(n => (
            <button key={n.id} className={`admin-nav-item ${page === n.id ? "active" : ""}`} onClick={() => setPage(n.id)}>
              <n.icon size={18} /> {n.label}
              {n.id === "transactions" && pendingCount > 0 && (
                <span className="admin-pending-badge">{pendingCount}</span>
              )}
            </button>
          ))}
        </nav>
        <button className="admin-sidebar__back btn btn-ghost btn-sm" onClick={() => navigate("/")}>← Kembali ke Web</button>
      </aside>

      <div className="admin-content">
        <div className="admin-topbar">
          <h3 className="admin-topbar__title">{navItems.find(n => n.id === page)?.label}</h3>
          <div className="admin-topbar__user">
            <div className="admin-topbar__avatar">{user.email?.[0]?.toUpperCase()}</div>
            <span>{user.email}</span>
          </div>
        </div>
        <div className="admin-body">
          {page === "dashboard"    && <DashboardPanel setPage={setPage} />}
          {page === "products"     && <ProductsPanel />}
          {page === "games"        && <GamesPanel />}
          {page === "transactions" && <TransactionsPanel setPage={setPage} onPendingCountChange={fetchPendingCount} />}
          {page === "payments"     && <PaymentsPanel />}
          {page === "users"        && <UsersPanel />}
          {page === "ratings"      && <RatingsPanel />}
          {page === "settings"     && <SettingsPanel />}
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════
// DASHBOARD PANEL
// ══════════════════════════════════════════════════════
function DashboardPanel() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [txFilter, setTxFilter] = useState("all");
  const [historyStatus, setHistoryStatus] = useState("all");
  const [historySearch, setHistorySearch] = useState("");
  const [allTxs, setAllTxs] = useState([]);

  // Section Management State
  const [sectionSettings, setSectionSettings] = useState({
    membership: true,
    instagram: true,
    blog: true,
  });
  const [savingSection, setSavingSection] = useState(null);

  // Edit Transaction Pop-up Modal State
  const [editModalTx, setEditModalTx] = useState(null);
  const [editModalForm, setEditModalForm] = useState({
    customer_name: "",
    table_number: "",
    phone: "",
    note: "",
    total_amount: 0,
    payment_method: "qris",
    status: "confirmed",
    payment_status: "paid",
  });
  const [savingTx, setSavingTx] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [txRes, prodRes, usrRes, chartRes, topRes, memRes, allTxRes, setRes] = await Promise.all([
        supabase.from("transactions").select("total_amount, payment_status, status, created_at"),
        supabase.from("products").select("id", { count: "exact" }),
        supabase.from("profiles").select("id", { count: "exact" }),
        supabase.from("transactions").select("created_at, total_amount, payment_status, status").gte("created_at", new Date(Date.now() - 6 * 86400000).toISOString()).eq("payment_status", "paid").neq("status", "cancelled").neq("status", "deleted"),
        supabase.from("transaction_items").select("product_name, qty, subtotal"),
        supabase.from("profiles").select("membership"),
        supabase.from("transactions").select("*, transaction_items(*)").order("created_at", { ascending: false }).limit(250),
        supabase.from("settings").select("key, value").in("key", ["section_membership_active", "section_instagram_active", "section_blog_active"]),
      ]);

      const txData = txRes.data || [];
      const today = new Date().toISOString().slice(0, 10);
      const validTxs = txData.filter(t => t.payment_status === "paid" && t.status !== "cancelled" && t.status !== "deleted");
      const totalRevenue = validTxs.reduce((s, t) => s + t.total_amount, 0);
      const totalOrders = txData.filter(t => t.status !== "deleted").length;
      const todayRevenue = validTxs.filter(t => t.created_at?.slice(0, 10) === today).reduce((s, t) => s + t.total_amount, 0);
      const todayOrders = txData.filter(t => t.created_at?.slice(0, 10) === today && t.status !== "deleted").length;

      const chartByDate = {};
      (chartRes.data || []).forEach(t => {
        const d = t.created_at?.slice(0, 10);
        if (!chartByDate[d]) chartByDate[d] = { date: d, revenue: 0, orders: 0 };
        chartByDate[d].revenue += t.total_amount;
        chartByDate[d].orders += 1;
      });
      const revenueChart = Object.values(chartByDate).sort((a, b) => a.date.localeCompare(b.date));

      const prodSums = {};
      (topRes.data || []).forEach(item => {
        if (!prodSums[item.product_name]) prodSums[item.product_name] = { product_name: item.product_name, total_qty: 0, total_revenue: 0 };
        prodSums[item.product_name].total_qty += item.qty;
        prodSums[item.product_name].total_revenue += item.subtotal;
      });
      const topProducts = Object.values(prodSums).sort((a, b) => b.total_qty - a.total_qty).slice(0, 8);

      const memCounts = {};
      (memRes.data || []).forEach(u => { memCounts[u.membership] = (memCounts[u.membership] || 0) + 1; });
      const membership = Object.entries(memCounts).map(([membership, count]) => ({ membership, count }));

      setAllTxs(allTxRes.data || []);
      setData({ totalRevenue, totalOrders, todayRevenue, todayOrders, totalUsers: usrRes.count || 0, totalProducts: prodRes.count || 0, revenueChart, topProducts, membership });

      if (setRes?.data) {
        const loadedSec = { membership: true, instagram: true, blog: true };
        setRes.data.forEach(s => {
          if (s.key === "section_membership_active") loadedSec.membership = s.value !== "0";
          if (s.key === "section_instagram_active") loadedSec.instagram = s.value !== "0";
          if (s.key === "section_blog_active") loadedSec.blog = s.value !== "0";
        });
        setSectionSettings(loadedSec);
        try {
          localStorage.setItem("loka_section_settings", JSON.stringify(loadedSec));
        } catch (_) {}
      }
    } finally { setLoading(false); }
  }, []);

  const toggleSection = async (sectionKey) => {
    const nextVal = !sectionSettings[sectionKey];
    setSavingSection(sectionKey);
    try {
      const dbKey = `section_${sectionKey}_active`;
      const { error } = await supabase.from("settings").upsert({
        key: dbKey,
        value: nextVal ? "1" : "0",
        label: `Section ${sectionKey} Active`,
        updated_at: new Date().toISOString()
      }, { onConflict: "key" });
      if (error) throw error;

      const nextSettings = { ...sectionSettings, [sectionKey]: nextVal };
      setSectionSettings(nextSettings);
      try {
        localStorage.setItem("loka_section_settings", JSON.stringify(nextSettings));
        const ch = new BroadcastChannel("loka_section_settings");
        ch.postMessage({ type: "SECTION_SETTINGS_CHANGED", settings: nextSettings });
        ch.close();
      } catch (_) {}
    } catch (err) {
      alert("Gagal mengubah pengaturan section: " + err.message);
    } finally {
      setSavingSection(null);
    }
  };

  const openEditModal = (t) => {
    setEditModalTx(t);
    setEditModalForm({
      customer_name: t.customer_name || "",
      table_number: t.table_number || "",
      phone: t.phone || "",
      note: t.note || "",
      total_amount: t.total_amount ?? 0,
      payment_method: t.payment_method || "qris",
      status: t.status || "confirmed",
      payment_status: t.payment_status || "paid",
    });
  };

  const saveEditModal = async () => {
    if (!editModalTx) return;
    if (!editModalForm.customer_name?.trim()) return alert("Nama pelanggan tidak boleh kosong");
    setSavingTx(true);
    try {
      const payload = {
        customer_name: editModalForm.customer_name.trim(),
        table_number: editModalForm.table_number ? String(editModalForm.table_number).trim() : null,
        phone: editModalForm.phone ? String(editModalForm.phone).trim() : null,
        note: editModalForm.note ? String(editModalForm.note).trim() : null,
        total_amount: Number(editModalForm.total_amount) || 0,
        payment_method: editModalForm.payment_method,
        status: editModalForm.status,
        payment_status: editModalForm.payment_status,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase.from("transactions").update(payload).eq("id", editModalTx.id);
      if (error) throw error;

      try {
        const ch = new BroadcastChannel("loka_tx_updates");
        ch.postMessage({ type: "TX_UPDATED", id: editModalTx.id, status: payload.status, payment_status: payload.payment_status });
        ch.close();
        localStorage.setItem("loka_tx_update", Date.now().toString());
      } catch (_) {}

      setAllTxs(prev => prev.map(t => t.id === editModalTx.id ? { ...t, ...payload } : t));
      setEditModalTx(null);
      await load();
    } catch (err) {
      alert("Gagal menyimpan perubahan: " + err.message);
    } finally {
      setSavingTx(false);
    }
  };

  const deleteTxFromModal = async (id) => {
    if (!confirm(`Hapus transaksi ${id}? Status akan diubah menjadi 'deleted'.`)) return;
    setSavingTx(true);
    try {
      const { error } = await supabase.from("transactions").update({
        status: "deleted",
        payment_status: "cancelled",
        updated_at: new Date().toISOString()
      }).eq("id", id);
      if (error) throw error;

      try {
        const ch = new BroadcastChannel("loka_tx_updates");
        ch.postMessage({ type: "TX_UPDATED", id, status: "deleted", payment_status: "cancelled" });
        ch.close();
        localStorage.setItem("loka_tx_update", Date.now().toString());
      } catch (_) {}

      setEditModalTx(null);
      await load();
    } catch (err) {
      alert("Gagal menghapus transaksi: " + err.message);
    } finally {
      setSavingTx(false);
    }
  };

  useEffect(() => { load(); }, [load]);

  if (loading) return <div className="admin-loading"><RefreshCw size={24} className="spin-icon" /> Memuat data...</div>;
  if (!data) return <div className="admin-loading">Gagal memuat data</div>;

  const maxRev = Math.max(...(data.revenueChart.map(r => r.revenue) || [1]), 1);
  const now = new Date();
  const filteredTxs = allTxs.filter(t => {
    // Date filter
    const txDate = new Date(t.created_at);
    let matchDate = true;
    if (txFilter === "today") matchDate = txDate.toISOString().slice(0, 10) === now.toISOString().slice(0, 10);
    else if (txFilter === "week") matchDate = (now - txDate) < 7 * 86400000;
    else if (txFilter === "month") matchDate = txDate.getMonth() === now.getMonth() && txDate.getFullYear() === now.getFullYear();

    // Status filter
    let matchStatus = true;
    if (historyStatus !== "all") {
      matchStatus = t.status === historyStatus;
    }

    // Search query
    let matchSearch = true;
    if (historySearch.trim()) {
      const q = historySearch.toLowerCase();
      matchSearch =
        t.id.toLowerCase().includes(q) ||
        t.customer_name?.toLowerCase().includes(q) ||
        t.phone?.toLowerCase().includes(q) ||
        (t.table_number && String(t.table_number).toLowerCase().includes(q));
    }

    return matchDate && matchStatus && matchSearch;
  });

  const filteredRevenue = filteredTxs
    .filter(t => t.payment_status === "paid" && t.status !== "cancelled" && t.status !== "deleted")
    .reduce((s, t) => s + t.total_amount, 0);

  return (
    <div className="dashboard-panel">
      <div className="dashboard-stats">
        <StatCard label="Total Pendapatan" value={formatPrice(data.totalRevenue)} icon={DollarSign} color="var(--clr-primary)" sub={`Hari ini: ${formatPrice(data.todayRevenue)}`} />
        <StatCard label="Total Pesanan" value={data.totalOrders} icon={ShoppingBag} color="#52b788" sub={`Hari ini: ${data.todayOrders}`} />
        <StatCard label="Total Pengguna" value={data.totalUsers} icon={UserCheck} color="#6366f1" />
        <StatCard label="Total Produk" value={data.totalProducts} icon={Package} color="var(--clr-primary)" />
      </div>

      <div className="dashboard-row">
        <div className="dashboard-chart glass-card">
          <h4>Pendapatan 7 Hari Terakhir</h4>
          {data.revenueChart.length === 0 ? (
            <p style={{ color: "var(--clr-text-muted)", fontSize: "0.85rem" }}>Belum ada data transaksi.</p>
          ) : (
            <div className="rev-chart">
              {data.revenueChart.map(r => (
                <div key={r.date} className="rev-bar-wrap">
                  <span className="rev-bar-value">{r.revenue > 0 ? `${Math.round(r.revenue / 1000)}k` : "0"}</span>
                  <div className="rev-bar" style={{ height: `${maxRev ? (r.revenue / maxRev) * 120 : 4}px` }} />
                  <span className="rev-bar-label">{new Date(r.date).toLocaleDateString("id-ID", { weekday: "short" })}</span>
                </div>
              ))}
            </div>
          )}
        </div>
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

      <div className="glass-card dashboard-top-products">
        <h4><TrendingUp size={16} /> Produk Terlaris</h4>
        <table className="admin-table">
          <thead><tr><th>#</th><th>Produk</th><th>Terjual</th><th>Pendapatan</th></tr></thead>
          <tbody>
            {data.topProducts.map((p, i) => (
              <tr key={i}><td><span className="rank-badge">{i + 1}</span></td><td>{p.product_name}</td><td>{p.total_qty}x</td><td style={{ color: "var(--clr-primary)" }}>{formatPrice(p.total_revenue)}</td></tr>
            ))}
            {data.topProducts.length === 0 && (<tr><td colSpan={4} style={{ textAlign: "center", color: "var(--clr-text-muted)" }}>Belum ada data</td></tr>)}
          </tbody>
        </table>
      </div>

      {/* ── Manajemen Section Dashboard ── */}
      <div className="glass-card section-mgmt-card">
        <div className="section-mgmt-header">
          <div>
            <h4><SlidersHorizontal size={17} color="var(--clr-primary)" /> Manajemen Tampilan Section (Home & About)</h4>
            <p style={{ fontSize: "0.8rem", color: "var(--clr-text-muted)", margin: 0, marginTop: "2px" }}>
              Aktifkan atau matikan section di website agar halaman tidak kelihatan kosong jika konten belum tersedia.
            </p>
          </div>
        </div>

        <div className="section-mgmt-grid">
          {/* Membership Section */}
          <div className={`section-toggle-card ${sectionSettings.membership ? "section-toggle-card--active" : ""}`}>
            <div className="section-toggle-info">
              <div className="section-toggle-icon" style={{ background: "rgba(245, 158, 11, 0.15)", color: "#f59e0b" }}>
                <Crown size={20} />
              </div>
              <div className="section-toggle-texts">
                <div className="section-toggle-title">
                  Section Membership
                  <span className={`status-badge ${sectionSettings.membership ? "status-confirmed" : "status-cancelled"}`} style={{ fontSize: "0.68rem", padding: "1px 6px" }}>
                    {sectionSettings.membership ? "Aktif" : "Nonaktif"}
                  </span>
                </div>
                <span className="section-toggle-desc">
                  Teaser tier membership di Home & menu navigasi
                </span>
              </div>
            </div>
            <label className="switch-toggle" title={sectionSettings.membership ? "Matikan section membership" : "Aktifkan section membership"}>
              <input
                type="checkbox"
                checked={sectionSettings.membership}
                onChange={() => toggleSection("membership")}
                disabled={savingSection === "membership"}
              />
              <span className="switch-slider" />
            </label>
          </div>

          {/* Instagram Section */}
          <div className={`section-toggle-card ${sectionSettings.instagram ? "section-toggle-card--active" : ""}`}>
            <div className="section-toggle-info">
              <div className="section-toggle-icon" style={{ background: "rgba(236, 72, 153, 0.15)", color: "#ec4899" }}>
                <Instagram size={20} />
              </div>
              <div className="section-toggle-texts">
                <div className="section-toggle-title">
                  Section Instagram
                  <span className={`status-badge ${sectionSettings.instagram ? "status-confirmed" : "status-cancelled"}`} style={{ fontSize: "0.68rem", padding: "1px 6px" }}>
                    {sectionSettings.instagram ? "Aktif" : "Nonaktif"}
                  </span>
                </div>
                <span className="section-toggle-desc">
                  Feed galeri & tautan profil Instagram di Home
                </span>
              </div>
            </div>
            <label className="switch-toggle" title={sectionSettings.instagram ? "Matikan section instagram" : "Aktifkan section instagram"}>
              <input
                type="checkbox"
                checked={sectionSettings.instagram}
                onChange={() => toggleSection("instagram")}
                disabled={savingSection === "instagram"}
              />
              <span className="switch-slider" />
            </label>
          </div>

          {/* Blog Section */}
          <div className={`section-toggle-card ${sectionSettings.blog ? "section-toggle-card--active" : ""}`}>
            <div className="section-toggle-info">
              <div className="section-toggle-icon" style={{ background: "rgba(59, 130, 246, 0.15)", color: "#3b82f6" }}>
                <BookOpen size={20} />
              </div>
              <div className="section-toggle-texts">
                <div className="section-toggle-title">
                  Section Blog & Artikel
                  <span className={`status-badge ${sectionSettings.blog ? "status-confirmed" : "status-cancelled"}`} style={{ fontSize: "0.68rem", padding: "1px 6px" }}>
                    {sectionSettings.blog ? "Aktif" : "Nonaktif"}
                  </span>
                </div>
                <span className="section-toggle-desc">
                  Postingan cerita & artikel di Home dan About
                </span>
              </div>
            </div>
            <label className="switch-toggle" title={sectionSettings.blog ? "Matikan section blog" : "Aktifkan section blog"}>
              <input
                type="checkbox"
                checked={sectionSettings.blog}
                onChange={() => toggleSection("blog")}
                disabled={savingSection === "blog"}
              />
              <span className="switch-slider" />
            </label>
          </div>
        </div>
      </div>

      {/* Transaction History Table */}
      <div className="glass-card" style={{ padding: "var(--space-xl)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-lg)", flexWrap: "wrap", gap: "0.75rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <h4 style={{ display: "flex", alignItems: "center", gap: "8px", margin: 0 }}><ClipboardList size={16} /> Riwayat Transaksi</h4>
            <button className="btn btn-secondary btn-sm" onClick={() => exportToCSV(`Riwayat_Transaksi_${new Date().toISOString().slice(0,10)}.csv`, filteredTxs)}><Download size={14} /> Export CSV</button>
            <button className="btn btn-ghost btn-sm" onClick={load} title="Refresh riwayat"><RefreshCw size={14} /></button>
          </div>
          <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
            {[{ id: "all", label: "Semua Waktu" }, { id: "today", label: "Hari Ini" }, { id: "week", label: "Minggu Ini" }, { id: "month", label: "Bulan Ini" }].map(f => (
              <button key={f.id} className={`btn btn-sm ${txFilter === f.id ? "btn-primary" : "btn-ghost"}`} onClick={() => setTxFilter(f.id)}>{f.label}</button>
            ))}
          </div>
        </div>

        {/* Toolbar Filter & Search */}
        <div style={{ display: "flex", gap: "0.75rem", marginBottom: "var(--space-md)", flexWrap: "wrap", alignItems: "center" }}>
          <div className="search-wrap" style={{ flex: 1, minWidth: 200, maxWidth: 360 }}>
            <Search size={16} />
            <input className="form-input search-input" placeholder="Cari ID, pelanggan, meja..." value={historySearch} onChange={e => setHistorySearch(e.target.value)} />
          </div>
          <div style={{ display: "flex", gap: "0.4rem", alignItems: "center", flexWrap: "wrap" }}>
            <span style={{ fontSize: "0.78rem", color: "var(--clr-text-muted)" }}>Status:</span>
            {[
              { id: "all", label: "Semua" },
              { id: "confirmed", label: "Confirmed" },
              { id: "cancelled", label: "Cancelled" },
              { id: "deleted", label: "Dihapus" },
              { id: "pending", label: "Pending" }
            ].map(st => (
              <button
                key={st.id}
                type="button"
                className={`btn btn-sm ${historyStatus === st.id ? "btn-primary" : "btn-ghost"}`}
                style={{ fontSize: "0.75rem", padding: "4px 10px" }}
                onClick={() => setHistoryStatus(st.id)}
              >
                {st.label}
              </button>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: "var(--space-md)", fontSize: "0.85rem", color: "var(--clr-text-muted)" }}>
          {filteredTxs.length} transaksi ditampilkan · Total Diterima: <strong style={{ color: "var(--clr-primary)" }}>{formatPrice(filteredRevenue)}</strong>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table className="admin-table">
            <thead><tr><th>ID</th><th>Pelanggan</th><th>Meja</th><th>Items</th><th>Total</th><th>Metode</th><th>Status</th><th>Bayar</th><th>Waktu</th><th>Aksi</th></tr></thead>
            <tbody>
              {filteredTxs.map(t => (
                <tr key={t.id}>
                  <td style={{ fontFamily: "monospace", fontSize: "0.78rem" }}>{t.id}</td>
                  <td><div>{t.customer_name}</div>{t.phone && <small style={{ color: "var(--clr-text-dim)" }}>{t.phone}</small>}</td>
                  <td>{t.table_number || "\u2014"}</td>
                  <td style={{ fontSize: "0.78rem", maxWidth: 180 }}>{(t.transaction_items || []).map(it => `${it.product_name} x${it.qty}`).join(", ") || "\u2014"}</td>
                  <td style={{ color: "var(--clr-primary)", fontWeight: 600 }}>{formatPrice(t.total_amount)}</td>
                  <td style={{ textTransform: "capitalize" }}>{t.payment_method}</td>
                  <td>
                    <span className={`status-badge status-${t.status || "pending"}`}>
                      {t.status === "confirmed" ? <><CheckCircle size={11} color="#52b788" /> Confirmed</> :
                       t.status === "cancelled" ? <><XCircle size={11} color="#ef4444" /> Cancelled</> :
                       t.status === "deleted" ? <><Trash2 size={11} color="#94a3b8" /> Dihapus</> :
                       <><Clock size={11} /> Pending</>}
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge ${t.payment_status === "paid" ? "status-confirmed" : t.payment_status === "cancelled" ? "status-cancelled" : "status-pending"}`}>
                      {t.payment_status}
                    </span>
                  </td>
                  <td style={{ fontSize: "0.78rem", color: "var(--clr-text-muted)", whiteSpace: "nowrap" }}>{new Date(t.created_at).toLocaleString("id-ID", { dateStyle: "short", timeStyle: "short" })}</td>
                  <td>
                    <button className="btn btn-ghost btn-sm btn-icon" onClick={() => openEditModal(t)} title="Detail & Edit Pesanan">
                      <Eye size={13} />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredTxs.length === 0 && (<tr><td colSpan={10} style={{ textAlign: "center", color: "var(--clr-text-muted)" }}>Tidak ada transaksi dalam riwayat</td></tr>)}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pop-up Modal Detail & Edit Riwayat Transaksi */}
      {editModalTx && (
        <div className="admin-modal-overlay" onClick={() => setEditModalTx(null)}>
          <div className="admin-modal glass-card" style={{ maxWidth: 660, maxHeight: "90vh", display: "flex", flexDirection: "column" }} onClick={e => e.stopPropagation()}>
            <div className="admin-modal__header">
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <h4 style={{ margin: 0 }}>Detail &amp; Edit Pesanan</h4>
                  <span style={{ fontFamily: "monospace", fontSize: "0.85rem", color: "var(--clr-primary)", fontWeight: 700 }}>#{editModalTx.id}</span>
                </div>
                <small style={{ color: "var(--clr-text-dim)" }}>
                  Waktu: {new Date(editModalTx.created_at).toLocaleString("id-ID", { dateStyle: "long", timeStyle: "short" })}
                </small>
              </div>
              <button className="btn btn-ghost btn-sm btn-icon" onClick={() => setEditModalTx(null)}>
                <X size={16} />
              </button>
            </div>

            <div className="admin-modal__body" style={{ overflowY: "auto", display: "flex", flexDirection: "column", gap: "1rem", padding: "var(--space-lg) var(--space-xl)" }}>
              {/* Form Input fields */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Nama Pelanggan *</label>
                  <input className="form-input" value={editModalForm.customer_name} onChange={e => setEditModalForm(f => ({ ...f, customer_name: e.target.value }))} placeholder="Nama Pelanggan" />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">No. Meja</label>
                  <input className="form-input" value={editModalForm.table_number} onChange={e => setEditModalForm(f => ({ ...f, table_number: e.target.value }))} placeholder="Contoh: 3, Bar, dll" />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Telepon / WhatsApp</label>
                  <input className="form-input" value={editModalForm.phone} onChange={e => setEditModalForm(f => ({ ...f, phone: e.target.value }))} placeholder="08xxxxxxxxxx" />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Metode Pembayaran</label>
                  <select className="form-input" value={editModalForm.payment_method} onChange={e => setEditModalForm(f => ({ ...f, payment_method: e.target.value }))}>
                    <option value="qris">QRIS</option>
                    <option value="cash">Cash / Tunai</option>
                    <option value="transfer">Transfer Bank</option>
                  </select>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Total Harga (IDR) *</label>
                  <input className="form-input" type="number" value={editModalForm.total_amount} onChange={e => setEditModalForm(f => ({ ...f, total_amount: e.target.value }))} />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Status Pesanan</label>
                  <select className="form-input" value={editModalForm.status} onChange={e => setEditModalForm(f => ({ ...f, status: e.target.value }))}>
                    <option value="confirmed">Confirmed</option>
                    <option value="pending">Pending</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="deleted">Dihapus</option>
                  </select>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Status Pembayaran</label>
                  <select className="form-input" value={editModalForm.payment_status} onChange={e => setEditModalForm(f => ({ ...f, payment_status: e.target.value }))}>
                    <option value="paid">Paid (Lunas)</option>
                    <option value="pending">Pending (Belum Bayar)</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Catatan Pesanan</label>
                  <input className="form-input" value={editModalForm.note} onChange={e => setEditModalForm(f => ({ ...f, note: e.target.value }))} placeholder="Catatan pesanan..." />
                </div>
              </div>

              {/* Product Items Breakdown */}
              <div>
                <label className="form-label" style={{ marginBottom: "6px", display: "flex", justifyContent: "space-between" }}>
                  <span>Rincian Item Pesanan ({ (editModalTx.transaction_items || []).length } item)</span>
                  <span style={{ fontSize: "0.78rem", color: "var(--clr-text-muted)" }}>Total Pesanan: {formatPrice(editModalForm.total_amount)}</span>
                </label>
                <div style={{ border: "1px solid var(--clr-border)", borderRadius: "var(--radius-md)", overflow: "hidden", maxHeight: 180, overflowY: "auto" }}>
                  <table className="admin-table" style={{ margin: 0 }}>
                    <thead><tr><th>Produk</th><th>Harga</th><th>Qty</th><th>Subtotal</th></tr></thead>
                    <tbody>
                      {(editModalTx.transaction_items || []).map((it, i) => (
                        <tr key={i}>
                          <td>{it.product_name}</td>
                          <td>{formatPrice(it.price)}</td>
                          <td>{it.qty}</td>
                          <td style={{ color: "var(--clr-primary)", fontWeight: 600 }}>{formatPrice(it.subtotal)}</td>
                        </tr>
                      ))}
                      {(editModalTx.transaction_items || []).length === 0 && (
                        <tr><td colSpan={4} style={{ textAlign: "center", color: "var(--clr-text-muted)" }}>Tidak ada data item</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="admin-modal__footer" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <button type="button" className="btn btn-ghost btn-sm" style={{ color: "#ef4444" }} onClick={() => deleteTxFromModal(editModalTx.id)} disabled={savingTx}>
                <Trash2 size={14} /> Hapus Transaksi
              </button>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => setEditModalTx(null)}>
                  Batal
                </button>
                <button type="button" className="btn btn-primary btn-sm" onClick={saveEditModal} disabled={savingTx}>
                  {savingTx ? <RefreshCw size={14} className="spin-icon" /> : <Save size={14} />} Simpan Perubahan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════
// PRODUCTS PANEL
// ══════════════════════════════════════════════════════
function ProductsPanel() {
  const [products, setProducts] = useState([]);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({ id: "", name: "", price: "", category: "food", description: "", tag: "", image_url: "", is_available: true });
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef();

  const load = useCallback(async () => {
    const { data } = await supabase.from("products").select("*").order("category").order("name");
    setProducts(data || []);
  }, []);

  useEffect(() => { load(); }, [load]);

  const openAdd = () => { setForm({ id: "p" + Date.now(), name: "", price: "", category: "food", description: "", tag: "", image_url: "", is_available: true }); setModal("add"); };
  const openEdit = (p) => { setForm({ ...p, price: String(p.price) }); setModal("edit"); };

  const seedDataAwal = async () => {
    if (!confirm("Ini akan memasukkan data awal dari menuData.js ke database. Lanjutkan?")) return;
    setSaving(true);
    try {
      const allItems = [...FOOD_ITEMS, ...DRINK_NON_COFFEE, ...DRINK_COFFEE, ...PLAY_PACKAGES];
      for (const item of allItems) {
        // Cek apakah sudah ada
        const { data: existing } = await supabase.from("products").select("id").eq("name", item.name).single();
        if (!existing) {
          await supabase.from("products").insert({
            id: item.id || ("p" + Date.now() + Math.floor(Math.random()*1000)),
            name: item.name,
            price: item.price,
            category: item.category,
            description: item.description || "",
            tag: item.tag || "",
            image_url: item.image || "",
            is_available: true
          });
        }
      }
      alert("Berhasil sinkronisasi data awal!");
      await load();
    } catch (err) {
      alert("Gagal sinkronisasi: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (file) => {
    if (!file) return;
    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const fileName = `product-${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from("product-images").upload(fileName, file, { upsert: true });
      if (error) throw error;
      const { data: urlData } = supabase.storage.from("product-images").getPublicUrl(fileName);
      setForm(f => ({ ...f, image_url: urlData.publicUrl }));
    } catch (err) {
      alert("Upload gagal: " + err.message);
    } finally { setUploading(false); }
  };

  const save = async () => {
    if (!form.name || !form.price || !form.category) return alert("Nama, harga, kategori wajib diisi");
    setSaving(true);
    try {
      const payload = { id: form.id, name: form.name, price: Number(form.price), category: form.category, description: form.description || "", tag: form.tag || "", image_url: form.image_url || "", is_available: form.is_available };
      if (modal === "add") {
        const { error } = await supabase.from("products").insert(payload);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("products").update({ name: payload.name, price: payload.price, category: payload.category, description: payload.description, tag: payload.tag, image_url: payload.image_url, is_available: payload.is_available, updated_at: new Date().toISOString() }).eq("id", form.id);
        if (error) throw error;
      }
      await load();
      setModal(null);
    } catch (err) {
      alert("Gagal menyimpan: " + err.message);
    } finally { setSaving(false); }
  };

  const del = async (id) => {
    if (!confirm("Hapus produk ini?")) return;
    await supabase.from("products").delete().eq("id", id);
    await load();
  };

  const filtered = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.category.toLowerCase().includes(search.toLowerCase()));
  const catLabel = { food: "Makanan", "non-coffee": "Non-Kopi", coffee: "Kopi", play: "Paket Main" };

  return (
    <div className="products-panel">
      <div className="panel-toolbar">
        <div className="search-wrap"><Search size={16} /><input className="form-input search-input" placeholder="Cari produk..." value={search} onChange={e => setSearch(e.target.value)} /></div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="btn btn-secondary btn-sm" onClick={seedDataAwal} disabled={saving}>
            {saving ? <RefreshCw size={16} className="spin-icon"/> : <Database size={16} />} Sinkron Data Awal
          </button>
          <button className="btn btn-primary btn-sm" onClick={openAdd}><Plus size={16} /> Tambah Produk</button>
        </div>
      </div>

      {CATS.map(cat => {
        const catProds = filtered.filter(p => p.category === cat);
        if (catProds.length === 0) return null;
        return (
          <div key={cat} className="product-group">
            <h4 className="product-group__title">{catLabel[cat] || cat}</h4>
            <table className="admin-table">
              <thead><tr><th>Gambar</th><th>Nama</th><th>Harga</th><th>Tag</th><th>Tersedia</th><th>Aksi</th></tr></thead>
              <tbody>
                {catProds.map(p => (
                  <tr key={p.id}>
                    <td>{p.image_url ? <img src={p.image_url} alt={p.name} style={{ width: 44, height: 44, objectFit: "cover", borderRadius: 8 }} /> : <div style={{ width: 44, height: 44, background: "var(--clr-bg-3)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}><Image size={18} color="var(--clr-text-dim)" /></div>}</td>
                    <td>{p.name}</td>
                    <td style={{ color: "var(--clr-primary)", fontWeight: 600 }}>{formatPrice(p.price)}</td>
                    <td>{p.tag && <span className="product-tag">{p.tag}</span>}</td>
                    <td><span className={`status-badge ${p.is_available ? "status-confirmed" : "status-cancelled"}`}>{p.is_available ? "Ya" : "Tidak"}</span></td>
                    <td><div style={{ display: "flex", gap: "0.4rem" }}><button className="btn btn-ghost btn-sm btn-icon" onClick={() => openEdit(p)} title="Edit"><Edit2 size={14} /></button><button className="btn btn-ghost btn-sm btn-icon" style={{ color: "#ef4444" }} onClick={() => del(p.id)} title="Hapus"><Trash2 size={14} /></button></div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      })}

      {modal && (
        <div className="admin-modal-overlay" onClick={() => setModal(null)}>
          <div className="admin-modal glass-card" onClick={e => e.stopPropagation()}>
            <div className="admin-modal__header"><h4>{modal === "add" ? "Tambah Produk" : "Edit Produk"}</h4><button className="btn btn-ghost btn-sm btn-icon" onClick={() => setModal(null)}><X size={16} /></button></div>
            <div className="admin-modal__body">
              <div className="form-group"><label className="form-label">Nama Produk *</label><input className="form-input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div className="form-group"><label className="form-label">Harga (IDR) *</label><input className="form-input" type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} /></div>
                <div className="form-group"><label className="form-label">Kategori *</label><select className="form-input" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>{CATS.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
              </div>
              <div className="form-group"><label className="form-label">Deskripsi</label><textarea className="form-input" rows={2} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} /></div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div className="form-group"><label className="form-label">Tag (Best Seller, dll)</label><input className="form-input" value={form.tag} onChange={e => setForm(f => ({ ...f, tag: e.target.value }))} /></div>
                <div className="form-group"><label className="form-label">Tersedia</label><select className="form-input" value={form.is_available ? "1" : "0"} onChange={e => setForm(f => ({ ...f, is_available: e.target.value === "1" }))}><option value="1">Ya</option><option value="0">Tidak</option></select></div>
              </div>
              <div className="form-group">
                <label className="form-label">Gambar Produk</label>
                <div style={{ display: "flex", gap: "0.75rem", alignItems: "flex-start", flexWrap: "wrap" }}>
                  {form.image_url && <img src={form.image_url} alt="preview" style={{ width: 80, height: 80, objectFit: "cover", borderRadius: 8, border: "1px solid var(--clr-border)" }} />}
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", flex: 1 }}>
                    <input className="form-input" placeholder="URL gambar atau upload di bawah" value={form.image_url} onChange={e => setForm(f => ({ ...f, image_url: e.target.value }))} />
                    <button type="button" className="btn btn-ghost btn-sm" onClick={() => fileRef.current?.click()} disabled={uploading}>{uploading ? <RefreshCw size={14} className="spin-icon" /> : <Upload size={14} />}{uploading ? "Uploading..." : "Upload Gambar"}</button>
                    <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={e => handleImageUpload(e.target.files?.[0])} />
                  </div>
                </div>
              </div>
            </div>
            <div className="admin-modal__footer"><button className="btn btn-ghost btn-sm" onClick={() => setModal(null)}>Batal</button><button className="btn btn-primary btn-sm" onClick={save} disabled={saving}>{saving ? <RefreshCw size={14} className="spin-icon" /> : <Save size={14} />} Simpan</button></div>
          </div>
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════
// GAMES PANEL — Manage Boardgames
// ══════════════════════════════════════════════════════
function GamesPanel() {
  const [games, setGames] = useState([]);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({ id: "", name: "", category: "Strategy", players: "2-4", duration: "30 min", difficulty: "Easy", description: "", image_url: "", rent_price_per_hour: "10000", status: "available", is_active: true });
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [filterSt, setFilterSt] = useState("all");
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef();

  const [rentAwayNote, setRentAwayNote] = useState("");
  const [savingNote, setSavingNote] = useState(false);

  const load = useCallback(async () => {
    const { data } = await supabase.from("boardgames").select("*").order("name");
    setGames(data || []);
    
    const { data: noteData } = await supabase.from("settings").select("value").eq("key", "game_rent_away_note").single();
    if (noteData) setRentAwayNote(noteData.value);
  }, []);

  useEffect(() => { load(); }, [load]);

  const saveNote = async () => {
    setSavingNote(true);
    try {
      const { error } = await supabase.from('settings').upsert({ key: 'game_rent_away_note', value: rentAwayNote, updated_at: new Date().toISOString() });
      if (error) throw error;
      alert("Catatan Sewa Pulang berhasil disimpan");
    } catch(err) {
      alert("Gagal menyimpan: " + err.message);
    }
    setSavingNote(false);
  };

  const openAdd = () => {
    setForm({ id: "bg" + Date.now(), name: "", category: "Strategy", players: "2-4", duration: "30 min", difficulty: "Easy", description: "", image_url: "", rent_price_per_hour: "10000", status: "available", is_active: true });
    setModal("add");
  };

  const openEdit = (g) => {
    setForm({ ...g, rent_price_per_hour: String(g.rent_price_per_hour || 10000) });
    setModal("edit");
  };

  const handleImageUpload = async (file) => {
    if (!file) return;
    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const fileName = `game-${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from("product-images").upload(fileName, file, { upsert: true });
      if (error) throw error;
      const { data: urlData } = supabase.storage.from("product-images").getPublicUrl(fileName);
      setForm(f => ({ ...f, image_url: urlData.publicUrl }));
    } catch (err) { alert("Upload gagal: " + err.message); }
    finally { setUploading(false); }
  };

  const save = async () => {
    if (!form.name) return alert("Nama game wajib diisi");
    setSaving(true);
    try {
      const payload = { id: form.id, name: form.name, category: form.category, players: form.players, duration: form.duration, difficulty: form.difficulty, description: form.description || "", image_url: form.image_url || "", rent_price_per_hour: Number(form.rent_price_per_hour) || 10000, status: form.status, is_active: form.is_active };
      if (modal === "add") {
        const { error } = await supabase.from("boardgames").insert(payload);
        if (error) throw error;
      } else {
        const { id, ...updates } = payload;
        updates.updated_at = new Date().toISOString();
        const { error } = await supabase.from("boardgames").update(updates).eq("id", form.id);
        if (error) throw error;
      }
      await load(); setModal(null);
    } catch (err) { alert("Gagal menyimpan: " + err.message); }
    finally { setSaving(false); }
  };

  const del = async (id) => { if (!confirm("Hapus game ini?")) return; await supabase.from("boardgames").delete().eq("id", id); await load(); };

  const quickStatus = async (id, status) => { await supabase.from("boardgames").update({ status, updated_at: new Date().toISOString() }).eq("id", id); await load(); };

  const filtered = games.filter(g => {
    const matchSearch = g.name.toLowerCase().includes(search.toLowerCase()) || g.category.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterSt === "all" || g.status === filterSt;
    return matchSearch && matchStatus;
  });

  return (
    <div className="products-panel">
      <div className="panel-toolbar">
        <div className="search-wrap"><Search size={16} /><input className="form-input search-input" placeholder="Cari game..." value={search} onChange={e => setSearch(e.target.value)} /></div>
        <select className="form-input" style={{ width: "auto", minWidth: 130 }} value={filterSt} onChange={e => setFilterSt(e.target.value)}>
          <option value="all">Semua Status</option>
          {GAME_STATUSES.map(s => <option key={s} value={s}>{GAME_STATUS_LABEL[s]}</option>)}
        </select>
        <button className="btn btn-primary btn-sm" onClick={openAdd}><Plus size={16} /> Tambah Game</button>
      </div>

      <div style={{ fontSize: "0.82rem", color: "var(--clr-text-muted)", marginBottom: "var(--space-md)" }}>
        Total: {filtered.length} game · Tersedia: {filtered.filter(g => g.status === "available").length} · Disewa: {filtered.filter(g => g.status === "rented").length}
      </div>

      <div className="glass-card" style={{ padding: '1rem', marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h4 style={{ margin: 0, fontSize: '0.9rem' }}>Catatan "Sewa Pulang" (Ditampilkan ke pengguna saat memilih Sewa Pulang)</h4>
          <button className="btn btn-primary btn-sm" onClick={saveNote} disabled={savingNote}>
            {savingNote ? "Menyimpan..." : "Simpan Catatan"}
          </button>
        </div>
        <input 
          className="form-input" 
          value={rentAwayNote} 
          onChange={e => setRentAwayNote(e.target.value)} 
          placeholder="Catatan: Game tidak diantarkan ke rumah..." 
        />
      </div>

      <div className="glass-card" style={{ padding: '1rem', marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h4 style={{ margin: 0, fontSize: '0.9rem' }}>Catatan "Sewa Pulang" (Ditampilkan ke pengguna saat memilih Sewa Pulang)</h4>
          <button className="btn btn-primary btn-sm" onClick={saveNote} disabled={savingNote}>
            {savingNote ? "Menyimpan..." : "Simpan Catatan"}
          </button>
        </div>
        <input 
          className="form-input" 
          value={rentAwayNote} 
          onChange={e => setRentAwayNote(e.target.value)} 
          placeholder="Catatan: Game tidak diantarkan ke rumah..." 
        />
      </div>

      <div style={{ overflowX: "auto" }}>
        <table className="admin-table">
          <thead><tr><th>Gambar</th><th>Nama</th><th>Kategori</th><th>Pemain</th><th>Durasi</th><th>Difficulty</th><th>Harga/jam</th><th>Status</th><th>Aktif</th><th>Aksi</th></tr></thead>
          <tbody>
            {filtered.map(g => (
              <tr key={g.id}>
                <td>{g.image_url ? <img src={g.image_url} alt={g.name} style={{ width: 44, height: 44, objectFit: "cover", borderRadius: 8 }} /> : <div style={{ width: 44, height: 44, background: "var(--clr-bg-3)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}><Dices size={18} color="var(--clr-text-dim)" /></div>}</td>
                <td style={{ fontWeight: 500 }}>{g.name}</td>
                <td><span className="product-tag">{g.category}</span></td>
                <td>{g.players}</td>
                <td>{g.duration}</td>
                <td><span style={{ color: g.difficulty === "Easy" ? "#52b788" : g.difficulty === "Medium" ? "#c8963e" : "#f87171", fontWeight: 600 }}>{g.difficulty}</span></td>
                <td style={{ color: "var(--clr-primary)", fontWeight: 600 }}>{formatPrice(g.rent_price_per_hour || 10000)}</td>
                <td>
                  <select className="form-input" style={{ fontSize: "0.75rem", padding: "4px 8px", width: "auto", minWidth: 100 }} value={g.status} onChange={e => quickStatus(g.id, e.target.value)}>
                    {GAME_STATUSES.map(s => <option key={s} value={s}>{GAME_STATUS_LABEL[s]}</option>)}
                  </select>
                </td>
                <td><span className={`status-badge ${g.is_active ? "status-confirmed" : "status-cancelled"}`}>{g.is_active ? "Ya" : "Tidak"}</span></td>
                <td><div style={{ display: "flex", gap: "0.4rem" }}><button className="btn btn-ghost btn-sm btn-icon" onClick={() => openEdit(g)} title="Edit"><Edit2 size={14} /></button><button className="btn btn-ghost btn-sm btn-icon" style={{ color: "#ef4444" }} onClick={() => del(g.id)} title="Hapus"><Trash2 size={14} /></button></div></td>
              </tr>
            ))}
            {filtered.length === 0 && <tr><td colSpan={10} style={{ textAlign: "center", color: "var(--clr-text-muted)" }}>Tidak ada game</td></tr>}
          </tbody>
        </table>
      </div>

      {modal && (
        <div className="admin-modal-overlay" onClick={() => setModal(null)}>
          <div className="admin-modal glass-card" onClick={e => e.stopPropagation()} style={{ maxWidth: 600 }}>
            <div className="admin-modal__header"><h4>{modal === "add" ? "Tambah Game" : "Edit Game"}</h4><button className="btn btn-ghost btn-sm btn-icon" onClick={() => setModal(null)}><X size={16} /></button></div>
            <div className="admin-modal__body">
              <div className="form-group"><label className="form-label">Nama Game *</label><input className="form-input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div className="form-group"><label className="form-label">Kategori</label><select className="form-input" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>{GAME_CATS.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
                <div className="form-group"><label className="form-label">Difficulty</label><select className="form-input" value={form.difficulty} onChange={e => setForm(f => ({ ...f, difficulty: e.target.value }))}>{GAME_DIFFICULTIES.map(d => <option key={d} value={d}>{d}</option>)}</select></div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div className="form-group"><label className="form-label">Jumlah Pemain</label><input className="form-input" placeholder="Contoh: 2-4" value={form.players} onChange={e => setForm(f => ({ ...f, players: e.target.value }))} /></div>
                <div className="form-group"><label className="form-label">Durasi</label><input className="form-input" placeholder="Contoh: 30 min" value={form.duration} onChange={e => setForm(f => ({ ...f, duration: e.target.value }))} /></div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div className="form-group"><label className="form-label">Harga Sewa / Jam (IDR)</label><input className="form-input" type="number" value={form.rent_price_per_hour} onChange={e => setForm(f => ({ ...f, rent_price_per_hour: e.target.value }))} /></div>
                <div className="form-group"><label className="form-label">Status</label><select className="form-input" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>{GAME_STATUSES.map(s => <option key={s} value={s}>{GAME_STATUS_LABEL[s]}</option>)}</select></div>
              </div>
              <div className="form-group"><label className="form-label">Deskripsi</label><textarea className="form-input" rows={2} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} /></div>
              <div className="form-group"><label className="form-label">Aktif di Katalog</label><select className="form-input" value={form.is_active ? "1" : "0"} onChange={e => setForm(f => ({ ...f, is_active: e.target.value === "1" }))}><option value="1">Ya — Tampil di katalog</option><option value="0">Tidak — Sembunyikan</option></select></div>
              <div className="form-group">
                <label className="form-label">Gambar Game</label>
                <div style={{ display: "flex", gap: "0.75rem", alignItems: "flex-start", flexWrap: "wrap" }}>
                  {form.image_url && <img src={form.image_url} alt="preview" style={{ width: 80, height: 80, objectFit: "cover", borderRadius: 8, border: "1px solid var(--clr-border)" }} />}
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", flex: 1 }}>
                    <input className="form-input" placeholder="URL gambar atau upload" value={form.image_url} onChange={e => setForm(f => ({ ...f, image_url: e.target.value }))} />
                    <button type="button" className="btn btn-ghost btn-sm" onClick={() => fileRef.current?.click()} disabled={uploading}>{uploading ? <RefreshCw size={14} className="spin-icon" /> : <Upload size={14} />}{uploading ? "Uploading..." : "Upload Gambar"}</button>
                    <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={e => handleImageUpload(e.target.files?.[0])} />
                  </div>
                </div>
              </div>
            </div>
            <div className="admin-modal__footer"><button className="btn btn-ghost btn-sm" onClick={() => setModal(null)}>Batal</button><button className="btn btn-primary btn-sm" onClick={save} disabled={saving}>{saving ? <RefreshCw size={14} className="spin-icon" /> : <Save size={14} />} Simpan</button></div>
          </div>
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════
// TRANSACTIONS PANEL — Queue for Admin Confirmation
// ══════════════════════════════════════════════════════
function TransactionsPanel({ setPage, onPendingCountChange }) {
  const [txs, setTxs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [detail, setDetail] = useState(null);
  const [editTx, setEditTx] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [saving, setSaving] = useState(false);

  const broadcastTxUpdate = (id, status, paymentStatus) => {
    try {
      const bc = new BroadcastChannel("loka_tx_updates");
      bc.postMessage({ id, status, paymentStatus, timestamp: Date.now() });
      bc.close();
    } catch {}
    try {
      localStorage.setItem(
        "loka_tx_update",
        JSON.stringify({ id, status, paymentStatus, timestamp: Date.now() })
      );
    } catch {}
  };

  const load = useCallback(async () => {
    const { data } = await supabase
      .from("transactions")
      .select("*, transaction_items(*)")
      .order("created_at", { ascending: false })
      .limit(200);
    setTxs(data || []);
    setLoading(false);
    onPendingCountChange?.();
  }, [onPendingCountChange]);

  useEffect(() => {
    load();
    // Realtime listener for incoming customer checkouts
    const channel = supabase
      .channel("admin-transactions-queue")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "transactions" },
        () => {
          load();
        }
      )
      .subscribe();

    // Auto-poll every 3 seconds to guarantee instant visibility of customer orders
    const interval = setInterval(load, 3000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, [load]);

  const updateStatus = async (id, status, paymentStatus) => {
    try {
      // Optimistic update: instantly remove from pending queue
      setTxs(prev => prev.map(t => t.id === id ? { ...t, status, payment_status: paymentStatus } : t));
      const { error } = await supabase
        .from("transactions")
        .update({ status, payment_status: paymentStatus, updated_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
      broadcastTxUpdate(id, status, paymentStatus);
      await load();
    } catch (err) {
      alert("Gagal memperbarui status transaksi: " + err.message);
      await load();
    }
  };

  const deleteTx = async (id) => {
    if (!confirm(`Hapus transaksi ${id} dari antrean aktif? Transaksi ini akan otomatis dipindahkan ke Riwayat Transaksi pada tab Dashboard.`)) return;
    try {
      // Optimistic update: instantly remove from pending queue
      setTxs(prev => prev.map(t => t.id === id ? { ...t, status: "deleted", payment_status: "cancelled" } : t));
      const { error } = await supabase
        .from("transactions")
        .update({ status: "deleted", payment_status: "cancelled", updated_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
      broadcastTxUpdate(id, "deleted", "cancelled");
      await load();
    } catch (err) {
      alert("Gagal menghapus transaksi: " + err.message);
      await load();
    }
  };

  const openEdit = (t) => {
    setEditForm({ customer_name: t.customer_name || "", table_number: t.table_number || "", phone: t.phone || "", note: t.note || "", payment_method: t.payment_method || "cash", status: t.status || "pending", payment_status: t.payment_status || "pending", total_amount: String(t.total_amount || 0) });
    setEditTx(t);
  };

  const saveEdit = async () => {
    if (!editTx) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from("transactions")
        .update({ customer_name: editForm.customer_name, table_number: editForm.table_number, phone: editForm.phone, note: editForm.note, payment_method: editForm.payment_method, status: editForm.status, payment_status: editForm.payment_status, total_amount: Number(editForm.total_amount), updated_at: new Date().toISOString() })
        .eq("id", editTx.id);
      if (error) throw error;
      broadcastTxUpdate(editTx.id, editForm.status, editForm.payment_status);
      await load();
      setEditTx(null);
    } catch (err) {
      alert("Gagal update: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  // Only show pending transactions!
  // Transaksi yang sudah di-centang (confirmed), di-silang (cancelled), atau dihapus (deleted) otomatis TIDAK MUNCUL LAGI di tab transaksi.
  const pendingTxs = txs.filter(t => t.status === "pending" || (!t.status && t.payment_status === "pending"));
  const filtered = pendingTxs.filter(t =>
    t.id.toLowerCase().includes(search.toLowerCase()) ||
    t.customer_name?.toLowerCase().includes(search.toLowerCase()) ||
    t.phone?.toLowerCase().includes(search.toLowerCase()) ||
    (t.table_number && String(t.table_number).toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="transactions-panel">
      <div className="panel-toolbar" style={{ justifyContent: "space-between" }}>
        <div style={{ display: "flex", gap: "0.75rem", alignItems: "center", flex: 1, maxWidth: 500 }}>
          <div className="search-wrap" style={{ flex: 1 }}>
            <Search size={16} />
            <input className="form-input search-input" placeholder="Cari ID, pelanggan, meja..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>
        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
          <button className="btn btn-secondary btn-sm" onClick={() => exportToCSV(`Transaksi_Menunggu_${new Date().toISOString().slice(0,10)}.csv`, pendingTxs)}>
            <Download size={14} /> Export CSV
          </button>
          <button className="btn btn-ghost btn-sm" onClick={load} title="Refresh daftar transaksi">
            <RefreshCw size={14} /> Refresh
          </button>
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-md)", flexWrap: "wrap", gap: "0.5rem" }}>
        <div style={{ fontSize: "0.85rem", color: "var(--clr-text-muted)" }}>
          Menampilkan: <strong style={{ color: "var(--clr-primary)" }}>{pendingTxs.length}</strong> transaksi menunggu konfirmasi
        </div>
        <div style={{ fontSize: "0.8rem", color: "var(--clr-text-dim)" }}>
          💡 Transaksi yang telah di-centang, di-silang, atau dihapus otomatis dipindahkan ke{" "}
          <button className="btn btn-ghost btn-sm" style={{ padding: "2px 8px", fontSize: "0.75rem", textDecoration: "underline", color: "var(--clr-primary)" }} onClick={() => setPage("dashboard")}>
            Dashboard (Riwayat Transaksi) →
          </button>
        </div>
      </div>

      {loading ? (
        <div className="admin-loading"><RefreshCw size={20} className="spin-icon" /> Memuat antrean transaksi...</div>
      ) : filtered.length === 0 ? (
        <div className="glass-card" style={{ textAlign: "center", padding: "var(--space-3xl) var(--space-xl)", borderRadius: "var(--radius-lg)" }}>
          <CheckCircle size={44} color="#52b788" style={{ marginBottom: "1rem" }} />
          <h4 style={{ fontSize: "1.1rem", marginBottom: "0.5rem" }}>Tidak Ada Transaksi Menunggu Konfirmasi</h4>
          <p style={{ color: "var(--clr-text-muted)", fontSize: "0.85rem", maxWidth: 480, margin: "0 auto 1.5rem" }}>
            Semua pesanan yang masuk telah Anda proses. Transaksi yang telah di-centang, di-silang, atau dihapus tersimpan dengan rapi di tab <strong>Dashboard → Riwayat Transaksi</strong>.
          </p>
          <button className="btn btn-primary btn-sm" onClick={() => setPage("dashboard")}>
            <LayoutDashboard size={14} /> Buka Riwayat Transaksi di Dashboard
          </button>
        </div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Pelanggan</th>
                <th>Meja</th>
                <th>Total</th>
                <th>Metode</th>
                <th>Status</th>
                <th>Bayar</th>
                <th>Waktu</th>
                <th style={{ textAlign: "center" }}>Aksi Konfirmasi</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(t => (
                <tr key={t.id}>
                  <td style={{ fontFamily: "monospace", fontSize: "0.8rem" }}>{t.id}</td>
                  <td>
                    <div style={{ fontWeight: 500 }}>{t.customer_name}</div>
                    {t.phone && <small style={{ color: "var(--clr-text-dim)" }}>{t.phone}</small>}
                  </td>
                  <td>{t.table_number || "\u2014"}</td>
                  <td style={{ color: "var(--clr-primary)", fontWeight: 600 }}>{formatPrice(t.total_amount)}</td>
                  <td style={{ textTransform: "capitalize" }}>{t.payment_method}</td>
                  <td>
                    <span className="status-badge status-pending">
                      <Clock size={11} /> {t.status}
                    </span>
                  </td>
                  <td>
                    <span className="status-badge status-pending">
                      {t.payment_status}
                    </span>
                  </td>
                  <td style={{ fontSize: "0.78rem", color: "var(--clr-text-muted)", whiteSpace: "nowrap" }}>
                    {new Date(t.created_at).toLocaleString("id-ID", { dateStyle: "short", timeStyle: "short" })}
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: "0.35rem", justifyContent: "center", flexWrap: "nowrap" }}>
                      <button
                        className="btn btn-ghost btn-sm btn-icon"
                        onClick={() => setDetail(detail?.id === t.id ? null : t)}
                        title="Lihat Rincian Item"
                      >
                        <Eye size={13} />
                      </button>
                      <button
                        className="btn btn-ghost btn-sm btn-icon"
                        style={{ color: "#52b788", borderColor: "rgba(82,183,136,0.3)", background: "rgba(82,183,136,0.08)" }}
                        onClick={() => updateStatus(t.id, "confirmed", "paid")}
                        title="Centang: Konfirmasi Pembayaran Berhasil (Otomatis pindah ke Dashboard Riwayat)"
                      >
                        <CheckCircle size={14} />
                      </button>
                      <button
                        className="btn btn-ghost btn-sm btn-icon"
                        style={{ color: "#ef4444", borderColor: "rgba(239,68,68,0.3)", background: "rgba(239,68,68,0.08)" }}
                        onClick={() => updateStatus(t.id, "cancelled", "cancelled")}
                        title="Silang: Batalkan / Tolak Transaksi (Otomatis pindah ke Dashboard Riwayat)"
                      >
                        <XCircle size={14} />
                      </button>
                      <button
                        className="btn btn-ghost btn-sm btn-icon"
                        onClick={() => openEdit(t)}
                        title="Edit Data Pesanan"
                      >
                        <Edit2 size={13} />
                      </button>
                      <button
                        className="btn btn-ghost btn-sm btn-icon"
                        style={{ color: "#94a3b8" }}
                        onClick={() => deleteTx(t.id)}
                        title="Hapus dari Antrean (Otomatis dipindahkan ke Dashboard Riwayat)"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {detail && (
        <div className="glass-card" style={{ padding: "var(--space-xl)", marginTop: "var(--space-lg)", border: "1px solid var(--clr-border-2)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-md)" }}>
            <h4>Detail Antrean: {detail.id}</h4>
            <button className="btn btn-ghost btn-sm btn-icon" onClick={() => setDetail(null)}><X size={16} /></button>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", fontSize: "0.85rem", marginBottom: "var(--space-md)" }}>
            <div><span style={{ color: "var(--clr-text-muted)" }}>Pelanggan:</span> <strong>{detail.customer_name}</strong></div>
            <div><span style={{ color: "var(--clr-text-muted)" }}>Meja:</span> <strong>{detail.table_number || "\u2014"}</strong></div>
            <div><span style={{ color: "var(--clr-text-muted)" }}>Telepon:</span> <strong>{detail.phone || "\u2014"}</strong></div>
            <div><span style={{ color: "var(--clr-text-muted)" }}>Catatan:</span> <strong>{detail.note || "\u2014"}</strong></div>
          </div>
          <h5 style={{ marginBottom: "0.5rem" }}>Items:</h5>
          <table className="admin-table">
            <thead><tr><th>Produk</th><th>Harga</th><th>Qty</th><th>Subtotal</th></tr></thead>
            <tbody>
              {(detail.transaction_items || []).map((it, i) => (<tr key={i}><td>{it.product_name}</td><td>{formatPrice(it.price)}</td><td>{it.qty}</td><td style={{ color: "var(--clr-primary)" }}>{formatPrice(it.subtotal)}</td></tr>))}
            </tbody>
          </table>
          <div style={{ display: "flex", gap: "0.5rem", marginTop: "1rem", justifyContent: "flex-end" }}>
            <button className="btn btn-primary btn-sm" onClick={() => { updateStatus(detail.id, "confirmed", "paid"); setDetail(null); }}>
              <CheckCircle size={14} /> Konfirmasi Pembayaran Sekarang
            </button>
          </div>
        </div>
      )}

      {editTx && (
        <div className="admin-modal-overlay" onClick={() => setEditTx(null)}>
          <div className="admin-modal glass-card" onClick={e => e.stopPropagation()}>
            <div className="admin-modal__header"><h4>Edit Transaksi: {editTx.id}</h4><button className="btn btn-ghost btn-sm btn-icon" onClick={() => setEditTx(null)}><X size={16} /></button></div>
            <div className="admin-modal__body">
              <div className="form-group"><label className="form-label">Nama Pelanggan</label><input className="form-input" value={editForm.customer_name} onChange={e => setEditForm(f => ({ ...f, customer_name: e.target.value }))} /></div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div className="form-group"><label className="form-label">No. Meja</label><input className="form-input" value={editForm.table_number} onChange={e => setEditForm(f => ({ ...f, table_number: e.target.value }))} /></div>
                <div className="form-group"><label className="form-label">Telepon</label><input className="form-input" value={editForm.phone} onChange={e => setEditForm(f => ({ ...f, phone: e.target.value }))} /></div>
              </div>
              <div className="form-group"><label className="form-label">Catatan</label><textarea className="form-input" rows={2} value={editForm.note} onChange={e => setEditForm(f => ({ ...f, note: e.target.value }))} /></div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div className="form-group"><label className="form-label">Metode Pembayaran</label><input className="form-input" value={editForm.payment_method} onChange={e => setEditForm(f => ({ ...f, payment_method: e.target.value }))} /></div>
                <div className="form-group"><label className="form-label">Total Amount</label><input className="form-input" type="number" value={editForm.total_amount} onChange={e => setEditForm(f => ({ ...f, total_amount: e.target.value }))} /></div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div className="form-group"><label className="form-label">Status Pesanan</label><select className="form-input" value={editForm.status} onChange={e => setEditForm(f => ({ ...f, status: e.target.value }))}><option value="pending">Pending</option><option value="confirmed">Confirmed</option><option value="cancelled">Cancelled</option></select></div>
                <div className="form-group"><label className="form-label">Status Bayar</label><select className="form-input" value={editForm.payment_status} onChange={e => setEditForm(f => ({ ...f, payment_status: e.target.value }))}><option value="pending">Pending</option><option value="paid">Paid</option></select></div>
              </div>
            </div>
            <div className="admin-modal__footer"><button className="btn btn-ghost btn-sm" onClick={() => setEditTx(null)}>Batal</button><button className="btn btn-primary btn-sm" onClick={saveEdit} disabled={saving}>{saving ? <RefreshCw size={14} className="spin-icon" /> : <Save size={14} />} Simpan</button></div>
          </div>
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════
// PAYMENTS PANEL — Manage Payment Methods
// ══════════════════════════════════════════════════════
function PaymentsPanel() {
  const [methods, setMethods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({ method_id: "", label: "", type: "transfer", bank_name: "", account_number: "", account_holder: "", qris_image_url: "", instructions: "", is_active: true, sort_order: 0 });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef();

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from("payment_methods").select("*").order("sort_order");
    setMethods(data || []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const openAdd = () => {
    setForm({ method_id: "pm_" + Date.now(), label: "", type: "transfer", bank_name: "", account_number: "", account_holder: "", qris_image_url: "", instructions: "", is_active: true, sort_order: methods.length + 1 });
    setModal("add");
  };

  const openEdit = (m) => { setForm({ ...m, sort_order: m.sort_order || 0 }); setModal("edit"); };

  const handleQrisUpload = async (file) => {
    if (!file) return;
    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const fileName = `qris-${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from("product-images").upload(fileName, file, { upsert: true });
      if (error) throw error;
      const { data: urlData } = supabase.storage.from("product-images").getPublicUrl(fileName);
      setForm(f => ({ ...f, qris_image_url: urlData.publicUrl }));
    } catch (err) { alert("Upload gagal: " + err.message); }
    finally { setUploading(false); }
  };

  const save = async () => {
    if (!form.label || !form.method_id) return alert("Label dan Method ID wajib diisi");
    setSaving(true);
    try {
      const payload = { ...form };
      delete payload.id; delete payload.created_at; delete payload.updated_at;
      payload.updated_at = new Date().toISOString();
      if (modal === "add") {
        const { error } = await supabase.from("payment_methods").insert(payload);
        if (error) throw error;
      } else {
        const { method_id, ...updates } = payload;
        const { error } = await supabase.from("payment_methods").update(updates).eq("method_id", form.method_id);
        if (error) throw error;
      }
      await load(); setModal(null);
    } catch (err) { alert("Gagal menyimpan: " + err.message); }
    finally { setSaving(false); }
  };

  const del = async (method_id) => { if (!confirm("Hapus metode pembayaran ini?")) return; await supabase.from("payment_methods").delete().eq("method_id", method_id); await load(); };

  const typeIcon = { cash: <Banknote size={16} />, transfer: <CreditCard size={16} />, qris: <QrCode size={16} />, ewallet: <CreditCard size={16} />, manual: <CreditCard size={16} /> };
  const typeLabel = { cash: "Tunai", transfer: "Transfer Bank", qris: "QRIS", ewallet: "E-Wallet", manual: "Manual" };

  return (
    <div className="products-panel">
      <div style={{ marginBottom: "var(--space-lg)", padding: "var(--space-md) var(--space-lg)", background: "rgba(200,150,62,0.08)", borderRadius: "var(--radius-md)", border: "1px solid rgba(200,150,62,0.2)" }}>
        <p style={{ fontSize: "0.85rem", color: "var(--clr-text-muted)", display: "flex", alignItems: "center", gap: "8px" }}>
          <AlertCircle size={16} color="var(--clr-primary)" />
          Kelola metode pembayaran yang akan tampil saat checkout. Atur nomor rekening/QRIS di sini.
        </p>
      </div>

      <div className="panel-toolbar">
        <span style={{ fontSize: "0.85rem", color: "var(--clr-text-muted)" }}>{methods.length} metode pembayaran</span>
        <button className="btn btn-primary btn-sm" onClick={openAdd}><Plus size={16} /> Tambah Metode</button>
      </div>

      {loading ? (<div className="admin-loading"><RefreshCw size={20} className="spin-icon" /></div>) : (
        <div style={{ display: "grid", gap: "var(--space-md)" }}>
          {methods.map(m => (
            <div key={m.method_id} className="glass-card" style={{ padding: "var(--space-lg)", display: "flex", gap: "var(--space-lg)", alignItems: "flex-start" }}>
              <div style={{ width: 48, height: 48, borderRadius: "var(--radius-md)", background: "rgba(200,150,62,0.12)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--clr-primary)", flexShrink: 0 }}>{typeIcon[m.type] || <CreditCard size={20} />}</div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "4px" }}>
                  <strong style={{ fontSize: "0.95rem" }}>{m.label}</strong>
                  <span className={`status-badge ${m.is_active ? "status-confirmed" : "status-cancelled"}`} style={{ fontSize: "0.7rem" }}>{m.is_active ? "Aktif" : "Nonaktif"}</span>
                  <span className="product-tag" style={{ fontSize: "0.7rem" }}>{typeLabel[m.type]}</span>
                </div>
                {m.bank_name && <p style={{ fontSize: "0.82rem", color: "var(--clr-text-muted)" }}>Bank: <strong>{m.bank_name}</strong></p>}
                {m.account_number && <p style={{ fontSize: "0.82rem", color: "var(--clr-text-muted)" }}>No. Rek: <strong style={{ color: "var(--clr-primary)", letterSpacing: "0.05em" }}>{m.account_number}</strong></p>}
                {m.account_holder && <p style={{ fontSize: "0.82rem", color: "var(--clr-text-muted)" }}>A/N: <strong>{m.account_holder}</strong></p>}
                {m.instructions && <p style={{ fontSize: "0.78rem", color: "var(--clr-text-dim)", marginTop: "4px" }}>{m.instructions}</p>}
                {m.qris_image_url && <img src={m.qris_image_url} alt="QRIS" style={{ width: 120, height: 120, objectFit: "contain", borderRadius: 8, marginTop: 8, background: "#fff", padding: 4 }} />}
              </div>
              <div style={{ display: "flex", gap: "0.4rem", flexShrink: 0 }}>
                <button className="btn btn-ghost btn-sm btn-icon" onClick={() => openEdit(m)} title="Edit"><Edit2 size={14} /></button>
                <button className="btn btn-ghost btn-sm btn-icon" style={{ color: "#ef4444" }} onClick={() => del(m.method_id)} title="Hapus"><Trash2 size={14} /></button>
              </div>
            </div>
          ))}
          {methods.length === 0 && <div className="admin-empty">Belum ada metode pembayaran. Klik "Tambah Metode" untuk menambahkan.</div>}
        </div>
      )}

      {modal && (
        <div className="admin-modal-overlay" onClick={() => setModal(null)}>
          <div className="admin-modal glass-card" onClick={e => e.stopPropagation()} style={{ maxWidth: 560 }}>
            <div className="admin-modal__header"><h4>{modal === "add" ? "Tambah Metode Pembayaran" : "Edit Metode Pembayaran"}</h4><button className="btn btn-ghost btn-sm btn-icon" onClick={() => setModal(null)}><X size={16} /></button></div>
            <div className="admin-modal__body">
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div className="form-group"><label className="form-label">Label Tampilan *</label><input className="form-input" placeholder="Contoh: Transfer BCA" value={form.label} onChange={e => setForm(f => ({ ...f, label: e.target.value }))} /></div>
                <div className="form-group"><label className="form-label">Tipe</label><select className="form-input" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}><option value="cash">Tunai</option><option value="transfer">Transfer Bank</option><option value="qris">QRIS</option><option value="ewallet">E-Wallet</option><option value="manual">Manual</option></select></div>
              </div>
              {(form.type === "transfer" || form.type === "manual") && (
                <>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                    <div className="form-group"><label className="form-label">Nama Bank</label><input className="form-input" placeholder="BCA / Mandiri / BNI / BRI" value={form.bank_name} onChange={e => setForm(f => ({ ...f, bank_name: e.target.value }))} /></div>
                    <div className="form-group"><label className="form-label">Nomor Rekening</label><input className="form-input" placeholder="1234567890" value={form.account_number} onChange={e => setForm(f => ({ ...f, account_number: e.target.value }))} /></div>
                  </div>
                  <div className="form-group"><label className="form-label">Atas Nama</label><input className="form-input" placeholder="Nama pemilik rekening" value={form.account_holder} onChange={e => setForm(f => ({ ...f, account_holder: e.target.value }))} /></div>
                </>
              )}
              {form.type === "qris" && (
                <div className="form-group">
                  <label className="form-label">Gambar QRIS</label>
                  <div style={{ display: "flex", gap: "0.75rem", alignItems: "flex-start", flexWrap: "wrap" }}>
                    {form.qris_image_url && <img src={form.qris_image_url} alt="QRIS" style={{ width: 120, height: 120, objectFit: "contain", borderRadius: 8, background: "#fff", padding: 4 }} />}
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", flex: 1 }}>
                      <input className="form-input" placeholder="URL gambar QRIS" value={form.qris_image_url} onChange={e => setForm(f => ({ ...f, qris_image_url: e.target.value }))} />
                      <button type="button" className="btn btn-ghost btn-sm" onClick={() => fileRef.current?.click()} disabled={uploading}>{uploading ? <RefreshCw size={14} className="spin-icon" /> : <Upload size={14} />}{uploading ? "Uploading..." : "Upload QRIS"}</button>
                      <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={e => handleQrisUpload(e.target.files?.[0])} />
                    </div>
                  </div>
                </div>
              )}
              <div className="form-group"><label className="form-label">Instruksi Pembayaran</label><textarea className="form-input" rows={2} placeholder="Petunjuk pembayaran untuk pelanggan" value={form.instructions} onChange={e => setForm(f => ({ ...f, instructions: e.target.value }))} /></div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div className="form-group"><label className="form-label">Status</label><select className="form-input" value={form.is_active ? "1" : "0"} onChange={e => setForm(f => ({ ...f, is_active: e.target.value === "1" }))}><option value="1">Aktif</option><option value="0">Nonaktif</option></select></div>
                <div className="form-group"><label className="form-label">Urutan</label><input className="form-input" type="number" value={form.sort_order} onChange={e => setForm(f => ({ ...f, sort_order: Number(e.target.value) }))} /></div>
              </div>
            </div>
            <div className="admin-modal__footer"><button className="btn btn-ghost btn-sm" onClick={() => setModal(null)}>Batal</button><button className="btn btn-primary btn-sm" onClick={save} disabled={saving}>{saving ? <RefreshCw size={14} className="spin-icon" /> : <Save size={14} />} Simpan</button></div>
          </div>
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════
// USERS PANEL
// ══════════════════════════════════════════════════════
function UsersPanel() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    supabase.from("profiles").select("*").order("created_at", { ascending: false })
      .then(({ data }) => { setUsers(data || []); setLoading(false); });
  }, []);

  const filtered = users.filter(u => u.name?.toLowerCase().includes(search.toLowerCase()) || u.membership?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <div className="panel-toolbar">
        <div className="search-wrap"><Search size={16} /><input className="form-input search-input" placeholder="Cari nama / membership..." value={search} onChange={e => setSearch(e.target.value)} /></div>
        <button className="btn btn-secondary btn-sm" onClick={() => exportToCSV(`Pengguna_${new Date().toISOString().slice(0,10)}.csv`, users)}><Download size={14} /> Export CSV</button>
      </div>
      {loading ? <div className="admin-loading"><RefreshCw size={20} className="spin-icon" /></div> : (
        <table className="admin-table">
          <thead><tr><th>Nama</th><th>Role</th><th>Membership</th><th>Poin</th><th>Total Belanja</th><th>Bergabung</th></tr></thead>
          <tbody>
            {filtered.map(u => (
              <tr key={u.id}>
                <td><div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}><div style={{ width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg, var(--clr-primary), var(--clr-primary-dark))", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.75rem", fontWeight: 700, color: "#0d1117" }}>{(u.name || "U")[0].toUpperCase()}</div><div><p style={{ color: "var(--clr-text)", fontWeight: 500, fontSize: "0.9rem" }}>{u.name}</p><p style={{ fontSize: "0.75rem", color: "var(--clr-text-dim)" }}>{u.phone || "\u2014"}</p></div></div></td>
                <td><span className={`status-badge ${u.role === "admin" ? "status-confirmed" : "status-pending"}`}>{u.role}</span></td>
                <td><span className="product-tag">{u.membership}</span></td>
                <td style={{ color: "var(--clr-primary)", fontWeight: 600 }}>{(u.points || 0).toLocaleString()}</td>
                <td>{formatPrice(u.total_spent || 0)}</td>
                <td style={{ fontSize: "0.78rem", color: "var(--clr-text-muted)" }}>{new Date(u.created_at).toLocaleDateString("id-ID")}</td>
              </tr>
            ))}
            {filtered.length === 0 && <tr><td colSpan={6} style={{ textAlign: "center", color: "var(--clr-text-muted)" }}>Tidak ada pengguna</td></tr>}
          </tbody>
        </table>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════
// RATINGS PANEL
// ══════════════════════════════════════════════════════
function RatingsPanel() {
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from("ratings").select("id, rating, review, created_at, products(name), profiles(name)").order("created_at", { ascending: false }).limit(100)
      .then(({ data }) => { setRatings(data || []); setLoading(false); });
  }, []);

  const del = async (id) => { if (!confirm("Hapus review ini?")) return; await supabase.from("ratings").delete().eq("id", id); setRatings(r => r.filter(x => x.id !== id)); };

  return (
    <div>
      {loading ? <div className="admin-loading"><RefreshCw size={20} className="spin-icon" /></div> : (
        <table className="admin-table">
          <thead><tr><th>Produk</th><th>User</th><th>Rating</th><th>Review</th><th>Waktu</th><th>Aksi</th></tr></thead>
          <tbody>
            {ratings.map(r => (
              <tr key={r.id}>
                <td style={{ fontWeight: 500 }}>{r.products?.name || "\u2014"}</td>
                <td>{r.profiles?.name || "\u2014"}</td>
                <td>{"\u2B50".repeat(r.rating)}</td>
                <td style={{ maxWidth: 200, color: "var(--clr-text-muted)", fontSize: "0.85rem" }}>{r.review || <em>{"\u2014"}</em>}</td>
                <td style={{ fontSize: "0.78rem", color: "var(--clr-text-dim)" }}>{new Date(r.created_at).toLocaleDateString("id-ID")}</td>
                <td><button className="btn btn-ghost btn-sm btn-icon" style={{ color: "#ef4444" }} onClick={() => del(r.id)}><Trash2 size={14} /></button></td>
              </tr>
            ))}
            {ratings.length === 0 && <tr><td colSpan={6} style={{ textAlign: "center", color: "var(--clr-text-muted)" }}>Belum ada rating</td></tr>}
          </tbody>
        </table>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════
// SETTINGS PANEL — Blog URL & Instagram
// ══════════════════════════════════════════════════════
function SettingsPanel() {
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    supabase.from("settings").select("key,value,label")
      .then(({ data }) => { const map = {}; (data || []).forEach(s => { map[s.key] = { value: s.value, label: s.label }; }); setSettings(map); setLoading(false); });
  }, []);

  const handleChange = (key, value) => { setSettings(s => ({ ...s, [key]: { ...s[key], value } })); setSaved(false); };

  const saveAll = async () => {
    setSaving(true);
    try { 
      for (const [key, { value, label }] of Object.entries(settings)) { 
        await supabase.from("settings").upsert({ key, value, label: label || key, updated_at: new Date().toISOString() }, { onConflict: "key" }); 
      } 
      setSaved(true); 
    }
    finally { setSaving(false); }
  };

  if (loading) return <div className="admin-loading"><RefreshCw size={20} className="spin-icon" /></div>;

  const SETTING_KEYS = [
    { key: "blogger_url", icon: <Rss size={18} />, label: "URL Blog Blogger", hint: "Contoh: https://aruniakita.blogspot.com/" },
    { key: "instagram_handle", icon: <Instagram size={18} />, label: "Username Instagram (tanpa @)", hint: "Contoh: lokaboardgamecafe" },
    { key: "instagram_name", icon: <Instagram size={18} />, label: "Nama Profil Instagram", hint: "Contoh: Loka Boardgame Cafe" },
    { key: "instagram_posts", icon: <Instagram size={18} />, label: "Jumlah Postingan IG", hint: "Contoh: 200+" },
    { key: "instagram_followers", icon: <Instagram size={18} />, label: "Jumlah Pengikut IG", hint: "Contoh: 1K+" },
    { key: "instagram_following", icon: <Instagram size={18} />, label: "Jumlah Mengikuti IG", hint: "Contoh: 500+" },
    { key: "instagram_embed_code", icon: <Instagram size={18} />, label: "Embed Code Widget Instagram", hint: "Paste kode dari SnapWidget / EmbedSocial / Curator.io. Kosongkan untuk tampilan default.", textarea: true },
    { key: "whatsapp_number", icon: <MessageSquare size={18} />, label: "Nomor WhatsApp (format: 628xxx)", hint: "Contoh: 6281234567890" },
  ];

  return (
    <div style={{ maxWidth: 640, display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <div className="glass-card" style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1.25rem" }}>
        <h4 style={{ color: "var(--clr-text)", display: "flex", alignItems: "center", gap: "0.5rem" }}><Settings size={16} /> Konfigurasi Konten</h4>
        {SETTING_KEYS.map(({ key, icon, label, hint, textarea }) => (
          <div key={key} className="form-group">
            <label className="form-label" style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>{icon} {label}</label>
            {textarea ? (<textarea className="form-input" rows={4} value={settings[key]?.value || ""} onChange={e => handleChange(key, e.target.value)} placeholder={hint} style={{ resize: "vertical", fontSize: "0.82rem", fontFamily: "monospace" }} />) : (<input className="form-input" value={settings[key]?.value || ""} onChange={e => handleChange(key, e.target.value)} placeholder={hint} />)}
            <p style={{ fontSize: "0.75rem", color: "var(--clr-text-dim)", marginTop: "0.25rem" }}>{hint}</p>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
        <button className="btn btn-primary" onClick={saveAll} disabled={saving}>{saving ? <RefreshCw size={14} className="spin-icon" /> : <Save size={14} />} Simpan Semua</button>
        {saved && <span style={{ color: "var(--clr-accent-2)", display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.85rem" }}><CheckCircle size={16} /> Tersimpan!</span>}
      </div>
      {settings.blogger_url?.value && (
        <div className="glass-card" style={{ padding: "1.25rem" }}>
          <p style={{ fontSize: "0.82rem", color: "var(--clr-text-muted)", marginBottom: "0.5rem" }}><Rss size={14} style={{ display: "inline", marginRight: "0.4rem" }} />Blog aktif saat ini:</p>
          <a href={settings.blogger_url.value} target="_blank" rel="noopener noreferrer" style={{ color: "var(--clr-primary)", fontSize: "0.9rem", wordBreak: "break-all" }}>{settings.blogger_url.value}</a>
        </div>
      )}
    </div>
  );
}
