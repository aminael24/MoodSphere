import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { meta } from "../utils/emotions.js";
import NotificationBell from "./NotificationBell.jsx";
import { disconnectSocket } from "../utils/socket.js";

export default function Navbar() {
  const { user, logout } = useAuth();
  const loc = useLocation();
  const nav = useNavigate();

  if (!user) return null;

  const link = (to, label, emoji) => (
    <Link
      to={to}
      style={{
        fontFamily: "var(--font-display)",
        fontWeight: 600,
        fontSize: "0.85rem",
        padding: "7px 12px",
        borderRadius: 10,
        color: loc.pathname.startsWith(to) ? "var(--burgundy-deep)" : "var(--text-dim)",
        background: loc.pathname.startsWith(to)
          ? "linear-gradient(135deg, var(--cream), var(--sand))"
          : "transparent",
        transition: "all .25s",
        whiteSpace: "nowrap",
      }}
    >
      <span style={{ marginRight: 4 }}>{emoji}</span>{label}
    </Link>
  );

  const m = meta(user.dominantEmotion);
  const initials = (user.fullName || user.username || "?")[0].toUpperCase();

  return (
    <nav
      className="glass"
      style={{
        position: "fixed",
        top: 14,
        left: "50%",
        transform: "translateX(-50%)",
        width: "min(1240px, calc(100% - 28px))",
        zIndex: 100,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "10px 16px",
        borderRadius: 18,
        gap: 12,
      }}
    >
      <Link to="/feed" className="row gap-8" style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "1.1rem", color: "var(--cream)" }}>
        <span style={{
          width: 26, height: 26, borderRadius: "50%",
          background: "linear-gradient(135deg, var(--cream), var(--caramel))",
          boxShadow: "0 0 18px var(--caramel)",
        }} />
        MoodSphere
      </Link>

   <div className="row gap-4 hide-mobile" style={{ flexWrap: "wrap" }}>
        {user.role === "admin" ? (
          <>
            {link("/admin", "Vue d'ensemble", "📊")}
            {link("/admin/users", "Utilisateurs", "👥")}
            {link("/admin/posts", "Posts", "📝")}
            {link("/admin/reports", "Signalements", "🚩")}
          </>
        ) : (
          <>
            {link("/feed", "Feed", "🏠")}
            {link("/explore", "Explorer", "🌍")}
            {link("/rooms", "Salons", "💬")}
            {link("/journal", "Journal", "📓")}
            {link("/therapist", "AI Bot", "🤖")}
            {link("/dashboard", "Stats", "📊")}
          </>
        )}
      </div>
      <div className="row gap-8">
        {user.role !== "admin" && <NotificationBell />}
        <Link to={user.role === "admin" ? "/admin" : "/profile"} title={user.role === "admin" ? "Admin" : "Mon profil"}>
          <div className="avatar" style={{ width: 34, height: 34, fontSize: "0.85rem" }}>
            {user.profileImage
              ? <img src={user.profileImage} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%" }} />
              : initials}
          </div>
        </Link>
        <button className="btn btn-ghost btn-sm" onClick={() => { disconnectSocket(); logout(); nav("/"); }}>
          Sortir
        </button>
      </div>
    </nav>
  );
}
