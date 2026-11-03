const PDFDocument = require("pdfkit");
const Book = require("../models/Book");
const User = require("../models/User");
const Loan = require("../models/Loan");
const fail = require("../utils/fail");

const fmt = (d) => new Date(d).toLocaleDateString("en-GB");
const allLoans = () => Loan.find().populate("book", "title").populate("member", "name email").sort({ issuedOn: -1 });

exports.summary = async (req, res) => {
  try {
    const [books, members, loans, genres] = await Promise.all([
      Book.countDocuments(),
      User.countDocuments({ role: "member" }),
      Loan.find(),
      Book.aggregate([{ $group: { _id: "$genre", count: { $sum: 1 } } }, { $sort: { count: -1 } }]),
    ]);
    const now = new Date();
    const months = [...Array(6)].map((_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
      return { label: d.toLocaleString("en", { month: "short" }), y: d.getFullYear(), m: d.getMonth(), count: 0 };
    });
    loans.forEach((l) => {
      const slot = months.find((x) => x.y === l.issuedOn.getFullYear() && x.m === l.issuedOn.getMonth());
      if (slot) slot.count++;
    });
    const active = loans.filter((l) => !l.returnedOn);
    res.json({
      books,
      members,
      issued: active.length,
      overdue: active.filter((l) => l.state === "Overdue").length,
      finesCollected: loans.reduce((sum, l) => sum + l.paidAmount, 0),
      finesPending: loans.reduce((sum, l) => sum + l.fineDue, 0),
      byGenre: genres.map((g) => ({ label: g._id, count: g.count })),
      monthly: months.map(({ label, count }) => ({ label, count })),
    });
  } catch (err) { fail(res, err); }
};

exports.csv = async (req, res) => {
  try {
    const esc = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const rows = (await allLoans()).map((l) =>
      [l.book?.title, l.member?.name, l.member?.email, fmt(l.issuedOn), fmt(l.dueDate), l.returnedOn ? fmt(l.returnedOn) : "", l.state, l.fine, l.fine ? (l.paidOn ? `Paid ${fmt(l.paidOn)}` : "Unpaid") : ""]
        .map(esc).join(",")
    );
    const head = ["Book", "Member", "Email", "Issued", "Due", "Returned", "Status", "Fine (Rs)", "Fine status"].join(",");
    res.header("Content-Type", "text/csv").attachment("loans.csv").send("\uFEFF" + [head, ...rows].join("\n"));
  } catch (err) { fail(res, err); }
};

exports.pdf = async (req, res) => {
  try {
    const loans = await allLoans();
    const active = loans.filter((l) => !l.returnedOn);
    const doc = new PDFDocument({ margin: 40, size: "A4" });
    res.header("Content-Type", "application/pdf").attachment("loans-report.pdf");
    doc.pipe(res);

    doc.fontSize(20).text("Library loans report");
    doc.fontSize(10).fillColor("#555").text(`Generated ${fmt(new Date())}`).moveDown(0.5);
    doc.fillColor("#000").text(
      `Total loans: ${loans.length}    On loan: ${active.length}    Overdue: ${active.filter((l) => l.state === "Overdue").length}    Fines collected: Rs ${loans.reduce((s, l) => s + l.paidAmount, 0)}    Pending: Rs ${loans.reduce((s, l) => s + l.fineDue, 0)}`
    ).moveDown();

    if (!loans.length) {
      doc.text("No loans recorded yet. Issue a book to a member from the Books tab and it will appear here.");
    } else {
      const cols = [["Book", 40, 140], ["Member", 185, 90], ["Issued", 280, 55], ["Due", 340, 55], ["Status", 400, 55], ["Fine", 460, 95]];
      const row = (y, cells, bold) => {
        doc.font(bold ? "Helvetica-Bold" : "Helvetica").fontSize(9);
        cells.forEach((c, i) => doc.text(String(c), cols[i][1], y, { width: cols[i][2], lineBreak: false, ellipsis: true }));
      };
      let y = doc.y;
      row(y, cols.map((c) => c[0]), true);
      y += 16;
      doc.moveTo(40, y - 3).lineTo(555, y - 3).strokeColor("#999").stroke();
      loans.forEach((l) => {
        if (y > 780) { doc.addPage(); y = 40; }
        row(y, [l.book?.title || "(deleted)", l.member?.name || "(deleted)", fmt(l.issuedOn), fmt(l.dueDate), l.state, l.fine ? `Rs ${l.fine}${l.paidOn ? " (paid)" : ""}` : "-"], false);
        y += 16;
      });
    }
    doc.end();
  } catch (err) { fail(res, err); }
};
