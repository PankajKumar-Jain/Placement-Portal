const router = require("express").Router();

const { login, logout, register } = require("../controllers/authController");

router.post("/login", login);
router.post("/register", register); // must exist
router.get("/logout", logout);
module.exports = router;
