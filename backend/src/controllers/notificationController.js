import Notification from "../models/Notification.js";
/**
 * GET /api/notifications
 */
export async function listMine(req, res) {
  try {
    const notifs = await Notification.find({ recipient: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50);

    const unread = await Notification.countDocuments({
      recipient: req.user._id,
      isRead: false,
    });

    res.json({
      notifications: notifs,
      unreadCount: unread,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

/**
 * POST /api/notifications/read-all
 */
export async function markAllRead(req, res) {
  try {
    await Notification.updateMany(
      { recipient: req.user._id, isRead: false },
      { $set: { isRead: true } }
    );

    res.json({ message: "ok" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

/**
 * POST /api/notifications/:id/read
 */
export async function markRead(req, res) {
  try {
    const n = await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient: req.user._id },
      { $set: { isRead: true } },
      { new: true }
    );

    if (!n) return res.status(404).json({ message: "Introuvable" });

    res.json(n);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}