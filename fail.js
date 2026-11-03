module.exports = (res, err) => {
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern || {})[0] || "value";
    return res.status(409).json({ message: `That ${field} is already in use` });
  }
  if (err.name === "ValidationError")
    return res.status(400).json({ message: Object.values(err.errors).map((e) => e.message).join(", ") });
  if (err.name === "CastError") return res.status(400).json({ message: "Invalid id" });
  console.error(err);
  res.status(500).json({ message: "Server error" });
};
