const express = require("express");
const { Signup, Signin, TopUser, GetOneUser, getAllUser, generateAndSendOTPRoute, verifyOTPRoute, updateProfile, SigninProfile, ForgotPassword, updateAddress, updateBlockUser, ChangePassword } = require("../controller/user");
const { verifyOTPMiddleware } = require("../middleware/verify");

const router = express.Router();
router.post("/signin", Signin);
router.post("/signinprofile", SigninProfile);
router.get("/topuser", TopUser)
router.get('/user', getAllUser)
router.get("/user/:id/getone", GetOneUser)
router.post("/signup", verifyOTPMiddleware, verifyOTPRoute, Signup);
router.post("/sendOtp", verifyOTPMiddleware, generateAndSendOTPRoute);
router.post("/verifyOtp", verifyOTPMiddleware, verifyOTPRoute);
router.patch('/user/:id/update', updateProfile)
router.patch('/user/:id/updateaddress', updateAddress)
router.post("/forgotpassword", verifyOTPMiddleware, verifyOTPRoute, ForgotPassword);
router.patch("/user/blockuser", updateBlockUser);
router.patch("/changepassword",  ChangePassword);
module.exports = router;