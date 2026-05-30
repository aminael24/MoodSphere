import express from "express";
import {
  updateMe, uploadProfileImage, getUser, follow, unfollow, acceptFollow, searchUsers,
} from "../controllers/userController.js";
import { protect } from "../middlewares/auth.js";
import { upload } from "../middlewares/upload.js";

const router = express.Router();

router.get("/", protect, searchUsers);
router.patch("/me", protect, updateMe);
router.post("/upload-profile-image", protect, upload.single("image"), uploadProfileImage);
router.get("/:id", protect, getUser);
router.post("/:id/follow", protect, follow);
router.post("/:id/unfollow", protect, unfollow);
router.post("/:id/accept-follow", protect, acceptFollow);

export default router;
