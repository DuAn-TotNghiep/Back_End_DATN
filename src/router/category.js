const express = require("express");
const { addCategory, getAllCategory } = require("../component/category")
const router = express.Router();
router.post("/category/add", addCategory);
router.get('/category', getAllCategory)
module.exports = router;