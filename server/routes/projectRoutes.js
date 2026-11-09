
const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");

const {
  createProject,
  getProjects,
  updateProject,
  deleteProject,
  addTeamMember,
  removeTeamMember,
} = require("../controllers/projectController");

// All project routes require authentication
router.use(protect);

// Project CRUD
router.post("/", createProject);
router.get("/", getProjects);
router.put("/:id", updateProject);
router.delete("/:id", deleteProject);

// Team member management
router.post("/:id/members", addTeamMember);
router.delete("/:id/members", removeTeamMember);

module.exports = router;
