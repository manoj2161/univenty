import express from "express";
import {
  getAdminStats,
  getAdminUsers,
  getAdminUser,
  updateAdminUser,
  blockAdminUser,
  unblockAdminUser,
  getAdminEvents,
  reviewAdminEvent,
  updateAdminEvent,
  deleteAdminEvent,
  getAdminRegistrations,
  reviewAdminRegistration,
  cancelAdminRegistration,
  getAdminLogs,
  getAnalytics,
} from "../controllers/adminController.js";
import {
  createAnnouncement,
  getAllAnnouncements,
  toggleAnnouncement,
  deleteAnnouncement,
} from "../controllers/announcementController.js";
import { issueCertificates } from "../controllers/certificateController.js";
import { protect } from "../middleware/authMiddleware.js";
import { adminOnly } from "../middleware/adminMiddleware.js";

const router = express.Router();

// Apply protect & adminOnly to all admin routes
router.use(protect, adminOnly);

// Stats, logs & analytics
router.get("/stats", getAdminStats);
router.get("/logs", getAdminLogs);
router.get("/analytics", getAnalytics);

// Users management
router.get("/users", getAdminUsers);
router.get("/users/:id", getAdminUser);
router.put("/users/:id", updateAdminUser);
router.post("/users/:id/block", blockAdminUser);
router.post("/users/:id/unblock", unblockAdminUser);

// Events management
router.get("/events", getAdminEvents);
router.patch("/events/:id/review", reviewAdminEvent);
router.put("/events/:id", updateAdminEvent);
router.delete("/events/:id", deleteAdminEvent);
router.post("/events/:id/issue-certificates", issueCertificates);

// Registrations management
router.get("/registrations", getAdminRegistrations);
router.patch("/registrations/:id/review", reviewAdminRegistration);
router.delete("/registrations/:id", cancelAdminRegistration);

// Announcements
router.get("/announcements", getAllAnnouncements);
router.post("/announcements", createAnnouncement);
router.patch("/announcements/:id/toggle", toggleAnnouncement);
router.delete("/announcements/:id", deleteAnnouncement);

export default router;
