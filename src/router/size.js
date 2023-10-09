


const express = require("express");
const { addSize, getAllSize, GetOneSize } = require("../component/size");
const router = express.Router();
router.post("/size/add", addSize);
router.get("/size", getAllSize);
router.get("/size/:id", GetOneSize);
module.exports = router;