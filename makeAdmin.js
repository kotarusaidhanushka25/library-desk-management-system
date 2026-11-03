require("dotenv").config({ path: require("path").join(__dirname, "../.env") });
const mongoose = require("mongoose");
const User = require("../models/User");

(async () => {
  const email = (process.argv[2] || "").toLowerCase();
  if (!email) { console.log("Usage: npm run make-admin -- you@example.com"); process.exit(1); }
  await mongoose.connect(process.env.MONGO_URI);
  const user = await User.findOneAndUpdate({ email }, { role: "admin" }, { new: true });
  console.log(user ? `${user.email} is now an admin. Log out and log in again.` : "No user found with that email.");
  await mongoose.disconnect();
})();
