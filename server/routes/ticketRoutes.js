
const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");

const {
  createTicket,
  getTicketsByProject,
  updateTicket,
  deleteTicket,
  assignTicket,
} = require("../controllers/ticketController");

// All ticket routes require authentication
router.use(protect);

// Create ticket
router.post("/", createTicket);

// Get tickets belonging to a project
router.get("/project/:projectId", getTicketsByProject);

// Update ticket
router.put("/:id", updateTicket);

// Delete ticket
router.delete("/:id", deleteTicket);

// Assign ticket
router.put("/:id/assign", assignTicket);

module.exports = router;
