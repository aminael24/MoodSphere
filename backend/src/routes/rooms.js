import express from "express";
import { listRooms, getRoomMessages, postRoomMessage } from "../controllers/roomsController.js";
import { protect } from "../middlewares/auth.js";

const router = express.Router();
router.get("/", protect, listRooms);
router.get("/:slug/messages", protect, getRoomMessages);
router.post("/:slug/messages", protect, postRoomMessage);
export default router;
