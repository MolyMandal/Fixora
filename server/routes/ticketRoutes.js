
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

const {
  addComment,
  getComments,
} = require("../controllers/commentController");

// All ticket and comment routes require authentication
router.use(protect);

// Create ticket
router.post("/", createTicket);

// Get tickets belonging to a project
router.get("/project/:projectId", getTicketsByProject);

// Comment routes
router.post("/:ticketId/comments", addComment);
router.get("/:ticketId/comments", getComments);

// Update ticket
router.put("/:id", updateTicket);

// Delete ticket
router.delete("/:id", deleteTicket);

// Assign ticket
router.put("/:id/assign", assignTicket);

module.exports = router;
