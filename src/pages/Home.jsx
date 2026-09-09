import { useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ArrowRight, Dice6, Coffee, UtensilsCrossed, Star,
  Clock, Users, Gamepad2, Sparkles, ChevronDown
} from 'lucide-react'
import { useCart } from '../context/CartContext'
import { FOOD_ITEMS, DRINK_COFFEE, PLAY_PACKAGES, formatPrice } from '../data/menuData'
import './Home.css'

// Reveal on scroll hook
function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll('.reveal')
    const obs = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible') }),
      { threshold: 0.12 }
    )
    els.forEach(el => obs.observe(el))
    return () => obs.disconnect()
  }, [])
}

const FEATURED_FOOD  = FOOD_ITEMS.slice(0, 3)
const FEATURED_DRINK = DRINK_COFFEE.slice(0, 3)

const STATS = [
  { icon: <Gamepad2 size={24} />, value: '200+', label: 'Judul Boardgame' },
  { icon: <Users size={24} />,    value: '500+', label: 'Pelanggan Setia' },
  { icon: <Star size={24} />,     value: '4.9',  label: 'Rating Google' },
  { icon: <Clock size={24} />,    value: '3Th+', label: 'Pengalaman' },
]

const FEATURES = [
  {
    icon: '🎲',
    title: '200+ Boardgame',
    desc: 'Koleksi lengkap dari game ringan hingga strategi berat untuk semua level pemain.',
  },
  {
    icon: '🍜',
    title: 'Menu Lezat',
    desc: 'Makanan dan minuman khas Loka yang menggugah selera, disiapkan segar setiap hari.',
  },
  {
    icon: '☕',
    title: 'Kopi Signature',
    desc: 'Lokachino dan berbagai minuman signature yang bikin sesi game makin seru.',
  },
  {
    icon: '🏡',
    title: 'Suasana Nyaman',
    desc: 'Ruangan cozy dengan AC, lighting hangat, dan meja game yang luas.',
  },
]

export default function Home() {
  useReveal()
  const { addItem } = useCart()
  const navigate = useNavigate()
  const heroRef = useRef(null)

  // Parallax hero
  useEffect(() => {
    const onScroll = () => {
      if (heroRef.current) {
        heroRef.current.style.transform = `translateY(${window.scrollY * 0.4}px)`
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div className="home">
      {/* ── HERO ── */}
      <section className="hero noise-overlay">
        <div className="hero__bg" ref={heroRef}>
          <div className="hero__gradient" />
          {/* Floating dice decorations */}
          <div className="hero__dice hero__dice--1">🎲</div>
          <div className="hero__dice hero__dice--2">🃏</div>
          <div className="hero__dice hero__dice--3">♟️</div>
          <div className="hero__dice hero__dice--4">🎯</div>
        </div>

        <div className="container hero__content">
          <div className="hero__badge animate-fade-up">
            <Sparkles size={14} />
            <span>Boardgame Cafe #1 di Kota</span>
          </div>

          <h1 className="hero__title animate-fade-up delay-1">
            Makan, Minum &amp;<br />
            <span className="gradient-text">Main Bersama</span>
          </h1>

          <p className="hero__subtitle animate-fade-up delay-2">
            Nikmati pengalaman bermain boardgame terbaik dengan menu lezat khas Loka.
            200+ judul game, suasana cozy, dan kopi signature yang bikin betah!
          </p>

          <div className="hero__cta animate-fade-up delay-3">
            <button className="btn btn-primary btn-lg" onClick={() => navigate('/menu')}>
              <UtensilsCrossed size={18} />
              Pesan Sekarang
            </button>
            <button className="btn btn-secondary btn-lg" onClick={() => navigate('/booking')}>
              <Dice6 size={18} />
              Booking Meja
            </button>
          </div>

          {/* Scroll indicator */}
          <div className="hero__scroll">
            <ChevronDown size={20} className="animate-float" />
          </div>
        </div>

        {/* Stats bar */}
        <div className="hero__stats">
          <div className="container hero__stats-inner">
            {STATS.map((s, i) => (
              <div key={i} className="hero__stat">
                <span className="hero__stat-icon">{s.icon}</span>
                <div>
                  <p className="hero__stat-value">{s.value}</p>
                  <p className="hero__stat-label">{s.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="section home-features">
        <div className="container">
          <div className="section-header reveal">
            <span className="section-label"><Sparkles size={12} />Kenapa Loka?</span>
            <h2 className="section-title">Pengalaman Cafe yang <span className="gradient-text">Tak Terlupakan</span></h2>
          </div>
          <div className="features-grid">
            {FEATURES.map((f, i) => (
              <div key={i} className={`feature-card glass-card reveal delay-${i + 1}`}>
                <div className="feature-card__icon">{f.icon}</div>
                <h4>{f.title}</h4>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURED FOOD ── */}
      <section className="section home-menu">
        <div className="container">
          <div className="section-header reveal">
            <span className="section-label"><UtensilsCrossed size={12} />Andalan Kami</span>
            <h2 className="section-title">Menu <span className="gradient-text">Favorit</span></h2>
            <p className="section-subtitle">Dimasak dengan cinta, disajikan dengan senyuman — cocok dinikmati sambil main game!</p>
          </div>

          <div className="menu-preview-grid">
            {FEATURED_FOOD.map((item, i) => (
              <div key={item.id} className={`menu-preview-card glass-card reveal delay-${i + 1}`}>
                <div className="menu-preview-card__emoji">{item.emoji}</div>
                {item.tag && <span className="menu-preview-card__tag">{item.tag}</span>}
                <div className="menu-preview-card__body">
                  <h4>{item.name}</h4>
                  <p>{item.desc}</p>
                  <div className="menu-preview-card__footer">
                    <span className="menu-preview-card__price">{formatPrice(item.price)}</span>
                    <button className="btn btn-primary btn-sm" onClick={() => addItem(item)}>
                      + Pesan
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="home-menu__cta reveal">
            <Link to="/menu" className="btn btn-secondary btn-lg">
              Lihat Semua Menu <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── COFFEE ── */}
      <section className="section home-coffee">
        <div className="container home-coffee__inner">
          <div className="home-coffee__text reveal">
            <span className="section-label"><Coffee size={12} />Signature Drinks</span>
            <h2 className="section-title">Kopi &amp; Minuman <span className="gradient-text">Khas Loka</span></h2>
            <p>Dari Lokachino klasik hingga V60 single origin — setiap tegukan menemani petualangan boardgame kamu.</p>
            <ul className="home-coffee__list">
              {FEATURED_DRINK.map(d => (
                <li key={d.id} className="home-coffee__list-item">
                  <span className="home-coffee__list-emoji">{d.emoji}</span>
                  <div>
                    <p className="home-coffee__list-name">{d.name}</p>
                    <p className="home-coffee__list-price">{formatPrice(d.price)}</p>
                  </div>
                  <button className="btn btn-ghost btn-sm" onClick={() => addItem(d)}>+ Pesan</button>
                </li>
              ))}
            </ul>
            <Link to="/menu" className="btn btn-accent">
              Lihat Semua Minuman <ArrowRight size={16} />
            </Link>
          </div>
          <div className="home-coffee__visual reveal delay-2">
            <div className="coffee-visual-box">
              <div className="coffee-visual-emoji">☕</div>
              <div className="coffee-visual-rings" />
              <div className="coffee-visual-glow" />
            </div>
          </div>
        </div>
      </section>

      {/* ── PLAY PACKAGES ── */}
      <section className="section home-play">
        <div className="container">
          <div className="section-header reveal">
            <span className="section-label"><Gamepad2 size={12} />Paket Main</span>
            <h2 className="section-title">Harga Main yang <span className="gradient-text">Terjangkau</span></h2>
          </div>
          <div className="play-packages">
            {PLAY_PACKAGES.map((pkg, i) => (
              <div key={pkg.id} className={`play-package-card reveal delay-${i + 1} ${pkg.tag ? 'play-package-card--featured' : ''}`}>
                {pkg.tag && <div className="play-package-card__ribbon">{pkg.tag}</div>}
                <div className="play-package-card__icon">{pkg.emoji}</div>
                <h3>{pkg.name}</h3>
                <div className="play-package-card__price">
                  <span className="play-package-card__amount">{formatPrice(pkg.price)}</span>
                  <span className="play-package-card__unit">{pkg.unit}</span>
                </div>
                <p>{pkg.description}</p>
                <button
                  className={`btn ${pkg.tag ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ width: '100%', marginTop: 'auto' }}
                  onClick={() => addItem(pkg)}
                >
                  Pilih Paket
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section className="section home-cta">
        <div className="container">
          <div className="home-cta__card reveal">
            <div className="home-cta__glow" />
            <h2>Siap Bermain Hari Ini?</h2>
            <p>Booking meja sekarang dan nikmati pengalaman boardgame yang tidak terlupakan bersama teman dan keluarga.</p>
            <div className="home-cta__actions">
              <button className="btn btn-primary btn-lg" onClick={() => navigate('/booking')}>
                <Dice6 size={18} />
                Booking Sekarang
              </button>
              <button className="btn btn-ghost btn-lg" onClick={() => navigate('/menu')}>
                Lihat Menu
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
