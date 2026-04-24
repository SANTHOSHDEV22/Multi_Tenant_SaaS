const mongoose = require("mongoose");
const Task = require("../models/Task");
const Project = require("../models/Project");

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
 * @route   POST /api/tasks
 * @access  Private
 */
const createTask = async (req, res) => {
  try {
    const { title, description, projectId } = req.body;

    if (!title || !projectId) {
      return res.status(400).json({
        message: "Title and projectId are required",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      return res.status(400).json({ message: "Invalid project ID" });
    }

    // 🔐 Ensure project belongs to same company
    const project = await Project.findOne({
      _id: projectId,
      companyId: req.user.companyId,
    });

    if (!project) {
      return res.status(404).json({
        message: "Project not found or not authorized",
      });
    }

    const task = await Task.create({
      title,
      description,
      projectId,
      companyId: req.user.companyId, // 🔥 GOLD RULE
      createdBy: req.user.id,
    });

    res.status(201).json(task);
  } catch (error) {
    console.error("Create Task Error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * @desc    Get Tasks (with pagination + filters)
 * @route   GET /api/tasks
 * @access  Private
 */
const getTasks = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 5,
      status,
      projectId,
    } = req.query;

    const query = {
      companyId: req.user.companyId, // 🔥 GOLD RULE
    };

    if (status) query.status = status;

    if (projectId) {
      if (!mongoose.Types.ObjectId.isValid(projectId)) {
        return res.status(400).json({ message: "Invalid project ID" });
      }
      query.projectId = projectId;
    }

    const skip = (page - 1) * limit;

    const tasks = await Task.find(query)
      .populate("createdBy", "name email")
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
 * @desc    Update Task
 * @route   PUT /api/tasks/:id
 * @access  Private
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

    // 🔐 RBAC + Ownership
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
 * @desc    Delete Task
 * @route   DELETE /api/tasks/:id
 * @access  Private
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

    // 🔐 RBAC + Ownership
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
};