import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const logoSrc = "/logo.png";

const features = [
  {
    image: "/assistant-ia (1).png",
    title: "IA Émotionnelle",
    desc: "Analyse les publications, le journal privé et les messages pour détecter l'émotion dominante.",
  },
  {
    image: "/intelligence-emotionnelle (1).png",
    title: "Aura Dynamique",
    desc: "Le profil change visuellement selon l'humeur de l'utilisateur grâce à une aura animée.",
  },
  {
    image: "/chatbot.png",
    title: "AI Therapist Bot",
    desc: "Un chatbot empathique qui répond selon l'état émotionnel détecté, sans prétendre remplacer un professionnel.",
  },
  {
    image: "/communaute-en-ligne.png",
    title: "Salons Émotionnels",
    desc: "Des rooms temps réel par émotion avec Socket.IO : Happy, Calm, Motivated, Sad et plus.",
  },
  {
    icon: "🏆",
    title: "Gamification",
    desc: "Badges, streak journal, wellness points et progression personnelle pour encourager l'engagement.",
  },
  {
    image: "/confidentialite.png",
    title: "Journal Privé IA",
    desc: "Un espace personnel pour suivre l'évolution de ses émotions dans le temps.",
  },
];

const steps = [
  {
    n: "01",
    tag: "Sécurité",
    title: "Créer son compte",
    desc: "L'utilisateur s'inscrit avec un email valide, un mot de passe sécurisé et une authentification basée sur JWT.",
  },
  {
    n: "02",
    tag: "Expression",
    title: "Exprimer son humeur",
    desc: "Il publie un message, écrit dans son journal privé ou démarre une conversation avec l'assistant IA.",
  },
  {
    n: "03",
    tag: "IA",
    title: "Analyse intelligente",
    desc: "L'IA détecte l'émotion dominante, adapte l'aura, déclenche les recommandations et enrichit le profil émotionnel.",
  },
  {
    n: "04",
    tag: "Communauté",
    title: "Créer du lien",
    desc: "L'utilisateur rejoint des salons émotionnels, suit d'autres profils et découvre la météo émotionnelle collective.",
  },
];

const techStack = [
  "MongoDB Atlas",
  "Express.js",
  "React",
  "Node.js",
  "Socket.IO",
  "HuggingFace API",
  "JWT / bcrypt",
  "Multer",
  "Nodemailer",
  "Framer Motion",
  "Geospatial 2dsphere",
  "Aggregations MongoDB",
  "Full-text Search",
  "MVC + Services",
];

const securityItems = [
  {
    icon: "🔐",
    title: "Authentification sécurisée",
    desc: "JWT, bcrypt, tokens temporaires et contrôle des accès utilisateur/admin.",
  },
  {
    icon: "🛡️",
    title: "Mode crise responsable",
    desc: "Détection prudente des signaux de détresse, disclaimer clair et orientation vers des ressources d'aide.",
  },
  {
    icon: "👮",
    title: "Modération admin",
    desc: "Signalements, masquage de contenu, gestion des utilisateurs et dashboard de surveillance.",
  },
];

const testimonials = [
  {
    text: "MoodSphere m’aide à comprendre mes émotions et à suivre mon humeur au fil du temps.",
    name: "Sara Idrissi",
    role: "Utilisatrice MoodSphere",
    initials: "SI",
  },
  {
    text: "L’aura dynamique rend l’expérience très différente d’un réseau social classique.",
    name: "Youssef Amrani",
    role: "Étudiant en informatique",
    initials: "YA",
  },
  {
    text: "Le journal privé IA est utile pour prendre du recul sur ses pensées.",
    name: "Nadia Bennani",
    role: "Test utilisateur",
    initials: "NB",
  },
  {
    text: "Les salons émotionnels donnent envie d’échanger avec des personnes qui ressentent la même chose.",
    name: "Amine Rahali",
    role: "Utilisateur bêta",
    initials: "AR",
  },
  {
    text: "Le chatbot répond avec bienveillance sans remplacer un professionnel.",
    name: "Hajar Alaoui",
    role: "Utilisatrice",
    initials: "HA",
  },
  {
    text: "Le mode sécurité montre que l’application est pensée de manière responsable.",
    name: "Karim Benali",
    role: "Développeur",
    initials: "KB",
  },
];

const col1 = testimonials.slice(0, 2);
const col2 = testimonials.slice(2, 4);
const col3 = testimonials.slice(4, 6);

function TestimonialsColumn({ items, duration = 14, reverse = false }) {
  return (
    <div className="testimonial-column">
      <div
        className={reverse ? "testimonial-track reverse" : "testimonial-track"}
        style={{ animationDuration: `${duration}s` }}
      >
        {[...items, ...items].map((item, index) => (
          <div className="testimonial-card" key={`${item.name}-${index}`}>
            <div className="quote">“</div>
            <p>{item.text}</p>
            <div className="testimonial-user">
              <div className="avatar">{item.initials}</div>
              <div>
                <strong>{item.name}</strong>
                <span>{item.role}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const footerLinks = [
  { label: "Accueil", href: "#home" },
  { label: "Fonctionnalités", href: "#features" },
  { label: "Comment ça marche", href: "#how-it-works" },
  { label: "Technologies", href: "#tech" },
  { label: "Avis clients", href: "#testimonials" },
];

export default function LandingV2() {
  const [activeSection, setActiveSection] = useState("home");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add("visible");
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );

    const elements = document.querySelectorAll(".reveal");
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const sectionIds = ["home", "features", "how-it-works", "tech", "testimonials"];

    const handleScroll = () => {
      let current = "";

      sectionIds.forEach((id) => {
        const section = document.getElementById(id);
        if (!section) return;

        const rect = section.getBoundingClientRect();

        if (rect.top <= 180 && rect.bottom >= 180) {
          current = id;
        }
      });

      setActiveSection(current);
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="moodsphere-page">
      <style>{styles}</style>
      <div className="bg-gradient" />

      <nav className="landing-nav">
        <Link to="/" className="nav-brand" aria-label="MoodSphere accueil">
          <img src={logoSrc} alt="MoodSphere" className="nav-logo" />
          <span className="nav-name">MoodSphere</span>
        </Link>

        <div className="nav-menu">
          <a className={activeSection === "home" ? "active" : ""} href="#home">Accueil</a>
          <a className={activeSection === "features" ? "active" : ""} href="#features">Fonctionnalités</a>
          <a className={activeSection === "how-it-works" ? "active" : ""} href="#how-it-works">Comment ça marche</a>
          <a className={activeSection === "tech" ? "active" : ""} href="#tech">Technologies</a>
          <a className={activeSection === "testimonials" ? "active" : ""} href="#testimonials">Avis clients</a>
        </div>

        <div className="nav-links">
          <Link to="/login" className="btn-ghost">Connexion</Link>
          <Link to="/register" className="btn-primary">S'inscrire</Link>
        </div>
      </nav>

      <section className="hero" id="home">
        <div className="hero-content">
          

          <h1 className="hero-title">
            <em>Sens-toi</em>
            <br />
            <span className="shimmer">vraiment compris.</span>
          </h1>

          <p className="hero-desc">
            MoodSphere est une plateforme sociale intelligente où l'IA comprend les émotions,
            adapte l'expérience utilisateur et crée des connexions plus humaines.
          </p>

          <div className="hero-cta">
            <Link to="/register" className="btn-hero primary">Commencer gratuitement →</Link>
            <a href="#features" className="btn-hero secondary">Découvrir</a>
          </div>
        </div>

        <div className="hero-visual">
          <div className="aura-container">
            <div className="aura-ring aura-ring-1" />
            <div className="aura-ring aura-ring-2" />
            <div className="aura-ring aura-ring-3" />
            <div className="aura-glow" />

            <div className="orbit-dot" style={{ animationDelay: "0s" }}>😊</div>
            <div className="orbit-dot" style={{ animationDelay: "-2s" }}>🥰</div>
            <div className="orbit-dot" style={{ animationDelay: "-4s" }}>😍</div>
            <div className="orbit-dot" style={{ animationDelay: "-6s" }}>😂</div>
            <div className="orbit-dot" style={{ animationDelay: "-8s" }}>🙂</div>
            <div className="orbit-dot" style={{ animationDelay: "-10s" }}>😡</div>


            <img src={logoSrc} alt="MoodSphere" className="logo-center" />
          </div>
        </div>
      </section>

      <div className="stats-row reveal">
        <div className="stat-item"><div className="stat-num">50+</div><div className="stat-label">Endpoints REST</div></div>
        <div className="stat-divider" />
        <div className="stat-item"><div className="stat-num">7</div><div className="stat-label">Collections MongoDB</div></div>
        <div className="stat-divider" />
        <div className="stat-item"><div className="stat-num">6</div><div className="stat-label">Émotions détectées</div></div>
        <div className="stat-divider" />
        <div className="stat-item"><div className="stat-num">∞</div><div className="stat-label">Temps réel</div></div>
      </div>

      <div className="divider" />

      <section className="section" id="features">
        <div className="section-header reveal">
          <span className="section-tag">Fonctionnalités</span>
          <h2 className="section-title">Une expérience <em>complète</em></h2>
          <p className="section-sub">
            MoodSphere combine réseau social, intelligence artificielle, bien-être, temps réel et visualisation émotionnelle.
          </p>
        </div>

        <div className="features-grid">
          {features.map((feature, index) => (
            <div key={feature.title} className="feature-card reveal" style={{ transitionDelay: `${index * 0.06}s` }}>
              <div className="feature-head">
                {feature.image ? (
                  <img src={feature.image} alt={feature.title} className="feature-img" />
                ) : (
                  <span className="feature-icon">{feature.icon}</span>
                )}
                <div className="feature-title">{feature.title}</div>
              </div>
              <div className="feature-desc">{feature.desc}</div>
            </div>
          ))}
        </div>
      </section>

      <div className="divider" />

      <section className="section how-section" id="how-it-works">
        <div className="section-header reveal">
          <span className="section-tag">Processus</span>
          <h2 className="section-title">Comment <em>ça marche</em></h2>
          <p className="section-sub">
            Un parcours simple : l'utilisateur s'exprime, l'IA comprend, puis l'expérience devient personnalisée.
          </p>
        </div>

        <div className="process-timeline">
          {steps.map((step, index) => (
            <div key={step.n} className="process-step reveal" style={{ transitionDelay: `${index * 0.08}s` }}>
              <div className="process-number">{step.n}</div>
              <div className="process-content">
                <span className="process-tag">{step.tag}</span>
                <h3>{step.title}</h3>
                <p>{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="divider" />

      <section className="tech-section reveal" id="tech">
        <div className="section-header compact">
          <span className="section-tag">Technologies & Sécurité</span>
          <h2 className="section-title">Architecture <em>MERN + IA</em></h2>
          <p className="section-sub">
            Une architecture moderne avec API REST, temps réel, authentification sécurisée, modération et base NoSQL.
          </p>
        </div>

        <div className="tech-layout">
          <div className="tech-card">
            <h3>Stack technique</h3>
            <div className="tech-badges">
              {techStack.map((tech) => <span key={tech} className="tech-badge">{tech}</span>)}
            </div>
          </div>

          <div className="security-grid">
            {securityItems.map((item, index) => (
              <div key={item.title} className="security-card" style={{ transitionDelay: `${index * 0.06}s` }}>
                <span>{item.icon}</span>
                <h4>{item.title}</h4>
                <p>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="divider" />

     <section className="section testimonials-section" id="testimonials">
  <div className="section-header reveal">
    <span className="section-tag">Avis utilisateurs</span>
    <h2 className="section-title">
      Ils ressentent la différence avec <em>MoodSphere</em>
    </h2>
    <p className="section-sub">
      Des retours utilisateurs pour montrer l’impact émotionnel, social et intelligent de l’application.
    </p>
  </div>

  <div className="animated-testimonials">
    <TestimonialsColumn items={col1} duration={16} />
    <TestimonialsColumn items={col2} duration={20} reverse />
    <TestimonialsColumn items={col3} duration={14} />
  </div>
</section>

      <section className="cta-section">
        <div className="cta-card reveal">
          <img src={logoSrc} alt="MoodSphere" className="cta-logo" />
          <h2 className="cta-title">Prêt à <em>te révéler</em> ?</h2>
          <p className="cta-sub">
            Rejoins une communauté qui ressent comme toi. C'est gratuit, sécurisé et pensé pour une expérience plus humaine.
          </p>
          <Link to="/register" className="btn-hero primary">Créer mon compte →</Link>
        </div>
      </section>

      <footer className="landing-footer">
        <div className="footer-grid">
          <div className="footer-brand">
            <Link to="/" className="nav-brand footer-logo-link">
              <img src={logoSrc} alt="MoodSphere" className="footer-logo" />
              <span className="nav-name">MoodSphere</span>
            </Link>
            <p>
              Réseau social émotionnel intelligent basé sur l'IA, le bien-être et les connexions humaines.
            </p>
          </div>

          <div className="footer-column">
            <h4>Navigation</h4>
            {footerLinks.map((link) => <a key={link.href} href={link.href}>{link.label}</a>)}
          </div>

          <div className="footer-column">
            <h4>Projet</h4>
            <span>Stack MERN</span>
            <span>NoSQL MongoDB</span>
            <span>IA émotionnelle</span>
            <span>Socket.IO temps réel</span>
          </div>

          <div className="footer-column">
            <h4>Sécurité</h4>
            <span>JWT & bcrypt</span>
            <span>Modération admin</span>
            <span>Mode crise responsable</span>
            <span>Projet étudiant</span>
          </div>
        </div>

        <div className="footer-bottom">
          <span>© 2026 MoodSphere. Tous droits réservés.</span>
          <span>Projet MERN · NoSQL · IA · Temps réel</span>
        </div>
      </footer>
    </div>
  );
}

const styles = `
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400;1,600&family=DM+Sans:wght@300;400;500;600;700&display=swap');

html { scroll-behavior: smooth; }

.moodsphere-page {
  --burgundy: #4A0E1A;
  --wine: #7B1E32;
  --rose: #C8506A;
  --cream: #FDF6EE;
  --caramel: #C8633A;
  --caramel-light: #E8936A;
  --sand: #EEE4DA;
  --glass-bg: rgba(255,255,255,0.07);
  --glass-border: rgba(255,255,255,0.12);
  min-height: 100vh;
  background: #0D0608;
  color: var(--cream);
  font-family: 'DM Sans', sans-serif;
  overflow-x: hidden;
}

.moodsphere-page * { box-sizing: border-box; }
.moodsphere-page a { text-decoration: none; }

.bg-gradient {
  position: fixed;
  inset: 0;
  background:
    radial-gradient(ellipse 80% 60% at 20% 10%, rgba(123,30,50,0.35) 0%, transparent 60%),
    radial-gradient(ellipse 60% 50% at 80% 80%, rgba(74,14,26,0.4) 0%, transparent 55%),
    radial-gradient(ellipse 50% 40% at 60% 30%, rgba(200,99,58,0.12) 0%, transparent 50%),
    #0D0608;
  z-index: 0;
  pointer-events: none;
}

.landing-nav {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 28px;
  padding: 10px 56px;
  background: rgba(13,6,8,0.78);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(255,255,255,0.08);
  animation: fadeDown 0.8s ease both;
}

@keyframes fadeDown {
  from { opacity: 0; transform: translateY(-20px); }
  to { opacity: 1; transform: translateY(0); }
}

.nav-brand { display: flex; align-items: center; gap: 12px; flex-shrink: 0; }

.nav-logo {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  object-fit: cover;
  box-shadow: 0 0 20px rgba(200,99,58,0.5), 0 0 40px rgba(200,99,58,0.2);
  animation: pulse-logo 3s ease-in-out infinite;
}

@keyframes pulse-logo {
  0%, 100% { box-shadow: 0 0 20px rgba(200,99,58,0.5), 0 0 40px rgba(200,99,58,0.2); }
  50% { box-shadow: 0 0 30px rgba(200,99,58,0.8), 0 0 60px rgba(200,99,58,0.35); }
}

.nav-name {
  font-family: 'Playfair Display', serif;
  font-size: 1.35rem;
  font-weight: 700;
  background: linear-gradient(135deg, var(--cream), var(--caramel-light));
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  color: transparent;
  letter-spacing: 0.02em;
}

.nav-menu { display: flex; align-items: center; justify-content: center; gap: 26px; flex: 1; }

.nav-menu a {
  color: rgba(253,246,238,0.68);
  font-size: 0.9rem;
  font-weight: 600;
  transition: color 0.2s ease;
}

.nav-menu a:hover { color: var(--caramel-light); }

.nav-links { display: flex; align-items: center; gap: 10px; flex-shrink: 0; }

.btn-ghost, .btn-primary, .btn-hero {
  font-family: 'DM Sans', sans-serif;
  cursor: pointer;
  transition: all 0.25s ease;
}

.btn-ghost {
  background: transparent;
  border: 1px solid rgba(255,255,255,0.2);
  color: rgba(253,246,238,0.82);
  padding: 9px 22px;
  border-radius: 50px;
  font-size: 0.88rem;
  font-weight: 600;
}

.btn-ghost:hover {
  border-color: rgba(200,99,58,0.6);
  color: var(--caramel-light);
  background: rgba(200,99,58,0.08);
}

.btn-primary {
  background: var(--sand);
  border: none;
  color: #4A0E1A;
  padding: 10px 24px;
  border-radius: 50px;
  font-size: 0.88rem;
  font-weight: 700;
  box-shadow: 0 4px 20px rgba(238,228,218,0.18);
}

.btn-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 30px rgba(238,228,218,0.32); }

.hero {
  position: relative;
  z-index: 1;
  min-height: 100vh;
  display: flex;
  align-items: center;
  padding: 130px 60px 80px;
  gap: 70px;
}

.hero-content { flex: 1; max-width: 620px; animation: fadeInLeft 1s ease 0.2s both; }

@keyframes fadeInLeft {
  from { opacity: 0; transform: translateX(-40px); }
  to { opacity: 1; transform: translateX(0); }
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: rgba(200,99,58,0.12);
  border: 1px solid rgba(200,99,58,0.3);
  color: var(--caramel-light);
  padding: 7px 16px;
  border-radius: 50px;
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  margin-bottom: 28px;
  text-transform: uppercase;
}


@keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }

.hero-title {
  font-family: 'Playfair Display', serif;
  font-size: clamp(3rem, 5vw, 4.8rem);
  line-height: 1.06;
  margin: 0 0 24px;
  font-weight: 400;
}

.hero-title em { font-style: italic; color: var(--cream); }

.shimmer {
  background: linear-gradient(120deg, var(--caramel-light) 0%, var(--rose) 30%, var(--cream) 50%, var(--rose) 70%, var(--caramel-light) 100%);
  background-size: 200% auto;
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  color: transparent;
  animation: shimmer 4s linear infinite;
}

@keyframes shimmer { from { background-position: 0% center; } to { background-position: 200% center; } }

.hero-desc {
  font-size: 1.08rem;
  line-height: 1.75;
  color: rgba(253,246,238,0.68);
  margin-bottom: 40px;
  max-width: 500px;
}

.hero-cta { display: flex; gap: 14px; flex-wrap: wrap; }

.btn-hero {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 14px 30px;
  border-radius: 50px;
  font-size: 0.95rem;
  font-weight: 700;
}

.btn-hero.primary {
  background: linear-gradient(135deg, var(--caramel) 0%, var(--rose) 100%);
  color: var(--cream);
  border: none;
  box-shadow: 0 6px 30px rgba(200,99,58,0.4);
}

.btn-hero.primary:hover { transform: translateY(-3px); box-shadow: 0 12px 40px rgba(200,99,58,0.55); }

.btn-hero.secondary {
  background: transparent;
  color: rgba(253,246,238,0.85);
  border: 1px solid rgba(255,255,255,0.18);
}

.btn-hero.secondary:hover { border-color: rgba(200,99,58,0.5); color: var(--caramel-light); background: rgba(200,99,58,0.07); }

.hero-visual {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  animation: fadeInRight 1s ease 0.4s both;
  position: relative;
}

@keyframes fadeInRight {
  from { opacity: 0; transform: translateX(40px); }
  to { opacity: 1; transform: translateX(0); }
}

.aura-container { position: relative; width: 430px; height: 430px; display: flex; align-items: center; justify-content: center; }

.aura-ring { position: absolute; border-radius: 50%; animation: orbit 8s linear infinite; border: 1.5px solid; }

.aura-ring-1 { width: 370px; height: 370px; border-color: rgba(200,99,58,0.2); animation-duration: 12s; }
.aura-ring-2 { width: 315px; height: 315px; border-color: rgba(123,30,50,0.35); animation-direction: reverse; animation-duration: 9s; }
.aura-ring-3 { width: 260px; height: 260px; border-color: rgba(200,99,58,0.15); animation-duration: 15s; border-style: dashed; }

@keyframes orbit { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

.aura-glow {
  position: absolute;
  width: 300px;
  height: 300px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(200,99,58,0.2) 0%, rgba(123,30,50,0.15) 40%, transparent 70%);
  animation: breathe 4s ease-in-out infinite;
}

@keyframes breathe { 0%, 100% { transform: scale(1); opacity: 0.8; } 50% { transform: scale(1.08); opacity: 1; } }

.logo-center {
  position: relative;
  width: 500px;
  height: 500px;
  border-radius: 50%;
  object-fit: cover;
  box-shadow: 0 0 0 2px rgba(200,99,58,0.3), 0 0 40px rgba(200,99,58,0.5), 0 0 80px rgba(200,99,58,0.25), 0 0 120px rgba(123,30,50,0.3);
  animation: float 6s ease-in-out infinite;
  z-index: 2;
}

@keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-12px); } }

.orbit-dot {
  position: absolute;
  width: 38px;
  height: 38px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
  background: rgba(255,255,255,0.08);
  border: 1px solid rgba(255,255,255,0.12);
  backdrop-filter: blur(10px);
  animation: orbit-dot 12s linear infinite;
  z-index: 3;
}

@keyframes orbit-dot {
  from { transform: rotate(0deg) translateX(180px) rotate(0deg); }
  to { transform: rotate(360deg) translateX(180px) rotate(-360deg); }
}

.stats-row {
  position: relative;
  z-index: 1;
  display: flex;
  justify-content: center;
  gap: 50px;
  padding: 0 60px 80px;
}

.stat-item { text-align: center; }

.stat-num {
  font-family: 'Playfair Display', serif;
  font-size: 2.2rem;
  font-weight: 700;
  background: linear-gradient(135deg, var(--caramel-light), var(--rose));
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  color: transparent;
}

.stat-label {
  font-size: 0.8rem;
  color: rgba(253,246,238,0.45);
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin-top: 4px;
}

.stat-divider { width: 1px; background: rgba(255,255,255,0.08); align-self: stretch; }

.section { position: relative; z-index: 1; padding: 90px 60px; }

.section-header { text-align: center; margin-bottom: 60px; }
.section-header.compact { margin-bottom: 35px; }

.section-tag {
  font-size: 0.75rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--caramel);
  font-weight: 700;
  margin-bottom: 14px;
  display: block;
}

.section-title {
  font-family: 'Playfair Display', serif;
  font-size: clamp(2rem, 3.5vw, 3rem);
  font-weight: 400;
  line-height: 1.2;
  color: var(--cream);
  margin: 0;
}

.section-title em, .cta-title em { font-style: italic; color: var(--caramel-light); }

.section-sub {
  color: rgba(253,246,238,0.55);
  font-size: 1rem;
  margin: 14px auto 0;
  max-width: 580px;
  line-height: 1.65;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(270px, 1fr));
  gap: 20px;
  max-width: 1120px;
  margin: 0 auto;
}

.feature-card, .testimonial-card, .tech-card {
  position: relative;
  overflow: hidden;
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: 20px;
  padding: 30px;
  transition: transform 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease, opacity 0.7s ease;
}

.feature-card::before, .tech-card::before, .testimonial-card::before {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse at top left, rgba(200,99,58,0.06), transparent 60%);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.feature-card:hover, .security-card:hover, .testimonial-card:hover {
  transform: translateY(-6px);
  border-color: rgba(200,99,58,0.3);
  box-shadow: 0 20px 60px rgba(0,0,0,0.4);
}

.feature-card:hover::before, .tech-card:hover::before, .testimonial-card:hover::before { opacity: 1; }

.feature-head { display: flex; align-items: center; gap: 14px; margin-bottom: 18px; }

.feature-img { width: 58px; height: 58px; object-fit: contain; flex-shrink: 0; }

.feature-icon { font-size: 2rem; margin-bottom: 0; }

.feature-title {
  font-family: 'Playfair Display', serif;
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--cream);
  margin: 0;
}

.feature-desc { font-size: 0.9rem; line-height: 1.65; color: rgba(253,246,238,0.57); }

.how-section { overflow: hidden; }

.process-timeline {
  position: relative;
  max-width: 980px;
  margin: 0 auto;
  display: grid;
  gap: 26px;
}

.process-timeline::before {
  content: '';
  position: absolute;
  left: 39px;
  top: 18px;
  bottom: 18px;
  width: 2px;
  background: linear-gradient(to bottom, rgba(200,99,58,0.15), rgba(232,147,106,0.75), rgba(200,99,58,0.15));
}

.process-step {
  position: relative;
  display: grid;
  grid-template-columns: 80px 1fr;
  gap: 24px;
  align-items: stretch;
}

.process-number {
  position: relative;
  z-index: 2;
  width: 78px;
  height: 78px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  font-family: 'Playfair Display', serif;
  font-size: 1.45rem;
  font-weight: 700;
  color: #4A0E1A;
  background: var(--sand);
  box-shadow: 0 0 0 8px rgba(238,228,218,0.06), 0 0 30px rgba(238,228,218,0.18);
  animation: softPulse 3s ease-in-out infinite;
}

.process-content {
  position: relative;
  overflow: hidden;
  padding: 26px 30px;
  border-radius: 22px;
  background: rgba(255,255,255,0.065);
  border: 1px solid rgba(255,255,255,0.12);
  transition: transform 0.3s ease, border-color 0.3s ease;
}

.process-content:hover { transform: translateX(8px); border-color: rgba(200,99,58,0.32); }

.process-tag {
  display: inline-flex;
  margin-bottom: 10px;
  padding: 5px 12px;
  border-radius: 999px;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  color: var(--caramel-light);
  background: rgba(200,99,58,0.12);
  border: 1px solid rgba(200,99,58,0.24);
  text-transform: uppercase;
}

.process-content h3 { margin: 0 0 8px; font-family: 'Playfair Display', serif; font-size: 1.35rem; }

.process-content p {
  margin: 0;
  max-width: 760px;
  color: rgba(253,246,238,0.58);
  line-height: 1.68;
  font-size: 0.95rem;
}

@keyframes softPulse {
  0%, 100% { transform: scale(1); box-shadow: 0 0 0 8px rgba(238,228,218,0.06), 0 0 30px rgba(238,228,218,0.18); }
  50% { transform: scale(1.04); box-shadow: 0 0 0 12px rgba(238,228,218,0.04), 0 0 42px rgba(238,228,218,0.28); }
}

.tech-section { position: relative; z-index: 1; padding: 80px 60px; }

.tech-layout {
  max-width: 1120px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1.2fr 0.8fr;
  gap: 24px;
  align-items: stretch;
}

.tech-card { border-radius: 24px; padding: 34px; }

.tech-card h3 { margin: 0 0 24px; font-family: 'Playfair Display', serif; font-size: 1.55rem; }

.tech-badges { display: flex; flex-wrap: wrap; gap: 12px; }

.tech-badge {
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.08);
  color: rgba(253,246,238,0.65);
  padding: 8px 18px;
  border-radius: 50px;
  font-size: 0.82rem;
  font-weight: 600;
  transition: all 0.2s ease;
}

.tech-badge:hover {
  border-color: rgba(200,99,58,0.4);
  color: var(--caramel-light);
  background: rgba(200,99,58,0.07);
}

.security-grid { display: grid; gap: 14px; }

.security-card {
  background: linear-gradient(135deg, rgba(74,14,26,0.26), rgba(200,99,58,0.08));
  border: 1px solid rgba(200,99,58,0.18);
  border-radius: 20px;
  padding: 22px;
  transition: transform 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease;
}

.security-card span { font-size: 1.6rem; }

.security-card h4 { margin: 10px 0 8px; font-family: 'Playfair Display', serif; font-size: 1.05rem; }

.security-card p { margin: 0; color: rgba(253,246,238,0.55); line-height: 1.6; font-size: 0.86rem; }

.testimonials-grid {
  max-width: 1120px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 22px;
}

.testimonial-card { border-radius: 24px; }

.quote {
  font-family: Georgia, serif;
  font-size: 3.2rem;
  line-height: 0.8;
  color: var(--caramel-light);
  opacity: 0.5;
  margin-bottom: 12px;
}

.testimonial-card p {
  margin: 0 0 26px;
  color: rgba(253,246,238,0.68);
  line-height: 1.75;
  font-size: 0.95rem;
}

.testimonial-user { display: flex; align-items: center; gap: 12px; }

.avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  color: #4A0E1A;
  background: var(--sand);
  font-weight: 800;
  flex-shrink: 0;
}

.testimonial-user strong { display: block; color: var(--cream); font-size: 0.9rem; }

.testimonial-user span { display: block; color: rgba(253,246,238,0.44); font-size: 0.82rem; margin-top: 3px; }

.cta-section { position: relative; z-index: 1; padding: 100px 60px; text-align: center; }

.cta-card {
  max-width: 720px;
  margin: 0 auto;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 28px;
  padding: 70px 60px;
  position: relative;
  overflow: hidden;
}

.cta-card::before {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse at center top, rgba(200,99,58,0.12) 0%, transparent 60%);
  pointer-events: none;
}

.cta-logo {
  width: 70px;
  height: 70px;
  border-radius: 50%;
  object-fit: cover;
  margin-bottom: 30px;
  box-shadow: 0 0 30px rgba(200,99,58,0.5);
  animation: float 5s ease-in-out infinite;
}

.cta-title { font-family: 'Playfair Display', serif; font-size: 2.2rem; font-weight: 400; margin: 0 0 14px; }

.cta-sub { color: rgba(253,246,238,0.55); margin: 0 auto 36px; max-width: 500px; line-height: 1.65; }

.landing-footer {
  position: relative;
  z-index: 1;
  padding: 60px 60px 28px;
  border-top: 1px solid rgba(255,255,255,0.08);
  background: rgba(8,3,5,0.55);
}

.footer-grid {
  display: grid;
  grid-template-columns: 1.7fr 1fr 1fr 1fr;
  gap: 40px;
  max-width: 1120px;
  margin: 0 auto;
}

.footer-brand p {
  margin: 18px 0 0;
  max-width: 330px;
  color: rgba(253,246,238,0.52);
  font-size: 0.9rem;
  line-height: 1.65;
}
.testimonials-section {
  overflow: hidden;
}

.animated-testimonials {
  max-width: 1120px;
  height: 560px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 22px;
  overflow: hidden;
  mask-image: linear-gradient(to bottom, transparent, black 12%, black 88%, transparent);
  -webkit-mask-image: linear-gradient(to bottom, transparent, black 12%, black 88%, transparent);
}

.testimonial-column {
  overflow: hidden;
}

.testimonial-track {
  display: flex;
  flex-direction: column;
  gap: 22px;
  animation: scrollTestimonials linear infinite;
}

.testimonial-track.reverse {
  animation-name: scrollTestimonialsReverse;
}

@keyframes scrollTestimonials {
  from {
    transform: translateY(0);
  }
  to {
    transform: translateY(-50%);
  }
}

@keyframes scrollTestimonialsReverse {
  from {
    transform: translateY(-50%);
  }
  to {
    transform: translateY(0);
  }
}

.testimonial-card {
  min-height: 230px;
}

@media (max-width: 900px) {
  .animated-testimonials {
    grid-template-columns: 1fr;
    height: 620px;
  }

  .testimonial-column:nth-child(2),
  .testimonial-column:nth-child(3) {
    display: none;
  }
}
.footer-logo-link { align-items: center; }

.footer-logo {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  object-fit: cover;
  box-shadow: 0 0 20px rgba(200,99,58,0.35);
}

.footer-column { display: flex; flex-direction: column; gap: 10px; }

.footer-column h4 { margin: 0 0 8px; color: var(--cream); font-size: 0.95rem; }

.footer-column a, .footer-column span {
  color: rgba(253,246,238,0.48);
  font-size: 0.86rem;
  transition: color 0.2s ease;
}

.footer-column a:hover { color: var(--caramel-light); }

.footer-bottom {
  max-width: 1120px;
  margin: 42px auto 0;
  padding-top: 22px;
  border-top: 1px solid rgba(255,255,255,0.06);
  display: flex;
  justify-content: space-between;
  gap: 20px;
  color: rgba(253,246,238,0.32);
  font-size: 0.82rem;
}

.divider {
  position: relative;
  z-index: 1;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.07), transparent);
  margin: 0 60px;
}

.reveal {
  opacity: 0;
  transform: translateY(30px);
  transition: opacity 0.7s ease, transform 0.7s ease;
}

.reveal.visible {
  opacity: 1;
  transform: translateY(0);
}

@media (max-width: 1100px) {
  .nav-menu { display: none; }
  .hero { gap: 30px; }
  .logo-center { width: 260px; height: 260px; }
  .aura-container { width: 390px; height: 390px; }
  .tech-layout { grid-template-columns: 1fr; }
  .testimonials-grid { grid-template-columns: 1fr; }
}

@media (max-width: 900px) {
  .landing-nav { padding: 12px 22px; }
  .nav-name { font-size: 1.15rem; }
  .nav-logo { width: 44px; height: 44px; }
  .btn-ghost { display: none; }
  .btn-primary { padding: 9px 18px; }
  .hero { flex-direction: column; padding: 115px 24px 60px; text-align: center; }
  .hero-content { max-width: 100%; }
  .hero-desc { max-width: 100%; }
  .hero-cta { justify-content: center; }
  .hero-visual { display: none; }
  .stats-row { flex-wrap: wrap; gap: 28px; padding: 0 24px 60px; }
  .stat-divider { display: none; }
  .section { padding: 60px 24px; }
  .process-timeline::before { left: 29px; }
  .process-step { grid-template-columns: 60px 1fr; gap: 16px; }
  .process-number { width: 58px; height: 58px; font-size: 1rem; }
  .process-content { padding: 22px; }
  .cta-section { padding: 60px 24px; }
  .cta-card { padding: 48px 28px; }
  .tech-section { padding: 60px 24px; }
  .divider { margin: 0 24px; }
  .footer-grid { grid-template-columns: 1fr; gap: 28px; }
  .footer-bottom { flex-direction: column; }
  .landing-footer { padding: 44px 24px 24px; }
}
  .aura-container {
  position: relative;
  width: 560px;
  height: 560px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.aura-ring-1 {
  width: 540px;
  height: 540px;
  border-color: rgba(200,99,58,0.25);
  animation-duration: 12s;
}

.aura-ring-2 {
  width: 470px;
  height: 470px;
  border-color: rgba(123,30,50,0.4);
  animation-direction: reverse;
  animation-duration: 9s;
}

.aura-ring-3 {
  width: 400px;
  height: 400px;
  border-color: rgba(200,99,58,0.18);
  animation-duration: 15s;
  border-style: dashed;
}

.aura-glow {
  position: absolute;
  width: 430px;
  height: 430px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(200,99,58,0.2) 0%, rgba(123,30,50,0.15) 40%, transparent 70%);
  animation: breathe 4s ease-in-out infinite;
}

.logo-center {
  position: relative;
  width: 320px;
  height: 320px;
  border-radius: 50%;
  object-fit: cover;
  box-shadow: 0 0 0 2px rgba(200,99,58,0.3),
              0 0 40px rgba(200,99,58,0.5),
              0 0 80px rgba(200,99,58,0.25),
              0 0 120px rgba(123,30,50,0.3);
  animation: float 6s ease-in-out infinite;
  z-index: 2;
}

@keyframes orbit-dot {
  from {
    transform: rotate(0deg) translateX(260px) rotate(0deg);
  }
  to {
    transform: rotate(360deg) translateX(260px) rotate(-360deg);
  }
}


/* ===== Corrections ajoutées : nav active, emojis homogènes et CTA sans rectangle ===== */
.nav-menu a {
  position: relative;
  color: rgba(253,246,238,0.68);
  font-size: 0.9rem;
  font-weight: 600;
  transition: color 0.25s ease;
}

.nav-menu a::after {
  content: "";
  position: absolute;
  left: 0;
  bottom: -8px;
  width: 0;
  height: 2px;
  border-radius: 999px;
  background: linear-gradient(90deg, var(--caramel-light), var(--rose));
  transition: width 0.25s ease;
}

.nav-menu a:hover,
.nav-menu a.active {
  color: var(--caramel-light);
}

.nav-menu a:hover::after,
.nav-menu a.active::after {
  width: 100%;
}

.cta-section {
  position: relative;
  z-index: 1;
  padding: 90px 60px 110px;
  text-align: center;
}

.cta-card {
  max-width: 720px;
  margin: 0 auto;
  background: transparent;
  border: none;
  box-shadow: none;
  padding: 0;
  position: relative;
  overflow: visible;
}

.cta-card::before,
.cta-card::after {
  display: none;
}

.cta-logo {
  width: 82px;
  height: 82px;
  border-radius: 50%;
  object-fit: cover;
  margin-bottom: 28px;
  box-shadow: 0 0 35px rgba(232,147,106,0.45);
  animation: float 5s ease-in-out infinite;
}

.cta-title {
  font-family: 'Playfair Display', serif;
  font-size: clamp(2.6rem, 5vw, 4.2rem);
  font-weight: 400;
  margin: 0 0 18px;
  color: var(--cream);
}

.cta-title em {
  font-style: italic;
  background: linear-gradient(120deg, var(--caramel-light), var(--rose));
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  color: transparent;
}

.cta-sub {
  color: rgba(253,246,238,0.68);
  margin: 0 auto 34px;
  max-width: 560px;
  line-height: 1.75;
  font-size: 1.05rem;
}

.cta-card .btn-hero {
  position: relative;
  z-index: 2;
}

@media (max-width: 900px) {
  .cta-section { padding: 70px 24px 90px; }
  .cta-card { padding: 0; }
  .cta-title { font-size: 2.55rem; }
}
`;