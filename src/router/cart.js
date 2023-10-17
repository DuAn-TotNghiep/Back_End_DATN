const express = require("express");
const { AddToCart, GetOneCart, deleteCart } = require("../controller/cart");
const router = express.Router();
router.post("/cart/addtocart", AddToCart);
router.get("/cart/:id", GetOneCart);
router.delete("/cart/:id", deleteCart);
module.exports = router;