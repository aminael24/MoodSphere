import { useState, useEffect } from "react";
import { motion } from "framer-motion";

import api from "../utils/api.js";
import Toast from "../components/Toast.jsx";
import Sidebar from "../components/Sidebar.jsx";

export default function AdminPosts() {
  const [posts, setPosts] = useState([]);
  const [toast, setToast] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/admin/posts");
      setPosts(response.data || []);
    } catch (err) {
      console.error("Erreur chargement posts:", err);
      setError("Impossible de charger les publications.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const flash = (message) => {
    setToast(message);

    setTimeout(() => {
      setToast("");
    }, 2000);
  };

  const togglePost = async (id) => {
    try {
      await api.patch(`/admin/posts/${id}`);

      flash("Visibilité modifiée");
      await load();
    } catch (err) {
      console.error("Erreur modification visibilité:", err);
      flash("Impossible de modifier la visibilité.");
    }
  };

  return (
    <div className="admin-posts-page">
      <style>{styles}</style>

      <div className="admin-posts-bg" />

      <Sidebar />

      <main className="admin-posts-content">
        <motion.header
          className="admin-posts-header"
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <span className="admin-tag">MoodSphere Admin</span>

          <h1>
            Modération des <em>posts</em>
          </h1>

          <p>
            Consulte les publications de la plateforme, repère les signalements
            et masque ou démasque les contenus si nécessaire.
          </p>
        </motion.header>

        {error && (
          <div className="error-card">
            {error}
          </div>
        )}

        {loading && (
          <div className="loading-card">
            Chargement des publications...
          </div>
        )}

        {!loading && (
          <motion.section
            className="posts-panel"
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
          >
            <div className="posts-panel-header">
              <div>
                <span className="section-tag">Publications</span>
                <h2>Liste des posts</h2>
              </div>

              <div className="posts-count">
                {posts.length} post{posts.length > 1 ? "s" : ""}
              </div>
            </div>

            <div className="posts-list">
              {posts.map((post, index) => {
                const auraColor = post.auraColor || "var(--caramel)";

                return (
                  <motion.article
                    key={post._id}
                    className={post.isHidden ? "post-card hidden" : "post-card"}
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(index * 0.04, 0.25) }}
                    style={{
                      borderLeft: `3px solid ${auraColor}`,
                    }}
                  >
                    <div
                      className="post-glow"
                      style={{
                        background: auraColor,
                      }}
                    />

                    <div className="post-header">
                      <div className="author-block">
                        <div
                          className="author-avatar"
                          style={{
                            background: auraColor,
                            boxShadow: `0 0 16px ${auraColor}66`,
                          }}
                        >
                          {(post.authorUsername || "?")[0].toUpperCase()}
                        </div>

                        <div>
                          <strong>
                            @{post.authorUsername || "unknown"}
                          </strong>

                          <span>
                            {post.createdAt
                              ? new Date(post.createdAt).toLocaleString(
                                  "fr-FR",
                                  {
                                    dateStyle: "medium",
                                    timeStyle: "short",
                                  }
                                )
                              : "Date inconnue"}
                          </span>
                        </div>
                      </div>

                      <div className="post-actions">
                        {post.reportCount > 0 && (
                          <span className="report-badge">
                            🚩 {post.reportCount} signalement
                            {post.reportCount > 1 ? "s" : ""}
                          </span>
                        )}

                        {post.isHidden && (
                          <span className="hidden-badge">
                            🙈 Masqué
                          </span>
                        )}

                        <button
                          className={post.isHidden ? "toggle-btn show" : "toggle-btn"}
                          onClick={() => togglePost(post._id)}
                        >
                          {post.isHidden ? "Démasquer" : "Masquer"}
                        </button>
                      </div>
                    </div>

                    <p className="post-content">
                      {post.content}
                    </p>
                  </motion.article>
                );
              })}

              {posts.length === 0 && (
                <div className="empty-card">
                  <div>📝</div>

                  <h3>Aucun post</h3>

                  <p>
                    Aucune publication n’est disponible pour le moment.
                  </p>
                </div>
              )}
            </div>
          </motion.section>
        )}
      </main>

      <Toast message={toast} />
    </div>
  );
}

const styles = `
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400;1,600&family=DM+Sans:wght@300;400;500;600;700&display=swap');

.admin-posts-page {
  --cream: #FDF6EE;
  --rose: #C8506A;
  --wine: #7B1E32;
  --caramel: #C8633A;
  --caramel-light: #E8936A;

  min-height: 100vh;
  background: #0D0608;
  color: var(--cream);
  font-family: 'DM Sans', sans-serif;
}

.admin-posts-bg {
  position: fixed;
  inset: 0;
  background:
    radial-gradient(ellipse 80% 60% at 15% 5%, rgba(123,30,50,0.38), transparent 60%),
    radial-gradient(ellipse 60% 50% at 85% 85%, rgba(200,99,58,0.18), transparent 55%),
    radial-gradient(ellipse 50% 40% at 50% 50%, rgba(200,80,106,0.1), transparent 55%),
    #0D0608;
  z-index: 0;
}

.admin-posts-content {
  position: relative;
  z-index: 1;
  margin-left: 300px;
  padding: 42px 42px 60px;
  max-width: 1280px;
}

.admin-posts-header {
  margin-bottom: 22px;
}

.admin-tag,
.section-tag {
  color: var(--caramel-light);
  text-transform: uppercase;
  letter-spacing: 0.18em;
  font-size: 0.7rem;
  font-weight: 800;
}

.admin-posts-header h1 {
  font-family: 'Playfair Display', serif;
  font-size: 2.55rem;
  font-weight: 400;
  margin: 10px 0 6px;
}

.admin-posts-header h1 em {
  color: var(--caramel-light);
}

.admin-posts-header p {
  color: rgba(253,246,238,0.58);
  max-width: 760px;
  line-height: 1.6;
  margin: 0;
}

.posts-panel,
.loading-card,
.error-card,
.empty-card {
  background: rgba(255,255,255,0.055);
  border: 1px solid rgba(255,255,255,0.12);
  backdrop-filter: blur(22px);
  box-shadow: 0 22px 62px rgba(0,0,0,0.38);
  border-radius: 26px;
}

.loading-card,
.error-card {
  padding: 24px;
  margin-bottom: 18px;
}

.loading-card {
  text-align: center;
  color: rgba(253,246,238,0.65);
}

.error-card {
  color: #ffb4b4;
  border-color: rgba(255,100,100,0.28);
}

.posts-panel {
  padding: 22px;
}

.posts-panel-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 18px;
}

.posts-panel-header h2 {
  font-family: 'Playfair Display', serif;
  font-size: 1.65rem;
  font-weight: 400;
  margin: 6px 0 0;
}

.posts-count {
  border: 1px solid rgba(232,147,106,0.32);
  background: rgba(232,147,106,0.08);
  color: var(--caramel-light);
  border-radius: 999px;
  padding: 8px 12px;
  font-size: 0.76rem;
  font-weight: 900;
  white-space: nowrap;
}

.posts-list {
  display: grid;
  gap: 12px;
}

.post-card {
  position: relative;
  overflow: hidden;
  border-radius: 22px;
  background: rgba(255,255,255,0.045);
  border: 1px solid rgba(255,255,255,0.08);
  padding: 16px;
  transition: 0.25s ease;
}

.post-card:hover {
  background: rgba(255,255,255,0.07);
  border-color: rgba(232,147,106,0.22);
  transform: translateY(-2px);
}

.post-card.hidden {
  opacity: 0.72;
}

.post-glow {
  position: absolute;
  top: -50px;
  right: -50px;
  width: 145px;
  height: 145px;
  border-radius: 50%;
  filter: blur(58px);
  opacity: 0.16;
  pointer-events: none;
}

.post-header {
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 14px;
  margin-bottom: 12px;
}

.author-block {
  display: flex;
  align-items: center;
  gap: 11px;
  min-width: 0;
}

.author-avatar {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  color: var(--cream);
  font-weight: 900;
  flex-shrink: 0;
  text-transform: uppercase;
}

.author-block strong {
  display: block;
  color: var(--cream);
  font-size: 0.94rem;
}

.author-block span {
  display: block;
  color: rgba(253,246,238,0.42);
  font-size: 0.76rem;
  margin-top: 2px;
}

.post-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.report-badge,
.hidden-badge {
  border-radius: 999px;
  padding: 6px 10px;
  font-size: 0.74rem;
  font-weight: 850;
  border: 1px solid rgba(255,255,255,0.1);
  background: rgba(255,255,255,0.045);
}

.report-badge {
  color: #ffb4b4;
  border-color: rgba(255,100,100,0.26);
  background: rgba(255,100,100,0.07);
}

.hidden-badge {
  color: rgba(253,246,238,0.54);
}

.toggle-btn {
  min-height: 38px;
  border-radius: 14px;
  border: 1px solid rgba(255,100,100,0.18);
  background: rgba(255,100,100,0.07);
  color: #ffb4b4;
  padding: 0 13px;
  cursor: pointer;
  font-family: 'DM Sans', sans-serif;
  font-size: 0.78rem;
  font-weight: 900;
  transition: 0.25s ease;
}

.toggle-btn:hover {
  background: rgba(255,100,100,0.16);
  border-color: rgba(255,100,100,0.32);
  transform: translateY(-2px);
}

.toggle-btn.show {
  color: #9ee7b0;
  border-color: rgba(100,220,140,0.24);
  background: rgba(100,220,140,0.07);
}

.toggle-btn.show:hover {
  background: rgba(100,220,140,0.15);
  border-color: rgba(100,220,140,0.34);
}

.post-content {
  position: relative;
  color: rgba(253,246,238,0.72);
  font-size: 0.92rem;
  line-height: 1.65;
  margin: 0;
  white-space: pre-wrap;
}

.empty-card {
  text-align: center;
  padding: 48px 24px;
}

.empty-card div {
  font-size: 2.3rem;
}

.empty-card h3 {
  font-family: 'Playfair Display', serif;
  font-size: 1.55rem;
  font-weight: 400;
  margin: 10px 0 8px;
}

.empty-card p {
  color: rgba(253,246,238,0.55);
  max-width: 440px;
  margin: 0 auto;
  line-height: 1.6;
}

@media (max-width: 950px) {
  .admin-posts-content {
    margin-left: 0;
    padding: 24px;
  }

  .admin-posts-header h1 {
    font-size: 2.25rem;
  }
}

@media (max-width: 720px) {
  .admin-posts-content {
    padding: 20px;
  }

  .posts-panel {
    padding: 18px;
    border-radius: 24px;
  }

  .posts-panel-header,
  .post-header {
    flex-direction: column;
  }

  .post-actions {
    justify-content: flex-start;
  }

  .toggle-btn {
    width: 100%;
  }
}
`;