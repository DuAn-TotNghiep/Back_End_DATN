const express = require("express");
const { getTotalDay, getTotalWeek } = require("../component/dashboard");

const router = express.Router();

router.get("/totalday", getTotalDay);
router.get("/totalweek", getTotalWeek);
router.get("/totalmonth", getTotalWeek);
module.exports = router;
