const express = require("express");
const router = express.Router();

const {
  createTask,
  getTasks,
  updateTask,
  deleteTask,
} = require("../controllers/taskController");

const protect = require("../middleware/authMiddleware");

/**
 * 📌 TASK ROUTES
 */

// ➕ Create Task
router.post("/", protect, createTask);

// 📋 Get Tasks (supports filters via query params)
router.get("/", protect, getTasks);

// ✏️ Update Task (includes status + assignment)
router.put("/:id", protect, updateTask);

// 🗑 Delete Task
router.delete("/:id", protect, deleteTask);

module.exports = router;