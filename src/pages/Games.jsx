import { useEffect, useState } from 'react'
import { BOARDGAMES } from '../data/menuData'
import { Search, Users, Clock, Zap, X, MessageCircle, ShieldCheck, Star, Package } from 'lucide-react'
import './Games.css'

const CATEGORIES = ['Semua', 'Strategy', 'Family', 'Party', 'Cooperative', 'Card Game', 'Classic', 'Dexterity', 'Social']
const DIFFICULTY_COLOR = { Easy: '#52b788', Medium: '#c8963e', Hard: '#f87171' }
const ADMIN_WA = '6285327639133'

function CategoryIcon({ category, size = 32 }) {
  const s = size
  switch (category) {
    case 'Strategy':
      return (
        <svg width={s} height={s} viewBox="0 0 32 32" fill="none" aria-hidden="true">
          <rect x="2" y="20" width="6" height="10" rx="1" fill="currentColor" opacity=".5"/>
          <rect x="10" y="14" width="6" height="16" rx="1" fill="currentColor" opacity=".7"/>
          <rect x="18" y="8" width="6" height="22" rx="1" fill="currentColor" opacity=".9"/>
          <rect x="26" y="2" width="4" height="28" rx="1" fill="currentColor"/>
        </svg>
      )
    case 'Family':
      return (
        <svg width={s} height={s} viewBox="0 0 32 32" fill="none" aria-hidden="true">
          <circle cx="9" cy="8" r="4" fill="currentColor"/>
          <circle cx="23" cy="8" r="4" fill="currentColor" opacity=".8"/>
          <circle cx="16" cy="10" r="3" fill="currentColor" opacity=".6"/>
          <path d="M2 28c0-5 3-8 7-8h6c4 0 7 3 7 8" fill="currentColor" opacity=".9"/>
          <path d="M17 28c0-4 2.5-7 6-7 3.5 0 6 3 6 7" fill="currentColor" opacity=".5"/>
        </svg>
      )
    case 'Party':
      return (
        <svg width={s} height={s} viewBox="0 0 32 32" fill="none" aria-hidden="true">
          <path d="M16 2 L19 12 L30 12 L21 19 L24 30 L16 23 L8 30 L11 19 L2 12 L13 12 Z" fill="currentColor"/>
        </svg>
      )
    case 'Cooperative':
      return (
        <svg width={s} height={s} viewBox="0 0 32 32" fill="none" aria-hidden="true">
          <circle cx="11" cy="10" r="5" fill="currentColor" opacity=".8"/>
          <circle cx="21" cy="10" r="5" fill="currentColor" opacity=".8"/>
          <path d="M4 26c0-4.4 3.1-7 7-7h10c3.9 0 7 2.6 7 7" fill="currentColor" opacity=".6"/>
          <path d="M13 14c1-2 5-2 6 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      )
    case 'Card Game':
      return (
        <svg width={s} height={s} viewBox="0 0 32 32" fill="none" aria-hidden="true">
          <rect x="4" y="6" width="16" height="22" rx="2" fill="currentColor" opacity=".4" transform="rotate(-8 12 17)"/>
          <rect x="8" y="4" width="16" height="22" rx="2" fill="currentColor" opacity=".7" transform="rotate(4 16 15)"/>
          <rect x="10" y="6" width="16" height="22" rx="2" fill="currentColor"/>
        </svg>
      )
    case 'Classic':
      return (
        <svg width={s} height={s} viewBox="0 0 32 32" fill="none" aria-hidden="true">
          <rect x="3" y="3" width="26" height="26" rx="4" fill="currentColor" opacity=".2" stroke="currentColor" strokeWidth="2"/>
          <circle cx="9" cy="9" r="2.5" fill="currentColor"/>
          <circle cx="23" cy="9" r="2.5" fill="currentColor"/>
          <circle cx="9" cy="23" r="2.5" fill="currentColor"/>
          <circle cx="23" cy="23" r="2.5" fill="currentColor"/>
          <circle cx="16" cy="16" r="2.5" fill="currentColor" opacity=".7"/>
        </svg>
      )
    case 'Dexterity':
      return (
        <svg width={s} height={s} viewBox="0 0 32 32" fill="none" aria-hidden="true">
          <path d="M10 28 L10 12 Q10 10 12 10 Q14 10 14 12 L14 20" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
          <path d="M14 16 Q14 14 16 14 Q18 14 18 16 L18 20" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
          <path d="M18 18 Q18 15 20 15 Q22 15 22 18 L22 22" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
          <path d="M10 14 Q7 10 7 7 Q7 4 10 4 Q12 4 12 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none"/>
        </svg>
      )
    case 'Social':
      return (
        <svg width={s} height={s} viewBox="0 0 32 32" fill="none" aria-hidden="true">
          <circle cx="16" cy="10" r="5" fill="currentColor"/>
          <circle cx="6" cy="14" r="4" fill="currentColor" opacity=".7"/>
          <circle cx="26" cy="14" r="4" fill="currentColor" opacity=".7"/>
          <path d="M8 28c0-4 3-6 8-6s8 2 8 6" fill="currentColor" opacity=".9"/>
          <path d="M1 26c0-3.5 2-5 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" opacity=".5"/>
          <path d="M31 26c0-3.5-2-5-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" opacity=".5"/>
        </svg>
      )
    default:
      return (
        <svg width={s} height={s} viewBox="0 0 32 32" fill="none" aria-hidden="true">
          <rect x="3" y="3" width="12" height="12" rx="2" fill="currentColor" opacity=".7"/>
          <rect x="17" y="3" width="12" height="12" rx="2" fill="currentColor" opacity=".9"/>
          <rect x="3" y="17" width="12" height="12" rx="2" fill="currentColor" opacity=".9"/>
          <rect x="17" y="17" width="12" height="12" rx="2" fill="currentColor" opacity=".7"/>
        </svg>
      )
  }
}

const RENT_DURATIONS = [
  { id: '1h',  label: '1 Jam',   hours: 1,    price: 10000 },
  { id: '2h',  label: '2 Jam',   hours: 2,    price: 20000 },
  { id: '3h',  label: '3 Jam',   hours: 3,    price: 30000 },
  { id: 'all', label: 'All Day', hours: null,  price: 30000 },
]

function RentalModal({ game, onClose }) {
  const [duration, setDuration] = useState(RENT_DURATIONS[0])
  const [players,  setPlayers]  = useState(1)
  const [name,     setName]     = useState('')
  const [table,    setTable]    = useState('')
  const [step,     setStep]     = useState(1)
  const [nameErr,  setNameErr]  = useState('')

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  const totalPrice = duration.price * players

  const handleNext = () => {
    if (!name.trim()) { setNameErr('Nama wajib diisi'); return }
    setNameErr('')
    setStep(2)
  }

  const buildWaMessage = () => {
    const durLabel = duration.id === 'all'
      ? 'All Day (Seharian)'
      : `${duration.label} (${duration.hours} jam)`
    const lines = [
      `🎲 *SEWA BOARDGAME - LOKA CAFE*`,
      ``,
      `📋 *Detail Sewa:*`,
      `• Game    : ${game.name}`,
      `• Durasi  : ${durLabel}`,
      `• Pemain  : ${players} orang`,
      `• Nama    : ${name}`,
      `• Meja    : ${table || '-'}`,
      ``,
      `💰 *Total   : Rp ${totalPrice.toLocaleString('id-ID')}*`,
      ``,
      `Mohon konfirmasi ketersediaan game ini. Terima kasih! 🙏`,
    ]
    return encodeURIComponent(lines.join('\n'))
  }

  const handleConfirm = () => {
    window.open(`https://wa.me/${ADMIN_WA}?text=${buildWaMessage()}`, '_blank', 'noopener,noreferrer')
    onClose()
  }

  return (
    <div className="rental-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="rental-modal glass-card" role="dialog" aria-modal="true">
        <div className="rental-modal__header">
          <div className="rental-modal__title-group">
            <div className="rental-modal__icon">
              <CategoryIcon category={game.category} size={24} />
            </div>
            <div>
              <h3 className="rental-modal__game">{game.name}</h3>
              <span className="rental-modal__cat">{game.category} · <span style={{color: DIFFICULTY_COLOR[game.difficulty]}}>{game.difficulty}</span></span>
            </div>
          </div>
          <button className="rental-modal__close" onClick={onClose} aria-label="Tutup"><X size={20}/></button>
        </div>

        {step === 1 ? (
          <>
            <div className="rental-modal__body">
              <div className="rental-field">
                <label className="rental-label"><Clock size={13}/> Durasi Sewa</label>
                <div className="rental-duration-grid">
                  {RENT_DURATIONS.map(d => (
                    <button key={d.id} className={`rental-duration-btn ${duration.id === d.id ? 'active' : ''}`} onClick={() => setDuration(d)}>
                      <span className="rental-duration-label">{d.label}</span>
                      <span className="rental-duration-price">Rp {d.price.toLocaleString('id-ID')}/org</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="rental-field">
                <label className="rental-label"><Users size={13}/> Jumlah Pemain</label>
                <div className="rental-players">
                  <button className="rental-players__btn" onClick={() => setPlayers(p => Math.max(1, p-1))} disabled={players<=1}>−</button>
                  <span className="rental-players__count">{players}</span>
                  <button className="rental-players__btn" onClick={() => setPlayers(p => Math.min(20, p+1))} disabled={players>=20}>+</button>
                  <span className="rental-players__hint">orang</span>
                </div>
              </div>

              <div className="rental-field">
                <label className="rental-label" htmlFor="rent-name">Nama Pemesan *</label>
                <input id="rent-name" className={`form-input rental-input ${nameErr ? 'form-input--error' : ''}`}
                  placeholder="Contoh: Budi" value={name} onChange={e => { setName(e.target.value); setNameErr('') }}/>
                {nameErr && <span className="form-error">{nameErr}</span>}
              </div>

              <div className="rental-field">
                <label className="rental-label" htmlFor="rent-table">Nomor Meja (opsional)</label>
                <input id="rent-table" className="form-input rental-input"
                  placeholder="Contoh: 5" value={table} onChange={e => setTable(e.target.value)}/>
              </div>
            </div>

            <div className="rental-modal__price-bar">
              <div>
                <p className="rental-price-label">Estimasi Total</p>
                <p className="rental-price-amount">Rp {totalPrice.toLocaleString('id-ID')}</p>
              </div>
              <button className="btn btn-primary rental-next-btn" onClick={handleNext}>Lanjutkan →</button>
            </div>
          </>
        ) : (
          <>
            <div className="rental-modal__body rental-confirm">
              <div className="rental-confirm__banner">
                <ShieldCheck size={18}/>
                <span>Pesanan dikirim ke <strong>WhatsApp Admin</strong> Loka</span>
              </div>
              <div className="rental-confirm__rows">
                <div className="rental-confirm__row"><span>Game</span><strong>{game.name}</strong></div>
                <div className="rental-confirm__row"><span>Kategori</span><strong>{game.category}</strong></div>
                <div className="rental-confirm__row"><span>Durasi</span><strong>{duration.label}{duration.hours ? ` (${duration.hours} jam)` : ' (Seharian)'}</strong></div>
                <div className="rental-confirm__row"><span>Pemain</span><strong>{players} orang</strong></div>
                <div className="rental-confirm__row"><span>Nama</span><strong>{name}</strong></div>
                {table && <div className="rental-confirm__row"><span>Meja</span><strong>{table}</strong></div>}
              </div>
              <div className="rental-confirm__total">
                <span>Total Pembayaran</span>
                <span className="rental-confirm__amount">Rp {totalPrice.toLocaleString('id-ID')}</span>
              </div>
              <div className="rental-confirm__note">
                <Star size={12}/>
                <span>Tarif sewa dihitung per orang. Pembayaran di kasir Loka.</span>
              </div>
            </div>
            <div className="rental-modal__actions">
              <button className="btn btn-secondary" onClick={() => setStep(1)}>← Edit</button>
              <button className="btn btn-wa" onClick={handleConfirm}>
                <MessageCircle size={18}/> Kirim ke WhatsApp Admin
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default function Games() {
  const [search,   setSearch]   = useState('')
  const [category, setCategory] = useState('Semua')
  const [rentGame, setRentGame] = useState(null)

  useEffect(() => { window.scrollTo(0, 0) }, [])

  const filtered = BOARDGAMES.filter(g => {
    const matchCat    = category === 'Semua' || g.category === category
    const matchSearch = g.name.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })

  return (
    <div className="games-page">
      <div className="games-header">
        <div className="games-header__bg"/>
        <div className="container games-header__content">
          <span className="section-label"><Zap size={12}/>Koleksi Game</span>
          <h1>Boardgame <span className="gradient-text">Library</span></h1>
          <p>Temukan 200+ judul boardgame dari berbagai genre — strategi, keluarga, pesta, dan banyak lagi!</p>
          <div className="games-rental-ribbon">
            <Package size={15}/>
            <span>Klik kartu game untuk <strong>menyewa</strong> dan konfirmasi langsung via WhatsApp!</span>
          </div>
        </div>
      </div>

      <div className="container games-body">
        <div className="games-search-wrap">
          <Search size={18} className="games-search-icon"/>
          <input id="games-search" className="form-input games-search" placeholder="Cari nama game..."
            value={search} onChange={e => setSearch(e.target.value)}/>
        </div>

        <div className="games-categories">
          {CATEGORIES.map(c => (
            <button key={c} className={`games-cat-btn ${category === c ? 'games-cat-btn--active' : ''}`} onClick={() => setCategory(c)}>{c}</button>
          ))}
        </div>

        <div className="games-info-banner">
          <div className="games-info-item">
            <strong>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{display:'inline',verticalAlign:'middle',marginRight:'5px'}}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              Main Per Jam
            </strong>
            <span>Rp 10.000</span>
          </div>
          <div className="games-info-divider"/>
          <div className="games-info-item">
            <strong>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{display:'inline',verticalAlign:'middle',marginRight:'5px'}}><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
              All Day Play
            </strong>
            <span>Rp 30.000</span>
          </div>
          <div className="games-info-divider"/>
          <div className="games-info-item">
            <strong>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{display:'inline',verticalAlign:'middle',marginRight:'5px'}}><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
              200+ Judul
            </strong>
            <span>Tersedia</span>
          </div>
        </div>

        <div className="games-grid">
          {filtered.map(game => (
            <div key={game.id} className="game-card glass-card game-card--clickable"
              onClick={() => setRentGame(game)} role="button" tabIndex={0}
              aria-label={`Sewa ${game.name}`}
              onKeyDown={e => e.key === 'Enter' && setRentGame(game)}>
              <div className="game-card__icon-wrap">
                <CategoryIcon category={game.category} size={30}/>
              </div>
              <div className="game-card__body">
                <div className="game-card__header-row">
                  <h4 className="game-card__name">{game.name}</h4>
                  <span className="game-card__difficulty" style={{ color: DIFFICULTY_COLOR[game.difficulty] }}>{game.difficulty}</span>
                </div>
                <span className="game-card__category">{game.category}</span>
                <div className="game-card__meta">
                  <span className="game-card__meta-item"><Users size={12}/> {game.players}</span>
                  <span className="game-card__meta-item"><Clock size={12}/> {game.duration}</span>
                </div>
                <div className="game-card__rent-hint"><Package size={11}/><span>Tap untuk sewa</span></div>
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="games-empty">
            <Search size={32} style={{ opacity: 0.4, marginBottom: '8px' }}/>
            <p>Game tidak ditemukan</p>
          </div>
        )}

        <div className="games-more-hint">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{display:'inline',verticalAlign:'middle',marginRight:'8px',opacity:.6}}><rect x="2" y="3" width="20" height="18" rx="2"/><path d="M8 10h8M8 14h5"/></svg>
          Masih ada 180+ game lainnya yang tersedia di Loka — datang langsung dan tanyakan ke staff kami!
        </div>
      </div>

      {rentGame && <RentalModal game={rentGame} onClose={() => setRentGame(null)}/>}
    </div>
  )
}
