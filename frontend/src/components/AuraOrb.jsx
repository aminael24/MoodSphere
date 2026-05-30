import { motion } from "framer-motion";

/**
 * AuraOrb — sphère 3D lumineuse représentant l'émotion dominante
 */
export default function AuraOrb({ color = "#D5BCAD", size = 180, emoji = "" }) {
  return (
    <div style={{ position: "relative", width: size, height: size, display: "grid", placeItems: "center" }}>
      {/* Halo pulsant */}
      <motion.div
        animate={{ scale: [1, 1.2, 1], opacity: [0.55, 0.85, 0.55] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        style={{
          position: "absolute",
          inset: -size * 0.2,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${color}aa 0%, transparent 70%)`,
          filter: "blur(20px)",
        }}
      />

      {/* Sphère 3D */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 24, repeat: Infinity, ease: "linear" }}
        style={{
          position: "relative",
          width: size,
          height: size,
          borderRadius: "50%",
          background: `
            radial-gradient(circle at 32% 28%, #ffffffcc 0%, transparent 32%),
            radial-gradient(circle at 70% 75%, ${color}00 0%, ${color} 55%),
            radial-gradient(circle at 50% 50%, ${color} 0%, ${color}88 100%)
          `,
          boxShadow: `
            inset -12px -16px 40px rgba(0,0,0,0.4),
            inset 14px 12px 30px rgba(255,255,255,0.22),
            0 18px 50px ${color}66
          `,
        }}
      >
        {/* Emoji contre-rotaté pour rester droit */}
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 24, repeat: Infinity, ease: "linear" }}
          style={{
            position: "absolute",
            inset: 0,
            display: "grid",
            placeItems: "center",
            fontSize: size * 0.34,
          }}
        >
          {emoji}
        </motion.div>
      </motion.div>
    </div>
  );
}
