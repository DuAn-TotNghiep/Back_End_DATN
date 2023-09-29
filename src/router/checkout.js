const express = require("express");
const { checkout } = require("../component/checkout");

const router = express.Router();
router.post("/checkout/add", checkout);

module.exports = router;