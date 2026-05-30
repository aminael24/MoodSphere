import express from "express";
import { getHistory, sendMessage, clearHistory } from "../controllers/chatController.js";
import { protect } from "../middlewares/auth.js";

const router = express.Router();
router.get("/", protect, getHistory);
router.post("/", protect, sendMessage);
router.delete("/", protect, clearHistory);
export default router;
