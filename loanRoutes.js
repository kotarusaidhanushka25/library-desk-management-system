const router = require("express").Router();
const c = require("../controllers/loanController");
const { protect, adminOnly } = require("../middleware/auth");

router.use(protect);
router.get("/", c.list);
router.post("/issue", adminOnly, c.issue);
router.patch("/:id/return", adminOnly, c.returnLoan);
router.patch("/:id/pay", adminOnly, c.payFine);

module.exports = router;
