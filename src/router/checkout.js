const express = require("express");
const { checkout, getOneheckout } = require("../component/checkout");

const router = express.Router();
router.post("/checkout/add", checkout);
router.get("/checkout/:id", getOneheckout);

module.exports = router;