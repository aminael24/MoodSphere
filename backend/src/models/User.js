import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true, maxlength: 50 },
    username: {
      type: String, required: true, unique: true, lowercase: true, trim: true,
      minlength: 3, maxlength: 20, match: /^[a-z0-9_]+$/,
    },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6 },

    // Roles
    role: { type: String, enum: ["user", "admin"], default: "user" },

    // Email verification
    isEmailVerified: { type: Boolean, default: false },
    verificationToken: String,
    resetPasswordToken: String,
    resetPasswordExpires: Date,

    // Profile
    bio: { type: String, default: "", maxlength: 200 },
    profileImage: { type: String, default: "" },
    accountType: { type: String, enum: ["public", "private"], default: "public" },

   

    // Emotional state
    dominantEmotion: { type: String, default: "calm" },
    auraColor: { type: String, default: "#D5BCAD" },
    moodHistory: [
      { emotion: String, aura: String, date: { type: Date, default: Date.now } },
    ],

    // Social
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    followRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

    // Gamification
    badges: [
      {
        code: String,        // ex: "first_post", "joy_master", "streak_7"
        label: String,       // libelle FR
        emoji: String,       // emoji du badge
        unlockedAt: { type: Date, default: Date.now },
      },
    ],
    streak: { type: Number, default: 0 },           // jours consecutifs avec entree journal
    lastJournalDate: Date,
    wellnessPoints: { type: Number, default: 0 },   // points cumules
  },
  { timestamps: true }
);


// Index pour la recherche avancee
userSchema.index({ username: "text", fullName: "text", bio: "text" });

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = function (entered) {
  return bcrypt.compare(entered, this.password);
};

userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.verificationToken;
  delete obj.resetPasswordToken;
  delete obj.resetPasswordExpires;
  return obj;
};

export default mongoose.model("User", userSchema);
