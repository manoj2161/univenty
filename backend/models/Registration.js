import mongoose from "mongoose";

const registrationSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },
    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected", "Cancelled", "Waitlisted"],
      default: "Pending",
    },
    registeredAt: {
      type: Date,
      default: Date.now,
    },
    reviewedAt: {
      type: Date,
      default: null,
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    notes: {
      type: String,
      default: "",
    },
    // Feature 1: QR code & check-in
    qrToken: {
      type: String,
      default: "",
    },
    checkedIn: {
      type: Boolean,
      default: false,
    },
    checkedInAt: {
      type: Date,
      default: null,
    },
    // Feature 4: Custom form answers & waitlist
    customAnswers: {
      type: Map,
      of: String,
      default: {},
    },
    waitlistPosition: {
      type: Number,
      default: null,
    },
    // Feature 5: Certificate issued flag
    certificateIssued: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate student registrations for the same event
registrationSchema.index({ student: 1, event: 1 }, { unique: true });

const Registration = mongoose.model("Registration", registrationSchema);
export default Registration;
