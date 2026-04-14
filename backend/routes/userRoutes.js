const router = require("express").Router();

const {
  showCurrentUser,
  getUserById,
} = require("../controllers/userController");

router.get("/whoami", showCurrentUser);
router.get("/getUserToChat/:userId", getUserById);

module.exports = router;
