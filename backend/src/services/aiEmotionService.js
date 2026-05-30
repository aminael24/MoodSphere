/**
 * Service de detection d'emotion par IA
 * --------------------------------------
 *  Mode 1 : API HuggingFace (gratuite) si HUGGINGFACE_API_KEY defini
 *  Mode 2 : Fallback local par mots-cles (toujours dispo)
 *
 *  Renvoie :
 *  {
 *    dominantEmotion: "joy",
 *    confidence: 0.87,
 *    scores: { joy: 0.87, sad: 0.05, stress: 0.10, ... }
 *  }
 */

export const EMOTIONS = ["joy", "sad", "stress", "angry", "calm", "motivated"];

// Mapping HuggingFace -> emotions internes
const HF_MAP = {
  joy: "joy",
  love: "joy",
  sadness: "sad",
  anger: "angry",
  fear: "stress",
  surprise: "motivated",
  neutral: "calm",
  disgust: "angry",
};

// Mots-cles (FR + EN) pour le fallback local
const KEYWORDS = {
  joy: [
    "heureux","heureuse","content","contente","joie","super","génial","genial",
    "incroyable","fier","fière","fiere","réussi","reussi","merci","amour","sourire",
    "rire","happy","joy","great","amazing","love","proud","awesome","wonderful",
    "excited","bien","parfait","top","cool"
  ],
  sad: [
    "triste","déçu","decu","déprimé","deprime","seul","solitude","pleurer","larmes",
    "perdu","vide","manque","nostalgie","sad","lonely","cry","depressed","down",
    "empty","hurt","mal","peine"
  ],
  angry: [
    "colère","colere","énervé","enerve","furieux","rage","marre","injuste","déteste",
    "deteste","haine","angry","mad","hate","furious","annoyed","frustré","frustre",
    "frustrated"
  ],
  stress: [
    "peur","anxieux","anxiété","anxiete","stress","stressé","stresse","inquiet",
    "angoisse","panique","terrifié","terrifie","afraid","scared","anxious","worried",
    "nervous","fear","panic","épuisé","epuise","fatigué","fatigue","tired"
  ],
  calm: [
    "calme","serein","tranquille","paix","détendu","detendu","repos","zen","apaisé",
    "apaise","relax","peaceful","relaxed","chill","quiet","rested"
  ],
  motivated: [
    "motivé","motive","déterminé","determine","objectif","ambition","énergie","energie",
    "prêt","pret","go","force","courage","motivated","determined","focused","ready",
    "energy","goal","ambitious","inspired","inspiré","inspire"
  ],
};

// Citations d'accompagnement
const QUOTES = {
  joy: "Savoure ce moment, tu le mérites !",
  sad: "Les jours difficiles passent. Tu n'es pas seul·e.",
  angry: "Respire profondément. Cette tension va retomber.",
  stress: "Un pas à la fois. Tu es plus fort·e que tu ne crois.",
  calm: "Garde cette sérénité, elle te porte loin.",
  motivated: "Cette énergie est précieuse, fonce vers ton objectif !",
};

/**
 * Analyse locale par mots-cles
 */
function analyzeLocally(text) {
  const lower = (text || "").toLowerCase();
  const counts = Object.fromEntries(EMOTIONS.map((e) => [e, 0]));

  for (const emo of EMOTIONS) {
    for (const word of KEYWORDS[emo]) {
      const matches = lower.split(word).length - 1;
      if (matches > 0) counts[emo] += matches;
    }
  }

  const total = Object.values(counts).reduce((a, b) => a + b, 0);

  if (total === 0) {
    // Texte neutre -> calm par defaut
    const scores = Object.fromEntries(
      EMOTIONS.map((e) => [e, e === "calm" ? 0.6 : 0.08])
    );
    return { dominantEmotion: "calm", confidence: 0.6, scores };
  }

  const scores = {};
  EMOTIONS.forEach((e) => {
    scores[e] = Math.round((counts[e] / total) * 100) / 100;
  });

  const dominantEmotion = EMOTIONS.reduce((a, b) =>
    scores[a] >= scores[b] ? a : b
  );

  return {
    dominantEmotion,
    confidence: scores[dominantEmotion],
    scores,
  };
}

/**
 * Analyse via HuggingFace Inference API
 */
async function analyzeWithHuggingFace(text, apiKey) {
  const MODEL = "j-hartmann/emotion-english-distilroberta-base";
  const res = await fetch(
    `https://api-inference.huggingface.co/models/${MODEL}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ inputs: text }),
    }
  );

  if (!res.ok) throw new Error(`HuggingFace HTTP ${res.status}`);

  const data = await res.json();
  const predictions = Array.isArray(data[0]) ? data[0] : data;
  if (!Array.isArray(predictions)) throw new Error("Réponse HF inattendue");

  const scores = Object.fromEntries(EMOTIONS.map((e) => [e, 0]));

  for (const { label, score } of predictions) {
    const mapped = HF_MAP[(label || "").toLowerCase()];
    if (mapped) {
      scores[mapped] = Math.max(scores[mapped], Math.round(score * 100) / 100);
    }
  }

  const dominantEmotion = EMOTIONS.reduce((a, b) =>
    scores[a] >= scores[b] ? a : b
  );

  return {
    dominantEmotion,
    confidence: scores[dominantEmotion],
    scores,
  };
}

/**
 * Point d'entree : detecte l'emotion d'un texte
 * Inclut aussi la detection de signaux de detresse.
 */
import { detectCrisis } from "./crisisService.js";

export async function detectEmotion(text) {
  const apiKey = process.env.HUGGINGFACE_API_KEY;
  let result;

  if (apiKey && apiKey.trim().length > 0) {
    try {
      result = await analyzeWithHuggingFace(text, apiKey);
    } catch (err) {
      console.warn("[IA] Fallback local :", err.message);
      result = analyzeLocally(text);
    }
  } else {
    result = analyzeLocally(text);
  }

  result.quote = QUOTES[result.dominantEmotion] || "";
  result.crisisDetected = detectCrisis(text);
  return result;
}
