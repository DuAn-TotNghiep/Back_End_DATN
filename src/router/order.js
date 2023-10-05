const express = require("express");
const { order, getAllOrder, TotalAmountAllProductOrder, getOneOrder } = require("../component/order");
const router = express.Router();
router.post("/order/add", order);
router.get("/order", getAllOrder);
router.get("/order/TotalAmountAllProductOrder", TotalAmountAllProductOrder);
router.get("/order/:id/getone", getOneOrder);
module.exports = router;