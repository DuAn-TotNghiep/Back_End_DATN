const express = require("express");
const { getAllProducts, AddProduct, RemoveProduct, GetOutstan, GetSale, getNewProduct, searchProduct, GetOneProduct } = require("../component/product");
const router = express.Router();
router.post("/product/add", AddProduct);
router.get("/product", getAllProducts);
router.get("/productnew", getNewProduct);
router.get('/product/search', searchProduct)
router.delete("/product/:id/remove", RemoveProduct);
router.get("/product/outstan", GetOutstan);
router.get("/product/sale", GetSale);
router.get("/product/:id/getone", GetOneProduct);
module.exports = router;