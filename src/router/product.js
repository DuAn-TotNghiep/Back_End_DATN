const express = require("express");
const { AddProduct } = require("../component/product");
const router = express.Router();

router.post("/product/add", AddProduct);
module.exports = router;