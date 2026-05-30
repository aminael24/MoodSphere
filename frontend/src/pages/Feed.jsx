import { useState, useEffect } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../utils/api.js";
import { useAuth } from "../context/AuthContext.jsx";
import PostCard from "../components/PostCard.jsx";
import Toast from "../components/Toast.jsx";
import CrisisModal from "../components/CrisisModal.jsx";
import { meta } from "../utils/emotions.js";
import BadgeToast from "../components/BadgeToast.jsx";
const logoSrc = "/logo.png";

export default function Feed() {
  const { user, refreshUser, logout } = useAuth();
  const navigate = useNavigate();

  const [posts, setPosts] = useState([]);
  const [content, setContent] = useState("");
  const [anonymous, setAnonymous] = useState(false);
  const [visibility, setVisibility] = useState("public");
  const [posting, setPosting] = useState(false);
  const [lastAnalysis, setLastAnalysis] = useState(null);
  const [toast, setToast] = useState("");
  const [crisis, setCrisis] = useState(null);
const [newBadge, setNewBadge] = useState(null);
  const load = async () => {
    const r = await api.get("/posts/feed");
    setPosts(r.data);
  };

  useEffect(() => {
    load();
  }, []);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2500);
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const publish = async () => {
    if (!content.trim()) return;

    setPosting(true);

    try {
      const r = await api.post("/posts", {
        content,
        anonymous,
        visibility,
      });

      setPosts([r.data, ...posts]);
      // Affiche les badges débloqués un par un
if (r.data.newBadges && r.data.newBadges.length > 0) {
  r.data.newBadges.forEach((badge, i) => {
    setTimeout(() => setNewBadge(badge), i * 5500);
  });
}
      setLastAnalysis(r.data.aiAnalysis);
      setContent("");

      if (r.data.crisisResources) setCrisis(r.data.crisisResources);

      await refreshUser();

      showToast(
        `Émotion détectée : ${meta(r.data.aiAnalysis.dominantEmotion).label}`
      );
    } finally {
      setPosting(false);
    }
  };

  return (
    <div className="feed-page">
      <style>{styles}</style>
      <div className="feed-bg" />

      <aside className="left-sidebar">
        <Link to="/" className="sidebar-logo">
          <img src={logoSrc} alt="MoodSphere" />
          <span>MoodSphere</span>
        </Link>

        <nav className="sidebar-menu">
          <NavLink to="/feed"> Feed</NavLink>
          <NavLink to="/explore"> Explorer</NavLink>
          <NavLink to="/rooms"> Salons</NavLink>
          <NavLink to="/journal"> Journal</NavLink>
          <NavLink to="/therapist">AI Bot</NavLink>
          <NavLink to="/badges"> Badges</NavLink>
          <NavLink to="/profile"> Profil</NavLink>
        </nav>

        <div className="sidebar-user-card">
          <div className="user-top">
            <div className="user-avatar">
              {user?.fullName?.[0] || user?.username?.[0] || "U"}
            </div>

            <div className="user-info">
              <strong>{user?.fullName || user?.username || "Utilisateur"}</strong>
              <span>{user?.email}</span>
            </div>
          </div>

          <button className="logout-under" onClick={handleLogout}>
            ← Se déconnecter
          </button>
        </div>

      </aside>

      <main className="feed-content">
        <section className="feed-main">
          <motion.div
            className="composer-card"
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: "easeOut" }}
          >
            <span className="feed-tag">MoodSphere Feed</span>

            <h2>
              Comment <em>te sens-tu</em> ?
            </h2>

            <p>
              Exprime ton humeur du moment. L'IA détectera ton émotion et
              adaptera ton aura.
            </p>

            <textarea
              className="composer-textarea"
              rows={4}
              placeholder="Écris ce que tu ressens aujourd'hui..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />

            <div className="composer-actions">
              <div className="composer-options">
                <label className="anonymous-option">
                  <input
                    type="checkbox"
                    checked={anonymous}
                    onChange={(e) => setAnonymous(e.target.checked)}
                  />
                  <span>Anonyme</span>
                </label>

                <select
                  className="visibility-select"
                  value={visibility}
                  onChange={(e) => setVisibility(e.target.value)}
                >
                  <option value="public">Public</option>
                  <option value="followers">Abonnés</option>
                  <option value="private">Privé</option>
                </select>
              </div>

              <button className="publish-btn" disabled={posting} onClick={publish}>
                {posting ? "Analyse IA..." : "Publier"}
              </button>
            </div>

            {lastAnalysis && (
              <motion.div
                className="analysis-box"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <span>L'IA a détecté :</span>

                <strong style={{ color: meta(lastAnalysis.dominantEmotion).color }}>
                  <span
                    className="emotion-dot"
                    style={{
                      background: meta(lastAnalysis.dominantEmotion).color,
                    }}
                  />
                  {meta(lastAnalysis.dominantEmotion).emoji}{" "}
                  {meta(lastAnalysis.dominantEmotion).label}
                </strong>

                <small>
                  confiance {Math.round((lastAnalysis.confidence || 0) * 100)}%
                </small>
              </motion.div>
            )}
          </motion.div>

          <div className="posts-list">
            {posts.map((p, i) => (
              <PostCard
                key={p._id}
                post={p}
                index={i}
                onDelete={(id) => setPosts(posts.filter((x) => x._id !== id))}
              />
            ))}

            {posts.length === 0 && (
              <div className="empty-feed">
                <div className="empty-icon">🌙</div>
                <h3>Ton feed est vide</h3>
                <p>Publie ton premier post ou suis des utilisateurs depuis Explorer.</p>
              </div>
            )}
          </div>
        </section>
      </main>

      <Toast message={toast} />
      <CrisisModal data={crisis} onClose={() => setCrisis(null)} />
        <BadgeToast badge={newBadge} onClose={() => setNewBadge(null)} />
    </div>
  );
}

const styles = `
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400;1,600&family=DM+Sans:wght@300;400;500;600;700&display=swap');

.feed-page {
  --burgundy: #4A0E1A;
  --wine: #7B1E32;
  --rose: #C8506A;
  --cream: #FDF6EE;
  --caramel: #C8633A;
  --caramel-light: #E8936A;

  min-height: 100vh;
  background: #0D0608;
  color: var(--cream);
  font-family: 'DM Sans', sans-serif;
}

.feed-bg {
  position: fixed;
  inset: 0;
  background:
    radial-gradient(ellipse 80% 60% at 15% 5%, rgba(123,30,50,0.38), transparent 60%),
    radial-gradient(ellipse 60% 50% at 85% 85%, rgba(200,99,58,0.18), transparent 55%),
    #0D0608;
  z-index: 0;
}

.left-sidebar {
  position: fixed;
  left: 24px;
  top: 24px;
  bottom: 24px;
  width: 250px;
  z-index: 10;
  padding: 24px;
  border-radius: 30px;
  background: rgba(255,255,255,0.055);
  border: 1px solid rgba(255,255,255,0.12);
  backdrop-filter: blur(22px);
  box-shadow: 0 28px 80px rgba(0,0,0,0.45);
  display: flex;
  flex-direction: column;
}

.sidebar-logo {
  display: flex;
  align-items: center;
  gap: 12px;
  text-decoration: none;
  margin-bottom: 34px;
}

.sidebar-logo img {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
  box-shadow: 0 0 25px rgba(232,147,106,0.45);
}

.sidebar-logo span {
  font-family: 'Playfair Display', serif;
  font-size: 1.35rem;
  font-weight: 700;
  background: linear-gradient(135deg, var(--cream), var(--caramel-light));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.sidebar-menu {
  display: grid;
  gap: 10px;
}

.sidebar-menu a {
  color: rgba(253,246,238,0.65);
  text-decoration: none;
  padding: 12px 14px;
  border-radius: 16px;
  font-weight: 700;
  transition: 0.25s ease;
}

.sidebar-menu a:hover,
.sidebar-menu a.active {
  color: var(--cream);
  background: linear-gradient(135deg, rgba(200,99,58,0.25), rgba(200,80,106,0.16));
  border: 1px solid rgba(232,147,106,0.22);
}

.sidebar-user-card {
  margin-top: auto;
  width: 100%;
  padding: 14px;
  border-radius: 22px;
  background: rgba(255,255,255,0.055);
  border: 1px solid rgba(255,255,255,0.1);
  display: flex;
  flex-direction: column;
}

.user-top {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-avatar {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  background: linear-gradient(135deg, var(--caramel), var(--rose));
  font-weight: 800;
  flex-shrink: 0;
  color: var(--cream);
}

.user-info {
  flex: 1;
  min-width: 0;
}

.user-info strong {
  display: block;
  font-size: 0.9rem;
  color: var(--cream);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-info span {
  display: block;
  font-size: 0.74rem;
  color: rgba(253,246,238,0.45);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.logout-under {
  display: block;
  width: 100%;
  background: transparent;
  border: none;
  color: #ffb09f;
  font-weight: 600;
  font-size: 0.82rem;
  cursor: pointer;
  padding: 0;
  margin-top: 12px;
  text-align: center;
  white-space: nowrap;
  transition: color 0.2s ease, transform 0.2s ease;
  font-family: 'DM Sans', sans-serif;
}

.logout-under:hover {
  color: #ffd0c8;
  background: transparent;
  transform: translateX(-2px);
}

.feed-content {
  position: relative;
  z-index: 1;
  margin-left: 310px;
  padding: 42px 40px 70px;
}

.feed-main {
  max-width: 820px;
  margin: 0 auto;
  display: grid;
  gap: 24px;
}

.composer-card,
.empty-feed {
  background: rgba(255,255,255,0.055);
  border: 1px solid rgba(255,255,255,0.12);
  backdrop-filter: blur(22px);
  box-shadow: 0 28px 80px rgba(0,0,0,0.45);
  border-radius: 30px;
  padding: 30px;
}

.feed-tag {
  color: var(--caramel-light);
  text-transform: uppercase;
  letter-spacing: 0.18em;
  font-size: 0.72rem;
  font-weight: 800;
}

.composer-card h2 {
  font-family: 'Playfair Display', serif;
  font-size: 2.25rem;
  font-weight: 400;
  margin: 14px 0 8px;
}

.composer-card h2 em {
  color: var(--caramel-light);
}

.composer-card p {
  color: rgba(253,246,238,0.58);
  line-height: 1.65;
  margin-bottom: 24px;
}

.composer-textarea {
  width: 100%;
  resize: vertical;
  min-height: 125px;
  border-radius: 22px;
  border: 1px solid rgba(255,255,255,0.12);
  background: rgba(255,255,255,0.065);
  color: var(--cream);
  outline: none;
  padding: 18px;
  font-family: 'DM Sans', sans-serif;
  font-size: 0.98rem;
}

.composer-actions {
  margin-top: 18px;
  display: flex;
  justify-content: space-between;
  gap: 18px;
  align-items: center;
  flex-wrap: wrap;
}

.composer-options {
  display: flex;
  gap: 14px;
  align-items: center;
  flex-wrap: wrap;
}

.anonymous-option {
  display: flex;
  align-items: center;
  gap: 8px;
  color: rgba(253,246,238,0.62);
  font-size: 0.88rem;
}

.visibility-select {
  height: 40px;
  border-radius: 999px;
  border: 1px solid rgba(255,255,255,0.12);
  background: rgba(255,255,255,0.065);
  color: var(--cream);
  padding: 0 14px;
}

.visibility-select option {
  color: #0D0608;
}

.publish-btn {
  min-width: 150px;
  height: 46px;
  border: none;
  border-radius: 999px;
  background: linear-gradient(135deg, var(--caramel), var(--rose));
  color: var(--cream);
  font-weight: 800;
  cursor: pointer;
  transition: 0.25s ease;
}

.publish-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 12px 30px rgba(200,99,58,0.35);
}

.publish-btn:disabled {
  opacity: 0.6;
  cursor: wait;
}

.analysis-box {
  margin-top: 18px;
  padding: 14px 16px;
  border-radius: 18px;
  background: rgba(255,255,255,0.055);
  border: 1px solid rgba(255,255,255,0.1);
  display: flex;
  gap: 10px;
  align-items: center;
  flex-wrap: wrap;
}

.emotion-dot {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  display: inline-block;
}

.posts-list {
  display: grid;
  gap: 18px;
}

.empty-feed {
  text-align: center;
}

.empty-icon {
  font-size: 2.4rem;
}

.empty-feed h3 {
  font-family: 'Playfair Display', serif;
  font-size: 1.7rem;
  font-weight: 400;
}

@media (max-width: 950px) {
  .left-sidebar {
    position: relative;
    width: auto;
    left: auto;
    top: auto;
    bottom: auto;
    margin: 18px;
  }

  .feed-content {
    margin-left: 0;
    padding: 20px;
  }
}
`;