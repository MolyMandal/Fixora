
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const projectRoutes = require("./routes/projectRoutes");
const ticketRoutes = require("./routes/ticketRoutes");
const { protect } = require("./middleware/authMiddleware");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Public API Routes
app.get("/", (req, res) => {
  res.send("Welcome to Fixora API!");
});

// Authentication Routes
app.use("/api/auth", authRoutes);

// Protected Test Route
app.get("/api/auth/protected", protect, (req, res) => {
  res.status(200).json({
    message: "Access granted! JWT authentication is working.",
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
    },
  });
});

// Project Routes
app.use("/api/projects", projectRoutes);

// Ticket Routes
app.use("/api/tickets", ticketRoutes);

// Server Configuration
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`Fixora server running on port ${PORT}`);
  });
};

startServer();
