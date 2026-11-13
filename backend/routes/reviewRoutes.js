import express from "express";
import {
  addReview,
  getEventReviews,
  toggleBookmark,
  getMyBookmarks,
} from "../controllers/reviewController.js";
import { protect, requireRole } from "../middleware/authMiddleware.js";

const router = express.Router();

// Reviews
router.get("/:id/reviews", getEventReviews);
router.post("/:id/reviews", protect, requireRole("Student"), addReview);

// Bookmarks (Student)
router.get("/my-bookmarks", protect, requireRole("Student", "Admin"), getMyBookmarks);
router.post("/:id/bookmark", protect, requireRole("Student"), toggleBookmark);

export default router;
