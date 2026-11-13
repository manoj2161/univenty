import express from "express";
import {
  getEvents,
  getEventById,
  createEvent,
  getMyEvents,
  updateEvent,
  deleteEvent,
} from "../controllers/eventController.js";
import { protect, requireRole } from "../middleware/authMiddleware.js";

const router = express.Router();

// Organiser routes (must come BEFORE /:id to avoid router treating 'organiser' as an :id)
router.get("/organiser/my-events", protect, requireRole("Organiser", "Admin"), getMyEvents);

// Public event listing and details
router.get("/", getEvents);
router.get("/:id", getEventById);

// Create event (Organiser or Admin)
router.post("/", protect, requireRole("Organiser", "Admin"), createEvent);

// Update and Delete event
router.put("/:id", protect, requireRole("Organiser", "Admin"), updateEvent);
router.delete("/:id", protect, requireRole("Organiser", "Admin"), deleteEvent);

export default router;
