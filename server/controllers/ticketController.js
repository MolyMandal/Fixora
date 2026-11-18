
const Ticket = require("../models/Ticket");
const Project = require("../models/Project");
const User = require("../models/User");

// Check whether a user belongs to a project
const isProjectMember = (project, userId) => {
  const userIdString = String(userId);

  const isOwner = String(project.owner) === userIdString;

  const isMember = project.teamMembers.some(
    (member) => String(member) === userIdString
  );

  return isOwner || isMember;
};

// Check whether a user can be assigned to a project ticket
const isAssignableMember = (project, userId) => {
  return (
    String(project.owner) === String(userId) ||
    project.teamMembers.some(
      (member) => String(member) === String(userId)
    )
  );
};

// ========================================
// CREATE TICKET
// ========================================

const createTicket = async (req, res) => {
  try {
    const { title, description, priority, status, assignee, projectId } =
      req.body;

    if (!title || typeof title !== "string" || !title.trim()) {
      return res.status(400).json({
        message: "Ticket title is required",
      });
    }

    if (title.trim().length < 2) {
      return res.status(400).json({
        message: "Ticket title must be at least 2 characters",
      });
    }

    if (!projectId) {
      return res.status(400).json({
        message: "Project ID is required",
      });
    }

    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    if (!isProjectMember(project, req.user._id)) {
      return res.status(403).json({
        message: "You are not authorized to create tickets in this project",
      });
    }

    if (assignee) {
      if (!isAssignableMember(project, assignee)) {
        return res.status(400).json({
          message: "Assignee must belong to this project",
        });
      }

      const assignedUser = await User.findById(assignee);

      if (!assignedUser) {
        return res.status(404).json({
          message: "Assignee not found",
        });
      }
    }

    const ticket = await Ticket.create({
      title: title.trim(),
      description: description || "",
      priority: priority || "Medium",
      status: status || "To Do",
      assignee: assignee || null,
      projectId,
    });

    const populatedTicket = await Ticket.findById(ticket._id)
      .populate("assignee", "name email")
      .populate("projectId", "title");

    return res.status(201).json({
      message: "Ticket created successfully",
      ticket: populatedTicket,
    });
  } catch (error) {
    console.error("Create ticket error:", error);

    return res.status(500).json({
      message: "Server error while creating ticket",
    });
  }
};

// ========================================
// GET TICKETS BY PROJECT
// DAY 10 - SEARCH AND FILTERS
// ========================================

const getTicketsByProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { status, priority, assignee, search } = req.query;

    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    if (!isProjectMember(project, req.user._id)) {
      return res.status(403).json({
        message: "You are not authorized to view these tickets",
      });
    }

    const allowedStatuses = ["To Do", "In Progress", "Done"];
    const allowedPriorities = ["Low", "Medium", "High"];

    const query = {
      projectId,
    };

    // Filter by status
    if (status) {
      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({
          message: "Invalid ticket status",
        });
      }

      query.status = status;
    }

    // Filter by priority
    if (priority) {
      if (!allowedPriorities.includes(priority)) {
        return res.status(400).json({
          message: "Invalid ticket priority",
        });
      }

      query.priority = priority;
    }

    // Filter by assignee
    if (assignee === "unassigned") {
      query.assignee = null;
    } else if (assignee) {
      if (!/^[0-9a-fA-F]{24}$/.test(assignee)) {
        return res.status(400).json({
          message: "Invalid assignee ID",
        });
      }

      query.assignee = assignee;
    }

    // Search by ticket title or description
    if (search && search.trim()) {
      const escapedSearch = search.trim().replace(
        /[.*+?^${}()|[\]\\]/g,
        "\\$&"
      );

      query.$or = [
        {
          title: {
            $regex: escapedSearch,
            $options: "i",
          },
        },
        {
          description: {
            $regex: escapedSearch,
            $options: "i",
          },
        },
      ];
    }

    const tickets = await Ticket.find(query)
      .populate("assignee", "name email")
      .populate("projectId", "title")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      count: tickets.length,
      tickets,
    });
  } catch (error) {
    console.error("Get tickets error:", error);

    return res.status(500).json({
      message: "Server error while fetching tickets",
    });
  }
};

// ========================================
// UPDATE TICKET
// ========================================

const updateTicket = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, priority, status, assignee } = req.body;

    const ticket = await Ticket.findById(id);

    if (!ticket) {
      return res.status(404).json({
        message: "Ticket not found",
      });
    }

    const project = await Project.findById(ticket.projectId);

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    if (!isProjectMember(project, req.user._id)) {
      return res.status(403).json({
        message: "You are not authorized to update this ticket",
      });
    }

    if (title !== undefined) {
      if (typeof title !== "string" || title.trim().length < 2) {
        return res.status(400).json({
          message: "Ticket title must be at least 2 characters",
        });
      }

      if (title.trim().length > 100) {
        return res.status(400).json({
          message: "Ticket title cannot exceed 100 characters",
        });
      }

      ticket.title = title.trim();
    }

    if (description !== undefined) {
      if (typeof description !== "string") {
        return res.status(400).json({
          message: "Invalid ticket description",
        });
      }

      ticket.description = description.trim();
    }

    if (priority !== undefined) {
      if (!["Low", "Medium", "High"].includes(priority)) {
        return res.status(400).json({
          message: "Invalid ticket priority",
        });
      }

      ticket.priority = priority;
    }

    if (status !== undefined) {
      if (!["To Do", "In Progress", "Done"].includes(status)) {
        return res.status(400).json({
          message: "Invalid ticket status",
        });
      }

      ticket.status = status;
    }

    if (assignee !== undefined) {
      if (assignee === null || assignee === "") {
        ticket.assignee = null;
      } else {
        if (!/^[0-9a-fA-F]{24}$/.test(assignee)) {
          return res.status(400).json({
            message: "Invalid assignee ID",
          });
        }

        if (!isAssignableMember(project, assignee)) {
          return res.status(400).json({
            message: "Assignee must belong to this project",
          });
        }

        const assignedUser = await User.findById(assignee);

        if (!assignedUser) {
          return res.status(404).json({
            message: "Assignee not found",
          });
        }

        ticket.assignee = assignee;
      }
    }

    await ticket.save();

    const updatedTicket = await Ticket.findById(ticket._id)
      .populate("assignee", "name email")
      .populate("projectId", "title");

    return res.status(200).json({
      message: "Ticket updated successfully",
      ticket: updatedTicket,
    });
  } catch (error) {
    console.error("Update ticket error:", error);

    return res.status(500).json({
      message: "Server error while updating ticket",
    });
  }
};

// ========================================
// DELETE TICKET
// ========================================

const deleteTicket = async (req, res) => {
  try {
    const { id } = req.params;

    const ticket = await Ticket.findById(id);

    if (!ticket) {
      return res.status(404).json({
        message: "Ticket not found",
      });
    }

    const project = await Project.findById(ticket.projectId);

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    // Only the project owner can delete tickets
    if (String(project.owner) !== String(req.user._id)) {
      return res.status(403).json({
        message: "Only the project owner can delete tickets",
      });
    }

    await Ticket.findByIdAndDelete(id);

    return res.status(200).json({
      message: "Ticket deleted successfully",
    });
  } catch (error) {
    console.error("Delete ticket error:", error);

    return res.status(500).json({
      message: "Server error while deleting ticket",
    });
  }
};

// ========================================
// ASSIGN TICKET
// ========================================

const assignTicket = async (req, res) => {
  try {
    const { id } = req.params;
    const { assignee } = req.body;

    if (!assignee || !/^[0-9a-fA-F]{24}$/.test(assignee)) {
      return res.status(400).json({
        message: "A valid assignee ID is required",
      });
    }

    const ticket = await Ticket.findById(id);

    if (!ticket) {
      return res.status(404).json({
        message: "Ticket not found",
      });
    }

    const project = await Project.findById(ticket.projectId);

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    if (!isProjectMember(project, req.user._id)) {
      return res.status(403).json({
        message: "You are not authorized to assign this ticket",
      });
    }

    if (!isAssignableMember(project, assignee)) {
      return res.status(400).json({
        message: "Assignee must belong to this project",
      });
    }

    const assignedUser = await User.findById(assignee);

    if (!assignedUser) {
      return res.status(404).json({
        message: "Assignee not found",
      });
    }

    ticket.assignee = assignee;
    await ticket.save();

    const updatedTicket = await Ticket.findById(ticket._id)
      .populate("assignee", "name email")
      .populate("projectId", "title");

    return res.status(200).json({
      message: "Ticket assigned successfully",
      ticket: updatedTicket,
    });
  } catch (error) {
    console.error("Assign ticket error:", error);

    return res.status(500).json({
      message: "Server error while assigning ticket",
    });
  }
};

// ========================================
// EXPORT CONTROLLERS
// ========================================

module.exports = {
  createTicket,
  getTicketsByProject,
  updateTicket,
  deleteTicket,
  assignTicket,
};
