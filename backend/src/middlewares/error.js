/**
 * Middleware global de gestion des erreurs
 */
export function errorHandler(err, _req, res, _next) {
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Erreur serveur";
  if (process.env.NODE_ENV !== "production") {
    console.error("[ERREUR]", err);
  }
  res.status(status).json({ message });
}

export function notFound(_req, res) {
  res.status(404).json({ message: "Route introuvable" });
}
