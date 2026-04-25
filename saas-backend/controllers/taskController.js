const mongoose = require("mongoose");
const Task = require("../models/Task");
const Project = require("../models/Project");
const User = require("../models/User");

/**
 * 🔐 Helper: Check permission (Owner OR Admin)
 */
const canModify = (user, task) => {
  return (
    user.role === "admin" ||
    task.createdBy.toString() === user.id
  );
};

/**
 * @desc    Create Task
 */
const createTask = async (req, res) => {
  try {
    const { title, description, projectId, assignedTo } = req.body;

    if (!title || !projectId) {
      return res.status(400).json({
        message: "Title and projectId are required",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      return res.status(400).json({ message: "Invalid project ID" });
    }

    // 🔐 Check project belongs to company
    const project = await Project.findOne({
      _id: projectId,
      companyId: req.user.companyId,
    });

    if (!project) {
      return res.status(404).json({
        message: "Project not found or not authorized",
      });
    }

    // 🔐 Validate assigned user (if provided)
    let assignedUser = null;
    if (assignedTo) {
      assignedUser = await User.findOne({
        _id: assignedTo,
        companyId: req.user.companyId,
      });

      if (!assignedUser) {
        return res.status(404).json({
          message: "Assigned user not found in your company",
        });
      }
    }

    const task = await Task.create({
      title,
      description,
      projectId,
      companyId: req.user.companyId,
      createdBy: req.user.id,
      assignedTo: assignedUser ? assignedUser._id : req.user.id, // default self
    });

    const populatedTask = await Task.findById(task._id)
      .populate("createdBy", "name email")
      .populate("assignedTo", "name email");

    res.status(201).json(populatedTask);
  } catch (error) {
    console.error("Create Task Error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * @desc    Get Tasks
 */
const getTasks = async (req, res) => {
  try {
    const { page = 1, limit = 5, status, projectId, assignedTo } = req.query;

    const query = {
      companyId: req.user.companyId,
    };

    if (status) query.status = status;
    if (projectId && mongoose.Types.ObjectId.isValid(projectId)) {
      query.projectId = new mongoose.Types.ObjectId(projectId);
    }
    if (assignedTo && mongoose.Types.ObjectId.isValid(assignedTo)) {
      query.assignedTo = new mongoose.Types.ObjectId(assignedTo);
    }

    const skip = (page - 1) * limit;

    const tasks = await Task.find(query)
      .populate("createdBy", "name email")
      .populate("assignedTo", "name email")
      .populate("projectId", "name")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Task.countDocuments(query);

    res.json({
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
      tasks,
    });
  } catch (error) {
    console.error("Get Tasks Error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * @desc    Update Task (basic fields)
 */
const updateTask = async (req, res) => {
  try {
    const { title, description, status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid task ID" });
    }

    const task = await Task.findOne({
      _id: req.params.id,
      companyId: req.user.companyId,
    });

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    if (!canModify(req.user, task)) {
      return res.status(403).json({ message: "Not authorized" });
    }

    task.title = title ?? task.title;
    task.description = description ?? task.description;
    task.status = status ?? task.status;

    const updatedTask = await task.save();

    res.json(updatedTask);
  } catch (error) {
    console.error("Update Task Error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * 🚀 NEW: Assign Task
 * @route   PUT /api/tasks/:id/assign
 */
const assignTask = async (req, res) => {
  try {
    const { assignedTo } = req.body;

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid task ID" });
    }

    if (!mongoose.Types.ObjectId.isValid(assignedTo)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const task = await Task.findOne({
      _id: req.params.id,
      companyId: req.user.companyId,
    });

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // 🔐 Check assigned user belongs to same company
    const user = await User.findOne({
      _id: assignedTo,
      companyId: req.user.companyId,
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found in your company",
      });
    }

    // 🔐 RBAC
    if (!canModify(req.user, task)) {
      return res.status(403).json({ message: "Not authorized" });
    }

    task.assignedTo = assignedTo;
    await task.save();

    const updatedTask = await Task.findById(task._id)
      .populate("assignedTo", "name email");

    res.json(updatedTask);
  } catch (error) {
    console.error("Assign Task Error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * @desc    Delete Task
 */
const deleteTask = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid task ID" });
    }

    const task = await Task.findOne({
      _id: req.params.id,
      companyId: req.user.companyId,
    });

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    if (!canModify(req.user, task)) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await task.deleteOne();

    res.json({ message: "Task deleted successfully" });
  } catch (error) {
    console.error("Delete Task Error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  createTask,
  getTasks,
  updateTask,
  deleteTask,
  assignTask, // 🔥 NEW EXPORT
};