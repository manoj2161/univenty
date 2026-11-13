import Review from "../models/Review.js";
import Registration from "../models/Registration.js";
import User from "../models/User.js";

// @desc    Add event review (checked-in students only)
// @route   POST /api/events/:id/reviews
// @access  Private (Student)
export const addReview = async (req, res) => {
  try {
    const { id: eventId } = req.params;
    const { rating, comment } = req.body;
    const studentId = req.user._id;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: "Rating must be between 1 and 5" });
    }

    // Student must have been checked in to review
    const registration = await Registration.findOne({
      student: studentId,
      event: eventId,
      checkedIn: true,
    });

    if (!registration) {
      return res.status(403).json({
        success: false,
        message: "You can only review events you attended (checked in).",
      });
    }

    const existing = await Review.findOne({ student: studentId, event: eventId });
    if (existing) {
      return res.status(400).json({ success: false, message: "You have already reviewed this event." });
    }

    const review = await Review.create({
      student: studentId,
      event: eventId,
      rating,
      comment: comment || "",
    });

    await review.populate("student", "name");

    return res.status(201).json({ success: true, review });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: "You have already reviewed this event." });
    }
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get reviews for an event
// @route   GET /api/events/:id/reviews
// @access  Public
export const getEventReviews = async (req, res) => {
  try {
    const { id: eventId } = req.params;
    const reviews = await Review.find({ event: eventId })
      .populate("student", "name")
      .sort({ createdAt: -1 });

    const avg =
      reviews.length > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : 0;

    return res.json({
      success: true,
      count: reviews.length,
      averageRating: Math.round(avg * 10) / 10,
      reviews,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Toggle bookmark on an event
// @route   POST /api/events/:id/bookmark
// @access  Private (Student)
export const toggleBookmark = async (req, res) => {
  try {
    const { id: eventId } = req.params;
    const user = await User.findById(req.user._id);

    const idx = user.bookmarks.findIndex((b) => b.toString() === eventId);
    let bookmarked;

    if (idx === -1) {
      user.bookmarks.push(eventId);
      bookmarked = true;
    } else {
      user.bookmarks.splice(idx, 1);
      bookmarked = false;
    }

    await user.save();
    return res.json({ success: true, bookmarked, bookmarks: user.bookmarks });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get current user's bookmarked events
// @route   GET /api/events/my-bookmarks
// @access  Private (Student)
export const getMyBookmarks = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: "bookmarks",
      match: { isApproved: true },
      populate: { path: "organiser", select: "name email" },
    });

    return res.json({ success: true, bookmarks: user.bookmarks || [] });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
