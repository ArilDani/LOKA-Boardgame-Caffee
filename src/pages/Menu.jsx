import { useEffect, useState } from 'react'
import { useCart } from '../context/CartContext'
import {
  FOOD_ITEMS, DRINK_NON_COFFEE, DRINK_COFFEE, PLAY_PACKAGES, formatPrice
} from '../data/menuData'
import { ShoppingCart, Search, Filter } from 'lucide-react'
import './Menu.css'

const TABS = [
  { id: 'all',       label: '🍽️ Semua' },
  { id: 'food',      label: '🍜 Makanan' },
  { id: 'non-coffee',label: '🥤 Non-Coffee' },
  { id: 'coffee',    label: '☕ Coffee & Signature' },
  { id: 'play',      label: '🎲 Paket Main' },
]

const ALL = [
  ...FOOD_ITEMS,
  ...DRINK_NON_COFFEE,
  ...DRINK_COFFEE,
  ...PLAY_PACKAGES,
]

function ItemCard({ item }) {
  const { addItem } = useCart()
  const [added, setAdded] = useState(false)

  const handleAdd = () => {
    addItem(item)
    setAdded(true)
    setTimeout(() => setAdded(false), 1200)
  }

  return (
    <div className="item-card glass-card">
      <div className="item-card__emoji-wrap">
        <div className="item-card__emoji">{item.emoji || '🍽️'}</div>
        {item.tag && <span className="item-card__tag">{item.tag}</span>}
      </div>
      <div className="item-card__body">
        <h4 className="item-card__name">{item.name}</h4>
        <p className="item-card__desc">{item.description}</p>
        <div className="item-card__footer">
          <div>
            <span className="item-card__price">{formatPrice(item.price)}</span>
            {item.unit && <span className="item-card__unit"> {item.unit}</span>}
          </div>
          <button
            className={`btn btn-sm ${added ? 'btn-accent' : 'btn-primary'}`}
            onClick={handleAdd}
            id={`add-${item.id}`}
          >
            <ShoppingCart size={14} />
            {added ? 'Ditambah!' : 'Pesan'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function Menu() {
  const [activeTab, setActiveTab] = useState('all')
  const [search, setSearch]       = useState('')

  useEffect(() => { window.scrollTo(0, 0) }, [])

  const filtered = ALL.filter(item => {
    const matchTab    = activeTab === 'all' || item.category === activeTab
    const matchSearch = item.name.toLowerCase().includes(search.toLowerCase())
    return matchTab && matchSearch
  })

  return (
    <div className="menu-page">
      {/* Header */}
      <div className="menu-page__header">
        <div className="menu-page__header-bg" />
        <div className="container menu-page__header-content">
          <span className="section-label"><Filter size={12} />Katalog Lengkap</span>
          <h1>Menu <span className="gradient-text">Loka Cafe</span></h1>
          <p>Pilih dari berbagai macam makanan, minuman, dan paket main favoritmu!</p>
        </div>
      </div>

      <div className="container menu-page__body">
        {/* Search */}
        <div className="menu-search-wrap">
          <Search size={18} className="menu-search-icon" />
          <input
            id="menu-search"
            className="form-input menu-search"
            type="text"
            placeholder="Cari menu..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {/* Tabs */}
        <div className="menu-tabs" role="tablist">
          {TABS.map(t => (
            <button
              key={t.id}
              role="tab"
              aria-selected={activeTab === t.id}
              className={`menu-tab ${activeTab === t.id ? 'menu-tab--active' : ''}`}
              onClick={() => setActiveTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Grid */}
        {filtered.length === 0 ? (
          <div className="menu-empty">
            <p>🔍 Tidak ada menu yang cocok.</p>
          </div>
        ) : (
          <div className="menu-grid">
            {filtered.map(item => <ItemCard key={item.id} item={item} />)}
          </div>
        )}
      </div>
    </div>
  )
}
