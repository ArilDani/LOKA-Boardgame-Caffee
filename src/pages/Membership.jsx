import { useEffect, useState } from 'react'
import { Crown, Star, Zap, Gift, Lock, ChevronRight, Bell, CheckCircle } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import './Membership.css'

function useReveal() {
  useEffect(() => {
    const obs = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible') }),
      { threshold: 0.1 }
    )
    document.querySelectorAll('.reveal').forEach(el => obs.observe(el))
    
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

const TIER_COLORS = {
  Bronze:   { bg: 'rgba(205,127,50,0.12)',  border: 'rgba(205,127,50,0.3)',  text: '#CD7F32' },
  Silver:   { bg: 'rgba(192,192,192,0.12)', border: 'rgba(192,192,192,0.3)', text: '#C0C0C0' },
  Gold:     { bg: 'rgba(255,215,0,0.12)',   border: 'rgba(255,215,0,0.3)',   text: '#FFD700' },
  Platinum: { bg: 'rgba(229,228,226,0.12)', border: 'rgba(229,228,226,0.3)', text: '#E5E4E2' },
}

export default function Membership() {
  useReveal()
  const { user, profile } = useAuth()
  const [tiers,   setTiers]   = useState([])
  const [email,   setEmail]   = useState('')
  const [joined,  setJoined]  = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    window.scrollTo(0, 0)
    supabase.from('membership_tiers')
      .select('*')
      .order('min_points')
      .then(({ data }) => setTiers(data || []))
  }, [])

  const handleWaitlist = async (e) => {
    e.preventDefault()
    setLoading(true)
    await new Promise(r => setTimeout(r, 800)) // simulate
    setJoined(true)
    setLoading(false)
  }

  const currentTier = profile?.membership || 'Bronze'
  const currentPoints = profile?.points || 0

  return (
    <div className="membership-page">

      {/* ── HERO ── */}
      <section className="membership-hero">
        <div className="membership-hero__bg" />
        <div className="membership-hero__glow" />
        <div className="container membership-hero__content">
          <div className="membership-badge animate-fade-up">
            <Crown size={16} />
            <span>Program Membership</span>
          </div>
          <h1 className="animate-fade-up delay-1">
            Jadi Member &<br />
            <span className="gradient-text">Dapatkan Reward</span>
          </h1>
          <p className="membership-hero__sub animate-fade-up delay-2">
            Setiap kunjungan, setiap pesanan — semua berbuah poin dan keuntungan eksklusif
            yang menanti. Program membership Loka hadir untuk merayakan kesetiaan kamu.
          </p>
          <div className="membership-cs-badge animate-fade-up delay-3">
            <span className="membership-cs-dot" />
            <span>Coming Soon — Segera Hadir!</span>
          </div>
        </div>
        {/* Floating tier badges */}
        <div className="membership-hero__floats">
          {['🥉','🥈','🥇','💎'].map((icon, i) => (
            <div key={i} className={`membership-float membership-float--${i+1}`}>{icon}</div>
          ))}
        </div>
      </section>

      {/* ── TIERS ── */}
      <section className="section">
        <div className="container">
          <div className="section-header reveal" style={{ textAlign:'center', alignItems:'center', display:'flex', flexDirection:'column' }}>
            <span className="section-label"><Star size={12} />Tingkatan Member</span>
            <h2>Pilih Level <span className="gradient-text">Kamu</span></h2>
            <p className="section-subtitle">Semakin banyak poin kamu, semakin tinggi tier dan semakin besar keuntungannya!</p>
          </div>

          <div className="tier-grid">
            {tiers.map((tier, i) => {
              const colors = TIER_COLORS[tier.name] || TIER_COLORS.Bronze
              const isCurrent = currentTier === tier.name && user
              return (
                <div
                  key={tier.id}
                  className={`tier-card glass-card reveal delay-${i + 1} ${isCurrent ? 'tier-card--active' : ''}`}
                  style={{ '--tc-bg': colors.bg, '--tc-border': colors.border, '--tc-text': colors.text }}
                >
                  {isCurrent && <div className="tier-card__current-badge">Level Kamu</div>}
                  <div className="tier-card__icon">{tier.icon}</div>
                  <h3 className="tier-card__name" style={{ color: colors.text }}>{tier.name}</h3>
                  <div className="tier-card__points">
                    <span className="tier-card__pts-num">{tier.min_points.toLocaleString()}</span>
                    <span className="tier-card__pts-lbl">poin minimum</span>
                  </div>
                  <ul className="tier-card__benefits">
                    {(tier.benefits || []).map((b, bi) => (
                      <li key={bi} className="tier-benefit">
                        <CheckCircle size={14} style={{ color: colors.text, flexShrink: 0 }} />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="tier-card__footer">
                    <div className="tier-card__lock">
                      <Lock size={12} />
                      <span>Segera Hadir</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="section membership-how">
        <div className="container">
          <div className="section-header reveal" style={{ textAlign:'center', alignItems:'center', display:'flex', flexDirection:'column' }}>
            <span className="section-label"><Zap size={12} />Cara Kerja</span>
            <h2>Gimana Cara <span className="gradient-text">Dapat Poin?</span></h2>
          </div>
          <div className="how-steps">
            {[
              { step:'01', icon:<Gift size={28}/>, title:'Kunjungi Loka', desc:'Datang dan nikmati sesi boardgame, makanan, atau minuman favoritmu.' },
              { step:'02', icon:<Star size={28}/>, title:'Kumpulkan Poin', desc:'Setiap Rp 1.000 yang kamu belanjakan = 1 poin. Makin sering datang, makin banyak poin!' },
              { step:'03', icon:<Crown size={28}/>, title:'Naik Level', desc:'Poin cukup? Tier kamu otomatis naik dan keuntungan eksklusif langsung aktif!' },
              { step:'04', icon:<Zap size={28}/>, title:'Nikmati Reward', desc:'Gunakan keuntungan tiermu: diskon, free play, priority booking, dan masih banyak lagi.' },
            ].map((s, i) => (
              <div key={i} className={`how-step glass-card reveal delay-${i+1}`}>
                <div className="how-step__num">{s.step}</div>
                <div className="how-step__icon">{s.icon}</div>
                <h4>{s.title}</h4>
                <p>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── USER CURRENT STATUS ── */}
      {user && (
        <section className="section">
          <div className="container">
            <div className="membership-status reveal">
              <div className="membership-status__header">
                <Crown size={20} color="var(--clr-primary)" />
                <h3>Status Membership Kamu</h3>
              </div>
              <div className="membership-status__body">
                <div className="membership-status__tier">
                  <span style={{ fontSize:'2rem' }}>
                    {tiers.find(t => t.name === currentTier)?.icon || '🥉'}
                  </span>
                  <div>
                    <p style={{ color:'var(--clr-primary)', fontWeight:700 }}>{currentTier}</p>
                    <p style={{ fontSize:'0.8rem', color:'var(--clr-text-muted)' }}>Tier saat ini</p>
                  </div>
                </div>
                <div className="membership-status__points">
                  <span className="membership-status__pts">{currentPoints.toLocaleString()}</span>
                  <span style={{ fontSize:'0.8rem', color:'var(--clr-text-muted)' }}>Total Poin</span>
                </div>
                {(() => {
                  const nextTier = tiers.find(t => t.min_points > currentPoints)
                  if (!nextTier) return <p style={{ color:'var(--clr-primary)', fontWeight:600 }}>🎉 Tier Tertinggi!</p>
                  const needed = nextTier.min_points - currentPoints
                  return (
                    <div className="membership-status__next">
                      <p style={{ fontSize:'0.8rem', color:'var(--clr-text-muted)' }}>
                        Butuh <strong style={{ color:'var(--clr-text)' }}>{needed.toLocaleString()} poin</strong> lagi untuk tier
                        <strong style={{ color:'var(--clr-primary)' }}> {nextTier.name}</strong>
                      </p>
                      <div className="membership-progress">
                        <div
                          className="membership-progress__fill"
                          style={{ width: `${Math.min((currentPoints / nextTier.min_points) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                  )
                })()}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── WAITLIST / CTA ── */}
      <section className="section membership-cta-section">
        <div className="container">
          <div className="membership-cta-box reveal">
            <div className="membership-cta-glow" />
            <Crown size={40} color="var(--clr-primary)" style={{ opacity: 0.8 }} />
            <h2>Mau Jadi yang <span className="gradient-text">Pertama?</span></h2>
            <p>
              Daftar notifikasi dan jadilah yang pertama tahu saat program membership resmi diluncurkan.
              Member awal mendapatkan bonus poin eksklusif!
            </p>

            {joined ? (
              <div className="membership-joined">
                <CheckCircle size={24} color="var(--clr-accent-2)" />
                <p>Terima kasih! Kami akan menghubungi kamu segera.</p>
              </div>
            ) : (
              <form className="membership-waitlist-form" onSubmit={handleWaitlist}>
                <input
                  type="email"
                  className="form-input"
                  placeholder="Masukkan email kamu"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  style={{ maxWidth: 320 }}
                />
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? <span className="login-spinner" /> : <><Bell size={16} /> Beritahu Saya</>}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
