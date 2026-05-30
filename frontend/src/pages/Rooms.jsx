import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../utils/api.js";
import Sidebar from "../components/Sidebar.jsx";

export default function Rooms() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/rooms")
      .then((r) => {
        setRooms(r.data || []);
      })
      .catch((err) => {
        console.error("Erreur rooms:", err);
        setRooms([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <div className="rooms-page">
      <style>{styles}</style>

      <div className="rooms-bg" />

      <Sidebar />

      <main className="rooms-content">
        <motion.div
          className="rooms-header"
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <span className="rooms-tag">MoodSphere Rooms</span>

          <h1>
            Emotional <em>Rooms</em>
          </h1>

          <p>
            Salons de discussion en temps réel, regroupés par émotion. Rejoins
            le salon qui correspond le mieux à ton humeur aujourd’hui.
          </p>
        </motion.div>

        {loading && (
          <div className="loading-card">
            Chargement des salons...
          </div>
        )}

        {!loading && rooms.length === 0 && (
          <div className="empty-card">
            <div>💬</div>
            <h3>Aucun salon disponible</h3>
            <p>Les salons émotionnels apparaîtront ici.</p>
          </div>
        )}

        <section className="rooms-grid">
          {rooms.map((room, i) => (
            <motion.div
              key={room._id}
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              whileHover={{ y: -6 }}
            >
              <Link to={`/rooms/${room.slug}`} className="room-link">
                <div
                  className="room-card"
                  style={{
                    borderLeft: `3px solid ${room.color}`,
                  }}
                >
                  <div
                    className="room-glow"
                    style={{
                      background: room.color,
                    }}
                  />

                  <div className="room-top">
                    <div className="room-emoji">
                      {room.emoji}
                    </div>

                    <span
                      className="room-status"
                      style={{
                        color: room.color,
                        borderColor: room.color,
                      }}
                    >
                      Live
                    </span>
                  </div>

                  <h3>{room.name}</h3>

                  <p>{room.description}</p>

                  <div className="room-footer">
                    <span>Temps réel · Socket.IO</span>

                    <strong style={{ color: room.color }}>
                      Rejoindre →
                    </strong>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </section>
      </main>
    </div>
  );
}

const styles = `
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400;1,600&family=DM+Sans:wght@300;400;500;600;700&display=swap');

.rooms-page {
  --cream: #FDF6EE;
  --rose: #C8506A;
  --caramel: #C8633A;
  --caramel-light: #E8936A;

  min-height: 100vh;
  background: #0D0608;
  color: var(--cream);
  font-family: 'DM Sans', sans-serif;
}

.rooms-bg {
  position: fixed;
  inset: 0;
  background:
    radial-gradient(ellipse 80% 60% at 15% 5%, rgba(123,30,50,0.38), transparent 60%),
    radial-gradient(ellipse 60% 50% at 85% 85%, rgba(200,99,58,0.18), transparent 55%),
    radial-gradient(ellipse 50% 40% at 50% 50%, rgba(200,80,106,0.1), transparent 55%),
    #0D0608;
  z-index: 0;
}

.rooms-content {
  position: relative;
  z-index: 1;
  margin-left: 300px;
  padding: 48px 42px 70px;
  max-width: 1180px;
}

.rooms-header {
  margin-bottom: 28px;
}

.rooms-tag {
  color: var(--caramel-light);
  text-transform: uppercase;
  letter-spacing: 0.18em;
  font-size: 0.72rem;
  font-weight: 800;
}

.rooms-header h1 {
  font-family: 'Playfair Display', serif;
  font-size: 2.8rem;
  font-weight: 400;
  margin: 12px 0 8px;
}

.rooms-header h1 em {
  color: var(--caramel-light);
}

.rooms-header p {
  color: rgba(253,246,238,0.58);
  max-width: 680px;
  line-height: 1.65;
}

.rooms-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 18px;
}

.room-link {
  text-decoration: none;
  color: inherit;
}

.room-card {
  position: relative;
  overflow: hidden;
  min-height: 245px;
  padding: 26px;
  border-radius: 28px;
  background: rgba(255,255,255,0.055);
  border: 1px solid rgba(255,255,255,0.12);
  backdrop-filter: blur(22px);
  box-shadow: 0 28px 80px rgba(0,0,0,0.45);
  cursor: pointer;
  transition: 0.28s ease;
}

.room-card:hover {
  background: rgba(255,255,255,0.08);
  transform: translateY(-2px);
  box-shadow: 0 34px 90px rgba(0,0,0,0.55);
}

.room-glow {
  position: absolute;
  top: -45px;
  right: -45px;
  width: 150px;
  height: 150px;
  border-radius: 50%;
  filter: blur(55px);
  opacity: 0.32;
  pointer-events: none;
}

.room-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
}

.room-emoji {
  width: 62px;
  height: 62px;
  border-radius: 22px;
  display: grid;
  place-items: center;
  font-size: 2.2rem;
  background: rgba(255,255,255,0.07);
  border: 1px solid rgba(255,255,255,0.11);
}

.room-status {
  font-size: 0.72rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  border: 1px solid;
  border-radius: 999px;
  padding: 6px 10px;
  background: rgba(255,255,255,0.045);
}

.room-card h3 {
  font-family: 'Playfair Display', serif;
  font-size: 1.55rem;
  font-weight: 500;
  margin: 8px 0 10px;
}

.room-card p {
  color: rgba(253,246,238,0.58);
  font-size: 0.92rem;
  line-height: 1.6;
  min-height: 65px;
}

.room-footer {
  margin-top: 22px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.room-footer span {
  color: rgba(253,246,238,0.42);
  font-size: 0.8rem;
}

.room-footer strong {
  font-size: 0.86rem;
  font-weight: 800;
}

.loading-card,
.empty-card {
  background: rgba(255,255,255,0.055);
  border: 1px solid rgba(255,255,255,0.12);
  backdrop-filter: blur(22px);
  box-shadow: 0 28px 80px rgba(0,0,0,0.45);
  border-radius: 28px;
  padding: 28px;
  margin-bottom: 22px;
}

.loading-card {
  text-align: center;
  color: rgba(253,246,238,0.65);
}

.empty-card {
  text-align: center;
  padding: 50px 26px;
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
}

@media (max-width: 950px) {
  .rooms-content {
    margin-left: 0;
    padding: 24px;
  }

  .rooms-header h1 {
    font-size: 2.25rem;
  }
}

@media (max-width: 520px) {
  .rooms-content {
    padding: 20px;
  }

  .rooms-grid {
    grid-template-columns: 1fr;
  }

  .room-card {
    padding: 22px;
  }

  .room-footer {
    flex-direction: column;
    align-items: flex-start;
  }
}
`;