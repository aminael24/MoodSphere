import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
  {
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    authorUsername: String,
    content: { type: String, required: true, maxlength: 500 },
    anonymous: { type: Boolean, default: false },
    isHidden: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const postSchema = new mongoose.Schema(
  {
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    authorUsername: { type: String, required: true },
    authorImage: { type: String, default: "" },

    content: { type: String, required: true, maxlength: 1000 },
    anonymous: { type: Boolean, default: false },
    visibility: {
      type: String,
      enum: ["public", "followers", "private"],
      default: "public",
    },

    // Tags / hashtags pour recherche avancee
    tags: [{ type: String, lowercase: true, trim: true }],

    aiAnalysis: {
      dominantEmotion: { type: String, default: "calm" },
      confidence: { type: Number, default: 0 },
      scores: { type: Map, of: Number, default: {} },
      crisisDetected: { type: Boolean, default: false },
    },
    auraColor: { type: String, default: "#D5BCAD" },

    recommendations: {
      playlist: String,
      playlistName: String,
      activity: String,
      contentType: String,
      quote: String,
    },

    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    comments: [commentSchema],

    // Moderation
    isHidden: { type: Boolean, default: false },
    reportCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Indexes pour recherche avancee
postSchema.index({ createdAt: -1 });
postSchema.index({ "aiAnalysis.dominantEmotion": 1, createdAt: -1 });
postSchema.index({ author: 1, createdAt: -1 });
postSchema.index({ tags: 1 });
postSchema.index({ content: "text", tags: "text" });

export default mongoose.model("Post", postSchema);
