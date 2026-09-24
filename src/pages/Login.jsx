import { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Dice6, Eye, EyeOff, LogIn, UserPlus, Zap } from "lucide-react";
import "./Login.css";

export default function Login() {
  const { login, register, user } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();
  const from      = location.state?.from || "/";

  const [tab,      setTab]    = useState("login");
  const [form,     setForm]   = useState({ name: "", email: "", password: "", phone: "" });
  const [showPass, setShowPass] = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");

  useEffect(() => { if (user) navigate(from, { replace: true }); }, [user]);
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
        await login(form.email, form.password);
      } else {
        if (!form.name.trim()) { setError("Nama wajib diisi"); return; }
        await register(form.name, form.email, form.password, form.phone);
      }
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

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
            <span>Dapatkan poin setiap transaksi & unlock membership eksklusif!</span>
          </div>
        )}

        {error && <div className="login-error">{error}</div>}

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

          <button type="submit" className="btn btn-primary btn-lg login-submit" disabled={loading}>
            {loading ? <span className="login-spinner" /> : tab === "login" ? <><LogIn size={17} /> Masuk</> : <><UserPlus size={17} /> Buat Akun</>}
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
