const router = require("express").Router();
const profile = require("../controllers/user-profiles");
const authorize = require("../middlewares/authorize");
const { ROLES } = require("../utils/enum");

router.put(
  "/updateProfile",
  authorize([ROLES.PENGEPUL, ROLES.PETANI, ROLES.RETAILER]),
  profile.updateBio
);

module.exports = router;
