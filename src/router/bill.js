


const express = require("express");
const { bill } = require("../component/bill");
const router = express.Router();
router.post('/bill/add', bill)

module.exports = router;