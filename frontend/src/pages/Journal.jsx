import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import BadgeToast from "../components/BadgeToast.jsx";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Filler,
} from "chart.js";

import api from "../utils/api.js";
import CrisisModal from "../components/CrisisModal.jsx";
import Toast from "../components/Toast.jsx";
import Sidebar from "../components/Sidebar.jsx";
import { meta, EMOTION_META } from "../utils/emotions.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Filler
);

const ORDER = ["sad", "angry", "stress", "calm", "motivated", "joy"];

export default function Journal() {
  const [entries, setEntries] = useState([]);
  const [timeline, setTimeline] = useState([]);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState("");

  const [filter, setFilter] = useState("");
  const [emotionFilter, setEmotionFilter] = useState("");

  const [crisis, setCrisis] = useState(null);
  const [toast, setToast] = useState("");
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
const [newBadge, setNewBadge] = useState(null);
  const load = async () => {
    try {
      setError("");

      const params = new URLSearchParams();

      if (filter.trim()) {
        params.set("q", filter.trim());
      }

      if (emotionFilter) {
        params.set("emotion", emotionFilter);
      }

      const journalResponse = await api.get("/journal?" + params.toString());
      const timelineResponse = await api.get("/journal/timeline");

      setEntries(journalResponse.data || []);
      setTimeline(timelineResponse.data || []);
    } catch (err) {
      console.error("Erreur journal:", err);
      setError("Impossible de charger ton journal.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      load();
    }, 300);

    return () => clearTimeout(timer);
  }, [filter, emotionFilter]);

  const save = async () => {
    if (!content.trim()) return;

    setBusy(true);
    setError("");

    try {
      const tagsList = tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean);

      const response = await api.post("/journal", {
        title: title.trim(),
        content: content.trim(),
        tags: tagsList,
      });

      if (response.data.crisisResources) {
        setCrisis(response.data.crisisResources);
      }

      setContent("");
      setTitle("");
      setTags("");

      const detectedEmotion = response.data.entry?.aiAnalysis?.dominantEmotion;
      const emotionLabel = meta(detectedEmotion).label;

     setToast(`Entrée enregistrée — ${emotionLabel}`);

      setTimeout(() => {
        setToast("");
      }, 2500);

      // Affiche les badges débloqués un par un
      if (response.data.newBadges && response.data.newBadges.length > 0) {
        response.data.newBadges.forEach((badge, i) => {
          setTimeout(() => setNewBadge(badge), i * 5500);
        });
      }

      await load();
    } catch (err) {
      console.error("Erreur sauvegarde:", err);
      setError("Impossible d'enregistrer cette entrée.");
    } finally {
      setBusy(false);
    }
  };

  const remove = async (id) => {
    if (!confirm("Supprimer cette entrée ?")) return;

    try {
      await api.delete(`/journal/${id}`);

      setEntries((oldEntries) =>
        oldEntries.filter((entry) => entry._id !== id)
      );

      setToast("Entrée supprimée");

      setTimeout(() => {
        setToast("");
      }, 2000);
    } catch (err) {
      console.error("Erreur suppression:", err);
      setError("Impossible de supprimer cette entrée.");
    }
  };

  const resetFilters = () => {
    setFilter("");
    setEmotionFilter("");
  };

  const lineData = {
    labels: timeline.map((item) =>
      new Date(item.date).toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "short",
      })
    ),
    datasets: [
      {
        data: timeline.map((item) => ORDER.indexOf(item.emotion)),
        borderColor: "#C8633A",
        backgroundColor: "rgba(200,99,58,0.18)",
        fill: true,
        tension: 0.4,
        pointBackgroundColor: timeline.map((item) => meta(item.emotion).color),
        pointBorderColor: "#FDF6EE",
        pointRadius: 5,
        pointHoverRadius: 7,
      },
    ],
  };

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const emotion = timeline[context.dataIndex]?.emotion;
            return " " + meta(emotion).label;
          },
        },
      },
    },
    scales: {
      y: {
        min: 0,
        max: ORDER.length - 1,
        ticks: {
          stepSize: 1,
          color: "rgba(253,246,238,0.55)",
          callback: (value) => EMOTION_META[ORDER[value]]?.emoji || "",
          font: {
            size: 14,
          },
        },
        grid: {
          color: "rgba(255,237,218,0.05)",
        },
      },
      x: {
        ticks: {
          color: "rgba(253,246,238,0.55)",
        },
        grid: {
          color: "rgba(255,237,218,0.04)",
        },
      },
    },
  };

  return (
    <div className="journal-page">
      <style>{styles}</style>

      <div className="journal-bg" />

      <Sidebar />

      <main className="journal-content">
        <motion.div
          className="journal-header"
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <span className="journal-tag">Private Space</span>

          <h1>
            Mood <em>Journal</em>
          </h1>

          <p>
            Un espace strictement privé pour écrire ce que tu ressens. Tes
            entrées sont analysées par l’IA, mais elles restent visibles
            uniquement par toi.
          </p>
        </motion.div>

        {error && (
          <div className="error-card">
            {error}
          </div>
        )}

        <motion.section
          className="journal-composer"
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.06 }}
        >
          <div className="composer-top">
            <div>
              <span>Nouvelle entrée</span>
              <h2>Comment te sens-tu aujourd’hui ?</h2>
            </div>

            <div className="ai-pill">
              IA émotionnelle
            </div>
          </div>

          <input
            className="journal-input"
            placeholder="Titre facultatif"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={100}
          />

          <textarea
            className="journal-textarea"
            rows={6}
            placeholder="Écris librement ce que tu ressens..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />

          <input
            className="journal-input"
            placeholder="Tags séparés par des virgules : stress, famille, étude..."
            value={tags}
            onChange={(e) => setTags(e.target.value)}
          />

          <div className="composer-footer">
            <span>
              {content.trim().length} caractères
            </span>

            <button
              className="save-btn"
              disabled={busy || !content.trim()}
              onClick={save}
            >
              {busy ? "Analyse IA..." : "Enregistrer ✨"}
            </button>
          </div>
        </motion.section>

        {timeline.length > 1 && (
          <motion.section
            className="timeline-card"
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="section-title">
              <div>
                <span>Analyse</span>
                <h3>Ta timeline émotionnelle</h3>
              </div>

              <div className="timeline-count">
                {timeline.length} points
              </div>
            </div>

            <div className="chart-wrapper">
              <Line data={lineData} options={lineOptions} />
            </div>
          </motion.section>
        )}

        <motion.section
          className="filters-card"
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.14 }}
        >
          <input
            className="journal-input"
            placeholder="Rechercher dans le journal..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />

          <select
            className="journal-select"
            value={emotionFilter}
            onChange={(e) => setEmotionFilter(e.target.value)}
          >
            <option value="">Toutes émotions</option>

            {Object.entries(EMOTION_META).map(([key, value]) => (
              <option key={key} value={key}>
                {value.emoji} {value.label}
              </option>
            ))}
          </select>

          {(filter || emotionFilter) && (
            <button className="reset-btn" onClick={resetFilters}>
              ✕
            </button>
          )}
        </motion.section>

        {loading && (
          <div className="loading-card">
            Chargement du journal...
          </div>
        )}

        {!loading && entries.length === 0 && (
          <div className="empty-card">
            <div>📓</div>

            <h3>Ton journal est vide</h3>

            <p>
              Commence par écrire ce que tu ressens. L’IA détectera ensuite ton
              émotion dominante.
            </p>
          </div>
        )}

        <section className="entries-list">
          {entries.map((entry, index) => {
            const emotion = meta(entry.aiAnalysis?.dominantEmotion);

            return (
              <motion.article
                key={entry._id}
                className="entry-card"
                initial={{ opacity: 0, y: 22 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(index * 0.04, 0.3) }}
                style={{
                  borderLeft: `3px solid ${entry.auraColor || emotion.color}`,
                }}
              >
                <div
                  className="entry-glow"
                  style={{
                    background: entry.auraColor || emotion.color,
                  }}
                />

                <div className="entry-header">
                  <div>
                    {entry.title && (
                      <h3>
                        {entry.title}
                      </h3>
                    )}

                    <span className="entry-date">
                      {new Date(entry.createdAt).toLocaleString("fr-FR", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </span>
                  </div>

                  <span
                    className="emotion-badge"
                    style={{
                      color: emotion.color,
                      borderColor: emotion.color,
                    }}
                  >
                    <span
                      className="emotion-dot"
                      style={{
                        background: emotion.color,
                        boxShadow: `0 0 10px ${emotion.color}`,
                      }}
                    />

                    {emotion.emoji} {emotion.label}
                  </span>
                </div>

                <p className="entry-content">
                  {entry.content}
                </p>

                {entry.tags?.length > 0 && (
                  <div className="entry-tags">
                    {entry.tags.map((tag, tagIndex) => (
                      <span key={tagIndex}>
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                <div className="entry-actions">
                  <button onClick={() => remove(entry._id)}>
                     Supprimer
                  </button>
                </div>
              </motion.article>
            );
          })}
        </section>
      </main>

    <CrisisModal data={crisis} onClose={() => setCrisis(null)} />
      <Toast message={toast} />
      <BadgeToast badge={newBadge} onClose={() => setNewBadge(null)} />
    </div>
  );
}

const styles = `
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400;1,600&family=DM+Sans:wght@300;400;500;600;700&display=swap');

.journal-page {
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

.journal-bg {
  position: fixed;
  inset: 0;
  background:
    radial-gradient(ellipse 80% 60% at 15% 5%, rgba(123,30,50,0.38), transparent 60%),
    radial-gradient(ellipse 60% 50% at 85% 85%, rgba(200,99,58,0.18), transparent 55%),
    radial-gradient(ellipse 50% 40% at 50% 50%, rgba(200,80,106,0.1), transparent 55%),
    #0D0608;
  z-index: 0;
}

.journal-content {
  position: relative;
  z-index: 1;
  margin-left: 300px;
  padding: 48px 42px 70px;
  max-width: 1180px;
}

.journal-header {
  margin-bottom: 26px;
}

.journal-tag,
.composer-top span,
.section-title span {
  color: var(--caramel-light);
  text-transform: uppercase;
  letter-spacing: 0.18em;
  font-size: 0.72rem;
  font-weight: 800;
}

.journal-header h1 {
  font-family: 'Playfair Display', serif;
  font-size: 2.8rem;
  font-weight: 400;
  margin: 12px 0 8px;
}

.journal-header h1 em {
  color: var(--caramel-light);
}

.journal-header p {
  color: rgba(253,246,238,0.58);
  max-width: 720px;
  line-height: 1.65;
}

.journal-composer,
.timeline-card,
.filters-card,
.entry-card,
.loading-card,
.error-card,
.empty-card {
  background: rgba(255,255,255,0.055);
  border: 1px solid rgba(255,255,255,0.12);
  backdrop-filter: blur(22px);
  box-shadow: 0 28px 80px rgba(0,0,0,0.45);
  border-radius: 30px;
}

.journal-composer {
  padding: 26px;
  margin-bottom: 24px;
}

.composer-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 18px;
  margin-bottom: 18px;
}

.composer-top h2 {
  font-family: 'Playfair Display', serif;
  font-size: 1.8rem;
  font-weight: 400;
  margin: 6px 0 0;
}

.ai-pill {
  border: 1px solid rgba(232,147,106,0.35);
  background: rgba(232,147,106,0.08);
  color: var(--caramel-light);
  border-radius: 999px;
  padding: 8px 13px;
  font-size: 0.78rem;
  font-weight: 800;
  white-space: nowrap;
}

.journal-input,
.journal-textarea,
.journal-select {
  width: 100%;
  border-radius: 17px;
  border: 1px solid rgba(255,255,255,0.12);
  background: rgba(255,255,255,0.065);
  color: var(--cream);
  padding: 0 15px;
  outline: none;
  font-family: 'DM Sans', sans-serif;
}

.journal-input,
.journal-select {
  height: 48px;
}

.journal-textarea {
  margin-top: 12px;
  min-height: 145px;
  padding-top: 14px;
  resize: vertical;
  line-height: 1.6;
}

.journal-input + .journal-input {
  margin-top: 12px;
}

.journal-input::placeholder,
.journal-textarea::placeholder {
  color: rgba(253,246,238,0.38);
}

.journal-input:focus,
.journal-textarea:focus,
.journal-select:focus {
  border-color: rgba(232,147,106,0.65);
  box-shadow: 0 0 0 4px rgba(232,147,106,0.1);
}

.journal-select option {
  color: #0D0608;
}

.composer-footer {
  margin-top: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.composer-footer span {
  color: rgba(253,246,238,0.42);
  font-size: 0.8rem;
}

.save-btn {
  height: 48px;
  border: none;
  border-radius: 17px;
  padding: 0 20px;
  cursor: pointer;
  color: var(--cream);
  font-weight: 900;
  font-family: 'DM Sans', sans-serif;
  background: linear-gradient(135deg, var(--caramel), var(--rose));
  box-shadow: 0 16px 35px rgba(200,80,106,0.22);
  transition: 0.25s ease;
}

.save-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 20px 45px rgba(200,80,106,0.3);
}

.save-btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
  transform: none;
}

.timeline-card {
  padding: 26px;
  margin-bottom: 24px;
}

.section-title {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 14px;
}

.section-title h3 {
  font-family: 'Playfair Display', serif;
  font-size: 1.55rem;
  font-weight: 400;
  margin: 6px 0 0;
}

.timeline-count {
  border: 1px solid rgba(255,255,255,0.1);
  background: rgba(255,255,255,0.055);
  color: rgba(253,246,238,0.58);
  border-radius: 999px;
  padding: 7px 12px;
  font-size: 0.78rem;
  font-weight: 800;
}

.chart-wrapper {
  height: 230px;
}

.filters-card {
  display: grid;
  grid-template-columns: 1fr 210px auto;
  gap: 10px;
  padding: 16px;
  margin-bottom: 22px;
}

.reset-btn {
  width: 48px;
  height: 48px;
  border-radius: 17px;
  border: 1px solid rgba(255,255,255,0.12);
  background: rgba(255,255,255,0.065);
  color: var(--cream);
  cursor: pointer;
  font-weight: 900;
}

.reset-btn:hover {
  color: var(--caramel-light);
  border-color: rgba(232,147,106,0.35);
}

.entries-list {
  display: grid;
  gap: 16px;
}

.entry-card {
  position: relative;
  overflow: hidden;
  padding: 22px;
}

.entry-glow {
  position: absolute;
  top: -55px;
  right: -55px;
  width: 160px;
  height: 160px;
  border-radius: 50%;
  filter: blur(60px);
  opacity: 0.18;
  pointer-events: none;
}

.entry-header {
  position: relative;
  display: flex;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 12px;
}

.entry-header h3 {
  font-family: 'Playfair Display', serif;
  font-size: 1.28rem;
  font-weight: 500;
  margin: 0 0 4px;
}

.entry-date {
  color: rgba(253,246,238,0.45);
  font-size: 0.78rem;
}

.emotion-badge {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  height: fit-content;
  border: 1px solid;
  border-radius: 999px;
  padding: 7px 11px;
  background: rgba(255,255,255,0.045);
  font-size: 0.78rem;
  font-weight: 800;
  white-space: nowrap;
}

.emotion-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.entry-content {
  position: relative;
  color: rgba(253,246,238,0.68);
  line-height: 1.7;
  font-size: 0.96rem;
  white-space: pre-wrap;
  margin: 0;
}

.entry-tags {
  position: relative;
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
  margin-top: 13px;
}

.entry-tags span {
  color: rgba(253,246,238,0.52);
  font-size: 0.75rem;
  padding: 5px 9px;
  background: rgba(255,255,255,0.055);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 999px;
}

.entry-actions {
  position: relative;
  margin-top: 14px;
}

.entry-actions button {
  background: none;
  border: none;
  color: rgba(253,246,238,0.45);
  cursor: pointer;
  font-size: 0.8rem;
  padding: 0;
}

.entry-actions button:hover {
  color: #ffb4b4;
}

.loading-card,
.error-card,
.empty-card {
  padding: 28px;
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
  padding: 52px 26px;
}

.empty-card div {
  font-size: 2.4rem;
}

.empty-card h3 {
  font-family: 'Playfair Display', serif;
  font-size: 1.7rem;
  font-weight: 400;
  margin: 10px 0 8px;
}

.empty-card p {
  color: rgba(253,246,238,0.55);
  max-width: 480px;
  margin: 0 auto;
}

@media (max-width: 950px) {
  .journal-content {
    margin-left: 0;
    padding: 24px;
  }

  .journal-header h1 {
    font-size: 2.3rem;
  }

  .filters-card {
    grid-template-columns: 1fr;
  }

  .reset-btn {
    width: 100%;
  }
}

@media (max-width: 620px) {
  .journal-content {
    padding: 20px;
  }

  .composer-top,
  .composer-footer,
  .section-title,
  .entry-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .save-btn {
    width: 100%;
  }

  .journal-composer,
  .timeline-card,
  .entry-card {
    padding: 20px;
    border-radius: 24px;
  }

  .emotion-badge {
    white-space: normal;
  }

  .chart-wrapper {
    height: 210px;
  }
}
`;