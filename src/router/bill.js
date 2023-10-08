


const express = require("express");
const { bill, getBill } = require("../component/bill");
const router = express.Router();
router.post('/bill/add', bill)
router.get('/bill', getBill)

module.exports = router;