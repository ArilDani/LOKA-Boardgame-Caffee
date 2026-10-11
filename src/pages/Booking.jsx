import { useState, useEffect } from 'react'
import { CalendarDays, Users, Clock, Dice6, CheckCircle2, ShoppingBag } from 'lucide-react'
import { BOARDGAMES } from '../data/menuData'
import { useCart } from '../context/CartContext'
import { supabase } from '../lib/supabase'
import './Booking.css'

const TIME_SLOTS = ['10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00']
const DURATIONS  = ['1 Jam', '2 Jam', '3 Jam', '4 Jam', 'All Day']

function genBookingId() {
  return 'BKG-' + Math.random().toString(36).slice(2, 8).toUpperCase()
}

export default function Booking() {
  const { addItem, openCart } = useCart()
  const [step, setStep]   = useState(1)
  const [bookingId]       = useState(genBookingId)
  const [form, setForm]   = useState({
    name: '', phone: '', date: '', time: '', duration: '2 Jam',
    guests: 2, games: [], notes: ''
  })
  const [errors, setErrors] = useState({})
  const [waNumber, setWaNumber] = useState('6281234567890') // default, will be overridden

  useEffect(() => {
    supabase.from('settings').select('value').eq('key', 'whatsapp_number').single()
      .then(({ data }) => {
        if (data?.value) setWaNumber(data.value)
      })
  }, [])

  const handleChange = e => {
    const { name, value } = e.target
    setForm(f => ({ ...f, [name]: value }))
    setErrors(er => ({ ...er, [name]: '' }))
  }

  const toggleGame = id => {
    setForm(f => ({
      ...f,
      games: f.games.includes(id)
        ? f.games.filter(g => g !== id)
        : f.games.length < 3 ? [...f.games, id] : f.games
    }))
  }

  const validate = () => {
    const errs = {}
    if (!form.name.trim())  errs.name  = 'Nama wajib diisi'
    if (!form.phone.trim()) errs.phone = 'No. WhatsApp wajib diisi'
    if (!form.date)         errs.date  = 'Tanggal wajib dipilih'
    if (!form.time)         errs.time  = 'Waktu wajib dipilih'
    return errs
  }

  const handleSubmit = e => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    
    const selectedGamesText = form.games.length > 0 
      ? ` + Game: ${BOARDGAMES.filter(g => form.games.includes(g.id)).map(g => g.name).join(', ')}` 
      : ''

    const item = {
      id: `booking-${Date.now()}`,
      name: `Booking: ${form.date} pkl ${form.time} (${form.guests} Org)${selectedGamesText}`,
      price: 0,
      qty: 1,
      icon: 'Clock',
    }
    
    addItem(item)
    // Optional: Reset form after adding
    setForm({ name: '', phone: '', date: '', time: '', duration: '2 Jam', guests: 2, games: [], notes: '' })
  }

  const selectedGames = BOARDGAMES.filter(g => form.games.includes(g.id))
  const today = new Date().toISOString().split('T')[0]

  const askAdminWa = () => {
    const text = encodeURIComponent(`Halo Admin Loka, saya ingin bertanya tentang ketersediaan meja untuk booking:\n\nTanggal: ${form.date || '-'}\nJam: ${form.time || '-'}\nJumlah Orang: ${form.guests}\n\nApakah masih tersedia?`)
    window.open(`https://wa.me/${waNumber}?text=${text}`, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="booking-page">
      {/* Header */}
      <div className="booking-header">
        <div className="booking-header__bg" />
        <div className="container booking-header__content">
          <span className="section-label"><CalendarDays size={12} />Reservasi</span>
          <h1>Booking <span className="gradient-text">Meja &amp; Game</span></h1>
          <p>Reservasi meja dan pilih boardgame favoritmu agar sudah siap saat kamu tiba!</p>
        </div>
      </div>

      <div className="container booking-body">
        {step === 1 && (
          <div className="booking-layout">
            {/* Form */}
            <form className="booking-form glass-card" onSubmit={handleSubmit} noValidate>
              <h3>Detail Reservasi</h3>

              {/* Name */}
              <div className="form-group">
                <label className="form-label" htmlFor="bk-name">Nama Lengkap *</label>
                <input id="bk-name" name="name" className={`form-input ${errors.name ? 'bk-input-error' : ''}`}
                  placeholder="Nama Anda" value={form.name} onChange={handleChange} />
                {errors.name && <span className="bk-error">{errors.name}</span>}
              </div>

              {/* Phone */}
              <div className="form-group">
                <label className="form-label" htmlFor="bk-phone">No. WhatsApp *</label>
                <input id="bk-phone" name="phone" type="tel" className={`form-input ${errors.phone ? 'bk-input-error' : ''}`}
                  placeholder="08xxxxxxxxxx" value={form.phone} onChange={handleChange} />
                {errors.phone && <span className="bk-error">{errors.phone}</span>}
              </div>

              <div className="booking-form-row">
                {/* Date */}
                <div className="form-group">
                  <label className="form-label" htmlFor="bk-date">Tanggal *</label>
                  <input id="bk-date" name="date" type="date" className={`form-input ${errors.date ? 'bk-input-error' : ''}`}
                    min={today} value={form.date} onChange={handleChange} />
                  {errors.date && <span className="bk-error">{errors.date}</span>}
                </div>

                {/* Guests */}
                <div className="form-group">
                  <label className="form-label" htmlFor="bk-guests">Jumlah Orang</label>
                  <input id="bk-guests" name="guests" type="number" className="form-input"
                    min={1} max={20} value={form.guests} onChange={handleChange} />
                </div>
              </div>

              {/* Time slots */}
              <div className="form-group">
                <label className="form-label">Jam Kedatangan *</label>
                <div className="time-slots">
                  {TIME_SLOTS.map(t => (
                    <button key={t} type="button"
                      className={`time-slot ${form.time === t ? 'time-slot--active' : ''}`}
                      onClick={() => { setForm(f => ({ ...f, time: t })); setErrors(er => ({ ...er, time: '' })) }}
                    >
                      {t}
                    </button>
                  ))}
                </div>
                {errors.time && <span className="bk-error">{errors.time}</span>}
              </div>

              {/* Duration */}
              <div className="form-group">
                <label className="form-label">Durasi Bermain</label>
                <div className="duration-btns">
                  {DURATIONS.map(d => (
                    <button key={d} type="button"
                      className={`duration-btn ${form.duration === d ? 'duration-btn--active' : ''}`}
                      onClick={() => setForm(f => ({ ...f, duration: d }))}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div className="form-group">
                <label className="form-label" htmlFor="bk-notes">Catatan Tambahan</label>
                <textarea id="bk-notes" name="notes" className="form-input" rows={3}
                  placeholder="Contoh: ada anak kecil, butuh kursi tambahan, sewa khusus..."
                  value={form.notes} onChange={handleChange} />
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <button id="booking-submit-btn" type="submit" className="btn btn-primary btn-lg" style={{ flex: 1 }}>
                  <ShoppingBag size={18} /> Tambahkan ke Keranjang
                </button>
                <button type="button" className="btn btn-secondary btn-lg" onClick={askAdminWa} style={{ padding: '0 1.5rem' }}>
                  Tanya Admin (WA)
                </button>
              </div>
            </form>

            {/* Game selection sidebar */}
            <aside className="booking-games">
              <div className="booking-games__header glass-card">
                <h3><Dice6 size={18} /> Pilih Game (maks. 3)</h3>
                <p>Pilih boardgame yang ingin disiapkan untuk kamu. Bisa ganti saat di tempat!</p>
                <div className="booking-games__selected-count">
                  {form.games.length}/3 game dipilih
                </div>
              </div>
              <div className="booking-games__list">
                {BOARDGAMES.map(g => {
                  const sel = form.games.includes(g.id)
                  return (
                    <button
                      key={g.id}
                      type="button"
                      className={`booking-game-item ${sel ? 'booking-game-item--selected' : ''}`}
                      onClick={() => toggleGame(g.id)}
                      disabled={!sel && form.games.length >= 3}
                    >
                      <span className="booking-game-icon">
                        {g.category === 'Strategy' ? '♟️' : g.category === 'Party' ? '🎉' :
                         g.category === 'Family'   ? '👨‍👩‍👧' : g.category === 'Cooperative' ? '🤝' :
                         g.category === 'Card Game'? '🃏' : g.category === 'Social' ? '👥' : '🎲'}
                      </span>
                      <div className="booking-game-info">
                        <p className="booking-game-name">{g.name}</p>
                        <p className="booking-game-meta">{g.players} · {g.duration}</p>
                      </div>
                      {sel && <CheckCircle2 size={18} color="var(--clr-primary)" />}
                    </button>
                  )
                })}
              </div>
            </aside>
          </div>
        )}
      </div>
    </div>
  )
}
