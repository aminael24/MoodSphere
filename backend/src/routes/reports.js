import express from "express";
import { createReport } from "../controllers/reportsController.js";
import { protect } from "../middlewares/auth.js";

const router = express.Router();
router.post("/", protect, createReport);
export default router;
