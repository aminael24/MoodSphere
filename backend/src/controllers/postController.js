import Post from "../models/Post.js";
import User from "../models/User.js";
import { detectEmotion } from "../services/aiEmotionService.js";
import { getAuraColor, getRecommendation } from "../services/recommendationService.js";
import { getCrisisResources } from "../services/crisisService.js";
import { createNotification } from "../services/notificationService.js";
import { checkBadges } from "../services/badgeService.js";

/**
 * POST /api/posts
 */
export async function createPost(req, res) {
  try {
    const { content, anonymous, visibility, tags } = req.body;
    if (!content || !content.trim()) {
      return res.status(400).json({ message: "Contenu vide" });
    }

    // 1. IA
    const analysis = await detectEmotion(content);
    const auraColor = getAuraColor(analysis.dominantEmotion);
    const recommendations = getRecommendation(analysis.dominantEmotion, analysis.quote);

    // 2. Post (avec tags + crisis flag)
    const post = await Post.create({
      author: req.user._id,
      authorUsername: req.user.username,
      authorImage: req.user.profileImage,
      content,
      anonymous: !!anonymous,
      visibility: ["public", "followers", "private"].includes(visibility) ? visibility : "public",
      tags: Array.isArray(tags)
        ? tags.map((t) => String(t).toLowerCase().trim()).filter(Boolean).slice(0, 10)
        : [],
      aiAnalysis: {
        dominantEmotion: analysis.dominantEmotion,
        confidence: analysis.confidence,
        scores: analysis.scores,
        crisisDetected: analysis.crisisDetected,
      },
      auraColor,
      recommendations,
    });

    // 3. Update user aura + history
    await User.findByIdAndUpdate(req.user._id, {
      auraColor,
      dominantEmotion: analysis.dominantEmotion,
      $push: { moodHistory: { emotion: analysis.dominantEmotion, aura: auraColor, date: new Date() } },
    });

   const newBadges = await checkBadges(req.user._id, "post").catch(() => []);

    res.status(201).json({
      ...post.toObject(),
      crisisResources: analysis.crisisDetected ? getCrisisResources() : null,
      newBadges,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

/**
 * Anonymise un post avant envoi (ne pas exposer l'identite)
 */
function maskAnonymous(post) {
  if (!post.anonymous) return post;
  const obj = post.toObject ? post.toObject() : post;
  obj.authorUsername = "Anonyme";
  obj.author = null;
  obj.authorImage = "";
  // Anonymiser les commentaires anonymes aussi
  if (obj.comments) {
    obj.comments = obj.comments.map((c) =>
      c.anonymous ? { ...c, authorUsername: "Anonyme", author: null } : c
    );
  }
  return obj;
}

/**
 * GET /api/posts/feed - feed perso (mes posts + posts des utilisateurs suivis)
 */
export async function getFeed(req, res) {
  try {
    const me = await User.findById(req.user._id);
    const allowedAuthors = [me._id, ...me.following];

    const posts = await Post.find({
      author: { $in: allowedAuthors },
      isHidden: { $ne: true },
      $or: [
        { visibility: "public" },
        { visibility: "followers" },
        { visibility: "private", author: me._id },
      ],
    })
      .sort({ createdAt: -1 })
      .limit(100);

    res.json(posts.map(maskAnonymous));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

/**
 * GET /api/posts/public - flux global decouverte
 */
export async function getPublicFeed(req, res) {
  try {
    const posts = await Post.find({ visibility: "public", isHidden: { $ne: true } })
      .sort({ createdAt: -1 })
      .limit(100);
    res.json(posts.map(maskAnonymous));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

/**
 * GET /api/posts/me - mes posts
 */
export async function getMyPosts(req, res) {
  try {
    const posts = await Post.find({ author: req.user._id }).sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

/**
 * GET /api/posts/user/:id - posts publics d'un utilisateur
 */
export async function getUserPosts(req, res) {
  try {
    const target = await User.findById(req.params.id);
    if (!target) return res.status(404).json({ message: "Utilisateur introuvable" });

    const isFollower = target.followers.some((id) => id.toString() === req.user._id.toString());
    const isSelf = target._id.toString() === req.user._id.toString();

    const visibility = isSelf
      ? ["public", "followers", "private"]
      : isFollower
      ? ["public", "followers"]
      : ["public"];

    if (target.accountType === "private" && !isFollower && !isSelf) {
      return res.json([]); // compte prive non suivi
    }

    const posts = await Post.find({ author: target._id, visibility: { $in: visibility } })
      .sort({ createdAt: -1 });
    res.json(posts.map(maskAnonymous));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

/**
 * PATCH /api/posts/:id
 */
export async function updatePost(req, res) {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post introuvable" });
    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Action non autorisée" });
    }
    const { visibility, anonymous } = req.body;
    if (visibility) post.visibility = visibility;
    if (anonymous !== undefined) post.anonymous = anonymous;
    await post.save();
    res.json(post);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

/**
 * DELETE /api/posts/:id
 */
export async function deletePost(req, res) {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post introuvable" });
    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Action non autorisée" });
    }
    await post.deleteOne();
    res.json({ message: "Post supprimé" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

/**
 * POST /api/posts/:id/like - toggle
 */
export async function toggleLike(req, res) {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post introuvable" });

    const uid = req.user._id.toString();
    const idx = post.likes.findIndex((l) => l.toString() === uid);
    const wasLiked = idx !== -1;
    if (wasLiked) {
      post.likes.splice(idx, 1);
    } else {
      post.likes.push(req.user._id);
    }

    await post.save();

    // Notification (uniquement quand on AJOUTE un like)
    if (!wasLiked) {
      createNotification({
        recipient: post.author,
        sender: req.user._id,
        senderUsername: req.user.username,
        senderImage: req.user.profileImage,
        type: "like",
        message: `${req.user.username} a aimé ton post`,
        link: "/feed",
      }).catch(() => {});
      // Badge "loved"
      checkBadges(post.author, "like").catch(() => {});
    }

    res.json({ likes: post.likes });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

/**
 * POST /api/posts/:id/comments
 */
export async function addComment(req, res) {
  try {
    const { content, anonymous } = req.body;
    if (!content || !content.trim()) {
      return res.status(400).json({ message: "Commentaire vide" });
    }
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post introuvable" });

    post.comments.push({
      author: req.user._id,
      authorUsername: req.user.username,
      content,
      anonymous: !!anonymous,
    });
    await post.save();

    // Notif au proprietaire du post
    createNotification({
      recipient: post.author,
      sender: req.user._id,
      senderUsername: req.user.username,
      senderImage: req.user.profileImage,
      type: "comment",
      message: `${anonymous ? "Quelqu'un" : req.user.username} a commenté ton post`,
      link: "/feed",
    }).catch(() => {});

    res.status(201).json(maskAnonymous(post).comments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}
