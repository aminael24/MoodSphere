import { motion, AnimatePresence } from "framer-motion";
import { useEffect } from "react";

export default function BadgeToast({ badge, onClose }) {
  useEffect(() => {
    if (!badge) return;
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [badge, onClose]);

  return (
    <AnimatePresence>
      {badge && (
        <motion.div
          initial={{ opacity: 0, y: 80, scale: 0.7 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 80, scale: 0.7 }}
          transition={{ type: "spring", stiffness: 220, damping: 18 }}
          onClick={onClose}
          style={{
            position: "fixed",
            bottom: 36,
            left: "50%",
            transform: "translateX(-50%)",
            background: "linear-gradient(135deg, #C8633A, #C8506A)",
            color: "#FDF6EE",
            padding: "18px 26px",
            borderRadius: 22,
            boxShadow: "0 30px 70px rgba(200,99,58,0.45), 0 0 60px rgba(232,147,106,0.35)",
            border: "1px solid rgba(255,255,255,0.18)",
            display: "flex",
            alignItems: "center",
            gap: 16,
            cursor: "pointer",
            zIndex: 9999,
            fontFamily: "'DM Sans', sans-serif",
            maxWidth: 440,
            minWidth: 320,
          }}
        >
          <motion.span
            animate={{ rotate: [0, -12, 12, -12, 12, 0], scale: [1, 1.2, 1, 1.2, 1] }}
            transition={{ duration: 1.3, repeat: Infinity, repeatDelay: 1.2 }}
            style={{ fontSize: "2.6rem", display: "inline-block" }}
          >
            {badge.emoji}
          </motion.span>

          <div style={{ flex: 1 }}>
            <div style={{
              fontSize: "0.7rem", fontWeight: 800, letterSpacing: "0.18em",
              textTransform: "uppercase", opacity: 0.88, marginBottom: 3,
            }}>
              🎉 Nouveau badge
            </div>
            <div style={{
              fontFamily: "'Playfair Display', serif", fontSize: "1.4rem",
              fontWeight: 700, lineHeight: 1.15,
            }}>
              {badge.label}
            </div>
            <div style={{ fontSize: "0.82rem", opacity: 0.9, marginTop: 4 }}>
              +{badge.points} points bien-être ✨
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}