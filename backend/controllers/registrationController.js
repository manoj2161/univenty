import mongoose from "mongoose";
import Registration from "../models/Registration.js";
import Event from "../models/Event.js";
import { v4 as uuidv4 } from "uuid";
import { sendEmail, registrationApprovedEmail, registrationRejectedEmail } from "../utils/emailService.js";
import { createNotification } from "./notificationController.js";

// @desc    Register for an event (Student)
// @route   POST /api/registrations/:eventId
// @access  Private (Student)
export const registerForEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    if (!mongoose.isValidObjectId(eventId)) {
      return res.status(400).json({ success: false, message: "Invalid event ID" });
    }
    const { notes, customAnswers } = req.body;
    const studentId = req.user._id;

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ success: false, message: "Event not found" });
    }

    if (!event.isApproved || event.status !== "Approved") {
      return res.status(400).json({ success: false, message: "Registrations are only open for approved events" });
    }

    // Check duplicate
    const existing = await Registration.findOne({ student: studentId, event: eventId });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: `You have already registered for this event. Current status: ${existing.status}`,
      });
    }

    const remainingSeats = (event.totalSeats || 0) - (event.bookedSeats || 0);

    // Waitlist logic
    if (remainingSeats <= 0) {
      if (event.hasWaitlist) {
        const waitlistCount = await Registration.countDocuments({ event: eventId, status: "Waitlisted" });
        const registration = await Registration.create({
          student: studentId,
          event: eventId,
          status: "Waitlisted",
          notes: notes || "",
          customAnswers: customAnswers || {},
          waitlistPosition: waitlistCount + 1,
          registeredAt: new Date(),
        });
        return res.status(201).json({
          success: true,
          message: `Event is full. You are #${registration.waitlistPosition} on the waitlist.`,
          registration,
        });
      }
      return res.status(400).json({ success: false, message: "Sorry, this event is fully booked!" });
    }

    const registration = await Registration.create({
      student: studentId,
      event: eventId,
      status: "Pending",
      notes: notes || "",
      customAnswers: customAnswers || {},
      registeredAt: new Date(),
    });

    return res.status(201).json({
      success: true,
      message: "Registration request submitted! Pending approval by the event organiser.",
      registration,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: "You have already registered for this event." });
    }
    console.error("registerForEvent Error:", error);
    return res.status(500).json({ success: false, message: error.message || "Registration failed" });
  }
};

// @desc    Get logged in student's registrations
// @route   GET /api/registrations/my-registrations
// @access  Private (Student)
export const getMyRegistrations = async (req, res) => {
  try {
    const registrations = await Registration.find({ student: req.user._id })
      .populate({ path: "event", populate: { path: "organiser", select: "name email" } })
      .sort({ createdAt: -1 });

    return res.json({ success: true, count: registrations.length, registrations });
  } catch (error) {
    console.error("getMyRegistrations Error:", error);
    return res.status(500).json({ success: false, message: error.message || "Failed to load registrations" });
  }
};

// @desc    Cancel a registration (Student)
// @route   DELETE /api/registrations/:id/cancel
// @access  Private (Student)
export const cancelMyRegistration = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await Registration.findOne({ _id: id, student: req.user._id });
    if (!existing) return res.status(404).json({ success: false, message: "Registration not found" });
    if (existing.status === "Cancelled") return res.status(409).json({ success: false, message: "Registration is already cancelled" });
    const previousStatus = existing.status;
    const registration = await Registration.findOneAndUpdate(
      { _id: id, student: req.user._id, status: previousStatus },
      { $set: { status: "Cancelled", qrToken: "" } },
      { new: true }
    );
    if (!registration) return res.status(409).json({ success: false, message: "Registration changed during cancellation. Refresh and retry." });
    if (previousStatus === "Approved") {
      await Event.updateOne({ _id: existing.event, bookedSeats: { $gt: 0 } }, { $inc: { bookedSeats: -1 } });
      await promoteWaitlist(existing.event);
    }
    return res.json({ success: true, message: "Registration cancelled successfully", registration });
  } catch (error) {
    console.error("cancelMyRegistration Error:", error);
    return res.status(500).json({ success: false, message: error.message || "Failed to cancel registration" });
  }
};

// Helper: promote first waitlisted student when a seat opens
const promoteWaitlist = async (eventId) => {
  const nextWaiting = await Registration.findOne({ event: eventId, status: "Waitlisted" })
    .sort({ waitlistPosition: 1 })
    .populate("student", "name email");

  if (!nextWaiting) return;

  nextWaiting.status = "Pending";
  nextWaiting.waitlistPosition = null;
  await nextWaiting.save();

  // Notify them
  await createNotification({
    userId: nextWaiting.student._id,
    title: "Waitlist Promotion!",
    message: "A seat opened up. Your registration is now pending review.",
    type: "registration",
    link: "/student/registrations",
  });
};

// @desc    Get all registrations for an organiser's event
// @route   GET /api/registrations/event/:eventId
// @access  Private (Organiser owner or Admin)
export const getEventRegistrations = async (req, res) => {
  try {
    const { eventId } = req.params;
    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).json({ success: false, message: "Event not found" });
    }

    if (event.organiser.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(403).json({ success: false, message: "You can only view registrations for your own events" });
    }

    const registrations = await Registration.find({ event: eventId })
      .populate("student", "name email phone department rollNumber")
      .sort({ createdAt: -1 });

    return res.json({ success: true, event, count: registrations.length, registrations });
  } catch (error) {
    console.error("getEventRegistrations Error:", error);
    return res.status(500).json({ success: false, message: error.message || "Failed to fetch event registrations" });
  }
};

// @desc    Review/Approve/Reject registration (Organiser or Admin)
// @route   PATCH /api/registrations/:id/review
// @access  Private (Organiser owner or Admin)
export const reviewRegistration = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;
    if (!["Approved", "Rejected"].includes(status)) {
      return res.status(400).json({ success: false, message: "Status must be 'Approved' or 'Rejected'" });
    }
    const existing = await Registration.findById(id).populate("event");
    if (!existing) return res.status(404).json({ success: false, message: "Registration not found" });
    const event = existing.event;
    if (event.organiser.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(403).json({ success: false, message: "You can only review requests for your own events" });
    }
    const previousStatus = existing.status;
    if (previousStatus === status) {
      return res.json({ success: true, message: `Registration is already ${status}.`, registration: existing });
    }
    if (!["Pending", "Waitlisted", "Approved"].includes(previousStatus)) {
      return res.status(409).json({ success: false, message: `Cannot review a ${previousStatus.toLowerCase()} registration.` });
    }

    if (status === "Approved" && previousStatus !== "Approved") {
      const seatClaim = await Event.findOneAndUpdate(
        { _id: event._id, status: "Approved", isApproved: true, $expr: { $lt: [{ $ifNull: ["$bookedSeats", 0] }, "$totalSeats"] } },
        { $inc: { bookedSeats: 1 } },
        { new: true }
      );
      if (!seatClaim) return res.status(409).json({ success: false, message: "Cannot approve: no seats remain or the event is not approved." });
    }

    const update = {
      status,
      reviewedAt: new Date(),
      reviewedBy: req.user._id,
      qrToken: status === "Approved" ? `UNIVENTY-${uuidv4()}` : "",
    };
    if (notes !== undefined) update.notes = notes;
    const registration = await Registration.findOneAndUpdate(
      { _id: id, status: previousStatus },
      { $set: update },
      { new: true, runValidators: true }
    ).populate("event").populate("student", "name email department rollNumber");

    if (!registration) {
      if (status === "Approved" && previousStatus !== "Approved") {
        await Event.updateOne({ _id: event._id, bookedSeats: { $gt: 0 } }, { $inc: { bookedSeats: -1 } });
      }
      return res.status(409).json({ success: false, message: "Registration changed by another request. Refresh and try again." });
    }

    if (previousStatus === "Approved" && status === "Rejected") {
      await Event.updateOne({ _id: event._id, bookedSeats: { $gt: 0 } }, { $inc: { bookedSeats: -1 } });
      await promoteWaitlist(event._id);
    }

    if (status === "Approved") {
      const { subject, html } = registrationApprovedEmail(registration.student.name, event.name, event.eventDate);
      await sendEmail({ to: registration.student.email, subject, html });
      await createNotification({ userId: registration.student._id, title: "Registration Approved!", message: `Your registration for "${event.name}" has been approved. Check your ticket.`, type: "registration", link: "/student/registrations" });
    } else {
      const { subject, html } = registrationRejectedEmail(registration.student.name, event.name);
      await sendEmail({ to: registration.student.email, subject, html });
      await createNotification({ userId: registration.student._id, title: "Registration Update", message: `Your registration for "${event.name}" was not approved.`, type: "registration", link: "/student/registrations" });
    }

    return res.json({ success: true, message: `Registration marked as ${status}`, registration });
  } catch (error) {
    console.error("reviewRegistration Error:", error);
    return res.status(500).json({ success: false, message: error.message || "Failed to update registration status" });
  }
};

// @desc    Check-in a student via QR token
// @route   PATCH /api/registrations/checkin
// @access  Private (Organiser or Admin)
export const checkInByQR = async (req, res) => {
  try {
    const { qrToken } = req.body;

    if (!qrToken) {
      return res.status(400).json({ success: false, message: "QR token is required" });
    }

    const registration = await Registration.findOne({ qrToken })
      .populate("student", "name email department rollNumber")
      .populate("event", "name eventDate organiser");

    if (!registration) {
      return res.status(404).json({ success: false, message: "Invalid QR code" });
    }

    if (registration.status !== "Approved") {
      return res.status(400).json({
        success: false,
        message: `Cannot check in: Registration status is ${registration.status}`,
      });
    }

    if (registration.checkedIn) {
      return res.status(400).json({
        success: false,
        alreadyCheckedIn: true,
        message: "Student has already been checked in",
        registration,
      });
    }

    // Verify organiser owns this event
    if (
      registration.event.organiser.toString() !== req.user._id.toString() &&
      !req.user.isAdmin
    ) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const checkedInRegistration = await Registration.findOneAndUpdate(
      { _id: registration._id, status: "Approved", checkedIn: false },
      { $set: { checkedIn: true, checkedInAt: new Date() } },
      { new: true }
    ).populate("student", "name email department rollNumber").populate("event", "name eventDate organiser");
    if (!checkedInRegistration) {
      return res.status(409).json({ success: false, alreadyCheckedIn: true, message: "Student has already been checked in." });
    }
    return res.json({ success: true, message: "Student checked in successfully!", registration: checkedInRegistration });
  } catch (error) {
    console.error("checkInByQR Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Export event attendees as CSV
// @route   GET /api/registrations/event/:eventId/export-csv
// @access  Private (Organiser or Admin)
export const exportAttendeesCSV = async (req, res) => {
  try {
    const { eventId } = req.params;
    const event = await Event.findById(eventId);

    if (!event) return res.status(404).json({ success: false, message: "Event not found" });

    if (event.organiser.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const registrations = await Registration.find({ event: eventId, status: "Approved" })
      .populate("student", "name email department rollNumber phone")
      .sort({ registeredAt: 1 });

    const header = "Name,Email,Department,Roll Number,Phone,Checked In,Check-In Time\n";
    const rows = registrations.map((r) => {
      const s = r.student;
      return [
        `"${s.name || ""}"`,
        `"${s.email || ""}"`,
        `"${s.department || ""}"`,
        `"${s.rollNumber || ""}"`,
        `"${s.phone || ""}"`,
        r.checkedIn ? "Yes" : "No",
        r.checkedInAt ? new Date(r.checkedInAt).toLocaleString() : "",
      ].join(",");
    });

    const csv = header + rows.join("\n");

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename="${event.name.replace(/\s+/g, "-")}-attendees.csv"`);
    return res.send(csv);
  } catch (error) {
    console.error("exportAttendeesCSV Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};
