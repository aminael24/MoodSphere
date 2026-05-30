import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../utils/api.js";
import { useAuth } from "../context/AuthContext.jsx";
import AuraOrb from "../components/AuraOrb.jsx";
import PostCard from "../components/PostCard.jsx";
import Toast from "../components/Toast.jsx";
import { meta } from "../utils/emotions.js";

export default function UserProfile() {
  const { id } = useParams();
  const { user: me } = useAuth();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [toast, setToast] = useState("");
  const [status, setStatus] = useState("none"); // none | following | requested

  const load = async () => {
    const r = await api.get(`/users/${id}`);
    setProfile(r.data);

    const amFollower = r.data.followers?.some((f) => f._id === me._id);
    const amRequested = r.data.followRequests?.some((f) => f._id === me._id || f === me._id);
    setStatus(amFollower ? "following" : amRequested ? "requested" : "none");

    const pr = await api.get(`/posts/user/${id}`);
    setPosts(pr.data);
  };

  useEffect(() => { load(); }, [id]);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2200);
  };

  const follow = async () => {
    const r = await api.post(`/users/${id}/follow`);
    setStatus(r.data.status === "requested" ? "requested" : "following");
    showToast(r.data.status === "requested" ? "Demande envoyée" : "Tu suis maintenant " + profile.username);
    load();
  };

  const unfollow = async () => {
    await api.post(`/users/${id}/unfollow`);
    setStatus("none");
    showToast("Désabonné");
    load();
  };

  if (!profile) return <div className="page center"><p className="text-dim">Chargement…</p></div>;

  const m = meta(profile.dominantEmotion);
  const initials = (profile.fullName || profile.username || "?")[0].toUpperCase();
  const isSelf = profile._id === me._id;

  return (
    <div className="page">
      <div className="container">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass" style={{ padding: 30, marginBottom: 24, display: "grid", gridTemplateColumns: "auto 1fr auto", gap: 30, alignItems: "center" }}>
          {profile.profileImage ? (
            <img src={profile.profileImage} alt="" style={{ width: 140, height: 140, borderRadius: "50%", objectFit: "cover", border: `4px solid ${profile.auraColor}`, boxShadow: `0 0 30px ${profile.auraColor}88` }} />
          ) : (
            <AuraOrb color={profile.auraColor} size={140} emoji={m.emoji} />
          )}

          <div>
            <h1 style={{ fontSize: "2rem" }}>{profile.fullName}</h1>
            <div className="text-dim">@{profile.username} {profile.accountType === "private" && "· 🔒"}</div>
            <span className="emotion-badge mt-12" style={{ color: m.color }}>
              <span className="emotion-dot" style={{ background: m.color }} />
              {m.label}
            </span>
            <p className="text-soft mt-16" style={{ fontSize: "0.95rem" }}>
              {profile.bio || "Aucune bio."}
            </p>
            <div className="row gap-16 mt-16" style={{ fontSize: "0.85rem" }}>
              <span><strong>{profile.followers?.length || 0}</strong> abonnés</span>
              <span><strong>{profile.following?.length || 0}</strong> abonnements</span>
            </div>
          </div>

          {!isSelf && (
            <div>
              {status === "following" ? (
                <button className="btn btn-ghost" onClick={unfollow}>✓ Abonné</button>
              ) : status === "requested" ? (
                <button className="btn btn-ghost" disabled>En attente</button>
              ) : (
                <button className="btn" onClick={follow}>+ Suivre</button>
              )}
            </div>
          )}
        </motion.div>

        <h3 style={{ marginBottom: 16 }}>Publications</h3>
        {profile.accountType === "private" && status !== "following" && !isSelf ? (
          <p className="text-dim center" style={{ padding: 40, textAlign: "center" }}>
            🔒 Ce compte est privé. Suis-le pour voir ses publications.
          </p>
        ) : (
          <div className="grid" style={{ gap: 18 }}>
            {posts.map((p, i) => <PostCard key={p._id} post={p} index={i} />)}
            {posts.length === 0 && <p className="text-dim">Aucune publication.</p>}
          </div>
        )}
      </div>
      <Toast message={toast} />
    </div>
  );
}
