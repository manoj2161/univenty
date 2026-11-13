import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      category: user.category,
      isAdmin: user.isAdmin,
      tokenVersion: user.tokenVersion || 0,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "30d",
    },
  );
};

const getSafeUser = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  category: user.category,
  isAdmin: user.isAdmin,
  isVerified: user.isVerified,
  accountStatus: user.accountStatus,
  department: user.department,
  rollNumber: user.rollNumber,
  phone: user.phone,
  bio: user.bio,
  profilePicture: user.profilePicture || "",
});

// @desc Register a new Student or Organiser
// @route POST /api/auth/register
// @access Public
export const register = async (req, res) => {
  try {
    const { name, email, password, category, department, rollNumber, phone } =
      req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide name, email, and password",
      });
    }

    if (category === "Admin") {
      return res.status(403).json({
        success: false,
        message: "Admin accounts cannot be registered publicly.",
      });
    }

    const assignedCategory = category === "Organiser" ? "Organiser" : "Student";

    const userExists = await User.findOne({
      email: email.toLowerCase().trim(),
    });

    if (userExists) {
      return res.status(400).json({
        success: false,
        message: "A user with this email already exists",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      category: assignedCategory,
      isAdmin: false,
      department: department || "",
      rollNumber: rollNumber || "",
      phone: phone || "",
      accountStatus: "Active",
    });

    return res.status(201).json({
      success: true,
      message: "Registration successful! Please log in.",
      user: getSafeUser(user),
    });
  } catch (error) {
    console.error("Register Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Registration failed",
    });
  }
};

// @desc Authenticate user and get token
// @route POST /api/auth/login
// @access Public
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and password",
      });
    }

    const user = await User.findOne({
      email: email.toLowerCase().trim(),
    }).select("+password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    if (user.accountStatus === "Blocked") {
      return res.status(403).json({
        success: false,
        message:
          "Your account has been blocked. Please contact the administrator.",
        reason: user.blockReason,
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const token = generateToken(user);

    return res.json({
      success: true,
      token,
      user: getSafeUser(user),
    });
  } catch (error) {
    console.error("Login Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Login failed",
    });
  }
};

// @desc Get current logged-in user
// @route GET /api/auth/me
// @access Private
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.json({
      success: true,
      user: getSafeUser(user),
    });
  } catch (error) {
    console.error("GetMe Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch user profile",
    });
  }
};
