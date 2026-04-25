const User = require("../models/User");

// @desc    Get users of same company
// @route   GET /api/users
// @access  Private
const getUsers = async (req, res) => {
  try {
    const users = await User.find({
      companyId: req.user.companyId,
    }).select("name email role");

    res.json(users);
  } catch (error) {
    console.error("Get Users Error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  getUsers,
};