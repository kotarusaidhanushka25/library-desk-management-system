const Book = require("../models/Book");
const User = require("../models/User");
const Loan = require("../models/Loan");
const fail = require("../utils/fail");

exports.list = async (req, res) => {
  try {
    const filter = req.user.role === "admin" ? {} : { member: req.user._id };
    res.json(
      await Loan.find(filter)
        .populate("book", "title author isbn")
        .populate("member", "name email")
        .sort({ createdAt: -1 })
    );
  } catch (err) { fail(res, err); }
};

exports.issue = async (req, res) => {
  try {
    const { bookId, memberId } = req.body;
    const days = Math.min(90, Math.max(1, Number(req.body.days) || 14));
    const [book, member] = await Promise.all([Book.findById(bookId), User.findOne({ _id: memberId, role: "member" })]);
    if (!book) return res.status(404).json({ message: "Book not found" });
    if (!member) return res.status(404).json({ message: "Member not found" });
    if (book.status === "Issued") return res.status(400).json({ message: "This book is already issued" });
    const loan = await Loan.create({ book: book._id, member: member._id, dueDate: new Date(Date.now() + days * 864e5) });
    book.status = "Issued";
    await book.save();
    res.status(201).json(loan);
  } catch (err) { fail(res, err); }
};

exports.returnLoan = async (req, res) => {
  try {
    const loan = await Loan.findById(req.params.id);
    if (!loan) return res.status(404).json({ message: "Loan not found" });
    if (loan.returnedOn) return res.status(400).json({ message: "Already returned" });
    loan.returnedOn = new Date();
    await loan.save();
    await Book.findByIdAndUpdate(loan.book, { status: "Available" });
    res.json(loan);
  } catch (err) { fail(res, err); }
};

// Fine is final once the book is back, so it can only be collected after return.
exports.payFine = async (req, res) => {
  try {
    const loan = await Loan.findById(req.params.id);
    if (!loan) return res.status(404).json({ message: "Loan not found" });
    if (!loan.returnedOn) return res.status(400).json({ message: "Mark the book returned first, then collect the fine" });
    if (loan.paidOn) return res.status(400).json({ message: "Fine already paid" });
    if (loan.fine <= 0) return res.status(400).json({ message: "There is no fine on this loan" });
    loan.paidAmount = loan.fine;
    loan.paidOn = new Date();
    await loan.save();
    res.json(loan);
  } catch (err) { fail(res, err); }
};
