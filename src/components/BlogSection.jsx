/* ============================================================
   BLOG SECTION — Artikel dari Blogger RSS Feed
   ============================================================ */

import { useState, useEffect } from "react";
import { BookOpen, ExternalLink, Calendar, ArrowRight, Rss, X } from "lucide-react";
import { supabase } from "../lib/supabase";
import "./BlogSection.css";

// Parse Blogger XML/RSS Feed using rss2json
async function fetchBloggerPosts(blogUrl, maxResults = 6) {
  try {
    const cleanUrl = blogUrl.replace(/\/$/, "");
    const feedUrl = `${cleanUrl}/feeds/posts/default?alt=rss`;
    
    // Use rss2json for robust feed parsing across domains
    const res = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feedUrl)}`);
    if (!res.ok) throw new Error("Feed fetch failed");
    
    const data = await res.json();
    if (data.status !== "ok") throw new Error("Feed parsing failed");
    
    const entries = data.items || [];

    return entries.map((entry) => {
      // rss2json sometimes extracts thumbnail automatically
      let thumbnail = entry.thumbnail || "";
      const content = entry.content || entry.description || "";
      
      // Fallback: extract image from content if no thumbnail
      if (!thumbnail) {
        const imgMatch = content.match(/<img[^>]+src=["']([^"']+)["']/i);
        thumbnail = imgMatch?.[1] || null;
      }

      // Fix blurry thumbnail from Blogger by requesting s1600 (full size)
      if (thumbnail) {
        thumbnail = thumbnail.replace(/\/(s\d+|w\d+-h\d+)(-[a-z0-9-]+)?\//i, "/s1600/");
      }

      // Strip HTML from content for preview
      const plainText = content.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();

      // Remove the first image from fullContent to prevent double image (since we show it as cover)
      const cleanedContent = content.replace(/<a[^>]*>\s*<img[^>]+>\s*<\/a>/i, "").replace(/<img[^>]+>/i, "");

      return {
        id: entry.guid || entry.link,
        title: entry.title || "Untitled",
        published: entry.pubDate || new Date().toISOString(),
        author: entry.author || "Loka Cafe",
        thumbnail,
        preview: plainText.slice(0, 160) + "...",
        fullContent: cleanedContent,
        link: entry.link || blogUrl,
      };
    });
  } catch (err) {
    console.error("Blogger fetch error:", err);
    // Dummy Fallback if fetch fails or blocked
    return [
      {
        id: "d1",
        title: "Keseruan Turnamen Catan di Loka",
        published: new Date().toISOString(),
        author: "Loka Cafe",
        thumbnail: "https://images.unsplash.com/photo-1610890716171-6b1bb98ffaed?q=80&w=600",
        preview: "Akhir pekan kemarin Loka Boardgame Cafe mengadakan turnamen Catan terbesar tahun ini. Lihat keseruannya di sini!",
        fullContent: "",
        link: blogUrl
      },
      {
        id: "d2",
        title: "5 Boardgame Terbaik untuk Pemula",
        published: new Date(Date.now() - 86400000).toISOString(),
        author: "Loka Cafe",
        thumbnail: "https://images.unsplash.com/photo-1632501641765-e568d28b0015?q=80&w=600",
        preview: "Bingung mau main apa saat pertama kali datang? Ini dia 5 rekomendasi game ringan yang cocok buat kamu dan teman-teman.",
        fullContent: "",
        link: blogUrl
      }
    ];
  }
}

function formatDate(isoStr) {
  return new Date(isoStr).toLocaleDateString("id-ID", {
    day: "numeric", month: "long", year: "numeric",
  });
}

// Article reader modal
function ArticleModal({ article, onClose }) {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  return (
    <div className="article-modal-overlay" onClick={onClose}>
      <div className="article-modal glass-card" onClick={e => e.stopPropagation()}>
        <div className="article-modal__header">
          <div>
            <h2 className="article-modal__title">{article.title}</h2>
            <div className="article-modal__meta">
              <Calendar size={14} />
              <span>{formatDate(article.published)}</span>
              <span>·</span>
              <span>{article.author}</span>
            </div>
          </div>
          <div className="article-modal__actions">
            <a href={article.link} target="_blank" rel="noopener noreferrer"
              className="btn btn-ghost btn-sm">
              <ExternalLink size={14} /> Buka Blog
            </a>
            <button className="btn btn-ghost btn-sm btn-icon" onClick={onClose}>
              <X size={16} />
            </button>
          </div>
        </div>
        {article.thumbnail && (
          <img src={article.thumbnail} alt={article.title} className="article-modal__cover" />
        )}
        <div
          className="article-modal__body"
          dangerouslySetInnerHTML={{ __html: article.fullContent }}
        />
      </div>
    </div>
  );
}

export default function BlogSection({ limit = 3 }) {
  const [posts,      setPosts]      = useState([]);
  const [allPosts,   setAllPosts]   = useState([]);
  const [blogUrl,    setBlogUrl]    = useState("https://arutiaa.blogspot.com/");
  const [loading,    setLoading]    = useState(true);
  const [selected,   setSelected]   = useState(null);
  const [showAll,    setShowAll]    = useState(false);
  const [fetchError, setFetchError] = useState(false);

  // Load blogger URL from Supabase settings
  useEffect(() => {
    supabase
      .from("settings")
      .select("value")
      .eq("key", "blogger_url")
      .single()
      .then(({ data }) => {
        if (data?.value) setBlogUrl(data.value);
      });
  }, []);

  // Fetch posts when URL is ready
  useEffect(() => {
    if (!blogUrl) return;
    setLoading(true);
    setFetchError(false);
    // Fetch a larger amount for the "All Articles" modal
    fetchBloggerPosts(blogUrl, 20)
      .then(data => {
        if (data.length === 0) setFetchError(true);
        setAllPosts(data);
        setPosts(data.slice(0, limit));
      })
      .finally(() => setLoading(false));
  }, [blogUrl, limit]);

  if (loading) {
    return (
      <div className="blog-section__skeleton">
        {Array.from({ length: limit }).map((_, i) => (
          <div key={i} className="blog-skeleton-card glass-card">
            <div className="blog-skeleton-img shimmer-box" />
            <div style={{ padding: "1.25rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              <div className="shimmer-box" style={{ height: 14, borderRadius: 6, width: "60%" }} />
              <div className="shimmer-box" style={{ height: 20, borderRadius: 6 }} />
              <div className="shimmer-box" style={{ height: 12, borderRadius: 6, width: "80%" }} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (fetchError || posts.length === 0) {
    return (
      <div className="blog-section__empty">
        <Rss size={40} color="var(--clr-primary)" style={{ opacity: 0.5 }} />
        <p>Artikel belum tersedia. <a href={blogUrl} target="_blank" rel="noopener noreferrer" style={{ color: "var(--clr-primary)" }}>Kunjungi blog kami →</a></p>
      </div>
    );
  }

  return (
    <>
      <div className="blog-grid">
        {posts.map((post, i) => (
          <article key={post.id} className={`blog-card glass-card reveal delay-${i + 1}`}>
            {post.thumbnail ? (
              <div className="blog-card__img-wrap">
                <img src={post.thumbnail} alt={post.title} className="blog-card__img" />
              </div>
            ) : (
              <div className="blog-card__img-placeholder">
                <BookOpen size={32} color="var(--clr-primary)" />
              </div>
            )}
            <div className="blog-card__body">
              <div className="blog-card__meta">
                <Calendar size={12} />
                <span>{formatDate(post.published)}</span>
              </div>
              <h4 className="blog-card__title">{post.title}</h4>
              <p className="blog-card__preview">{post.preview}</p>
              <div className="blog-card__footer">
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => setSelected(post)}
                >
                  Baca Selengkapnya <ArrowRight size={14} />
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>

      <div className="home-menu__cta reveal" style={{ marginTop: "2rem" }}>
        <button className="btn btn-secondary btn-lg" onClick={() => setShowAll(true)}>
          Baca Semua Artikel <ArrowRight size={18} />
        </button>
      </div>

      {/* Article Reader Modal */}
      {selected && <ArticleModal article={selected} onClose={() => setSelected(null)} />}

      {/* All Articles Modal */}
      {showAll && (
        <div className="article-modal-overlay" onClick={() => setShowAll(false)} style={{ zIndex: 1000 }}>
          <div className="article-modal glass-card" onClick={e => e.stopPropagation()} style={{ padding: "2rem", display: "flex", flexDirection: "column" }}>
            <div className="article-modal__header" style={{ marginBottom: "1.5rem" }}>
              <h2 className="article-modal__title">Semua Artikel Blog</h2>
              <div className="article-modal__actions">
                <a href={blogUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-sm">
                  <ExternalLink size={14} /> Kunjungi Blogger
                </a>
                <button className="btn btn-ghost btn-sm btn-icon" onClick={() => setShowAll(false)}>
                  <X size={16} />
                </button>
              </div>
            </div>
            
            <div style={{ overflowY: "auto", display: "grid", gap: "1rem" }}>
              {allPosts.map((post) => (
                <div key={post.id} className="glass-card" style={{ padding: "1rem", display: "flex", gap: "1rem", alignItems: "center", cursor: "pointer" }} onClick={() => { setShowAll(false); setSelected(post); }}>
                  {post.thumbnail ? (
                    <img src={post.thumbnail} alt={post.title} style={{ width: 100, height: 70, objectFit: "cover", borderRadius: 8 }} />
                  ) : (
                    <div style={{ width: 100, height: 70, background: "var(--clr-bg-3)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <BookOpen size={24} color="var(--clr-primary)" />
                    </div>
                  )}
                  <div style={{ flex: 1 }}>
                    <h4 style={{ fontSize: "1rem", color: "var(--clr-text)", marginBottom: "0.25rem" }}>{post.title}</h4>
                    <p style={{ fontSize: "0.8rem", color: "var(--clr-text-dim)" }}>{formatDate(post.published)} · {post.author}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
