const express = require("express");
const { addCategory, getAllCategory, RemoveCategory } = require("../component/category")
const router = express.Router();
router.post("/category/add", addCategory);
router.get('/category', getAllCategory)
router.delete("/category/:id/remove", RemoveCategory)
module.exports = router;