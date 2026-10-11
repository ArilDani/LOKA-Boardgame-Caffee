import { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";
import { Dice6, Eye, EyeOff, LogIn, UserPlus, Zap, Mail, CheckCircle, AlertCircle } from "lucide-react";
import "./Login.css";

export default function Login() {
  const { login, register, user, isEmailVerified } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();
  const from      = location.state?.from || "/";

  const [tab,         setTab]       = useState("login");
  const [form,        setForm]      = useState({ name: "", email: "", password: "", phone: "" });
  const [showPass,    setShowPass]  = useState(false);
  const [loading,     setLoading]   = useState(false);
  const [error,       setError]     = useState("");
  const [registered,  setRegistered] = useState(false); // email verification pending

  useEffect(() => {
    if (user && isEmailVerified) navigate(from, { replace: true });
  }, [user, isEmailVerified]);

  useEffect(() => { window.scrollTo(0, 0); }, []);

  const handleChange = (e) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      if (tab === "login") {
        const u = await login(form.email, form.password);
        if (!u) { setError("Login gagal, coba lagi."); return; }

        // Check if admin (bypass email verification for admin)
        const { data: prof } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", u.id)
          .single();

        const isAdminUser = prof?.role === "admin";

        // Regular users must have verified email
        if (!u.email_confirmed_at && !isAdminUser) {
          setError("Email belum diverifikasi. Cek inbox kamu dan klik link konfirmasi.");
          return;
        }
        navigate(from, { replace: true });
      } else {
        if (!form.name.trim()) { setError("Nama wajib diisi"); return; }
        if (form.password.length < 6) { setError("Password minimal 6 karakter"); return; }
        await register(form.name, form.email, form.password, form.phone);
        setRegistered(true); // Show "check your email" screen
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ── Email verification sent screen
  if (registered) {
    return (
      <div className="login-page">
        <div className="login-bg" />
        <div className="login-card glass-card" style={{ textAlign: "center" }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1.5rem" }}>
            <div style={{
              width: 80, height: 80, borderRadius: "50%",
              background: "linear-gradient(135deg, var(--clr-primary), var(--clr-primary-dark))",
              display: "flex", alignItems: "center", justifyContent: "center"
            }}>
              <Mail size={36} color="#0d1117" />
            </div>
            <div>
              <h2 style={{ color: "var(--clr-text)", marginBottom: "0.5rem" }}>Cek Email Kamu!</h2>
              <p style={{ color: "var(--clr-text-muted)", maxWidth: 320 }}>
                Kami mengirimkan link konfirmasi ke <strong style={{ color: "var(--clr-primary)" }}>{form.email}</strong>.
                Klik link tersebut untuk mengaktifkan akun dan mulai bermain!
              </p>
            </div>
            <div style={{
              background: "rgba(200,150,62,0.1)", border: "1px solid rgba(200,150,62,0.2)",
              borderRadius: "var(--radius-md)", padding: "1rem 1.5rem", width: "100%"
            }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem" }}>
                <CheckCircle size={18} color="var(--clr-primary)" style={{ flexShrink: 0, marginTop: 2 }} />
                <div style={{ textAlign: "left" }}>
                  <p style={{ color: "var(--clr-text)", fontSize: "0.85rem", fontWeight: 600, marginBottom: 4 }}>
                    Langkah selanjutnya:
                  </p>
                  <ol style={{ color: "var(--clr-text-muted)", fontSize: "0.8rem", paddingLeft: "1rem", lineHeight: 1.8 }}>
                    <li>Buka inbox email kamu</li>
                    <li>Cari email dari Loka Boardgame Cafe</li>
                    <li>Klik tombol "Konfirmasi Email"</li>
                    <li>Kembali ke sini dan login!</li>
                  </ol>
                </div>
              </div>
            </div>
            <button
              className="btn btn-primary"
              style={{ width: "100%" }}
              onClick={() => { setRegistered(false); setTab("login"); }}
            >
              <LogIn size={17} /> Lanjut ke Login
            </button>
            <p style={{ fontSize: "0.8rem", color: "var(--clr-text-dim)" }}>
              Tidak dapat email? Cek folder spam atau{" "}
              <button
                style={{ color: "var(--clr-primary)", background: "none", border: "none", cursor: "pointer", fontSize: "0.8rem" }}
                onClick={() => setRegistered(false)}
              >
                daftar ulang
              </button>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="login-page">
      <div className="login-bg" />
      <div className="login-card glass-card">
        {/* Logo */}
        <div className="login-logo">
          <div className="login-logo__icon"><Dice6 size={28} strokeWidth={1.5} /></div>
          <div>
            <h2 className="login-logo__name">Loka Boardgame Cafe</h2>
            <p className="login-logo__sub">Masuk untuk menikmati semua fitur</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="login-tabs">
          <button className={`login-tab ${tab === "login" ? "active" : ""}`} onClick={() => { setTab("login"); setError(""); }}>
            <LogIn size={15} /> Masuk
          </button>
          <button className={`login-tab ${tab === "register" ? "active" : ""}`} onClick={() => { setTab("register"); setError(""); }}>
            <UserPlus size={15} /> Daftar
          </button>
        </div>

        {/* Benefits banner */}
        {tab === "register" && (
          <div className="login-benefits">
            <Zap size={14} />
            <span>Daftar gratis & dapatkan poin reward setiap transaksi!</span>
          </div>
        )}

        {/* Email verification notice for login tab */}
        {tab === "login" && (
          <div style={{
            display: "flex", alignItems: "flex-start", gap: "0.6rem",
            background: "rgba(200,150,62,0.08)", border: "1px solid rgba(200,150,62,0.2)",
            borderRadius: "var(--radius-md)", padding: "0.75rem 1rem", marginBottom: "0.5rem"
          }}>
            <Mail size={15} color="var(--clr-primary)" style={{ flexShrink: 0, marginTop: 2 }} />
            <p style={{ fontSize: "0.78rem", color: "var(--clr-text-muted)", margin: 0 }}>
              Login memerlukan email yang sudah <strong style={{ color: "var(--clr-primary)" }}>terverifikasi</strong>.
              Cek inbox email setelah daftar!
            </p>
          </div>
        )}

        {error && (
          <div className="login-error" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        <form className="login-form" onSubmit={handleSubmit}>
          {tab === "register" && (
            <div className="form-group">
              <label className="form-label" htmlFor="ln-name">Nama Lengkap</label>
              <input id="ln-name" name="name" className="form-input" placeholder="Nama kamu"
                value={form.name} onChange={handleChange} required />
            </div>
          )}

          <div className="form-group">
            <label className="form-label" htmlFor="ln-email">Email</label>
            <input id="ln-email" name="email" type="email" className="form-input"
              placeholder="email@kamu.com" value={form.email} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="ln-pass">Password</label>
            <div className="login-pass-wrap">
              <input id="ln-pass" name="password" type={showPass ? "text" : "password"}
                className="form-input" placeholder="••••••••"
                value={form.password} onChange={handleChange} required minLength={6} />
              <button type="button" className="login-pass-toggle" onClick={() => setShowPass(v => !v)}>
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {tab === "register" && (
            <div className="form-group">
              <label className="form-label" htmlFor="ln-phone">No. WhatsApp (opsional)</label>
              <input id="ln-phone" name="phone" type="tel" className="form-input"
                placeholder="08xxxxxxxxxx" value={form.phone} onChange={handleChange} />
            </div>
          )}

          <button type="submit" id="login-submit-btn" className="btn btn-primary btn-lg login-submit" disabled={loading}>
            {loading
              ? <span className="login-spinner" />
              : tab === "login"
                ? <><LogIn size={17} /> Masuk</>
                : <><UserPlus size={17} /> Buat Akun</>
            }
          </button>
        </form>

        <p className="login-footer-text">
          {tab === "login"
            ? <>Belum punya akun? <button className="login-link" onClick={() => setTab("register")}>Daftar sekarang</button></>
            : <>Sudah punya akun? <button className="login-link" onClick={() => setTab("login")}>Masuk</button></>
          }
        </p>

        <Link to="/" className="login-skip">Lanjutkan sebagai tamu →</Link>
      </div>
    </div>
  );
}
