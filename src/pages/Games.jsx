import { useEffect, useState } from 'react'
import { BOARDGAMES } from '../data/menuData'
import { Search, Users, Clock, Zap } from 'lucide-react'
import './Games.css'

const CATEGORIES = ['Semua', 'Strategy', 'Family', 'Party', 'Cooperative', 'Card Game', 'Classic', 'Dexterity', 'Social']
const DIFFICULTY_COLOR = { Easy: '#52b788', Medium: '#c8963e', Hard: '#f87171' }

export default function Games() {
  const [search,   setSearch]   = useState('')
  const [category, setCategory] = useState('Semua')

  useEffect(() => { window.scrollTo(0, 0) }, [])

  const filtered = BOARDGAMES.filter(g => {
    const matchCat    = category === 'Semua' || g.category === category
    const matchSearch = g.name.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })

  return (
    <div className="games-page">
      {/* Header */}
      <div className="games-header">
        <div className="games-header__bg" />
        <div className="container games-header__content">
          <span className="section-label"><Zap size={12} />Koleksi Game</span>
          <h1>Boardgame <span className="gradient-text">Library</span></h1>
          <p>Temukan 200+ judul boardgame dari berbagai genre — strategi, keluarga, pesta, dan banyak lagi!</p>

          {/* Coming soon ribbon */}
          <div className="games-coming-soon">
            <span>🚧</span>
            <span>Halaman ini masih dalam pengembangan — koleksi lengkap akan segera hadir!</span>
          </div>
        </div>
      </div>

      <div className="container games-body">
        {/* Search */}
        <div className="games-search-wrap">
          <Search size={18} className="games-search-icon" />
          <input
            id="games-search"
            className="form-input games-search"
            placeholder="Cari nama game..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {/* Category filter */}
        <div className="games-categories">
          {CATEGORIES.map(c => (
            <button
              key={c}
              className={`games-cat-btn ${category === c ? 'games-cat-btn--active' : ''}`}
              onClick={() => setCategory(c)}
            >
              {c}
            </button>
          ))}
        </div>

        {/* Info Banner */}
        <div className="games-info-banner">
          <div className="games-info-item">
            <strong>⏱️ Main Per Jam</strong><span>Rp 10.000</span>
          </div>
          <div className="games-info-divider" />
          <div className="games-info-item">
            <strong>🎲 All Day Play</strong><span>Rp 30.000</span>
          </div>
          <div className="games-info-divider" />
          <div className="games-info-item">
            <strong>📦 200+ Judul</strong><span>Tersedia</span>
          </div>
        </div>

        {/* Grid */}
        <div className="games-grid">
          {filtered.map(game => (
            <div key={game.id} className="game-card glass-card">
              <div className="game-card__icon">
                {game.category === 'Strategy'    ? '♟️' :
                 game.category === 'Party'       ? '🎉' :
                 game.category === 'Family'      ? '👨‍👩‍👧' :
                 game.category === 'Cooperative' ? '🤝' :
                 game.category === 'Card Game'   ? '🃏' :
                 game.category === 'Dexterity'   ? '🖐️' :
                 game.category === 'Social'      ? '👥' : '🎲'}
              </div>
              <div className="game-card__body">
                <div className="game-card__header-row">
                  <h4 className="game-card__name">{game.name}</h4>
                  <span
                    className="game-card__difficulty"
                    style={{ color: DIFFICULTY_COLOR[game.difficulty] }}
                  >
                    {game.difficulty}
                  </span>
                </div>
                <span className="game-card__category">{game.category}</span>
                <div className="game-card__meta">
                  <span className="game-card__meta-item">
                    <Users size={12} /> {game.players}
                  </span>
                  <span className="game-card__meta-item">
                    <Clock size={12} /> {game.duration}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="games-empty">🔍 Game tidak ditemukan</div>
        )}

        {/* More games hint */}
        <div className="games-more-hint">
          <p>🎲 Masih ada 180+ game lainnya yang tersedia di Loka — datang langsung dan tanyakan ke staff kami!</p>
        </div>
      </div>
    </div>
  )
}
