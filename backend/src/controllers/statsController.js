import Post from "../models/Post.js";
import User from "../models/User.js";
import { AURA_COLORS } from "../services/recommendationService.js";

/**
 * GET /api/stats/emotional-weather
 * Repartition des emotions sur la communaute (24h, sinon all-time)
 */
export async function emotionalWeather(req, res) {
  try {
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const pipeline = [
      { $match: { createdAt: { $gte: since } } },
      { $group: { _id: "$aiAnalysis.dominantEmotion", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ];
    let results = await Post.aggregate(pipeline);

    if (results.length === 0) {
      results = await Post.aggregate([
        { $group: { _id: "$aiAnalysis.dominantEmotion", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]);
    }

    const total = results.reduce((acc, r) => acc + r.count, 0) || 1;
    const weather = results.map((r) => ({
      emotion: r._id || "calm",
      count: r.count,
      percentage: Math.round((r.count / total) * 100),
      color: AURA_COLORS[r._id] || AURA_COLORS.calm,
    }));

    res.json({ total, weather, dominantEmotion: weather[0]?.emotion });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

/**
 * GET /api/stats/my-mood-timeline
 */
export async function myMoodTimeline(req, res) {
  try {
    const user = await User.findById(req.user._id);
    res.json((user.moodHistory || []).slice(-30));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

/**
 * GET /api/stats/community-trends
 * Tendance sur 7 jours par emotion (pour graphique line)
 */
export async function communityTrends(req, res) {
  try {
    const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const pipeline = [
      { $match: { createdAt: { $gte: since } } },
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
    ];
    const data = await Post.aggregate(pipeline);
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

/**
 * GET /api/stats/overview - chiffres globaux
 */
export async function overview(req, res) {
  try {
    const [totalPosts, totalUsers] = await Promise.all([
      Post.countDocuments(),
      User.countDocuments(),
    ]);
    res.json({ totalPosts, totalUsers });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

/**
 * GET /api/stats/top-positive - classement avec $lookup
 */
export async function topPositive(req, res) {
  try {
    const top = await Post.aggregate([
      { $match: { "aiAnalysis.dominantEmotion": { $in: ["joy", "motivated", "calm"] } } },
      {
        $group: {
          _id: "$author",
          username: { $first: "$authorUsername" },
          positiveCount: { $sum: 1 },
        },
      },
      { $sort: { positiveCount: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "userInfo",
        },
      },
      {
        $project: {
          username: 1,
          positiveCount: 1,
          aura: { $arrayElemAt: ["$userInfo.auraColor", 0] },
          profileImage: { $arrayElemAt: ["$userInfo.profileImage", 0] },
        },
      },
    ]);
    res.json(top);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}
