import { Link } from 'react-router-dom'
import { Dice6, MapPin, Phone, Clock, Heart, MessageCircle } from 'lucide-react'
import './Footer.css'

const ADMIN_WA = '6285327639133'

// Instagram SVG icon (no lucide version available for brand icons)
function InstagramIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
    </svg>
  )
}

function WhatsAppIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
      <path d="M12.004 2C6.479 2 2 6.479 2 12.003c0 1.86.505 3.604 1.385 5.104L2 22l4.99-1.361C8.418 21.504 10.176 22 12.004 22 17.522 22 22 17.522 22 12.003 22 6.479 17.522 2 12.004 2zm0 18.182a8.157 8.157 0 0 1-4.162-1.136l-.298-.177-3.094.843.847-3.018-.195-.309A8.16 8.16 0 0 1 3.818 12.003c0-4.519 3.667-8.185 8.186-8.185 4.519 0 8.184 3.666 8.184 8.185 0 4.519-3.665 8.179-8.184 8.179z"/>
    </svg>
  )
}

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="footer">
      <div className="container footer__inner">

        {/* Brand */}
        <div className="footer__brand">
          <Link to="/" className="footer__logo">
            <div className="footer__logo-icon"><Dice6 size={20} strokeWidth={1.5}/></div>
            <span>Loka Boardgame Cafe</span>
          </Link>
          <p>Tempat terbaik untuk makan, minum, dan bermain boardgame bersama orang-orang tersayang.</p>

          {/* Social media links */}
          <div className="footer__socials">
            <a
              href="https://www.instagram.com/lokaboardgamecafe"
              target="_blank"
              rel="noopener noreferrer"
              className="footer__social footer__social--ig"
              aria-label="Instagram Loka Boardgame Cafe"
            >
              <InstagramIcon size={16}/>
              <span>@lokaboardgamecafe</span>
            </a>
            <a
              href={`https://wa.me/${ADMIN_WA}`}
              target="_blank"
              rel="noopener noreferrer"
              className="footer__social footer__social--wa"
              aria-label="WhatsApp Admin Loka"
            >
              <WhatsAppIcon size={16}/>
              <span>+62 853-2763-9133</span>
            </a>
          </div>
        </div>

        {/* Links */}
        <div className="footer__section">
          <h5>Menu</h5>
          <ul>
            <li><Link to="/menu">Makanan</Link></li>
            <li><Link to="/menu">Minuman</Link></li>
            <li><Link to="/menu">Paket Main</Link></li>
            <li><Link to="/games">Sewa Boardgame</Link></li>
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
            <li><MapPin size={14}/> <span>Jl. Loka Indah No. 1, Bandung</span></li>
            <li>
              <Phone size={14}/>
              <a href={`https://wa.me/${ADMIN_WA}`} target="_blank" rel="noopener noreferrer" className="footer__phone-link">
                +62 853-2763-9133
              </a>
            </li>
            <li>
              <Clock size={14}/>
              <span>Sen–Jum: 13.00–23.00<br/>Sab–Min: 10.00–00.00</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="footer__bottom">
        <div className="container footer__bottom-inner">
          <p>© {year} Loka Boardgame Cafe. All rights reserved.</p>
          <p className="footer__credit">Made with <Heart size={12} fill="currentColor"/> for boardgame lovers</p>
        </div>
      </div>
    </footer>
  )
}
