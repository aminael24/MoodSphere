import "dotenv/config";
import mongoose from "mongoose";
import Notification from "../models/Notification.js";

await mongoose.connect(process.env.MONGO_URI);

const result = await Notification.updateMany(
  { type: "badge", link: "/profile" },
  { $set: { link: "/badges" } }
);

console.log(`✅ ${result.modifiedCount} notifications de badges corrigées`);
process.exit(0);