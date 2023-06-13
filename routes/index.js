const router = require("express").Router();
const role = require("./role");
const auth = require("./auth");
const admin = require("./admin");
const product = require("./product");
const user = require("./user-profile");

router.get("/", (req, res) => {
  return res.status(200).json({
    status: true,
    message: "success",
    data: null,
  });
});

router.use("/role", role);
router.use("/auth", auth);
router.use("/admin", admin);
router.use("/product", product);
router.use("/user", user);

module.exports = router;
