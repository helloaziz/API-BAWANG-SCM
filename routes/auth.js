const router = require("express").Router();
const auth = require("../controllers/auth");
const authorize = require("../middlewares/authorize");

router.post("/register", auth.registerBuyer);
router.post("/login", auth.login);
router.get("/whoami", authorize(), auth.whoami);
router.put("/change-password", authorize(), auth.changePassword);
router.post("/forgot-password", auth.forgotPassword);
router.put("/reset-password", auth.resetPassword);
router.put("/activate-account", authorize(), auth.activateAccount);

module.exports = router;
