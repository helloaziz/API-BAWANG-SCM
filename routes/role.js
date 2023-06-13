const router = require("express").Router();
const role = require("../controllers/role");
const authorize = require("../middlewares/authorize");
const { ROLES } = require("../utils/enum");

router.post("/create", authorize(ROLES.ADMIN), role.create);
router.post("/edit/:role_id", authorize(ROLES.ADMIN), role.edit);
router.get("/", role.index);
router.get("/:role_id", role.show);

module.exports = router;
