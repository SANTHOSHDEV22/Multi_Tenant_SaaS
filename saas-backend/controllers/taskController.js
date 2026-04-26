const mongoose = require("mongoose");
const Task = require("../models/Task");
const Project = require("../models/Project");
const User = require("../models/User");

/**
 * 🔐 Permission Check
 */
const canModify = (user, task) => {
  return (
    user.role === "admin" ||
    task.createdBy.toString() === user.id
  );
};

/**
 * ➕ CREATE TASK
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

    const project = await Project.findOne({
      _id: projectId,
      companyId: req.user.companyId,
    });

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    let assignedUser = null;

    if (assignedTo) {
      assignedUser = await User.findOne({
        _id: assignedTo,
        companyId: req.user.companyId,
      });

      if (!assignedUser) {
        return res.status(404).json({
          message: "Assigned user not found",
        });
      }
    }

    const task = await Task.create({
      title,
      description,
      projectId,
      companyId: req.user.companyId,
      createdBy: req.user.id,
      assignedTo: assignedUser ? assignedUser._id : null,
      status: assignedUser ? "In-Progress" : "Not Assigned",
    });

    const populated = await Task.findById(task._id)
      .populate("createdBy", "name")
      .populate("assignedTo", "name");

    res.status(201).json(populated);
  } catch (error) {
    console.error("Create Task Error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * 📋 GET TASKS
 */
const getTasks = async (req, res) => {
  try {
    const { status, projectId, assignedTo } = req.query;

    const query = {
      companyId: req.user.companyId,
    };

    if (status) query.status = status;

    if (projectId && mongoose.Types.ObjectId.isValid(projectId)) {
      query.projectId = projectId;
    }

    if (assignedTo && mongoose.Types.ObjectId.isValid(assignedTo)) {
      query.assignedTo = assignedTo;
    }

    const tasks = await Task.find(query)
      .populate("createdBy", "name")
      .populate("assignedTo", "name")
      .populate("projectId", "name")
      .sort({ createdAt: -1 });

    res.json({ tasks });
  } catch (error) {
    console.error("Get Tasks Error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * ✏️ UPDATE TASK (MAIN LOGIC)
 */
const updateTask = async (req, res) => {
  try {
    const { title, description, status, assignedTo } = req.body;

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

    // 🧠 Basic fields
    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;

    // 🔥 ASSIGNMENT + STATUS SYNC
    if (assignedTo !== undefined) {
      if (assignedTo) {
        const user = await User.findOne({
          _id: assignedTo,
          companyId: req.user.companyId,
        });

        if (!user) {
          return res.status(404).json({
            message: "User not found",
          });
        }

        task.assignedTo = assignedTo;

        if (task.status === "Not Assigned") {
          task.status = "In-Progress";
        }
      } else {
        task.assignedTo = null;
        task.status = "Not Assigned";
      }
    }

    // 🔥 STATUS CHANGE (manual override)
    if (status && status !== task.status) {
      task.status = status;
    }

    await task.save();

    const updated = await Task.findById(task._id)
      .populate("assignedTo", "name")
      .populate("createdBy", "name");

    res.json(updated);
  } catch (error) {
    console.error("Update Task Error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * 🗑 DELETE TASK
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
};