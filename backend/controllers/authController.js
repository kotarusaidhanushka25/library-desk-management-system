const jwt = require("jsonwebtoken");
const User = require("../models/User");
const fail = require("../utils/fail");

const session = (u) => ({
  token: jwt.sign({ id: u._id }, process.env.JWT_SECRET, { expiresIn: "7d" }),
  user: { id: u._id, name: u.name, email: u.email, role: u.role },
});

// The very first account created becomes the admin; everyone after is a member.
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const role = (await User.countDocuments()) === 0 ? "admin" : "member";
    res.status(201).json(session(await User.create({ name, email, password, role })));
  } catch (err) { fail(res, err); }
};

exports.login = async (req, res) => {
  try {
    const user = await User.findOne({ email: (req.body.email || "").toLowerCase() }).select("+password");
    if (!user || !(await user.matches(req.body.password || ""))) {
      return res.status(401).json({ message: "Wrong email or password" });
    }
    res.json(session(user));
  } catch (err) { fail(res, err); }
};

exports.updateMe = async (req, res) => {
  try {
    const { name, currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select("+password");
    if (name) user.name = name;
    if (newPassword) {
      if (!(await user.matches(currentPassword || ""))) return res.status(400).json({ message: "Current password is wrong" });
      user.password = newPassword;
    }
    await user.save();
    res.json(session(user));
  } catch (err) { fail(res, err); }
};
