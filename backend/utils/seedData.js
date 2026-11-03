const User = require("../models/User");
const Book = require("../models/Book");
const Loan = require("../models/Loan");
const Request = require("../models/Request");

const ADMIN = { name: "Librarian", email: "admin@library.com", password: "admin123" };
const NOW = Date.now();
const day = (n) => new Date(NOW + n * 864e5);

// Guarantees at least one admin exists so the app is never locked out.
async function ensureAdmin() {
  if (await User.exists({ role: "admin" })) return;
  const existing = await User.findOne({ email: ADMIN.email });
  if (existing) { existing.role = "admin"; await existing.save(); }
  else await User.create({ ...ADMIN, role: "admin" });
  console.log(`Admin account ready: ${ADMIN.email} / ${ADMIN.password}`);
}

async function seedDemo() {
  const mk = async (name, email) => (await User.findOne({ email })) || User.create({ name, email, password: "member123" });
  const priya = await mk("Priya Sharma", "priya@library.com");
  const ravi = await mk("Ravi Kumar", "ravi@library.com");
  const ananya = await mk("Ananya Reddy", "ananya@library.com");

  const rows = [
    ["Clean Code", "Robert C. Martin", "Technology", 2008, "9780132350884"],
    ["The Pragmatic Programmer", "Andrew Hunt", "Technology", 1999, "9780201616224"],
    ["Sapiens", "Yuval Noah Harari", "History", 2011, "9780062316097"],
    ["A Brief History of Time", "Stephen Hawking", "Science", 1988, "9780553380163"],
    ["Wings of Fire", "A. P. J. Abdul Kalam", "Biography", 1999, "9788173711466"],
    ["The Alchemist", "Paulo Coelho", "Fiction", 1988, "9780062315007"],
    ["The Guide", "R. K. Narayan", "Fiction", 1958, "9780143039648"],
    ["Cosmos", "Carl Sagan", "Science", 1980, "9780345539434"],
    ["India After Gandhi", "Ramachandra Guha", "History", 2007, "9780330396103"],
    ["Introduction to Algorithms", "Thomas H. Cormen", "Technology", 1990, "9780262033848"],
    ["Long Walk to Freedom", "Nelson Mandela", "Biography", 1994, "9780316548182"],
    ["Gitanjali", "Rabindranath Tagore", "Fiction", 1910, "9780486289595"],
  ];
  const books = await Book.create(rows.map(([title, author, genre, year, isbn]) => ({ title, author, genre, year, isbn })));

  await Loan.create([
    { book: books[0]._id, member: priya._id, issuedOn: day(-20), dueDate: day(-6) },
    { book: books[1]._id, member: ravi._id, issuedOn: day(-5), dueDate: day(9) },
    { book: books[2]._id, member: ananya._id, issuedOn: day(-12), dueDate: day(2) },
    { book: books[3]._id, member: priya._id, issuedOn: day(-40), dueDate: day(-26), returnedOn: day(-23) },
    { book: books[4]._id, member: ravi._id, issuedOn: day(-33), dueDate: day(-19), returnedOn: day(-14), paidOn: day(-14), paidAmount: 25 },
  ]);
  await Book.updateMany({ _id: { $in: [0, 1, 2].map((i) => books[i]._id) } }, { status: "Issued" });
  await Request.create({ book: books[5]._id, member: ananya._id });
  console.log("Demo data added (members use password: member123)");
}

module.exports = { ensureAdmin, seedDemo };
