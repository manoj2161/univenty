import mongoose from "mongoose";
import Event from "../models/Event.js";
import Registration from "../models/Registration.js";

// @desc    Get all approved public events
// @route   GET /api/events
// @access  Public
export const getEvents = async (req, res) => {
  try {
    const { category, search, department } = req.query;

    let query = {
      isApproved: true,
      status: "Approved",
    };

    if (category && category !== "All") {
      query.category = category;
    }

    if (department && department !== "All") {
      query.departments = department;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { eventLocation: { $regex: search, $options: "i" } },
      ];
    }

    const events = await Event.find(query)
      .populate("organiser", "name email")
      .sort({ eventDate: 1 });

    return res.json({
      success: true,
      count: events.length,
      events,
    });
  } catch (error) {
    console.error("getEvents Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch events",
    });
  }
};

// @desc    Get single event by ID
// @route   GET /api/events/:id
// @access  Public (or semi-private if organiser/admin wants to view pending)
export const getEventById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: "Invalid event ID" });
    }
    const event = await Event.findOne({ _id: id, isApproved: true, status: "Approved" })
      .populate("organiser", "name email");

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    return res.json({
      success: true,
      event,
    });
  } catch (error) {
    console.error("getEventById Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to retrieve event",
    });
  }
};

// @desc    Create new event (Organiser only)
// @route   POST /api/events
// @access  Private (Organiser or Admin)
export const createEvent = async (req, res) => {
  try {
    const {
      name,
      description,
      eventDate,
      eventTime,
      eventLocation,
      totalSeats,
      category,
      departments,
      imageUrl,
      isTeamEvent,
      teamSize,
      hasWaitlist,
      customFields,
    } = req.body;

    if (
      !name || !description || !eventDate || !eventTime || !eventLocation ||
      totalSeats === undefined || totalSeats === null || Number(totalSeats) < 1 ||
      !Number.isFinite(Number(totalSeats))
    ) {
      return res.status(400).json({
        success: false,
        message: "Please fill in all required event details",
      });
    }

    const event = await Event.create({
      organiser: req.user._id,
      name: name.trim(),
      description: description.trim(),
      eventDate,
      eventTime: eventTime.trim(),
      eventLocation: eventLocation.trim(),
      totalSeats: Number(totalSeats),
      bookedSeats: 0,
      category: category || "Technical",
      departments: Array.isArray(departments) ? departments : [departments].filter(Boolean),
      imageUrl: imageUrl || "",
      isTeamEvent: Boolean(isTeamEvent),
      teamSize: teamSize || { min: 2, max: 5 },
      hasWaitlist: Boolean(hasWaitlist),
      customFields: Array.isArray(customFields) ? customFields : [],
      status: "Pending", // Requires admin approval
      isApproved: false,
    });

    return res.status(201).json({
      success: true,
      message: "Event created successfully and submitted for Admin approval.",
      event,
    });
  } catch (error) {
    console.error("createEvent Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to create event",
    });
  }
};

// @desc    Get all events created by logged-in organiser
// @route   GET /api/events/organiser/my-events
// @access  Private (Organiser or Admin)
export const getMyEvents = async (req, res) => {
  try {
    const events = await Event.find({ organiser: req.user._id }).sort({
      createdAt: -1,
    });

    // Compute stats for organiser dashboard
    const totalEvents = events.length;
    const approvedEvents = events.filter((e) => e.status === "Approved").length;
    const pendingEvents = events.filter((e) => e.status === "Pending").length;
    const rejectedEvents = events.filter((e) => e.status === "Rejected").length;

    // Get registration stats across all this organiser's events
    const eventIds = events.map((e) => e._id);
    const registrations = await Registration.find({ event: { $in: eventIds } });

    const totalRegistrations = registrations.length;
    const pendingRegistrations = registrations.filter(
      (r) => r.status === "Pending"
    ).length;
    const approvedRegistrations = registrations.filter(
      (r) => r.status === "Approved"
    ).length;

    return res.json({
      success: true,
      stats: {
        totalEvents,
        approvedEvents,
        pendingEvents,
        rejectedEvents,
        totalRegistrations,
        pendingRegistrations,
        approvedRegistrations,
      },
      events,
    });
  } catch (error) {
    console.error("getMyEvents Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to load organiser events",
    });
  }
};

// @desc    Update event (Organiser can edit own event)
// @route   PUT /api/events/:id
// @access  Private (Organiser owner or Admin)
export const updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const event = await Event.findById(id);

    if (!event) {
      return res.status(404).json({ success: false, message: "Event not found" });
    }

    // Ownership check (unless admin)
    if (
      event.organiser.toString() !== req.user._id.toString() &&
      !req.user.isAdmin
    ) {
      return res.status(403).json({
        success: false,
        message: "You can only edit your own events",
      });
    }

    const {
      name,
      description,
      eventDate,
      eventTime,
      eventLocation,
      totalSeats,
      category,
      departments,
      imageUrl,
      isTeamEvent,
      teamSize,
      hasWaitlist,
      customFields,
    } = req.body;

    if (name) event.name = name.trim();
    if (description) event.description = description.trim();
    if (eventDate) event.eventDate = eventDate;
    if (eventTime) event.eventTime = eventTime.trim();
    if (eventLocation) event.eventLocation = eventLocation.trim();
    if (totalSeats !== undefined) event.totalSeats = Number(totalSeats);
    if (category) event.category = category;
    if (departments) {
      event.departments = Array.isArray(departments)
        ? departments
        : [departments].filter(Boolean);
    }
    if (imageUrl !== undefined) event.imageUrl = imageUrl;
    if (isTeamEvent !== undefined) event.isTeamEvent = Boolean(isTeamEvent);
    if (teamSize !== undefined) event.teamSize = teamSize;
    if (hasWaitlist !== undefined) event.hasWaitlist = Boolean(hasWaitlist);
    if (customFields !== undefined) event.customFields = Array.isArray(customFields) ? customFields : [];

    if (!Number.isFinite(event.totalSeats) || event.totalSeats < 1 || event.totalSeats < event.bookedSeats) {
      return res.status(400).json({ success: false, message: "Total seats must be at least 1 and cannot be lower than already booked seats." });
    }

    // Any major edit by organiser triggers pending re-approval
    if (!req.user.isAdmin) {
      event.status = "Pending";
      event.isApproved = false;
    }

    await event.save();

    return res.json({
      success: true,
      message: "Event updated successfully",
      event,
    });
  } catch (error) {
    console.error("updateEvent Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to update event",
    });
  }
};

// @desc    Delete event (Organiser owner or Admin)
// @route   DELETE /api/events/:id
// @access  Private
export const deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const event = await Event.findById(id);

    if (!event) {
      return res.status(404).json({ success: false, message: "Event not found" });
    }

    if (
      event.organiser.toString() !== req.user._id.toString() &&
      !req.user.isAdmin
    ) {
      return res.status(403).json({
        success: false,
        message: "You can only delete your own events",
      });
    }

    // Check if event has confirmed registrations
    const regCount = await Registration.countDocuments({
      event: id,
      status: "Approved",
    });

    if (regCount > 0 && !req.user.isAdmin) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete event with ${regCount} approved registrations. Please cancel registrations first or contact admin.`,
      });
    }

    await Registration.deleteMany({ event: id });
    await Event.findByIdAndDelete(id);

    return res.json({
      success: true,
      message: "Event and associated records deleted successfully",
    });
  } catch (error) {
    console.error("deleteEvent Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to delete event",
    });
  }
};
