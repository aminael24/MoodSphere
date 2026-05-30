import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";

import api from "../utils/api.js";
import Sidebar from "../components/Sidebar.jsx";
import { meta } from "../utils/emotions.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

export default function AdminOverview() {
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadOverview = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/admin/overview");
      setOverview(response.data);
    } catch (err) {
      console.error("Erreur admin overview:", err);
      setError("Impossible de charger les statistiques administrateur.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOverview();
  }, []);

  const getChartData = () => {
    if (!overview?.emotionsByDay?.length) {
      return {
        labels: [],
        datasets: [],
      };
    }

    const days = [
      ...new Set(overview.emotionsByDay.map((item) => item._id.day)),
    ].sort();

    const emotions = [
      ...new Set(overview.emotionsByDay.map((item) => item._id.emotion)),
    ];

    return {
      labels: days,
      datasets: emotions.map((emotionKey) => ({
        label: meta(emotionKey).label,
        data: days.map((day) => {
          const found = overview.emotionsByDay.find(
            (item) => item._id.day === day && item._id.emotion === emotionKey
          );

          return found ? found.count : 0;
        }),
        backgroundColor: meta(emotionKey).color,
        borderRadius: 7,
        borderSkipped: false,
      })),
    };
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: "rgba(253,246,238,0.62)",
          font: {
            family: "DM Sans",
            size: 12,
          },
          usePointStyle: true,
          pointStyle: "circle",
          padding: 14,
        },
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            return ` ${context.dataset.label} : ${context.parsed.y} post(s)`;
          },
        },
      },
    },
    scales: {
      x: {
        stacked: true,
        ticks: {
          color: "rgba(253,246,238,0.55)",
          font: {
            family: "DM Sans",
          },
        },
        grid: {
          display: false,
        },
      },
      y: {
        stacked: true,
        ticks: {
          color: "rgba(253,246,238,0.55)",
          precision: 0,
        },
        grid: {
          color: "rgba(255,237,218,0.05)",
        },
      },
    },
  };

  const statsCards = overview
    ? [
        {
          label: "Utilisateurs",
          value: overview.counts?.users || 0,
          emoji: "👥",
          hint: "Comptes inscrits",
        },
        {
          label: "Posts",
          value: overview.counts?.posts || 0,
          emoji: "📝",
          hint: "Publications créées",
        },
        {
          label: "Journals",
          value: overview.counts?.journals || 0,
          emoji: "📓",
          hint: "Entrées privées",
        },
        {
          label: "Messages bot",
          value: overview.counts?.chatMsgs || 0,
          emoji: "🤖",
          hint: "Interactions avec l’IA",
        },
        {
          label: "Posts masqués",
          value: overview.counts?.hiddenPosts || 0,
          emoji: "🙈",
          hint: "Contenus modérés",
        },
        {
          label: "Signalements",
          value: overview.counts?.pendingReports || 0,
          emoji: "🚩",
          hint: "En attente de traitement",
        },
      ]
    : [];

  return (
    <div className="admin-page">
      <style>{styles}</style>

      <div className="admin-bg" />

      <Sidebar />

      <main className="admin-content">
        <motion.header
          className="admin-header"
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <span className="admin-tag">MoodSphere Admin</span>

          <h1>
            Vue <em>d’ensemble</em>
          </h1>

          <p>
            Statistiques globales de la plateforme : utilisateurs, publications,
            journaux, conversations IA, contenus masqués et signalements.
          </p>
        </motion.header>

        {loading && (
          <div className="loading-card">
            Chargement des statistiques administrateur...
          </div>
        )}

        {error && (
          <div className="error-card">
            {error}
          </div>
        )}

        {!loading && overview && (
          <>
            <section className="stats-grid">
              {statsCards.map((stat, index) => (
                <motion.article
                  key={stat.label}
                  className={
                    stat.label === "Signalements" && stat.value > 0
                      ? "stat-card alert"
                      : "stat-card"
                  }
                  initial={{ opacity: 0, y: 22 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <div className="stat-icon">
                    {stat.emoji}
                  </div>

                  <div className="stat-value">
                    {stat.value}
                  </div>

                  <div className="stat-label">
                    {stat.label}
                  </div>

                  <p>
                    {stat.hint}
                  </p>
                </motion.article>
              ))}
            </section>

            <motion.section
              className="chart-card"
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.12 }}
            >
              <div className="section-title">
                <div>
                  <span>Analyse 7 jours</span>
                  <h2>Tendance émotionnelle</h2>
                </div>

                <div className="chart-pill">
                  Graphique empilé
                </div>
              </div>

              {overview.emotionsByDay?.length === 0 ? (
                <div className="empty-card">
                  <div>📊</div>

                  <h3>Pas de données récentes</h3>

                  <p>
                    Les tendances émotionnelles apparaîtront ici dès que la
                    communauté publiera plus de contenus.
                  </p>
                </div>
              ) : (
                <div className="chart-wrapper">
                  <Bar data={getChartData()} options={chartOptions} />
                </div>
              )}
            </motion.section>
          </>
        )}
      </main>
    </div>
  );
}

const styles = `
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400;1,600&family=DM+Sans:wght@300;400;500;600;700&display=swap');

.admin-page {
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

.admin-bg {
  position: fixed;
  inset: 0;
  background:
    radial-gradient(ellipse 80% 60% at 15% 5%, rgba(123,30,50,0.38), transparent 60%),
    radial-gradient(ellipse 60% 50% at 85% 85%, rgba(200,99,58,0.18), transparent 55%),
    radial-gradient(ellipse 50% 40% at 50% 50%, rgba(200,80,106,0.1), transparent 55%),
    #0D0608;
  z-index: 0;
}

.admin-content {
  position: relative;
  z-index: 1;
  margin-left: 300px;
  padding: 42px 42px 60px;
  max-width: 1280px;
}

.admin-header {
  margin-bottom: 22px;
}

.admin-tag,
.section-title span {
  color: var(--caramel-light);
  text-transform: uppercase;
  letter-spacing: 0.18em;
  font-size: 0.7rem;
  font-weight: 800;
}

.admin-header h1 {
  font-family: 'Playfair Display', serif;
  font-size: 2.55rem;
  font-weight: 400;
  margin: 10px 0 6px;
}

.admin-header h1 em {
  color: var(--caramel-light);
}

.admin-header p {
  color: rgba(253,246,238,0.58);
  max-width: 760px;
  line-height: 1.6;
  margin: 0;
}

/* 3 cartes en haut + 3 cartes en bas */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

.stat-card,
.chart-card,
.loading-card,
.error-card,
.empty-card {
  background: rgba(255,255,255,0.055);
  border: 1px solid rgba(255,255,255,0.12);
  backdrop-filter: blur(22px);
  box-shadow: 0 22px 62px rgba(0,0,0,0.38);
  border-radius: 24px;
}

.stat-card {
  position: relative;
  overflow: hidden;
  padding: 16px 18px;
  min-height: 125px;
}

.stat-card::after {
  content: "";
  position: absolute;
  top: -50px;
  right: -50px;
  width: 115px;
  height: 115px;
  border-radius: 50%;
  background: rgba(232,147,106,0.11);
  filter: blur(42px);
  pointer-events: none;
}

.stat-card.alert {
  border-color: rgba(255,100,100,0.28);
}

.stat-card.alert::after {
  background: rgba(255,100,100,0.14);
}

.stat-icon {
  position: relative;
  font-size: 1.45rem;
  margin-bottom: 4px;
}

.stat-value {
  position: relative;
  font-family: 'Playfair Display', serif;
  font-size: 1.75rem;
  font-weight: 700;
  line-height: 1;
}

.stat-label {
  position: relative;
  color: rgba(253,246,238,0.72);
  font-weight: 800;
  font-size: 0.84rem;
  margin-top: 5px;
}

.stat-card p {
  position: relative;
  color: rgba(253,246,238,0.44);
  font-size: 0.74rem;
  line-height: 1.4;
  margin: 6px 0 0;
}

.chart-card {
  padding: 22px 26px 26px;
  border-radius: 26px;
}

.section-title {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 14px;
}

.section-title h2 {
  font-family: 'Playfair Display', serif;
  font-size: 1.55rem;
  font-weight: 400;
  margin: 5px 0 0;
}

.chart-pill {
  border: 1px solid rgba(232,147,106,0.32);
  background: rgba(232,147,106,0.08);
  color: var(--caramel-light);
  border-radius: 999px;
  padding: 7px 12px;
  font-size: 0.74rem;
  font-weight: 900;
  white-space: nowrap;
}

.chart-wrapper {
  height: 310px;
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

.empty-card {
  text-align: center;
  padding: 44px 24px;
}

.empty-card div {
  font-size: 2.2rem;
}

.empty-card h3 {
  font-family: 'Playfair Display', serif;
  font-size: 1.55rem;
  font-weight: 400;
  margin: 10px 0 8px;
}

.empty-card p {
  color: rgba(253,246,238,0.55);
  max-width: 480px;
  margin: 0 auto;
  line-height: 1.6;
}

@media (max-width: 1050px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 950px) {
  .admin-content {
    margin-left: 0;
    padding: 24px;
  }

  .admin-header h1 {
    font-size: 2.25rem;
  }
}

@media (max-width: 620px) {
  .admin-content {
    padding: 20px;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .chart-card {
    padding: 20px;
    border-radius: 24px;
  }

  .section-title {
    flex-direction: column;
  }

  .chart-wrapper {
    height: 260px;
  }
}
`;