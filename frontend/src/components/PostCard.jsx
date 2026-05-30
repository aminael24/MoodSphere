import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import api from "../utils/api.js";
import { meta } from "../utils/emotions.js";
import { useAuth } from "../context/AuthContext.jsx";
import ReportButton from "./ReportButton.jsx";

const VISIBILITY_META = {
  public: { icon: "🌍", label: "Public" },
  followers: { icon: "👥", label: "Abonnés" },
  private: { icon: "🔒", label: "Privé" },
};

export default function PostCard({ post, index = 0, onDelete }) {
  const { user } = useAuth();
  const [likes, setLikes] = useState(post.likes || []);
  const [comments, setComments] = useState(post.comments || []);
  const [commentText, setCommentText] = useState("");
  const [showComments, setShowComments] = useState(false);
  const [anonComment, setAnonComment] = useState(false);

  const emotion = post.aiAnalysis?.dominantEmotion || "calm";
  const m = meta(emotion);
  const v = VISIBILITY_META[post.visibility] || VISIBILITY_META.public;
  const liked = likes.some((l) => l === user?._id || l?._id === user?._id);
  const isOwner = (post.author === user?._id) || (post.author?._id === user?._id);
  const initials = (post.authorUsername || "?")[0].toUpperCase();

  const toggleLike = async () => {
    const r = await api.post(`/posts/${post._id}/like`);
    setLikes(r.data.likes);
  };

  const addComment = async () => {
    if (!commentText.trim()) return;
    const r = await api.post(`/posts/${post._id}/comments`, {
      content: commentText,
      anonymous: anonComment,
    });
    setComments(r.data);
    setCommentText("");
  };

  const remove = async () => {
    if (!confirm("Supprimer ce post ?")) return;
    await api.delete(`/posts/${post._id}`);
    onDelete?.(post._id);
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.55, delay: Math.min(index * 0.05, 0.4) }}
      whileHover={{ y: -4 }}
      className="glass"
      style={{
        padding: 22,
        position: "relative",
        overflow: "hidden",
        borderLeft: `3px solid ${post.auraColor || m.color}`,
      }}
    >
      {/* Lueur d'aura */}
      <div style={{
        position: "absolute", top: -40, right: -40, width: 160, height: 160,
        borderRadius: "50%", background: post.auraColor || m.color,
        filter: "blur(55px)", opacity: 0.35, pointerEvents: "none",
      }} />

      {/* Header */}
      <div className="row" style={{ justifyContent: "space-between", marginBottom: 12, flexWrap: "wrap", gap: 8 }}>
        <div className="row gap-12">
          {post.anonymous ? (
            <div className="avatar" style={{ background: "linear-gradient(135deg, var(--burgundy), var(--wine))" }}>?</div>
          ) : post.author ? (
            <Link to={`/u/${post.author}`}>
              <div className="avatar">
                {post.authorImage ? (
                  <img src={post.authorImage} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%" }} />
                ) : initials}
              </div>
            </Link>
          ) : (
            <div className="avatar">{initials}</div>
          )}
          <div>
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 600, color: "var(--cream)" }}>
              {post.anonymous ? "Anonyme" : post.authorUsername}
            </div>
            <div className="text-dim" style={{ fontSize: "0.76rem" }}>
              {new Date(post.createdAt).toLocaleString("fr-FR", { dateStyle: "medium", timeStyle: "short" })}
              <span style={{ marginLeft: 8 }}>· {v.icon} {v.label}</span>
            </div>
          </div>
        </div>
        <span className="emotion-badge" style={{ color: m.color }}>
          <span className="emotion-dot" style={{ background: m.color }} />
          {m.emoji} {m.label}
        </span>
      </div>

      {/* Contenu */}
      <p style={{ fontSize: "1rem", lineHeight: 1.65, marginBottom: 14, color: "var(--cream-soft)" }}>
        {post.content}
      </p>

      {/* Recommandation */}
      {post.recommendations?.playlistName && (
        <div className="row gap-12" style={{
          padding: "10px 14px", borderRadius: 14, marginBottom: 14,
          background: "rgba(255, 237, 218, 0.04)", border: "1px solid var(--glass-border)",
        }}>
          <span style={{ fontSize: "1.3rem" }}>🎵</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: "0.82rem", fontWeight: 600 }}>
              Recommandé : {post.recommendations.playlistName}
            </div>
            <div className="text-dim" style={{ fontSize: "0.76rem" }}>
              {post.recommendations.activity}
            </div>
          </div>
          {post.recommendations.playlist && (
            <a className="btn btn-sm" href={post.recommendations.playlist} target="_blank" rel="noreferrer">
              Écouter
            </a>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="row gap-16" style={{ fontSize: "0.85rem" }}>
        <button onClick={toggleLike} className="row gap-8" style={{ background: "none", border: "none", color: liked ? m.color : "var(--text-dim)", cursor: "pointer", fontFamily: "var(--font-body)", fontSize: "0.88rem" }}>
          {liked ? "❤️" : "🤍"} {likes.length}
        </button>
        <button onClick={() => setShowComments((s) => !s)} className="row gap-8" style={{ background: "none", border: "none", color: "var(--text-dim)", cursor: "pointer", fontFamily: "var(--font-body)", fontSize: "0.88rem" }}>
          💬 {comments.length}
        </button>
        {isOwner ? (
          <button onClick={remove} style={{ marginLeft: "auto", background: "none", border: "none", color: "var(--text-dim)", cursor: "pointer", fontSize: "0.82rem" }}>
             Supprimer
          </button>
        ) : (
          <div style={{ marginLeft: "auto" }}>
            <ReportButton targetType="post" targetId={post._id} />
          </div>
        )}
      </div>

      {/* Commentaires */}
      {showComments && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} style={{ marginTop: 14, overflow: "hidden" }}>
          {comments.map((c, i) => (
            <div key={i} style={{ padding: "8px 0", borderTop: "1px solid var(--glass-border)" }}>
              <span style={{ fontWeight: 600, fontSize: "0.85rem" }}>
                {c.anonymous ? "Anonyme" : c.authorUsername}{" "}
              </span>
              <span className="text-soft" style={{ fontSize: "0.85rem" }}>{c.content}</span>
            </div>
          ))}
          <div className="row gap-8 mt-8" style={{ alignItems: "stretch" }}>
            <input
              className="input"
              placeholder="Ajouter un commentaire…"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addComment()}
              style={{ padding: "10px 14px" }}
            />
            <button className="btn" onClick={addComment} style={{ padding: "10px 16px" }}>OK</button>
          </div>
          <label className="row gap-8 text-dim mt-8" style={{ fontSize: "0.78rem", cursor: "pointer" }}>
            <input type="checkbox" checked={anonComment} onChange={(e) => setAnonComment(e.target.checked)} />
            Commenter anonymement
          </label>
        </motion.div>
      )}
    </motion.article>
  );
}
