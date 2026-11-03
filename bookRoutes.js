const router = require("express").Router();
const c = require("../controllers/bookController");
const { protect, adminOnly } = require("../middleware/auth");

router.use(protect);
router.get("/", c.getBooks);
router.post("/", adminOnly, c.createBook);
router.route("/:id").put(adminOnly, c.updateBook).delete(adminOnly, c.deleteBook);

module.exports = router;
