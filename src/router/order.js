const express = require("express");
const { order, getAllOrder, TotalAmountAllProductOrder, getOneOrder, CountOrderOnline, UpdateCancell, UpdateConfirm, UpdateDone, GetOrderPlacedDay, GetOrderAwaitingDay, GetOrderDoneDay, ListOrderInWeek, GetOrderForAdmin, getReceivedOrders, getPlacedOrders, getPendingOrders, getOneOrderinUser, UpdateShiping, UpdateShipDone, UpdateComplete, getPending, getShiping } = require("../controller/order");
const router = express.Router();
router.post("/order/add", order);
router.get("/order", getAllOrder);
router.get("/order/TotalAmountAllProductOrder", TotalAmountAllProductOrder);
router.get("/order/:id/getone", getOneOrder);
router.get("/order/countorderonline", CountOrderOnline)
router.get("/order/orderplaceday", GetOrderPlacedDay)
router.get("/order/orderawaitingday", GetOrderAwaitingDay)
router.get("/order/orderdoneday", GetOrderDoneDay)
router.patch('/order/cancell', UpdateCancell)
router.patch('/order/confirm', UpdateConfirm)
router.patch('/order/shiping', UpdateShiping)
router.patch('/order/shipdone', UpdateShipDone)
router.patch('/order/done', UpdateDone)
router.patch('/order/complate', UpdateComplete)
router.get('/order/orderinweek',ListOrderInWeek)
router.get('/order/getorderadmin',GetOrderForAdmin)
router.get('/order/orderplace',getPlacedOrders)
router.get('/order/orderrevice',getReceivedOrders)
router.get('/order/orderpending',getPendingOrders)
router.get('/order/:id/getorderuser', getOneOrderinUser)
router.get('/order/pending', getPending)
router.get('/order/shiping', getShiping)
module.exports = router;