


const express = require("express");
const { addBlog, deleteBlog, updateBlog, getAllBlog, getOneBlog, searchBlog } = require("../controller/blog");
const router = express.Router();
router.get('/blog', getAllBlog)
router.post('/blog/add', addBlog)
router.post('/blog/search', searchBlog)
router.delete('/blog/:id', deleteBlog)
router.get('/blog/:id', getOneBlog)
router.patch('/blog/:id/update', updateBlog)
module.exports = router;