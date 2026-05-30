import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../utils/api.js";
import { useAuth } from "../context/AuthContext.jsx";
import AuraOrb from "../components/AuraOrb.jsx";
import PostCard from "../components/PostCard.jsx";
import Toast from "../components/Toast.jsx";
import Sidebar from "../components/Sidebar.jsx";
import { meta } from "../utils/emotions.js";

export default function UserProfile() {
  const { id } = useParams();
  const { user: me } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [posts, setPosts]     = useState([]);
  const [toast, setToast]     = useState("");
  const [status, setStatus]   = useState("none"); // none | following | requested

  const load = async () => {
    const r = await api.get(`/users/${id}`);
    setProfile(r.data);
    const amFollower  = r.data.followers?.some((f) => f._id === me._id);
    const amRequested = r.data.followRequests?.some((f) => f._id === me._id || f === me._id);
    setStatus(amFollower ? "following" : amRequested ? "requested" : "none");
    const pr = await api.get(`/posts/user/${id}`);
    setPosts(pr.data);
  };

  useEffect(() => { load(); }, [id]);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2200);
  };

  const follow = async () => {
    const r = await api.post(`/users/${id}/follow`);
    setStatus(r.data.status === "requested" ? "requested" : "following");
    showToast(r.data.status === "requested" ? "Demande envoyée" : "Tu suis maintenant " + profile.username);
    load();
  };

  const unfollow = async () => {
    await api.post(`/users/${id}/unfollow`);
    setStatus("none");
    showToast("Désabonné");
    load();
  };

  if (!profile) return (
    <div className="up-page">
      <style>{styles}</style>
      <div className="up-bg" />
      <Sidebar />
      <main className="up-main">
        <div className="up-loading">
          <span className="pulse-dot" />
          Chargement du profil…
        </div>
      </main>
    </div>
  );

  const m       = meta(profile.dominantEmotion);
  const isSelf  = profile._id === me._id;
  const isPrivateLocked = profile.accountType === "private" && status !== "following" && !isSelf;

  return (
    <div className="up-page">
      <style>{styles}</style>
      <div className="up-bg" />
      <Sidebar />

      <main className="up-main">

        {/* ── Back button ── */}
        <motion.button
          className="up-back"
          onClick={() => navigate("/explore")}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          whileHover={{ x: -4 }}
        >
          ← Retour à l'explorateur
        </motion.button>

        {/* ── Profile card ── */}
        <motion.div
          className="up-card"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
        >
          {/* Avatar / Aura */}
          <div className="up-avatar-wrap">
            {profile.profileImage ? (
              <img
                src={profile.profileImage}
                alt={profile.fullName}
                className="up-avatar-img"
                style={{ borderColor: profile.auraColor, boxShadow: `0 0 40px ${profile.auraColor}66` }}
              />
            ) : (
              <AuraOrb color={profile.auraColor} size={130} emoji={m.emoji} />
            )}
            <span
              className="up-emotion-dot"
              style={{ background: m.color, boxShadow: `0 0 10px ${m.color}` }}
            />
          </div>

          {/* Info */}
          <div className="up-info">
            <div className="up-name-row">
              <div>
                <h1 className="up-name">{profile.fullName}</h1>
                <p className="up-username">
                  @{profile.username}
                  {profile.accountType === "private" && <span className="up-private">🔒 Privé</span>}
                </p>
              </div>

              {/* Follow button */}
              {!isSelf && (
                <div className="up-follow-wrap">
                  {status === "following" ? (
                    <button className="up-btn up-btn-ghost" onClick={unfollow}>✓ Abonné</button>
                  ) : status === "requested" ? (
                    <button className="up-btn up-btn-ghost" disabled>⏳ En attente</button>
                  ) : (
                    <button className="up-btn up-btn-primary" onClick={follow}>+ Suivre</button>
                  )}
                </div>
              )}
            </div>

            {/* Emotion badge */}
            <span className="up-emotion-badge" style={{ color: m.color, borderColor: `${m.color}44` }}>
              {m.emoji} {m.label}
            </span>

            {/* Bio */}
            <p className="up-bio">{profile.bio || "Aucune bio pour le moment."}</p>

            {/* Stats */}
            <div className="up-stats">
              <div className="up-stat">
                <strong>{profile.followers?.length || 0}</strong>
                <span>abonnés</span>
              </div>
              <div className="up-stat-divider" />
              <div className="up-stat">
                <strong>{profile.following?.length || 0}</strong>
                <span>abonnements</span>
              </div>
              <div className="up-stat-divider" />
              <div className="up-stat">
                <strong>{posts.length}</strong>
                <span>posts</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ── Posts section ── */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12 }}
        >
          <div className="up-section-label">
            <span>Publications</span>
            {!isPrivateLocked && <span className="up-count-pill">{posts.length}</span>}
          </div>

          {isPrivateLocked ? (
            <div className="up-private-wall">
              <div className="up-private-icon">🔒</div>
              <h3>Compte privé</h3>
              <p>Suis cet utilisateur pour voir ses publications.</p>
              <button className="up-btn up-btn-primary" onClick={follow}>
                + Envoyer une demande
              </button>
            </div>
          ) : posts.length === 0 ? (
            <div className="up-empty">
              <div>🌙</div>
              <h3>Aucune publication</h3>
              <p>Cet utilisateur n'a pas encore posté.</p>
            </div>
          ) : (
            <div className="up-posts-grid">
              {posts.map((p, i) => (
                <PostCard key={p._id} post={p} index={i} />
              ))}
            </div>
          )}
        </motion.div>

      </main>

      <Toast message={toast} />
    </div>
  );
}

const styles = `
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400;1,600&family=DM+Sans:wght@300;400;500;600;700&display=swap');

.up-page {
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

.up-bg {
  position: fixed;
  inset: 0;
  background:
    radial-gradient(ellipse 80% 60% at 15% 5%,  rgba(123,30,50,0.38),  transparent 60%),
    radial-gradient(ellipse 60% 50% at 85% 85%, rgba(200,99,58,0.18),  transparent 55%),
    #0D0608;
  z-index: 0;
}

.up-main {
  position: relative;
  z-index: 1;
  margin-left: 298px;
  padding: 40px 42px 80px;
  max-width: 900px;
}

/* ── Back ── */
.up-back {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: rgba(255,255,255,0.055);
  border: 1px solid rgba(255,255,255,0.12);
  color: rgba(253,246,238,0.7);
  border-radius: 999px;
  padding: 10px 20px;
  font-family: 'DM Sans', sans-serif;
  font-size: 0.88rem;
  font-weight: 700;
  cursor: pointer;
  margin-bottom: 28px;
  transition: 0.25s ease;
  backdrop-filter: blur(16px);
}

.up-back:hover {
  color: var(--caramel-light);
  border-color: rgba(232,147,106,0.4);
  background: rgba(200,99,58,0.1);
}

/* ── Profile card ── */
.up-card {
  display: flex;
  gap: 32px;
  align-items: flex-start;
  background: rgba(255,255,255,0.055);
  border: 1px solid rgba(255,255,255,0.12);
  backdrop-filter: blur(22px);
  box-shadow: 0 28px 80px rgba(0,0,0,0.45);
  border-radius: 30px;
  padding: 34px;
  margin-bottom: 28px;
}

/* ── Avatar ── */
.up-avatar-wrap {
  position: relative;
  flex-shrink: 0;
}

.up-avatar-img {
  width: 130px;
  height: 130px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid;
}

.up-emotion-dot {
  position: absolute;
  bottom: 6px;
  right: 6px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 2px solid #0D0608;
}

/* ── Info ── */
.up-info {
  flex: 1;
  min-width: 0;
}

.up-name-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
  margin-bottom: 12px;
}

.up-name {
  font-family: 'Playfair Display', serif;
  font-size: 2.1rem;
  font-weight: 400;
  margin: 0 0 4px;
}

.up-username {
  color: rgba(253,246,238,0.48);
  font-size: 0.9rem;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.up-private {
  background: rgba(255,255,255,0.07);
  border: 1px solid rgba(255,255,255,0.12);
  border-radius: 999px;
  padding: 2px 10px;
  font-size: 0.76rem;
  color: rgba(253,246,238,0.55);
}

.up-emotion-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 14px;
  border-radius: 999px;
  border: 1px solid;
  font-size: 0.82rem;
  font-weight: 700;
  margin-bottom: 14px;
}

.up-bio {
  color: rgba(253,246,238,0.62);
  font-size: 0.95rem;
  line-height: 1.65;
  margin: 0 0 20px;
}

/* ── Stats ── */
.up-stats {
  display: flex;
  align-items: center;
  gap: 20px;
}

.up-stat {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.up-stat strong {
  font-family: 'Playfair Display', serif;
  font-size: 1.5rem;
  color: var(--caramel-light);
}

.up-stat span {
  font-size: 0.76rem;
  color: rgba(253,246,238,0.48);
}

.up-stat-divider {
  width: 1px;
  height: 30px;
  background: rgba(255,255,255,0.12);
}

/* ── Follow buttons ── */
.up-follow-wrap {
  flex-shrink: 0;
}

.up-btn {
  padding: 11px 24px;
  border-radius: 999px;
  font-family: 'DM Sans', sans-serif;
  font-weight: 800;
  font-size: 0.88rem;
  cursor: pointer;
  transition: 0.25s ease;
  white-space: nowrap;
}

.up-btn-primary {
  background: linear-gradient(135deg, var(--caramel), var(--rose));
  border: none;
  color: var(--cream);
  box-shadow: 0 8px 24px rgba(200,99,58,0.35);
}

.up-btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 14px 32px rgba(200,99,58,0.5);
}

.up-btn-ghost {
  background: rgba(255,255,255,0.07);
  border: 1px solid rgba(255,255,255,0.18);
  color: rgba(253,246,238,0.75);
}

.up-btn-ghost:hover:not(:disabled) {
  background: rgba(255,255,255,0.12);
  color: var(--cream);
}

.up-btn-ghost:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

/* ── Section label ── */
.up-section-label {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 16px;
  font-size: 0.78rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.14em;
  color: var(--caramel-light);
}

.up-count-pill {
  background: rgba(232,147,106,0.2);
  color: var(--caramel-light);
  border-radius: 999px;
  padding: 2px 9px;
  font-size: 0.74rem;
}

/* ── Posts grid ── */
.up-posts-grid {
  display: grid;
  gap: 18px;
}

/* ── Private wall ── */
.up-private-wall,
.up-empty {
  background: rgba(255,255,255,0.055);
  border: 1px solid rgba(255,255,255,0.12);
  backdrop-filter: blur(22px);
  border-radius: 28px;
  padding: 54px 30px;
  text-align: center;
}

.up-private-icon {
  font-size: 3rem;
  margin-bottom: 12px;
}

.up-private-wall h3,
.up-empty h3 {
  font-family: 'Playfair Display', serif;
  font-size: 1.7rem;
  font-weight: 400;
  margin: 0 0 10px;
}

.up-private-wall p,
.up-empty p {
  color: rgba(253,246,238,0.52);
  margin: 0 0 22px;
  line-height: 1.6;
}

.up-empty div {
  font-size: 2.8rem;
  margin-bottom: 12px;
}

/* ── Loading ── */
.up-loading {
  display: flex;
  align-items: center;
  gap: 14px;
  background: rgba(255,255,255,0.055);
  border: 1px solid rgba(255,255,255,0.12);
  border-radius: 28px;
  padding: 28px 30px;
  color: rgba(253,246,238,0.65);
}

.pulse-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--caramel-light);
  animation: pulse 1.4s ease-in-out infinite;
  flex-shrink: 0;
}

@keyframes pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50%       { opacity: 0.4; transform: scale(0.75); }
}

/* ── Responsive ── */
@media (max-width: 950px) {
  .up-main {
    margin-left: 0;
    padding: 24px 20px 60px;
  }
}

@media (max-width: 640px) {
  .up-card {
    flex-direction: column;
    align-items: center;
    text-align: center;
    padding: 26px 20px;
  }

  .up-name-row {
    flex-direction: column;
    align-items: center;
  }

  .up-stats {
    justify-content: center;
  }

  .up-emotion-badge {
    margin: 0 auto 14px;
  }
}
`;