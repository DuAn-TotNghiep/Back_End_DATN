const express = require("express");
const { order } = require("../component/order");
const router = express.Router();
router.post("/order/add", order);
module.exports = router;