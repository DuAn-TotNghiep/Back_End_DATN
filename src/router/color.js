const express = require("express");
const { addColor, getAllColor, getOneColor } = require("../controller/color")
const router = express.Router();
router.post("/color/add", addColor);
router.get("/color", getAllColor);
router.get("/color/:id", getOneColor);
module.exports = router;