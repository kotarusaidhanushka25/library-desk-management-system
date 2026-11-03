const User = require("../models/User");
const fail = require("../utils/fail");

exports.list = async (req, res) => {
  try { res.json(await User.find({ role: "member" }).sort({ name: 1 })); }
  catch (err) { fail(res, err); }
};

exports.create = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const m = await User.create({ name, email, password, role: "member" });
    res.status(201).json({ _id: m._id, name: m.name, email: m.email, role: m.role });
  } catch (err) { fail(res, err); }
};

exports.update = async (req, res) => {
  try {
    const m = await User.findOne({ _id: req.params.id, role: "member" });
    if (!m) return res.status(404).json({ message: "Member not found" });
    const { name, email, password } = req.body;
    if (name) m.name = name;
    if (email) m.email = email;
    if (password) m.password = password;
    await m.save();
    res.json({ _id: m._id, name: m.name, email: m.email });
  } catch (err) { fail(res, err); }
};

exports.remove = async (req, res) => {
  try {
    const m = await User.findOne({ _id: req.params.id, role: "member" });
    if (!m) return res.status(404).json({ message: "Member not found" });
    if (await require("../models/Loan").exists({ member: m._id, returnedOn: null }))
      return res.status(400).json({ message: "This member still has books out. Mark them returned first." });
    await m.deleteOne();
    res.json({ message: "Member removed" });
  } catch (err) { fail(res, err); }
};
