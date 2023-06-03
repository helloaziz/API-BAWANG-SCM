const router = require("express").Router();
const auth = require("../controllers/auth");

router.post("/register", auth.registerBuyer);
router.post("/login", auth.login);
router.get("/whoami", auth.whoami);

module.exports = router;
