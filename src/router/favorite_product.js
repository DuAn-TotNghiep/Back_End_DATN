




const express = require("express");
const { addFavoriteProduct } = require("../component/favorite_product");
const router = express.Router();
router.post("/favoriteProduct/add", addFavoriteProduct);

module.exports = router;