import { useEffect, useRef } from 'react'
import { X, Trash2, ShoppingBag, Plus, Minus, Utensils, Clock, Dices } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { formatPrice } from '../data/menuData'
import { useNavigate } from 'react-router-dom'
import './CartDrawer.css'

export default function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQty, totalPrice, orderNote, setNote } = useCart()
  const navigate = useNavigate()
  const overlayRef = useRef(null)

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  const handleCheckout = () => {
    closeCart()
    navigate('/checkout')
  }

  const renderVisual = (item) => {
    if (item.image) {
      return <img src={item.image} alt={item.name} className="cart-item__image" />
    }
    if (item.icon === 'Clock') return <Clock size={24} className="cart-item__icon" />
    if (item.icon === 'Dices') return <Dices size={24} className="cart-item__icon" />
    return <Utensils size={24} className="cart-item__icon" />
  }

  return (
    <>
      {/* Backdrop */}
      <div
        ref={overlayRef}
        className={`cart-overlay ${isOpen ? 'cart-overlay--open' : ''}`}
        onClick={closeCart}
        aria-hidden="true"
      />

      {/* Drawer */}
      <aside className={`cart-drawer ${isOpen ? 'cart-drawer--open' : ''}`} role="dialog" aria-label="Keranjang Pesanan">
        {/* Header */}
        <div className="cart-drawer__header">
          <div className="cart-drawer__title">
            <ShoppingBag size={20} />
            <h3>Keranjang Pesanan</h3>
          </div>
          <button className="btn btn-icon btn-ghost" onClick={closeCart} aria-label="Tutup keranjang">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        {items.length === 0 ? (
          <div className="cart-drawer__empty">
            <div className="cart-drawer__empty-icon"><ShoppingBag size={48} className="cart-empty-icon" /></div>
            <h4>Keranjang kosong</h4>
            <p>Tambahkan menu favorit kamu!</p>
            <button className="btn btn-primary" onClick={closeCart}>Lihat Menu</button>
          </div>
        ) : (
          <div className="cart-drawer__body">
            {/* Items */}
            <ul className="cart-items">
              {items.map(item => (
                <li key={item.id} className="cart-item animate-fade-in">
                  <div className="cart-item__visual">{renderVisual(item)}</div>
                  <div className="cart-item__info">
                    <p className="cart-item__name">{item.name}</p>
                    <p className="cart-item__price">{formatPrice(item.price)}</p>
                  </div>
                  <div className="cart-item__controls">
                    <button
                      className="qty-btn"
                      onClick={() => updateQty(item.id, item.qty - 1)}
                      aria-label="Kurangi"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="qty-value">{item.qty}</span>
                    <button
                      className="qty-btn"
                      onClick={() => updateQty(item.id, item.qty + 1)}
                      aria-label="Tambah"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                  <button
                    className="cart-item__remove"
                    onClick={() => removeItem(item.id)}
                    aria-label="Hapus item"
                  >
                    <Trash2 size={16} />
                  </button>
                </li>
              ))}
            </ul>

            {/* Note */}
            <div className="cart-drawer__note">
              <label className="form-label">Catatan Pesanan</label>
              <textarea
                className="form-input cart-note-input"
                placeholder="Contoh: tidak pakai pedas, tambah es..."
                value={orderNote}
                onChange={e => setNote(e.target.value)}
                rows={3}
              />
            </div>
          </div>
        )}

        {/* Footer */}
        {items.length > 0 && (
          <div className="cart-drawer__footer">
            <div className="cart-drawer__summary">
              <span>Total Pesanan</span>
              <span className="cart-drawer__total">{formatPrice(totalPrice)}</span>
            </div>
            <p className="cart-drawer__note-tax">* Belum termasuk biaya main</p>
            <button
              id="checkout-btn"
              className="btn btn-primary"
              style={{ width: '100%' }}
              onClick={handleCheckout}
            >
              Lanjut ke Pembayaran
            </button>
          </div>
        )}
      </aside>
    </>
  )
}
