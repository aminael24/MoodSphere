import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../utils/api.js";
import CrisisModal from "../components/CrisisModal.jsx";
import Sidebar from "../components/Sidebar.jsx";

export default function Therapist() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [crisis, setCrisis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [activeSession, setActiveSession] = useState(null);
  const [historyOpen, setHistoryOpen] = useState(true);

  const messagesRef = useRef(null);

  const load = async (sessionId = null) => {
    try {
      setLoading(true);
      setError("");

      const url = sessionId ? `/chat?session=${sessionId}` : "/chat";
      const response = await api.get(url);

      setMessages(response.data || []);
    } catch (err) {
      console.error("Erreur chargement conversation:", err);
      setError("Impossible de charger la conversation.");
    } finally {
      setLoading(false);
    }
  };

  const loadSessions = async () => {
    try {
      const response = await api.get("/chat/sessions");
      setSessions(response.data || []);
    } catch (err) {
      console.error("Erreur chargement sessions:", err);
    }
  };

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "auto",
    });

    load();
    loadSessions();
  }, []);

  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, [messages, busy]);

  const send = async () => {
    if (!input.trim()) return;

    const userText = input.trim();

    setInput("");
    setBusy(true);
    setError("");

    const temporaryMessage = {
      _id: "tmp-" + Date.now(),
      role: "user",
      content: userText,
      createdAt: new Date(),
    };

    setMessages((oldMessages) => [...oldMessages, temporaryMessage]);

    try {
      const response = await api.post("/chat", {
        content: userText,
      });

      setMessages((oldMessages) => {
        const filtered = oldMessages.filter(
          (message) => !String(message._id).startsWith("tmp-")
        );

        return [
          ...filtered,
          response.data.userMessage,
          response.data.botMessage,
        ];
      });

      if (response.data.crisisResources) {
        setCrisis(response.data.crisisResources);
      }

      await loadSessions();
    } catch (err) {
      console.error("Erreur envoi message:", err);

      setMessages((oldMessages) =>
        oldMessages.filter(
          (message) => !String(message._id).startsWith("tmp-")
        )
      );

      setError("Impossible d'envoyer le message.");
    } finally {
      setBusy(false);
    }
  };

  const deleteSession = async (e, sessionId) => {
    e.stopPropagation();

    if (!confirm("Effacer cette conversation ?")) return;

    try {
      await api.delete(sessionId ? `/chat?session=${sessionId}` : "/chat");

      if (!sessionId || activeSession === sessionId) {
        setMessages([]);
        setActiveSession(null);
      }

      await loadSessions();
    } catch (err) {
      console.error("Erreur suppression conversation:", err);
      setError("Impossible d'effacer cette conversation.");
    }
  };

  const copyText = async (text, id) => {
    try {
      await navigator.clipboard.writeText(text);

      setCopied(id);

      setTimeout(() => {
        setCopied(null);
      }, 2000);
    } catch (err) {
      console.error("Erreur copie:", err);
      setError("Impossible de copier le texte.");
    }
  };

  const switchSession = (session) => {
    setActiveSession(session._id);
    load(session._id);
  };

  const newChat = () => {
    setActiveSession(null);
    setMessages([]);

    window.scrollTo({
      top: 0,
      behavior: "auto",
    });
  };

  const formatSessionDate = (date) => {
    if (!date) return "Aujourd'hui";

    const d = new Date(date);
    const now = new Date();
    const diff = now - d;

    if (diff < 86400000) return "Aujourd'hui";
    if (diff < 172800000) return "Hier";

    return d.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
    });
  };

  const getSessionPreview = (session) => {
    if (session.preview) return session.preview;
    if (session.lastMessage) return session.lastMessage;
    return "Nouvelle conversation";
  };

  return (
    <div className="th-page">
      <style>{styles}</style>

      <div className="th-bg" />

      <Sidebar />

      <main className="th-main">
        <aside
          className={`th-history ${
            historyOpen ? "th-history--open" : "th-history--closed"
          }`}
        >
          <div className="th-history-top">
            {historyOpen && (
              <span className="th-history-label">
                Historique
              </span>
            )}

            <button
              className="th-history-toggle"
              onClick={() => setHistoryOpen(!historyOpen)}
              title={historyOpen ? "Réduire" : "Historique"}
            >
              {historyOpen ? (
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              ) : (
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              )}
            </button>
          </div>

          {historyOpen && (
            <>
              <button className="th-new-btn" onClick={newChat}>
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>

                Nouvelle conversation
              </button>

              <div className="th-history-list">
                {!activeSession && messages.length > 0 && (
                  <div className="th-session th-session--active">
                    <div className="th-session-icon">
                      <svg
                        width="13"
                        height="13"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                      </svg>
                    </div>

                    <div className="th-session-body">
                      <span className="th-session-preview">
                        {messages
                          .find((message) => message.role === "user")
                          ?.content?.slice(0, 32) || "Conversation en cours"}
                        …
                      </span>

                      <span className="th-session-date">
                        Maintenant
                      </span>
                    </div>

                    <button
                      className="th-session-del"
                      onClick={(e) => deleteSession(e, null)}
                      title="Effacer"
                    >
                      <svg
                        width="11"
                        height="11"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                        <path d="M10 11v6" />
                        <path d="M14 11v6" />
                      </svg>
                    </button>
                  </div>
                )}

                {sessions.length === 0 && messages.length === 0 && (
                  <div className="th-history-empty">
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    </svg>

                    <p>Aucune conversation</p>
                  </div>
                )}

                {sessions.map((session) => (
                  <div
                    key={session._id}
                    className={`th-session ${
                      activeSession === session._id ? "th-session--active" : ""
                    }`}
                    onClick={() => switchSession(session)}
                  >
                    <div className="th-session-icon">
                      <svg
                        width="13"
                        height="13"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                      </svg>
                    </div>

                    <div className="th-session-body">
                      <span className="th-session-preview">
                        {getSessionPreview(session).slice(0, 32)}
                        {getSessionPreview(session).length > 32 ? "…" : ""}
                      </span>

                      <span className="th-session-date">
                        {formatSessionDate(
                          session.createdAt || session.updatedAt
                        )}
                      </span>
                    </div>

                    <button
                      className="th-session-del"
                      onClick={(e) => deleteSession(e, session._id)}
                      title="Effacer"
                    >
                      <svg
                        width="11"
                        height="11"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                        <path d="M10 11v6" />
                        <path d="M14 11v6" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}
        </aside>

        <div className="th-center">
          <motion.div
            className="th-header"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <span className="th-tag">
              MoodSphere AI
            </span>

            <h1>
              AI Therapist <em>Bot</em>
            </h1>

            <p>
              Un espace d'écoute bienveillante pour exprimer ce que tu ressens
              et recevoir une réponse douce, claire et non jugeante.
            </p>
          </motion.div>

          {error && (
            <div className="th-error">
              {error}
            </div>
          )}

          <motion.div
            className="th-chat"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="th-chat-top">
              <div className="th-bot-avatar">
                🤖
              </div>

              <div>
                <h2>
                  Conversation
                </h2>

                <span>
                  {busy ? "Le bot réfléchit..." : "Disponible"}
                </span>
              </div>
            </div>

            <div className="th-messages" ref={messagesRef}>
              {loading && (
                <div className="th-loading">
                  Chargement de la conversation...
                </div>
              )}

              {!loading && messages.length === 0 && (
                <div className="th-empty">
                  <div className="th-empty-icon">
                    👋
                  </div>

                  <h3>
                    Salut, je suis là pour t'écouter
                  </h3>

                  <p>
                    Écris simplement ce que tu ressens en ce moment. Tu peux
                    parler librement, sans jugement.
                  </p>
                </div>
              )}

              <AnimatePresence>
                {messages.map((message) => {
                  const isUser = message.role === "user";

                  return (
                    <motion.div
                      key={message._id}
                      className={`th-msg-wrap ${
                        isUser ? "th-msg-wrap--user" : "th-msg-wrap--bot"
                      }`}
                      initial={{ opacity: 0, y: 10, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.22 }}
                    >
                      <div className="th-msg-row">
                        {!isUser && (
                          <div className="th-avatar">
                            🤖
                          </div>
                        )}

                        <div
                          className={
                            isUser
                              ? "th-bubble th-bubble--user"
                              : "th-bubble th-bubble--bot"
                          }
                        >
                          {!isUser && (
                            <div className="th-bubble-label">
                              AI Therapist
                            </div>
                          )}

                          <p>{message.content}</p>
                        </div>
                      </div>

                      {!isUser && (
                        <div className="th-msg-actions">
                          <button
                            className={`th-copy-btn ${
                              copied === message._id ? "th-copy-btn--done" : ""
                            }`}
                            onClick={() =>
                              copyText(message.content, message._id)
                            }
                          >
                            {copied === message._id ? (
                              <>
                                <svg
                                  width="13"
                                  height="13"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2.5"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                >
                                  <polyline points="20 6 9 17 4 12" />
                                </svg>
                                Copié !
                              </>
                            ) : (
                              <>
                                <svg
                                  width="13"
                                  height="13"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                >
                                  <rect
                                    x="9"
                                    y="9"
                                    width="13"
                                    height="13"
                                    rx="2"
                                    ry="2"
                                  />
                                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                                </svg>
                                Copier
                              </>
                            )}
                          </button>
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </AnimatePresence>

              {busy && (
                <div className="th-msg-row">
                  <div className="th-avatar">
                    🤖
                  </div>

                  <div className="th-bubble th-bubble--bot th-typing">
                    <span />
                    <span />
                    <span />
                  </div>
                </div>
              )}
            </div>

            <div className="th-input-bar">
              <input
                className="th-input"
                placeholder="Écris ce que tu ressens..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !busy) {
                    send();
                  }
                }}
                disabled={busy}
              />

              <button
                className="th-send"
                disabled={busy || !input.trim()}
                onClick={send}
              >
                {busy ? (
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  >
                    <circle
                      cx="12"
                      cy="12"
                      r="10"
                      strokeDasharray="30"
                      strokeDashoffset="10"
                      style={{
                        animation: "th-spin 1s linear infinite",
                      }}
                    />
                  </svg>
                ) : (
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="22" y1="2" x2="11" y2="13" />
                    <polygon points="22 2 15 22 11 13 2 9 22 2" />
                  </svg>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      </main>

      <CrisisModal data={crisis} onClose={() => setCrisis(null)} />
    </div>
  );
}

const styles = `
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400;1,600&family=DM+Sans:wght@300;400;500;600;700&display=swap');

.th-page {
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

.th-bg {
  position: fixed;
  inset: 0;
  background:
    radial-gradient(ellipse 80% 60% at 15% 5%, rgba(123,30,50,0.38), transparent 60%),
    radial-gradient(ellipse 60% 50% at 85% 85%, rgba(200,99,58,0.18), transparent 55%),
    radial-gradient(ellipse 50% 40% at 50% 50%, rgba(200,80,106,0.1), transparent 55%),
    #0D0608;
  z-index: 0;
}

.th-main {
  position: relative;
  z-index: 1;
  margin-left: 298px;
  min-height: 100vh;
  display: flex;
  flex-direction: row-reverse;
  align-items: stretch;
}

.th-history {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  background: rgba(255,255,255,0.038);
  border-left: 1px solid rgba(255,255,255,0.08);
  transition: width 0.25s ease;
  overflow: hidden;
}

.th-history--open {
  width: 248px;
}

.th-history--closed {
  width: 52px;
}

.th-history-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 14px 12px;
  border-bottom: 1px solid rgba(255,255,255,0.07);
  flex-shrink: 0;
}

.th-history-label {
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: rgba(253,246,238,0.38);
  white-space: nowrap;
}

.th-history-toggle {
  width: 28px;
  height: 28px;
  border-radius: 8px;
  border: 1px solid rgba(255,255,255,0.1);
  background: transparent;
  color: rgba(253,246,238,0.45);
  display: grid;
  place-items: center;
  cursor: pointer;
  transition: background 0.18s, color 0.18s;
  flex-shrink: 0;
}

.th-history-toggle:hover {
  background: rgba(255,255,255,0.08);
  color: var(--cream);
}

.th-history--closed .th-history-top {
  justify-content: center;
  padding: 20px 0 12px;
}

.th-new-btn {
  display: flex;
  align-items: center;
  gap: 7px;
  margin: 10px 10px 6px;
  padding: 9px 12px;
  border-radius: 12px;
  border: 1px solid rgba(232,147,106,0.22);
  background: rgba(200,99,58,0.12);
  color: var(--caramel-light);
  font-size: 0.78rem;
  font-weight: 700;
  cursor: pointer;
  font-family: 'DM Sans', sans-serif;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.th-new-btn:hover {
  background: rgba(200,99,58,0.22);
  border-color: rgba(232,147,106,0.38);
  color: var(--cream);
}

.th-history-list {
  flex: 1;
  overflow-y: auto;
  padding: 4px 8px 16px;
  scrollbar-width: thin;
  scrollbar-color: rgba(255,255,255,0.06) transparent;
}

.th-history-list::-webkit-scrollbar {
  width: 3px;
}

.th-history-list::-webkit-scrollbar-thumb {
  background: rgba(255,255,255,0.07);
  border-radius: 3px;
}

.th-history-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 36px 12px;
  color: rgba(253,246,238,0.22);
  font-size: 0.78rem;
  text-align: center;
}

.th-history-empty p {
  margin: 0;
}

.th-session {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 9px 8px;
  border-radius: 10px;
  cursor: pointer;
  border: 1px solid transparent;
  margin-bottom: 2px;
  transition: background 0.15s ease;
}

.th-session:hover {
  background: rgba(255,255,255,0.05);
}

.th-session--active {
  background: rgba(200,99,58,0.13);
  border-color: rgba(232,147,106,0.18);
}

.th-session-icon {
  color: rgba(253,246,238,0.3);
  flex-shrink: 0;
  display: grid;
  place-items: center;
}

.th-session--active .th-session-icon {
  color: var(--caramel-light);
}

.th-session-body {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.th-session-preview {
  font-size: 0.79rem;
  color: rgba(253,246,238,0.6);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-weight: 500;
}

.th-session--active .th-session-preview {
  color: var(--cream);
}

.th-session-date {
  font-size: 0.66rem;
  color: rgba(253,246,238,0.28);
}

.th-session-del {
  opacity: 0;
  background: transparent;
  border: none;
  color: rgba(255,180,180,0.6);
  padding: 3px 5px;
  border-radius: 6px;
  cursor: pointer;
  display: grid;
  place-items: center;
  transition: opacity 0.15s, background 0.15s;
  flex-shrink: 0;
}

.th-session:hover .th-session-del {
  opacity: 1;
}

.th-session-del:hover {
  background: rgba(255,100,100,0.15);
  color: #ffb4b4;
}

.th-center {
  flex: 1;
  min-width: 0;
  padding: 42px 38px 60px;
  display: flex;
  flex-direction: column;
}

.th-header {
  margin-bottom: 20px;
}

.th-tag {
  color: var(--caramel-light);
  text-transform: uppercase;
  letter-spacing: 0.18em;
  font-size: 0.72rem;
  font-weight: 800;
}

.th-header h1 {
  font-family: 'Playfair Display', serif;
  font-size: 2.6rem;
  font-weight: 400;
  margin: 10px 0 6px;
}

.th-header h1 em {
  color: var(--caramel-light);
}

.th-header p {
  color: rgba(253,246,238,0.55);
  line-height: 1.65;
  max-width: 640px;
}

.th-error {
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,100,100,0.28);
  border-radius: 14px;
  color: #ffb4b4;
  padding: 12px 16px;
  margin-bottom: 16px;
  font-size: 0.87rem;
}

.th-chat {
  background: rgba(255,255,255,0.052);
  border: 1px solid rgba(255,255,255,0.11);
  backdrop-filter: blur(22px);
  box-shadow: 0 24px 70px rgba(0,0,0,0.42);
  border-radius: 28px;
  overflow: hidden;
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 560px;
}

.th-chat-top {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 18px 22px;
  border-bottom: 1px solid rgba(255,255,255,0.08);
  background: rgba(255,255,255,0.03);
}

.th-bot-avatar {
  width: 48px;
  height: 48px;
  border-radius: 16px;
  display: grid;
  place-items: center;
  font-size: 1.65rem;
  background: linear-gradient(135deg, rgba(200,99,58,0.2), rgba(200,80,106,0.16));
  border: 1px solid rgba(255,255,255,0.1);
}

.th-chat-top h2 {
  font-family: 'Playfair Display', serif;
  font-size: 1.35rem;
  font-weight: 400;
  margin: 0 0 3px;
}

.th-chat-top span {
  color: rgba(253,246,238,0.4);
  font-size: 0.78rem;
}

.th-messages {
  flex: 1;
  overflow-y: auto;
  max-height: 56vh;
  min-height: 360px;
  padding: 20px 22px;
  scrollbar-width: thin;
  scrollbar-color: rgba(232,147,106,0.15) transparent;
}

.th-messages::-webkit-scrollbar {
  width: 4px;
}

.th-messages::-webkit-scrollbar-thumb {
  background: rgba(232,147,106,0.22);
  border-radius: 4px;
}

.th-loading,
.th-empty {
  text-align: center;
  color: rgba(253,246,238,0.45);
}

.th-loading {
  padding: 60px 20px;
  font-size: 0.9rem;
}

.th-empty {
  padding: 60px 20px;
}

.th-empty-icon {
  font-size: 2.4rem;
  margin-bottom: 12px;
}

.th-empty h3 {
  font-family: 'Playfair Display', serif;
  font-size: 1.55rem;
  font-weight: 400;
  margin: 0 0 8px;
  color: var(--cream);
}

.th-empty p {
  max-width: 420px;
  margin: 0 auto;
  line-height: 1.6;
}

.th-msg-wrap {
  margin-bottom: 16px;
}

.th-msg-wrap--user {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.th-msg-wrap--bot {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.th-msg-row {
  display: flex;
  align-items: flex-end;
  gap: 9px;
}

.th-msg-actions {
  display: flex;
  gap: 4px;
  margin-top: 5px;
  margin-left: 41px;
}

.th-copy-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  background: transparent;
  border: none;
  color: rgba(253,246,238,0.32);
  font-size: 0.74rem;
  font-weight: 600;
  padding: 3px 6px;
  border-radius: 6px;
  cursor: pointer;
  transition: color 0.18s ease, background 0.18s ease;
  font-family: 'DM Sans', sans-serif;
}

.th-copy-btn:hover {
  color: rgba(253,246,238,0.75);
  background: rgba(255,255,255,0.06);
}

.th-copy-btn--done {
  color: #4ade80;
}

.th-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  background: rgba(255,255,255,0.07);
  border: 1px solid rgba(255,255,255,0.09);
  flex-shrink: 0;
  font-size: 0.9rem;
}

.th-bubble {
  max-width: 74%;
  padding: 11px 15px;
  border-radius: 18px;
  word-break: break-word;
}

.th-bubble--user {
  background: linear-gradient(135deg, var(--caramel), var(--wine));
  color: var(--cream);
  border-bottom-right-radius: 5px;
  box-shadow: 0 12px 30px rgba(0,0,0,0.25);
}

.th-bubble--bot {
  background: rgba(255,255,255,0.062);
  color: rgba(253,246,238,0.84);
  border: 1px solid rgba(255,255,255,0.08);
  border-bottom-left-radius: 5px;
}

.th-bubble-label {
  color: var(--caramel-light);
  font-size: 0.7rem;
  font-weight: 800;
  margin-bottom: 5px;
}

.th-bubble p {
  margin: 0;
  line-height: 1.55;
  font-size: 0.93rem;
  white-space: pre-wrap;
}

.th-typing {
  display: flex;
  gap: 5px;
  align-items: center;
  width: fit-content;
  padding: 12px 15px;
}

.th-typing span {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: rgba(253,246,238,0.45);
  animation: th-bounce 1.2s infinite ease-in-out;
}

.th-typing span:nth-child(2) {
  animation-delay: 0.15s;
}

.th-typing span:nth-child(3) {
  animation-delay: 0.3s;
}

@keyframes th-bounce {
  0%, 80%, 100% {
    transform: translateY(0);
    opacity: 0.35;
  }

  40% {
    transform: translateY(-5px);
    opacity: 1;
  }
}

.th-input-bar {
  display: flex;
  gap: 10px;
  align-items: center;
  padding: 16px 20px 20px;
  border-top: 1px solid rgba(255,255,255,0.08);
  background: rgba(255,255,255,0.03);
}

.th-input {
  flex: 1;
  height: 48px;
  border-radius: 16px;
  border: 1px solid rgba(255,255,255,0.11);
  background: rgba(255,255,255,0.062);
  color: var(--cream);
  padding: 0 16px;
  outline: none;
  font-family: 'DM Sans', sans-serif;
  font-size: 0.93rem;
  transition: border-color 0.2s;
}

.th-input::placeholder {
  color: rgba(253,246,238,0.35);
}

.th-input:focus {
  border-color: rgba(232,147,106,0.5);
  box-shadow: 0 0 0 3px rgba(232,147,106,0.07);
}

.th-send {
  width: 48px;
  height: 48px;
  border: none;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--caramel), var(--rose));
  color: var(--cream);
  display: grid;
  place-items: center;
  cursor: pointer;
  flex-shrink: 0;
  box-shadow: 0 6px 20px rgba(200,80,106,0.22);
  transition: transform 0.2s, box-shadow 0.2s, opacity 0.2s;
}

.th-send:hover:not(:disabled) {
  transform: scale(1.08);
  box-shadow: 0 10px 28px rgba(200,80,106,0.35);
}

.th-send:active:not(:disabled) {
  transform: scale(0.95);
}

.th-send:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

@keyframes th-spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 1100px) {
  .th-history--open {
    width: 210px;
  }
}

@media (max-width: 950px) {
  .th-main {
    margin-left: 0;
    flex-direction: column-reverse;
  }

  .th-history--open,
  .th-history--closed {
    width: 100%;
    border-left: none;
    border-top: 1px solid rgba(255,255,255,0.08);
    max-height: 220px;
  }

  .th-history-list {
    display: flex;
    flex-direction: row;
    gap: 6px;
    overflow-x: auto;
    overflow-y: hidden;
    padding: 4px 10px 10px;
  }

  .th-session {
    min-width: 160px;
  }

  .th-center {
    padding: 24px 20px 32px;
  }
}

@media (max-width: 620px) {
  .th-center {
    padding: 18px 14px 24px;
  }

  .th-header h1 {
    font-size: 2rem;
  }

  .th-bubble {
    max-width: 84%;
  }

  .th-messages {
    max-height: 52vh;
  }
}
`;