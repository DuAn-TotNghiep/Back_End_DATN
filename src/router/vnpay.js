const express = require("express");
const router = express.Router();

const { vnpay } = require("../controller/vnpay");
router.post('/vnpay', vnpay);

module.exports = router;