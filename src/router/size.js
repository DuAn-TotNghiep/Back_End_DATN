


const express = require("express");
const { addSize, getAllSize } = require("../component/size");
const router = express.Router();
router.post("/size/add", addSize);
router.get("/size", getAllSize);
module.exports = router;