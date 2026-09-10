import { useEffect, useState } from 'react'
import { useCart } from '../context/CartContext'
import {
  FOOD_ITEMS, DRINK_NON_COFFEE, DRINK_COFFEE, PLAY_PACKAGES, formatPrice
} from '../data/menuData'
import { ShoppingCart, Search, Filter, Utensils, Coffee, CupSoda, Dices, Clock } from 'lucide-react'
import './Menu.css'

const TABS = [
  { id: 'all',       label: 'Semua', icon: <Utensils size={16} /> },
  { id: 'food',      label: 'Makanan', icon: <Utensils size={16} /> },
  { id: 'non-coffee',label: 'Non-Coffee', icon: <CupSoda size={16} /> },
  { id: 'coffee',    label: 'Coffee & Signature', icon: <Coffee size={16} /> },
  { id: 'play',      label: 'Paket Main', icon: <Dices size={16} /> },
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

  const renderVisual = () => {
    if (item.image) {
      return <img src={item.image} alt={item.name} className="item-card__image" />
    }
    if (item.icon === 'Clock') return <Clock size={48} className="item-card__icon" />
    if (item.icon === 'Dices') return <Dices size={48} className="item-card__icon" />
    return <Utensils size={48} className="item-card__icon" />
  }

  return (
    <div className="item-card glass-card">
      <div className="item-card__visual-wrap">
        {renderVisual()}
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
              {t.icon} <span>{t.label}</span>
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
