import mongoose from "mongoose";

const moodJournalSchema = new mongoose.Schema(
  {
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    content: { type: String, required: true, maxlength: 2000 },
    title: { type: String, default: "", maxlength: 100 },

    aiAnalysis: {
      dominantEmotion: { type: String, default: "calm" },
      confidence: { type: Number, default: 0 },
      scores: { type: Map, of: Number, default: {} },
      crisisDetected: { type: Boolean, default: false },
    },
    auraColor: { type: String, default: "#D5BCAD" },

    // Tags optionnels pour rechercher dans son journal
    tags: [{ type: String, lowercase: true, trim: true }],
  },
  { timestamps: true }
);

moodJournalSchema.index({ author: 1, createdAt: -1 });
moodJournalSchema.index({ content: "text", title: "text" });

export default mongoose.model("MoodJournal", moodJournalSchema);
