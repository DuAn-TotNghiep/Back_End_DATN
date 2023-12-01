


const express = require("express");
const { bill, getBill, getOneBill, getOneBillInCheckOut, updateBill, getOneBill2 } = require("../controller/bill");
const router = express.Router();
router.post('/bill/add', bill)
router.get('/bill', getBill)
router.get('/bill/:id', getOneBill)
router.get('/bill/:id/getone', getOneBill2)
router.get('/bill/:id/order', getOneBillInCheckOut)
router.patch('/bill/:id/update', updateBill)
module.exports = router;