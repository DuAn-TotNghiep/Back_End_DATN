
const express = require("express");
const { addFavoriteProduct, getAllFavorite, deleteFavoriteProduct } = require("../controller/favorite_product");
const router = express.Router();
router.post("/favoriteProduct/add", addFavoriteProduct);
router.get("/favoriteProduct", getAllFavorite)
router.delete("/favoriteProduct/:id", deleteFavoriteProduct)
module.exports = router;