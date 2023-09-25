const express = require("express");
const { GetALlBook } = require("../component/product");
const router = express.Router();

router.get("/color", GetALlBook);
module.exports = router;