import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];

      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET
      );

      const user = await User.findById(decoded.id).select("-password");

      if (!user) {
        return res.status(401).json({
          success: false,
          message: "User not found or session invalid",
        });
      }

      // Check account status
      if (user.accountStatus === "Blocked") {
        return res.status(403).json({
          success: false,
          message:
            "Your account has been blocked. Please contact the administrator.",
          reason: user.blockReason,
        });
      }

      // Check token version if provided in token
      if (
        decoded.tokenVersion !== undefined &&
        decoded.tokenVersion !== user.tokenVersion
      ) {
        return res.status(401).json({
          success: false,
          message: "Session expired. Please log in again.",
        });
      }

      req.user = user;
      next();
    } catch (error) {
      console.error("Auth middleware error:", error.message);
      return res.status(401).json({
        success: false,
        message: "Not authorized, token failed or expired",
      });
    }
  } else {
    return res.status(401).json({
      success: false,
      message: "Not authorized, no token provided",
    });
  }
};

export const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    if (!roles.includes(req.user.category)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Role ${req.user.category} is not authorized for this resource.`,
      });
    }

    next();
  };
};
