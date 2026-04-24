const express = require("express");
const router = express.Router();

const {
  createTask,
  getTasks,
  updateTask,
  deleteTask,
  assignTask,
} = require("../controllers/taskController");

const protect = require("../middleware/authMiddleware");

router.post("/", protect, createTask);
router.get("/", protect, getTasks);
router.put("/:id", protect, updateTask);
router.put("/:id/assign", protect, assignTask);
router.delete("/:id", protect, deleteTask);

module.exports = router;