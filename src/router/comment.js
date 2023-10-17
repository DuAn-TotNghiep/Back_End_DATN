const express = require("express");
const { AddComment, GetAllCommentProduct } = require("../controller/comment");
const router = express.Router();
router.post("/comment/add", AddComment);
router.get("/comment/:id/product", GetAllCommentProduct);
module.exports = router;