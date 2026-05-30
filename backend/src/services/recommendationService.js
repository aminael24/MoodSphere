/**
 * Service de recommandation
 * - Couleur d'aura (alignee sur palette burgundy/cream)
 * - Playlist musicale
 * - Activite suggeree
 */

// Auras dans des tons chauds qui s'harmonisent avec la palette
export const AURA_COLORS = {
  joy: "#E8B86D",       // doré chaleureux
  sad: "#7B5A6B",       // mauve étouffé
  angry: "#A03A2E",     // rouge profond
  stress: "#8E6C5C",    // brun anxieux
  calm: "#D5BCAD",      // sand de la palette
  motivated: "#C8633A", // caramel ardent
};

const RECOMMENDATIONS = {
  joy: {
    playlist: "https://open.spotify.com/playlist/37i9dQZF1DXdPec7aLTmlC",
    playlistName: "Happy Hits",
    activity: "Partage ta joie : appelle quelqu'un que tu aimes.",
    contentType: "énergique",
  },
  sad: {
    playlist: "https://open.spotify.com/playlist/37i9dQZF1DX3YSRoSdA634",
    playlistName: "Comfort & Espoir",
    activity: "Écris ce que tu ressens, ou regarde une vidéo motivante.",
    contentType: "réconfortant",
  },
  angry: {
    playlist: "https://open.spotify.com/playlist/37i9dQZF1DWZqd5JICZI0u",
    playlistName: "Méditation",
    activity: "5 minutes de respiration profonde, puis une marche.",
    contentType: "apaisant",
  },
  stress: {
    playlist: "https://open.spotify.com/playlist/37i9dQZF1DWXe9gMpK6gPK",
    playlistName: "Anti-Stress",
    activity: "Note 3 choses sous ton contrôle. Respire lentement.",
    contentType: "relaxant",
  },
  calm: {
    playlist: "https://open.spotify.com/playlist/37i9dQZF1DX9uKNf5jGX6m",
    playlistName: "Ambient Chill",
    activity: "Savoure ce calme : lecture, thé, ou silence.",
    contentType: "ambiant",
  },
  motivated: {
    playlist: "https://open.spotify.com/playlist/37i9dQZF1DX76Wlfdnj7AP",
    playlistName: "Beast Mode",
    activity: "Lance-toi maintenant sur ton objectif principal !",
    contentType: "énergique",
  },
};

export function getAuraColor(emotion) {
  return AURA_COLORS[emotion] || AURA_COLORS.calm;
}

export function getRecommendation(emotion, quote = "") {
  const rec = RECOMMENDATIONS[emotion] || RECOMMENDATIONS.calm;
  return { ...rec, quote };
}
