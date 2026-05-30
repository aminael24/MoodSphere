import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Doughnut, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
} from "chart.js";

import api from "../utils/api.js";
import Sidebar from "../components/Sidebar.jsx";
import { meta } from "../utils/emotions.js";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement
);

export default function Dashboard() {
  const [period, setPeriod] = useState("7d"); // '7d' | '30d' | 'all'
  const [weather, setWeather] = useState([]);
  const [top, setTop] = useState([]);
  const [overview, setOverview] = useState({
    totalPosts: 0,
    totalUsers: 0,
    activeToday: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const params = { period };
      
      const [weatherResponse, topResponse, overviewResponse] = await Promise.all([
        api.get("/stats/emotional-weather", { params }),
        api.get("/stats/top-positive", { params }),
        api.get("/stats/overview", { params })
      ]);

      setWeather(weatherResponse.data?.weather || []);
      setTop(topResponse.data || []);
      setOverview(overviewResponse.data || { totalPosts: 0, totalUsers: 0, activeToday: 0 });
    } catch (err) {
      console.error("Erreur dashboard:", err);
      setError("Impossible de charger les statistiques à jour.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, [period]);

  const dominant = weather[0];

  const donutData = {
    labels: weather.map((item) => meta(item.emotion).label),
    datasets: [
      {
        data: weather.map((item) => item.percentage),
        backgroundColor: weather.map((item) => item.color),
        borderColor: "#0D0608",
        borderWidth: 4,
        hoverOffset: 16,
        borderRadius: 4,
      },
    ],
  };

  const donutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "70%",
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          color: "rgba(253,246,238,0.75)",
          font: { family: "DM Sans", size: 12, weight: "500" },
          padding: 20,
          usePointStyle: true,
          pointStyle: "circle",
        },
      },
      tooltip: {
        backgroundColor: "rgba(13, 6, 8, 0.95)",
        titleFont: { family: "DM Sans", size: 13, weight: "bold" },
        bodyFont: { family: "DM Sans", size: 13 },
        padding: 12,
        borderColor: "rgba(255, 255, 255, 0.1)",
        borderWidth: 1,
        callbacks: {
          label: (context) => ` ${context.label} : ${context.parsed}%`,
        },
      },
    },
  };

  const barData = {
    labels: weather.map((item) => meta(item.emotion).label),
    datasets: [
      {
        label: "Publications",
        data: weather.map((item) => item.count),
        backgroundColor: weather.map((item) => item.color),
        borderRadius: 8,
        borderSkipped: false,
        maxBarThickness: 32,
      },
    ],
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "rgba(13, 6, 8, 0.95)",
        bodyFont: { family: "DM Sans", size: 13 },
        padding: 10,
        callbacks: {
          label: (context) => ` ${context.parsed.y} publication(s)`,
        },
      },
    },
    scales: {
      x: {
        ticks: {
          color: "rgba(253,246,238,0.6)",
          font: { family: "DM Sans", size: 11, weight: "600" },
        },
        grid: { display: false },
      },
      y: {
        ticks: {
          color: "rgba(253,246,238,0.5)",
          precision: 0,
          font: { family: "DM Sans" },
        },
        grid: { color: "rgba(255,237,218,0.04)" },
      },
    },
  };

  const statsCards = [
    {
      label: "Publications",
      value: overview.totalPosts || 0,
      emoji: "📝",
      hint: "Posts au total",
    },
    {
      label: "Membres",
      value: overview.totalUsers || 0,
      emoji: "👥",
      hint: "Comptes créés",
    },
    {
      label: "Humeur Dominante",
      value: dominant ? meta(dominant.emotion).label : "—",
      emoji: dominant ? meta(dominant.emotion).emoji : "🌌",
      hint: "Tendance actuelle",
      color: dominant ? meta(dominant.emotion).color : "var(--caramel-light)",
    },
    {
      label: "Activité Récente",
      value: overview.activeToday || 0,
      emoji: "⚡",
      hint: "Interactions / 24h",
    },
  ];

  return (
    <div className="dashboard-page">
      <style>{styles}</style>
      <div className="dashboard-bg" />
      <Sidebar />

      <main className="dashboard-content">
        <div className="dashboard-control-header">
          <motion.header
            className="dashboard-header"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <span className="dashboard-tag">MoodSphere Analytics</span>
            <h1>Météo <em>émotionnelle</em></h1>
            <p>
              L’humeur collective de la communauté, calculée en temps réel à
              partir des publications et des émotions détectées.
            </p>
          </motion.header>

          <motion.div 
            className="period-picker"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <button className={period === "7d" ? "active" : ""} onClick={() => setPeriod("7d")}>7 jours</button>
            <button className={period === "30d" ? "active" : ""} onClick={() => setPeriod("30d")}>30 jours</button>
            <button className={period === "all" ? "active" : ""} onClick={() => setPeriod("all")}>Global</button>
          </motion.div>
        </div>

        {error && <div className="error-card">{error}</div>}

        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner" />
            <p>Mise à jour des métriques...</p>
          </div>
        ) : (
          <>
            <section className="stats-grid">
              {statsCards.map((stat, index) => (
                <motion.article
                  key={stat.label}
                  className="stat-card"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05, ease: "easeOut" }}
                  whileHover={{ y: -4, transition: { duration: 0.2 } }}
                >
                  <div className="stat-card-inner">
                    <div>
                      <div className="stat-label">{stat.label}</div>
                      <div 
                        className="stat-value" 
                        style={stat.color ? { color: stat.color } : {}}
                      >
                        {stat.value}
                      </div>
                    </div>
                    <div className="stat-icon-wrapper">
                      {stat.emoji}
                    </div>
                  </div>
                  <p className="stat-hint">{stat.hint}</p>
                </motion.article>
              ))}
            </section>

            <section className="charts-grid">
              <motion.article
                className="chart-card distribution-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <div className="section-title">
                  <div>
                    <span>Répartition</span>
                    <h2>Émotions collectives</h2>
                  </div>
                </div>

                {weather.length > 0 ? (
                  <div className="donut-wrapper">
                    <Doughnut data={donutData} options={donutOptions} />
                  </div>
                ) : (
                  <div className="empty-card">
                    <div>🌙</div>
                    <h3>Données insuffisantes</h3>
                    <p>Les émotions apparaîtront ici dès que la communauté publiera.</p>
                  </div>
                )}
              </motion.article>

              <motion.article
                className="chart-card details-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
              >
                <div className="section-title">
                  <div>
                    <span>Détail volumétrique</span>
                    <h2>Par émotion</h2>
                  </div>

                  {dominant && (
                    <div
                      className="dominant-pill"
                      style={{
                        color: dominant.color,
                        borderColor: `${dominant.color}44`,
                        background: `${dominant.color}10`,
                      }}
                    >
                      {meta(dominant.emotion).emoji} Dominante
                    </div>
                  )}
                </div>

                <div className="emotion-list">
                  {weather.map((item, index) => {
                    const emotion = meta(item.emotion);

                    return (
                      <div key={item.emotion || index} className="emotion-item">
                        <div className="emotion-row">
                          <span className="emotion-name">
                            {emotion.emoji} {emotion.label}
                          </span>
                          <div className="emotion-meta-right">
                            <span className="emotion-count">
                              {item.count} post{item.count > 1 ? "s" : ""}
                            </span>
                            <strong className="emotion-pct">{item.percentage}%</strong>
                          </div>
                        </div>

                        <div className="progress-track">
                          <motion.div
                            className="progress-fill"
                            initial={{ width: 0 }}
                            animate={{ width: `${item.percentage}%` }}
                            transition={{ duration: 0.6, delay: index * 0.05 }}
                            style={{
                              background: item.color,
                              boxShadow: `0 0 10px ${item.color}66`,
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="top-members">
                  <div className="section-title small">
                    <div>
                      <span>Ambassadeurs</span>
                      <h2>Membres les plus positifs</h2>
                    </div>
                  </div>

                  <div className="top-list">
                    {top.map((user, index) => (
                      <div key={user._id || user.username || index} className="top-item">
                        <div className="rank">{index + 1}</div>
                        <span
                          className="aura-dot"
                          style={{
                            background: user.aura || "var(--caramel)",
                            boxShadow: `0 0 8px ${user.aura || "#C8633A"}cc`,
                          }}
                        />
                        <div className="top-user">
                          <strong>@{user.username}</strong>
                          <span>{user.positiveCount} partages constructifs</span>
                        </div>
                      </div>
                    ))}

                    {top.length === 0 && (
                      <p className="muted-text">Aucun profil ne se démarque sur cette période.</p>
                    )}
                  </div>
                </div>
              </motion.article>
            </section>

            <motion.section
              className="bar-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="section-title">
                <div>
                  <span>Analyse comparative</span>
                  <h2>Volume brut de publications</h2>
                </div>
              </div>

              {weather.length > 0 ? (
                <div className="bar-wrapper">
                  <Bar data={barData} options={barOptions} />
                </div>
              ) : (
                <div className="empty-card compact">
                  <div>📊</div>
                  <h3>Aucun volume disponible</h3>
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
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=DM+Sans:wght@400;500;700&display=swap');

.dashboard-page {
  --cream: #FDF6EE;
  --rose: #C8506A;
  --wine: #7B1E32;
  --caramel: #C8633A;
  --caramel-light: #E8936A;
  --card-bg: rgba(255, 255, 255, 0.04);
  --border-glow: rgba(255, 255, 255, 0.08);

  min-height: 100vh;
  background: #0D0608;
  color: var(--cream);
  font-family: 'DM Sans', sans-serif;
}

.dashboard-bg {
  position: fixed;
  inset: 0;
  background:
    radial-gradient(ellipse 80% 60% at 15% 5%, rgba(123,30,50,0.3), transparent 60%),
    radial-gradient(ellipse 60% 50% at 85% 85%, rgba(200,99,58,0.15), transparent 55%),
    #0D0608;
  z-index: 0;
  pointer-events: none;
}

.dashboard-content {
  position: relative;
  z-index: 1;
  margin-left: 298px;
  padding: 42px 40px 60px;
  max-width: 1340px;
}

.dashboard-control-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 24px;
  margin-bottom: 32px;
  flex-wrap: wrap;
}

.dashboard-header p {
  color: rgba(253,246,238,0.6);
  max-width: 640px;
  line-height: 1.6;
  margin: 8px 0 0;
}

.dashboard-tag, .section-title span {
  color: var(--caramel-light);
  text-transform: uppercase;
  letter-spacing: 0.16em;
  font-size: 0.7rem;
  font-weight: 700;
  display: block;
}

.dashboard-header h1 {
  font-family: 'Playfair Display', serif;
  font-size: 2.6rem;
  font-weight: 400;
  margin: 6px 0 0;
}

.dashboard-header h1 em { color: var(--caramel-light); font-style: italic; }

.period-picker {
  display: flex;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid var(--border-glow);
  padding: 4px;
  border-radius: 14px;
  backdrop-filter: blur(10px);
}

.period-picker button {
  background: transparent;
  border: none;
  color: rgba(253, 246, 238, 0.6);
  padding: 8px 16px;
  font-family: 'DM Sans', sans-serif;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  border-radius: 10px;
  transition: all 0.2s ease;
}

.period-picker button:hover {
  color: var(--cream);
}

.period-picker button.active {
  background: rgba(255, 255, 255, 0.08);
  color: var(--caramel-light);
  box-shadow: 0 4px 12px rgba(0,0,0,0.2);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 20px;
  margin-bottom: 28px;
}

.stat-card {
  background: var(--card-bg);
  border: 1px solid var(--border-glow);
  backdrop-filter: blur(20px);
  border-radius: 22px;
  padding: 22px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.stat-card-inner {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.stat-label {
  color: rgba(253, 246, 238, 0.5);
  font-size: 0.85rem;
  font-weight: 500;
}

.stat-value {
  font-family: 'Playfair Display', serif;
  font-size: 2.2rem;
  font-weight: 700;
  margin-top: 4px;
  line-height: 1.1;
}

.stat-icon-wrapper {
  font-size: 1.6rem;
  background: rgba(255, 255, 255, 0.03);
  padding: 10px;
  border-radius: 14px;
  border: 1px solid rgba(255,255,255,0.03);
}

.stat-hint {
  color: rgba(253, 246, 238, 0.35);
  font-size: 0.75rem;
  margin: 14px 0 0;
}

.charts-grid {
  display: grid;
  grid-template-columns: 1fr 1.1fr;
  gap: 24px;
  margin-bottom: 24px;
}

.chart-card, .bar-card {
  background: var(--card-bg);
  border: 1px solid var(--border-glow);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  padding: 26px;
}

.section-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 24px;
}

.section-title h2 {
  font-family: 'Playfair Display', serif;
  font-size: 1.45rem;
  font-weight: 400;
  margin: 4px 0 0;
}

.donut-wrapper {
  height: 320px;
  position: relative;
  margin-top: 16px;
}

.dominant-pill {
  border: 1px solid;
  border-radius: 999px;
  padding: 6px 14px;
  font-size: 0.78rem;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  white-space: nowrap;
}

.emotion-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-top: 12px;
}

.emotion-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.emotion-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
}

.emotion-name {
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--cream);
}

.emotion-meta-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.emotion-count {
  color: rgba(253, 246, 238, 0.4);
  font-size: 0.8rem;
  font-weight: 500;
}

.emotion-pct {
  color: var(--cream);
  font-size: 0.95rem;
  font-weight: 700;
}

.progress-track {
  height: 8px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.02);
  overflow: hidden;
  width: 100%;
}

.progress-fill { height: 100%; border-radius: 999px; }

.section-title.small { margin-top: 32px; margin-bottom: 16px; }

.top-list { display: grid; gap: 10px; }

.top-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 14px;
  background: rgba(255,255,255,0.01);
  border: 1px solid rgba(255,255,255,0.02);
}

.rank {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  background: rgba(255,255,255,0.04);
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--caramel-light);
}

.aura-dot { width: 10px; height: 10px; border-radius: 50%; }

.top-user strong { display: block; font-size: 0.88rem; }
.top-user span { display: block; color: rgba(253,246,238,0.4); font-size: 0.75rem; }

.bar-wrapper { height: 300px; margin-top: 20px; }

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100px 0;
  gap: 16px;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(232,147,106,0.1);
  border-top-color: var(--caramel-light);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

.empty-card {
  text-align: center;
  padding: 60px 20px;
}
.empty-card div { font-size: 2.5rem; margin-bottom: 10px; }
.empty-card h3 { font-family: 'Playfair Display', serif; font-weight: 400; font-size: 1.3rem; }
.empty-card p { color: rgba(253,246,238,0.5); font-size: 0.85rem; max-width: 320px; margin: 6px auto 0; }

@media (max-width: 1180px) {
  .charts-grid { grid-template-columns: 1fr; }
}

@media (max-width: 950px) {
  .dashboard-content { margin-left: 0; padding: 24px 20px; }
  .dashboard-header h1 { font-size: 2.2rem; }
}

@media (max-width: 620px) {
  .dashboard-control-header { flex-direction: column; align-items: stretch; }
  .period-picker { justify-content: center; }
  .chart-card, .bar-card { padding: 20px; border-radius: 20px; }
}
`;