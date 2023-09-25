const express = require("express");
const { getAllProducts, AddProduct } = require("../component/product");
const router = express.Router();
router.get("/product", getAllProducts)
router.post("/product/add", AddProduct);
module.exports = router;