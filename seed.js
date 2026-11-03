require("dotenv").config({ path: require("path").join(__dirname, "../.env") });
const mongoose = require("mongoose");
const { ensureAdmin, seedDemo } = require("../utils/seedData");

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  await Promise.all(["User", "Book", "Loan", "Request"].map((m) => require(`../models/${m}`).deleteMany({})));
  await ensureAdmin();
  await seedDemo();
  await mongoose.disconnect();
  console.log("Done. Log in with admin@library.com / admin123");
})();
