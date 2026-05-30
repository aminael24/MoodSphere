import express from "express";
import {
  emotionalWeather, myMoodTimeline, communityTrends, overview, topPositive,
} from "../controllers/statsController.js";
import { protect } from "../middlewares/auth.js";

const router = express.Router();

router.get("/emotional-weather", protect, emotionalWeather);
router.get("/my-mood-timeline", protect, myMoodTimeline);
router.get("/community-trends", protect, communityTrends);
router.get("/overview", protect, overview);
router.get("/top-positive", protect, topPositive);

export default router;
