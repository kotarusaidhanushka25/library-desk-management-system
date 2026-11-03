const router = require("express").Router();
const c = require("../controllers/reportController");
const { protect, adminOnly } = require("../middleware/auth");

router.use(protect, adminOnly);
router.get("/summary", c.summary);
router.get("/export/csv", c.csv);
router.get("/export/pdf", c.pdf);

module.exports = router;
