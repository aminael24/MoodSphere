import mongoose from "mongoose";

/**
 * Connexion a MongoDB avec gestion d'erreurs
 */
export async function connectDB() {
  try {
    const uri = process.env.MONGO_URI;
    if (!uri) throw new Error("MONGO_URI manquant dans .env");

    await mongoose.connect(uri);
    console.log("✅ MongoDB connecté");
  } catch (err) {
    console.error("❌ Erreur MongoDB :", err.message);
    process.exit(1);
  }
}
