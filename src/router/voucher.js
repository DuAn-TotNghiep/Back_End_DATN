const express = require("express");
const { voucher, AddVoucher, DeleteVoucher, UpdateVoucher, getAllVoucher, getOneVoucher, getAllVoucherRule } = require("../controller/voucher");

const router = express.Router();
router.get('/allVoucher', getAllVoucher)
router.get('/getAllVoucherRule', getAllVoucherRule)
router.post('/voucher', voucher)
router.post('/voucher/add', AddVoucher)
router.delete('/voucher/:id', DeleteVoucher)
router.get('/voucher/:id/getone', getOneVoucher)
router.patch('/voucher/:id/update', UpdateVoucher)

module.exports = router;