
const Comment = require("../models/Comment");
const Ticket = require("../models/Ticket");
const Project = require("../models/Project");

// Add Comment
const addComment = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const { text } = req.body;

    if (!text || typeof text !== "string" || !text.trim()) {
      return res.status(400).json({
        message: "Comment text is required",
      });
    }

    const ticket = await Ticket.findById(ticketId);

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

    const isOwner =
      project.owner.toString() === req.user._id.toString();

    const isMember = project.teamMembers.some(
      (member) => member.toString() === req.user._id.toString()
    );

    if (!isOwner && !isMember) {
      return res.status(403).json({
        message: "You are not authorized to comment on this ticket",
      });
    }

    const comment = await Comment.create({
      ticketId,
      userId: req.user._id,
      text: text.trim(),
    });

    const populatedComment = await Comment.findById(comment._id)
      .populate("userId", "name email");

    return res.status(201).json({
      message: "Comment added successfully!",
      comment: populatedComment,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Failed to add comment",
    });
  }
};

// Get Comment History
const getComments = async (req, res) => {
  try {
    const { ticketId } = req.params;

    const ticket = await Ticket.findById(ticketId);

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

    const isOwner =
      project.owner.toString() === req.user._id.toString();

    const isMember = project.teamMembers.some(
      (member) => member.toString() === req.user._id.toString()
    );

    if (!isOwner && !isMember) {
      return res.status(403).json({
        message: "You are not authorized to view these comments",
      });
    }

    const comments = await Comment.find({ ticketId })
      .populate("userId", "name email")
      .sort({ timestamp: 1 });

    return res.status(200).json({
      count: comments.length,
      comments,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Failed to fetch comments",
    });
  }
};

module.exports = {
  addComment,
  getComments,
};
