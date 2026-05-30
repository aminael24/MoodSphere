# 🎭 MoodSphere v2.1 — Édition Avancée

**Réseau social émotionnel intelligent basé sur l'IA**, avec 10 modules avancés : journal privé, chatbot bien-être, salons temps réel, notifications, modération, gamification, admin, carte émotionnelle, mode sécurité crise, et recherche avancée.

---

## ✨ Fonctionnalités

### Coeur (v2)
- 🔑 Auth complète : register, login, vérification email, forgot/reset password (JWT + bcrypt + crypto)
- 📷 Upload photo de profil (Multer 3 Mo)
- 👥 Follow/unfollow + demandes pour comptes privés
- ✍️ Posts avec 3 niveaux de visibilité + mode anonyme + tags
- 🧠 IA : détection émotion HuggingFace + fallback local FR/EN
- 🎵 Recommandations (musique, activité, citation)
- 🌌 Aura dynamique (AuraOrb 3D)
- 📊 Dashboard émotionnel (Doughnut, Bar, agrégations MongoDB)

### Modules avancés (v2.1)
1. 📓 **Mood Journal privé** — entrées personnelles analysées par l'IA, timeline émotionnelle, recherche, tags
2. 🤖 **AI Therapist Chatbot** — écoute empathique, réponses adaptées à l'émotion détectée, historique
3. 💬 **Emotional Rooms** — 5 salons (Happy, Sad, Stress, Calm, Motivation) avec **Socket.IO temps réel**
4. 🔔 **Notifications** — follow, like, comment, demande acceptée, badge débloqué (cloche avec compteur)
5. 🚩 **Reports & Moderation** — signalement de posts/commentaires + workflow admin (masquer/supprimer/rejeter)
6. 🏆 **Gamification** — 10 badges, streak journal, points bien-être
7. 🛡️ **Admin Dashboard** — stats globales, gestion users, modération, tendances 7 jours
8. 🗺️ **Live Emotional Map** — agrégation par ville (geospatial MongoDB), bulles SVG, granularité ville uniquement
9. 💛 **Crisis Safety Mode** — détection de signaux de détresse, modal avec ressources pro (**jamais** de diagnostic, jamais de méthodes)
10. 🔍 **Recherche avancée** — par texte, émotion, tag, date (utilise indexes MongoDB text + 2dsphere)

---

## 🚀 Démarrage rapide

### Prérequis
- Node.js ≥ 18
- MongoDB Atlas (ou MongoDB local)

### Backend
```bash
cd backend
npm install
cp .env.example .env
# Édite .env : MONGO_URI, JWT_SECRET (HUGGINGFACE_API_KEY optionnel)
npm run seed      # crée admin + 4 users + 10 posts + journals + salons
npm run dev
```
API : `http://localhost:5000` (HTTP + Socket.IO sur le même port)

### Frontend
```bash
cd frontend
npm install
npm run dev
```
App : `http://localhost:5173`

### Comptes démo
```
Admin : admin@demo.com / admin123
User  : sara@demo.com  / 123456
```

---

## 📂 Architecture

```
moodsphere-v2/
├── backend/
│   └── src/
│       ├── config/db.js
│       ├── controllers/
│       │   ├── authController.js
│       │   ├── userController.js
│       │   ├── postController.js
│       │   ├── statsController.js
│       │   ├── journalController.js       ← NEW
│       │   ├── chatController.js          ← NEW
│       │   ├── roomsController.js         ← NEW
│       │   ├── notificationsController.js ← NEW
│       │   ├── reportsController.js       ← NEW
│       │   ├── adminController.js         ← NEW
│       │   ├── mapController.js           ← NEW
│       │   └── searchController.js        ← NEW
│       ├── middlewares/
│       │   ├── auth.js, upload.js, error.js
│       │   └── admin.js                   ← NEW
│       ├── models/
│       │   ├── User.js, Post.js
│       │   ├── MoodJournal.js             ← NEW
│       │   ├── ChatMessage.js             ← NEW
│       │   ├── Room.js (Room + RoomMessage) ← NEW
│       │   ├── Notification.js            ← NEW
│       │   └── Report.js                  ← NEW
│       ├── routes/  (auth, users, posts, stats, journal, chat, rooms, notifications, reports, admin, map, search)
│       ├── services/
│       │   ├── aiEmotionService.js
│       │   ├── recommendationService.js
│       │   ├── emailService.js
│       │   ├── crisisService.js           ← NEW
│       │   ├── chatbotService.js          ← NEW
│       │   ├── notificationService.js     ← NEW
│       │   └── badgeService.js            ← NEW
│       ├── utils/seed.js
│       ├── app.js
│       └── server.js  (HTTP + Socket.IO)
└── frontend/
    └── src/
        ├── components/  (Background, Navbar, AuraOrb, PostCard, Toast, NotificationBell, CrisisModal, ReportButton)
        ├── pages/       (Landing, Login, Register, Feed, Explore, Dashboard, Profile, UserProfile, Journal, Therapist, Rooms, RoomView, EmotionalMap, Admin, PasswordPages)
        ├── context/AuthContext.jsx
        ├── styles/global.css
        └── utils/  (api.js, socket.js, emotions.js)
```

---

## 🌐 Routes API

### Auth `/api/auth`
- `POST /register`, `POST /login`, `GET /me`
- `GET /verify-email/:token`, `POST /forgot-password`, `POST /reset-password/:token`

### Users `/api/users`
- `GET /?q=`, `GET /:id`, `PATCH /me`, `POST /upload-profile-image`
- `POST /:id/follow`, `POST /:id/unfollow`, `POST /:id/accept-follow`

### Posts `/api/posts`
- `POST /`, `GET /feed`, `GET /public`, `GET /me`, `GET /user/:id`
- `PATCH /:id`, `DELETE /:id`, `POST /:id/like`, `POST /:id/comments`

### Stats `/api/stats`
- `GET /emotional-weather`, `GET /my-mood-timeline`, `GET /community-trends`
- `GET /overview`, `GET /top-positive`

### 🆕 Journal `/api/journal`
- `POST /`, `GET /`, `GET /timeline`, `DELETE /:id`

### 🆕 Chat `/api/chat`
- `GET /`, `POST /`, `DELETE /`

### 🆕 Rooms `/api/rooms`
- `GET /`, `GET /:slug/messages`, `POST /:slug/messages` (fallback)
- Socket.IO events : `room:join`, `room:leave`, `room:send`, `room:message`, `room:typing`

### 🆕 Notifications `/api/notifications`
- `GET /`, `POST /read-all`, `POST /:id/read`

### 🆕 Reports `/api/reports`
- `POST /` (body : `targetType, targetId, reason, details`)

### 🆕 Admin `/api/admin` (role: admin requis)
- `GET /overview` — stats + tendances 7j (aggregation $group par jour×emotion)
- `GET /users`, `PATCH /users/:id`, `DELETE /users/:id`
- `GET /reports`, `POST /reports/:id/resolve`
- `GET /posts`, `PATCH /posts/:id` (toggle hide)

### 🆕 Map `/api/map`
- `GET /cities` — agrégation MongoDB par ville (lat/lng arrondis, jamais d'adresse)
- `PATCH /me/location` — set city/coords approximatifs

### 🆕 Search `/api/search`
- `GET /?q=&emotion=&tag=&from=&to=&type=` — utilise indexes text + filtres
- `GET /tags` — top 20 tags (aggregation)

---

## 🗄️ Collections MongoDB

| Collection | Description |
|------------|-------------|
| `users` | utilisateurs + badges + streak + location geospatial |
| `posts` | posts publics avec analyse IA + tags + reportCount |
| `moodjournals` | entrées privées analysées par IA |
| `chatmessages` | historique chatbot |
| `rooms` + `roommessages` | salons + messages temps réel |
| `notifications` | événements sociaux (follow, like, comment, badge) |
| `reports` | signalements en attente / traités |

### Indexes créés
- `users` : `location` (2dsphere) + `username/fullName/bio` (text)
- `posts` : `createdAt` desc + `aiAnalysis.dominantEmotion` + `tags` + `content` (text)
- `moodjournals` : `author + createdAt` + text
- `notifications` : `recipient + createdAt`, `recipient + isRead`

---

## 🤔 Pourquoi MongoDB ?

1. **Schémas flexibles** : `aiAnalysis.scores` est une Map de 6 émotions, extensible sans migration.
2. **Sous-documents** : `comments` et `moodHistory` directement dans User/Post.
3. **Geospatial natif** : indice `2dsphere` pour la carte émotionnelle par ville.
4. **Indexes text** : recherche full-text sans Elasticsearch.
5. **Agrégations puissantes** : météo émotionnelle (`$group`), tendance 7 jours (`$dateToString`), top users positifs (`$lookup`).
6. **Évolutivité** : ajouter un champ (ex: tags, isHidden) sans toucher l'existant.

---

## 💛 À propos du Crisis Safety Mode

Ce module détecte automatiquement des **signaux de détresse** dans les posts, entrées de journal et messages du chatbot, et affiche une modal d'**orientation** vers des ressources professionnelles.

**Principes appliqués** :
- ❌ JAMAIS de diagnostic médical
- ❌ JAMAIS de méthode à risque mentionnée
- ❌ JAMAIS de prétention thérapeutique
- ✅ Disclaimer clair que MoodSphere n'est pas un service médical
- ✅ Orientation vers `findahelpline.com` (annuaire international)
- ✅ Suggestion d'actions apaisantes simples (respiration, parler à un·e proche)
- ✅ Le chatbot bascule en mode "écoute + ressources" dès détection

---

## 🎯 Architecture des sockets (Emotional Rooms)

```javascript
// Côté serveur (server.js)
io.use(jwtAuth);  // auth par token
io.on("connection", (socket) => {
  socket.on("room:join", slug => socket.join(`room:${slug}`));
  socket.on("room:send", async ({ slug, content }) => {
    const msg = await RoomMessage.create({...});
    io.to(`room:${slug}`).emit("room:message", msg);
  });
});

// Côté client (RoomView.jsx)
const socket = getSocket();
socket.emit("room:join", slug);
socket.on("room:message", (msg) => setMessages([...messages, msg]));
```

Fallback REST si Socket.IO échoue (`POST /api/rooms/:slug/messages`).

---

## 🧪 Tests rapides

### Créer un post avec détection IA
```http
POST /api/posts
Authorization: Bearer <token>
{ "content": "Je suis super heureux !", "tags": ["bonheur"] }
```

### Créer une entrée journal
```http
POST /api/journal
{ "content": "Ma journée…", "title": "Lundi", "tags": ["work"] }
```

### Envoyer un message au chatbot
```http
POST /api/chat
{ "content": "Je me sens stressée par mes examens" }
```

### Recherche avancée
```http
GET /api/search?q=motivation&emotion=motivated&from=2026-01-01
```

---

## 👥 Répartition (équipe de 5)

| Personne | Tâches |
|----------|--------|
| 1 | Backend : auth + users + middlewares + email |
| 2 | Backend : IA + chatbot + crisis + journal |
| 3 | Backend : posts + stats + rooms + Socket.IO + map |
| 4 | Backend : notifications + reports + admin + badges + seed |
| 4 | Frontend : Landing, auth pages, AuthContext, NotificationBell |
| 5 | Frontend : Feed, Journal, Therapist, Rooms (Socket.IO client) |
| 5 | Frontend : Dashboard, Map, Admin, Profile, CrisisModal |

(Réajustez selon vos forces — backend peut être partagé entre 1/2 et 3/4)

**Bonne soutenance !** ✨
