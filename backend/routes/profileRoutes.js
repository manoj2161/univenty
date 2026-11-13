import express from "express";

import {
  getProfile,
  updateProfile,
  uploadProfilePicture,
  removeProfilePicture,
} from "../controllers/profileController.js";

import { protect } from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

// Get and update profile details
router.route("/").get(protect, getProfile).put(protect, updateProfile);

// Upload or replace profile picture
router.put(
  "/picture",
  protect,
  upload.single("profilePicture"),
  uploadProfilePicture,
);

// Remove profile picture
router.delete("/picture", protect, removeProfilePicture);

export default router;
