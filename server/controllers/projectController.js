
const Project = require("../models/Project");
const User = require("../models/User");

// CREATE PROJECT
const createProject = async (req, res) => {
  try {
    const { title, description } = req.body;

    if (
      typeof title !== "string" ||
      title.trim().length < 2
    ) {
      return res.status(400).json({
        message: "Project title must be at least 2 characters long",
      });
    }

    const project = await Project.create({
      title: title.trim(),
      description: description || "",
      owner: req.user._id,
      teamMembers: [],
    });

    return res.status(201).json({
      message: "Project created successfully!",
      project,
    });
  } catch (error) {
    console.error("Create Project Error:", error.message);
    return res.status(500).json({
      message: "Failed to create project",
    });
  }
};

// GET ALL USER PROJECTS
const getProjects = async (req, res) => {
  try {
    const projects = await Project.find({
      $or: [
        { owner: req.user._id },
        { teamMembers: req.user._id },
      ],
    })
      .populate("owner", "name email")
      .populate("teamMembers", "name email")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      count: projects.length,
      projects,
    });
  } catch (error) {
    console.error("Get Projects Error:", error.message);
    return res.status(500).json({
      message: "Failed to fetch projects",
    });
  }
};

// UPDATE PROJECT
const updateProject = async (req, res) => {
  try {
    const { title, description } = req.body;

    const project = await Project.findOne({
      _id: req.params.id,
      owner: req.user._id,
    });

    if (!project) {
      return res.status(404).json({
        message: "Project not found or access denied",
      });
    }

    if (title !== undefined) {
      if (typeof title !== "string" || title.trim().length < 2) {
        return res.status(400).json({
          message: "Project title must be at least 2 characters long",
        });
      }

      project.title = title.trim();
    }

    if (description !== undefined) {
      if (typeof description !== "string") {
        return res.status(400).json({
          message: "Description must be a string",
        });
      }

      project.description = description.trim();
    }

    await project.save();

    return res.status(200).json({
      message: "Project updated successfully!",
      project,
    });
  } catch (error) {
    console.error("Update Project Error:", error.message);
    return res.status(500).json({
      message: "Failed to update project",
    });
  }
};

// DELETE PROJECT
const deleteProject = async (req, res) => {
  try {
    const project = await Project.findOneAndDelete({
      _id: req.params.id,
      owner: req.user._id,
    });

    if (!project) {
      return res.status(404).json({
        message: "Project not found or access denied",
      });
    }

    return res.status(200).json({
      message: "Project deleted successfully!",
    });
  } catch (error) {
    console.error("Delete Project Error:", error.message);
    return res.status(500).json({
      message: "Failed to delete project",
    });
  }
};

// ADD TEAM MEMBER
const addTeamMember = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || typeof email !== "string") {
      return res.status(400).json({
        message: "Please provide a valid member email",
      });
    }

    const project = await Project.findOne({
      _id: req.params.id,
      owner: req.user._id,
    });

    if (!project) {
      return res.status(404).json({
        message: "Project not found or access denied",
      });
    }

    const member = await User.findOne({
      email: email.trim().toLowerCase(),
    });

    if (!member) {
      return res.status(404).json({
        message: "No registered user found with this email",
      });
    }

    if (member._id.equals(project.owner)) {
      return res.status(400).json({
        message: "Project owner is already part of the project",
      });
    }

    if (project.teamMembers.some((id) => id.equals(member._id))) {
      return res.status(409).json({
        message: "This user is already a team member",
      });
    }

    project.teamMembers.push(member._id);
    await project.save();

    await project.populate("owner", "name email");
    await project.populate("teamMembers", "name email");

    return res.status(200).json({
      message: "Team member added successfully!",
      project,
    });
  } catch (error) {
    console.error("Add Team Member Error:", error.message);
    return res.status(500).json({
      message: "Failed to add team member",
    });
  }
};

// REMOVE TEAM MEMBER
const removeTeamMember = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || typeof email !== "string") {
      return res.status(400).json({
        message: "Please provide a valid member email",
      });
    }

    const project = await Project.findOne({
      _id: req.params.id,
      owner: req.user._id,
    });

    if (!project) {
      return res.status(404).json({
        message: "Project not found or access denied",
      });
    }

    const member = await User.findOne({
      email: email.trim().toLowerCase(),
    });

    if (!member) {
      return res.status(404).json({
        message: "No registered user found with this email",
      });
    }

    const memberExists = project.teamMembers.some((id) =>
      id.equals(member._id)
    );

    if (!memberExists) {
      return res.status(404).json({
        message: "This user is not a member of the project",
      });
    }

    project.teamMembers = project.teamMembers.filter(
      (id) => !id.equals(member._id)
    );

    await project.save();

    await project.populate("owner", "name email");
    await project.populate("teamMembers", "name email");

    return res.status(200).json({
      message: "Team member removed successfully!",
      project,
    });
  } catch (error) {
    console.error("Remove Team Member Error:", error.message);
    return res.status(500).json({
      message: "Failed to remove team member",
    });
  }
};

module.exports = {
  createProject,
  getProjects,
  updateProject,
  deleteProject,
  addTeamMember,
  removeTeamMember,
};
