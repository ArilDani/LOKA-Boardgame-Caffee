/* ============================================================
   RATING SECTION COMPONENT
   Rating bintang per produk, tampilan "Best Rating Bulan Ini"
   ============================================================ */
import { useState, useEffect } from "react";
import { Star, MessageSquarePlus, Loader2, Trophy } from "lucide-react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import "./RatingSection.css";

// ── Star display component
function Stars({ value, size = 16, interactive = false, onChange }) {
  const [hover, setHover] = useState(0);
  const display = hover || value;
  return (
    <div className="stars" role={interactive ? "group" : undefined}>
      {[1, 2, 3, 4, 5].map(i => (
        <button
          key={i}
          className={`star-btn ${!interactive ? "star-display" : ""}`}
          style={{ fontSize: size, cursor: interactive ? "pointer" : "default", pointerEvents: interactive ? "auto" : "none" }}
          onClick={() => interactive && onChange?.(i)}
          onMouseEnter={() => interactive && setHover(i)}
          onMouseLeave={() => interactive && setHover(0)}
          aria-label={`${i} bintang`}
          type="button"
        >
          {i <= display ? "⭐" : "☆"}
        </button>
      ))}
    </div>
  );
}

// ── Format relative date
function relDate(isoStr) {
  const d = new Date(isoStr);
  const now = new Date();
  const diff = (now - d) / 1000;
  if (diff < 3600) return `${Math.round(diff / 60)} mnt lalu`;
  if (diff < 86400) return `${Math.round(diff / 3600)} jam lalu`;
  if (diff < 2592000) return `${Math.round(diff / 86400)} hari lalu`;
  return d.toLocaleDateString("id-ID");
}

// ── Write Review Form
function ReviewForm({ products, onSuccess }) {
  const { user, profile } = useAuth();
  const [productId, setProductId] = useState("");
  const [rating,    setRating]    = useState(5);
  const [review,    setReview]    = useState("");
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!productId) { setError("Pilih produk dulu"); return; }
    if (!rating)    { setError("Pilih rating bintang"); return; }
    setLoading(true); setError("");
    try {
      const { error: err } = await supabase.from("ratings").upsert(
        { user_id: user.id, product_id: productId, rating, review },
        { onConflict: "user_id,product_id" }
      );
      if (err) throw err;
      setProductId(""); setRating(5); setReview("");
      onSuccess?.();
    } catch (err) {
      setError(err.message || "Gagal menyimpan rating");
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="rating-form-wrap" style={{ textAlign: "center" }}>
        <MessageSquarePlus size={24} color="var(--clr-primary)" style={{ opacity: 0.6, margin: "0 auto 0.5rem" }} />
        <p style={{ fontSize: "0.85rem" }}>
          <a href="/login" style={{ color: "var(--clr-primary)" }}>Login</a> untuk memberikan rating & review
        </p>
      </div>
    );
  }

  return (
    <form className="rating-form-wrap" onSubmit={handleSubmit}>
      <h4 style={{ color: "var(--clr-text)", fontSize: "0.95rem" }}>✍️ Tulis Review</h4>

      <div className="form-group">
        <label className="form-label" style={{ fontSize: "0.8rem" }}>Produk</label>
        <select
          className="form-input"
          value={productId}
          onChange={e => setProductId(e.target.value)}
          style={{ fontSize: "0.85rem" }}
        >
          <option value="">— Pilih produk —</option>
          {products.filter(p => p.category !== "play").map(p => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label className="form-label" style={{ fontSize: "0.8rem" }}>Rating</label>
        <Stars value={rating} size={24} interactive onChange={setRating} />
      </div>

      <div className="form-group">
        <label className="form-label" style={{ fontSize: "0.8rem" }}>Review (opsional)</label>
        <textarea
          className="form-input"
          rows={2}
          placeholder="Bagaimana menurutmu?"
          value={review}
          onChange={e => setReview(e.target.value)}
          style={{ resize: "vertical", fontSize: "0.85rem" }}
        />
      </div>

      {error && <p style={{ color: "#ef4444", fontSize: "0.8rem" }}>{error}</p>}

      <button type="submit" className="btn btn-primary btn-sm" disabled={loading} style={{ alignSelf: "flex-start" }}>
        {loading ? <Loader2 size={14} className="animate-spin" /> : <Star size={14} />}
        Kirim Review
      </button>
    </form>
  );
}

// ── Main Component
export default function RatingSection({ showForm = false }) {
  const [topRatings, setTopRatings] = useState([]);
  const [topProduct, setTopProduct] = useState(null);
  const [products,   setProducts]   = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [refresh,    setRefresh]    = useState(0);

  useEffect(() => {
    loadData();
  }, [refresh]);

  async function loadData() {
    setLoading(true);
    try {
      // Get products
      const { data: prods } = await supabase.from("products").select("id,name,image_url,category").order("name");
      setProducts(prods || []);

      // Get ratings this month
      const monthStart = new Date();
      monthStart.setDate(1); monthStart.setHours(0, 0, 0, 0);

      const { data: ratingRows } = await supabase
        .from("ratings")
        .select(`
          id, rating, review, created_at,
          product_id,
          profiles (name),
          products (id, name, image_url, category)
        `)
        .gte("created_at", monthStart.toISOString())
        .order("created_at", { ascending: false })
        .limit(12);

      if (ratingRows?.length) {
        setTopRatings(ratingRows);

        // Find best product this month
        const productScores = {};
        ratingRows.forEach(r => {
          if (!productScores[r.product_id]) {
            productScores[r.product_id] = { sum: 0, count: 0, product: r.products };
          }
          productScores[r.product_id].sum += r.rating;
          productScores[r.product_id].count += 1;
        });
        const best = Object.values(productScores)
          .map(s => ({ ...s, avg: s.sum / s.count }))
          .sort((a, b) => b.avg - a.avg)[0];
        setTopProduct(best || null);
      } else {
        // Dummy Fallback if < 100 transactions/no ratings
        const dummyRatings = [
          { id: 'd1', rating: 5, review: 'Seru banget main Splendor di sini, makanannya juga enak!', created_at: new Date().toISOString(), profiles: { name: 'Aril Dani' }, products: { name: 'Splendor' } },
          { id: 'd2', rating: 5, review: 'Baksonya mantap, tempatnya cozy buat nongkrong lama.', created_at: new Date(Date.now() - 86400000).toISOString(), profiles: { name: 'Budi' }, products: { name: 'Bakso Ala Loka' } },
          { id: 'd3', rating: 4, review: 'Kopinya pas, koleksi gamenya super lengkap!', created_at: new Date(Date.now() - 86400000*2).toISOString(), profiles: { name: 'Citra' }, products: { name: 'Lokachino' } },
        ];
        setTopRatings(dummyRatings);
        setTopProduct({
          avg: 4.8,
          count: 42,
          product: { name: 'Bakso Ala Loka', image_url: '/img/Bakso ala loka.jpg' }
        });
      }
    } finally {
      setLoading(false);
    }
  }

  const monthName = new Date().toLocaleDateString("id-ID", { month: "long", year: "numeric" });

  return (
    <>
      {/* Top product this month */}
      {topProduct && (
        <div className="rating-top-product reveal">
          {topProduct.product?.image_url ? (
            <img src={topProduct.product.image_url} alt={topProduct.product.name} className="rating-top-img" />
          ) : (
            <div className="rating-top-placeholder">🍽️</div>
          )}
          <div className="rating-top-info">
            <p className="rating-top-label">🏆 Best Rating {monthName}</p>
            <h3 className="rating-top-name">{topProduct.product?.name}</h3>
            <div className="rating-top-avg">
              <span className="rating-avg-num">{topProduct.avg.toFixed(1)}</span>
              <Stars value={Math.round(topProduct.avg)} size={16} />
              <span style={{ fontSize: "0.78rem" }}>({topProduct.count} ulasan)</span>
            </div>
          </div>
        </div>
      )}

      {/* Write review form */}
      {showForm && (
        <div className="reveal" style={{ marginBottom: "1.5rem" }}>
          <ReviewForm products={products} onSuccess={() => setRefresh(r => r + 1)} />
        </div>
      )}

      {/* Reviews grid */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "2rem", color: "var(--clr-text-muted)" }}>
          <Loader2 size={24} className="animate-spin" style={{ margin: "0 auto" }} />
        </div>
      ) : topRatings.length === 0 ? (
        <div className="rating-empty">
          <Star size={32} color="var(--clr-primary)" style={{ opacity: 0.4, margin: "0 auto 0.75rem" }} />
          <p>Belum ada rating bulan ini. Jadilah yang pertama review!</p>
        </div>
      ) : (
        <div className="rating-grid">
          {topRatings.slice(0, 6).map((r, i) => (
            <div key={r.id} className={`rating-card glass-card reveal delay-${(i % 3) + 1}`}>
              <div className="rating-card__header">
                <span className="rating-card__product">
                  {r.products?.name || "—"}
                </span>
                <Stars value={r.rating} size={13} />
              </div>
              {r.review && <p className="rating-card__review">"{r.review}"</p>}
              <div className="rating-card__footer">
                <div className="rating-card__avatar">
                  {(r.profiles?.name || "U")[0].toUpperCase()}
                </div>
                <span className="rating-card__user">{r.profiles?.name || "User"}</span>
                <span className="rating-card__date">{relDate(r.created_at)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
