import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../utils/api.js";
import Sidebar from "../components/Sidebar.jsx";

const NOTIF_ICONS = {
  like: "❤️",
  comment: "💬",
  follow: "👤",
  follow_accepted: "✅",
  follow_request: "🔔",
  badge: "🏅",
  system: "🔔",
  default: "🔔",
};

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const loadNotifications = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await api.get("/notifications");

      setNotifications(res.data.notifications || []);
      setUnreadCount(res.data.unreadCount || 0);
    } catch (err) {
      console.error("Erreur notifications :", err);
      setError(
        err.response?.data?.message ||
          "Impossible de charger les notifications."
      );
    } finally {
      setLoading(false);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.post("/notifications/read-all");

      setNotifications((prev) =>
        prev.map((n) => ({
          ...n,
          isRead: true,
        }))
      );

      setUnreadCount(0);
    } catch (err) {
      console.error("Erreur mark all read :", err);
    }
  };

  const scrollToHash = (hash) => {
    if (!hash) return;

    let tries = 0;

    const tryScroll = () => {
      tries += 1;

      const el = document.getElementById(hash);

      if (el) {
        el.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });

        el.classList.add("post-highlight");

        setTimeout(() => {
          el.classList.remove("post-highlight");
        }, 2400);

        return;
      }

      if (tries < 12) {
        setTimeout(tryScroll, 250);
      }
    };

    setTimeout(tryScroll, 350);
  };

const goToNotificationLink = (link) => {
  console.log("🔔 [Notif] Click. Link reçu:", link);
  const finalLink = link || "/feed";

  if (finalLink.includes("#")) {
    const [path, hash] = finalLink.split("#");
    const targetPath = path || "/feed";
    console.log("🔔 [Notif] path:", targetPath, "| hash:", hash);

    if (window.location.pathname === targetPath) {
      console.log("🔔 [Notif] Déjà sur la page, scroll direct");
      scrollToHash(hash);
    } else {
      console.log("🔔 [Notif] Navigation vers", targetPath, "avec state.scrollTo =", hash);
      navigate(targetPath, { state: { scrollTo: hash } });
    }
    return;
  }

  console.log("🔔 [Notif] Pas de # dans le link, navigate simple vers", finalLink);
  navigate(finalLink);
};

  const handleClick = async (notif) => {
    try {
      if (!notif.isRead) {
        await api.post(`/notifications/${notif._id}/read`);

        setNotifications((prev) =>
          prev.map((n) =>
            n._id === notif._id
              ? {
                  ...n,
                  isRead: true,
                }
              : n
          )
        );

        setUnreadCount((prev) => Math.max(prev - 1, 0));
      }

      goToNotificationLink(notif.link);
    } catch (err) {
      console.error("Erreur notification click :", err);
      goToNotificationLink(notif.link);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const unread = notifications.filter((n) => !n.isRead);
  const read = notifications.filter((n) => n.isRead);

  return (
    <div className="notif-page">
      <style>{styles}</style>

      <div className="notif-bg" />

      <Sidebar />

      <main className="notif-main">
        <motion.div
          className="notif-header"
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div>
            <span className="notif-tag">Centre d'activité</span>

            <h1>
              Notifi<em>cations</em>
            </h1>

            <p>
              Likes, commentaires, abonnements et demandes de suivi apparaissent
              ici.
            </p>
          </div>

          {unreadCount > 0 && (
            <motion.button
              className="mark-all-btn"
              onClick={markAllAsRead}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
            >
              ✓ Tout marquer comme lu
              <span className="unread-badge">{unreadCount}</span>
            </motion.button>
          )}
        </motion.div>

        {loading && (
          <div className="notif-card notif-loading">
            <span className="pulse-dot" />
            Chargement des notifications...
          </div>
        )}

        {!loading && error && (
          <div className="notif-card notif-error">⚠️ {error}</div>
        )}

        {!loading && !error && notifications.length === 0 && (
          <motion.div
            className="notif-card notif-empty"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="empty-icon">🌙</div>
            <h3>Tout est calme ici</h3>
            <p>
              Tu n'as pas encore d'activité récente. Interagis avec d'autres
              utilisateurs pour recevoir des notifications.
            </p>
          </motion.div>
        )}

        {!loading && !error && unread.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
          >
            <div className="section-label">
              <span>Nouvelles</span>
              <span className="count-pill">{unread.length}</span>
            </div>

            <div className="notif-list">
              {unread.map((notif, i) => (
                <NotifCard
                  key={notif._id}
                  notif={notif}
                  index={i}
                  onClick={handleClick}
                />
              ))}
            </div>
          </motion.section>
        )}

        {!loading && !error && read.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="section-label muted-label">
              <span>Déjà lues</span>
            </div>

            <div className="notif-list">
              {read.map((notif, i) => (
                <NotifCard
                  key={notif._id}
                  notif={notif}
                  index={i}
                  onClick={handleClick}
                />
              ))}
            </div>
          </motion.section>
        )}
      </main>
    </div>
  );
}

function NotifCard({ notif, index, onClick }) {
  const icon = NOTIF_ICONS[notif.type] || NOTIF_ICONS.default;
  const initiale = notif.senderUsername?.charAt(0)?.toUpperCase() || "M";

  return (
    <motion.button
      type="button"
      className={`notif-item ${notif.isRead ? "is-read" : "is-unread"}`}
      onClick={() => onClick(notif)}
      initial={{ opacity: 0, x: -14 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.04 }}
      whileHover={{ x: 4 }}
    >
      <div className="ni-avatar">
        {notif.senderImage ? (
          <img
            src={notif.senderImage}
            alt={notif.senderUsername || "Utilisateur"}
          />
        ) : (
          <span>{initiale}</span>
        )}

        <span className="ni-type-icon">{icon}</span>
      </div>

      <div className="ni-body">
        <p className="ni-message">{notif.message}</p>

        <small className="ni-time">
          {notif.createdAt ? timeAgo(notif.createdAt) : ""}
        </small>
      </div>

      {!notif.isRead && <span className="ni-dot" />}
    </motion.button>
  );
}

function timeAgo(dateStr) {
  const diff = (Date.now() - new Date(dateStr)) / 1000;

  if (diff < 60) return "À l'instant";
  if (diff < 3600) return `Il y a ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `Il y a ${Math.floor(diff / 3600)} h`;

  return new Date(dateStr).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
  });
}

const styles = `
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400;1,600&family=DM+Sans:wght@300;400;500;600;700&display=swap');

.notif-page {
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

.notif-bg {
  position: fixed;
  inset: 0;
  background:
    radial-gradient(ellipse 80% 60% at 15% 5%, rgba(123,30,50,0.38), transparent 60%),
    radial-gradient(ellipse 60% 50% at 85% 85%, rgba(200,99,58,0.18), transparent 55%),
    #0D0608;
  z-index: 0;
}

.notif-main {
  position: relative;
  z-index: 1;
  margin-left: 298px;
  padding: 48px 42px 80px;
  max-width: 860px;
}

.notif-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20px;
  flex-wrap: wrap;
  margin-bottom: 36px;
}

.notif-tag {
  color: var(--caramel-light);
  text-transform: uppercase;
  letter-spacing: 0.18em;
  font-size: 0.72rem;
  font-weight: 800;
}

.notif-header h1 {
  font-family: 'Playfair Display', serif;
  font-size: 2.8rem;
  font-weight: 400;
  margin: 10px 0 8px;
  line-height: 1.1;
}

.notif-header h1 em {
  color: var(--caramel-light);
  font-style: italic;
}

.notif-header p {
  color: rgba(253,246,238,0.55);
  max-width: 480px;
  line-height: 1.65;
  margin: 0;
}

.mark-all-btn {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 22px;
  border-radius: 999px;
  border: 1px solid rgba(232,147,106,0.35);
  background: rgba(200,99,58,0.12);
  color: var(--caramel-light);
  font-family: 'DM Sans', sans-serif;
  font-weight: 700;
  font-size: 0.88rem;
  cursor: pointer;
  white-space: nowrap;
  transition: 0.25s ease;
  margin-top: 14px;
}

.mark-all-btn:hover {
  background: rgba(200,99,58,0.22);
  border-color: rgba(232,147,106,0.6);
}

.unread-badge {
  background: linear-gradient(135deg, var(--caramel), var(--rose));
  color: var(--cream);
  border-radius: 999px;
  padding: 2px 9px;
  font-size: 0.75rem;
  font-weight: 800;
}

.section-label {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 14px;
  font-size: 0.78rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.14em;
  color: var(--caramel-light);
}

.muted-label {
  color: rgba(253,246,238,0.35);
  margin-top: 30px;
}

.count-pill {
  background: rgba(232,147,106,0.2);
  color: var(--caramel-light);
  border-radius: 999px;
  padding: 2px 9px;
  font-size: 0.74rem;
}

.notif-list {
  display: grid;
  gap: 10px;
  margin-bottom: 8px;
}

.notif-item {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 20px;
  border-radius: 22px;
  border: 1px solid rgba(255,255,255,0.09);
  background: rgba(255,255,255,0.04);
  backdrop-filter: blur(18px);
  color: var(--cream);
  text-align: left;
  cursor: pointer;
  transition: all 0.25s ease;
  position: relative;
}

.notif-item.is-unread {
  background: rgba(200,99,58,0.09);
  border-color: rgba(232,147,106,0.22);
  box-shadow: 0 8px 30px rgba(200,99,58,0.1);
}

.notif-item:hover {
  background: rgba(255,255,255,0.075);
  border-color: rgba(232,147,106,0.3);
  box-shadow: 0 16px 45px rgba(0,0,0,0.3);
}

.ni-avatar {
  position: relative;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  flex-shrink: 0;
  background: linear-gradient(135deg, var(--caramel), var(--rose));
  display: grid;
  place-items: center;
  font-weight: 800;
  font-size: 1.1rem;
  overflow: visible;
}

.ni-avatar img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
}

.ni-type-icon {
  position: absolute;
  bottom: -4px;
  right: -4px;
  font-size: 0.9rem;
  background: #0D0608;
  border-radius: 50%;
  width: 22px;
  height: 22px;
  display: grid;
  place-items: center;
  border: 1px solid rgba(255,255,255,0.12);
}

.ni-body {
  flex: 1;
  min-width: 0;
}

.ni-message {
  font-size: 0.92rem;
  line-height: 1.5;
  margin: 0 0 4px;
  color: var(--cream);
}

.ni-time {
  font-size: 0.76rem;
  color: rgba(253,246,238,0.42);
}

.ni-dot {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--caramel-light), var(--rose));
  flex-shrink: 0;
  box-shadow: 0 0 8px rgba(232,147,106,0.6);
}

.notif-card {
  background: rgba(255,255,255,0.055);
  border: 1px solid rgba(255,255,255,0.12);
  backdrop-filter: blur(22px);
  box-shadow: 0 28px 80px rgba(0,0,0,0.45);
  border-radius: 28px;
  padding: 28px 30px;
  margin-bottom: 20px;
}

.notif-loading {
  display: flex;
  align-items: center;
  gap: 14px;
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
  50% { opacity: 0.4; transform: scale(0.75); }
}

.notif-error {
  color: #ffb4b4;
  border-color: rgba(255,100,100,0.28);
}

.notif-empty {
  text-align: center;
  padding: 56px 30px;
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 12px;
}

.notif-empty h3 {
  font-family: 'Playfair Display', serif;
  font-size: 1.8rem;
  font-weight: 400;
  margin: 0 0 10px;
}

.notif-empty p {
  color: rgba(253,246,238,0.52);
  max-width: 400px;
  margin: 0 auto;
  line-height: 1.65;
}

.post-highlight {
  animation: postHighlight 2.4s ease;
  border-color: rgba(232, 147, 106, 0.75) !important;
  box-shadow:
    0 0 0 4px rgba(232, 147, 106, 0.16),
    0 0 38px rgba(232, 147, 106, 0.35) !important;
}

@keyframes postHighlight {
  0% {
    transform: scale(0.98);
  }

  25% {
    transform: scale(1.015);
  }

  100% {
    transform: scale(1);
  }
}

@media (max-width: 950px) {
  .notif-main {
    margin-left: 0;
    padding: 24px 20px 60px;
  }

  .notif-header h1 {
    font-size: 2.2rem;
  }

  .mark-all-btn {
    margin-top: 0;
  }
}

@media (max-width: 520px) {
  .notif-item {
    padding: 14px 16px;
    gap: 12px;
  }

  .ni-avatar {
    width: 42px;
    height: 42px;
  }
}
`;