# 🎭 MoodSphere 

> Une application web sociale basée sur les émotions humaines, construite avec la stack MERN.

![MoodSphere](https://img.shields.io/badge/version-2.0-purple)
![Stack](https://img.shields.io/badge/stack-MERN-blue)
![License](https://img.shields.io/badge/license-MIT-green)

---

## ✨ Présentation

MoodSphere est un réseau social émotionnel intelligent.  
Les utilisateurs partagent leurs sentiments, reçoivent une analyse IA automatique, interagissent dans des salons émotionnels en temps réel, tiennent un journal privé et suivent leur évolution émotionnelle au fil du temps.

---

## 🚀 Démarrage rapide

### 1. Cloner le projet

```bash
git clone https://github.com/ton-repo/moodsphere.git
cd moodsphere
```

### 2. Lancer le backend

```bash
cd backend
npm install
cp .env.example .env   # Mac/Linux
# ou
copy .env.example .env # Windows
npm run seed
npm run dev
```

### 3. Lancer le frontend

Dans un deuxième terminal :

```bash
cd frontend
npm install
npm run dev
```

### 4. Ouvrir l'application

```
http://localhost:5173
```

**Compte démo :** `sara@demo.com` / `123456`

> Pour la configuration complète (MongoDB Atlas, email, HuggingFace), voir [SETUP.md](./SETUP.md)

---

## 🛠️ Stack technique

| Couche       | Technologies                                      |
|--------------|---------------------------------------------------|
| Frontend     | React, Vite, React Router, Framer Motion, Chart.js |
| Backend      | Node.js, Express.js, Socket.IO, JWT, Multer       |
| Base de données | MongoDB Atlas, Mongoose                        |
| IA           | HuggingFace API + fallback local par mots-clés    |
| Email        | Nodemailer (Gmail SMTP)                           |

---

## ✅ Fonctionnalités

### 🔐 Authentification
- Inscription, connexion, JWT
- Vérification email, mot de passe oublié
- Réinitialisation sécurisée du mot de passe

### 👤 Profil utilisateur
- Photo de profil, aura émotionnelle dynamique
- Compte public ou privé
- Follow / Unfollow / Demandes de follow

### 📝 Posts émotionnels
- Détection automatique de l'émotion par IA
- Mode anonyme
- Visibilité : public / followers / private
- Likes, commentaires, recommandations personnalisées

### 🤖 Intelligence artificielle
- Analyse émotionnelle avec HuggingFace
- Fallback local si aucune clé fournie
- Détection de crise émotionnelle
- Disclaimer bien-être intégré

### 📊 Dashboard
- Statistiques émotionnelles personnelles
- Émotions dominantes et graphiques
- Météo émotionnelle collective

### 📔 Mood Journal privé
- Entrées privées avec analyse IA
- Timeline émotionnelle personnelle

### 💬 AI Therapist Chatbot
- Chatbot bien-être émotionnel
- Réponses empathiques
- Historique des conversations

### 🏠 Emotional Rooms
- Salons par émotion : Stress / Happy / Calm / Motivation / Sad
- Messages temps réel avec Socket.IO

### 🔔 Notifications
- Follow, Like, Commentaire, Acceptation de demande

### 🚨 Reports & Modération
- Signaler un post ou commentaire
- Dashboard admin pour modérer le contenu

### 🏆 Gamification
- Badges émotionnels
- Streak de journal
- Points bien-être

### 🛡️ Admin Dashboard
- Statistiques globales
- Gestion des utilisateurs
- Posts signalés
- Émotions dominantes par jour



### 🔍 Recherche avancée
- Par utilisateur, post, émotion, tags, date

---

## 📁 Structure du projet

```
MoodSphere/
│
├── backend/
│   ├── controllers/      # Logique métier
│   ├── models/           # Schémas Mongoose
│   ├── routes/           # Routes Express
│   ├── services/         # Services IA, email
│   ├── middlewares/      # Auth, upload
│   ├── utils/            # Utilitaires
│   ├── uploads/          # Photos de profil
│   ├── .env.example      # Variables d'environnement (modèle)
│   ├── package.json
│   └── server.js         # Point d'entrée
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/   # Composants React
│   │   ├── pages/        # Pages de l'application
│   │   ├── context/      # Contexte global
│   │   └── utils/        # Utilitaires frontend
│   ├── package.json
│   └── vite.config.js
│
├── SETUP.md              # Guide de setup complet
└── README.md             # Ce fichier
```

---

## ⚙️ Variables d'environnement

Copier `backend/.env.example` en `backend/.env` et remplir :

```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb+srv://...
JWT_SECRET=...
JWT_EXPIRES_IN=7d
HUGGINGFACE_API_KEY=       # Optionnel
EMAIL_HOST=                # Optionnel (mode console si vide)
CLIENT_URL=http://localhost:5173
```

---

## 🔒 Sécurité

- Mots de passe hashés avec bcrypt
- Authentification par JWT
- Variables sensibles dans `.env` (jamais sur GitHub)
- Comptes privés avec système de demandes de follow
- Modération et signalement de contenu
- Détection de crise émotionnelle sans diagnostic médical
- Pas de stockage d'adresse précise

---

## 📦 Scripts disponibles

```bash
# Backend
npm run dev      # Lancer en développement (nodemon)
npm run seed     # Seeder la base de données avec des données démo
npm start        # Lancer en production

# Frontend
npm run dev      # Lancer Vite en développement
npm run build    # Build de production
npm run preview  # Prévisualiser le build
```

---

## 👤 Compte de démonstration

| Champ        | Valeur        |
|--------------|---------------|
| Email        | sara@demo.com |
| Mot de passe | 123456        |

---

## 📖 Documentation complète

Pour le guide détaillé d'installation, configuration et résolution de problèmes :

👉 [Voir SETUP.md](./SETUP.md)

---

## 📝 Licence

Ce projet est développé dans le cadre d'un projet académique.

---

*MoodSphere v2 — Ressentir, partager, évoluer* 🎭
