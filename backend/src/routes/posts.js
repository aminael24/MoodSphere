import express from "express";
import {
  createPost, getFeed, getPublicFeed, getMyPosts, getUserPosts,
  updatePost, deletePost, toggleLike, addComment,
} from "../controllers/postController.js";
import { protect } from "../middlewares/auth.js";

const router = express.Router();

router.post("/", protect, createPost);
router.get("/feed", protect, getFeed);
router.get("/public", protect, getPublicFeed);
router.get("/me", protect, getMyPosts);
router.get("/user/:id", protect, getUserPosts);
router.patch("/:id", protect, updatePost);
router.delete("/:id", protect, deletePost);
router.post("/:id/like", protect, toggleLike);
router.post("/:id/comments", protect, addComment);

export default router;
