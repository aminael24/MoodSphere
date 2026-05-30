// Métadonnées émotion (libellé FR + couleur burgundy palette + emoji)
export const EMOTION_META = {
  joy:       { label: "Joie",       color: "#E8B86D", emoji: "😊" },
  sad:       { label: "Tristesse",  color: "#7B5A6B", emoji: "😔" },
  angry:     { label: "Colère",     color: "#A03A2E", emoji: "😠" },
  stress:    { label: "Stress",     color: "#8E6C5C", emoji: "😰" },
  calm:      { label: "Calme",      color: "#D5BCAD", emoji: "😌" },
  motivated: { label: "Motivé",     color: "#C8633A", emoji: "🔥" },
};

export const meta = (e) => EMOTION_META[e] || EMOTION_META.calm;
