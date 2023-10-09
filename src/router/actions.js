const express = require("express");
const { actions } = require("../component/actions");
const router = express.Router();
router.post("/action", actions);

module.exports = router;