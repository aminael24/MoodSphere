import Notification from "../models/Notification.js";

/**
 * Crée une notification pour un utilisateur.
 */
export async function createNotification({
  recipient,
  sender,
  senderUsername,
  senderImage,
  type,
  message,
  link,
}) {
  if (!recipient || !type || !message) {
    return null;
  }

  // Ne pas notifier l'utilisateur lui-même
  if (sender && recipient && sender.toString() === recipient.toString()) {
    return null;
  }

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
    console.warn("[notification]", err.message);
    return null;
  }
}