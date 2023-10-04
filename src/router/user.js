const express = require("express");
const { Signup, Signin, TopUser} = require("../component/user");

const router = express.Router();
router.post("/signup", Signup);
router.post("/signin", Signin);
router.get("/topuser", TopUser)
module.exports = router;