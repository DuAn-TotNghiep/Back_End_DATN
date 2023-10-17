const express = require("express");
const { checkout, getOneheckout, checkoutnotoken } = require("../controller/checkout");

const router = express.Router();
router.post("/checkout/add", checkout);
router.post("/checkoutnotoken/add", checkoutnotoken);
router.get("/checkout/:id", getOneheckout);

module.exports = router;