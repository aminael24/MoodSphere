import ChatMessage from "../models/ChatMessage.js";
import { generateBotReply } from "../services/chatbotService.js";
import { checkBadges } from "../services/badgeService.js";

export async function getHistory(req, res) {
  try {
    const messages = await ChatMessage.find({ user: req.user._id })
      .sort({ createdAt: 1 })
      .limit(200);
    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function sendMessage(req, res) {
  try {
    console.log("📨 [Chat] Message reçu :", req.body.content);
    const { content } = req.body;
    if (!content || !content.trim()) {
      return res.status(400).json({ message: "Message vide" });
    }

    const history = await ChatMessage.find({ user: req.user._id }).sort({ createdAt: 1 });
    console.log("📚 Historique : " + history.length + " messages");

    const userMsg = await ChatMessage.create({
      user: req.user._id,
      role: "user",
      content,
    });
    console.log("💾 Message user sauvegardé");

    console.log("🤖 Appel generateBotReply...");
    const reply = await generateBotReply(content, history);
    console.log("✅ Réponse générée :", reply.content?.slice(0, 60) + "...");

    const botMsg = await ChatMessage.create({
      user: req.user._id,
      role: "bot",
      content: reply.content,
      emotionContext: reply.emotionContext || "",
      crisisDetected: !!reply.crisisDetected,
    });
    console.log("💾 Réponse bot sauvegardée");
const newBadges = await checkBadges(req.user._id, "chat").catch(() => []);

    res.json({
      userMessage: userMsg,
      botMessage: botMsg,
      crisisResources: reply.crisisResources || null,
      newBadges,
    });
    console.log("📤 Réponse envoyée au frontend\n");
  } catch (err) {
    console.error("❌ ERREUR dans sendMessage :", err);
    res.status(500).json({ message: err.message });
  }
}

export async function clearHistory(req, res) {
  try {
    await ChatMessage.deleteMany({ user: req.user._id });
    res.json({ message: "Conversation effacée" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}