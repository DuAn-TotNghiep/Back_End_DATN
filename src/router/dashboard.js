const express = require("express");
const { getTotalDay, getTotalWeek, TopProductToday, TopProductWeek, TopProductMonth, getTotalMonth, TopRevenueProductToday } = require("../component/dashboard");

const router = express.Router();

router.get("/totalday", getTotalDay);
router.get("/totalweek", getTotalWeek);
router.get("/totalmonth", getTotalMonth);
router.get("/topproduct", TopProductToday)
router.get("/topproductweek", TopProductWeek)
router.get("/topproductmonth", TopProductMonth)
router.get("/topProductRevenueDay", TopRevenueProductToday)
module.exports = router;
