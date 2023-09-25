const express = require("express");
const { addCategory } = require("../component/category")
const router = express.Router();
router.post("/category/add", addCategory);
module.exports = router;