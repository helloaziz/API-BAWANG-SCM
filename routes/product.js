const router = require("express").Router();
const product = require("../controllers/product");
const authorize = require("../middlewares/authorize");
const { ROLES } = require("../utils/enum");

router.post(
  "/create-product",
  authorize([ROLES.PETANI, ROLES.PENGEPUL]),
  product.create
);

router.put(
  "/edit/:product_id",
  authorize([ROLES.PETANI, ROLES.PENGEPUL]),
  product.edit
);

router.get(
  "/all-products",
  authorize([ROLES.ADMIN, ROLES.PENGEPUL, ROLES.PETANI]),
  product.index
);

router.get(
  "/",
  authorize([ROLES.BUYER, ROLES.RETAILER]),
  product.indexBuyerRetail
);

router.get(
  "/:product_id",
  authorize([ROLES.BUYER, ROLES.RETAILER]),
  product.showBuyerRetail
);

router.get(
  "/show/:product_id",
  authorize([ROLES.ADMIN, ROLES.PENGEPUL, ROLES.PETANI]),
  product.show
);

router.put(
  "/delete/:product_id",
  authorize([ROLES.ADMIN, ROLES.PENGEPUL, ROLES.PETANI]),
  product.destroy
);

router.put(
  "/update-status/:product_id",
  authorize([ROLES.ADMIN, ROLES.PENGEPUL, ROLES.PETANI]),
  product.status
);

module.exports = router;
