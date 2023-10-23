


const express = require("express");
const { getAllSale, updateSaleProduct } = require("../controller/sale");
const router = express.Router();

router.get("/sale", getAllSale);
router.patch("/sale/updatesaleproduct", updateSaleProduct);
module.exports = router;