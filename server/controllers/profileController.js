
const User = require("../models/User");

// UPDATE LOGGED-IN USER PROFILE
const updateProfile = async (req, res) => {
  try {
    const { name } = req.body;

    if (typeof name !== "string" || !name.trim()) {
      return res.status(400).json({
        message: "Please provide your name.",
      });
    }

    const trimmedName = name.trim();

    if (trimmedName.length < 2) {
      return res.status(400).json({
        message: "Name must contain at least 2 characters.",
      });
    }

    if (trimmedName.length > 50) {
      return res.status(400).json({
        message: "Name cannot exceed 50 characters.",
      });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name: trimmedName },
      {
        new: true,
        runValidators: true,
      }
    ).select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found.",
      });
    }

    return res.status(200).json({
      message: "Profile updated successfully!",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Profile Update Error:", error.message);

    return res.status(500).json({
      message: "Unable to update profile. Please try again.",
    });
  }
};

// CHANGE LOGGED-IN USER PASSWORD
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (
      typeof currentPassword !== "string" ||
      typeof newPassword !== "string" ||
      !currentPassword ||
      !newPassword
    ) {
      return res.status(400).json({
        message: "Please provide your current and new password.",
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        message: "New password must be at least 8 characters long.",
      });
    }

    if (newPassword.length > 128) {
      return res.status(400).json({
        message: "New password is too long.",
      });
    }

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        message: "User not found.",
      });
    }

    const isPasswordCorrect = await user.comparePassword(
      currentPassword
    );

    if (!isPasswordCorrect) {
      return res.status(401).json({
        message: "Your current password is incorrect.",
      });
    }

    const isSamePassword = await user.comparePassword(newPassword);

    if (isSamePassword) {
      return res.status(400).json({
        message: "Your new password must be different from your current password.",
      });
    }

    user.password = newPassword;

    // The User model's pre-save hook hashes the new password.
    await user.save();

    return res.status(200).json({
      message: "Password changed successfully!",
    });
  } catch (error) {
    console.error("Password Change Error:", error.message);

    return res.status(500).json({
      message: "Unable to change password. Please try again.",
    });
  }
};

module.exports = {
  updateProfile,
  changePassword,
};
