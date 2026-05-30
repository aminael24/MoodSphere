import { motion, AnimatePresence } from "framer-motion";

/**
 * Modal de securite affichee quand le service detecte des signaux de detresse.
 * IMPORTANT : ce composant n'affiche QUE des ressources d'orientation, jamais
 * de diagnostic, jamais de methodes a risque, jamais de "conseil medical".
 */
export default function CrisisModal({ data, onClose }) {
  if (!data) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        style={{
          position: "fixed", inset: 0, zIndex: 2000,
          background: "rgba(20, 5, 8, 0.85)",
          backdropFilter: "blur(8px)",
          display: "grid", placeItems: "center",
          padding: 20,
        }}
      >
        <motion.div
          initial={{ scale: 0.92, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.92, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="glass"
          style={{
            maxWidth: 560,
            width: "100%",
            padding: 32,
            border: "2px solid var(--caramel)",
            boxShadow: "0 30px 80px rgba(64,18,22,0.7)",
          }}
        >
          <div style={{ fontSize: "2.5rem", textAlign: "center", marginBottom: 10 }}>💛</div>
          <h2 style={{ fontSize: "1.6rem", textAlign: "center" }}>
            {data.title || "Tu n'es pas seul·e."}
          </h2>

          <p className="text-soft mt-16" style={{ fontSize: "0.95rem", lineHeight: 1.6 }}>
            {data.message}
          </p>

          <div style={{ marginTop: 22 }}>
            {(data.resources || []).map((r, i) => (
              <div
                key={i}
                className="glass"
                style={{ padding: 16, marginBottom: 10, borderLeft: "3px solid var(--caramel)" }}
              >
                <div style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: "0.95rem" }}>
                  {r.label}
                </div>
                {r.phone && (
                  <div style={{ fontFamily: "var(--font-display)", fontSize: "1.1rem", marginTop: 4, color: "var(--caramel-light)" }}>
                    📞 {r.phone}
                  </div>
                )}
                {r.url && (
                  <a href={r.url} target="_blank" rel="noreferrer" className="text-soft mt-4" style={{ fontSize: "0.85rem", display: "block", textDecoration: "underline" }}>
                    {r.url}
                  </a>
                )}
                {r.description && (
                  <div className="text-dim mt-4" style={{ fontSize: "0.82rem" }}>
                    {r.description}
                  </div>
                )}
              </div>
            ))}
          </div>

          {data.suggestions?.length > 0 && (
            <>
              <h4 className="mt-24" style={{ fontSize: "0.95rem" }}>Quelques gestes apaisants :</h4>
              <ul className="text-soft" style={{ paddingLeft: 22, marginTop: 8, fontSize: "0.88rem", lineHeight: 1.7 }}>
                {data.suggestions.map((s, i) => <li key={i}>{s}</li>)}
              </ul>
            </>
          )}

          <p className="text-dim mt-24" style={{ fontSize: "0.75rem", lineHeight: 1.5, fontStyle: "italic", borderTop: "1px solid var(--glass-border)", paddingTop: 14 }}>
            {data.disclaimer}
          </p>

          <button className="btn btn-block mt-24" onClick={onClose}>
            J'ai compris, merci
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
