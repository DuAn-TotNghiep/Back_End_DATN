const express = require("express");
const {addColor} = require("../component/color")
const router = express.Router();
router.post("/color/add", addColor);
module.exports = router;