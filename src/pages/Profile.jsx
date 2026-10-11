import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";
import { User, Star, Trophy, CreditCard, Clock, ShoppingBag, LogOut, ChevronRight, Edit2, Save, X } from "lucide-react";
import "./Profile.css";

const MEMBERSHIP_CONFIG = {
  Bronze:   { color: "#cd7f32", next: "Silver",   needed: 500,  icon: "🥉" },
  Silver:   { color: "#c0c0c0", next: "Gold",     needed: 2000, icon: "🥈" },
  Gold:     { color: "#ffd700", next: "Platinum", needed: 5000, icon: "🥇" },
  Platinum: { color: "#e5e4e2", next: null,       needed: null, icon: "💎" },
};

export default function Profile() {
  const { user, profile, logout, refreshProfile, updateProfile } = useAuth();
  const navigate = useNavigate();

  const [transactions, setTransactions] = useState([]);
  const [form, setForm] = useState({ name: "", phone: "" });
  const [saving, setSaving]             = useState(false);
  const [activeTab, setActiveTab]       = useState("overview");

  useEffect(() => { if (!user) { navigate("/login"); return; } window.scrollTo(0,0); }, [user]);
  useEffect(() => {
    if (profile) { setForm({ name: profile.name || "", phone: profile.phone || "" }); }
  }, [profile]);

  useEffect(() => {
    if (activeTab === "transactions") fetchTransactions();
  }, [activeTab]);

  const fetchTransactions = async () => {
    try {
      const { data } = await supabase
        .from("transactions")
        .select("*, transaction_items(product_name, qty)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(20);
      setTransactions(data || []);
    } catch {}
  };

  const saveProfile = async () => {
    setSaving(true);
    try {
      await updateProfile({ name: form.name, phone: form.phone });
      setActiveTab("overview");
    } catch (err) { alert(err.message); }
    finally { setSaving(false); }
  };

  if (!user) return null;
  if (!profile) return (
    <div style={{ minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: "1rem" }}>
      <div style={{ width: 40, height: 40, border: "3px solid var(--clr-primary)", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      <p style={{ color: "var(--clr-text-muted)", fontSize: "0.9rem" }}>Memuat profil...</p>
    </div>
  );

  const memberConfig = MEMBERSHIP_CONFIG[profile.membership] || MEMBERSHIP_CONFIG.Bronze;
  const nextNeeded   = memberConfig.needed ? memberConfig.needed - profile.points : 0;
  const progress     = memberConfig.needed ? Math.min((profile.points / memberConfig.needed) * 100, 100) : 100;

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
              {profile.name?.[0]?.toUpperCase() || "U"}
            </div>
            <div>
              <h2 className="membership-hero__name">{profile.name}</h2>
              <p className="membership-hero__email">{user.email}</p>
              <div className="membership-badge">
                <span>{memberConfig.icon}</span>
                <span>{profile.membership} Member</span>
              </div>
            </div>
          </div>
          <div className="membership-hero__right">
            <div className="membership-points">
              <p className="membership-points__label">Total Poin</p>
              <p className="membership-points__value">{(profile.points||0).toLocaleString("id-ID")}</p>
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
                <div><p className="profile-stat__label">Total Poin</p><p className="profile-stat__value">{(profile.points||0).toLocaleString("id-ID")}</p></div>
              </div>
              <div className="profile-stat glass-card">
                <div className="profile-stat__icon"><CreditCard size={20}/></div>
                <div><p className="profile-stat__label">Total Belanja</p><p className="profile-stat__value">{formatPrice(profile.total_spent||0)}</p></div>
              </div>
              <div className="profile-stat glass-card">
                <div className="profile-stat__icon"><Trophy size={20}/></div>
                <div><p className="profile-stat__label">Membership</p><p className="profile-stat__value">{profile.membership}</p></div>
              </div>
              <div className="profile-stat glass-card">
                <div className="profile-stat__icon"><Clock size={20}/></div>
                <div><p className="profile-stat__label">Member Sejak</p><p className="profile-stat__value">{formatDate(profile.created_at)}</p></div>
              </div>
            </div>

            <div className="membership-benefits glass-card">
              <h4><Trophy size={16}/> Benefit Membership</h4>
              <div className="benefit-tiers">
                {Object.entries(MEMBERSHIP_CONFIG).map(([tier, cfg]) => (
                  <div key={tier} className={`benefit-tier ${profile.membership === tier ? "active" : ""}`} style={{ "--tc": cfg.color }}>
                    <span className="benefit-tier__icon">{cfg.icon}</span>
                    <span className="benefit-tier__name">{tier}</span>
                    <span className="benefit-tier__pts">{tier === "Bronze" ? "0" : tier === "Silver" ? "500" : tier === "Gold" ? "2.000" : "5.000"}+ poin</span>
                    {profile.membership === tier && <span className="benefit-tier__current">✓ Kamu disini</span>}
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
