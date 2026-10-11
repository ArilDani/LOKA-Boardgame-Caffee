/* ============================================================
   INSTAGRAM SECTION COMPONENT
   ============================================================ */
import { useState, useEffect, useRef } from "react";
import { Instagram, Heart, MessageCircle, ExternalLink, Camera } from "lucide-react";
import { supabase } from "../lib/supabase";
import "./InstagramSection.css";

// Mock posts displayed when real API not available
// These showcase the aesthetic with placeholder visuals
const MOCK_POSTS = [
  { id: 1, type: "color", bg: "linear-gradient(135deg,#c8963e,#a57728)", caption: "Game night 🎲" },
  { id: 2, type: "color", bg: "linear-gradient(135deg,#2d6a4f,#1b4332)", caption: "Lokachino ☕" },
  { id: 3, type: "color", bg: "linear-gradient(135deg,#1e3a5f,#0d2137)", caption: "Sesi asik 🏆" },
  { id: 4, type: "color", bg: "linear-gradient(135deg,#6b2737,#3d0c1a)", caption: "Weekend vibes" },
  { id: 5, type: "color", bg: "linear-gradient(135deg,#4a3728,#2c1f15)", caption: "Boardgame time" },
  { id: 6, type: "color", bg: "linear-gradient(135deg,#1a3a2a,#0d1f17)", caption: "Nikmati kopi" },
];

export default function InstagramSection() {
  const [handle,      setHandle]      = useState("lokaboardgamecafe");
  const [name,        setName]        = useState("Loka Boardgame Cafe");
  const [postsCount,  setPostsCount]  = useState("200+");
  const [followers,   setFollowers]   = useState("1K+");
  const [following,   setFollowing]   = useState("500+");
  const [embedCode,   setEmbedCode]   = useState("");
  const [loading,     setLoading]     = useState(true);
  const embedRef = useRef(null);

  useEffect(() => {
    supabase
      .from("settings")
      .select("key,value")
      .in("key", ["instagram_handle", "instagram_name", "instagram_posts", "instagram_followers", "instagram_following", "instagram_embed_code"])
      .then(({ data }) => {
        if (data) {
          data.forEach(row => {
            if (row.key === "instagram_handle") setHandle(row.value || "lokaboardgamecafe");
            if (row.key === "instagram_name") setName(row.value || "Loka Boardgame Cafe");
            if (row.key === "instagram_posts") setPostsCount(row.value || "200+");
            if (row.key === "instagram_followers") setFollowers(row.value || "1K+");
            if (row.key === "instagram_following") setFollowing(row.value || "500+");
            if (row.key === "instagram_embed_code") setEmbedCode(row.value);
          });
        }
        setLoading(false);
      });
  }, []);

  // Inject embed widget scripts after mount
  useEffect(() => {
    if (embedCode && embedRef.current) {
      embedRef.current.innerHTML = embedCode;
      // Re-execute scripts inside embed code
      embedRef.current.querySelectorAll("script").forEach(old => {
        const script = document.createElement("script");
        if (old.src) script.src = old.src;
        else script.textContent = old.textContent;
        script.async = true;
        document.body.appendChild(script);
      });
    }
  }, [embedCode]);

  const instagramUrl = `https://www.instagram.com/${handle}/`;

  return (
    <div className="instagram-section">
      <div className="container">
        {/* Profile card */}
        <div className="insta-profile reveal">
          {/* Avatar with gradient ring */}
          <div className="insta-avatar-wrap">
            <div className="insta-avatar-ring">
              <div className="insta-avatar">
                <Instagram size={32} color="var(--clr-primary)" />
              </div>
            </div>
          </div>

          {/* Info */}
          <div className="insta-info">
            <div className="insta-handle">
              <Instagram size={18} />
              @{handle}
            </div>
            <p className="insta-name">{name}</p>
            <div className="insta-stats">
              <div className="insta-stat-item">
                <span className="insta-stat-num">{postsCount}</span>
                <span className="insta-stat-lbl">Postingan</span>
              </div>
              <div className="insta-stat-item">
                <span className="insta-stat-num">{followers}</span>
                <span className="insta-stat-lbl">Pengikut</span>
              </div>
              <div className="insta-stat-item">
                <span className="insta-stat-num">{following}</span>
                <span className="insta-stat-lbl">Mengikuti</span>
              </div>
            </div>
          </div>

          {/* Follow button */}
          <a
            href={instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="insta-follow-btn"
          >
            <Instagram size={16} />
            Ikuti Kami
          </a>
        </div>

        {/* Posts: embed widget if available, else visual placeholder grid */}
        {embedCode ? (
          <div className="insta-embed-wrap reveal delay-2">
            <div ref={embedRef} />
          </div>
        ) : (
          <div className="insta-placeholder-grid reveal delay-2">
            {MOCK_POSTS.map((post) => (
              <a
                key={post.id}
                href={instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="insta-post"
                title={post.caption}
              >
                <div
                  style={{
                    width: "100%",
                    height: "100%",
                    background: post.bg,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "0.5rem",
                  }}
                >
                  <Camera size={28} color="rgba(255,255,255,0.5)" />
                  <span style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.6)", textAlign: "center", padding: "0 0.5rem" }}>
                    {post.caption}
                  </span>
                </div>
                <div className="insta-post__overlay">
                  <span><Heart size={14} /> Lihat</span>
                  <span><ExternalLink size={14} /> Buka</span>
                </div>
              </a>
            ))}
          </div>
        )}

        {/* Footer CTA */}
        <div className="insta-footer reveal delay-3">
          <a
            href={instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-secondary"
            style={{
              background: "linear-gradient(135deg, rgba(240,148,51,0.1), rgba(188,24,136,0.1))",
              borderColor: "rgba(240,148,51,0.3)",
            }}
          >
            <Instagram size={16} />
            Lihat Semua di Instagram
            <ExternalLink size={14} />
          </a>
          <p style={{ marginTop: "0.75rem", fontSize: "0.8rem", color: "var(--clr-text-dim)" }}>
            Ikuti kami untuk update terbaru, event, dan promo spesial!
          </p>
        </div>
      </div>
    </div>
  );
}
