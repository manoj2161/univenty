import User from "../models/User.js";
import Event from "../models/Event.js";
import Registration from "../models/Registration.js";
import AdminLog from "../models/AdminLog.js";
import { createNotification } from "./notificationController.js";

// Helper to log admin actions
const logAction = async (req, action, targetType, targetId, description, prev = null, updated = null, reason = "") => {
  try {
    await AdminLog.create({
      admin: req.user._id,
      action,
      targetType,
      targetId,
      description,
      previousData: prev,
      newData: updated,
      reason,
      ipAddress: req.ip || req.connection.remoteAddress || "",
      userAgent: req.headers["user-agent"] || "",
    });
  } catch (e) {
    console.error("Failed to create admin log:", e.message);
  }
};


const promoteAdminWaitlist = async (eventId) => {
  const waiting = await Registration.findOne({ event: eventId, status: "Waitlisted" })
    .sort({ waitlistPosition: 1 });
  if (!waiting) return;
  waiting.status = "Pending";
  waiting.waitlistPosition = null;
  await waiting.save();
  await createNotification({
    userId: waiting.student,
    title: "Waitlist Promotion",
    message: "A seat has become available. Your registration is now pending organiser review.",
    type: "registration",
    link: "/student/registrations",
  });
};

// @desc    Admin stats
// @route   GET /api/admin/stats
export const getAdminStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalStudents = await User.countDocuments({ category: "Student" });
    const totalOrganisers = await User.countDocuments({ category: "Organiser" });
    const totalAdmins = await User.countDocuments({ category: "Admin" });
    const blockedAccounts = await User.countDocuments({ accountStatus: "Blocked" });

    const totalEvents = await Event.countDocuments();
    const pendingEvents = await Event.countDocuments({ status: "Pending" });
    const approvedEvents = await Event.countDocuments({ status: "Approved" });
    const rejectedEvents = await Event.countDocuments({ status: "Rejected" });

    const totalRegistrations = await Registration.countDocuments();
    const pendingRegistrations = await Registration.countDocuments({ status: "Pending" });
    const approvedRegistrations = await Registration.countDocuments({ status: "Approved" });
    const rejectedRegistrations = await Registration.countDocuments({ status: "Rejected" });

    return res.json({
      success: true,
      stats: {
        totalUsers,
        totalStudents,
        totalOrganisers,
        totalAdmins,
        blockedAccounts,
        totalEvents,
        pendingEvents,
        approvedEvents,
        rejectedEvents,
        totalRegistrations,
        pendingRegistrations,
        approvedRegistrations,
        rejectedRegistrations,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all users
// @route   GET /api/admin/users
export const getAdminUsers = async (req, res) => {
  try {
    const { category, accountStatus, search } = req.query;
    let query = {};

    if (category && category !== "All") query.category = category;
    if (accountStatus && accountStatus !== "All") query.accountStatus = accountStatus;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const users = await User.find(query)
      .select("-password")
      .sort({ createdAt: -1 });

    return res.json({ success: true, count: users.length, users });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single user
// @route   GET /api/admin/users/:id
export const getAdminUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    return res.json({ success: true, user });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update user
// @route   PUT /api/admin/users/:id
export const updateAdminUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    if (user.category === "Admin" && user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Cannot edit other administrators" });
    }

    const { name, email, department, rollNumber, phone, isVerified } = req.body;
    const prevData = { name: user.name, email: user.email, isVerified: user.isVerified };

    if (name) user.name = name.trim();
    if (email) user.email = email.toLowerCase().trim();
    if (department !== undefined) user.department = department;
    if (rollNumber !== undefined) user.rollNumber = rollNumber;
    if (phone !== undefined) user.phone = phone;
    if (isVerified !== undefined) user.isVerified = isVerified;

    await user.save();

    await logAction(
      req,
      "USER_UPDATED",
      "User",
      user._id,
      `Updated user info for ${user.email}`,
      prevData,
      { name: user.name, email: user.email, isVerified: user.isVerified }
    );

    return res.json({ success: true, message: "User updated successfully", user });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Block user
// @route   POST /api/admin/users/:id/block
export const blockAdminUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    if (user.category === "Admin") {
      return res.status(403).json({ success: false, message: "Cannot block administrator accounts" });
    }

    const { reason } = req.body;
    user.accountStatus = "Blocked";
    user.blockedAt = new Date();
    user.blockedBy = req.user._id;
    user.blockReason = reason || "Violation of platform terms";
    user.tokenVersion = (user.tokenVersion || 0) + 1; // Invalidate all existing sessions

    await user.save();

    await logAction(
      req,
      "USER_BLOCKED",
      "User",
      user._id,
      `Blocked user ${user.email}`,
      { status: "Active" },
      { status: "Blocked" },
      user.blockReason
    );

    return res.json({ success: true, message: "User blocked successfully", user });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Unblock user
// @route   POST /api/admin/users/:id/unblock
export const unblockAdminUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    user.accountStatus = "Active";
    user.blockedAt = null;
    user.blockedBy = null;
    user.blockReason = "";

    await user.save();

    await logAction(
      req,
      "USER_UNBLOCKED",
      "User",
      user._id,
      `Unblocked user ${user.email}`,
      { status: "Blocked" },
      { status: "Active" }
    );

    return res.json({ success: true, message: "User unblocked successfully", user });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all events for admin
// @route   GET /api/admin/events
export const getAdminEvents = async (req, res) => {
  try {
    const { status, category, search } = req.query;
    let query = {};

    if (status && status !== "All") query.status = status;
    if (category && category !== "All") query.category = category;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const events = await Event.find(query)
      .populate("organiser", "name email")
      .sort({ createdAt: -1 });

    return res.json({ success: true, count: events.length, events });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Review event (Approve/Reject)
// @route   PATCH /api/admin/events/:id/review
export const reviewAdminEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, reason } = req.body;

    if (!["Approved", "Rejected", "Pending"].includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status value" });
    }

    const event = await Event.findById(id);
    if (!event) return res.status(404).json({ success: false, message: "Event not found" });

    const prev = { status: event.status, isApproved: event.isApproved };

    event.status = status;
    event.isApproved = status === "Approved";
    await event.save();

    await logAction(
      req,
      status === "Approved" ? "EVENT_APPROVED" : "EVENT_REJECTED",
      "Event",
      event._id,
      `Event "${event.name}" marked as ${status}`,
      prev,
      { status: event.status, isApproved: event.isApproved },
      reason || ""
    );

    return res.json({ success: true, message: `Event marked as ${status}`, event });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update event details (Admin)
// @route   PUT /api/admin/events/:id
export const updateAdminEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ success: false, message: "Event not found" });

    const prev = event.toObject();
    const allowedFields = ["name", "description", "eventDate", "eventTime", "eventLocation", "totalSeats", "category", "departments", "imageUrl", "isTeamEvent", "teamSize", "hasWaitlist", "customFields"];
    for (const field of allowedFields) {
      if (Object.prototype.hasOwnProperty.call(req.body, field)) event[field] = req.body[field];
    }
    if (req.body.status && !["Pending", "Approved", "Rejected"].includes(req.body.status)) {
      return res.status(400).json({ success: false, message: "Invalid event status" });
    }
    if (req.body.status) event.isApproved = req.body.status === "Approved";
    if (!Number.isFinite(Number(event.totalSeats)) || Number(event.totalSeats) < 1 || Number(event.totalSeats) < Number(event.bookedSeats || 0)) {
      return res.status(400).json({ success: false, message: "Total seats cannot be lower than booked seats." });
    }
    await event.save();

    await logAction(
      req,
      "EVENT_UPDATED",
      "Event",
      event._id,
      `Administrator edited event "${event.name}"`,
      prev,
      event.toObject()
    );

    return res.json({ success: true, message: "Event updated successfully", event });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete event (Admin)
// @route   DELETE /api/admin/events/:id
export const deleteAdminEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ success: false, message: "Event not found" });

    await Registration.deleteMany({ event: event._id });
    await Event.findByIdAndDelete(event._id);

    await logAction(
      req,
      "EVENT_DELETED",
      "Event",
      event._id,
      `Administrator deleted event "${event.name}" and cleared associated registrations`
    );

    return res.json({ success: true, message: "Event deleted successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all platform registrations (Admin)
// @route   GET /api/admin/registrations
export const getAdminRegistrations = async (req, res) => {
  try {
    const { status, eventId } = req.query;
    let query = {};
    if (status && status !== "All") query.status = status;
    if (eventId) query.event = eventId;

    const registrations = await Registration.find(query)
      .populate("student", "name email phone department rollNumber")
      .populate("event", "name eventDate eventLocation bookedSeats totalSeats")
      .populate("reviewedBy", "name email")
      .sort({ createdAt: -1 });

    return res.json({ success: true, count: registrations.length, registrations });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Review registration (Admin)
// @route   PATCH /api/admin/registrations/:id/review
export const reviewAdminRegistration = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;
    if (!["Approved", "Rejected"].includes(status)) {
      return res.status(400).json({ success: false, message: "Status must be Approved or Rejected." });
    }
    const registration = await Registration.findById(id).populate("event");
    if (!registration) return res.status(404).json({ success: false, message: "Registration not found" });
    const event = registration.event;
    const previousStatus = registration.status;
    if (previousStatus === status) {
      return res.json({ success: true, message: `Registration is already ${status}.`, registration });
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
      if (!seatClaim) return res.status(409).json({ success: false, message: "No seats remain. The registration was not approved." });
    }

    const update = { status, reviewedAt: new Date(), reviewedBy: req.user._id };
    if (notes !== undefined) update.notes = notes;
    const updated = await Registration.findOneAndUpdate(
      { _id: id, status: previousStatus },
      { $set: update },
      { new: true, runValidators: true }
    ).populate("event").populate("student", "name email");

    if (!updated) {
      if (status === "Approved" && previousStatus !== "Approved") {
        await Event.updateOne({ _id: event._id, bookedSeats: { $gt: 0 } }, { $inc: { bookedSeats: -1 } });
      }
      return res.status(409).json({ success: false, message: "Registration was changed by another request. Refresh and try again." });
    }

    if (previousStatus === "Approved" && status === "Rejected") {
      await Event.updateOne({ _id: event._id, bookedSeats: { $gt: 0 } }, { $inc: { bookedSeats: -1 } });
      await promoteAdminWaitlist(event._id);
    }

    await logAction(req, status === "Approved" ? "REGISTRATION_APPROVED" : "REGISTRATION_REJECTED", "Registration", updated._id, `Admin reviewed registration ${updated._id} -> ${status}`, { status: previousStatus }, { status });
    return res.json({ success: true, message: `Registration status updated to ${status}`, registration: updated });
  } catch (error) {
    console.error("reviewAdminRegistration Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Cancel registration (Admin)
// @route   DELETE /api/admin/registrations/:id
export const cancelAdminRegistration = async (req, res) => {
  try {
    const existing = await Registration.findById(req.params.id);
    if (!existing) return res.status(404).json({ success: false, message: "Registration not found" });
    if (existing.status === "Cancelled") return res.status(409).json({ success: false, message: "Registration is already cancelled" });
    const previousStatus = existing.status;
    const registration = await Registration.findOneAndUpdate(
      { _id: existing._id, status: previousStatus },
      { $set: { status: "Cancelled", reviewedAt: new Date(), reviewedBy: req.user._id, qrToken: "" } },
      { new: true }
    );
    if (!registration) return res.status(409).json({ success: false, message: "Registration changed during cancellation. Refresh and retry." });
    if (previousStatus === "Approved") {
      await Event.updateOne({ _id: existing.event, bookedSeats: { $gt: 0 } }, { $inc: { bookedSeats: -1 } });
      await promoteAdminWaitlist(existing.event);
    }
    await logAction(req, "REGISTRATION_CANCELLED", "Registration", registration._id, `Admin cancelled registration ${registration._id}`, { status: previousStatus }, { status: "Cancelled" });
    return res.json({ success: true, message: "Registration cancelled successfully", registration });
  } catch (error) {
    console.error("cancelAdminRegistration Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Advanced analytics for admin dashboard
// @route   GET /api/admin/analytics
export const getAnalytics = async (req, res) => {
  try {
    // Registrations per day for last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const regPerDay = await Registration.aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Events by category
    const eventsByCategory = await Event.aggregate([
      { $match: { status: "Approved" } },
      { $group: { _id: "$category", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    // New users per month (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const usersPerMonth = await User.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m", date: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Top events by registrations
    const topEvents = await Registration.aggregate([
      { $match: { status: "Approved" } },
      { $group: { _id: "$event", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: "events",
          localField: "_id",
          foreignField: "_id",
          as: "event",
        },
      },
      { $unwind: "$event" },
      { $project: { name: "$event.name", count: 1 } },
    ]);

    return res.json({
      success: true,
      analytics: {
        registrationsPerDay: regPerDay,
        eventsByCategory,
        usersPerMonth,
        topEvents,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get Admin activity logs
// @route   GET /api/admin/logs
export const getAdminLogs = async (req, res) => {
  try {
    const logs = await AdminLog.find()
      .populate("admin", "name email")
      .sort({ createdAt: -1 })
      .limit(100);

    return res.json({ success: true, count: logs.length, logs });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
