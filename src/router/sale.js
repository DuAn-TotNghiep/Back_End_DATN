


const express = require("express");
const { getAllSale, updateSaleProduct ,addSale, updateSale, RemoveSale} = require("../controller/sale");
const router = express.Router();

router.get("/sale", getAllSale);
router.patch("/sale/updatesaleproduct", updateSaleProduct);
router.patch("/sale/:id/update", updateSale);
router.delete("/sale/:id/remove", RemoveSale)
router.post("/sale/add", addSale);
module.exports = router;