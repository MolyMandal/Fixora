
const express = require("express");
const router = express.Router();

const {
  registerUser,
  loginUser,
} = require("../controllers/authController");

const {
  updateProfile,
  changePassword,
} = require("../controllers/profileController");

const { protect } = require("../middleware/authMiddleware");

// Public authentication routes
router.post("/register", registerUser);
router.post("/login", loginUser);

// Protected profile routes
router.put("/profile", protect, updateProfile);
router.put("/change-password", protect, changePassword);

module.exports = router;
