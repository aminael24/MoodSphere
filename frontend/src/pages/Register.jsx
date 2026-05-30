import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext.jsx";

const logoSrc = "/logo.png";
const loginImage = "/login.png";

export default function Register() {
  const [form, setForm] = useState({
    fullName: "",
    username: "",
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [busy, setBusy] = useState(false);

  const { register } = useAuth();
  const nav = useNavigate();

  const submit = async () => {
    setError("");
    setInfo("");

    if (!form.fullName.trim()) {
      setError("Le nom complet est requis");
      return;
    }

    if (!/^[a-z0-9_]{3,20}$/i.test(form.username)) {
      setError("Username invalide : 3-20 caractères, lettres/chiffres/underscore");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setError("Email invalide. Format attendu : nom@domaine.com");
      return;
    }

    if (form.password.length < 6) {
      setError("Mot de passe trop court : minimum 6 caractères");
      return;
    }

    setBusy(true);

    try {
      const r = await register(form);

      if (r._devVerifyUrl) {
        setInfo(`Email simulé. Lien : ${r._devVerifyUrl}`);
        setTimeout(() => nav("/feed"), 2500);
      } else {
        nav("/feed");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de la création du compte");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth-page">
      <style>{styles}</style>
      <div className="auth-bg" />

      <Link to="/" className="floating-back-home">
        ← Retour à l’accueil
      </Link>

      <motion.div
        className="auth-card"
        initial={{ opacity: 0, y: 35, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
      >
        <div className="auth-left">
          <Link to="/" className="auth-brand">
            <img src={logoSrc} alt="MoodSphere" />
            <span>MoodSphere</span>
          </Link>

          <div className="orb-wrapper">
            <img
              src={loginImage}
              alt="Illustration émotions"
              className="register-illustration"
            />
          </div>

          <div>
            <h2>
              Découvre ton <em>univers émotionnel</em>
            </h2>
            <p>
              Crée ton compte et commence à suivre ton humeur, ton journal privé
              et tes recommandations personnalisées.
            </p>
          </div>
        </div>

        <div className="auth-right">
          <div className="auth-header">
            <span className="auth-tag">Inscription</span>
            <h1>
              Rejoins <em>nous</em>
            </h1>
            <p>Crée ton compte gratuit et sécurisé.</p>
          </div>

          <div className="form-group">
            <input
              className="auth-input"
              placeholder="Nom complet"
              value={form.fullName}
              onChange={(e) => setForm({ ...form, fullName: e.target.value })}
            />

            <input
              className="auth-input"
              placeholder="Nom d'utilisateur"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
            />

            <input
              className="auth-input"
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />

            <input
              className="auth-input"
              type="password"
              placeholder="Mot de passe"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              onKeyDown={(e) => e.key === "Enter" && submit()}
            />
          </div>

          {error && <p className="auth-error">{error}</p>}
          {info && <p className="auth-info">{info}</p>}

          <button className="auth-btn" disabled={busy} onClick={submit}>
            {busy ? "Création..." : "Créer mon compte →"}
          </button>

          <p className="auth-footer">
            Déjà inscrit ? <Link to="/login">Se connecter</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}

const styles = `
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400;1,600&family=DM+Sans:wght@300;400;500;600;700&display=swap');

.auth-page {
  --burgundy: #4A0E1A;
  --wine: #7B1E32;
  --rose: #C8506A;
  --cream: #FDF6EE;
  --caramel: #C8633A;
  --caramel-light: #E8936A;
  --sand: #EEE4DA;

  min-height: 100vh;
  padding: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #0D0608;
  color: var(--cream);
  font-family: 'DM Sans', sans-serif;
  position: relative;
  overflow: hidden;
}

.auth-page * {
  box-sizing: border-box;
}

.auth-bg {
  position: fixed;
  inset: 0;
  background:
    radial-gradient(ellipse 80% 60% at 20% 10%, rgba(123,30,50,0.38), transparent 60%),
    radial-gradient(ellipse 60% 50% at 85% 85%, rgba(200,99,58,0.18), transparent 55%),
    radial-gradient(ellipse 50% 40% at 55% 25%, rgba(232,147,106,0.12), transparent 55%),
    #0D0608;
  z-index: 0;
}

.floating-back-home {
  position: fixed;
  top: 28px;
  left: 34px;
  z-index: 10;
  color: rgba(253,246,238,0.72);
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.12);
  padding: 11px 20px;
  border-radius: 999px;
  font-size: 0.9rem;
  font-weight: 700;
  text-decoration: none;
  backdrop-filter: blur(16px);
  transition: 0.25s ease;
}

.floating-back-home:hover {
  color: var(--caramel-light);
  border-color: rgba(232,147,106,0.4);
  background: rgba(200,99,58,0.1);
  transform: translateX(-4px);
}

.auth-card {
  position: relative;
  z-index: 1;
  width: min(1080px, 100%);
  min-height: 650px;
  display: grid;
  grid-template-columns: 1.15fr 1fr;
  border-radius: 34px;
  overflow: hidden;
  background: rgba(255,255,255,0.055);
  border: 1px solid rgba(255,255,255,0.12);
  box-shadow:
    0 35px 100px rgba(0,0,0,0.55),
    0 0 90px rgba(200,99,58,0.08);
  backdrop-filter: blur(22px);
}

.auth-left {
  padding: 42px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  background:
    radial-gradient(circle at center, rgba(232,147,106,0.18), transparent 42%),
    linear-gradient(160deg, rgba(74,14,26,0.58), rgba(200,99,58,0.08));
  border-right: 1px solid rgba(255,255,255,0.08);
}

.auth-brand {
  display: inline-flex;
  align-items: center;
  gap: 13px;
  color: var(--cream);
  text-decoration: none;
}

.auth-brand img {
  width: 54px;
  height: 54px;
  border-radius: 50%;
  object-fit: cover;
  box-shadow:
    0 0 20px rgba(200,99,58,0.55),
    0 0 45px rgba(200,99,58,0.25);
}

.auth-brand span {
  font-family: 'Playfair Display', serif;
  font-size: 1.45rem;
  font-weight: 700;
  background: linear-gradient(135deg, var(--cream), var(--caramel-light));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.orb-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1;
}

.register-illustration {
  width: 520px;
  max-width: 125%;
  height: auto;
  object-fit: contain;
  filter: drop-shadow(0 0 45px rgba(232,147,106,0.45));
  animation: float 5s ease-in-out infinite;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0);
  }

  50% {
    transform: translateY(-12px);
  }
}

.auth-left h2 {
  font-family: 'Playfair Display', serif;
  font-size: 2rem;
  font-weight: 400;
  line-height: 1.2;
  margin: 0 0 14px;
}

.auth-left h2 em {
  color: var(--caramel-light);
}

.auth-left p {
  color: rgba(253,246,238,0.62);
  line-height: 1.7;
  font-size: 0.96rem;
  margin: 0;
}

.auth-right {
  padding: 54px 48px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.auth-tag {
  display: inline-block;
  color: var(--caramel-light);
  text-transform: uppercase;
  letter-spacing: 0.18em;
  font-size: 0.74rem;
  font-weight: 800;
  margin-bottom: 14px;
}

.auth-header h1 {
  font-family: 'Playfair Display', serif;
  font-size: 2.7rem;
  font-weight: 400;
  margin: 0;
}

.auth-header h1 em {
  color: var(--caramel-light);
}

.auth-header p {
  color: rgba(253,246,238,0.56);
  margin: 10px 0 28px;
}

.form-group {
  display: grid;
  gap: 15px;
}

.auth-input {
  width: 100%;
  height: 52px;
  border: 1px solid rgba(255,255,255,0.12);
  border-radius: 16px;
  padding: 0 18px;
  outline: none;
  background: rgba(255,255,255,0.065);
  color: var(--cream);
  font-family: 'DM Sans', sans-serif;
  font-size: 0.95rem;
  transition: 0.25s ease;
}

.auth-input::placeholder {
  color: rgba(253,246,238,0.38);
}

.auth-input:focus {
  border-color: rgba(232,147,106,0.7);
  background: rgba(255,255,255,0.09);
  box-shadow: 0 0 0 4px rgba(232,147,106,0.1);
}

.auth-error {
  color: #ff8a80;
  font-size: 0.86rem;
  margin: 14px 0 0;
}

.auth-info {
  color: var(--caramel-light);
  font-size: 0.78rem;
  margin: 14px 0 0;
  word-break: break-all;
}

.auth-btn {
  width: 100%;
  height: 54px;
  margin-top: 26px;
  border: none;
  border-radius: 999px;
  background: linear-gradient(135deg, var(--caramel), var(--rose));
  color: var(--cream);
  font-family: 'DM Sans', sans-serif;
  font-size: 0.96rem;
  font-weight: 800;
  cursor: pointer;
  box-shadow: 0 10px 32px rgba(200,99,58,0.38);
  transition: 0.25s ease;
}

.auth-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 16px 42px rgba(200,99,58,0.52);
}

.auth-btn:disabled {
  opacity: 0.65;
  cursor: not-allowed;
  transform: none;
}

.auth-footer {
  margin: 24px 0 0;
  text-align: center;
  color: rgba(253,246,238,0.55);
  font-size: 0.9rem;
}

.auth-footer a {
  color: var(--caramel-light);
  font-weight: 700;
  text-decoration: none;
}

.auth-footer a:hover {
  text-decoration: underline;
}

@media (max-width: 850px) {
  .auth-page {
    padding: 22px;
  }

  .floating-back-home {
    top: 18px;
    left: 18px;
    font-size: 0.82rem;
    padding: 9px 16px;
  }

  .auth-card {
    grid-template-columns: 1fr;
    min-height: auto;
  }

  .auth-left {
    display: none;
  }

  .auth-right {
    padding: 42px 26px;
  }

  .auth-header h1 {
    font-size: 2.25rem;
  }
}
`;