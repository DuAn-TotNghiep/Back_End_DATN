const express = require("express");
const {
  order,
  getAllOrder,
  TotalAmountAllProductOrder,
  getOneOrder,
  CountOrderOnline,
  UpdateCancell,
  UpdateConfirm,
  UpdateDone,
  GetOrderPlacedDay,
  GetOrderAwaitingDay,
  GetOrderDoneDay,
  ListOrderInWeek,
  GetOrderForAdmin,
  getReceivedOrders,
  getPlacedOrders,
  getPendingOrders,
  getOneOrderinUser,
  UpdateShiping,
  UpdateShipDone,
  UpdateComplete,
  getShipingOrders,
  getConfirmOrders,
  getDeleveredOrders,
  getCompleteOrders,
  getCancelledOrders,
  generateStatus,
  sendStatusByEmail,
  getPendingOrdersAll,
  getReceivedOrdersDay,
  searchOrdersByUserPhone,
  searchOrdersByUserPhoneCancell,
  searchOrdersByUserPhoneConfirm,
  searchOrdersByUserPhoneAwaitShipper,
  searchOrdersByUserPhoneShipping,
  searchOrdersByUserPhoneShipDone,
  searchOrdersByUserPhoneDone,
  searchOrdersByUserPhoneComplete,
  getCompleteAndDoneOrders,
  getBomdOrders,
  UpdateBomd,
  UpdateOrder,
  searchOrdersByUserPhoneCancell1
} = require("../controller/order");
const router = express.Router();
router.post("/order/add", order);
router.get("/order", getAllOrder);
router.get("/order/TotalAmountAllProductOrder", TotalAmountAllProductOrder);
router.get("/order/:id/getone", getOneOrder);
router.get("/order/countorderonline", CountOrderOnline);
router.get("/order/orderplaceday", GetOrderPlacedDay);
router.get("/order/orderawaitingday", GetOrderAwaitingDay);
router.get("/order/orderdoneday", GetOrderDoneDay);
router.patch("/order/cancell", UpdateCancell);
router.patch("/order/confirm", UpdateConfirm);
router.patch("/order/shiping", UpdateShiping);
router.patch("/order/shipdone", UpdateShipDone);
router.patch("/order/bomd", UpdateBomd);
router.patch("/order/done", UpdateDone);
router.patch("/order/complate", UpdateComplete);
router.patch("/order/sumbomd", UpdateOrder);
router.get("/order/orderinweek", ListOrderInWeek);
router.get("/order/getorderadmin", GetOrderForAdmin);
router.get("/order/orderplace", getPlacedOrders);
router.get("/order/orderrevice", getReceivedOrders);
router.get("/order/orderreviceday", getReceivedOrdersDay);
router.get("/order/orderpending", getPendingOrders);
router.get("/order/ordershiping", getShipingOrders);
router.get("/order/orderconfirm", getConfirmOrders);
router.get("/order/orderdelivered", getDeleveredOrders);
router.get("/order/ordercomplete", getCompleteOrders);
router.get("/order/orderdoneandcomplete", getCompleteAndDoneOrders);
router.get("/order/orderbomd", getBomdOrders);
router.get("/order/ordercancell", getCancelledOrders);
router.get("/order/orderpendingall", getPendingOrdersAll);
router.get("/order/:id/getorderuser", getOneOrderinUser);
router.post("/order/status", sendStatusByEmail);
router.post("/order/search", searchOrdersByUserPhone);
router.post("/order/searchcancell", searchOrdersByUserPhoneCancell);
router.post("/order/searchcancell1", searchOrdersByUserPhoneCancell1);
router.post("/order/searchconfirm", searchOrdersByUserPhoneConfirm);
router.post("/order/searchawaitshipper", searchOrdersByUserPhoneAwaitShipper);
router.post("/order/searchshipping", searchOrdersByUserPhoneShipping);
router.post("/order/searchshipdone", searchOrdersByUserPhoneShipDone);
router.post("/order/searchdone", searchOrdersByUserPhoneDone);
router.post("/order/searchcomplete", searchOrdersByUserPhoneComplete);


module.exports = router;
