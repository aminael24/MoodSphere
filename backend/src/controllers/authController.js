import crypto from "crypto";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { sendVerificationEmail, sendResetPasswordEmail } from "../services/emailService.js";

function signToken(id) {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
}

/**
 * POST /api/auth/register
 */
export async function register(req, res) {
  try {
    const { fullName, username, email, password } = req.body;

    if (!fullName || !username || !email || !password) {
      return res.status(400).json({ message: "Tous les champs sont requis" });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: "Mot de passe trop court (min 6)" });
    }
    if (!/^[a-z0-9_]{3,20}$/i.test(username)) {
      return res.status(400).json({ message: "Username invalide (a-z, 0-9, _)" });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ message: "Format d'email invalide" });
    }

    const exists = await User.findOne({ $or: [{ email }, { username: username.toLowerCase() }] });
    if (exists) return res.status(400).json({ message: "Email ou username déjà utilisé" });

    const verificationToken = crypto.randomBytes(32).toString("hex");
    const user = await User.create({
      fullName,
      username: username.toLowerCase(),
      email,
      password,
      verificationToken,
    });

    const url = await sendVerificationEmail(email, verificationToken);

    res.status(201).json({
      token: signToken(user._id),
      user,
      _devVerifyUrl: !process.env.EMAIL_HOST ? url : undefined,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

/**
 * POST /api/auth/login
 */
export async function login(req, res) {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: "Identifiants invalides" });
    }
    res.json({ token: signToken(user._id), user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

/**
 * GET /api/auth/verify-email/:token
 */
export async function verifyEmail(req, res) {
  try {
    const user = await User.findOne({ verificationToken: req.params.token });
    if (!user) return res.status(400).json({ message: "Token invalide" });

    user.isEmailVerified = true;
    user.verificationToken = undefined;
    await user.save();
    res.json({ message: "Email vérifié ✓" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

/**
 * POST /api/auth/forgot-password
 */
export async function forgotPassword(req, res) {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    // Pour des raisons de securite, on renvoie toujours OK
    if (!user) return res.json({ message: "Si le compte existe, un email a été envoyé" });

    const token = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 60 * 60 * 1000; // 1h
    await user.save();

    const url = await sendResetPasswordEmail(email, token);
    res.json({
      message: "Email envoyé",
      _devResetUrl: !process.env.EMAIL_HOST ? url : undefined,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

/**
 * POST /api/auth/reset-password/:token
 */
export async function resetPassword(req, res) {
  try {
    const { password } = req.body;
    if (!password || password.length < 6) {
      return res.status(400).json({ message: "Mot de passe trop court" });
    }

    const user = await User.findOne({
      resetPasswordToken: req.params.token,
      resetPasswordExpires: { $gt: Date.now() },
    });
    if (!user) return res.status(400).json({ message: "Token invalide ou expiré" });

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();
    res.json({ message: "Mot de passe réinitialisé" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

/**
 * GET /api/auth/me
 */
export async function getMe(req, res) {
  res.json(req.user);
}
