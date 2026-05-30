import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import api from "../utils/api.js";

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [unread, setUnread] = useState(0);
  const ref = useRef(null);

  const load = async () => {
    try {
      const r = await api.get("/notifications");
      setItems(r.data.notifications || []);
      setUnread(r.data.unreadCount || 0);
    } catch (_) {}
  };

  useEffect(() => {
    load();
    const t = setInterval(load, 30000); // refresh toutes les 30s
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const onClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    if (open) document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [open]);

  const markAll = async () => {
    await api.post("/notifications/read-all");
    setUnread(0);
    setItems(items.map((n) => ({ ...n, isRead: true })));
  };

  const iconFor = (type) => ({
    follow: "👤",
    follow_request: "📩",
    follow_accepted: "✓",
    like: "❤️",
    comment: "💬",
    badge: "🏆",
    system: "🔔",
  }[type] || "🔔");

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        onClick={() => setOpen(!open)}
        className="btn btn-ghost btn-sm"
        style={{ position: "relative", padding: "8px 10px" }}
        title="Notifications"
      >
        🔔
        {unread > 0 && (
          <span style={{
            position: "absolute", top: -3, right: -3,
            minWidth: 18, height: 18, borderRadius: 10,
            background: "var(--motivated, #C8633A)",
            color: "white", fontSize: "0.7rem", fontWeight: 700,
            display: "grid", placeItems: "center",
            padding: "0 5px",
            boxShadow: "0 0 8px rgba(200,99,58,0.6)",
          }}>
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="glass"
            style={{
              position: "absolute",
              top: "calc(100% + 8px)",
              right: 0,
              width: 340,
              padding: 14,
              maxHeight: 480,
              overflowY: "auto",
              zIndex: 200,
            }}
          >
            <div className="row" style={{ justifyContent: "space-between", marginBottom: 10 }}>
              <strong>Notifications</strong>
              {unread > 0 && (
                <button onClick={markAll} className="text-dim" style={{ fontSize: "0.78rem", background: "none", border: "none", cursor: "pointer" }}>
                  Tout marquer lu
                </button>
              )}
            </div>
            {items.length === 0 ? (
              <p className="text-dim" style={{ fontSize: "0.85rem", padding: "20px 0", textAlign: "center" }}>
                Aucune notification pour l'instant.
              </p>
            ) : (
              items.map((n) => (
                <Link
                  key={n._id}
                  to={n.link || "#"}
                  onClick={() => setOpen(false)}
                  className="row gap-12"
                  style={{
                    padding: "10px 8px",
                    borderRadius: 10,
                    background: n.isRead ? "transparent" : "rgba(156,121,97,0.1)",
                    marginBottom: 4,
                    textDecoration: "none",
                    color: "inherit",
                  }}
                >
                  <span style={{ fontSize: "1.2rem" }}>{iconFor(n.type)}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: "0.85rem", lineHeight: 1.4 }}>{n.message}</div>
                    <div className="text-dim" style={{ fontSize: "0.72rem", marginTop: 2 }}>
                      {new Date(n.createdAt).toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" })}
                    </div>
                  </div>
                  {!n.isRead && <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--caramel)" }} />}
                </Link>
              ))
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
