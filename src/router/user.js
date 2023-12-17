const express = require("express");
const { Signup, Signin, TopUser, GetOneUser, getAllUser, generateAndSendOTPRoute, verifyOTPRoute, updateProfile, SigninProfile, ForgotPassword, updateAddress, updateBlockUser, ChangePassword, SigninNoToken, updateProfile1 } = require("../controller/user");
const { verifyOTPMiddleware } = require("../middleware/verify");

const router = express.Router();
router.post("/signin", Signin);
router.post("/signinnotoken", SigninNoToken);
router.post("/signinprofile", SigninProfile);
router.get("/topuser", TopUser)
router.get('/user', getAllUser)
router.get("/user/:id/getone", GetOneUser)
router.post("/signup", verifyOTPMiddleware, verifyOTPRoute, Signup);
router.post("/sendOtp", verifyOTPMiddleware, generateAndSendOTPRoute);
router.post("/verifyOtp", verifyOTPMiddleware, verifyOTPRoute);
router.patch('/user/:id/update',verifyOTPMiddleware, verifyOTPRoute, updateProfile)
router.patch('/user/:id/update1',updateProfile1)
router.patch('/user/:id/updateaddress', updateAddress)
router.post("/forgotpassword", verifyOTPMiddleware, verifyOTPRoute, ForgotPassword);
router.patch("/user/blockuser", updateBlockUser);
router.patch("/changepassword",  ChangePassword);
module.exports = router;