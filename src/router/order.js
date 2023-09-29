const express = require("express");
const { order, getAllOrder } = require("../component/order");
const router = express.Router();
router.post("/order/add", order);
router.get("/order", getAllOrder);
module.exports = router;