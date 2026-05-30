import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import User from "../models/User.js";
import Post from "../models/Post.js";
import MoodJournal from "../models/MoodJournal.js";
import ChatMessage from "../models/ChatMessage.js";
import Notification from "../models/Notification.js";
import Report from "../models/Report.js";
import { Room, RoomMessage } from "../models/Room.js";
import { detectEmotion } from "../services/aiEmotionService.js";
import { getAuraColor, getRecommendation } from "../services/recommendationService.js";
import { ROOM_DEFINITIONS } from "../controllers/roomsController.js";

const DEMO_USERS = [
  { fullName: "Admin Sphere", username: "admin", email: "admin@demo.com", password: "admin123", bio: "Administrateur de la plateforme", role: "admin" },
  { fullName: "Sara El Amrani", username: "sara", email: "sara@demo.com", password: "123456", bio: "Étudiante, passionnée de musique 🎵" },
  { fullName: "Youssef Bennani", username: "youssef", email: "youssef@demo.com", password: "123456", bio: "Toujours motivé !" },
  { fullName: "Lina Tazi", username: "lina", email: "lina@demo.com", password: "123456", bio: "Zen attitude 🌸", accountType: "private" },
  { fullName: "Amine Ouali", username: "amine", email: "amine@demo.com", password: "123456", bio: "Dev & café ☕" },
];

const DEMO_POSTS = [
  { text: "Je suis tellement heureux aujourd'hui, tout va bien et je souris !", visibility: "public", tags: ["bonheur", "weekend"] },
  { text: "Journée difficile, je me sens triste et seul ce soir.", visibility: "public", anonymous: true, tags: ["tristesse"] },
  { text: "Je suis super motivé, prêt à atteindre mon objectif cette semaine !", visibility: "public", tags: ["motivation", "objectifs"] },
  { text: "Un peu stressé par les examens, j'ai peur de ne pas réussir.", visibility: "followers", anonymous: true, tags: ["stress", "examens"] },
  { text: "Enfin un moment calme et tranquille, je me sens serein.", visibility: "public", tags: ["calme", "zen"] },
  { text: "Ça m'énerve, c'est vraiment injuste cette situation.", visibility: "public", tags: ["colere"] },
  { text: "Fier de moi, j'ai terminé mon projet après beaucoup d'efforts !", visibility: "public", tags: ["fierte", "reussite"] },
  { text: "Je me sens détendu, une bonne tasse de thé et de la musique douce.", visibility: "public", tags: ["zen"] },
  { text: "Plein d'énergie ce matin, on fonce vers nos rêves !", visibility: "public", tags: ["motivation"] },
  { text: "Un peu anxieux mais je respire et je reste positif.", visibility: "followers", tags: ["stress"] },
];

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("✅ MongoDB connecté");

  await Promise.all([
    Post.deleteMany({}),
    User.deleteMany({}),
    MoodJournal.deleteMany({}),
    ChatMessage.deleteMany({}),
    Notification.deleteMany({}),
    Report.deleteMany({}),
    RoomMessage.deleteMany({}),
    Room.deleteMany({}),
  ]);
  console.log("🧹 Données précédentes supprimées");

  // Salons
  for (const def of ROOM_DEFINITIONS) await Room.create(def);
  console.log(`🏠 ${ROOM_DEFINITIONS.length} salons créés`);

  // Utilisateurs
  const users = [];
  for (const u of DEMO_USERS) {
    const user = await User.create({ ...u, isEmailVerified: true });
    users.push(user);
  }
  console.log(`👥 ${users.length} utilisateurs créés (dont 1 admin)`);

  // Follows
  // sara suit youssef et amine; youssef suit sara
  users[1].following.push(users[2]._id, users[4]._id);
  users[2].followers.push(users[1]._id);
  users[4].followers.push(users[1]._id);
  users[2].following.push(users[1]._id);
  users[1].followers.push(users[2]._id);
  for (const u of users) await u.save();

  // Posts
  let count = 0;
  for (let i = 0; i < DEMO_POSTS.length; i++) {
    const { text, visibility, anonymous, tags } = DEMO_POSTS[i];
    const author = users[(i % (users.length - 1)) + 1]; // skip admin

    const a = await detectEmotion(text);
    const aura = getAuraColor(a.dominantEmotion);
    const rec = getRecommendation(a.dominantEmotion, a.quote);

    await Post.create({
      author: author._id,
      authorUsername: author.username,
      authorImage: author.profileImage,
      content: text,
      visibility,
      anonymous: !!anonymous,
      tags: tags || [],
      aiAnalysis: {
        dominantEmotion: a.dominantEmotion,
        confidence: a.confidence,
        scores: a.scores,
        crisisDetected: a.crisisDetected,
      },
      auraColor: aura,
      recommendations: rec,
    });

    await User.findByIdAndUpdate(author._id, {
      auraColor: aura,
      dominantEmotion: a.dominantEmotion,
      $push: { moodHistory: { emotion: a.dominantEmotion, aura, date: new Date() } },
    });
    count++;
  }
  console.log(`📝 ${count} posts créés avec analyse IA`);

  // Quelques entrees journal pour sara
  const sara = users[1];
  const journalEntries = [
    "Aujourd'hui je me sens calme et alignée avec moi-même.",
    "Une journée motivée, j'ai avancé sur mes projets !",
    "Petit coup de mou ce matin, mais ça va mieux maintenant.",
  ];
  for (const text of journalEntries) {
    const a = await detectEmotion(text);
    await MoodJournal.create({
      author: sara._id,
      content: text,
      aiAnalysis: {
        dominantEmotion: a.dominantEmotion,
        confidence: a.confidence,
        scores: a.scores,
        crisisDetected: a.crisisDetected,
      },
      auraColor: getAuraColor(a.dominantEmotion),
    });
  }
  console.log(`📓 ${journalEntries.length} entrées journal créées pour sara`);

  // Quelques messages dans le salon happy
  const happyRoom = await Room.findOne({ slug: "happy" });
  await RoomMessage.create({
    room: happyRoom._id,
    user: users[1]._id,
    username: users[1].username,
    profileImage: users[1].profileImage,
    content: "Bonne soirée à tous ! Quelqu'un d'autre se sent bien ce soir ?",
    auraColor: users[1].auraColor,
  });
  await RoomMessage.create({
    room: happyRoom._id,
    user: users[2]._id,
    username: users[2].username,
    profileImage: users[2].profileImage,
    content: "Yes, super motivé pour demain !",
    auraColor: users[2].auraColor,
  });
  console.log(`💬 Messages de salon ajoutés`);

  console.log("\n✨ Données prêtes !");
  console.log("   Admin : admin@demo.com / admin123");
  console.log("   User  : sara@demo.com / 123456\n");
  await mongoose.disconnect();
  process.exit(0);
}

run().catch((err) => {
  console.error("❌ Erreur seed :", err);
  process.exit(1);
});
