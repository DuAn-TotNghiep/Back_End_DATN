const express = require("express");
const { voucher, AddVoucher } = require("../controller/voucher");

const router = express.Router();
router.post('/voucher', voucher)
router.post('/voucher/add', AddVoucher)

module.exports = router;