import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapPin, Clock, Phone, Instagram, Users, Heart, Dice6, Dices, Coffee, Store, UtensilsCrossed } from 'lucide-react'
import './About.css'

const TEAM_VALUES = [
  { icon: <Dices size={32} />, title: 'Fun First', desc: 'Kami percaya bermain game adalah cara terbaik untuk mempererat hubungan.' },
  { icon: <Coffee size={32} />, title: 'Quality Drinks', desc: 'Setiap minuman dibuat dengan bahan segar pilihan oleh barista berpengalaman.' },
  { icon: <Store size={32} />, title: 'Cozy Vibes', desc: 'Suasana hangat dan nyaman yang bikin kamu betah berlama-lama.' },
  { icon: <Heart size={32} />, title: 'Community', desc: 'Tempat berkumpul yang inklusif untuk semua kalangan pecinta boardgame.' },
]

export default function About() {
  const navigate = useNavigate()

  useEffect(() => {
    window.scrollTo(0, 0)
    const els = document.querySelectorAll('.reveal')
    const obs = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible') }),
      { threshold: 0.1 }
    )
    els.forEach(el => obs.observe(el))
    return () => obs.disconnect()
  }, [])

  return (
    <div className="about-page">

      {/* ── HERO ── */}
      <section className="about-hero">
        <div className="about-hero__bg" />
        <div className="container about-hero__content">
          <span className="section-label"><Heart size={12} />Tentang Kami</span>
          <h1>Cerita di Balik <span className="gradient-text">Loka</span></h1>
          <p className="about-hero__sub">
            Bermula dari kecintaan terhadap boardgame dan kopi, Loka hadir sebagai ruang
            untuk berkumpul, bermain, dan menciptakan kenangan bersama.
          </p>
        </div>
      </section>

      {/* ── STORY ── */}
      <section className="section about-story">
        <div className="container about-story__inner">
          <div className="about-story__text reveal">
            <span className="section-label"><Dice6 size={12} />Asal Usul</span>
            <h2>Dari Hobi Menjadi <span className="gradient-text">Rumah Kedua</span></h2>
            <p>
              Loka Boardgame Cafe lahir dari impian sederhana — menciptakan tempat di mana orang-orang
              bisa mematikan layar dan menikmati kebersamaan yang nyata. Dimulai dengan koleksi 20 boardgame
              dan sebuah ruangan kecil, kini Loka telah berkembang menjadi salah satu boardgame cafe
              paling dicintai di kota.
            </p>
            <p>
              Dengan lebih dari 200 judul boardgame, menu makanan dan minuman khas yang terus bertambah,
              serta komunitas yang makin besar — Loka bukan sekadar cafe, melainkan rumah kedua bagi
              para pecinta game.
            </p>
            <div className="about-story__highlights">
              <div className="about-highlight">
                <span className="about-highlight__num">200+</span>
                <span>Koleksi Game</span>
              </div>
              <div className="about-highlight">
                <span className="about-highlight__num">3+</span>
                <span>Tahun Berdiri</span>
              </div>
              <div className="about-highlight">
                <span className="about-highlight__num">500+</span>
                <span>Pelanggan Setia</span>
              </div>
            </div>
          </div>

          <div className="about-story__visual reveal delay-2">
            <div className="about-visual-grid">
              <div className="about-visual-card about-visual-card--lg">
                <span className="about-visual-icon"><Dices size={48} /></span>
                <p>Boardgame Library</p>
              </div>
              <div className="about-visual-card">
                <span className="about-visual-icon"><Coffee size={48} /></span>
                <p>Kopi Segar</p>
              </div>
              <div className="about-visual-card">
                <span className="about-visual-icon"><UtensilsCrossed size={48} /></span>
                <p>Menu Lezat</p>
              </div>
              <div className="about-visual-card about-visual-card--wide">
                <span className="about-visual-icon"><Store size={48} /></span>
                <p>Suasana Cozy</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── VALUES ── */}
      <section className="section about-values">
        <div className="container">
          <div className="section-header reveal" style={{ textAlign: 'center', alignItems: 'center', display: 'flex', flexDirection: 'column' }}>
            <span className="section-label"><Heart size={12} />Nilai Kami</span>
            <h2>Apa yang Membuat <span className="gradient-text">Loka Istimewa</span></h2>
          </div>
          <div className="values-grid">
            {TEAM_VALUES.map((v, i) => (
              <div key={i} className={`value-card glass-card reveal delay-${i + 1}`}>
                <div className="value-card__icon">{v.icon}</div>
                <h4>{v.title}</h4>
                <p>{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── INFO ── */}
      <section className="section about-info">
        <div className="container about-info__inner">
          <div className="about-info__card glass-card reveal">
            <h3>📍 Lokasi &amp; Jam Buka</h3>
            <ul className="about-info__list">
              <li>
                <MapPin size={16} />
                <div>
                  <p>Jl. Loka Indah No. 1, Bandung</p>
                  <a
                    href="https://maps.google.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="about-map-link"
                  >
                    Lihat di Google Maps →
                  </a>
                </div>
              </li>
              <li>
                <Clock size={16} />
                <div>
                  <p><strong>Senin – Jumat</strong>: 13.00 – 23.00</p>
                  <p><strong>Sabtu – Minggu</strong>: 10.00 – 00.00</p>
                </div>
              </li>
              <li>
                <Phone size={16} />
                <div>
                  <p>+62 812-3456-7890</p>
                  <p className="about-info__sub">WhatsApp & Telepon</p>
                </div>
              </li>
              <li>
                <Instagram size={16} />
                <div>
                  <a
                    href="https://www.instagram.com/lokaboardgamecafe"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="about-map-link"
                  >
                    @lokaboardgamecafe
                  </a>
                </div>
              </li>
            </ul>
          </div>

          <div className="about-info__cta reveal delay-2">
            <div className="about-cta-box">
              <div className="about-cta-icon"><Dices size={64} color="var(--clr-primary)" /></div>
              <h3>Siap Bermain?</h3>
              <p>Kunjungi Loka sekarang dan temukan pengalaman boardgame yang tak terlupakan bersama orang-orang tersayang.</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <button className="btn btn-primary" onClick={() => navigate('/booking')}>
                  Booking Meja Sekarang
                </button>
                <button className="btn btn-secondary" onClick={() => navigate('/menu')}>
                  Lihat Menu
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
