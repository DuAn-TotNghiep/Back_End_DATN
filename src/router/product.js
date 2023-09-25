const express = require("express");
const { GetALlBook, getAllProducts } = require("../component/product");
const router = express.Router();

router.get("/product", getAllProducts)
const { AddProduct } = require("../component/product");
const router = express.Router();

router.post("/product/add", AddProduct);
module.exports = router;