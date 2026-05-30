import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../utils/api.js";

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const loadNotifications = async () => {
    try {
      const res = await api.get("/notifications");

      setNotifications(res.data.notifications || []);
      setUnreadCount(res.data.unreadCount || 0);
    } catch (err) {
      console.error("Erreur notifications :", err);
    } finally {
      setLoading(false);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.post("/notifications/read-all");
      await loadNotifications();
    } catch (err) {
      console.error("Erreur mark all read :", err);
    }
  };

  const markOneAsRead = async (id) => {
    try {
      await api.post(`/notifications/${id}/read`);
      await loadNotifications();
    } catch (err) {
      console.error("Erreur mark read :", err);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  return (
    <main className="main-content">
      <section className="glass-card notifications-page">
        <div className="notifications-header">
          <div>
            <span className="section-kicker">Centre d’activité</span>
            <h1>Notifications</h1>
            <p>
              Likes, commentaires, abonnements et demandes de suivi apparaissent ici.
            </p>
          </div>

          {unreadCount > 0 && (
            <button className="btn-primary small" onClick={markAllAsRead}>
              Tout marquer comme lu
            </button>
          )}
        </div>

        {loading && <p className="muted">Chargement...</p>}

        {!loading && notifications.length === 0 && (
          <div className="empty-state">
            <h3>Aucune notification</h3>
            <p>Tu n’as pas encore d’activité récente.</p>
          </div>
        )}

        <div className="notifications-list">
          {notifications.map((notif) => (
            <Link
              key={notif._id}
              to={notif.link || "/feed"}
              className={`notification-card ${notif.isRead ? "read" : "unread"}`}
              onClick={() => {
                if (!notif.isRead) markOneAsRead(notif._id);
              }}
            >
              <div className="notification-avatar">
                {notif.senderImage ? (
                  <img src={notif.senderImage} alt={notif.senderUsername} />
                ) : (
                  <span>
                    {notif.senderUsername?.charAt(0)?.toUpperCase() || "M"}
                  </span>
                )}
              </div>

              <div className="notification-body">
                <p>{notif.message}</p>
                <small>{new Date(notif.createdAt).toLocaleString()}</small>
              </div>

              {!notif.isRead && <span className="notification-dot" />}
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}