import User from "../models/User.js";
import { createNotification } from "../services/notificationService.js";
import { checkBadges } from "../services/badgeService.js";

/**
 * PATCH /api/users/me
 */
export async function updateMe(req, res) {
  try {
    const { fullName, bio, accountType } = req.body;
    const updates = {};
    if (fullName !== undefined) updates.fullName = fullName;
    if (bio !== undefined) updates.bio = bio;
    if (accountType && ["public", "private"].includes(accountType)) {
      updates.accountType = accountType;
    }
    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

/**
 * POST /api/users/upload-profile-image
 */
export async function uploadProfileImage(req, res) {
  try {
    if (!req.file) return res.status(400).json({ message: "Aucun fichier" });
    const imageUrl = `/uploads/${req.file.filename}`;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { profileImage: imageUrl },
      { new: true }
    );
    res.json({ profileImage: imageUrl, user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

/**
 * GET /api/users/:id
 */
export async function getUser(req, res) {
  try {
    const user = await User.findById(req.params.id)
      .populate("followers", "username fullName profileImage auraColor")
      .populate("following", "username fullName profileImage auraColor");
    if (!user) return res.status(404).json({ message: "Utilisateur introuvable" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

/**
 * POST /api/users/:id/follow
 * - Compte public  : ajout direct dans followers/following
 * - Compte prive   : ajoute a followRequests, en attente d'acceptation
 */
export async function follow(req, res) {
  try {
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ message: "Tu ne peux pas te suivre toi-même" });
    }

    const target = await User.findById(req.params.id);
    if (!target) return res.status(404).json({ message: "Utilisateur introuvable" });

    const me = await User.findById(req.user._id);

    // Deja en follow ?
    if (target.followers.some((id) => id.toString() === me._id.toString())) {
      return res.status(400).json({ message: "Déjà abonné" });
    }

    if (target.accountType === "private") {
      // Demande
      if (!target.followRequests.some((id) => id.toString() === me._id.toString())) {
        target.followRequests.push(me._id);
        await target.save();
        // Notif demande
        createNotification({
          recipient: target._id,
          sender: me._id,
          senderUsername: me.username,
          senderImage: me.profileImage,
          type: "follow_request",
          message: `${me.username} souhaite te suivre`,
          link: "/profile",
        }).catch(() => {});
      }
      return res.json({ status: "requested", message: "Demande envoyée" });
    }

    // Direct
    target.followers.push(me._id);
    me.following.push(target._id);
    await target.save();
    await me.save();

    // Notif follow direct
    createNotification({
      recipient: target._id,
      sender: me._id,
      senderUsername: me.username,
      senderImage: me.profileImage,
      type: "follow",
      message: `${me.username} te suit désormais`,
      link: `/u/${me._id}`,
    }).catch(() => {});

    // Badge potentiel "social butterfly"
    checkBadges(target._id, "follow").catch(() => {});

    res.json({ status: "following" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

/**
 * POST /api/users/:id/unfollow
 */
export async function unfollow(req, res) {
  try {
    const target = await User.findById(req.params.id);
    const me = await User.findById(req.user._id);
    if (!target) return res.status(404).json({ message: "Utilisateur introuvable" });

    target.followers = target.followers.filter((id) => id.toString() !== me._id.toString());
    me.following = me.following.filter((id) => id.toString() !== target._id.toString());
    target.followRequests = target.followRequests.filter((id) => id.toString() !== me._id.toString());

    await target.save();
    await me.save();
    res.json({ status: "unfollowed" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

/**
 * POST /api/users/:id/accept-follow
 * Accepter une demande de follow (sur mon compte prive)
 */
export async function acceptFollow(req, res) {
  try {
    const me = await User.findById(req.user._id);
    const requester = await User.findById(req.params.id);
    if (!requester) return res.status(404).json({ message: "Utilisateur introuvable" });

    const idx = me.followRequests.findIndex((id) => id.toString() === requester._id.toString());
    if (idx === -1) return res.status(400).json({ message: "Pas de demande de cet utilisateur" });

    me.followRequests.splice(idx, 1);
    if (!me.followers.some((id) => id.toString() === requester._id.toString())) {
      me.followers.push(requester._id);
    }
    if (!requester.following.some((id) => id.toString() === me._id.toString())) {
      requester.following.push(me._id);
    }
    await me.save();
    await requester.save();

    // Notif au demandeur
    createNotification({
      recipient: requester._id,
      sender: me._id,
      senderUsername: me.username,
      senderImage: me.profileImage,
      type: "follow_accepted",
      message: `${me.username} a accepté ta demande`,
      link: `/u/${me._id}`,
    }).catch(() => {});

    res.json({ status: "accepted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

/**
 * GET /api/users — recherche par username/fullName
 */
export async function searchUsers(req, res) {
  try {
    const q = (req.query.q || "").trim();
    const filter = q
      ? { $or: [{ username: new RegExp(q, "i") }, { fullName: new RegExp(q, "i") }] }
      : {};
    const users = await User.find(filter)
      .select("username fullName profileImage auraColor dominantEmotion accountType")
      .limit(20);
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}
