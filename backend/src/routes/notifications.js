import express from "express";
import { listMine, markAllRead, markRead } from "../controllers/notificationController.js";
import { protect } from "../middlewares/auth.js";

const router = express.Router();

router.get("/", protect, listMine);
router.post("/read-all", protect, markAllRead);
router.post("/:id/read", protect, markRead);

export default router;