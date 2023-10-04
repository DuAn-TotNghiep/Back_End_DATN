const express = require("express");
const { order, getAllOrder, TotalAmountAllProductOrder } = require("../component/order");
const router = express.Router();
router.post("/order/add", order);
router.get("/order", getAllOrder);
router.get("/order/TotalAmountAllProductOrder", TotalAmountAllProductOrder);

module.exports = router;