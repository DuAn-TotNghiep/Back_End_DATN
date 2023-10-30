const express = require("express");

const { getTotalDay, getTotalWeek, TopProductToday, TopProductWeek, TopProductMonth, getTotalMonth, TopRevenueProductToday, TopRevenueProductThisWeek, TopRevenueProductThisMonth, TopRevenueProductFromStartOfLastMonth, CountPaymentOff, getTotalPerMonth, getTotalPerDay, GetTotalDasboard, getDailyEarnings, getDaily, getActionDaily } = require("../controller/dashboard");

// const { getTotalDay, getTotalWeek, TopProductToday, TopProductWeek, TopProductMonth, getTotalMonth, TopRevenueProductToday, TopRevenueProductThisWeek, TopRevenueProductThisMonth, TopRevenueProductFromStartOfLastMonth, CountPaymentOff, getTotalPerMonth } = require("../controller/dashboard");


const router = express.Router();

router.get("/totalday", getTotalDay);
router.get("/totalweek", getTotalWeek);
router.get("/totalmonth", getTotalMonth);
router.post('/totaldasboard', getDailyEarnings);
router.post('/totaldaily', getDaily);
router.post('/actiondaily', getActionDaily);
router.get("/topproduct", TopProductToday)
router.get("/topproductweek", TopProductWeek)
router.get("/topproductmonth", TopProductMonth)
router.get("/topproductpermonth", getTotalPerMonth)
router.get("/topproductperday", getTotalPerDay)
router.get("/topProductRevenueDay", TopRevenueProductToday)
router.get("/topProductRevenueWeek", TopRevenueProductThisWeek)
router.get("/topProductRevenueMonth", TopRevenueProductThisMonth)
router.get("/countPaymentOff", CountPaymentOff)


module.exports = router;
