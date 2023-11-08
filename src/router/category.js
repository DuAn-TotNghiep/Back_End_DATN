const express = require("express");
const { addCategory, getAllCategory, RemoveCategory, GetAllCat, getAllCategoryNoPagination, getOneCat, updateCategory, ProductinCategory, ProductinCategorys } = require("../controller/category")
const router = express.Router();
router.post("/category/add", addCategory);
router.get('/category', getAllCategory);
router.get('/category/:id/getone', getOneCat);
router.get('/category/all', GetAllCat)
router.delete("/category/:id/remove", RemoveCategory)
router.get('/categoryNoPagination', getAllCategoryNoPagination);
router.patch('/category/:id/update', updateCategory)
router.get('/categoryNoPagination', getAllCategoryNoPagination)
router.get('/categoryproducts', ProductinCategory)
router.get("/category/:id", ProductinCategorys);
module.exports = router;