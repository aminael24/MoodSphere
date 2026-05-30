import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";
import postRoutes from "./routes/posts.js";
import statsRoutes from "./routes/stats.js";
import journalRoutes from "./routes/journal.js";
import chatRoutes from "./routes/chat.js";
import roomsRoutes from "./routes/rooms.js";
import notificationsRoutes from "./routes/notifications.js";
import reportsRoutes from "./routes/reports.js";
import adminRoutes from "./routes/admin.js";
import searchRoutes from "./routes/search.js";
import { notFound, errorHandler } from "./middlewares/error.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

app.use(cors({ origin: "*" }));
app.use(express.json({ limit: "1mb" }));

// Fichiers uploades (photos de profil)
app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));

// API v2
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/stats", statsRoutes);

// API v2.1 - modules avances
app.use("/api/journal", journalRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/rooms", roomsRoutes);
app.use("/api/notifications", notificationsRoutes);
app.use("/api/reports", reportsRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/search", searchRoutes);
app.get("/api/health", (_req, res) =>
  res.json({ status: "ok", service: "MoodSphere v2.1", time: new Date() })
);

app.use(notFound);
app.use(errorHandler);

export default app;
