import express from "express";
import {
  adminOverview, adminListUsers, adminUpdateUser, adminDeleteUser,
  adminListReports, adminResolveReport, adminListPosts, adminTogglePost,
} from "../controllers/adminController.js";
import { protect } from "../middlewares/auth.js";
import { adminOnly } from "../middlewares/admin.js";

const router = express.Router();
router.use(protect, adminOnly);
router.get("/overview", adminOverview);
router.get("/users", adminListUsers);
router.patch("/users/:id", adminUpdateUser);
router.delete("/users/:id", adminDeleteUser);
router.get("/reports", adminListReports);
router.post("/reports/:id/resolve", adminResolveReport);
router.get("/posts", adminListPosts);
router.patch("/posts/:id", adminTogglePost);
export default router;
