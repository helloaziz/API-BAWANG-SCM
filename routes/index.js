const router = require("express").Router();
const role = require("./role");
const auth = require("./auth");
const admin = require("./admin");
const product = require("./product");

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

module.exports = router;
