import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../utils/api.js";
import PostCard from "../components/PostCard.jsx";
import Sidebar from "../components/Sidebar.jsx";
import { meta, EMOTION_META } from "../utils/emotions.js";

export default function Explore() {
  const [posts, setPosts] = useState([]);
  const [users, setUsers] = useState([]);
  const [topTags, setTopTags] = useState([]);

  const [query, setQuery] = useState("");
  const [emotion, setEmotion] = useState("");
  const [tag, setTag] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Charger les tags tendances
  useEffect(() => {
    api
      .get("/search/tags")
      .then((r) => setTopTags(r.data || []))
      .catch((err) => {
        console.error("Erreur tags:", err);
        setTopTags([]);
      });
  }, []);

  // Recherche avec un petit délai pour éviter trop de requêtes
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchExploreData();
    }, 350);

    return () => clearTimeout(timer);
  }, [query, emotion, tag, from, to]);

  const fetchExploreData = async () => {
    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams();

      if (query.trim()) params.set("q", query.trim());
      if (emotion) params.set("emotion", emotion);
      if (tag.trim()) params.set("tag", tag.trim());
      if (from) params.set("from", from);
      if (to) params.set("to", to);

      const hasFilters = params.toString();

      if (hasFilters) {
        const r = await api.get("/search?" + hasFilters);

        setPosts(r.data.posts || []);
        setUsers(r.data.users || []);
      } else {
        const r = await api.get("/posts/public");

        setPosts(r.data || []);
        setUsers([]);
      }
    } catch (err) {
      console.error("Erreur recherche:", err);
      setError("Erreur lors de la recherche.");
      setPosts([]);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setQuery("");
    setEmotion("");
    setTag("");
    setFrom("");
    setTo("");
    setUsers([]);
    setError("");
  };

  return (
    <div className="explore-page">
      <style>{styles}</style>
      <div className="explore-bg" />

      <Sidebar />

      <main className="explore-content">
        <motion.div
          className="explore-header"
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <span className="explore-tag">MoodSphere Explorer</span>

          <h1>
            Explorer & <em>rechercher</em>
          </h1>

          <p>
            Recherche des posts publics par texte, émotion, tag ou date. Les personnes
            apparaissent seulement quand tu fais une recherche.
          </p>
        </motion.div>

        <motion.section
          className="explore-card"
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
        >
          <input
            className="explore-input main-search"
            placeholder="🔍 Rechercher une personne, un username ou un post..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />

          <div className="filters-grid">
            <select
              className="explore-input"
              value={emotion}
              onChange={(e) => setEmotion(e.target.value)}
            >
              <option value="">Toutes émotions</option>

              {Object.entries(EMOTION_META).map(([k, v]) => (
                <option key={k} value={k}>
                  {v.emoji} {v.label}
                </option>
              ))}
            </select>

            <input
              className="explore-input"
              placeholder="Tag sans #"
              value={tag}
              onChange={(e) => setTag(e.target.value.replace(/^#/, ""))}
            />

            <input
              className="explore-input"
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
            />

            <input
              className="explore-input"
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
            />
          </div>

          {(query || emotion || tag || from || to) && (
            <button className="reset-btn" onClick={reset}>
              ✕ Réinitialiser
            </button>
          )}

          {topTags.length > 0 && (
            <div className="tags-row">
              <span>Tendances :</span>

              {topTags.slice(0, 8).map((t) => (
                <button key={t._id} onClick={() => setTag(t._id)}>
                  #{t._id} ({t.count})
                </button>
              ))}
            </div>
          )}
        </motion.section>

        {loading && (
          <div className="loading-card">
            Recherche en cours...
          </div>
        )}

        {error && (
          <div className="error-card">
            {error}
          </div>
        )}

        {users.length > 0 && (
          <motion.section
            className="explore-card users-results"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h3>👥 Personnes trouvées</h3>

            <div className="users-grid">
              {users.map((u) => {
                const m = meta(u.dominantEmotion);
                const initials = (u.fullName || u.username || "?")[0].toUpperCase();

                return (
                  <Link to={`/u/${u._id}`} key={u._id} className="user-result">
                    <div className="user-avatar">
                      {u.profileImage ? (
                        <img src={u.profileImage} alt={u.fullName || u.username} />
                      ) : (
                        initials
                      )}
                    </div>

                    <div className="user-text">
                      <strong>{u.fullName || u.username}</strong>

                      <span>
                        @{u.username}
                        {u.city && ` · ${u.city}`}
                        {u.accountType === "private" && " · 🔒"}
                      </span>
                    </div>

                    <span
                      className="emotion-light"
                      style={{
                        background: m.color,
                        boxShadow: `0 0 10px ${m.color}`,
                      }}
                    />
                  </Link>
                );
              })}
            </div>
          </motion.section>
        )}

        <section className="posts-list">
          {posts.map((p, i) => (
            <PostCard key={p._id} post={p} index={i} />
          ))}

          {!loading && posts.length === 0 && (
            <div className="empty-card">
              <div>🌙</div>

              <h3>Aucun post trouvé</h3>

              <p>
                Essaie une autre recherche ou réinitialise les filtres.
              </p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

const styles = `
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400;1,600&family=DM+Sans:wght@300;400;500;600;700&display=swap');

.explore-page {
  --cream: #FDF6EE;
  --rose: #C8506A;
  --caramel: #C8633A;
  --caramel-light: #E8936A;

  min-height: 100vh;
  background: #0D0608;
  color: var(--cream);
  font-family: 'DM Sans', sans-serif;
}

.explore-bg {
  position: fixed;
  inset: 0;
  background:
    radial-gradient(ellipse 80% 60% at 15% 5%, rgba(123,30,50,0.38), transparent 60%),
    radial-gradient(ellipse 60% 50% at 85% 85%, rgba(200,99,58,0.18), transparent 55%),
    #0D0608;
  z-index: 0;
}

.explore-content {
  position: relative;
  z-index: 1;
  margin-left: 300px;
  padding: 48px 42px 70px;
  max-width: 1180px;
}

.explore-header {
  margin-bottom: 24px;
}

.explore-tag {
  color: var(--caramel-light);
  text-transform: uppercase;
  letter-spacing: 0.18em;
  font-size: 0.72rem;
  font-weight: 800;
}

.explore-header h1 {
  font-family: 'Playfair Display', serif;
  font-size: 2.6rem;
  font-weight: 400;
  margin: 12px 0 8px;
}

.explore-header h1 em {
  color: var(--caramel-light);
}

.explore-header p {
  color: rgba(253,246,238,0.58);
  max-width: 680px;
  line-height: 1.65;
}

.explore-card,
.empty-card,
.loading-card,
.error-card {
  background: rgba(255,255,255,0.055);
  border: 1px solid rgba(255,255,255,0.12);
  backdrop-filter: blur(22px);
  box-shadow: 0 28px 80px rgba(0,0,0,0.45);
  border-radius: 28px;
  padding: 24px;
  margin-bottom: 22px;
}

.loading-card {
  color: rgba(253,246,238,0.65);
  text-align: center;
}

.error-card {
  color: #ffb4b4;
  border-color: rgba(255, 100, 100, 0.28);
}

.explore-input {
  width: 100%;
  height: 46px;
  border-radius: 16px;
  border: 1px solid rgba(255,255,255,0.12);
  background: rgba(255,255,255,0.065);
  color: var(--cream);
  padding: 0 15px;
  outline: none;
  font-family: 'DM Sans', sans-serif;
}

.explore-input::placeholder {
  color: rgba(253,246,238,0.38);
}

.explore-input:focus {
  border-color: rgba(232,147,106,0.65);
  box-shadow: 0 0 0 4px rgba(232,147,106,0.1);
}

.main-search {
  margin-bottom: 12px;
}

.filters-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(145px, 1fr));
  gap: 10px;
}

.explore-input option {
  color: #0D0608;
}

.reset-btn {
  margin-top: 14px;
  border: 1px solid rgba(255,255,255,0.12);
  background: rgba(255,255,255,0.06);
  color: var(--cream);
  border-radius: 999px;
  padding: 9px 15px;
  cursor: pointer;
  font-weight: 700;
}

.reset-btn:hover {
  color: var(--caramel-light);
  border-color: rgba(232,147,106,0.35);
}

.tags-row {
  margin-top: 14px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}

.tags-row span {
  color: rgba(253,246,238,0.52);
  font-size: 0.8rem;
}

.tags-row button {
  border: 1px solid rgba(255,255,255,0.1);
  background: rgba(255,255,255,0.055);
  color: rgba(253,246,238,0.68);
  border-radius: 999px;
  padding: 5px 11px;
  cursor: pointer;
}

.tags-row button:hover {
  color: var(--caramel-light);
}

.users-results h3 {
  margin: 0 0 14px;
  font-size: 1.05rem;
}

.users-grid {
  display: grid;
  gap: 10px;
}

.user-result {
  display: flex;
  align-items: center;
  gap: 12px;
  text-decoration: none;
  padding: 12px;
  border-radius: 18px;
  color: var(--cream);
  background: rgba(255,255,255,0.035);
  border: 1px solid rgba(255,255,255,0.08);
  transition: 0.25s ease;
}

.user-result:hover {
  background: rgba(255,255,255,0.07);
  transform: translateX(4px);
}

.user-avatar {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  overflow: hidden;
  background: linear-gradient(135deg, var(--caramel), var(--rose));
  font-weight: 800;
  flex-shrink: 0;
}

.user-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.user-text {
  flex: 1;
  min-width: 0;
}

.user-text strong {
  display: block;
  font-size: 0.92rem;
}

.user-text span {
  display: block;
  color: rgba(253,246,238,0.48);
  font-size: 0.8rem;
}

.emotion-light {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
}

.posts-list {
  display: grid;
  gap: 18px;
}

.empty-card {
  text-align: center;
  padding: 50px 26px;
}

.empty-card div {
  font-size: 2.4rem;
}

.empty-card h3 {
  font-family: 'Playfair Display', serif;
  font-size: 1.7rem;
  font-weight: 400;
  margin: 10px 0 8px;
}

.empty-card p {
  color: rgba(253,246,238,0.55);
}

@media (max-width: 950px) {
  .explore-content {
    margin-left: 0;
    padding: 24px;
  }
}
`;