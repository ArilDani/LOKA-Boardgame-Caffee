import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ArrowRight, Dice6, Coffee, UtensilsCrossed, Star,
  Clock, Users, Gamepad2, Sparkles, ChevronDown, Store, Dices, Target, Trophy,
  BookOpen, Instagram, Crown, Loader2
} from 'lucide-react'
import { useCart } from '../context/CartContext'
import { formatPrice, FOOD_ITEMS, DRINK_COFFEE, PLAY_PACKAGES } from '../data/menuData'
import { supabase } from '../lib/supabase'
import { useSectionSettings } from '../lib/sectionSettings'
import BlogSection    from '../components/BlogSection'
import InstagramSection from '../components/InstagramSection'
import RatingSection  from '../components/RatingSection'
import './Home.css'

// Reveal on scroll hook (handles dynamic content)
function useReveal() {
  useEffect(() => {
    const obs = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible') }),
      { threshold: 0.10 }
    )
    
    // Observe existing
    document.querySelectorAll('.reveal').forEach(el => obs.observe(el))
    
    // Observe future elements
    const mut = new MutationObserver(mutations => {
      mutations.forEach(m => m.addedNodes.forEach(node => {
        if (node.nodeType === 1) {
          if (node.classList.contains('reveal')) obs.observe(node)
          node.querySelectorAll('.reveal').forEach(el => obs.observe(el))
        }
      }))
    })
    mut.observe(document.body, { childList: true, subtree: true })
    
    return () => { obs.disconnect(); mut.disconnect(); }
  }, [])
}

const STATS = [
  { icon: <Gamepad2 size={24} />, value: '200+', label: 'Judul Boardgame' },
  { icon: <Users size={24} />,    value: '500+', label: 'Pelanggan Setia' },
  { icon: <Star size={24} />,     value: '4.9',  label: 'Rating Google' },
  { icon: <Clock size={24} />,    value: '3Th+', label: 'Pengalaman' },
]

const FEATURES = [
  {
    icon: <Dices size={32} />,
    title: '200+ Boardgame',
    desc: 'Koleksi lengkap dari game ringan hingga strategi berat untuk semua level pemain.',
  },
  {
    icon: <UtensilsCrossed size={32} />,
    title: 'Menu Lezat',
    desc: 'Makanan dan minuman khas Loka yang menggugah selera, disiapkan segar setiap hari.',
  },
  {
    icon: <Coffee size={32} />,
    title: 'Kopi Signature',
    desc: 'Lokachino dan berbagai minuman signature yang bikin sesi game makin seru.',
  },
  {
    icon: <Store size={32} />,
    title: 'Suasana Nyaman',
    desc: 'Ruangan cozy dengan AC, lighting hangat, dan meja game yang luas.',
  },
]

export default function Home() {
  useReveal()
  const { addItem } = useCart()
  const navigate = useNavigate()
  const heroRef = useRef(null)
  const sectionSettings = useSectionSettings()

  const [featuredFood, setFeaturedFood] = useState([])
  const [featuredDrink, setFeaturedDrink] = useState([])
  const [playPackages, setPlayPackages] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      setLoading(true)
      try {
        const [foodRes, drinkRes, playRes] = await Promise.all([
          supabase.from('products').select('*').eq('category', 'food').eq('is_available', true).limit(3),
          supabase.from('products').select('*').eq('category', 'coffee').eq('is_available', true).limit(3),
          supabase.from('products').select('*').eq('category', 'play').eq('is_available', true)
        ]);
        
        // Fallback to dummy data if DB returns 0 items (e.g. less than 100 transactions/empty DB)
        const dummyFood = FOOD_ITEMS.slice(0, 3).map(x => ({ ...x, image_url: x.image }));
        const dummyDrink = DRINK_COFFEE.slice(0, 3).map(x => ({ ...x, image_url: x.image }));
        const dummyPlay = PLAY_PACKAGES.map(x => ({ ...x, image_url: x.image }));

        setFeaturedFood(foodRes.data?.length > 0 ? foodRes.data : dummyFood)
        setFeaturedDrink(drinkRes.data?.length > 0 ? drinkRes.data : dummyDrink)
        setPlayPackages(playRes.data?.length > 0 ? playRes.data : dummyPlay)
      } catch (err) {
        console.error("Home fetch error:", err)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

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

  const handleAddItem = (item) => {
    addItem({ ...item, image: item.image_url })
  }

  return (
    <div className="home">
      {/* ── HERO ── */}
      <section className="hero noise-overlay">
        <div className="hero__bg" ref={heroRef}>
          <div className="hero__gradient" />
          <div className="hero__dice hero__dice--1"><Dices size={32} /></div>
          <div className="hero__dice hero__dice--2"><Trophy size={32} /></div>
          <div className="hero__dice hero__dice--3"><Dice6 size={32} /></div>
          <div className="hero__dice hero__dice--4"><Target size={32} /></div>
        </div>

        <div className="container hero__content">
          <div className="hero__badge animate-fade-up">
            <Sparkles size={14} />
            <span>Boardgame Cafe #1 di Kota</span>
          </div>

          <h1 className="hero__title animate-fade-up delay-1">
            Makan, Minum &<br />
            <span className="gradient-text">Main Bersama</span>
          </h1>

          <p className="hero__subtitle animate-fade-up delay-2">
            Nikmati pengalaman bermain boardgame terbaik dengan menu lezat khas Loka.
            Ratusan judul game, suasana cozy, dan kopi signature yang bikin betah!
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

          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
              <Loader2 size={32} className="spin-icon" style={{ color: 'var(--clr-primary)' }} />
            </div>
          ) : (
            <div className="menu-preview-grid">
              {featuredFood.map((item, i) => (
                <div key={item.id} className={`menu-preview-card glass-card reveal delay-${i + 1}`}>
                  <div className="menu-preview-card__visual">
                    {item.image_url ? (
                      <img src={item.image_url} alt={item.name} className="menu-preview-card__image" />
                    ) : (
                      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--clr-bg-3)' }}>
                        <UtensilsCrossed size={48} color="var(--clr-text-dim)" />
                      </div>
                    )}
                  </div>
                  {item.tag && <span className="menu-preview-card__tag">{item.tag}</span>}
                  <div className="menu-preview-card__body">
                    <h4>{item.name}</h4>
                    <p>{item.description}</p>
                    <div className="menu-preview-card__footer">
                      <span className="menu-preview-card__price">{formatPrice(item.price)}</span>
                      <button className="btn btn-primary btn-sm" onClick={() => handleAddItem(item)}>
                        + Pesan
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

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
            {loading ? (
              <div style={{ padding: '1rem' }}><Loader2 size={24} className="spin-icon" /></div>
            ) : (
              <ul className="home-coffee__list">
                {featuredDrink.map(d => (
                  <li key={d.id} className="home-coffee__list-item">
                    <div className="home-coffee__list-visual">
                      {d.image_url ? (
                        <img src={d.image_url} alt={d.name} className="home-coffee__list-image" />
                      ) : (
                        <Coffee size={24} color="var(--clr-text-dim)" />
                      )}
                    </div>
                    <div>
                      <p className="home-coffee__list-name">{d.name}</p>
                      <p className="home-coffee__list-price">{formatPrice(d.price)}</p>
                    </div>
                    <button className="btn btn-ghost btn-sm" onClick={() => handleAddItem(d)}>+ Pesan</button>
                  </li>
                ))}
              </ul>
            )}
            <Link to="/menu" className="btn btn-accent">
              Lihat Semua Minuman <ArrowRight size={16} />
            </Link>
          </div>
          <div className="home-coffee__visual reveal delay-2">
            <div className="coffee-visual-box">
              <div className="coffee-visual-icon"><Coffee size={64} color="var(--clr-primary)" /></div>
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
          
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
              <Loader2 size={32} className="spin-icon" style={{ color: 'var(--clr-primary)' }} />
            </div>
          ) : (
            <div className="play-packages">
              {playPackages.map((pkg, i) => (
                <div key={pkg.id} className={`play-package-card reveal delay-${i + 1} ${pkg.tag ? 'play-package-card--featured' : ''}`}>
                  {pkg.tag && <div className="play-package-card__ribbon">{pkg.tag}</div>}
                  <div className="play-package-card__icon">
                    {pkg.name.toLowerCase().includes('jam') ? <Clock size={48} /> : <Dices size={48} />}
                  </div>
                  <h3>{pkg.name}</h3>
                  <div className="play-package-card__price">
                    <span className="play-package-card__amount">{formatPrice(pkg.price)}</span>
                  </div>
                  <p>{pkg.description}</p>
                  <button
                    className={`btn ${pkg.tag ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ width: '100%', marginTop: 'auto' }}
                    onClick={() => handleAddItem(pkg)}
                  >
                    Pilih Paket
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── RATING — Best This Month ── */}
      <section className="section home-rating" id="rating">
        <div className="container">
          <div className="section-header reveal">
            <span className="section-label"><Star size={12} />Ulasan Pelanggan</span>
            <h2 className="section-title">Rating <span className="gradient-text">Terbaik Bulan Ini</span></h2>
            <p className="section-subtitle">Lihat produk favorit dan ulasan terbaru dari pelanggan setia Loka.</p>
          </div>
          <RatingSection showForm={true} />
        </div>
      </section>

      {/* ── ARTIKEL BLOG ── */}
      {sectionSettings.blog && (
        <section className="section home-blog" id="artikel">
          <div className="container">
            <div className="section-header reveal">
              <span className="section-label"><BookOpen size={12} />Blog & Artikel</span>
              <h2 className="section-title">Cerita dari <span className="gradient-text">Loka</span></h2>
              <p className="section-subtitle">Update terbaru, tips bermain, dan cerita seru dari komunitas Loka Boardgame Cafe.</p>
            </div>
            <BlogSection limit={3} />
          </div>
        </section>
      )}

      {/* ── INSTAGRAM ── */}
      {sectionSettings.instagram && (
        <section id="instagram" style={{ padding: 0 }}>
          <div className="container" style={{ paddingTop: "var(--space-md)" }}>
            <div className="section-header reveal">
              <span className="section-label"><Instagram size={12} />Ikuti Kami</span>
              <h2 className="section-title">Di <span className="gradient-text">Instagram</span></h2>
              <p className="section-subtitle">Ikuti kami untuk update terbaru, event seru, dan promo spesial!</p>
            </div>
          </div>
          <InstagramSection />
        </section>
      )}

      {/* ── MEMBERSHIP TEASER ── */}
      {sectionSettings.membership && (
        <section className="section home-membership">
          <div className="container">
            <div className="home-membership__card reveal">
              <div className="home-membership__bg" />
              <div className="home-membership__content">
                <div className="home-membership__badge">
                  <Crown size={16} /> Coming Soon
                </div>
                <h2>Program Membership <span className="gradient-text">Loka</span></h2>
                <p>
                  Dapatkan keuntungan eksklusif dengan menjadi member Loka!
                  Nikmati diskon, poin reward, dan akses event khusus.
                </p>
                <Link to="/membership" className="btn btn-primary btn-lg">
                  <Crown size={18} />
                  Pelajari Membership
                </Link>
              </div>
              <div className="home-membership__tiers">
                {[
                  { name: "Bronze", color: "#CD7F32", icon: "🥉" },
                  { name: "Silver", color: "#C0C0C0", icon: "🥈" },
                  { name: "Gold",   color: "#FFD700", icon: "🥇" },
                  { name: "Platinum", color: "#E5E4E2", icon: "💎" },
                ].map((t, i) => (
                  <div key={t.name} className={`home-tier-chip reveal delay-${i + 1}`} style={{ "--tc": t.color }}>
                    <span>{t.icon}</span>
                    <span>{t.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

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
