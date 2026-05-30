import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    senderUsername: String,
    senderImage: String,

    // Types : follow, follow_accepted, like, comment, badge
    type: {
      type: String,
      enum: ["follow", "follow_request", "follow_accepted", "like", "comment", "badge", "system"],
      required: true,
    },
    message: { type: String, required: true },
    link: String, // URL relative cote front (ex: /u/123 ou /feed)
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

notificationSchema.index({ recipient: 1, createdAt: -1 });
notificationSchema.index({ recipient: 1, isRead: 1 });

export default mongoose.model("Notification", notificationSchema);
