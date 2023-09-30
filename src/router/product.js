const express = require("express");
const { getAllProducts, AddProduct, RemoveProduct, GetOutstan } = require("../component/product");
const router = express.Router();
router.get("/product", getAllProducts)
router.post("/product/add", AddProduct);
router.delete("/product/:id/remove", RemoveProduct);
router.get("/product/outstan", GetOutstan)
module.exports = router;