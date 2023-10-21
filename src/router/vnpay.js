const express = require("express");
const router = express.Router();

const { vnpay, vnpay_return, getOneVnpay } = require("../controller/vnpay");
router.post('/vnpay', vnpay);
router.get('/vnpay_return', vnpay_return)
router.get('/getonevnpay', getOneVnpay)
module.exports = router;