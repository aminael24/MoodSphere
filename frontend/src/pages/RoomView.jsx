import { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import api from "../utils/api.js";
import { getSocket } from "../utils/socket.js";
import { useAuth } from "../context/AuthContext.jsx";

export default function RoomView() {
  const { slug } = useParams();
  const { user } = useAuth();
  const [room, setRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [anon, setAnon] = useState(false);
  const [typing, setTyping] = useState(null);
  const [connected, setConnected] = useState(false);
  const endRef = useRef(null);
  const typingTimer = useRef(null);

  useEffect(() => {
    let cancelled = false;
    api.get(`/rooms/${slug}/messages`).then((r) => {
      if (cancelled) return;
      setRoom(r.data.room);
      setMessages(r.data.messages);
    });

    const socket = getSocket();
    if (!socket) return;

    const onConnect = () => {
      setConnected(true);
      socket.emit("room:join", slug);
    };
    const onMessage = (msg) => setMessages((m) => [...m, msg]);
    const onTyping = ({ username }) => {
      setTyping(username);
      clearTimeout(typingTimer.current);
      typingTimer.current = setTimeout(() => setTyping(null), 2000);
    };

    if (socket.connected) onConnect();
    socket.on("connect", onConnect);
    socket.on("room:message", onMessage);
    socket.on("room:typing", onTyping);

    return () => {
      cancelled = true;
      socket.off("connect", onConnect);
      socket.off("room:message", onMessage);
      socket.off("room:typing", onTyping);
      socket.emit("room:leave", slug);
    };
  }, [slug]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = () => {
    if (!input.trim()) return;
    const socket = getSocket();
    if (socket && socket.connected) {
      socket.emit("room:send", { slug, content: input, anonymous: anon });
    } else {
      api.post(`/rooms/${slug}/messages`, { content: input, anonymous: anon }).then((r) => {
        setMessages((m) => [...m, r.data]);
      });
    }
    setInput("");
  };

  const onInputChange = (e) => {
    setInput(e.target.value);
    const socket = getSocket();
    if (socket && socket.connected) socket.emit("room:typing", { slug });
  };

  if (!room) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
      <style>{styles}</style>
      <div className="rv-loading">
        <div className="rv-spinner" />
        <p>Chargement du salon…</p>
      </div>
    </div>
  );

  return (
    <div className="rv-page">
      <style>{styles}</style>

      <div className="rv-bg" style={{ "--room-color": room.color }} />

      <div className="rv-container">

        {/* Back link */}
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Link to="/rooms" className="rv-back">
            ← Salons
          </Link>
        </motion.div>

        {/* Room header */}
        <motion.div
          className="rv-header"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          style={{ "--room-color": room.color }}
        >
          <div className="rv-header-glow" style={{ background: room.color }} />

          <div className="rv-header-left">
            <div className="rv-emoji-wrap" style={{ borderColor: room.color + "55" }}>
              <span className="rv-emoji">{room.emoji}</span>
            </div>
            <div>
              <h1 className="rv-room-name">{room.name}</h1>
              <p className="rv-room-desc">{room.description}</p>
            </div>
          </div>

          <div className={`rv-status ${connected ? "rv-status--live" : "rv-status--offline"}`}>
            <span className="rv-status-dot" />
            {connected ? "En direct" : "Hors ligne"}
          </div>
        </motion.div>

        {/* Chat area */}
        <motion.div
          className="rv-chat"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.1, ease: "easeOut" }}
        >
          {/* Messages */}
          <div className="rv-messages">
            {messages.length === 0 && (
              <div className="rv-empty">
                <span style={{ fontSize: "2.2rem" }}>{room.emoji}</span>
                <p>Sois le premier à écrire ici</p>
              </div>
            )}

            <AnimatePresence initial={false}>
              {messages.map((m) => {
                const isMe = m.user === user._id || m.user?._id === user._id;
                return (
                  <motion.div
                    key={m._id}
                    className={`rv-msg-row ${isMe ? "rv-msg-row--me" : ""}`}
                    initial={{ opacity: 0, y: 10, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.25, ease: "easeOut" }}
                  >
                    {!isMe && (
                      <div
                        className="rv-avatar"
                        style={{ background: `${m.auraColor || room.color}33`, color: m.auraColor || room.color }}
                      >
                        {(m.anonymous ? "A" : m.username?.[0] || "?")}
                      </div>
                    )}

                    <div className={`rv-bubble ${isMe ? "rv-bubble--me" : "rv-bubble--them"}`}
                      style={!isMe ? { borderLeftColor: m.auraColor || room.color } : {}}
                    >
                      <div className="rv-bubble-meta">
                        <span className="rv-bubble-author">
                          {m.anonymous ? "Anonyme" : m.username}
                        </span>
                        <span className="rv-bubble-time">
                          {new Date(m.createdAt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                      <p className="rv-bubble-text">{m.content}</p>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {typing && (
              <motion.div
                className="rv-typing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <span className="rv-typing-dots">
                  <span /><span /><span />
                </span>
                <span>{typing} est en train d'écrire…</span>
              </motion.div>
            )}

            <div ref={endRef} />
          </div>

          {/* Input bar */}
          <div className="rv-input-bar">
            <label className="rv-anon-toggle">
              <input
                type="checkbox"
                checked={anon}
                onChange={(e) => setAnon(e.target.checked)}
              />
              <span className={`rv-anon-pill ${anon ? "rv-anon-pill--active" : ""}`}>
                Anonyme
              </span>
            </label>

            <div className="rv-input-row">
              <input
                className="rv-input"
                placeholder={`Écrire dans ${room.name}…`}
                value={input}
                onChange={onInputChange}
                onKeyDown={(e) => e.key === "Enter" && send()}
              />
              <button
                className="rv-send-btn"
                onClick={send}
                disabled={!input.trim()}
                style={{ "--room-color": room.color }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              </button>
            </div>
          </div>
        </motion.div>

      </div>
    </div>
  );
}

const styles = `
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400;1,600&family=DM+Sans:wght@300;400;500;600;700&display=swap');

.rv-page {
  --burgundy: #4A0E1A;
  --wine: #7B1E32;
  --rose: #C8506A;
  --cream: #FDF6EE;
  --caramel: #C8633A;
  --caramel-light: #E8936A;
  --text: rgba(253,246,238,0.88);
  --text-soft: rgba(253,246,238,0.55);
  --text-dim: rgba(253,246,238,0.35);
  --glass: rgba(255,255,255,0.055);
  --glass-border: rgba(255,255,255,0.1);

  min-height: 100vh;
  background: #0D0608;
  color: var(--cream);
  font-family: 'DM Sans', sans-serif;
  position: relative;
}

.rv-bg {
  position: fixed;
  inset: 0;
  background:
    radial-gradient(ellipse 70% 50% at 10% 0%, rgba(123,30,50,0.35), transparent 55%),
    radial-gradient(ellipse 50% 40% at 90% 90%, rgba(200,99,58,0.15), transparent 50%),
    #0D0608;
  z-index: 0;
  pointer-events: none;
}

.rv-container {
  position: relative;
  z-index: 1;
  max-width: 820px;
  margin: 0 auto;
  padding: 32px 24px 48px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* Back */
.rv-back {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: var(--text-soft);
  text-decoration: none;
  font-size: 0.84rem;
  font-weight: 600;
  transition: color 0.2s ease;
  margin-bottom: 4px;
}
.rv-back:hover { color: var(--cream); }

/* Header */
.rv-header {
  position: relative;
  overflow: hidden;
  padding: 22px 24px;
  border-radius: 26px;
  background: var(--glass);
  border: 1px solid var(--glass-border);
  backdrop-filter: blur(22px);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.rv-header-glow {
  position: absolute;
  top: -80px;
  right: -80px;
  width: 220px;
  height: 220px;
  border-radius: 50%;
  opacity: 0.18;
  filter: blur(60px);
  pointer-events: none;
}

.rv-header-left {
  display: flex;
  align-items: center;
  gap: 16px;
  position: relative;
}

.rv-emoji-wrap {
  width: 56px;
  height: 56px;
  border-radius: 18px;
  border: 1px solid;
  display: grid;
  place-items: center;
  background: rgba(255,255,255,0.06);
  flex-shrink: 0;
}

.rv-emoji { font-size: 1.9rem; line-height: 1; }

.rv-room-name {
  font-family: 'Playfair Display', serif;
  font-size: 1.55rem;
  font-weight: 700;
  margin: 0 0 4px;
  color: var(--cream);
}

.rv-room-desc {
  color: var(--text-soft);
  font-size: 0.85rem;
  margin: 0;
  line-height: 1.4;
}

.rv-status {
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: 0.76rem;
  font-weight: 700;
  padding: 6px 14px;
  border-radius: 999px;
  white-space: nowrap;
  flex-shrink: 0;
  position: relative;
}

.rv-status--live {
  background: rgba(52,199,89,0.12);
  color: #4ade80;
  border: 1px solid rgba(52,199,89,0.25);
}

.rv-status--offline {
  background: rgba(255,200,0,0.1);
  color: #fbbf24;
  border: 1px solid rgba(255,200,0,0.2);
}

.rv-status-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: currentColor;
}

.rv-status--live .rv-status-dot {
  animation: rv-pulse 1.8s ease-in-out infinite;
}

@keyframes rv-pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.5; transform: scale(0.75); }
}

/* Chat */
.rv-chat {
  background: var(--glass);
  border: 1px solid var(--glass-border);
  backdrop-filter: blur(22px);
  border-radius: 26px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 24px 70px rgba(0,0,0,0.4);
}

/* Messages */
.rv-messages {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  min-height: 360px;
  max-height: 58vh;
  display: flex;
  flex-direction: column;
  gap: 8px;
  scrollbar-width: thin;
  scrollbar-color: rgba(255,255,255,0.1) transparent;
}

.rv-messages::-webkit-scrollbar { width: 4px; }
.rv-messages::-webkit-scrollbar-track { background: transparent; }
.rv-messages::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }

.rv-empty {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 60px 20px;
  color: var(--text-dim);
  font-size: 0.9rem;
}

/* Message rows */
.rv-msg-row {
  display: flex;
  align-items: flex-end;
  gap: 8px;
}

.rv-msg-row--me {
  flex-direction: row-reverse;
}

.rv-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  font-size: 0.78rem;
  font-weight: 800;
  flex-shrink: 0;
  text-transform: uppercase;
}

/* Bubbles */
.rv-bubble {
  max-width: 72%;
  padding: 10px 14px;
  border-radius: 18px;
  line-height: 1.45;
}

.rv-bubble--them {
  background: rgba(255,237,218,0.06);
  border-left: 3px solid;
  border-radius: 4px 18px 18px 18px;
}

.rv-bubble--me {
  background: linear-gradient(135deg, var(--caramel), var(--wine));
  border-radius: 18px 18px 4px 18px;
}

.rv-bubble-meta {
  display: flex;
  gap: 8px;
  align-items: baseline;
  margin-bottom: 4px;
}

.rv-bubble-author {
  font-size: 0.72rem;
  font-weight: 700;
  color: var(--text-soft);
}

.rv-bubble--me .rv-bubble-author {
  color: rgba(253,246,238,0.65);
}

.rv-bubble-time {
  font-size: 0.65rem;
  color: var(--text-dim);
}

.rv-bubble--me .rv-bubble-time {
  color: rgba(253,246,238,0.4);
}

.rv-bubble-text {
  margin: 0;
  font-size: 0.93rem;
  color: var(--text);
}

.rv-bubble--me .rv-bubble-text {
  color: var(--cream);
}

/* Typing indicator */
.rv-typing {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--text-dim);
  font-size: 0.78rem;
  font-style: italic;
  padding: 4px 2px;
}

.rv-typing-dots {
  display: flex;
  gap: 3px;
  align-items: center;
}

.rv-typing-dots span {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: var(--text-dim);
  animation: rv-bounce 1.2s ease-in-out infinite;
}

.rv-typing-dots span:nth-child(2) { animation-delay: 0.2s; }
.rv-typing-dots span:nth-child(3) { animation-delay: 0.4s; }

@keyframes rv-bounce {
  0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
  30% { transform: translateY(-4px); opacity: 1; }
}

/* Input bar */
.rv-input-bar {
  padding: 14px 18px 18px;
  border-top: 1px solid var(--glass-border);
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.rv-anon-toggle {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.rv-anon-toggle input[type="checkbox"] {
  display: none;
}

.rv-anon-pill {
  font-size: 0.75rem;
  font-weight: 700;
  padding: 4px 12px;
  border-radius: 999px;
  border: 1px solid rgba(255,255,255,0.12);
  color: var(--text-dim);
  background: transparent;
  transition: all 0.2s ease;
  user-select: none;
}

.rv-anon-pill--active {
  background: rgba(200,80,106,0.2);
  border-color: rgba(200,80,106,0.4);
  color: #f4a0b0;
}

.rv-input-row {
  display: flex;
  gap: 10px;
  align-items: center;
}

.rv-input {
  flex: 1;
  height: 46px;
  border-radius: 999px;
  border: 1px solid rgba(255,255,255,0.12);
  background: rgba(255,255,255,0.065);
  color: var(--cream);
  padding: 0 18px;
  font-family: 'DM Sans', sans-serif;
  font-size: 0.93rem;
  outline: none;
  transition: border-color 0.2s ease;
}

.rv-input::placeholder {
  color: var(--text-dim);
}

.rv-input:focus {
  border-color: rgba(232,147,106,0.4);
}

.rv-send-btn {
  width: 46px;
  height: 46px;
  border-radius: 50%;
  border: none;
  background: linear-gradient(135deg, var(--caramel), var(--rose));
  color: var(--cream);
  display: grid;
  place-items: center;
  cursor: pointer;
  flex-shrink: 0;
  transition: transform 0.2s ease, box-shadow 0.2s ease, opacity 0.2s ease;
}

.rv-send-btn:hover:not(:disabled) {
  transform: scale(1.08);
  box-shadow: 0 8px 24px rgba(200,99,58,0.4);
}

.rv-send-btn:active:not(:disabled) {
  transform: scale(0.96);
}

.rv-send-btn:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

/* Loading */
.rv-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  color: rgba(253,246,238,0.4);
  font-family: 'DM Sans', sans-serif;
  font-size: 0.88rem;
}

.rv-spinner {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 2px solid rgba(255,255,255,0.08);
  border-top-color: #C8633A;
  animation: rv-spin 0.8s linear infinite;
}

@keyframes rv-spin {
  to { transform: rotate(360deg); }
}

@media (max-width: 640px) {
  .rv-container { padding: 16px 14px 32px; }
  .rv-header { flex-direction: column; align-items: flex-start; }
  .rv-bubble { max-width: 88%; }
  .rv-messages { max-height: 50vh; }
}
`;