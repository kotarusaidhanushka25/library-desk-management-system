const jwt = require("jsonwebtoken");
const User = require("../models/User");

exports.protect = async (req, res, next) => {
  const header = req.headers.authorization || "";
  if (!header.startsWith("Bearer ")) return res.status(401).json({ message: "Please log in" });
  try {
    const { id } = jwt.verify(header.slice(7), process.env.JWT_SECRET);
    const user = await User.findById(id);
    if (!user) throw new Error("no user");
    req.user = user;
    next();
  } catch {
    res.status(401).json({ message: "Session expired. Please log in again" });
  }
};

exports.adminOnly = (req, res, next) =>
  req.user.role === "admin" ? next() : res.status(403).json({ message: "Admin access required" });
