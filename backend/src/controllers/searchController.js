import User from "../models/User.js";
import Post from "../models/Post.js";

/**
 * GET /api/search?q=...&emotion=...&tag=...&from=...&to=...&type=posts|users|all
 * Recherche avancee :
 *  - q : texte (utilise les indexes text de MongoDB)
 *  - emotion : filtre sur emotion dominante
 *  - tag : filtre sur tag
 *  - from / to : plage de dates (ISO)
 *  - type : "posts" | "users" | "all" (defaut)
 */
export async function search(req, res) {
  try {
    const { q, emotion, tag, from, to, type = "all" } = req.query;

    const dateFilter = {};
    if (from) dateFilter.$gte = new Date(from);
    if (to) dateFilter.$lte = new Date(to);

    // --- Posts ---
    let posts = [];
    if (type === "all" || type === "posts") {
      const filter = { isHidden: { $ne: true }, visibility: "public" };
      if (emotion) filter["aiAnalysis.dominantEmotion"] = emotion;
      if (tag) filter.tags = tag.toLowerCase();
      if (Object.keys(dateFilter).length) filter.createdAt = dateFilter;
      if (q) filter.$text = { $search: q };

      const query = Post.find(filter);
      if (q) {
        query.select({ score: { $meta: "textScore" } }).sort({ score: { $meta: "textScore" } });
      } else {
        query.sort({ createdAt: -1 });
      }
      posts = await query.limit(50);
    }

    // --- Users ---
    let users = [];
    if (type === "all" || type === "users") {
      const ufilter = {};
      if (emotion) ufilter.dominantEmotion = emotion;
      if (q) ufilter.$text = { $search: q };

      const uquery = User.find(ufilter).select(
        "username fullName bio profileImage auraColor dominantEmotion accountType city"
      );
      users = await uquery.limit(30);
    }

    res.json({ posts, users, total: posts.length + users.length });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

/**
 * GET /api/search/tags - tags les plus utilises
 */
export async function topTags(_req, res) {
  try {
    const tags = await Post.aggregate([
      { $match: { tags: { $exists: true, $ne: [] } } },
      { $unwind: "$tags" },
      { $group: { _id: "$tags", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 20 },
    ]);
    res.json(tags);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}
