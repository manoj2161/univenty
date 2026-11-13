import mongoose from "mongoose";

const eventSchema = new mongoose.Schema(
  {
    organiser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: [true, "Event name is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Event description is required"],
    },
    eventDate: {
      type: Date,
      required: [true, "Event date is required"],
    },
    eventTime: {
      type: String,
      required: [true, "Event time is required"],
    },
    eventLocation: {
      type: String,
      required: [true, "Event location is required"],
    },
    totalSeats: {
      type: Number,
      required: [true, "Total seats is required"],
      min: 1,
    },
    bookedSeats: {
      type: Number,
      default: 0,
      min: 0,
    },
    category: {
      type: String,
      default: "Technical",
    },
    departments: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending",
    },
    isApproved: {
      type: Boolean,
      default: false,
    },
    imageUrl: {
      type: String,
      default: "",
    },
    // Feature 4: Team registration support
    isTeamEvent: {
      type: Boolean,
      default: false,
    },
    teamSize: {
      min: { type: Number, default: 2 },
      max: { type: Number, default: 5 },
    },
    // Feature 4: Custom registration form fields
    customFields: [
      {
        label: { type: String, required: true },
        type: {
          type: String,
          enum: ["text", "textarea", "select", "checkbox"],
          default: "text",
        },
        options: [String], // For select fields
        required: { type: Boolean, default: false },
      },
    ],
    // Feature 4: Waitlist support
    hasWaitlist: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

eventSchema.virtual("remainingSeats").get(function () {
  return Math.max(0, (this.totalSeats || 0) - (this.bookedSeats || 0));
});

const Event = mongoose.model("Event", eventSchema);
export default Event;
