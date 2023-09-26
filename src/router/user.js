const express = require("express");
const { Signup} = require("../component/user");
const router = express.Router();
router.post("/signup", Signup);
module.exports = router;