const express = require("express");
const { GetALlBook, getAllProducts } = require("../component/product");
const router = express.Router();

router.get("/color", GetALlBook);
router.get("/product", getAllProducts)
module.exports = router;