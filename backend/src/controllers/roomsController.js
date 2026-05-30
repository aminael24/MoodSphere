import { Room, RoomMessage } from "../models/Room.js";

// Definition statique des salons disponibles
export const ROOM_DEFINITIONS = [
  { slug: "happy",      name: "Happy",      emotion: "joy",       color: "#E8B86D", emoji: "☀️", description: "Partagez vos bonnes nouvelles et moments lumineux." },
  { slug: "sad",        name: "Sad",        emotion: "sad",       color: "#7B5A6B", emoji: "💧", description: "Un espace pour la tristesse, sans jugement." },
  { slug: "stress",     name: "Stress",     emotion: "stress",    color: "#8E6C5C", emoji: "🌪️", description: "Quand le stress monte, on respire ensemble." },
  { slug: "calm",       name: "Calm",       emotion: "calm",      color: "#D5BCAD", emoji: "🌿", description: "Un coin paisible pour se ressourcer." },
  { slug: "motivation", name: "Motivation", emotion: "motivated", color: "#C8633A", emoji: "🔥", description: "Pour booster votre énergie et celles des autres." },
];

/**
 * Initialise les salons en BDD (idempotent)
 */
export async function ensureRoomsExist() {
  for (const def of ROOM_DEFINITIONS) {
    await Room.updateOne(
      { slug: def.slug },
      { $setOnInsert: def },
      { upsert: true }
    );
  }
}

/**
 * GET /api/rooms - liste des salons
 */
export async function listRooms(_req, res) {
  try {
    await ensureRoomsExist();
    const rooms = await Room.find().sort({ name: 1 });
    res.json(rooms);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

/**
 * GET /api/rooms/:slug/messages - historique d'un salon
 */
export async function getRoomMessages(req, res) {
  try {
    const room = await Room.findOne({ slug: req.params.slug });
    if (!room) return res.status(404).json({ message: "Salon introuvable" });

    const messages = await RoomMessage.find({ room: room._id })
      .sort({ createdAt: -1 })
      .limit(100);
    res.json({ room, messages: messages.reverse() });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

/**
 * POST /api/rooms/:slug/messages - envoyer un message (fallback sans socket)
 */
export async function postRoomMessage(req, res) {
  try {
    const room = await Room.findOne({ slug: req.params.slug });
    if (!room) return res.status(404).json({ message: "Salon introuvable" });

    const { content, anonymous } = req.body;
    if (!content || !content.trim()) {
      return res.status(400).json({ message: "Message vide" });
    }

    const msg = await RoomMessage.create({
      room: room._id,
      user: req.user._id,
      username: req.user.username,
      profileImage: req.user.profileImage,
      content,
      anonymous: !!anonymous,
      auraColor: req.user.auraColor,
    });

    // Diffusion socket si dispo
    const io = req.app.get("io");
    if (io) io.to(`room:${room.slug}`).emit("room:message", msg);

    res.status(201).json(msg);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}
