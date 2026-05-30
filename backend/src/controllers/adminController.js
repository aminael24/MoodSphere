import User from "../models/User.js";
import Post from "../models/Post.js";
import Report from "../models/Report.js";
import MoodJournal from "../models/MoodJournal.js";
import ChatMessage from "../models/ChatMessage.js";

/**
 * GET /api/admin/overview - stats globales
 */
export async function adminOverview(_req, res) {
  try {
    const [users, posts, hiddenPosts, pendingReports, journals, chatMsgs] = await Promise.all([
      User.countDocuments(),
      Post.countDocuments(),
      Post.countDocuments({ isHidden: true }),
      Report.countDocuments({ status: "pending" }),
      MoodJournal.countDocuments(),
      ChatMessage.countDocuments(),
    ]);

    // Repartition emotion sur 24h
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const emotionsToday = await Post.aggregate([
      { $match: { createdAt: { $gte: since } } },
      { $group: { _id: "$aiAnalysis.dominantEmotion", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    // Tendance 7 jours
    const last7 = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const emotionsByDay = await Post.aggregate([
      { $match: { createdAt: { $gte: last7 } } },
      {
        $group: {
          _id: {
            day: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            emotion: "$aiAnalysis.dominantEmotion",
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.day": 1 } },
    ]);

    res.json({
      counts: { users, posts, hiddenPosts, pendingReports, journals, chatMsgs },
      emotionsToday,
      emotionsByDay,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

/**
 * GET /api/admin/users
 */
export async function adminListUsers(req, res) {
  try {
    const { q } = req.query;
    const filter = q
      ? { $or: [{ username: new RegExp(q, "i") }, { email: new RegExp(q, "i") }] }
      : {};
    const users = await User.find(filter)
      .select("fullName username email role accountType isEmailVerified createdAt dominantEmotion auraColor")
      .sort({ createdAt: -1 })
      .limit(100);
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

/**
 * PATCH /api/admin/users/:id - changer role
 */
export async function adminUpdateUser(req, res) {
  try {
    const { role } = req.body;
    if (!["user", "admin"].includes(role)) {
      return res.status(400).json({ message: "Role invalide" });
    }
    const u = await User.findByIdAndUpdate(req.params.id, { role }, { new: true });
    if (!u) return res.status(404).json({ message: "Introuvable" });
    res.json(u);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

/**
 * DELETE /api/admin/users/:id
 */
export async function adminDeleteUser(req, res) {
  try {
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ message: "Tu ne peux pas te supprimer toi-même" });
    }
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "Utilisateur supprimé" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

/**
 * GET /api/admin/reports
 */
export async function adminListReports(req, res) {
  try {
    const { status = "pending" } = req.query;
    const reports = await Report.find({ status }).sort({ createdAt: -1 }).limit(100);
    res.json(reports);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

/**
 * POST /api/admin/reports/:id/resolve
 * Body : { action: "hide_post" | "delete_post" | "dismiss" }
 */
export async function adminResolveReport(req, res) {
  try {
    const { action } = req.body;
    const report = await Report.findById(req.params.id);
    if (!report) return res.status(404).json({ message: "Introuvable" });

    if (action === "hide_post" && report.targetType === "post") {
      await Post.findByIdAndUpdate(report.targetId, { isHidden: true });
    } else if (action === "delete_post" && report.targetType === "post") {
      await Post.findByIdAndDelete(report.targetId);
    } else if (action === "hide_comment" && report.targetType === "comment") {
      await Post.updateOne(
        { _id: report.parentPostId, "comments._id": report.targetId },
        { $set: { "comments.$.isHidden": true } }
      );
    }

    report.status = action === "dismiss" ? "dismissed" : "resolved";
    report.actionTaken = action;
    report.resolvedBy = req.user._id;
    report.resolvedAt = new Date();
    await report.save();

    res.json(report);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

/**
 * GET /api/admin/posts
 */
export async function adminListPosts(req, res) {
  try {
    const { hidden } = req.query;
    const filter = hidden === "true" ? { isHidden: true } : {};
    const posts = await Post.find(filter).sort({ createdAt: -1 }).limit(100);
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

/**
 * PATCH /api/admin/posts/:id - toggle hide
 */
export async function adminTogglePost(req, res) {
  try {
    const p = await Post.findById(req.params.id);
    if (!p) return res.status(404).json({ message: "Introuvable" });
    p.isHidden = !p.isHidden;
    await p.save();
    res.json(p);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}
