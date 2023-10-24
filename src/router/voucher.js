const express = require("express");
const { voucher, AddVoucher, DeleteVoucher, UpdateVoucher, getAllVoucher, getOneVoucher } = require("../controller/voucher");

const router = express.Router();
router.get('/allVoucher', getAllVoucher)
router.post('/voucher', voucher)
router.post('/voucher/add', AddVoucher)
router.delete('/voucher/:id', DeleteVoucher)
router.get('/voucher/:id/getone', getOneVoucher)
router.patch('/voucher/:id/update', UpdateVoucher)

module.exports = router;