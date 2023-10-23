const express = require("express");
const { voucher, AddVoucher, DeleteVoucher, UpdateVoucher } = require("../controller/voucher");

const router = express.Router();
router.post('/voucher', voucher)
router.post('/voucher/add', AddVoucher)
router.delete('/voucher/:id', DeleteVoucher)
router.patch('/voucher/:id/update', UpdateVoucher)

module.exports = router;