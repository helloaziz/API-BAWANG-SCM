const router = require("express").Router();
const product = require("../controllers/product");
const authorize = require("../middlewares/authorize");
const { ROLES } = require("../utils/enum");

router.post(
  "/create",
  authorize([ROLES.PETANI, ROLES.PENGEPUL]),
  product.create
);

router.get(
  "/my-products",
  authorize([ROLES.PETANI, ROLES.PENGEPUL]),
  product.myProduct
);

router.put(
  "/edit/:product_id",
  authorize([ROLES.PETANI, ROLES.PENGEPUL]),
  product.edit
);

router.get("/", product.indexBuyerRetail);

router.get("/all-products", authorize(ROLES.ADMIN), product.index);

router.get("/:product_id", product.showBuyerRetail);
router.get("/all-products/:product_id", authorize(ROLES.ADMIN), product.show);

module.exports = router;
