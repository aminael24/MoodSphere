import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    senderUsername: {
      type: String,
      default: "",
    },

    senderImage: {
      type: String,
      default: "",
    },

    type: {
      type: String,
      enum: [
        "like",
        "comment",
        "follow",
        "follow_request",
        "follow_accepted",
        "system",
      ],
      required: true,
    },

    message: {
      type: String,
      required: true,
    },

    link: {
      type: String,
      default: "",
    },

    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Notification", notificationSchema);