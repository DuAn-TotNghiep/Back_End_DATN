


const express = require("express");
const { getAllSale } = require("../component/sale");
const router = express.Router();

router.get("/sale", getAllSale);
module.exports = router;