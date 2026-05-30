import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../utils/api.js";

const logoSrc = "/logo.png";
const forgetImage = "/forget.png";

export function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  const [info, setInfo] = useState("");
  const [busy, setBusy] = useState(false);
  const [isError, setIsError] = useState(false);

  const submit = async () => {
    if (!email.trim()) {
      setMsg("Veuillez entrer votre email.");
      setIsError(true);
      return;
    }

    try {
      setBusy(true);
      setMsg("");
      setInfo("");
      setIsError(false);

      const response = await api.post("/auth/forgot-password", {
        email: email.trim(),
      });

      setMsg(response.data.message || "Lien envoyé si cet email existe.");
      setIsError(false);

      if (response.data._devResetUrl) {
        setInfo(`Mode dev — lien de reset : ${response.data._devResetUrl}`);
      }
    } catch (err) {
      setMsg(err.response?.data?.message || "Erreur lors de l'envoi du lien.");
      setIsError(true);
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthShell
      tag="Récupération"
      title={
        <>
          Mot de passe <em>oublié</em>
        </>
      }
      description="Entre ton email pour recevoir un lien de réinitialisation."
      leftTitle={
        <>
          Retrouve ton <em>accès</em>
        </>
      }
      leftText="Nous t’aidons à récupérer ton compte en toute sécurité, sans perdre ton journal, tes émotions et ton univers personnel."
    >
      <div className="form-group">
        <input
          className="auth-input"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !busy) submit();
          }}
        />
      </div>

      {msg && (
        <p className={isError ? "auth-error" : "auth-success"}>
          {msg}
        </p>
      )}

      {info && <p className="auth-dev-message">{info}</p>}

      <button className="auth-btn" disabled={busy} onClick={submit}>
        {busy ? "Envoi en cours..." : "Envoyer le lien →"}
      </button>

      <p className="auth-footer">
        Tu te souviens du mot de passe ? <Link to="/login">Se connecter</Link>
      </p>
    </AuthShell>
  );
}

export function ResetPassword() {
  const [params] = useSearchParams();
  const token = params.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const [isError, setIsError] = useState(false);

  const navigate = useNavigate();

  const submit = async () => {
    if (!token) {
      setMsg("Token manquant ou invalide.");
      setIsError(true);
      return;
    }

    if (password.length < 6) {
      setMsg("Le mot de passe doit contenir au moins 6 caractères.");
      setIsError(true);
      return;
    }

    if (password !== confirmPassword) {
      setMsg("Les mots de passe ne correspondent pas.");
      setIsError(true);
      return;
    }

    try {
      setBusy(true);
      setMsg("");
      setIsError(false);

      await api.post(`/auth/reset-password/${token}`, {
        password,
      });

      setMsg("Mot de passe modifié avec succès. Redirection...");
      setIsError(false);

      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (err) {
      setMsg(err.response?.data?.message || "Erreur lors de la réinitialisation.");
      setIsError(true);
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthShell
      tag="Sécurité"
      title={
        <>
          Nouveau <em>mot de passe</em>
        </>
      }
      description="Choisis un nouveau mot de passe sécurisé pour ton compte."
      leftTitle={
        <>
          Sécurise ta <em>sphère</em>
        </>
      }
      leftText="Protège ton espace personnel et retrouve ton accès MoodSphere avec un nouveau mot de passe."
    >
      <div className="form-group">
        <input
          className="auth-input"
          type="password"
          placeholder="Nouveau mot de passe"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <input
          className="auth-input"
          type="password"
          placeholder="Confirmer le mot de passe"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !busy) submit();
          }}
        />
      </div>

      {msg && (
        <p className={isError ? "auth-error" : "auth-success"}>
          {msg}
        </p>
      )}

      <button className="auth-btn" disabled={busy || !token} onClick={submit}>
        {busy ? "Réinitialisation..." : "Réinitialiser →"}
      </button>

      <p className="auth-footer">
        Retour à la connexion ? <Link to="/login">Se connecter</Link>
      </p>
    </AuthShell>
  );
}

export function VerifyEmail() {
  const [params] = useSearchParams();
  const token = params.get("token");

  const [msg, setMsg] = useState("Vérification en cours...");
  const [isError, setIsError] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!token) {
      setMsg("Token manquant.");
      setIsError(true);
      setDone(true);
      return;
    }

    api
      .get(`/auth/verify-email/${token}`)
      .then((response) => {
        setMsg(response.data.message || "Email vérifié avec succès.");
        setIsError(false);
      })
      .catch((err) => {
        setMsg(err.response?.data?.message || "Erreur lors de la vérification.");
        setIsError(true);
      })
      .finally(() => {
        setDone(true);
      });
  }, [token]);

  return (
    <AuthShell
      tag="Vérification"
      title={
        <>
          Vérification <em>email</em>
        </>
      }
      description="Nous vérifions ton adresse email pour sécuriser ton compte MoodSphere."
      leftTitle={
        <>
          Confirme ta <em>sphère</em>
        </>
      }
      leftText="La vérification permet de protéger ton compte et d’activer correctement ton espace personnel."
    >
      <div className={isError ? "verify-box error" : "verify-box success"}>
        {done ? (isError ? "⚠️" : "✓") : "⏳"}
      </div>

      <p className={isError ? "auth-error" : "auth-success"}>{msg}</p>

      <Link to="/login" className="auth-btn auth-btn-link">
        Se connecter →
      </Link>
    </AuthShell>
  );
}

function AuthShell({
  tag,
  title,
  description,
  leftTitle,
  leftText,
  children,
}) {
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
              src={forgetImage}
              alt="Mot de passe oublié"
              className="login-illustration forgot-illustration"
            />
          </div>

          <div>
            <h2>{leftTitle}</h2>
            <p>{leftText}</p>
          </div>
        </div>

        <div className="auth-right">
          <div className="auth-header">
            <span className="auth-tag">{tag}</span>
            <h1>{title}</h1>
            <p>{description}</p>
          </div>

          {children}
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

.login-illustration {
  width: 520px;
  max-width: 125%;
  height: auto;
  object-fit: contain;
  filter: drop-shadow(0 0 45px rgba(232,147,106,0.45));
  animation: float 5s ease-in-out infinite;
}

.forgot-illustration {
  width: 500px;
  max-width: 118%;
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
  line-height: 1.5;
}

.auth-success {
  color: #9ee7b0;
  font-size: 0.86rem;
  margin: 14px 0 0;
  line-height: 1.5;
}

.auth-dev-message {
  color: var(--caramel-light);
  font-size: 0.78rem;
  margin: 10px 0 0;
  line-height: 1.5;
  word-break: break-all;
  padding: 10px 12px;
  border-radius: 14px;
  background: rgba(232,147,106,0.08);
  border: 1px solid rgba(232,147,106,0.2);
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

.auth-btn-link {
  display: flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
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

.verify-box {
  width: 86px;
  height: 86px;
  border-radius: 28px;
  display: grid;
  place-items: center;
  margin: 10px auto 10px;
  font-size: 2.3rem;
  font-weight: 900;
}

.verify-box.success {
  color: #9ee7b0;
  background: rgba(100,220,140,0.08);
  border: 1px solid rgba(100,220,140,0.24);
}

.verify-box.error {
  color: #ff8a80;
  background: rgba(255,100,100,0.08);
  border: 1px solid rgba(255,100,100,0.24);
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