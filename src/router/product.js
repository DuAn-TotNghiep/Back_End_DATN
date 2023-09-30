const express = require("express");
const { getAllProducts, AddProduct, RemoveProduct, GetOutstan, GetSale, getNewProduct } = require("../component/product");
const router = express.Router();
router.post("/product/add", AddProduct);
router.get("/product", getAllProducts)
router.get("/productnew", getNewProduct)
router.delete("/product/:id/remove", RemoveProduct);
router.get("/product/outstan", GetOutstan)
router.get("/product/sale", GetSale)
module.exports = router;