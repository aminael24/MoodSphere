import Report from "../models/Report.js";
import Post from "../models/Post.js";

/**
 * POST /api/reports
 * Body : { targetType: "post"|"comment", targetId, parentPostId?, reason, details? }
 */
export async function createReport(req, res) {
  try {
    const { targetType, targetId, parentPostId, reason, details } = req.body;

    if (!["post", "comment", "user"].includes(targetType)) {
      return res.status(400).json({ message: "Type invalide" });
    }
    if (!["harassment", "spam", "inappropriate", "self_harm", "misinformation", "other"].includes(reason)) {
      return res.status(400).json({ message: "Motif invalide" });
    }

    // Empecher double signalement par le meme user sur la meme cible
    const existing = await Report.findOne({
      reporter: req.user._id,
      targetType,
      targetId,
      status: "pending",
    });
    if (existing) {
      return res.status(400).json({ message: "Tu as déjà signalé ce contenu" });
    }

    const report = await Report.create({
      reporter: req.user._id,
      reporterUsername: req.user.username,
      targetType,
      targetId,
      parentPostId: parentPostId || undefined,
      reason,
      details: details || "",
    });

    // Incrementer le compteur sur le post
    if (targetType === "post") {
      await Post.findByIdAndUpdate(targetId, { $inc: { reportCount: 1 } });
    } else if (targetType === "comment" && parentPostId) {
      await Post.findByIdAndUpdate(parentPostId, { $inc: { reportCount: 1 } });
    }

    res.status(201).json({ message: "Signalement enregistré. Merci.", report });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}
