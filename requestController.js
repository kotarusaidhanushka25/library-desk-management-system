const Book = require("../models/Book");
const Loan = require("../models/Loan");
const Request = require("../models/Request");
const fail = require("../utils/fail");

exports.list = async (req, res) => {
  try {
    const filter = req.user.role === "admin" ? {} : { member: req.user._id };
    res.json(await Request.find(filter).populate("book", "title author").populate("member", "name email").sort({ createdAt: -1 }));
  } catch (err) { fail(res, err); }
};

exports.create = async (req, res) => {
  try {
    if (req.user.role === "admin") return res.status(403).json({ message: "Admins issue books directly from the Books page" });
    const book = await Book.findById(req.body.bookId);
    if (!book) return res.status(404).json({ message: "Book not found" });
    if (book.status === "Issued") return res.status(400).json({ message: "This book is currently issued. Try again once it is returned." });
    if (await Request.exists({ book: book._id, member: req.user._id, status: "Pending" }))
      return res.status(400).json({ message: "You have already requested this book" });
    res.status(201).json(await Request.create({ book: book._id, member: req.user._id }));
  } catch (err) { fail(res, err); }
};

exports.decide = async (req, res) => {
  try {
    const r = await Request.findById(req.params.id);
    if (!r) return res.status(404).json({ message: "Request not found" });
    if (r.status !== "Pending") return res.status(400).json({ message: "This request was already handled" });
    if (req.body.action === "reject") {
      r.status = "Rejected";
      await r.save();
      return res.json(r);
    }
    const book = await Book.findById(r.book);
    if (!book || book.status === "Issued") return res.status(400).json({ message: "This book is not available to issue" });
    const days = Math.min(90, Math.max(1, Number(req.body.days) || 14));
    await Loan.create({ book: book._id, member: r.member, dueDate: new Date(Date.now() + days * 864e5) });
    book.status = "Issued";
    await book.save();
    r.status = "Approved";
    await r.save();
    res.json(r);
  } catch (err) { fail(res, err); }
};
