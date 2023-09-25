const express = require("express");
const { getAllProducts, AddProduct, RemoveProduct } = require("../component/product");
const router = express.Router();
router.get("/product", getAllProducts)
router.post("/product/add", AddProduct);
router.delete("/product/:id/remove", RemoveProduct);
module.exports = router;