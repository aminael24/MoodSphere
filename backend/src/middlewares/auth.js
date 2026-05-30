import jwt from "jsonwebtoken";
import User from "../models/User.js";

/**
 * Middleware JWT : verifie le token et attache l'utilisateur a req.user
 */
export async function protect(req, res, next) {
  let token;
  const auth = req.headers.authorization;
  if (auth && auth.startsWith("Bearer ")) token = auth.split(" ")[1];

  if (!token) return res.status(401).json({ message: "Non autorisé" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select("-password");
    if (!req.user) return res.status(401).json({ message: "Utilisateur introuvable" });
    next();
  } catch {
    return res.status(401).json({ message: "Token invalide ou expiré" });
  }
}
