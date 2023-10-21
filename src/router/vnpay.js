const express = require("express");
const router = express.Router();

const { vnpay, vnpay_return } = require("../controller/vnpay");
router.post('/vnpay', vnpay);
router.get('/vnpay_return', vnpay_return)

module.exports = router;