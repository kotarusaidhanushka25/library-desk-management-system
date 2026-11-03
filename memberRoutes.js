const router = require("express").Router();
const c = require("../controllers/memberController");
const { protect, adminOnly } = require("../middleware/auth");

router.use(protect, adminOnly);
router.route("/").get(c.list).post(c.create);
router.route("/:id").put(c.update).delete(c.remove);

module.exports = router;
