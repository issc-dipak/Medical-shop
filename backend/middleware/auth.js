const jwt = require("jsonwebtoken");

function auth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ message: "No token provided." });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    if (!payload.tenantId) {
      return res.status(401).json({ message: "Access denied. Tenant identifier missing." });
    }
    req.user = payload; // { id, username, role, name, tenantId }
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token." });
  }
}

function requireAdmin(req, res, next) {
  if (req.user?.role !== "Admin") {
    return res.status(403).json({ message: "Admin access required." });
  }
  next();
}

module.exports = { auth, requireAdmin };
