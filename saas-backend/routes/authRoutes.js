const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const User = require("../models/User");
const Company = require("../models/Company");

// helper (clean + reusable)
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,                      // ✅ standard key
      companyId: user.companyId._id || user.companyId,
      role: user.role,                  // 🔥 include role
    },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );
};

/**
 * @route   POST /api/auth/register
 */
router.post("/register", async (req, res, next) => {
  try {
    const { name, email, password, companyName } = req.body;

    if (!name || !email || !password || !companyName) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const normalizedCompanyName = companyName.trim();

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(409).json({
        message: "User already exists",
      });
    }

    let company = await Company.findOne({
      name: { $regex: `^${normalizedCompanyName}$`, $options: "i" },
    });

    if (!company) {
      company = await Company.create({
        name: normalizedCompanyName,
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      companyId: company._id,
      role: "member", // 🔥 default role
    });

    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(201).json({
      message: "User registered successfully",
      user: userResponse,
      company: {
        _id: company._id,
        name: company.name,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/auth/login
 */
router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const user = await User.findOne({ email: normalizedEmail }).populate(
      "companyId",
      "name"
    );

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is not defined");
    }

    // 🔥 FIXED + includes role
    const token = generateToken(user);

    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(200).json({
      message: "Login successful",
      token,
      user: userResponse,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;