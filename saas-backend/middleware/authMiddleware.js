const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  try {
    let token;

    // 🔎 Extract token
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    // ❌ No token
    if (!token) {
      return res.status(401).json({
        message: "Not authorized, no token",
      });
    }

    // 🔐 Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 🔥 HANDLE BOTH id & userId (important fix)
    const userId = decoded.id || decoded.userId;

    if (!userId || !decoded.companyId) {
      return res.status(401).json({
        message: "Invalid token payload",
      });
    }

    // ✅ Attach user
    req.user = {
      id: userId,
      companyId: decoded.companyId,
      role: decoded.role
    };

    next();
  } catch (error) {
    console.error("Auth Error:", error.message);

    return res.status(401).json({
      message: "Not authorized, token failed",
    });
  }
};

module.exports = authMiddleware;