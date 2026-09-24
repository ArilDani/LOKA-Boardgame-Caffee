import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { User, Star, Trophy, CreditCard, Clock, ShoppingBag, LogOut, ChevronRight, Edit2, Save, X } from "lucide-react";
import "./Profile.css";

const MEMBERSHIP_CONFIG = {
  Bronze:   { color: "#cd7f32", next: "Silver",   needed: 500,  icon: "🥉" },
  Silver:   { color: "#c0c0c0", next: "Gold",     needed: 2000, icon: "🥈" },
  Gold:     { color: "#ffd700", next: "Platinum", needed: 5000, icon: "🥇" },
  Platinum: { color: "#e5e4e2", next: null,       needed: null, icon: "💎" },
};

const API = "http://localhost:3001/api";

export default function Profile() {
  const { user, logout, authFetch, refreshUser } = useAuth();
  const navigate = useNavigate();

  const [transactions, setTransactions] = useState([]);
  const [editMode, setEditMode]         = useState(false);
  const [form, setForm]                 = useState({ name: "", phone: "" });
  const [saving, setSaving]             = useState(false);
  const [activeTab, setActiveTab]       = useState("overview");

  useEffect(() => { if (!user) navigate("/login"); window.scrollTo(0,0); }, [user]);
  useEffect(() => {
    if (user) { setForm({ name: user.name, phone: user.phone || "" }); }
  }, [user]);

  useEffect(() => {
    if (activeTab === "transactions") fetchTransactions();
  }, [activeTab]);

  const fetchTransactions = async () => {
    try {
      const res = await authFetch(`${API}/transactions/my`);
      if (res.ok) setTransactions(await res.json());
    } catch {}
  };

  const saveProfile = async () => {
    setSaving(true);
    try {
      const res = await authFetch(`${API}/auth/profile`, {
        method: "PUT", body: JSON.stringify(form)
      });
      if (res.ok) { await refreshUser(); setEditMode(false); }
    } finally { setSaving(false); }
  };

  if (!user) return null;

  const memberConfig = MEMBERSHIP_CONFIG[user.membership] || MEMBERSHIP_CONFIG.Bronze;
  const nextNeeded   = memberConfig.needed ? memberConfig.needed - user.points : 0;
  const progress     = memberConfig.needed ? Math.min((user.points / memberConfig.needed) * 100, 100) : 100;

  const formatPrice = (n) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(n);
  const formatDate  = (s) => new Date(s).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });

  return (
    <div className="profile-page">
      <div className="profile-bg" />
      <div className="container profile-inner">

        {/* ─── Membership Card ─── */}
        <div className="membership-hero glass-card" style={{ "--mem-color": memberConfig.color }}>
          <div className="membership-hero__left">
            <div className="membership-hero__avatar">
              {user.name?.[0]?.toUpperCase() || "U"}
            </div>
            <div>
              <h2 className="membership-hero__name">{user.name}</h2>
              <p className="membership-hero__email">{user.email}</p>
              <div className="membership-badge">
                <span>{memberConfig.icon}</span>
                <span>{user.membership} Member</span>
              </div>
            </div>
          </div>
          <div className="membership-hero__right">
            <div className="membership-points">
              <p className="membership-points__label">Total Poin</p>
              <p className="membership-points__value">{user.points.toLocaleString("id-ID")}</p>
            </div>
            {memberConfig.next && (
              <div className="membership-progress-wrap">
                <div className="membership-progress-bar">
                  <div className="membership-progress-fill" style={{ width: `${progress}%` }} />
                </div>
                <p className="membership-progress-label">{nextNeeded} poin lagi ke {memberConfig.next}</p>
              </div>
            )}
          </div>
        </div>

        {/* ─── Tabs ─── */}
        <div className="profile-tabs">
          {["overview", "transactions", "edit"].map(t => (
            <button key={t} className={`profile-tab ${activeTab === t ? "active" : ""}`} onClick={() => setActiveTab(t)}>
              {t === "overview" ? <><User size={14}/> Profil</> : t === "transactions" ? <><ShoppingBag size={14}/> Riwayat</> : <><Edit2 size={14}/> Edit Profil</>}
            </button>
          ))}
        </div>

        {/* ─── Overview Tab ─── */}
        {activeTab === "overview" && (
          <div className="profile-overview">
            <div className="profile-stats-grid">
              <div className="profile-stat glass-card">
                <div className="profile-stat__icon"><Star size={20}/></div>
                <div><p className="profile-stat__label">Total Poin</p><p className="profile-stat__value">{user.points.toLocaleString("id-ID")}</p></div>
              </div>
              <div className="profile-stat glass-card">
                <div className="profile-stat__icon"><CreditCard size={20}/></div>
                <div><p className="profile-stat__label">Total Belanja</p><p className="profile-stat__value">{formatPrice(user.total_spent)}</p></div>
              </div>
              <div className="profile-stat glass-card">
                <div className="profile-stat__icon"><Trophy size={20}/></div>
                <div><p className="profile-stat__label">Membership</p><p className="profile-stat__value">{user.membership}</p></div>
              </div>
              <div className="profile-stat glass-card">
                <div className="profile-stat__icon"><Clock size={20}/></div>
                <div><p className="profile-stat__label">Member Sejak</p><p className="profile-stat__value">{formatDate(user.created_at)}</p></div>
              </div>
            </div>

            <div className="membership-benefits glass-card">
              <h4><Trophy size={16}/> Benefit Membership</h4>
              <div className="benefit-tiers">
                {Object.entries(MEMBERSHIP_CONFIG).map(([tier, cfg]) => (
                  <div key={tier} className={`benefit-tier ${user.membership === tier ? "active" : ""}`} style={{ "--tc": cfg.color }}>
                    <span className="benefit-tier__icon">{cfg.icon}</span>
                    <span className="benefit-tier__name">{tier}</span>
                    <span className="benefit-tier__pts">{tier === "Bronze" ? "0" : tier === "Silver" ? "500" : tier === "Gold" ? "2.000" : "5.000"}+ poin</span>
                    {user.membership === tier && <span className="benefit-tier__current">✓ Kamu disini</span>}
                  </div>
                ))}
              </div>
            </div>

            <div className="profile-actions">
              <Link to="/score" className="btn btn-ghost"><Trophy size={16}/> Pelacak Skor Game</Link>
              <button className="btn btn-secondary" onClick={() => { logout(); navigate("/"); }}>
                <LogOut size={16}/> Keluar
              </button>
            </div>
          </div>
        )}

        {/* ─── Transactions Tab ─── */}
        {activeTab === "transactions" && (
          <div className="profile-transactions">
            {transactions.length === 0 ? (
              <div className="profile-empty glass-card">
                <ShoppingBag size={40} style={{ opacity: 0.3 }}/>
                <p>Belum ada transaksi</p>
                <Link to="/menu" className="btn btn-primary btn-sm">Pesan Sekarang</Link>
              </div>
            ) : (
              transactions.map(tx => (
                <div key={tx.id} className="tx-card glass-card">
                  <div className="tx-card__header">
                    <div>
                      <p className="tx-card__id">{tx.id}</p>
                      <p className="tx-card__date">{formatDate(tx.created_at)}</p>
                    </div>
                    <span className={`tx-status tx-status--${tx.status}`}>{tx.status}</span>
                  </div>
                  <p className="tx-card__items">{tx.items_summary}</p>
                  <div className="tx-card__footer">
                    <span className="tx-card__total">{formatPrice(tx.total_amount)}</span>
                    <span className="tx-card__points">+{tx.points_earned} poin</span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* ─── Edit Tab ─── */}
        {activeTab === "edit" && (
          <div className="profile-edit glass-card">
            <h4>Edit Profil</h4>
            <div className="form-group">
              <label className="form-label">Nama Lengkap</label>
              <input className="form-input" value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} />
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input className="form-input" value={user.email} disabled style={{ opacity: 0.5 }}/>
            </div>
            <div className="form-group">
              <label className="form-label">No. WhatsApp</label>
              <input className="form-input" value={form.phone} onChange={e => setForm(f => ({...f, phone: e.target.value}))} placeholder="08xxxxxxxxxx"/>
            </div>
            <div className="profile-edit__actions">
              <button className="btn btn-primary" onClick={saveProfile} disabled={saving}>
                {saving ? "Menyimpan..." : <><Save size={16}/> Simpan</>}
              </button>
              <button className="btn btn-secondary" onClick={() => setActiveTab("overview")}>
                <X size={16}/> Batal
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
