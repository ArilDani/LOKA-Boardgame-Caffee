import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { formatPrice } from '../data/menuData'
import { CheckCircle2, ChevronRight, CreditCard, Banknote, QrCode, ArrowLeft } from 'lucide-react'
import './Checkout.css'

const PAYMENT_METHODS = [
  { id: 'cash',     label: 'Bayar di Kasir', icon: <Banknote size={20} />, desc: 'Bayar tunai langsung di meja kasir' },
  { id: 'transfer', label: 'Transfer Bank',   icon: <CreditCard size={20} />, desc: 'BCA / Mandiri / BNI / BRI' },
  { id: 'qris',     label: 'QRIS',            icon: <QrCode size={20} />, desc: 'Scan QR dengan semua e-wallet' },
]

function genOrderId() {
  return 'LKA-' + Math.floor(Date.now() / 1000).toString().slice(-6).toUpperCase()
}

export default function Checkout() {
  const { items, totalPrice, orderNote, clearCart } = useCart()
  const navigate = useNavigate()

  const [step, setStep]     = useState(1) // 1=form, 2=confirm, 3=success
  const [payment, setPayment] = useState('cash')
  const [orderId]             = useState(genOrderId)
  const [form, setForm]       = useState({ name: '', table: '', phone: '', note: orderNote })
  const [errors, setErrors]   = useState({})

  const handleChange = e => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
    setErrors(er => ({ ...er, [e.target.name]: '' }))
  }

  const validate = () => {
    const errs = {}
    if (!form.name.trim())  errs.name  = 'Nama wajib diisi'
    if (!form.table.trim()) errs.table = 'Nomor meja wajib diisi'
    return errs
  }

  const handleSubmit = e => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setStep(2)
  }

  const handleConfirm = () => {
    setStep(3)
    clearCart()
  }

  if (items.length === 0 && step !== 3) {
    return (
      <div className="checkout-empty">
        <div className="container">
          <p style={{ fontSize: '3rem' }}>🛒</p>
          <h2>Keranjang Kosong</h2>
          <p>Tambahkan menu terlebih dahulu sebelum checkout.</p>
          <button className="btn btn-primary" onClick={() => navigate('/menu')}>Lihat Menu</button>
        </div>
      </div>
    )
  }

  return (
    <div className="checkout-page">
      <div className="container checkout-inner">

        {/* ─── STEP INDICATOR ─── */}
        {step < 3 && (
          <div className="checkout-steps">
            {['Detail Pesanan', 'Konfirmasi', 'Selesai'].map((label, i) => (
              <div key={i} className={`checkout-step ${step > i ? 'done' : ''} ${step === i + 1 ? 'active' : ''}`}>
                <div className="checkout-step__dot">{step > i ? <CheckCircle2 size={16} /> : i + 1}</div>
                <span>{label}</span>
              </div>
            ))}
          </div>
        )}

        {/* ─── STEP 1: FORM ─── */}
        {step === 1 && (
          <div className="checkout-layout">
            <div className="checkout-form-section">
              <button className="btn btn-ghost btn-sm checkout-back" onClick={() => navigate(-1)}>
                <ArrowLeft size={16} /> Kembali
              </button>
              <h2>Detail <span className="gradient-text">Pesanan</span></h2>

              <form onSubmit={handleSubmit} className="checkout-form" noValidate>
                <div className="form-group">
                  <label className="form-label" htmlFor="co-name">Nama Pemesan *</label>
                  <input id="co-name" name="name" className={`form-input ${errors.name ? 'form-input--error' : ''}`}
                    placeholder="Contoh: Budi Santoso" value={form.name} onChange={handleChange} />
                  {errors.name && <span className="form-error">{errors.name}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="co-table">Nomor Meja *</label>
                  <input id="co-table" name="table" className={`form-input ${errors.table ? 'form-input--error' : ''}`}
                    placeholder="Contoh: 7 atau VIP-1" value={form.table} onChange={handleChange} />
                  {errors.table && <span className="form-error">{errors.table}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="co-phone">No. WhatsApp (opsional)</label>
                  <input id="co-phone" name="phone" className="form-input" type="tel"
                    placeholder="08xxxxxxxxxx" value={form.phone} onChange={handleChange} />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="co-note">Catatan Khusus</label>
                  <textarea id="co-note" name="note" className="form-input" rows={3}
                    placeholder="Contoh: tidak pakai kecap, extra sambal..." value={form.note} onChange={handleChange} />
                </div>

                {/* Payment method */}
                <div className="form-group">
                  <label className="form-label">Metode Pembayaran</label>
                  <div className="payment-methods">
                    {PAYMENT_METHODS.map(m => (
                      <label key={m.id} className={`payment-method ${payment === m.id ? 'payment-method--active' : ''}`}>
                        <input type="radio" name="payment" value={m.id}
                          checked={payment === m.id} onChange={() => setPayment(m.id)} hidden />
                        <span className="payment-method__icon">{m.icon}</span>
                        <div>
                          <p className="payment-method__label">{m.label}</p>
                          <p className="payment-method__desc">{m.desc}</p>
                        </div>
                        <div className={`payment-method__radio ${payment === m.id ? 'checked' : ''}`} />
                      </label>
                    ))}
                  </div>
                </div>

                <button id="checkout-next-btn" type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }}>
                  Review Pesanan <ChevronRight size={18} />
                </button>
              </form>
            </div>

            {/* Order Summary sidebar */}
            <aside className="checkout-summary glass-card">
              <h4>Ringkasan Pesanan</h4>
              <ul className="checkout-summary__list">
                {items.map(item => (
                  <li key={item.id} className="checkout-summary__item">
                    <span>{item.emoji} {item.name}</span>
                    <span className="checkout-summary__item-detail">
                      x{item.qty} · {formatPrice(item.price * item.qty)}
                    </span>
                  </li>
                ))}
              </ul>
              <div className="checkout-summary__divider" />
              <div className="checkout-summary__total">
                <span>Total</span>
                <span className="checkout-summary__amount">{formatPrice(totalPrice)}</span>
              </div>
            </aside>
          </div>
        )}

        {/* ─── STEP 2: CONFIRM ─── */}
        {step === 2 && (
          <div className="checkout-confirm glass-card">
            <h2>Konfirmasi <span className="gradient-text">Pesanan</span></h2>
            <div className="confirm-info">
              <div className="confirm-row"><span>Nama</span><strong>{form.name}</strong></div>
              <div className="confirm-row"><span>No. Meja</span><strong>{form.table}</strong></div>
              {form.phone && <div className="confirm-row"><span>WhatsApp</span><strong>{form.phone}</strong></div>}
              {form.note  && <div className="confirm-row"><span>Catatan</span><strong>{form.note}</strong></div>}
              <div className="confirm-row"><span>Pembayaran</span>
                <strong>{PAYMENT_METHODS.find(m => m.id === payment)?.label}</strong>
              </div>
            </div>
            <div className="confirm-items">
              {items.map(item => (
                <div key={item.id} className="confirm-item">
                  <span>{item.emoji} {item.name} <em>x{item.qty}</em></span>
                  <span>{formatPrice(item.price * item.qty)}</span>
                </div>
              ))}
            </div>
            <div className="confirm-total">
              <span>Total Pembayaran</span>
              <span className="confirm-total__amount">{formatPrice(totalPrice)}</span>
            </div>
            <div className="confirm-actions">
              <button className="btn btn-secondary" onClick={() => setStep(1)}>
                <ArrowLeft size={16} /> Edit Pesanan
              </button>
              <button id="confirm-order-btn" className="btn btn-primary btn-lg" onClick={handleConfirm}>
                <CheckCircle2 size={18} /> Konfirmasi & Pesan
              </button>
            </div>
          </div>
        )}

        {/* ─── STEP 3: SUCCESS ─── */}
        {step === 3 && (
          <div className="checkout-success">
            <div className="success-icon">✅</div>
            <h2>Pesanan <span className="gradient-text">Diterima!</span></h2>
            <p>Terima kasih, <strong>{form.name}</strong>! Pesananmu sedang diproses oleh tim Loka.</p>
            <div className="success-order-id glass-card">
              <p className="success-order-label">Order ID</p>
              <p className="success-order-number">{orderId}</p>
            </div>
            <div className="success-info glass-card">
              <p>📋 Pesanan dikirim ke <strong>Meja {form.table}</strong></p>
              <p>💳 Pembayaran via <strong>{PAYMENT_METHODS.find(m => m.id === payment)?.label}</strong></p>
              <p>⏱️ Estimasi waktu: <strong>10–15 menit</strong></p>
            </div>
            <div className="success-actions">
              <button className="btn btn-secondary" onClick={() => navigate('/menu')}>Pesan Lagi</button>
              <button className="btn btn-primary" onClick={() => navigate('/')}>Kembali ke Home</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
