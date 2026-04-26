const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");

const connectDB = require("./config/db");

// Routes
const userRoutes = require("./routes/userRoutes");
const authRoutes = require("./routes/authRoutes");
const companyRoutes = require("./routes/companyRoutes");
const projectRoutes = require("./routes/projectRoutes");
const taskRoutes = require("./routes/taskRoutes");
const statsRoutes = require("./routes/statsRoutes");

// Middleware
const errorMiddleware = require("./middleware/errorMiddleware");

// Load env variables
dotenv.config();

// Connect DB
connectDB();

const app = express();

// 🔧 Core Middleware
app.use(express.json());
app.use(cors());

// 🔍 Logger (should be BEFORE routes)
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// ✅ Health check route
app.get("/", (req, res) => {
  res.send("API running");
});

// 📦 Routes
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/company", companyRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/stats", statsRoutes);

// ❌ 404 Handler (optional but good)
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// 🚨 Central Error Handler (VERY IMPORTANT)
app.use(errorMiddleware);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});