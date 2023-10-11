const express = require("express");
const { addCategory, getAllCategory, RemoveCategory, GetAllCat, getAllCategoryNoPagination, getOneCat, updateCategory } = require("../component/category")
const router = express.Router();
router.post("/category/add", addCategory);
router.get('/category', getAllCategory);
router.get('/category/:id', getOneCat);
router.get('/category/all', GetAllCat)
router.delete("/category/:id/remove", RemoveCategory)
router.get('/categoryNoPagination', getAllCategoryNoPagination);
router.patch('/category/:id/update', updateCategory)

module.exports = router;