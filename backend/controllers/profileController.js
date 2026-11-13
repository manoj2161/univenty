import User from "../models/User.js";
import cloudinary from "../config/cloudinary.js";

// @desc    Get user profile
// @route   GET /api/profile
// @access  Private
export const getProfile = async (req, res) => {
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
      user,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch profile",
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/profile
// @access  Private
export const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const { name, phone, department, rollNumber, bio } = req.body;

    if (name !== undefined) user.name = name.trim();
    if (phone !== undefined) user.phone = phone;
    if (department !== undefined) user.department = department;
    if (rollNumber !== undefined) user.rollNumber = rollNumber;
    if (bio !== undefined) user.bio = bio;

    await user.save();

    return res.json({
      success: true,
      message: "Profile updated successfully",
      user: getSafeUser(user),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to update profile",
    });
  }
};

// @desc    Upload or replace profile picture
// @route   PUT /api/profile/picture
// @access  Private
export const uploadProfilePicture = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please select an image",
      });
    }

    // Remove previous Cloudinary image if available
    if (user.profilePicturePublicId) {
      try {
        await cloudinary.uploader.destroy(user.profilePicturePublicId);
      } catch (deleteError) {
        console.error(
          "Previous profile picture deletion failed:",
          deleteError.message,
        );
      }
    }

    // Upload new image to Cloudinary
    const uploadedImage = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: "univenty/profile-pictures",
          resource_type: "image",
          transformation: [
            {
              width: 600,
              height: 600,
              crop: "fill",
              gravity: "face",
              quality: "auto",
              fetch_format: "auto",
            },
          ],
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        },
      );

      uploadStream.end(req.file.buffer);
    });

    user.profilePicture = uploadedImage.secure_url;
    user.profilePicturePublicId = uploadedImage.public_id;

    await user.save();

    return res.json({
      success: true,
      message: "Profile picture updated successfully",
      user: getSafeUser(user),
    });
  } catch (error) {
    console.error("Profile picture upload error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to upload profile picture",
    });
  }
};

// @desc    Remove profile picture
// @route   DELETE /api/profile/picture
// @access  Private
export const removeProfilePicture = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.profilePicturePublicId) {
      try {
        await cloudinary.uploader.destroy(user.profilePicturePublicId);
      } catch (deleteError) {
        console.error("Cloudinary deletion error:", deleteError.message);

        return res.status(500).json({
          success: false,
          message: "Unable to remove profile picture from storage",
        });
      }
    }

    user.profilePicture = "";
    user.profilePicturePublicId = "";

    await user.save();

    return res.json({
      success: true,
      message: "Profile picture removed successfully",
      user: getSafeUser(user),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to remove profile picture",
    });
  }
};

// Safe user response
const getSafeUser = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  category: user.category,
  isAdmin: user.isAdmin,
  isVerified: user.isVerified,
  accountStatus: user.accountStatus,
  phone: user.phone,
  department: user.department,
  rollNumber: user.rollNumber,
  bio: user.bio,
  profilePicture: user.profilePicture,
  createdAt: user.createdAt,
});
