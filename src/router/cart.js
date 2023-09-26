const express = require("express");
const { AddToCart } = require("../component/cart");
const router = express.Router();
router.post("/addtocart", AddToCart);

module.exports = router;