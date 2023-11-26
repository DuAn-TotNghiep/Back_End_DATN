


const express = require("express");
const { getAllSale, updateSaleProduct, addSale, updateSale, RemoveSale, getOneSale, UpdateFlashSale, AddFlashSale, getAllFashSale, UpdateFlashSaleStatusOK, DeleteFlashSale } = require("../controller/sale");
const router = express.Router();

router.get("/sale", getAllSale);
router.get("/sale/:id", getOneSale);
router.patch("/sale/updatesaleproduct", updateSaleProduct);
router.patch("/sale/:id/update", updateSale);
router.delete("/sale/:id/remove", RemoveSale)
router.post("/sale/add", addSale);
router.patch("/sale/updateFlashSale", UpdateFlashSale);
router.post("/sale/addflashsale", AddFlashSale);
router.patch("/sale/updateflashsaleok", UpdateFlashSaleStatusOK);
router.delete("/sale/:id/deleteFlashSale", DeleteFlashSale)
router.get("/flashsale", getAllFashSale);
module.exports = router;