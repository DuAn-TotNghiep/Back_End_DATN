const express = require("express");
const { getTotolDay } = require("../component/dashboard");
const router = express.Router();

router.get("/totalday", getTotolDay);

module.exports = router;
