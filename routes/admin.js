const router = require("express").Router();
const admin = require("../controllers/admin");
const authorize = require("../middlewares/authorize");
const { ROLES } = require("../utils/enum");

router.post("/register-patner", authorize(ROLES.ADMIN), admin.registerPatner);

module.exports = router;
