/**
 * Service Chatbot bien-etre emotionnel
 * Mode 1 : Groq API (Llama 3.3) si GROQ_API_KEY defini
 * Mode 2 : Fallback local sur reponses pre-ecrites
 */

import { detectEmotion } from "./aiEmotionService.js";
import { detectCrisis, getCrisisResources } from "./crisisService.js";

// Reponses empathiques par emotion (fallback)
const RESPONSES = {
  joy: [
    "C'est merveilleux a entendre ! Qu'est-ce qui t'a apporte cette joie aujourd'hui ?",
    "Profite pleinement de ce moment. Ce que tu ressens est precieux.",
    "J'aime sentir ton energie positive. Veux-tu en partager plus ?",
  ],
  sad: [
    "Je t'entends. Cette tristesse est valide, tu as le droit de la ressentir.",
    "Merci de me confier ce que tu traverses. Veux-tu m'en dire un peu plus ?",
    "Parfois mettre des mots aide deja un peu. Je suis la pour t'ecouter.",
  ],
  angry: [
    "Ta colere est comprehensible. Qu'est-ce qui a declenche cette emotion ?",
    "Je sens que quelque chose t'a vraiment touche·e. Veux-tu en parler ?",
    "C'est ok d'etre en colere. Comment puis-je t'aider a y voir plus clair ?",
  ],
  stress: [
    "Le stress peut etre tres lourd. Essayons une respiration : inspire 4s, expire 6s.",
    "Tu n'as pas a tout porter seul·e. Qu'est-ce qui te pese le plus en ce moment ?",
    "Un pas a la fois. Quelle est la chose la plus urgente pour toi maintenant ?",
  ],
  calm: [
    "C'est beau de te sentir en paix. Profite de ce moment.",
    "La serenite est un cadeau. Comment cultives-tu ce calme ?",
    "Belle energie. Y a-t-il quelque chose dont tu aimerais parler ?",
  ],
  motivated: [
    "Cette energie est inspirante ! Quel est ton objectif principal en ce moment ?",
    "J'aime ta determination. Qu'est-ce qui te motive le plus ?",
    "Avance pas a pas, cette dynamique est precieuse.",
  ],
};

const GREETINGS = [
  "Bonjour. Je suis la pour t'ecouter, sans jugement. Comment te sens-tu aujourd'hui ?",
  "Coucou. Prends ton temps. Qu'est-ce qui t'amene ici ?",
  "Hello. Je suis a l'ecoute. De quoi as-tu envie de parler ?",
];

const FOLLOW_UPS = [
  "Veux-tu m'en dire un peu plus ?",
  "Qu'est-ce que ca declenche en toi ?",
  "Comment te sens-tu en parlant de ca ?",
];

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Genere une reponse empathique du chatbot
 */
export async function generateBotReply(userMessage, history = []) {
  console.log("  🤖 [Bot] Génération pour :", userMessage);

  // 1. Detection de crise — priorite absolue
  if (detectCrisis(userMessage)) {
    console.log("  ⚠️ Crise détectée — fallback ressources");
    return {
      content:
        "Je suis vraiment touche·e par ce que tu partages. Ce que tu ressens est important, " +
        "et tu n'as pas a porter ca seul·e. Voici des ressources confidentielles ou des " +
        "personnes formees pourront t'ecouter et t'aider. Je reste la avec toi.",
      emotionContext: "crisis",
      crisisDetected: true,
      crisisResources: getCrisisResources(),
    };
  }

  const apiKey = process.env.GROQ_API_KEY;
  console.log("  🔑 Clé Groq :", apiKey ? "OUI (" + apiKey.slice(0, 12) + "...)" : "VIDE");

  // 2. Si cle Groq dispo → vraie IA
  if (apiKey && apiKey.trim().length > 0) {
    try {
      console.log("  📡 Appel Groq API...");
      const analysis = await detectEmotion(userMessage);
      console.log("  🎭 Émotion détectée :", analysis.dominantEmotion);

      const systemPrompt = `Tu es un assistant d'écoute bienveillant pour l'application MoodSphere, un réseau social émotionnel.

RÈGLES STRICTES :
- Tu réponds TOUJOURS en français
- Tu es empathique, chaleureux·se, sans jugement
- Tu ne donnes JAMAIS de diagnostic médical ni de prescription
- Tu ne prétends JAMAIS être thérapeute ou médecin
- Tu poses parfois une question ouverte pour relancer la conversation
- Tu restes BREF : 2-3 phrases maximum
- Si l'utilisateur exprime une détresse profonde, tu l'orientes gentiment vers un·e professionnel·le

L'émotion détectée dans le dernier message de l'utilisateur : ${analysis.dominantEmotion}
Réponds avec empathie en tenant compte de cette émotion.`;

      const recentHistory = history.slice(-5).map((m) => ({
        role: m.role === "bot" ? "assistant" : "user",
        content: m.content,
      }));

      const messages = [
        { role: "system", content: systemPrompt },
        ...recentHistory,
        { role: "user", content: userMessage },
      ];

      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages,
          temperature: 0.7,
          max_tokens: 250,
        }),
      });

      console.log("  📥 Groq HTTP status :", res.status);

      if (!res.ok) {
        const errText = await res.text();
        console.log("  ❌ Groq erreur body :", errText.slice(0, 200));
        throw new Error(`Groq HTTP ${res.status}`);
      }

      const data = await res.json();
      const reply = data.choices?.[0]?.message?.content?.trim();
      if (!reply) throw new Error("Réponse vide");

      console.log("  ✅ Groq OK — réponse :", reply.slice(0, 50) + "...");

      return {
        content: reply,
        emotionContext: analysis.dominantEmotion,
        crisisDetected: false,
      };
    } catch (err) {
      console.warn("  ⚠️ [Chatbot] Fallback local cause :", err.message);
    }
  }

  // 3. Fallback local
  console.log("  🔄 Utilisation du fallback local");
  if (history.length === 0) {
    return {
      content: pickRandom(GREETINGS),
      emotionContext: "greeting",
      crisisDetected: false,
    };
  }

  const analysis = await detectEmotion(userMessage);
  const emotion = analysis.dominantEmotion;
  const base = pickRandom(RESPONSES[emotion] || RESPONSES.calm);
  const reply = Math.random() < 0.33 ? `${base} ${pickRandom(FOLLOW_UPS)}` : base;

  return {
    content: reply,
    emotionContext: emotion,
    crisisDetected: false,
  };
}