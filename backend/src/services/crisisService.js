/**
 * Service de detection de signaux de detresse
 * --------------------------------------------
 *  IMPORTANT : ce service NE FOURNIT PAS de diagnostic medical.
 *  Il detecte des signaux dans le texte et oriente vers des ressources
 *  professionnelles. Toute decision de prise en charge revient a un·e
 *  professionnel·le de sante.
 */

// Mots-cles indicateurs de detresse severe (FR + EN)
// On reste prudent : on ne liste pas de methodes specifiques
const DISTRESS_KEYWORDS = [
  // Pensees suicidaires (langage general)
  "suicide", "me tuer", "en finir", "disparaitre", "disparaître",
  "kill myself", "end it all", "want to die", "no reason to live",
  "ne plus exister", "n'en peux plus", "abandonner tout",
  // Auto-agression (langage general)
  "me faire du mal", "self-harm", "self harm", "hurt myself",
  // Desespoir profond
  "personne ne m'aime", "tout le monde s'en fiche", "je suis nul",
  "nobody cares", "hopeless", "worthless", "hate myself",
  "désespéré", "desespere",
];

/**
 * Detecte si un texte contient des signaux de detresse
 */
export function detectCrisis(text) {
  if (!text) return false;
  const lower = text.toLowerCase();
  return DISTRESS_KEYWORDS.some((kw) => lower.includes(kw));
}

/**
 * Renvoie les ressources d'aide a afficher si crise detectee.
 * Ne JAMAIS donner de diagnostic ou conseil medical.
 */
export function getCrisisResources(lang = "fr") {
  return {
    triggered: true,
    disclaimer:
      "MoodSphere n'est pas un service medical et ne remplace pas l'avis d'un·e professionnel·le. " +
      "Si tu traverses un moment difficile, parler a quelqu'un peut aider.",
    title: "Tu n'es pas seul·e.",
    message:
      "Ce que tu ressens compte. Si la souffrance est forte, voici des ressources confidentielles " +
      "et gratuites pour parler a un·e professionnel·le formé·e.",
    resources: [
      {
        label: "Trouver une ligne d'aide près de toi (international)",
        url: "https://findahelpline.com/",
        description: "Annuaire mondial de lignes d'écoute gratuites et confidentielles.",
      },
      {
        label: "Maroc — SOS Détresse",
        phone: "0801 000 180",
        description: "Écoute psychologique anonyme (vérifie les horaires localement).",
      },
      {
        label: "Numéros d'urgence",
        description:
          "En cas d'urgence vitale immediate, contacte les services d'urgence de ton pays.",
      },
    ],
    suggestions: [
      "Respire lentement, 4 secondes inspire, 6 secondes expire.",
      "Parle a une personne de confiance — famille, ami·e, professionnel·le.",
      "Sors quelques minutes prendre l'air si tu peux.",
    ],
  };
}
