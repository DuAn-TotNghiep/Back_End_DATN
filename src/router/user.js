const express = require("express");
const { Signup, Signin, TopUser, GetOneUser } = require("../component/user");

const router = express.Router();
router.post("/signup", Signup);
router.post("/signin", Signin);
router.get("/topuser", TopUser)
router.get("/user/:id/getone", GetOneUser)
module.exports = router;