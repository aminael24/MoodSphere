import mongoose from "mongoose";

const reportSchema = new mongoose.Schema(
  {
    reporter: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    reporterUsername: String,

    targetType: { type: String, enum: ["post", "comment", "user"], required: true },
    targetId: { type: mongoose.Schema.Types.ObjectId, required: true },
    // Pour comment : on stocke aussi le postId
    parentPostId: { type: mongoose.Schema.Types.ObjectId },

    reason: {
      type: String,
      enum: ["harassment", "spam", "inappropriate", "self_harm", "misinformation", "other"],
      required: true,
    },
    details: { type: String, maxlength: 500, default: "" },

    status: {
      type: String,
      enum: ["pending", "resolved", "dismissed"],
      default: "pending",
      index: true,
    },
    resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    resolvedAt: Date,
    actionTaken: String, // ex: "post_hidden", "post_deleted", "dismissed"
  },
  { timestamps: true }
);

reportSchema.index({ status: 1, createdAt: -1 });
reportSchema.index({ targetType: 1, targetId: 1 });

export default mongoose.model("Report", reportSchema);
