const express = require("express");
const { actions } = require("../controller/actions");
const router = express.Router();
router.post("/action", actions);

module.exports = router;