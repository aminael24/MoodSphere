import User from "../models/User.js";
import Post from "../models/Post.js";
import MoodJournal from "../models/MoodJournal.js";
import { createNotification } from "./notificationService.js";

// Catalogue avec conditions affichables pour la page Badges
export const BADGE_CATALOG = {
  first_post:       { label: "Premier pas",      emoji: "🌱", points: 10,  condition: "Publie ton premier post" },
  first_journal:    { label: "Cher journal",     emoji: "📓", points: 10,  condition: "Écris ta première entrée de journal" },
  joy_master:       { label: "Maître de la joie",emoji: "☀️", points: 50,  condition: "Publie 5 posts avec l'émotion 'joie'" },
  zen_master:       { label: "Maître du calme", emoji: "🪷", points: 50,  condition: "Publie 5 posts avec l'émotion 'calme'" },
  go_getter:        { label: "Battant·e",       emoji: "🔥", points: 50,  condition: "Publie 5 posts avec l'émotion 'motivé'" },
  streak_3:         { label: "Régularité 3j",   emoji: "⚡", points: 30,  condition: "Écris dans le journal 3 jours d'affilée" },
  streak_7:         { label: "Streak de feu",   emoji: "💎", points: 100, condition: "Écris dans le journal 7 jours d'affilée" },
  social_butterfly: { label: "Papillon social", emoji: "🦋", points: 30,  condition: "Sois suivi·e par au moins 3 personnes" },
  loved:            { label: "Très aimé·e",     emoji: "💖", points: 50,  condition: "Reçois 5 likes sur un même post" },
  open_mind:        { label: "Esprit ouvert",   emoji: "🧠", points: 20,  condition: "Discute avec l'AI Therapist Bot" },
};

async function awardBadge(user, code) {
  if (user.badges.some((b) => b.code === code)) return false;
  const def = BADGE_CATALOG[code];
  if (!def) return false;

  user.badges.push({ code, label: def.label, emoji: def.emoji });
  user.wellnessPoints = (user.wellnessPoints || 0) + def.points;
  await user.save();

  await createNotification({
    recipient: user._id,
    type: "badge",
    message: `🎉 Tu as débloqué le badge "${def.label}" ${def.emoji} (+${def.points} pts)`,
    link: "/badges",
  });
  return true;
}

export async function updateJournalStreak(user) {
  const now = new Date();
  const today = now.toDateString();
  const last = user.lastJournalDate ? new Date(user.lastJournalDate).toDateString() : null;

  if (last === today) return [];

  if (last) {
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    if (last === yesterday.toDateString()) user.streak = (user.streak || 0) + 1;
    else user.streak = 1;
  } else {
    user.streak = 1;
  }
  user.lastJournalDate = now;
  await user.save();

  const newBadges = [];
  const tryAward = async (code) => {
    if (await awardBadge(user, code)) {
      const def = BADGE_CATALOG[code];
      newBadges.push({ code, label: def.label, emoji: def.emoji, points: def.points });
    }
  };
  if (user.streak >= 3) await tryAward("streak_3");
  if (user.streak >= 7) await tryAward("streak_7");
  return newBadges;
}

/**
 * Vérifie les badges + RETOURNE la liste des nouveaux débloqués
 */
export async function checkBadges(userId, action) {
  const user = await User.findById(userId);
  if (!user) return [];

  const newBadges = [];

  const tryAward = async (code) => {
    if (await awardBadge(user, code)) {
      const def = BADGE_CATALOG[code];
      newBadges.push({ code, label: def.label, emoji: def.emoji, points: def.points });
    }
  };

  const [postCount, journalCount, joyCount, calmCount, motivatedCount] = await Promise.all([
    Post.countDocuments({ author: userId }),
    MoodJournal.countDocuments({ author: userId }),
    Post.countDocuments({ author: userId, "aiAnalysis.dominantEmotion": "joy" }),
    Post.countDocuments({ author: userId, "aiAnalysis.dominantEmotion": "calm" }),
    Post.countDocuments({ author: userId, "aiAnalysis.dominantEmotion": "motivated" }),
  ]);

  if (postCount >= 1) await tryAward("first_post");
  if (journalCount >= 1) await tryAward("first_journal");
  if (joyCount >= 5) await tryAward("joy_master");
  if (calmCount >= 5) await tryAward("zen_master");
  if (motivatedCount >= 5) await tryAward("go_getter");
  if ((user.followers?.length || 0) >= 3) await tryAward("social_butterfly");
  if (action === "chat") await tryAward("open_mind");

  const popularPost = await Post.findOne({ author: userId, "likes.4": { $exists: true } });
  if (popularPost) await tryAward("loved");

  return newBadges;
}