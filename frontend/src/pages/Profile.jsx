import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler,
} from "chart.js";
import api from "../utils/api.js";
import { useAuth } from "../context/AuthContext.jsx";
import AuraOrb from "../components/AuraOrb.jsx";
import PostCard from "../components/PostCard.jsx";
import Toast from "../components/Toast.jsx";
import Sidebar from "../components/Sidebar.jsx";
import { meta, EMOTION_META } from "../utils/emotions.js";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler);

const ORDER = ["sad", "angry", "stress", "calm", "motivated", "joy"];

export default function Profile() {
  const { user, setUser } = useAuth();
  const [timeline, setTimeline] = useState([]);
  const [posts, setPosts] = useState([]);
  const [fullName, setFullName] = useState(user?.fullName || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [accountType, setAccountType] = useState(user?.accountType || "public");
  const [editing, setEditing] = useState(false);
  const [requests, setRequests] = useState([]);
  const [toast, setToast] = useState("");
  const fileRef = useRef();

  useEffect(() => {
    api.get("/stats/my-mood-timeline").then((r) => setTimeline(r.data));
    api.get("/posts/me").then((r) => setPosts(r.data));
    if (user?._id) {
      api.get(`/users/${user._id}`).then((r) => setRequests(r.data.followRequests || []));
    }
  }, [user?._id]);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2000);
  };

  const save = async () => {
    const r = await api.patch("/users/me", { fullName, bio, accountType });
    setUser(r.data);
    setEditing(false);
    showToast("Profil mis à jour");
  };

  const uploadImage = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append("image", file);
    const r = await api.post("/users/upload-profile-image", fd, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    setUser(r.data.user);
    showToast("Photo de profil mise à jour");
  };

  const acceptRequest = async (id) => {
    await api.post(`/users/${id}/accept-follow`);
    setRequests(requests.filter((r) => r._id !== id));
    showToast("Demande acceptée");
  };

  const m = meta(user?.dominantEmotion);

  const lineData = {
    labels: timeline.map((t) =>
      new Date(t.date).toLocaleDateString("fr-FR", { day: "2-digit", month: "short" })
    ),
    datasets: [
      {
        label: "Humeur",
        data: timeline.map((t) => ORDER.indexOf(t.emotion)),
        borderColor: "#C8633A",
        backgroundColor: "rgba(200,99,58,0.18)",
        fill: true,
        tension: 0.4,
        pointBackgroundColor: timeline.map((t) => meta(t.emotion).color),
        pointBorderColor: "#fff",
        pointRadius: 5,
        pointHoverRadius: 8,
      },
    ],
  };

  const lineOpts = {
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: { label: (c) => " " + meta(timeline[c.dataIndex]?.emotion).label },
      },
    },
    scales: {
      y: {
        min: 0,
        max: ORDER.length - 1,
        ticks: {
          stepSize: 1,
          color: "rgba(253,246,238,0.5)",
          callback: (v) => EMOTION_META[ORDER[v]]?.emoji || "",
          font: { size: 16 },
        },
        grid: { color: "rgba(255,237,218,0.06)" },
      },
      x: {
        ticks: { color: "rgba(253,246,238,0.5)" },
        grid: { color: "rgba(255,237,218,0.04)" },
      },
    },
  };

  return (
    <div className="prof-page">
      <style>{styles}</style>
      <div className="prof-bg" />
      <Sidebar />

      <main className="prof-main">
        {/* HEADER PROFILE */}
        <motion.div
          className="prof-header"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: "easeOut" }}
        >
          <div className="prof-avatar-wrap" onClick={() => fileRef.current?.click()}>
            {user?.profileImage ? (
              <img
                src={user.profileImage}
                alt=""
                className="prof-avatar-img"
                style={{
                  border: `4px solid ${user.auraColor}`,
                  boxShadow: `0 0 30px ${user.auraColor}88`,
                }}
              />
            ) : (
              <AuraOrb color={user?.auraColor} size={140} emoji={m.emoji} />
            )}
            <input ref={fileRef} type="file" accept="image/*" hidden onChange={uploadImage} />
            <span className="prof-avatar-edit">📷 Changer</span>
          </div>

          <div className="prof-info">
            {editing ? (
              <>
                <input
                  className="prof-input"
                  placeholder="Nom complet"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
                <textarea
                  className="prof-input prof-textarea"
                  rows={2}
                  value={bio}
                  maxLength={200}
                  placeholder="Ta bio…"
                  onChange={(e) => setBio(e.target.value)}
                />
                <select
                  className="prof-select"
                  value={accountType}
                  onChange={(e) => setAccountType(e.target.value)}
                >
                  <option value="public">🌍 Compte public</option>
                  <option value="private">🔒 Compte privé</option>
                </select>
                <div className="prof-actions">
                  <button className="prof-btn-primary" onClick={save}>
                    Enregistrer
                  </button>
                  <button className="prof-btn-ghost" onClick={() => setEditing(false)}>
                    Annuler
                  </button>
                </div>
              </>
            ) : (
              <>
                <span className="prof-tag">Mon profil</span>
                <h1>
                  {user?.fullName || "Utilisateur"}
                </h1>
                <div className="prof-handle">
                  @{user?.username}{" "}
                  {user?.accountType === "private" && (
                    <span className="prof-private-badge">🔒 privé</span>
                  )}
                </div>

                <div className="prof-emotion-badge" style={{ borderColor: m.color }}>
                  <span className="prof-dot" style={{ background: m.color }} />
                  <span style={{ color: m.color }}>{m.emoji} {m.label}</span>
                </div>

                <p className="prof-bio">{user?.bio || "Aucune bio."}</p>

                <div className="prof-stats">
                  <div className="prof-stat">
                    <strong>{user?.followers?.length || 0}</strong>
                    <span>abonnés</span>
                  </div>
                  <div className="prof-stat">
                    <strong>{user?.following?.length || 0}</strong>
                    <span>abonnements</span>
                  </div>
                  <div className="prof-stat">
                    <strong>{posts.length}</strong>
                    <span>posts</span>
                  </div>
                </div>

                <button className="prof-btn-ghost" onClick={() => setEditing(true)}>
                  ✏️ Modifier mon profil
                </button>
              </>
            )}
          </div>
        </motion.div>

        {/* GAMIFICATION */}
        {(user?.badges?.length > 0 ||
          user?.wellnessPoints > 0 ||
          user?.streak > 0) && (
          <motion.div
            className="prof-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="prof-card-header">
              <h2>🏆 Mes succès</h2>
              <div className="prof-points">
                <div className="prof-point-item">
                  <span>⚡</span>
                  <strong>{user?.streak || 0}</strong>
                  <small>jours</small>
                </div>
                <div className="prof-point-item">
                  <span>✨</span>
                  <strong>{user?.wellnessPoints || 0}</strong>
                  <small>pts</small>
                </div>
              </div>
            </div>

            <div className="prof-badges-list">
              {(user?.badges || []).map((b, i) => (
                <div key={i} className="prof-badge">
                  <span className="prof-badge-emoji">{b.emoji}</span>
                  <span className="prof-badge-label">{b.label}</span>
                </div>
              ))}
              {(!user?.badges || user.badges.length === 0) && (
                <p className="prof-empty-text">
                  Pas encore de badge — publie ton premier post pour débloquer
                  "Premier pas" 🌱
                </p>
              )}
            </div>
          </motion.div>
        )}

        {/* FOLLOW REQUESTS */}
        {requests.length > 0 && (
          <motion.div
            className="prof-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <h2>📩 Demandes de follow ({requests.length})</h2>
            <div className="prof-requests">
              {requests.map((r) => (
                <div key={r._id} className="prof-request-item">
                  <span>@{r.username || r._id}</span>
                  <button
                    className="prof-btn-primary prof-btn-sm"
                    onClick={() => acceptRequest(r._id)}
                  >
                    Accepter
                  </button>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* MOOD TIMELINE */}
        <motion.div
          className="prof-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2>🪞 Mood Timeline</h2>
          <p className="prof-card-sub">
            L'évolution de ton humeur au fil de tes publications.
          </p>
          {timeline.length > 1 ? (
            <div className="prof-chart">
              <Line data={lineData} options={{ ...lineOpts, maintainAspectRatio: false }} />
            </div>
          ) : (
            <p className="prof-empty-text">
              Publie quelques posts pour voir ta courbe émotionnelle apparaître.
            </p>
          )}
        </motion.div>

        {/* MES POSTS */}
        <div className="prof-section">
          <h2 className="prof-section-title">Mes publications</h2>
          <div className="prof-posts">
            {posts.map((p, i) => (
              <PostCard
                key={p._id}
                post={p}
                index={i}
                onDelete={(id) => setPosts(posts.filter((x) => x._id !== id))}
              />
            ))}
            {posts.length === 0 && (
              <div className="prof-card prof-empty-card">
                <div className="prof-empty-icon">🌙</div>
                <h3>Aucune publication</h3>
                <p>Tu n'as encore rien publié.</p>
              </div>
            )}
          </div>
        </div>
      </main>

      <Toast message={toast} />
    </div>
  );
}

const styles = `
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400;1,600&family=DM+Sans:wght@300;400;500;600;700&display=swap');

.prof-page {
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

.prof-bg {
  position: fixed;
  inset: 0;
  background:
    radial-gradient(ellipse 80% 60% at 15% 5%, rgba(123,30,50,0.38), transparent 60%),
    radial-gradient(ellipse 60% 50% at 85% 85%, rgba(200,99,58,0.18), transparent 55%),
    radial-gradient(ellipse 50% 40% at 50% 50%, rgba(200,80,106,0.1), transparent 55%),
    #0D0608;
  z-index: 0;
}

.prof-main {
  position: relative;
  z-index: 1;
  margin-left: 298px;
  padding: 42px 40px 70px;
  max-width: 920px;
  display: grid;
  gap: 22px;
}

/* HEADER */
.prof-header {
  background: rgba(255,255,255,0.055);
  border: 1px solid rgba(255,255,255,0.12);
  backdrop-filter: blur(22px);
  box-shadow: 0 28px 80px rgba(0,0,0,0.45);
  border-radius: 30px;
  padding: 36px;
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 32px;
  align-items: center;
}

.prof-avatar-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  width: 140px;
}

.prof-avatar-img {
  width: 140px;
  height: 140px;
  border-radius: 50%;
  object-fit: cover;
}

.prof-avatar-edit {
  font-size: 0.74rem;
  color: rgba(253,246,238,0.48);
  font-weight: 600;
  transition: color 0.2s;
}

.prof-avatar-wrap:hover .prof-avatar-edit {
  color: var(--caramel-light);
}

.prof-info { min-width: 0; }

.prof-tag {
  color: var(--caramel-light);
  text-transform: uppercase;
  letter-spacing: 0.18em;
  font-size: 0.72rem;
  font-weight: 800;
}

.prof-info h1 {
  font-family: 'Playfair Display', serif;
  font-size: 2.5rem;
  font-weight: 400;
  margin: 8px 0 4px;
  line-height: 1.1;
}

.prof-handle {
  color: rgba(253,246,238,0.55);
  font-size: 0.95rem;
  margin-bottom: 12px;
}

.prof-private-badge {
  color: var(--caramel-light);
  font-size: 0.82rem;
}

.prof-emotion-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 14px;
  border-radius: 999px;
  border: 1.5px solid;
  font-size: 0.85rem;
  font-weight: 600;
  margin-bottom: 16px;
}

.prof-dot {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  box-shadow: 0 0 10px currentColor;
}

.prof-bio {
  color: rgba(253,246,238,0.65);
  line-height: 1.6;
  margin-bottom: 18px;
  font-size: 0.95rem;
  max-width: 480px;
}

.prof-stats {
  display: flex;
  gap: 28px;
  margin-bottom: 20px;
}

.prof-stat {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.prof-stat strong {
  font-family: 'Playfair Display', serif;
  font-size: 1.6rem;
  font-weight: 700;
  color: var(--cream);
}

.prof-stat span {
  color: rgba(253,246,238,0.45);
  font-size: 0.78rem;
}

/* INPUTS */
.prof-input, .prof-textarea, .prof-select {
  width: 100%;
  border-radius: 14px;
  border: 1px solid rgba(255,255,255,0.12);
  background: rgba(255,255,255,0.062);
  color: var(--cream);
  outline: none;
  padding: 12px 14px;
  font-family: 'DM Sans', sans-serif;
  font-size: 0.93rem;
  margin-bottom: 10px;
  transition: border-color 0.2s;
}

.prof-textarea {
  resize: vertical;
  min-height: 70px;
}

.prof-input:focus, .prof-textarea:focus, .prof-select:focus {
  border-color: rgba(232,147,106,0.5);
}

.prof-select option { color: #0D0608; }

.prof-actions { display: flex; gap: 10px; margin-top: 8px; }

/* BUTTONS */
.prof-btn-primary, .prof-btn-ghost {
  border: none;
  border-radius: 999px;
  padding: 10px 22px;
  font-weight: 700;
  font-family: 'DM Sans', sans-serif;
  cursor: pointer;
  font-size: 0.88rem;
  transition: all 0.25s ease;
}

.prof-btn-primary {
  background: linear-gradient(135deg, var(--caramel), var(--rose));
  color: var(--cream);
}

.prof-btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 26px rgba(200,99,58,0.32);
}

.prof-btn-ghost {
  background: rgba(255,255,255,0.062);
  color: var(--cream);
  border: 1px solid rgba(255,255,255,0.12);
}

.prof-btn-ghost:hover {
  background: rgba(255,255,255,0.1);
  border-color: rgba(232,147,106,0.32);
}

.prof-btn-sm { padding: 7px 16px; font-size: 0.82rem; }

/* CARDS */
.prof-card {
  background: rgba(255,255,255,0.055);
  border: 1px solid rgba(255,255,255,0.12);
  backdrop-filter: blur(22px);
  box-shadow: 0 22px 60px rgba(0,0,0,0.4);
  border-radius: 24px;
  padding: 26px;
}

.prof-card h2 {
  font-family: 'Playfair Display', serif;
  font-size: 1.5rem;
  font-weight: 400;
  margin: 0 0 6px;
}

.prof-card-sub {
  color: rgba(253,246,238,0.5);
  font-size: 0.86rem;
  margin-bottom: 18px;
}

.prof-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 14px;
  margin-bottom: 18px;
}

.prof-card-header h2 { margin: 0; }

.prof-points {
  display: flex;
  gap: 14px;
}

.prof-point-item {
  display: flex;
  align-items: center;
  gap: 7px;
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 999px;
  padding: 6px 14px;
  font-size: 0.85rem;
}

.prof-point-item strong { font-weight: 800; }
.prof-point-item small { color: rgba(253,246,238,0.45); }

/* BADGES */
.prof-badges-list {
  display: flex;
  flex-wrap: wrap;
  gap: 9px;
}

.prof-badge {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 9px 16px;
  background: rgba(200,99,58,0.1);
  border: 1px solid rgba(232,147,106,0.22);
  border-radius: 999px;
  transition: all 0.25s ease;
}

.prof-badge:hover {
  background: rgba(200,99,58,0.18);
  transform: translateY(-2px);
}

.prof-badge-emoji { font-size: 1.15rem; }
.prof-badge-label { font-weight: 600; font-size: 0.85rem; }

.prof-empty-text {
  color: rgba(253,246,238,0.4);
  font-size: 0.88rem;
  padding: 14px 0;
}

/* REQUESTS */
.prof-requests {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 12px;
}

.prof-request-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.07);
  border-radius: 14px;
  font-size: 0.92rem;
}

/* CHART */
.prof-chart {
  height: 260px;
  margin-top: 6px;
}

/* SECTION */
.prof-section { margin-top: 4px; }

.prof-section-title {
  font-family: 'Playfair Display', serif;
  font-size: 1.55rem;
  font-weight: 400;
  margin: 0 0 14px;
}

.prof-posts {
  display: grid;
  gap: 16px;
}

.prof-empty-card { text-align: center; padding: 40px 26px; }
.prof-empty-icon { font-size: 2.4rem; margin-bottom: 10px; }

.prof-empty-card h3 {
  font-family: 'Playfair Display', serif;
  font-size: 1.4rem;
  font-weight: 400;
  margin: 0 0 6px;
}

.prof-empty-card p { color: rgba(253,246,238,0.5); }

/* RESPONSIVE */
@media (max-width: 950px) {
  .prof-main {
    margin-left: 0;
    padding: 24px 20px 50px;
  }

  .prof-header {
    grid-template-columns: 1fr;
    text-align: center;
    padding: 28px 20px;
  }

  .prof-avatar-wrap { margin: 0 auto; }

  .prof-stats { justify-content: center; }

  .prof-emotion-badge { margin: 0 auto 16px; }

  .prof-bio { text-align: center; margin: 0 auto 18px; }
}

@media (max-width: 620px) {
  .prof-info h1 { font-size: 2rem; }
  .prof-card { padding: 20px; }
  .prof-stats { gap: 18px; }
  .prof-stat strong { font-size: 1.35rem; }
}
`;