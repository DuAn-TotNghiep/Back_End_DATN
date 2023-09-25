


const express = require("express");
const { addSize } = require("../component/size");
const router = express.Router();
router.post("/size/add", addSize);
module.exports = router;