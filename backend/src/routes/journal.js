import express from "express";
import { createEntry, listEntries, getTimeline, deleteEntry } from "../controllers/journalController.js";
import { protect } from "../middlewares/auth.js";

const router = express.Router();
router.post("/", protect, createEntry);
router.get("/", protect, listEntries);
router.get("/timeline", protect, getTimeline);
router.delete("/:id", protect, deleteEntry);
export default router;
