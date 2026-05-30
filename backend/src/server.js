import dotenv from "dotenv";
dotenv.config();

import { createServer } from "http";
import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import app from "./app.js";
import { connectDB } from "./config/db.js";
import { Room, RoomMessage } from "./models/Room.js";
import User from "./models/User.js";
import { ensureRoomsExist } from "./controllers/roomsController.js";

const PORT = process.env.PORT || 5000;

await connectDB();
await ensureRoomsExist();

// HTTP server + Socket.IO
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: "*" },
});
app.set("io", io);

// Auth socket via JWT
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error("no_token"));
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");
    if (!user) return next(new Error("no_user"));
    socket.user = user;
    next();
  } catch (err) {
    next(new Error("auth_failed"));
  }
});

io.on("connection", (socket) => {
  // Rejoindre un salon
  socket.on("room:join", async (slug) => {
    const room = await Room.findOne({ slug });
    if (!room) return;
    socket.join(`room:${slug}`);
    socket.emit("room:joined", { slug });
  });

  socket.on("room:leave", (slug) => {
    socket.leave(`room:${slug}`);
  });

  // Envoyer un message
  socket.on("room:send", async ({ slug, content, anonymous }) => {
    if (!content || !content.trim()) return;
    const room = await Room.findOne({ slug });
    if (!room) return;
    const msg = await RoomMessage.create({
      room: room._id,
      user: socket.user._id,
      username: socket.user.username,
      profileImage: socket.user.profileImage,
      content: String(content).slice(0, 500),
      anonymous: !!anonymous,
      auraColor: socket.user.auraColor,
    });
    io.to(`room:${slug}`).emit("room:message", msg);
  });

  // Indicateur "en train d'ecrire"
  socket.on("room:typing", ({ slug }) => {
    socket.to(`room:${slug}`).emit("room:typing", {
      username: socket.user.username,
    });
  });
});

httpServer.listen(PORT, () =>
  console.log(`🚀 MoodSphere v2.1 (HTTP + Socket.IO) sur http://localhost:${PORT}`)
);
