import { useState, useEffect } from "react";
import { motion } from "framer-motion";

import api from "../utils/api.js";
import Toast from "../components/Toast.jsx";
import Sidebar from "../components/Sidebar.jsx";

export default function AdminReports() {
  const [reports, setReports] = useState([]);
  const [toast, setToast] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/admin/reports");
      setReports(response.data || []);
    } catch (err) {
      console.error("Erreur chargement signalements:", err);
      setError("Impossible de charger les signalements.");
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

  const getActionLabel = (action) => {
    if (action === "hide_post") return "Masquer le post";
    if (action === "delete_post") return "Supprimer le post";
    if (action === "hide_comment") return "Masquer le commentaire";
    if (action === "dismiss") return "Rejeter le signalement";
    return "Traiter le signalement";
  };

  const resolveReport = async (id, action) => {
    const label = getActionLabel(action);

    if (!confirm(`${label} ?`)) return;

    try {
      await api.post(`/admin/reports/${id}/resolve`, {
        action,
      });

      flash("Signalement traité");
      await load();
    } catch (err) {
      console.error("Erreur traitement signalement:", err);
      flash("Impossible de traiter ce signalement.");
    }
  };

  const getTargetBadge = (targetType) => {
    if (targetType === "post") {
      return {
        label: "Post",
        emoji: "📝",
        className: "target-post",
      };
    }

    if (targetType === "comment") {
      return {
        label: "Commentaire",
        emoji: "💬",
        className: "target-comment",
      };
    }

    return {
      label: targetType || "Contenu",
      emoji: "⚠️",
      className: "target-default",
    };
  };

  return (
    <div className="admin-reports-page">
      <style>{styles}</style>

      <div className="admin-reports-bg" />

      <Sidebar />

      <main className="admin-reports-content">
        <motion.header
          className="admin-reports-header"
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <span className="admin-tag">MoodSphere Admin</span>

          <h1>
            Gestion des <em>signalements</em>
          </h1>

          <p>
            Traite les contenus signalés par la communauté : masquer un post,
            masquer un commentaire, supprimer un contenu ou rejeter un
            signalement non justifié.
          </p>
        </motion.header>

        {error && (
          <div className="error-card">
            {error}
          </div>
        )}

        {loading && (
          <div className="loading-card">
            Chargement des signalements...
          </div>
        )}

        {!loading && (
          <motion.section
            className="reports-panel"
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
          >
            <div className="reports-panel-header">
              <div>
                <span className="section-tag">Modération</span>
                <h2>Signalements en attente</h2>
              </div>

              <div className="reports-count">
                {reports.length} signalement{reports.length > 1 ? "s" : ""}
              </div>
            </div>

            <div className="reports-list">
              {reports.map((report, index) => {
                const targetBadge = getTargetBadge(report.targetType);

                return (
                  <motion.article
                    key={report._id}
                    className="report-card"
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(index * 0.04, 0.25) }}
                  >
                    <div className="report-glow" />

                    <div className="report-header">
                      <div className="report-main">
                        <span className={`target-badge ${targetBadge.className}`}>
                          {targetBadge.emoji} {targetBadge.label}
                        </span>

                        <h3>
                          Motif : {report.reason || "Non précisé"}
                        </h3>

                        <div className="report-meta">
                          <span>
                            Par @{report.reporterUsername || "unknown"}
                          </span>

                          <span>
                            {report.createdAt
                              ? new Date(report.createdAt).toLocaleString(
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

                      <div className="report-id">
                        <span>ID cible</span>
                        <strong>{report.targetId}</strong>
                      </div>
                    </div>

                    {report.details && (
                      <div className="report-details">
                        <span>Détails</span>

                        <p>
                          {report.details}
                        </p>
                      </div>
                    )}

                    <div className="report-actions">
                      {report.targetType === "post" && (
                        <>
                          <button
                            className="action-btn hide"
                            onClick={() => resolveReport(report._id, "hide_post")}
                          >
                            🙈 Masquer le post
                          </button>

                          <button
                            className="action-btn delete"
                            onClick={() => resolveReport(report._id, "delete_post")}
                          >
                            🗑️ Supprimer
                          </button>
                        </>
                      )}

                      {report.targetType === "comment" && (
                        <button
                          className="action-btn hide"
                          onClick={() => resolveReport(report._id, "hide_comment")}
                        >
                          🙈 Masquer commentaire
                        </button>
                      )}

                      <button
                        className="action-btn dismiss"
                        onClick={() => resolveReport(report._id, "dismiss")}
                      >
                        ✓ Rejeter
                      </button>
                    </div>
                  </motion.article>
                );
              })}

              {reports.length === 0 && (
                <div className="empty-card">
                  

                  <h3>Aucun signalement en attente</h3>

                  <p>
                    Tous les signalements ont été traités. La file de
                    modération est vide.
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

.admin-reports-page {
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

.admin-reports-bg {
  position: fixed;
  inset: 0;
  background:
    radial-gradient(ellipse 80% 60% at 15% 5%, rgba(123,30,50,0.38), transparent 60%),
    radial-gradient(ellipse 60% 50% at 85% 85%, rgba(200,99,58,0.18), transparent 55%),
    radial-gradient(ellipse 50% 40% at 50% 50%, rgba(200,80,106,0.1), transparent 55%),
    #0D0608;
  z-index: 0;
}

.admin-reports-content {
  position: relative;
  z-index: 1;
  margin-left: 300px;
  padding: 42px 42px 60px;
  max-width: 1280px;
}

.admin-reports-header {
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

.admin-reports-header h1 {
  font-family: 'Playfair Display', serif;
  font-size: 2.55rem;
  font-weight: 400;
  margin: 10px 0 6px;
}

.admin-reports-header h1 em {
  color: var(--caramel-light);
}

.admin-reports-header p {
  color: rgba(253,246,238,0.58);
  max-width: 790px;
  line-height: 1.6;
  margin: 0;
}

.reports-panel,
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

.reports-panel {
  padding: 22px;
}

.reports-panel-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 18px;
}

.reports-panel-header h2 {
  font-family: 'Playfair Display', serif;
  font-size: 1.65rem;
  font-weight: 400;
  margin: 6px 0 0;
}

.reports-count {
  border: 1px solid rgba(255,100,100,0.28);
  background: rgba(255,100,100,0.07);
  color: #ffb4b4;
  border-radius: 999px;
  padding: 8px 12px;
  font-size: 0.76rem;
  font-weight: 900;
  white-space: nowrap;
}

.reports-list {
  display: grid;
  gap: 12px;
}

.report-card {
  position: relative;
  overflow: hidden;
  border-radius: 22px;
  background: rgba(255,255,255,0.045);
  border: 1px solid rgba(255,255,255,0.08);
  border-left: 3px solid var(--caramel);
  padding: 16px;
  transition: 0.25s ease;
}

.report-card:hover {
  background: rgba(255,255,255,0.07);
  border-color: rgba(232,147,106,0.22);
  border-left-color: var(--caramel-light);
  transform: translateY(-2px);
}

.report-glow {
  position: absolute;
  top: -55px;
  right: -55px;
  width: 150px;
  height: 150px;
  border-radius: 50%;
  filter: blur(58px);
  opacity: 0.16;
  pointer-events: none;
  background: var(--caramel);
}

.report-header {
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 14px;
  margin-bottom: 12px;
}

.report-main {
  min-width: 0;
}

.target-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border-radius: 999px;
  padding: 6px 10px;
  font-size: 0.74rem;
  font-weight: 900;
  margin-bottom: 9px;
  border: 1px solid rgba(255,255,255,0.1);
  background: rgba(255,255,255,0.045);
}

.target-post {
  color: #f0c477;
  border-color: rgba(240,196,119,0.25);
  background: rgba(240,196,119,0.07);
}

.target-comment {
  color: #9ecbff;
  border-color: rgba(120,180,255,0.25);
  background: rgba(120,180,255,0.07);
}

.target-default {
  color: #ffb4b4;
  border-color: rgba(255,100,100,0.25);
  background: rgba(255,100,100,0.07);
}

.report-main h3 {
  font-family: 'DM Sans', sans-serif;
  font-size: 0.98rem;
  margin: 0;
  color: var(--cream);
}

.report-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  color: rgba(253,246,238,0.42);
  font-size: 0.76rem;
  margin-top: 6px;
}

.report-id {
  max-width: 250px;
  border-radius: 16px;
  background: rgba(255,255,255,0.045);
  border: 1px solid rgba(255,255,255,0.08);
  padding: 9px 11px;
  text-align: right;
}

.report-id span {
  display: block;
  color: rgba(253,246,238,0.38);
  font-size: 0.68rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-bottom: 3px;
}

.report-id strong {
  display: block;
  color: rgba(253,246,238,0.68);
  font-size: 0.74rem;
  word-break: break-all;
}

.report-details {
  position: relative;
  border-radius: 18px;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.08);
  padding: 12px;
  margin-top: 12px;
}

.report-details span {
  display: block;
  color: var(--caramel-light);
  font-size: 0.7rem;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  margin-bottom: 6px;
}

.report-details p {
  margin: 0;
  color: rgba(253,246,238,0.68);
  font-size: 0.9rem;
  line-height: 1.6;
  white-space: pre-wrap;
}

.report-actions {
  position: relative;
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-top: 14px;
}

.action-btn {
  min-height: 38px;
  border-radius: 14px;
  padding: 0 13px;
  cursor: pointer;
  font-family: 'DM Sans', sans-serif;
  font-size: 0.78rem;
  font-weight: 900;
  transition: 0.25s ease;
}

.action-btn:hover {
  transform: translateY(-2px);
}

.action-btn.hide {
  border: 1px solid rgba(232,147,106,0.28);
  background: rgba(232,147,106,0.08);
  color: var(--caramel-light);
}

.action-btn.hide:hover {
  background: rgba(232,147,106,0.16);
  border-color: rgba(232,147,106,0.42);
}

.action-btn.delete {
  border: 1px solid rgba(255,100,100,0.22);
  background: rgba(255,100,100,0.08);
  color: #ffb4b4;
}

.action-btn.delete:hover {
  background: rgba(255,100,100,0.16);
  border-color: rgba(255,100,100,0.34);
}

.action-btn.dismiss {
  border: 1px solid rgba(255,255,255,0.12);
  background: rgba(255,255,255,0.055);
  color: rgba(253,246,238,0.7);
}

.action-btn.dismiss:hover {
  color: #9ee7b0;
  border-color: rgba(100,220,140,0.24);
  background: rgba(100,220,140,0.07);
}

.empty-card {
  text-align: center;
  padding: 52px 24px;
}

.empty-card div {
  font-size: 2.4rem;
}

.empty-card h3 {
  font-family: 'Playfair Display', serif;
  font-size: 1.6rem;
  font-weight: 400;
  margin: 10px 0 8px;
}

.empty-card p {
  color: rgba(253,246,238,0.55);
  max-width: 460px;
  margin: 0 auto;
  line-height: 1.6;
}

@media (max-width: 950px) {
  .admin-reports-content {
    margin-left: 0;
    padding: 24px;
  }

  .admin-reports-header h1 {
    font-size: 2.25rem;
  }
}

@media (max-width: 720px) {
  .admin-reports-content {
    padding: 20px;
  }

  .reports-panel {
    padding: 18px;
    border-radius: 24px;
  }

  .reports-panel-header,
  .report-header {
    flex-direction: column;
  }

  .reports-count,
  .report-id {
    width: fit-content;
    max-width: 100%;
    text-align: left;
  }

  .action-btn {
    width: 100%;
  }
}
`;