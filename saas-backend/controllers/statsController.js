const Project = require("../models/Project");
const Task = require("../models/Task");

const getStats = async (req, res) => {
  try {
    const companyId = req.user.companyId;

    const totalProjects = await Project.countDocuments({ companyId });

    const totalTasks = await Task.countDocuments({ companyId });

    const completedTasks = await Task.countDocuments({
      companyId,
      status: "Completed",
    });

    res.json({
      totalProjects,
      totalTasks,
      completedTasks,
    });
  } catch (error) {
    console.error("Stats Error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { getStats };