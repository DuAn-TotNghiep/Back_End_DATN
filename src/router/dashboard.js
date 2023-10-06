const express = require("express");
const { getTotalDay, getTotalWeek, TopProductToday, TopProductWeek } = require("../component/dashboard");

const router = express.Router();

router.get("/totalday", getTotalDay);
router.get("/totalweek", getTotalWeek);
router.get("/totalmonth", getTotalWeek);
router.get("/topproduct", TopProductToday)
router.get("/topproductweek", TopProductWeek)
module.exports = router;
