# 🎤 Guide de soutenance — MoodSphere v2.1

## 1. Pitch (1 min 30)

> "MoodSphere est un **réseau social émotionnel intelligent** où l'**IA** détecte automatiquement l'émotion de chaque publication et adapte l'expérience à l'humeur de l'utilisateur.
>
> Mais c'est aussi bien plus : un **journal privé** analysé par IA, un **chatbot bien-être** empathique, des **salons de discussion temps réel** par émotion (Socket.IO), une **carte émotionnelle** par ville, un **système de gamification** (badges, streak, points), un **mode sécurité** qui détecte les signaux de détresse et oriente vers des ressources professionnelles, et un **dashboard admin** complet avec modération.
>
> Stack : **MERN** + MongoDB Atlas + JWT/bcrypt + Multer + Nodemailer + Socket.IO + HuggingFace API (avec fallback local FR/EN). 7 collections MongoDB exploitant agrégations, geospatial 2dsphere, et indexes text."

---

## 2. Démo en direct (10 min)

### Acte 1 — L'utilisateur (5 min)
1. **Landing publique** → hero, features, how it works
2. **Inscription** comme nouveau user → arrivée sur le feed
3. **Publier un post** → "Je suis super heureux aujourd'hui !"
   - Montrer la **détection IA** (toast + aura sidebar change de couleur)
4. **Journal privé** → écrire une entrée privée, montrer la timeline qui apparaît
5. **AI Therapist Bot** → conversation : "salut" puis "je me sens stressé"
   - Montrer les **réponses empathiques adaptées à l'émotion**
6. **Emotional Rooms** → entrer dans "Happy", ouvrir un 2e onglet privé pour voir les messages **temps réel** entre les deux

### Acte 2 — Social & gamification (3 min)
7. **Notifications** → cliquer la cloche, montrer la liste
8. **Follow** → suivre un user, voir la notif arriver
9. **Profile** → montrer **badges débloqués**, **streak journal**, **points wellness**
10. **Carte émotionnelle** → cliquer "Casablanca", voir la carte mise à jour avec les bulles
11. **Explorer + recherche avancée** → filtrer par émotion "joy" + tag "motivation"

### Acte 3 — Admin & sécurité (2 min)
12. **Crisis Safety** : publier un post avec un signal de détresse (ex: "personne ne m'aime, j'en peux plus")
    - Montrer le **modal qui s'affiche** avec disclaimer + ressources
13. **Signaler** un post (mode user) → motif inapproprié
14. **Se reconnecter en admin** (admin@demo.com / admin123)
15. **Admin dashboard** : voir le signalement, masquer le post, voir la tendance 7 jours, gérer un user

---

## 3. Questions probables du jury

### Q : Quelle est l'innovation principale ?
> "MoodSphere n'est pas un énième Twitter clone. C'est :
> - Un **réseau émotionnel** où l'IA détecte l'émotion de chaque texte (post, journal, chatbot)
> - Un **chatbot empathique** qui adapte sa réponse à l'émotion détectée
> - Un **mode sécurité crise** qui protège l'utilisateur sans jamais prétendre faire du médical
> - Une **expérience visuelle unique** : aura dynamique 3D, salons par émotion, carte émotionnelle"

### Q : Comment fonctionne la détection d'émotion ?
> "Deux modes :
> 1. **HuggingFace API** (gratuite) avec le modèle `distilroberta` entraîné sur 28k textes émotionnels
> 2. **Fallback local** par mots-clés FR + EN si l'API est down ou pas de clé
> On classe sur 6 émotions : joy, sad, angry, stress, calm, motivated.
> Chaque détection inclut aussi un **flag crisis** via un dictionnaire de mots indicateurs de détresse."

### Q : Pourquoi MongoDB et pas MySQL ?
> "Cinq raisons concrètes utilisées dans le projet :
> 1. **Schémas flexibles** : `aiAnalysis.scores` est une Map de scores variables
> 2. **Sous-documents** : comments dans Post, moodHistory dans User — pas de jointure
> 3. **Indexes geospatial** (`2dsphere`) pour la carte émotionnelle par ville
> 4. **Indexes text** pour la recherche full-text sans Elasticsearch
> 5. **Agrégations** : `$group` pour la météo, `$dateToString` pour la tendance 7j, `$lookup` pour top users"

### Q : Comment Socket.IO fonctionne dans votre projet ?
> "On a un serveur Express + un serveur HTTP partagé avec Socket.IO.
> Le client se connecte avec son JWT (middleware `io.use` qui vérifie le token).
> Quand un user entre dans un salon, il fait `socket.emit('room:join', slug)`, le serveur le met dans une *room Socket.IO* `room:happy` (ou autre).
> Quand quelqu'un envoie un message, le serveur sauvegarde en BDD puis broadcast `io.to('room:happy').emit('room:message', msg)`.
> Tous les autres clients dans cette room reçoivent en temps réel. **Fallback REST** si le socket est down."

### Q : Comment vous gérez la sécurité du Crisis Mode ?
> "C'est délicat : on détecte des signaux MAIS on ne fait JAMAIS de médical.
> - Détection par mots-clés généraux (pas de méthodes listées)
> - Modal qui affiche un **disclaimer** : 'MoodSphere n'est pas un service médical'
> - Orientation vers `findahelpline.com` (annuaire international validé)
> - Numéros locaux génériques (Maroc SOS Détresse)
> - Suggestions d'actions apaisantes simples (respiration, contacter un proche)
> - JAMAIS de diagnostic, JAMAIS de prescription, JAMAIS de méthode"

### Q : Comment les badges sont attribués ?
> "Service `badgeService.js` appelé en arrière-plan après chaque action.
> Il vérifie les conditions (countDocuments + checks) et attribue les badges manquants.
> Catalogue de 10 badges : 'first_post', 'joy_master' (5 posts joie), 'streak_7' (7 jours journal), 'loved' (5 likes), etc.
> Chaque badge donne des **wellness points** et déclenche une **notification**."

### Q : Architecture côté code ?
> "Backend : MVC strict — controllers fins, **services** pour la logique métier (IA, chatbot, crisis, notif, badge), middlewares pour auth/upload/admin.
> Frontend : composants réutilisables (PostCard, AuraOrb, CrisisModal, NotificationBell), context global (Auth), utils (api axios, socket, emotions).
> Routing React Router avec guards Private/AdminOnly/PublicOnly.
> CSS variables pour la palette burgundy partout."

### Q : Que se passe-t-il si HuggingFace est down ?
> "Le fallback local prend le relais automatiquement. Il analyse 60+ mots-clés FR/EN par émotion et calcule des scores. C'est moins précis mais ça marche **toujours**."

---

## 4. Démo NoSQL en MongoDB Compass

Ouvrir Compass → cluster → DB `moodsphere`

1. **users** : montrer un doc avec `badges[]`, `moodHistory[]`, `location.coordinates`, `wellnessPoints`
2. **posts** : montrer `aiAnalysis.scores` (Map), `tags[]`, `comments[]` (sous-documents)
3. **moodjournals** : montrer qu'on a un index text → faire une recherche
4. Faire une agrégation en live :
   ```js
   db.posts.aggregate([
     { $group: { _id: "$aiAnalysis.dominantEmotion", count: { $sum: 1 } } },
     { $sort: { count: -1 } }
   ])
   ```
5. Geospatial :
   ```js
   db.users.find({ location: { $near: { $geometry: { type: "Point", coordinates: [-7.6, 33.6] }, $maxDistance: 100000 } } })
   ```

---

## 5. Plan B si bug en démo

- HuggingFace lent → expliquer le fallback local, ça marche
- MongoDB Atlas inaccessible → utiliser la base seed locale
- Socket.IO ne se connecte pas → montrer le fallback REST + expliquer
- Si tout plante → montrer le code et les schémas MongoDB

---

## 6. Points forts à mentionner

✅ **39 fichiers backend** structurés professionnellement (MVC + services)
✅ **20+ fichiers frontend** avec design moderne (palette burgundy/cream, glassmorphism, Framer Motion)
✅ **7 collections MongoDB** + indexes geospatial et text
✅ **API REST complète** (~50 endpoints)
✅ **Socket.IO temps réel** pour les salons
✅ **IA double mode** (API + fallback)
✅ **Sécurité** : JWT, bcrypt, crypto tokens, expiration 1h reset
✅ **UX exceptionnelle** : aura dynamique, animations, dark mode, responsive
✅ **Considération éthique** : Crisis Mode pensé pour ne pas nuire

**Bonne chance ! 🎭✨**
