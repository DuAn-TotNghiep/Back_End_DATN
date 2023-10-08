


const express = require("express");
const { bill, getBill, getOneBill } = require("../component/bill");
const router = express.Router();
router.post('/bill/add', bill)
router.get('/bill', getBill)
router.get('/bill/:id', getOneBill)

module.exports = router;