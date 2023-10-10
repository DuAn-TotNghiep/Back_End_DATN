


const express = require("express");
const { bill, getBill, getOneBill, getOneBillInCheckOut } = require("../component/bill");
const router = express.Router();
router.post('/bill/add', bill)
router.get('/bill', getBill)
router.get('/bill/:id', getOneBill)
router.get('/bill/:id/order', getOneBillInCheckOut)
module.exports = router;