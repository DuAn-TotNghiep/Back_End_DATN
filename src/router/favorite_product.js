




const express = require("express");
const { addFavoriteProduct, getAllFavorite } = require("../component/favorite_product");
const router = express.Router();
router.post("/favoriteProduct/add", addFavoriteProduct);
router.get("/favoriteProduct", getAllFavorite)

module.exports = router;