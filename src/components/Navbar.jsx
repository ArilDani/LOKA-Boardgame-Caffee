import { useState, useEffect } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { ShoppingCart, Menu, X, Dice6, User, LogOut, Shield, Trophy, ChevronDown } from "lucide-react";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import "./Navbar.css";

const MEMBERSHIP_COLOR = { Bronze:"#cd7f32", Silver:"#c0c0c0", Gold:"#ffd700", Platinum:"#e5e4e2" };

export default function Navbar() {
  const { totalItems, toggleCart } = useCart();
  const { user, logout, isAdmin }  = useAuth();
  const [scrolled,   setScrolled]  = useState(false);
  const [menuOpen,   setMenuOpen]  = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const links = [
    { to: "/",        label: "Home" },
    { to: "/about",   label: "About" },
    { to: "/menu",    label: "Menu" },
    { to: "/games",   label: "Games" },
    { to: "/booking", label: "Booking" },
  ];

  const handleLogout = () => { logout(); setUserMenuOpen(false); navigate("/"); };

  return (
    <>
      <nav className={`navbar ${scrolled ? "navbar--scrolled" : ""}`}>
        <div className="container navbar__inner">
          {/* Logo */}
          <Link to="/" className="navbar__logo">
            <div className="navbar__logo-icon"><Dice6 size={22} strokeWidth={1.5}/></div>
            <span className="navbar__logo-text">
              <span className="navbar__logo-loka">Loka</span>
              <span className="navbar__logo-sub">Boardgame Cafe</span>
            </span>
          </Link>

          {/* Desktop Links */}
          <ul className="navbar__links">
            {links.map(l => (
              <li key={l.to}>
                <NavLink to={l.to} end={l.to === "/"} className={({ isActive }) => `navbar__link ${isActive ? "navbar__link--active" : ""}`}>
                  {l.label}
                </NavLink>
              </li>
            ))}
          </ul>

          {/* Actions */}
          <div className="navbar__actions">
            <button id="cart-btn" className="navbar__cart-btn btn btn-ghost btn-sm" onClick={toggleCart} aria-label="Open cart">
              <ShoppingCart size={18}/> <span>Pesanan</span>
              {totalItems > 0 && <span className="badge">{totalItems}</span>}
            </button>

            {/* User Menu */}
            {user ? (
              <div className="navbar__user-wrap" style={{ position:"relative" }}>
                <button
                  className="navbar__user-btn btn btn-ghost btn-sm"
                  onClick={() => setUserMenuOpen(v => !v)}
                  style={{ "--mem-clr": MEMBERSHIP_COLOR[user.membership] || "var(--clr-primary)" }}
                >
                  <div className="navbar__user-avatar">{user.name?.[0]}</div>
                  <span className="navbar__user-name">{user.name.split(" ")[0]}</span>
                  <ChevronDown size={14}/>
                </button>

                {userMenuOpen && (
                  <>
                    <div className="navbar__user-backdrop" onClick={() => setUserMenuOpen(false)} />
                    <div className="navbar__user-dropdown">
                      <div className="navbar__user-header">
                        <div className="navbar__user-avatar navbar__user-avatar--lg">{user.name?.[0]}</div>
                        <div>
                          <p style={{ fontWeight:600, color:"var(--clr-text)", fontSize:"0.9rem" }}>{user.name}</p>
                          <p style={{ fontSize:"0.75rem", color:MEMBERSHIP_COLOR[user.membership] }}>{user.membership} Member · {user.points} poin</p>
                        </div>
                      </div>
                      <div className="navbar__user-divider"/>
                      <button className="navbar__user-item" onClick={() => { navigate("/profile"); setUserMenuOpen(false); }}><User size={15}/> Profil Saya</button>
                      <button className="navbar__user-item" onClick={() => { navigate("/score"); setUserMenuOpen(false); }}><Trophy size={15}/> Skor Game</button>
                      {isAdmin && <button className="navbar__user-item navbar__user-item--admin" onClick={() => { navigate("/admin"); setUserMenuOpen(false); }}><Shield size={15}/> Admin Panel</button>}
                      <div className="navbar__user-divider"/>
                      <button className="navbar__user-item navbar__user-item--logout" onClick={handleLogout}><LogOut size={15}/> Keluar</button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <button className="btn btn-ghost btn-sm" onClick={() => navigate("/login")}>
                <User size={16}/> Masuk
              </button>
            )}

            <button className="navbar__order-btn btn btn-primary btn-sm" onClick={() => navigate("/menu")}>Pesan Sekarang</button>

            {/* Hamburger */}
            <button className="navbar__hamburger" onClick={() => setMenuOpen(v => !v)} aria-label="Toggle menu">
              {menuOpen ? <X size={22}/> : <Menu size={22}/>}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="navbar__mobile-menu animate-fade-in">
          <ul>
            {links.map(l => (
              <li key={l.to}>
                <NavLink to={l.to} end={l.to==="/"} className={({ isActive }) => `navbar__mobile-link ${isActive ? "navbar__mobile-link--active" : ""}`} onClick={() => setMenuOpen(false)}>
                  {l.label}
                </NavLink>
              </li>
            ))}
          </ul>
          <div className="navbar__mobile-actions">
            <button className="btn btn-ghost" onClick={() => { toggleCart(); setMenuOpen(false); }}>
              <ShoppingCart size={18}/> Keranjang {totalItems > 0 && <span className="badge">{totalItems}</span>}
            </button>
            {user ? (
              <>
                <button className="btn btn-ghost" onClick={() => { navigate("/profile"); setMenuOpen(false); }}><User size={16}/> {user.name}</button>
                {isAdmin && <button className="btn btn-ghost" onClick={() => { navigate("/admin"); setMenuOpen(false); }}><Shield size={16}/> Admin</button>}
                <button className="btn btn-secondary" onClick={() => { handleLogout(); setMenuOpen(false); }}><LogOut size={16}/> Keluar</button>
              </>
            ) : (
              <button className="btn btn-ghost" onClick={() => { navigate("/login"); setMenuOpen(false); }}><User size={16}/> Masuk</button>
            )}
            <button className="btn btn-primary" onClick={() => { navigate("/menu"); setMenuOpen(false); }}>Pesan Sekarang</button>
          </div>
        </div>
      )}

      <div style={{ height: "var(--nav-h)" }} />
    </>
  );
}
