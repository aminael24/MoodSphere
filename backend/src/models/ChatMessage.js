import mongoose from "mongoose";

const chatMessageSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    role: { type: String, enum: ["user", "bot"], required: true },
    content: { type: String, required: true, maxlength: 2000 },
    emotionContext: { type: String, default: "" }, // emotion detectee dans le message user
    crisisDetected: { type: Boolean, default: false },
  },
  { timestamps: true }
);

chatMessageSchema.index({ user: 1, createdAt: 1 });

export default mongoose.model("ChatMessage", chatMessageSchema);
