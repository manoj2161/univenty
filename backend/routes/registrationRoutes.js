import express from "express";
import {
  registerForEvent,
  getMyRegistrations,
  cancelMyRegistration,
  getEventRegistrations,
  reviewRegistration,
  checkInByQR,
  exportAttendeesCSV,
} from "../controllers/registrationController.js";
import { downloadCertificate, issueCertificates } from "../controllers/certificateController.js";
import { protect, requireRole } from "../middleware/authMiddleware.js";

const router = express.Router();

// Student routes
router.get("/my-registrations", protect, requireRole("Student", "Admin"), getMyRegistrations);
router.post("/:eventId", protect, requireRole("Student"), registerForEvent);
router.delete("/:id/cancel", protect, requireRole("Student", "Admin"), cancelMyRegistration);
router.get("/:id/certificate", protect, downloadCertificate);

// Organiser / Admin routes (specific paths before generic :id routes)
router.get("/event/:eventId/export-csv", protect, requireRole("Organiser", "Admin"), exportAttendeesCSV);
router.get("/event/:eventId", protect, requireRole("Organiser", "Admin"), getEventRegistrations);
router.post("/event/:eventId/issue-certificates", protect, requireRole("Organiser", "Admin"), issueCertificates);
router.patch("/checkin", protect, requireRole("Organiser", "Admin"), checkInByQR);
router.patch("/:id/review", protect, requireRole("Organiser", "Admin"), reviewRegistration);

export default router;
