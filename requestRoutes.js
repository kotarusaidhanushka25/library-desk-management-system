const router = require("express").Router();
const c = require("../controllers/requestController");
const { protect, adminOnly } = require("../middleware/auth");

router.use(protect);
router.route("/").get(c.list).post(c.create);
router.patch("/:id", adminOnly, c.decide);

module.exports = router;
