const router = require("express").Router();
const { authorizeRoles } = require("../middleware/authentication-middleware");

const {
  createNotice,
  updateNotice,
  deleteNotice,
  getAllNotices,
  getMyNotices,
} = require("../controllers/noticeController");

router.post("/", authorizeRoles("admin"), createNotice);
router.get("/", authorizeRoles("admin"), getAllNotices);
router.patch("/:id", authorizeRoles("admin"), updateNotice);
router.delete("/:id", authorizeRoles("admin"), deleteNotice);

router.get("/student", authorizeRoles("student"), getMyNotices);

module.exports = router;
