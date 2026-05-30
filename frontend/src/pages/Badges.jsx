import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import api from "../utils/api.js";
import { useAuth } from "../context/AuthContext.jsx";
import Sidebar from "../components/Sidebar.jsx";

// Catalogue affichable (doit correspondre au backend)
const BADGE_CATALOG = {
  first_post:       { label: "Premier pas",      emoji: "🌱", points: 10,  condition: "Publie ton premier post" },
  first_journal:    { label: "Cher journal",     emoji: "📓", points: 10,  condition: "Écris ta première entrée de journal" },
  joy_master:       { label: "Maître de la joie",emoji: "☀️", points: 50,  condition: "Publie 5 posts avec l'émotion 'joie'" },
  zen_master:       { label: "Maître du calme", emoji: "🪷", points: 50,  condition: "Publie 5 posts avec l'émotion 'calme'" },
  go_getter:        { label: "Battant·e",       emoji: "🔥", points: 50,  condition: "Publie 5 posts avec l'émotion 'motivé'" },
  streak_3:         { label: "Régularité 3j",   emoji: "⚡", points: 30,  condition: "Écris dans le journal 3 jours d'affilée" },
  streak_7:         { label: "Streak de feu",   emoji: "💎", points: 100, condition: "Écris dans le journal 7 jours d'affilée" },
  social_butterfly: { label: "Papillon social", emoji: "🦋", points: 30,  condition: "Sois suivi·e par au moins 3 personnes" },
  loved:            { label: "Très aimé·e",     emoji: "💖", points: 50,  condition: "Reçois 5 likes sur un même post" },
  open_mind:        { label: "Esprit ouvert",   emoji: "🧠", points: 20,  condition: "Discute avec l'AI Therapist Bot" },
};

export default function Badges() {
  const { user } = useAuth();
  const unlocked = new Set((user?.badges || []).map((b) => b.code));
  const totalPoints = user?.wellnessPoints || 0;
  const totalUnlocked = unlocked.size;
  const totalAvailable = Object.keys(BADGE_CATALOG).length;

  return (
    <div className="bdg-page">
      <style>{styles}</style>
      <div className="bdg-bg" />
      <Sidebar />

      <main className="bdg-main">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <span className="bdg-tag">MoodSphere</span>
          <h1>Mes <em>succès</em></h1>
          <p className="bdg-sub">
            Débloque des badges en utilisant MoodSphere. Chaque badge apporte des
            points bien-être ✨
          </p>
        </motion.div>

        {/* Stats globales */}
        <motion.div
          className="bdg-stats"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="bdg-stat">
            <strong>{totalUnlocked}</strong>
            <span>sur {totalAvailable} badges</span>
          </div>
          <div className="bdg-stat">
            <strong>{totalPoints}</strong>
            <span>points bien-être</span>
          </div>
          <div className="bdg-stat">
            <strong>{user?.streak || 0}</strong>
            <span>jours de streak</span>
          </div>
        </motion.div>

        {/* Grille badges */}
        <div className="bdg-grid">
          {Object.entries(BADGE_CATALOG).map(([code, def], i) => {
            const isUnlocked = unlocked.has(code);
            return (
              <motion.div
                key={code}
                className={`bdg-card ${isUnlocked ? "bdg-card--unlocked" : "bdg-card--locked"}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 + i * 0.04 }}
                whileHover={{ y: -4 }}
              >
                <div className="bdg-card-emoji">{def.emoji}</div>
                <div className="bdg-card-label">{def.label}</div>
                <div className="bdg-card-condition">{def.condition}</div>
                <div className="bdg-card-points">+{def.points} pts</div>
                {isUnlocked ? (
                  <span className="bdg-card-status bdg-status-unlocked">✓ Débloqué</span>
                ) : (
                  <span className="bdg-card-status bdg-status-locked">🔒 À débloquer</span>
                )}
              </motion.div>
            );
          })}
        </div>
      </main>
    </div>
  );
}

const styles = `
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=DM+Sans:wght@300;400;500;600;700&display=swap');

.bdg-page {
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

.bdg-bg {
  position: fixed;
  inset: 0;
  background:
    radial-gradient(ellipse 80% 60% at 15% 5%, rgba(123,30,50,0.38), transparent 60%),
    radial-gradient(ellipse 60% 50% at 85% 85%, rgba(200,99,58,0.18), transparent 55%),
    #0D0608;
  z-index: 0;
}

.bdg-main {
  position: relative;
  z-index: 1;
  margin-left: 298px;
  padding: 42px 40px 70px;
  max-width: 1100px;
}

.bdg-tag {
  color: var(--caramel-light);
  text-transform: uppercase;
  letter-spacing: 0.18em;
  font-size: 0.72rem;
  font-weight: 800;
}

.bdg-main h1 {
  font-family: 'Playfair Display', serif;
  font-size: 2.8rem;
  font-weight: 400;
  margin: 10px 0 8px;
}

.bdg-main h1 em { color: var(--caramel-light); font-style: italic; }

.bdg-sub {
  color: rgba(253,246,238,0.55);
  margin-bottom: 30px;
  max-width: 540px;
  line-height: 1.6;
}

.bdg-stats {
  display: flex;
  gap: 28px;
  padding: 24px 30px;
  background: rgba(255,255,255,0.055);
  border: 1px solid rgba(255,255,255,0.12);
  backdrop-filter: blur(22px);
  border-radius: 24px;
  margin-bottom: 32px;
  flex-wrap: wrap;
}

.bdg-stat {
  display: flex;
  flex-direction: column;
}

.bdg-stat strong {
  font-family: 'Playfair Display', serif;
  font-size: 2.2rem;
  font-weight: 700;
  color: var(--caramel-light);
}

.bdg-stat span {
  color: rgba(253,246,238,0.55);
  font-size: 0.85rem;
}

.bdg-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 18px;
}

.bdg-card {
  padding: 24px 22px;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 22px;
  text-align: center;
  transition: all 0.3s ease;
  backdrop-filter: blur(18px);
}

.bdg-card--unlocked {
  background: linear-gradient(160deg, rgba(200,99,58,0.18), rgba(200,80,106,0.1));
  border-color: rgba(232,147,106,0.35);
  box-shadow: 0 20px 50px rgba(200,99,58,0.18);
}

.bdg-card--locked {
  opacity: 0.5;
  filter: grayscale(0.6);
}

.bdg-card-emoji {
  font-size: 3rem;
  margin-bottom: 8px;
}

.bdg-card-label {
  font-family: 'Playfair Display', serif;
  font-size: 1.3rem;
  font-weight: 700;
  margin-bottom: 6px;
}

.bdg-card-condition {
  color: rgba(253,246,238,0.6);
  font-size: 0.82rem;
  line-height: 1.5;
  margin-bottom: 12px;
}

.bdg-card-points {
  display: inline-block;
  padding: 4px 12px;
  background: rgba(232,147,106,0.2);
  border-radius: 999px;
  font-size: 0.78rem;
  font-weight: 700;
  color: var(--caramel-light);
  margin-bottom: 10px;
}

.bdg-card-status {
  display: block;
  font-size: 0.78rem;
  font-weight: 700;
  margin-top: 8px;
}

.bdg-status-unlocked { color: #6ED07A; }
.bdg-status-locked { color: rgba(253,246,238,0.4); }

@media (max-width: 950px) {
  .bdg-main { margin-left: 0; padding: 24px 20px 50px; }
  .bdg-main h1 { font-size: 2.2rem; }
}
`;