
const Ticket = require("../models/Ticket");
const Project = require("../models/Project");
const User = require("../models/User");

// Create Ticket
const createTicket = async (req, res) => {
  try {
    const { title, description, priority, status, assignee, projectId } =
      req.body;

    if (!title || !projectId) {
      return res.status(400).json({
        message: "Ticket title and project ID are required",
      });
    }

    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    const isOwner = project.owner.toString() === req.user._id.toString();

    const isMember = project.teamMembers.some(
      (member) => member.toString() === req.user._id.toString()
    );

    if (!isOwner && !isMember) {
      return res.status(403).json({
        message: "You are not authorized to create tickets for this project",
      });
    }

    if (assignee) {
      const isProjectMember =
        project.owner.toString() === assignee ||
        project.teamMembers.some(
          (member) => member.toString() === assignee
        );

      if (!isProjectMember) {
        return res.status(400).json({
          message: "Assignee must belong to this project",
        });
      }

      const userExists = await User.findById(assignee);

      if (!userExists) {
        return res.status(404).json({
          message: "Assigned user not found",
        });
      }
    }

    const ticket = await Ticket.create({
      title,
      description,
      priority,
      status,
      assignee: assignee || null,
      projectId,
    });

    const populatedTicket = await Ticket.findById(ticket._id)
      .populate("assignee", "name email")
      .populate("projectId", "title");

    return res.status(201).json({
      message: "Ticket created successfully!",
      ticket: populatedTicket,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Failed to create ticket",
    });
  }
};

// Get Tickets by Project
const getTicketsByProject = async (req, res) => {
  try {
    const { projectId } = req.params;

    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    const isOwner = project.owner.toString() === req.user._id.toString();

    const isMember = project.teamMembers.some(
      (member) => member.toString() === req.user._id.toString()
    );

    if (!isOwner && !isMember) {
      return res.status(403).json({
        message: "You are not authorized to view these tickets",
      });
    }

    const tickets = await Ticket.find({ projectId })
      .populate("assignee", "name email")
      .populate("projectId", "title")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      count: tickets.length,
      tickets,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Failed to fetch tickets",
    });
  }
};

// Update Ticket
const updateTicket = async (req, res) => {
  try {
    const { title, description, priority, status, assignee } = req.body;

    const ticket = await Ticket.findById(req.params.id);

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

    const isOwner = project.owner.toString() === req.user._id.toString();

    const isMember = project.teamMembers.some(
      (member) => member.toString() === req.user._id.toString()
    );

    if (!isOwner && !isMember) {
      return res.status(403).json({
        message: "You are not authorized to update this ticket",
      });
    }

    if (assignee !== undefined && assignee !== null && assignee !== "") {
      const isProjectMember =
        project.owner.toString() === assignee ||
        project.teamMembers.some(
          (member) => member.toString() === assignee
        );

      if (!isProjectMember) {
        return res.status(400).json({
          message: "Assignee must belong to this project",
        });
      }

      const userExists = await User.findById(assignee);

      if (!userExists) {
        return res.status(404).json({
          message: "Assigned user not found",
        });
      }

      ticket.assignee = assignee;
    } else if (assignee === null || assignee === "") {
      ticket.assignee = null;
    }

    if (title !== undefined) ticket.title = title;
    if (description !== undefined) ticket.description = description;
    if (priority !== undefined) ticket.priority = priority;
    if (status !== undefined) ticket.status = status;

    await ticket.save();

    const updatedTicket = await Ticket.findById(ticket._id)
      .populate("assignee", "name email")
      .populate("projectId", "title");

    return res.status(200).json({
      message: "Ticket updated successfully!",
      ticket: updatedTicket,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Failed to update ticket",
    });
  }
};

// Delete Ticket
const deleteTicket = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);

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

    const isOwner = project.owner.toString() === req.user._id.toString();

    if (!isOwner) {
      return res.status(403).json({
        message: "Only the project owner can delete tickets",
      });
    }

    await Ticket.findByIdAndDelete(req.params.id);

    return res.status(200).json({
      message: "Ticket deleted successfully!",
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Failed to delete ticket",
    });
  }
};

// Assign Ticket
const assignTicket = async (req, res) => {
  try {
    const { assignee } = req.body;

    if (!assignee) {
      return res.status(400).json({
        message: "Assignee user ID is required",
      });
    }

    const ticket = await Ticket.findById(req.params.id);

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

    const isOwner = project.owner.toString() === req.user._id.toString();

    const isMember = project.teamMembers.some(
      (member) => member.toString() === req.user._id.toString()
    );

    if (!isOwner && !isMember) {
      return res.status(403).json({
        message: "You are not authorized to assign this ticket",
      });
    }

    const isProjectMember =
      project.owner.toString() === assignee ||
      project.teamMembers.some(
        (member) => member.toString() === assignee
      );

    if (!isProjectMember) {
      return res.status(400).json({
        message: "Assignee must belong to this project",
      });
    }

    const userExists = await User.findById(assignee);

    if (!userExists) {
      return res.status(404).json({
        message: "Assigned user not found",
      });
    }

    ticket.assignee = assignee;
    await ticket.save();

    const updatedTicket = await Ticket.findById(ticket._id)
      .populate("assignee", "name email")
      .populate("projectId", "title");

    return res.status(200).json({
      message: "Ticket assigned successfully!",
      ticket: updatedTicket,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Failed to assign ticket",
    });
  }
};

module.exports = {
  createTicket,
  getTicketsByProject,
  updateTicket,
  deleteTicket,
  assignTicket,
};
