const express = require("express");
const {addColor, getAllColor} = require("../component/color")
const router = express.Router();
router.post("/color/add", addColor);
router.get("/color", getAllColor);
module.exports = router;