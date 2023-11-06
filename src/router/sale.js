


const express = require("express");
const { getAllSale, updateSaleProduct ,addSale} = require("../controller/sale");
const router = express.Router();

router.get("/sale", getAllSale);
router.patch("/sale/updatesaleproduct", updateSaleProduct);
router.post("/sale/add", addSale);
module.exports = router;