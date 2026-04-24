const express = require("express");
const router = express.Router();

const Company = require("../models/Company");
const authMiddleware = require("../middleware/authMiddleware");

/**
 * @route   POST /api/company
 * @desc    Create a new company (Protected)
 */
router.post("/", authMiddleware, async (req, res, next) => {
  try {
    const { name } = req.body;

    // 🔎 Validation
    if (!name) {
      return res.status(400).json({
        message: "Company name is required",
      });
    }

    const normalizedName = name.trim();

    // 🔎 Check duplicate (case-insensitive)
    const existingCompany = await Company.findOne({
      name: { $regex: `^${normalizedName}$`, $options: "i" },
    });

    if (existingCompany) {
      return res.status(409).json({
        message: "Company already exists",
      });
    }

    // 🏢 Create company
    const company = await Company.create({
      name: normalizedName,
    });

    res.status(201).json({
      message: "Company created successfully",
      company: {
        _id: company._id,
        name: company.name,
      },
    });

  } catch (error) {
    next(error); // ✅ central error handler
  }
});

module.exports = router;