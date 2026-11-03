require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/books", require("./routes/bookRoutes"));
app.use("/api/loans", require("./routes/loanRoutes"));
app.use("/api/requests", require("./routes/requestRoutes"));
app.use("/api/members", require("./routes/memberRoutes"));
app.use("/api/reports", require("./routes/reportRoutes"));
app.use((req, res) => res.status(404).json({ message: "Route not found" }));

if (!process.env.JWT_SECRET) {
  console.error("JWT_SECRET is missing in backend/.env");
  process.exit(1);
}

const PORT = process.env.PORT || 5000;
connectDB().then(async () => {
  const { ensureAdmin, seedDemo } = require("./utils/seedData");
  await ensureAdmin();
  if ((await require("./models/Book").countDocuments()) === 0) await seedDemo();
  app.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`));
});
