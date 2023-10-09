const express = require("express");
const { order, getAllOrder, TotalAmountAllProductOrder, getOneOrder, CountOrderOnline, UpdateCancell, UpdateConfirm, UpdateDone } = require("../component/order");
const router = express.Router();
router.post("/order/add", order);
router.get("/order", getAllOrder);
router.get("/order/TotalAmountAllProductOrder", TotalAmountAllProductOrder);
router.get("/order/:id/getone", getOneOrder);
router.get("/order/countorderonline", CountOrderOnline)
router.patch('/order/cancell', UpdateCancell)
router.patch('/order/confirm', UpdateConfirm)
router.patch('/order/done', UpdateDone)
module.exports = router;