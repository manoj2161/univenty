import mongoose from "mongoose";

const adminLogSchema = new mongoose.Schema(
  {
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    action: {
      type: String,
      required: true,
      enum: [
        "USER_BLOCKED",
        "USER_UNBLOCKED",
        "USER_UPDATED",
        "EVENT_APPROVED",
        "EVENT_REJECTED",
        "EVENT_UPDATED",
        "EVENT_DELETED",
        "REGISTRATION_APPROVED",
        "REGISTRATION_REJECTED",
        "REGISTRATION_CANCELLED",
      ],
    },
    targetType: {
      type: String,
      enum: ["User", "Event", "Registration", "System"],
      default: "System",
    },
    targetId: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    description: {
      type: String,
      required: true,
    },
    previousData: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    newData: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    reason: {
      type: String,
      default: "",
    },
    ipAddress: {
      type: String,
      default: "",
    },
    userAgent: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

const AdminLog = mongoose.model("AdminLog", adminLogSchema);
export default AdminLog;
