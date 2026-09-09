import { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { ShoppingCart, Menu, X, Dice6 } from 'lucide-react';
import { useCart } from '../context/CartContext';
import './Navbar.css';

export default function Navbar() {
  const { totalItems, toggleCart } = useCart();
  const [scrolled,  setScrolled]  = useState(false);
  const [menuOpen,  setMenuOpen]  = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const links = [
    { to: '/',        label: 'Home' },
    { to: '/about',   label: 'About' },
    { to: '/menu',    label: 'Menu' },
    { to: '/games',   label: 'Games' },
    { to: '/booking', label: 'Booking' },
  ];

  return (
    <>
      <nav className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`}>
        <div className="container navbar__inner">
          {/* Logo */}
          <Link to="/" className="navbar__logo">
            <div className="navbar__logo-icon">
              <Dice6 size={22} strokeWidth={1.5} />
            </div>
            <span className="navbar__logo-text">
              <span className="navbar__logo-loka">Loka</span>
              <span className="navbar__logo-sub">Boardgame Cafe</span>
            </span>
          </Link>

          {/* Desktop Links */}
          <ul className="navbar__links">
            {links.map(l => (
              <li key={l.to}>
                <NavLink
                  to={l.to}
                  end={l.to === '/'}
                  className={({ isActive }) =>
                    `navbar__link ${isActive ? 'navbar__link--active' : ''}`
                  }
                >
                  {l.label}
                </NavLink>
              </li>
            ))}
          </ul>

          {/* Actions */}
          <div className="navbar__actions">
            <button
              id="cart-btn"
              className="navbar__cart-btn btn btn-ghost btn-sm"
              onClick={toggleCart}
              aria-label="Open cart"
            >
              <ShoppingCart size={18} />
              <span>Pesanan</span>
              {totalItems > 0 && <span className="badge">{totalItems}</span>}
            </button>
            <button
              className="navbar__order-btn btn btn-primary btn-sm"
              onClick={() => navigate('/menu')}
            >
              Pesan Sekarang
            </button>

            {/* Mobile hamburger */}
            <button
              className="navbar__hamburger"
              onClick={() => setMenuOpen(v => !v)}
              aria-label="Toggle menu"
            >
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
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
                <NavLink
                  to={l.to}
                  end={l.to === '/'}
                  className={({ isActive }) =>
                    `navbar__mobile-link ${isActive ? 'navbar__mobile-link--active' : ''}`
                  }
                  onClick={() => setMenuOpen(false)}
                >
                  {l.label}
                </NavLink>
              </li>
            ))}
          </ul>
          <div className="navbar__mobile-actions">
            <button
              className="btn btn-ghost"
              onClick={() => { toggleCart(); setMenuOpen(false); }}
            >
              <ShoppingCart size={18} />
              Keranjang {totalItems > 0 && <span className="badge">{totalItems}</span>}
            </button>
            <button
              className="btn btn-primary"
              onClick={() => { navigate('/menu'); setMenuOpen(false); }}
            >
              Pesan Sekarang
            </button>
          </div>
        </div>
      )}

      {/* Spacer */}
      <div style={{ height: 'var(--nav-h)' }} />
    </>
  );
}
