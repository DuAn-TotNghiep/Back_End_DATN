


const express = require("express");
const { addBlog, deleteBlog, updateBlog } = require("../controller/blog");
const router = express.Router();
router.post('/blog/add', addBlog)
router.delete('/blog/:id', deleteBlog)
router.patch('/blog/:id/update', updateBlog)
module.exports = router;