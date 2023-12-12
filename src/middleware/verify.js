const otps = require('../otp'); // Import biến otps từ tệp otps.js

const verifyOTP = (email, otpToCheck) => {
    const storedOTP = otps[email];
    if (storedOTP) {
        const { otp, createdTime } = storedOTP;
        const currentTime = Date.now(); // Sử dụng Date.now() để lấy thời gian hiện tại
        // Kiểm tra thời gian tạo mã OTP có cách đây ít phút không
        if (currentTime - createdTime <= 5 * 60 * 1000) { // 5 phút
            return otpToCheck === otp;
        }
    }
    return false;
};


const verifyOTPMiddleware = (req, res, next) => {
    const email = req.body.email;
    const otpToCheck = req.body.otp;
    const userId = req.params.id;
    // console.log(email, otpToCheck);
    if (req.path === "/sendOtp") {
        // Nếu yêu cầu là để gửi OTP, không kiểm tra OTP mà chấp nhận
        next();
    } else if (req.path === "/signup" || req.path === "/forgotpassword" || req.path === `/user/${userId}/update`) {
        // Nếu yêu cầu là để xác minh OTP
        if (email && otpToCheck) {
            console.log(email);
            const isOTPValid = verifyOTP(email, otpToCheck);
            console.log(isOTPValid);
            if (isOTPValid) {
                // Nếu OTP hợp lệ, tiếp tục xử lý yêu cầu
                next();
            } else {
                res.status(400).json({ message: "Mã OTP không hợp lệ" });
            }
        } else {
            res.status(400).json({ message: "Email hoặc OTP không hợp lệ" });
        }
    }
};

module.exports = { verifyOTPMiddleware };