import Notification from "../models/Notification.js";

/**
 * Cree une notification pour un utilisateur
 */
export async function createNotification({
  recipient, sender, senderUsername, senderImage,
  type, message, link,
}) {
  // Ne pas se notifier soi-meme
  if (sender && recipient && sender.toString() === recipient.toString()) return null;

  try {
    return await Notification.create({
      recipient,
      sender,
      senderUsername,
      senderImage,
      type,
      message,
      link,
    });
  } catch (err) {
    console.warn("[notif]", err.message);
    return null;
  }
}
