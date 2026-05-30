/**
 * Middleware admin : verifie que req.user.role === "admin"
 * A utiliser apres protect.
 */
export function adminOnly(req, res, next) {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ message: "Réservé aux administrateurs" });
  }
  next();
}
