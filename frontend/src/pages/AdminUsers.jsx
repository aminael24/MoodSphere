import { useState, useEffect } from "react";
import { motion } from "framer-motion";

import api from "../utils/api.js";
import Toast from "../components/Toast.jsx";
import Sidebar from "../components/Sidebar.jsx";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    try {
      setLoading(true);
      setError("");

      const query = search.trim();

      const response = await api.get(
        `/admin/users${query ? "?q=" + encodeURIComponent(query) : ""}`
      );

      setUsers(response.data || []);
    } catch (err) {
      console.error("Erreur chargement utilisateurs:", err);
      setError("Impossible de charger les utilisateurs.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      load();
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

  const flash = (message) => {
    setToast(message);

    setTimeout(() => {
      setToast("");
    }, 2000);
  };

  const updateRole = async (id, role) => {
    try {
      await api.patch(`/admin/users/${id}`, { role });

      flash("Rôle mis à jour");
      await load();
    } catch (err) {
      console.error("Erreur modification rôle:", err);
      flash("Impossible de modifier le rôle.");
    }
  };

  const deleteUser = async (id) => {
    if (!confirm("Supprimer ce compte ?")) return;

    try {
      await api.delete(`/admin/users/${id}`);

      flash("Compte supprimé");
      await load();
    } catch (err) {
      console.error("Erreur suppression utilisateur:", err);
      flash("Impossible de supprimer ce compte.");
    }
  };

  return (
    <div className="admin-users-page">
      <style>{styles}</style>

      <div className="admin-users-bg" />

      <Sidebar />

      <main className="admin-users-content">
        <motion.header
          className="admin-users-header"
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <span className="admin-tag">MoodSphere Admin</span>

          <h1>
            Gestion des <em>utilisateurs</em>
          </h1>

          <p>
            Rechercher les comptes, consulter les informations principales,
            modifier les rôles et supprimer les utilisateurs si nécessaire.
          </p>
        </motion.header>

        <motion.section
          className="search-card"
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.06 }}
        >
          <div className="search-wrapper">
            <span>🔍</span>

            <input
              className="search-input"
              placeholder="Rechercher par username, nom ou email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {search && (
            <button className="clear-search-btn" onClick={() => setSearch("")}>
              ✕
            </button>
          )}
        </motion.section>

        {error && <div className="error-card">{error}</div>}

        {loading && (
          <div className="loading-card">
            Chargement des utilisateurs...
          </div>
        )}

        {!loading && (
          <motion.section
            className="users-card"
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="users-card-header">
              <div>
                <span className="section-tag">Comptes</span>
                <h2>Liste des utilisateurs</h2>
              </div>

              <div className="users-count">
                {users.length} résultat{users.length > 1 ? "s" : ""}
              </div>
            </div>

            <div className="users-table">
              {users.map((user, index) => {
                const initial = (
                  user.fullName ||
                  user.username ||
                  user.email ||
                  "?"
                )[0].toUpperCase();

                return (
                  <motion.div
                    key={user._id}
                    className="user-row"
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(index * 0.04, 0.25) }}
                  >
                    <div className="user-main">
                      <div
                        className="user-avatar"
                        style={{
                          background:
                            user.auraColor ||
                            "linear-gradient(135deg, var(--caramel), var(--rose))",
                          boxShadow: user.auraColor
                            ? `0 0 16px ${user.auraColor}66`
                            : "none",
                        }}
                      >
                        {user.profileImage ? (
                          <img src={user.profileImage} alt="" />
                        ) : (
                          initial
                        )}
                      </div>

                      <div className="user-info">
                        <strong>
                          {user.fullName || "Sans nom"}
                        </strong>

                        <span>
                          @{user.username || "unknown"}
                        </span>

                        <small>
                          {user.email}
                        </small>
                      </div>
                    </div>

                    <div className="user-meta">
                      <span
                        className={
                          user.accountType === "private"
                            ? "account-pill private"
                            : "account-pill public"
                        }
                      >
                        {user.accountType === "private"
                          ? "🔒 Privé"
                          : "🌍 Public"}
                      </span>

                      <span className="date-text">
                        {user.createdAt
                          ? new Date(user.createdAt).toLocaleDateString(
                              "fr-FR",
                              {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              }
                            )
                          : "—"}
                      </span>
                    </div>

                    <div className="user-actions">
                      <select
                        className="role-select"
                        value={user.role}
                        onChange={(e) =>
                          updateRole(user._id, e.target.value)
                        }
                      >
                        <option value="user">user</option>
                        <option value="admin">admin</option>
                      </select>

                      <button
                        className="delete-btn"
                        onClick={() => deleteUser(user._id)}
                        title="Supprimer"
                      >
                        🗑️
                      </button>
                    </div>
                  </motion.div>
                );
              })}

              {users.length === 0 && (
                <div className="empty-card">
                  <div>👥</div>

                  <h3>Aucun utilisateur trouvé</h3>

                  <p>
                    Essaie une autre recherche ou efface le filtre actuel.
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

.admin-users-page {
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

.admin-users-bg {
  position: fixed;
  inset: 0;
  background:
    radial-gradient(ellipse 80% 60% at 15% 5%, rgba(123,30,50,0.38), transparent 60%),
    radial-gradient(ellipse 60% 50% at 85% 85%, rgba(200,99,58,0.18), transparent 55%),
    radial-gradient(ellipse 50% 40% at 50% 50%, rgba(200,80,106,0.1), transparent 55%),
    #0D0608;
  z-index: 0;
}

.admin-users-content {
  position: relative;
  z-index: 1;
  margin-left: 300px;
  padding: 42px 42px 60px;
  max-width: 1280px;
}

.admin-users-header {
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

.admin-users-header h1 {
  font-family: 'Playfair Display', serif;
  font-size: 2.55rem;
  font-weight: 400;
  margin: 10px 0 6px;
}

.admin-users-header h1 em {
  color: var(--caramel-light);
}

.admin-users-header p {
  color: rgba(253,246,238,0.58);
  max-width: 760px;
  line-height: 1.6;
  margin: 0;
}

.search-card,
.users-card,
.loading-card,
.error-card,
.empty-card {
  background: rgba(255,255,255,0.055);
  border: 1px solid rgba(255,255,255,0.12);
  backdrop-filter: blur(22px);
  box-shadow: 0 22px 62px rgba(0,0,0,0.38);
  border-radius: 26px;
}

.search-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px;
  margin-bottom: 20px;
}

.search-wrapper {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 10px;
  min-height: 48px;
  border-radius: 18px;
  background: rgba(255,255,255,0.055);
  border: 1px solid rgba(255,255,255,0.1);
  padding: 0 15px;
}

.search-wrapper span {
  opacity: 0.7;
}

.search-input {
  flex: 1;
  height: 46px;
  border: none;
  outline: none;
  background: transparent;
  color: var(--cream);
  font-family: 'DM Sans', sans-serif;
  font-size: 0.92rem;
}

.search-input::placeholder {
  color: rgba(253,246,238,0.38);
}

.clear-search-btn {
  width: 44px;
  height: 44px;
  border-radius: 16px;
  border: 1px solid rgba(255,255,255,0.12);
  background: rgba(255,255,255,0.06);
  color: rgba(253,246,238,0.72);
  cursor: pointer;
  font-weight: 900;
}

.clear-search-btn:hover {
  color: #ffb4b4;
  border-color: rgba(255,100,100,0.28);
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

.users-card {
  padding: 22px;
}

.users-card-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 18px;
}

.users-card-header h2 {
  font-family: 'Playfair Display', serif;
  font-size: 1.65rem;
  font-weight: 400;
  margin: 6px 0 0;
}

.users-count {
  border: 1px solid rgba(232,147,106,0.32);
  background: rgba(232,147,106,0.08);
  color: var(--caramel-light);
  border-radius: 999px;
  padding: 8px 12px;
  font-size: 0.76rem;
  font-weight: 900;
  white-space: nowrap;
}

.users-table {
  display: grid;
  gap: 10px;
}

.user-row {
  display: grid;
  grid-template-columns: minmax(260px, 1.4fr) minmax(180px, 0.7fr) auto;
  align-items: center;
  gap: 14px;
  padding: 14px;
  border-radius: 20px;
  background: rgba(255,255,255,0.045);
  border: 1px solid rgba(255,255,255,0.08);
  transition: 0.25s ease;
}

.user-row:hover {
  background: rgba(255,255,255,0.07);
  border-color: rgba(232,147,106,0.22);
  transform: translateY(-2px);
}

.user-main {
  display: flex;
  align-items: center;
  gap: 13px;
  min-width: 0;
}

.user-avatar {
  width: 46px;
  height: 46px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  overflow: hidden;
  color: var(--cream);
  font-weight: 900;
  flex-shrink: 0;
  text-transform: uppercase;
}

.user-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.user-info {
  min-width: 0;
}

.user-info strong {
  display: block;
  color: var(--cream);
  font-size: 0.94rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-info span {
  display: block;
  color: rgba(253,246,238,0.48);
  font-size: 0.8rem;
  margin-top: 2px;
}

.user-info small {
  display: block;
  color: rgba(253,246,238,0.36);
  font-size: 0.76rem;
  margin-top: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-meta {
  display: flex;
  align-items: center;
  gap: 9px;
  flex-wrap: wrap;
}

.account-pill {
  border-radius: 999px;
  padding: 6px 10px;
  font-size: 0.74rem;
  font-weight: 850;
  border: 1px solid rgba(255,255,255,0.1);
  background: rgba(255,255,255,0.045);
}

.account-pill.public {
  color: #9ee7b0;
  border-color: rgba(100,220,140,0.24);
}

.account-pill.private {
  color: #f0c477;
  border-color: rgba(240,196,119,0.24);
}

.date-text {
  color: rgba(253,246,238,0.38);
  font-size: 0.76rem;
}

.user-actions {
  display: flex;
  align-items: center;
  gap: 9px;
  justify-content: flex-end;
}

.role-select {
  height: 40px;
  border-radius: 14px;
  border: 1px solid rgba(255,255,255,0.12);
  background: rgba(255,255,255,0.065);
  color: var(--cream);
  padding: 0 10px;
  outline: none;
  font-family: 'DM Sans', sans-serif;
  font-weight: 800;
  cursor: pointer;
}

.role-select option {
  color: #0D0608;
}

.role-select:focus {
  border-color: rgba(232,147,106,0.55);
  box-shadow: 0 0 0 3px rgba(232,147,106,0.08);
}

.delete-btn {
  width: 40px;
  height: 40px;
  border-radius: 14px;
  border: 1px solid rgba(255,100,100,0.18);
  background: rgba(255,100,100,0.07);
  color: #ffb4b4;
  cursor: pointer;
  transition: 0.25s ease;
}

.delete-btn:hover {
  background: rgba(255,100,100,0.16);
  border-color: rgba(255,100,100,0.32);
  transform: translateY(-2px);
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

@media (max-width: 1050px) {
  .user-row {
    grid-template-columns: 1fr;
    align-items: start;
  }

  .user-actions {
    justify-content: flex-start;
  }
}

@media (max-width: 950px) {
  .admin-users-content {
    margin-left: 0;
    padding: 24px;
  }

  .admin-users-header h1 {
    font-size: 2.25rem;
  }
}

@media (max-width: 620px) {
  .admin-users-content {
    padding: 20px;
  }

  .users-card,
  .search-card {
    border-radius: 24px;
  }

  .search-card {
    align-items: stretch;
  }

  .users-card-header {
    flex-direction: column;
  }

  .users-count {
    width: fit-content;
  }

  .user-row {
    padding: 13px;
  }

  .user-main {
    align-items: flex-start;
  }

  .user-actions {
    width: 100%;
  }

  .role-select {
    flex: 1;
  }
}
`;