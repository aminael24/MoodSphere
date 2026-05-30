import MoodJournal from "../models/MoodJournal.js";
import User from "../models/User.js";
import { detectEmotion } from "../services/aiEmotionService.js";
import { getAuraColor } from "../services/recommendationService.js";
import { getCrisisResources } from "../services/crisisService.js";
import { updateJournalStreak, checkBadges } from "../services/badgeService.js";

/**
 * POST /api/journal - cree une entree privee
 */
export async function createEntry(req, res) {
  try {
    const { content, title, tags } = req.body;
    if (!content || !content.trim()) {
      return res.status(400).json({ message: "Contenu vide" });
    }

    const analysis = await detectEmotion(content);
    const auraColor = getAuraColor(analysis.dominantEmotion);

    const entry = await MoodJournal.create({
      author: req.user._id,
      content,
      title: title || "",
      tags: Array.isArray(tags)
        ? tags.map((t) => String(t).toLowerCase().trim()).filter(Boolean)
        : [],
      aiAnalysis: {
        dominantEmotion: analysis.dominantEmotion,
        confidence: analysis.confidence,
        scores: analysis.scores,
        crisisDetected: analysis.crisisDetected,
      },
      auraColor,
    });

    // Update streak + check badges
    const user = await User.findById(req.user._id);
   const streakBadges = await updateJournalStreak(user);
    const checkBadgesResult = await checkBadges(req.user._id, "journal");
    const newBadges = [...streakBadges, ...checkBadgesResult];

    res.status(201).json({
      entry,
      crisisResources: analysis.crisisDetected ? getCrisisResources() : null,
      newBadges,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

/**
 * GET /api/journal - liste toutes les entrees du user
 */
export async function listEntries(req, res) {
  try {
    const { q, emotion } = req.query;
    const filter = { author: req.user._id };
    if (emotion) filter["aiAnalysis.dominantEmotion"] = emotion;
    if (q) filter.$text = { $search: q };

    const entries = await MoodJournal.find(filter).sort({ createdAt: -1 }).limit(200);
    res.json(entries);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

/**
 * GET /api/journal/timeline - timeline emotionnelle pour graphique
 */
export async function getTimeline(req, res) {
  try {
    const entries = await MoodJournal.find({ author: req.user._id })
      .select("aiAnalysis.dominantEmotion auraColor createdAt")
      .sort({ createdAt: 1 })
      .limit(60);
    res.json(
      entries.map((e) => ({
        emotion: e.aiAnalysis.dominantEmotion,
        aura: e.auraColor,
        date: e.createdAt,
      }))
    );
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

/**
 * DELETE /api/journal/:id
 */
export async function deleteEntry(req, res) {
  try {
    const entry = await MoodJournal.findById(req.params.id);
    if (!entry) return res.status(404).json({ message: "Introuvable" });
    if (entry.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Non autorisé" });
    }
    await entry.deleteOne();
    res.json({ message: "Supprimé" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}
