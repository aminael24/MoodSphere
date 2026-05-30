import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const logoSrc = "/logo.png";

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const userLinks = [
    { to: "/feed", label: "Feed" },
    { to: "/explore", label: "Explorer" },
    { to: "/rooms", label: "Salons" },
    { to: "/journal", label: "Journal" },
    { to: "/therapist", label: "AI Bot" },
    { to: "/badges", label: "Badges" },
    { to: "/profile", label: "Profil" },
  ];

  const adminLinks = [
    { to: "/admin", label: "Vue d'ensemble" },
    { to: "/admin/users", label: "Utilisateurs" },
    { to: "/admin/posts", label: "Posts" },
    { to: "/admin/reports", label: "Signalements" },
        { to: "/admin/dashboard", label: "Statistiques" },

  ];

  const links = user.role === "admin" ? adminLinks : userLinks;

  return (
    <>
      <style>{sidebarStyles}</style>

      <aside className="ms-sidebar">
        <Link
          to={user.role === "admin" ? "/admin" : "/feed"}
          className="ms-sidebar-logo"
        >
          <img
            src={logoSrc}
            alt="MoodSphere"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
          <span>MoodSphere</span>
        </Link>

        <nav className="ms-sidebar-menu">
          {links.map((link) => (
            <NavLink key={link.to} to={link.to} end>
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="ms-sidebar-user-card">
          <div className="ms-user-top">
            <div className="ms-user-avatar">
              {user.profileImage ? (
                <img src={user.profileImage} alt="Profil" />
              ) : (
                user.fullName?.[0] || user.username?.[0] || "U"
              )}
            </div>

            <div className="ms-user-info">
              <strong>{user.fullName || user.username || "Utilisateur"}</strong>
              <span>{user.email}</span>
            </div>
          </div>

          <button className="ms-logout-text" onClick={handleLogout}>
            ← Se déconnecter
          </button>
        </div>
      </aside>
    </>
  );
}

const sidebarStyles = `
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400;1,600&family=DM+Sans:wght@300;400;500;600;700&display=swap');

.ms-sidebar {
  position: fixed;
  left: 24px;
  top: 24px;
  bottom: 24px;
  width: 250px;
  z-index: 100;
  padding: 24px;
  border-radius: 30px;
  background: rgba(255,255,255,0.055);
  border: 1px solid rgba(255,255,255,0.12);
  backdrop-filter: blur(22px);
  box-shadow: 0 28px 80px rgba(0,0,0,0.45);
  display: flex;
  flex-direction: column;
  font-family: 'DM Sans', sans-serif;
}

.ms-sidebar-logo {
  display: flex;
  align-items: center;
  gap: 12px;
  text-decoration: none;
  margin-bottom: 34px;
}

.ms-sidebar-logo img {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
  box-shadow: 0 0 25px rgba(232,147,106,0.45);
}

.ms-sidebar-logo span {
  font-family: 'Playfair Display', serif;
  font-size: 1.35rem;
  font-weight: 700;
  background: linear-gradient(135deg, #FDF6EE, #E8936A);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.ms-sidebar-menu {
  display: grid;
  gap: 10px;
}

.ms-sidebar-menu a {
  color: rgba(253,246,238,0.65);
  text-decoration: none;
  padding: 12px 14px;
  border-radius: 16px;
  font-weight: 700;
  transition: 0.25s ease;
}

.ms-sidebar-menu a:hover,
.ms-sidebar-menu a.active {
  color: #FDF6EE;
  background: linear-gradient(135deg, rgba(200,99,58,0.25), rgba(200,80,106,0.16));
  border: 1px solid rgba(232,147,106,0.22);
}

.ms-sidebar-user-card {
  margin-top: auto;
  width: 100%;
  padding: 14px;
  border-radius: 22px;
  background: rgba(255,255,255,0.055);
  border: 1px solid rgba(255,255,255,0.1);
  display: flex;
  flex-direction: column;
}

.ms-user-top {
  display: flex;
  align-items: center;
  gap: 12px;
}

.ms-user-avatar {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  overflow: hidden;
  display: grid;
  place-items: center;
  background: linear-gradient(135deg, #C8633A, #C8506A);
  color: #FDF6EE;
  font-weight: 800;
  flex-shrink: 0;
}

.ms-user-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.ms-user-info {
  flex: 1;
  min-width: 0;
}

.ms-user-info strong {
  display: block;
  font-size: 0.9rem;
  color: #FDF6EE;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.ms-user-info span {
  display: block;
  font-size: 0.74rem;
  color: rgba(253,246,238,0.45);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.ms-logout-text {
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

.ms-logout-text:hover {
  color: #ffd0c8;
  background: transparent;
  transform: translateX(-2px);
}

@media (max-width: 950px) {
  .ms-sidebar {
    position: relative;
    width: auto;
    left: auto;
    top: auto;
    bottom: auto;
    margin: 18px;
  }
}
`;