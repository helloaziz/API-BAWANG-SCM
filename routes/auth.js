const router = require("express").Router();
const auth = require("../controllers/auth");
const authorize = require("../middlewares/authorize");

router.post("/register", auth.registerBuyer);
router.post("/login", auth.login);
router.get("/whoami", authorize(), auth.whoami);
router.put("/changePassword", authorize(), auth.changePassword);
router.post("/forgotPassword", auth.forgotPassword);
router.put("/resetPassword", auth.resetPassword);
router.put("/activateAccount", authorize(), auth.activateAccount);

module.exports = router;
