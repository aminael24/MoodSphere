import nodemailer from "nodemailer";

/**
 * Service d'envoi d'emails
 * Si EMAIL_HOST n'est pas défini, les liens s'affichent dans la console.
 */

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;

  if (!process.env.EMAIL_HOST) {
    return null;
  }

  transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT) || 465,
    secure: process.env.EMAIL_SECURE === "true",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  return transporter;
}

async function send(to, subject, html) {
  const t = getTransporter();

  if (!t) {
    console.log("\n📧 [EMAIL SIMULÉ]");
    console.log("   À :", to);
    console.log("   Sujet :", subject);
    console.log(
      "   Contenu :",
      html
        .replace(/<[^>]+>/g, " ")
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, 200)
    );
    console.log("");
    return;
  }

  await t.sendMail({
    from: process.env.EMAIL_FROM || `MoodSphere <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  });
}

export async function sendVerificationEmail(to, token) {
  const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
  const url = `${clientUrl}/verify-email?token=${token}`;

  await send(
    to,
    "Vérifie ton email — MoodSphere",
    `
    <div style="font-family: Arial, sans-serif; line-height: 1.6;">
      <h2>Bienvenue sur MoodSphere 🎭</h2>

      <p>Clique sur le bouton ci-dessous pour vérifier ton email :</p>

      <a href="${url}"
         style="display:inline-block;padding:12px 22px;background:#C8633A;color:white;text-decoration:none;border-radius:24px;font-weight:bold;">
        Vérifier mon email
      </a>

      <p style="margin-top:20px;color:#777;">
        Si le bouton ne fonctionne pas, copie ce lien :
      </p>

      <p>${url}</p>
    </div>
    `
  );

  return url;
}

export async function sendResetPasswordEmail(to, token) {
  const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
  const url = `${clientUrl}/reset-password?token=${token}`;

  await send(
    to,
    "Réinitialiser ton mot de passe — MoodSphere",
    `
    <div style="font-family: Arial, sans-serif; line-height: 1.6;">
      <h2>Réinitialisation du mot de passe</h2>

      <p>Tu as demandé la réinitialisation de ton mot de passe MoodSphere.</p>
      <p>Ce lien est valable pendant 1 heure.</p>

      <a href="${url}"
         style="display:inline-block;padding:12px 22px;background:#C8633A;color:white;text-decoration:none;border-radius:24px;font-weight:bold;">
        Réinitialiser mon mot de passe
      </a>

      <p style="margin-top:20px;color:#777;">
        Si tu n’as pas demandé cette action, ignore simplement cet email.
      </p>

      <p style="color:#777;">
        Si le bouton ne fonctionne pas, copie ce lien :
      </p>

      <p>${url}</p>
    </div>
    `
  );

  return url;
}