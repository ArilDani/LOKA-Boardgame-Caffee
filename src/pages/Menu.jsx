import { useEffect, useState, useCallback } from 'react'
import { useCart } from '../context/CartContext'
import { formatPrice } from '../data/menuData'
import { supabase } from '../lib/supabase'
import { ShoppingCart, Search, Filter, Utensils, Coffee, CupSoda, Dices, Clock, Loader2 } from 'lucide-react'
import './Menu.css'

const TABS = [
  { id: 'all',       label: 'Semua', icon: <Utensils size={16} /> },
  { id: 'food',      label: 'Makanan', icon: <Utensils size={16} /> },
  { id: 'non-coffee',label: 'Non-Coffee', icon: <CupSoda size={16} /> },
  { id: 'coffee',    label: 'Coffee & Signature', icon: <Coffee size={16} /> },
  { id: 'play',      label: 'Paket Main', icon: <Dices size={16} /> },
]

function ItemCard({ item }) {
  const { addItem } = useCart()
  const [added, setAdded] = useState(false)

  const handleAdd = () => {
    // Make sure we pass image_url as image for CartContext consistency
    addItem({ ...item, image: item.image_url })
    setAdded(true)
    setTimeout(() => setAdded(false), 1200)
  }

  const renderVisual = () => {
    if (item.image_url) {
      return <img src={item.image_url} alt={item.name} className="item-card__image" />
    }
    if (item.category === 'play') return <Dices size={48} className="item-card__icon" />
    if (item.category === 'coffee') return <Coffee size={48} className="item-card__icon" />
    if (item.category === 'non-coffee') return <CupSoda size={48} className="item-card__icon" />
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
  const [products, setProducts]   = useState([])
  const [loading, setLoading]     = useState(true)

  const loadProducts = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase
      .from('products')
      .select('*')
      .eq('is_available', true)
      .order('category')
      .order('name')
    setProducts(data || [])
    setLoading(false)
  }, [])

  useEffect(() => {
    window.scrollTo(0, 0)
    loadProducts()
  }, [loadProducts])

  const filtered = products.filter(item => {
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
        {loading ? (
          <div className="menu-empty" style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', justifyContent: 'center' }}>
            <Loader2 size={24} className="spin-icon" style={{ animation: 'spin 1s linear infinite' }} /> Memuat menu...
          </div>
        ) : filtered.length === 0 ? (
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
