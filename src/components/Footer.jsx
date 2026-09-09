import { Link } from 'react-router-dom'
import { Dice6, Instagram, MapPin, Phone, Clock, Heart } from 'lucide-react'
import './Footer.css'

export default function Footer() {
  const year = new Date().getFullYear()
  return (
    <footer className="footer">
      <div className="container footer__inner">

        {/* Brand */}
        <div className="footer__brand">
          <Link to="/" className="footer__logo">
            <div className="footer__logo-icon"><Dice6 size={20} strokeWidth={1.5} /></div>
            <span>Loka Boardgame Cafe</span>
          </Link>
          <p>Tempat terbaik untuk makan, minum, dan bermain boardgame bersama orang-orang tersayang.</p>
          <a
            href="https://www.instagram.com/lokaboardgamecafe"
            target="_blank"
            rel="noopener noreferrer"
            className="footer__social"
          >
            <Instagram size={18} />
            @lokaboardgamecafe
          </a>
        </div>

        {/* Links */}
        <div className="footer__section">
          <h5>Menu</h5>
          <ul>
            <li><Link to="/menu">Makanan</Link></li>
            <li><Link to="/menu">Minuman</Link></li>
            <li><Link to="/menu">Paket Main</Link></li>
            <li><Link to="/booking">Sewa Boardgame</Link></li>
          </ul>
        </div>

        <div className="footer__section">
          <h5>Halaman</h5>
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/about">About</Link></li>
            <li><Link to="/games">Games</Link></li>
            <li><Link to="/booking">Booking</Link></li>
          </ul>
        </div>

        {/* Info */}
        <div className="footer__section">
          <h5>Informasi</h5>
          <ul className="footer__info-list">
            <li><MapPin size={14} /> <span>Jl. Loka Indah No. 1, Bandung</span></li>
            <li><Phone size={14} /> <span>+62 812-3456-7890</span></li>
            <li>
              <Clock size={14} />
              <span>Sen–Jum: 13.00–23.00<br />Sab–Min: 10.00–00.00</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="footer__bottom">
        <div className="container footer__bottom-inner">
          <p>© {year} Loka Boardgame Cafe. All rights reserved.</p>
          <p className="footer__credit">Made with <Heart size={12} fill="currentColor" /> for boardgame lovers</p>
        </div>
      </div>
    </footer>
  )
}
