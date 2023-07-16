const router = require("express").Router();
const admin = require("../controllers/admin");
const authorize = require("../middlewares/authorize");
const { ROLES } = require("../utils/enum");

router.post("/registerPatner", authorize([ROLES.ADMIN]), admin.registerPatner);
router.get("/userIndex", authorize(ROLES.ADMIN), admin.index);
router.get("/userShow/:user_id", authorize(ROLES.ADMIN), admin.show);
router.put("/userUpdate/:user_id", authorize(ROLES.ADMIN), admin.update);
router.post("/registerAdmin", admin.registerAdmin);

module.exports = router;
