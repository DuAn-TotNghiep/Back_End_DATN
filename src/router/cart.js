const express = require("express");
const { AddToCart, GetOneCart } = require("../controller/cart");
const router = express.Router();
router.post("/cart/addtocart", AddToCart);
router.get("/cart/:id", GetOneCart);
module.exports = router;