import Announcement from "../models/Announcement.js";

// @desc    Get active announcements
// @route   GET /api/announcements
// @access  Public
export const getAnnouncements = async (req, res) => {
  try {
    const now = new Date();
    const announcements = await Announcement.find({
      isActive: true,
      $or: [{ expiresAt: null }, { expiresAt: { $gt: now } }],
    })
      .populate("createdBy", "name")
      .sort({ createdAt: -1 });

    return res.json({ success: true, announcements });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create announcement (Admin)
// @route   POST /api/admin/announcements
// @access  Admin
export const createAnnouncement = async (req, res) => {
  try {
    const { title, message, type, expiresAt } = req.body;

    if (!title || !message) {
      return res.status(400).json({ success: false, message: "Title and message are required" });
    }

    const announcement = await Announcement.create({
      title,
      message,
      type: type || "info",
      expiresAt: expiresAt || null,
      createdBy: req.user._id,
    });

    return res.status(201).json({ success: true, announcement });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Toggle announcement active state (Admin)
// @route   PATCH /api/admin/announcements/:id/toggle
// @access  Admin
export const toggleAnnouncement = async (req, res) => {
  try {
    const ann = await Announcement.findById(req.params.id);
    if (!ann) return res.status(404).json({ success: false, message: "Announcement not found" });
    ann.isActive = !ann.isActive;
    await ann.save();
    return res.json({ success: true, announcement: ann });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete announcement (Admin)
// @route   DELETE /api/admin/announcements/:id
// @access  Admin
export const deleteAnnouncement = async (req, res) => {
  try {
    await Announcement.findByIdAndDelete(req.params.id);
    return res.json({ success: true, message: "Announcement deleted" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all announcements (Admin, includes inactive)
// @route   GET /api/admin/announcements
// @access  Admin
export const getAllAnnouncements = async (req, res) => {
  try {
    const announcements = await Announcement.find()
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });
    return res.json({ success: true, announcements });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
