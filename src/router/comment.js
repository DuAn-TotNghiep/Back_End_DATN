const express = require("express");
const { AddComment } = require("../controller/comment");
const router = express.Router();
router.post("/comment/add", AddComment);
module.exports = router;