const express = require("express");
const { AddComment, GetAllCommentProduct, getAllComment } = require("../controller/comment");
const router = express.Router();
router.post("/comment/add", AddComment);
router.get("/comment/:id/product", GetAllCommentProduct);
router.get("/comment", getAllComment);
module.exports = router;