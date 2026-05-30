# 🎭 MoodSphere v2 — Guide complet de setup

MoodSphere est une application web MERN basée sur les émotions humaines.  
Elle permet aux utilisateurs de publier leurs sentiments, de recevoir une analyse émotionnelle automatique par IA, d'avoir une aura dynamique, des recommandations personnalisées, un journal privé, un chatbot bien-être, des salons émotionnels, des notifications, un dashboard admin et plusieurs fonctionnalités avancées.

---

## 1. Technologies utilisées

### Frontend
- React
- Vite
- React Router
- Framer Motion
- Chart.js
- CSS moderne avec animations et glassmorphism

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT
- Bcrypt
- Nodemailer
- Multer
- Socket.IO
- HuggingFace API avec fallback local

### Base de données
- MongoDB Atlas

---

## 2. Prérequis

### Node.js
Télécharger depuis : https://nodejs.org

````bash
node -v
npm -v
````

Version recommandée : **Node.js 18 ou supérieure**.

### MongoDB Atlas

Créer un compte sur : https://www.mongodb.com/cloud/atlas

Puis :

1. Créer un cluster gratuit
2. **Database Access** → créer un utilisateur MongoDB
3. **Network Access** → ajouter `0.0.0.0/0`

---

## 3. Structure du projet

````
MoodSphere/
│
├── backend/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── middlewares/
│   ├── utils/
│   ├── uploads/
│   ├── .env.example
│   ├── package.json
│   └── server.js
│
├── frontend/
│   ├── public/
│   ├── src/
│   ├── package.json
│   └── vite.config.js
│
├── SETUP.md
└── README.md
````

---

## 4. Installation du backend

````bash
cd backend
npm install
````

Créer le fichier `.env` :

**Windows :**

````bash
copy .env.example .env
````

**Mac/Linux :**

````bash
cp .env.example .env
````

Puis ouvrir `.env` et modifier les variables.

---

## 5. Fichier `.env.example`

Contenu du fichier `backend/.env.example` :

````env
# ===========================================
# MoodSphere v2 - Backend Configuration
# ===========================================
# Copiez ce fichier en ".env"

PORT=5000
NODE_ENV=development

# --- MongoDB ---
MONGO_URI=mongodb+srv://user:password@cluster.mongodb.net/moodsphere

# --- JWT ---
JWT_SECRET=changez_moi_par_une_chaine_secrete_tres_longue
JWT_EXPIRES_IN=7d

# --- IA ---
# Clé gratuite HuggingFace : https://huggingface.co/settings/tokens
# Laisser vide pour utiliser le fallback local par mots-clés
HUGGINGFACE_API_KEY=

# --- Email avec Nodemailer ---
# Laisser EMAIL_HOST vide pour désactiver l'envoi réel.
# Les liens de vérification/reset s'afficheront dans la console backend.
EMAIL_HOST=
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=
EMAIL_PASS=
EMAIL_FROM=MoodSphere <no-reply@moodsphere.app>

# --- Frontend ---
CLIENT_URL=http://localhost:5173
````

---

## 6. Exemple de `.env` réel (mode développement)

````env
PORT=5000
NODE_ENV=development

MONGO_URI=mongodb+srv://username:motdepasse@cluster0.wtmqx.mongodb.net/moodsphere?appName=Cluster0

JWT_SECRET=moodsphere_secret_2026_tres_long_et_securise
JWT_EXPIRES_IN=7d

HUGGINGFACE_API_KEY=

EMAIL_HOST=
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=
EMAIL_PASS=
EMAIL_FROM=MoodSphere <no-reply@moodsphere.app>

CLIENT_URL=http://localhost:5173
````

> En mode développement sans email configuré, les liens de vérification et reset password s'affichent dans le **terminal backend**.

---

## 7. Configuration email avec Gmail

````env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=465
EMAIL_SECURE=true
EMAIL_USER=tonemail@gmail.com
EMAIL_PASS=mot_de_passe_application_google
EMAIL_FROM=MoodSphere <tonemail@gmail.com>
````

> ⚠️ `EMAIL_PASS` n'est **pas** ton mot de passe Gmail normal.

Étapes pour créer un mot de passe d'application :

1. Activer la validation en deux étapes sur ton compte Google
2. Aller sur : https://myaccount.google.com/apppasswords
3. Créer un mot de passe d'application
4. Copier le mot de passe de 16 caractères
5. Le coller dans `EMAIL_PASS=`

Redémarrer le backend après modification du `.env`.

---

## 8. Configuration MongoDB Atlas

1. **Database Access** → vérifier username et password
2. **Network Access** → ajouter `0.0.0.0/0`
3. Récupérer l'URL depuis : **Database → Connect → Drivers → Node.js**

````env
MONGO_URI=mongodb+srv://aminaelh555:MoodSphere2025@cluster0.wtmqx.mongodb.net/moodsphere?appName=Cluster0
````

> ⚠️ Si le mot de passe contient des caractères spéciaux, les encoder :
> `@` → `%40` | `#` → `%23` | `%` → `%25`
>
> Pour éviter les problèmes, utiliser un mot de passe avec seulement des lettres et chiffres.

---

## 9. Configuration HuggingFace IA

Le projet fonctionne **sans clé HuggingFace** grâce au fallback local par mots-clés.

Pour utiliser une vraie API IA :

1. Aller sur : https://huggingface.co/settings/tokens
2. Créer un token gratuit
3. L'ajouter dans `.env` :

````env
HUGGINGFACE_API_KEY=hf_xxxxxxxxxxxxxxxxxxxxx
````

---

## 10. Seeder la base de données

````bash
npm run seed
````

Résultat attendu :

````
✅ Connecté à MongoDB
🧹 Anciennes données supprimées
👥 Utilisateurs créés
📝 Posts créés
✨ Données de démo prêtes
````

**Compte de démonstration :**

| Champ         | Valeur          |
| ------------- | --------------- |
| Email         | sara@demo.com   |
| Mot de passe  | 123456          |

---

## 11. Lancer le backend

````bash
npm run dev
````

Le backend démarre sur : **http://localhost:5000**

Laisser ce terminal ouvert.

---

## 12. Installation du frontend

Dans un **deuxième terminal** :

````bash
cd frontend
npm install
npm run dev
````

Le frontend démarre sur : **http://localhost:5173**

---

## 13. Lancer l'application complète

**Terminal 1 — Backend :**

````bash
cd backend
npm run dev
````

**Terminal 2 — Frontend :**

````bash
cd frontend
npm run dev
````

Ouvrir le navigateur : **http://localhost:5173**

---

## 14. Fonctionnalités principales

### 🔐 Authentification
- Inscription / Connexion / JWT
- Vérification email
- Mot de passe oublié / Réinitialisation
- Redirection vers le compte après vérification

### 👤 Profil utilisateur
- Upload photo de profil
- Aura émotionnelle dynamique
- Compte public ou privé
- Follow / Unfollow / Demandes de follow

### 📝 Posts émotionnels
- Détection automatique de l'émotion
- Mode anonyme
- Visibilité : public / followers / private
- Likes / Commentaires / Recommandations

### 🤖 Intelligence artificielle
- Analyse émotionnelle avec HuggingFace
- Fallback local si aucune clé fournie
- Détection de crise émotionnelle
- Disclaimer bien-être

### 📊 Dashboard
- Statistiques émotionnelles
- Émotions dominantes / Graphiques
- Météo émotionnelle collective

### 📔 Mood Journal privé
- Entrées privées avec analyse IA
- Timeline émotionnelle personnelle

### 💬 AI Therapist Chatbot
- Réponses empathiques
- Historique des conversations

### 🏠 Emotional Rooms
- Salons par émotion : Stress / Happy / Calm / Motivation / Sad
- Messages temps réel avec Socket.IO

### 🔔 Notifications
- Follow / Like / Commentaire / Acceptation de demande

### 🚨 Reports & Moderation
- Signaler un post ou commentaire
- Admin peut masquer ou supprimer du contenu

### 🏆 Gamification
- Badges émotionnels / Streak de journal / Points bien-être

### 🛡️ Admin Dashboard
- Statistiques globales / Gestion utilisateurs
- Posts signalés / Émotions dominantes par jour



### 🔍 Recherche avancée
- Par utilisateur / post / émotion / tags / date

---

## 15. Problèmes fréquents

### ❌ Erreur MongoDB : bad auth
````
MongoServerError: bad auth : authentication failed
````
→ Vérifier `MONGO_URI` dans `.env` et les accès dans **Database Access** / **Network Access**

### ❌ Erreur MongoDB : IP non autorisée
→ Aller dans **Network Access** → ajouter `0.0.0.0/0`

### ❌ Le backend ne démarre pas
````bash
cd backend
npm install
npm run dev
````

### ❌ Le frontend ne démarre pas
````bash
cd frontend
npm install
npm run dev
````

### ❌ Les emails ne sont pas envoyés
→ Vérifier la configuration Gmail et redémarrer le backend.

### ℹ️ Le lien de reset s'affiche dans la console
→ Normal si `EMAIL_HOST=` est vide. Mode développement email actif.

### ❌ Les images ne s'affichent pas
→ Vérifier que le dossier `backend/uploads/` existe. Sinon :
````bash
mkdir uploads
````

---

## 16. Commandes utiles

````bash
# Backend
cd backend
npm install
copy .env.example .env   # Windows
cp .env.example .env     # Mac/Linux
npm run seed
npm run dev

# Frontend
cd frontend
npm install
npm run dev
````

---

## 17. GitHub et sécurité

> ⚠️ Ne jamais envoyer le fichier `.env` sur GitHub.

Envoyer uniquement `.env.example`.

Le `.gitignore` doit contenir :

````
node_modules/
.env
uploads/
dist/
build/
.DS_Store
````

---

## 18. Exemple de `.gitignore`

````gitignore
# Dependencies
node_modules/
*/node_modules/

# Environment variables
.env
.env.local
.env.development.local
.env.production.local

# Build
dist/
build/

# Uploads
uploads/
backend/uploads/

# Logs
*.log
npm-debug.log*
yarn-debug.log*
pnpm-debug.log*

# OS
.DS_Store
Thumbs.db

# IDE
.vscode/
.idea/
````

---

## 19. Résumé rapide

**Backend :**

````bash
cd backend
npm install
copy .env.example .env
npm run seed
npm run dev
````

**Frontend (deuxième terminal) :**

````bash
cd frontend
npm install
npm run dev
````

Ouvrir : **http://localhost:5173**

**Compte démo :** `sara@demo.com` / `123456`

---

## 20. Notes importantes pour la soutenance

**Pourquoi MongoDB ?**
Les données sont flexibles et orientées documents. Posts, émotions, recommandations, commentaires, journaux, notifications et messages ont des structures variables. MongoDB est donc parfaitement adapté à cette application sociale intelligente.

**Pourquoi HuggingFace et pas un modèle maison ?**
Le projet utilise une API HuggingFace gratuite avec fallback local. Cela le rend réaliste, faisable et fonctionnel même sans clé externe.

**Sécurité :**
- Mots de passe hashés (bcrypt)
- Authentification JWT
- Variables sensibles dans `.env`
- Comptes privés et modération
- Détection de crise sans diagnostic médical
- Pas de stockage d'adresse précise pour la carte émotionnelle