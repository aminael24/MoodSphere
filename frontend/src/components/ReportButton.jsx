import { useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import api from "../utils/api.js";

const REASONS = [
  { value: "harassment", label: "Harcèlement" },
  { value: "spam", label: "Spam" },
  { value: "inappropriate", label: "Contenu inapproprié" },
  { value: "self_harm", label: "Sujet d'auto-agression" },
  { value: "misinformation", label: "Désinformation" },
  { value: "other", label: "Autre" },
];

export default function ReportButton({ targetType, targetId, parentPostId, onDone }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("inappropriate");
  const [details, setDetails] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  const submit = async () => {
    setBusy(true); setMsg("");
    try {
      await api.post("/reports", { targetType, targetId, parentPostId, reason, details });
      setMsg("Signalement envoyé. Merci.");
      setTimeout(() => {
        setOpen(false);
        onDone?.();
      }, 1500);
    } catch (err) {
      setMsg(err.response?.data?.message || "Erreur");
    } finally { setBusy(false); }
  };

  return (
    <>
      <button onClick={() => setOpen(true)} style={{
        background: "none", border: "none", color: "var(--text-dim)",
        cursor: "pointer", fontSize: "0.78rem", padding: 4,
      }}>
         Signaler
      </button>

      {typeof window !== "undefined" && createPortal(
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              style={{
                position: "fixed", inset: 0, zIndex: 9999,
                background: "rgba(20,5,8,0.8)", backdropFilter: "blur(6px)",
                display: "grid", placeItems: "center", padding: 20,
              }}
            >
              <motion.div
                initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
                onClick={(e) => e.stopPropagation()}
                className="glass"
                style={{ padding: 28, width: "min(440px, 100%)" }}
              >
                <h3>Signaler ce contenu</h3>
                <p className="text-dim mt-8" style={{ fontSize: "0.85rem" }}>
                  Notre équipe examinera ton signalement. Merci pour ta contribution.
                </p>

                <label className="text-dim mt-16" style={{ fontSize: "0.8rem" }}>Motif</label>
                <select className="select mt-4" value={reason} onChange={(e) => setReason(e.target.value)}>
                  {REASONS.map((r) => (
                    <option 
                      key={r.value} 
                      value={r.value}
                      style={{ 
                        background: "#1a0b0e", // Un fond sombre accordé à ton thème global
                        color: "#ffffff"        // Texte blanc bien visible
                      }}
                    >
                      {r.label}
                    </option>
                  ))}
                </select>

                <label className="text-dim mt-16" style={{ fontSize: "0.8rem" }}>Détails (facultatif)</label>
                <textarea className="input mt-4" rows={3} value={details} onChange={(e) => setDetails(e.target.value)} maxLength={500} />

                {msg && <p className="text-soft mt-12" style={{ fontSize: "0.85rem" }}>{msg}</p>}

                <div className="row gap-8 mt-16" style={{ justifyContent: "flex-end" }}>
                  <button className="btn btn-ghost btn-sm" onClick={() => setOpen(false)}>Annuler</button>
                  <button className="btn btn-sm" disabled={busy} onClick={submit}>
                    {busy ? "..." : "Envoyer"}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
}