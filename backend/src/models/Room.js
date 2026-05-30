import mongoose from "mongoose";

// Salons par emotion - on les seed une fois
const roomSchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true }, // "stress", "happy", ...
    name: { type: String, required: true },               // "Stress", "Happiness", ...
    emotion: { type: String, required: true },
    description: String,
    color: String,
    emoji: String,
    membersCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Messages temps reel
const roomMessageSchema = new mongoose.Schema(
  {
    room: { type: mongoose.Schema.Types.ObjectId, ref: "Room", required: true, index: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    username: String,
    profileImage: String,
    content: { type: String, required: true, maxlength: 500 },
    anonymous: { type: Boolean, default: false },
    auraColor: String,
  },
  { timestamps: true }
);

roomMessageSchema.index({ room: 1, createdAt: -1 });

export const Room = mongoose.model("Room", roomSchema);
export const RoomMessage = mongoose.model("RoomMessage", roomMessageSchema);
