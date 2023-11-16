const express = require("express");
const {
  checkout,
  getOneheckout,
  checkoutnotoken,
  getOneCheckOutProduct,
  checkoutoff,
  checkoutnow,
} = require("../controller/checkout");

const router = express.Router();
router.post("/checkout/add", checkout);
router.post("/checkoutnow/add", checkoutnow);
router.post("/checkoutoff/add", checkoutoff);
router.post("/checkoutnotoken/add", checkoutnotoken);
router.get("/checkout/:id", getOneheckout);
router.get("/checkout/:id/checkoutproduct", getOneCheckOutProduct);
module.exports = router;
