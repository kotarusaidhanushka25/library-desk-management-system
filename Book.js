const mongoose = require("mongoose");

const bookSchema = new mongoose.Schema(
  {
    title: { type: String, required: [true, "Title is required"], trim: true },
    author: { type: String, required: [true, "Author is required"], trim: true },
    isbn: { type: String, required: [true, "ISBN is required"], unique: true, trim: true },
    genre: { type: String, default: "Other", trim: true },
    year: { type: Number, min: 0, max: 2100 },
    status: { type: String, enum: ["Available", "Issued"], default: "Available" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Book", bookSchema);
