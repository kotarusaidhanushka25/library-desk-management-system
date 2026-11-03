const mongoose = require("mongoose");

const DAY = 864e5;
const loanSchema = new mongoose.Schema(
  {
    book: { type: mongoose.Schema.Types.ObjectId, ref: "Book", required: true },
    member: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    issuedOn: { type: Date, default: Date.now },
    dueDate: { type: Date, required: true },
    returnedOn: { type: Date, default: null },
    paidOn: { type: Date, default: null },
    paidAmount: { type: Number, default: 0 },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

// Fine = days late x FINE_PER_DAY. Keeps growing until the book is returned.
loanSchema.virtual("fine").get(function () {
  const rate = Number(process.env.FINE_PER_DAY) || 5;
  const late = Math.ceil(((this.returnedOn || new Date()) - this.dueDate) / DAY);
  return late > 0 ? late * rate : 0;
});
loanSchema.virtual("fineDue").get(function () {
  return this.paidOn ? 0 : this.fine;
});
loanSchema.virtual("state").get(function () {
  if (this.returnedOn) return "Returned";
  return new Date() > this.dueDate ? "Overdue" : "On loan";
});

module.exports = mongoose.model("Loan", loanSchema);
