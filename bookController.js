const Book = require("../models/Book");
const fail = require("../utils/fail");

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const pick = ({ title, author, isbn, genre, year }) => ({ title, author, isbn, genre, year });

exports.getBooks = async (req, res) => {
  try {
    const { q, status } = req.query;
    const filter = {};
    if (status === "Available" || status === "Issued") filter.status = status;
    if (q && q.trim()) {
      const rx = new RegExp(escapeRegex(q.trim()), "i");
      filter.$or = [{ title: rx }, { author: rx }, { isbn: rx }];
    }
    res.json(await Book.find(filter).sort({ createdAt: -1 }));
  } catch (err) { fail(res, err); }
};

exports.createBook = async (req, res) => {
  try { res.status(201).json(await Book.create(pick(req.body))); }
  catch (err) { fail(res, err); }
};

exports.updateBook = async (req, res) => {
  try {
    const book = await Book.findByIdAndUpdate(req.params.id, pick(req.body), { new: true, runValidators: true });
    if (!book) return res.status(404).json({ message: "Book not found" });
    res.json(book);
  } catch (err) { fail(res, err); }
};

exports.deleteBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ message: "Book not found" });
    if (book.status === "Issued") return res.status(400).json({ message: "Return this book before deleting it" });
    await book.deleteOne();
    res.json({ message: "Book deleted" });
  } catch (err) { fail(res, err); }
};
