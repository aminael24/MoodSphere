import express from "express";
import Post from "../models/Post.js";
import User from "../models/User.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const { q, emotion, tag, from, to } = req.query;

    const postFilter = {
      visibility: "public",
    };

    const userFilter = {};

    if (q && q.trim() !== "") {
      const cleanQuery = q.trim();

      // Recherche par début du nom ou username
      const searchRegex = new RegExp("^" + cleanQuery, "i");

      userFilter.$or = [
        { fullName: searchRegex },
        { username: searchRegex },
      ];

      // Recherche dans les posts
      postFilter.$or = [
        { content: { $regex: cleanQuery, $options: "i" } },
        { tags: { $regex: cleanQuery, $options: "i" } },
      ];
    }

    if (emotion) {
      postFilter.emotion = emotion;
    }

    if (tag) {
      postFilter.tags = tag;
    }

    if (from || to) {
      postFilter.createdAt = {};

      if (from) {
        postFilter.createdAt.$gte = new Date(from);
      }

      if (to) {
        postFilter.createdAt.$lte = new Date(to);
      }
    }

    const posts = await Post.find(postFilter)
      .populate("author", "fullName username profileImage dominantEmotion")
      .sort({ createdAt: -1 });

    const users = q
      ? await User.find(userFilter)
          .select("fullName username profileImage dominantEmotion city accountType")
          .limit(10)
      : [];

    res.json({
      posts,
      users,
    });
  } catch (error) {
    console.error("Erreur search:", error);
    res.status(500).json({
      message: "Erreur lors de la recherche",
    });
  }
});

export default router;