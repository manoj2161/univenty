import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 8,
      select: false,
    },

    category: {
      type: String,
      enum: ["Student", "Organiser", "Admin"],
      default: "Student",
    },

    isAdmin: {
      type: Boolean,
      default: false,
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    accountStatus: {
      type: String,
      enum: ["Active", "Blocked"],
      default: "Active",
    },

    blockedAt: {
      type: Date,
      default: null,
    },

    blockedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    blockReason: {
      type: String,
      default: "",
    },

    authToken: {
      type: String,
      default: null,
      select: false,
    },

    refreshTokenHash: {
      type: String,
      default: null,
      select: false,
    },

    tokenVersion: {
      type: Number,
      default: 0,
    },

    // Profile information
    phone: {
      type: String,
      default: "",
    },

    department: {
      type: String,
      default: "",
    },

    rollNumber: {
      type: String,
      default: "",
    },

    bio: {
      type: String,
      default: "",
    },

    // Profile picture
    profilePicture: {
      type: String,
      default: "",
    },

    profilePicturePublicId: {
      type: String,
      default: "",
    },

    // Bookmarked events
    bookmarks: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Event",
      },
    ],
  },
  {
    timestamps: true,
  },
);

// Ensure Admin role has isAdmin true
userSchema.pre("save", function (next) {
  if (this.category === "Admin") {
    this.isAdmin = true;
  } else {
    this.isAdmin = false;
  }

  next();
});

const User = mongoose.model("User", userSchema);

export default User;
