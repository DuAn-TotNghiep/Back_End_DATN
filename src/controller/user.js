const connect = require("../../database");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { userSignup, userSignin } = require("../schema/userSchema"); // Đảm bảo bạn đã import schema của người dùng
const verifyOTPMiddleware = require('../middleware/verify'); // Đảm bảo rằng bạn import middleware

const otps = require('../otp'); // Import biến otps từ tệp otps.js

require('dotenv').config();
const nodemailer = require('nodemailer');
const { resolve } = require("path");


const generateOTP = () => {
  const otp = Math.floor(100000 + Math.random() * 900000);
  return otp.toString();
};

const sendOTPByEmail = (email, otp) => {
  const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: process.env.USER_EMAIL,
      pass: process.env.USER_PASSWORD,
    }
  });

  const mailOptions = {
    from: process.env.USER_EMAIL,
    to: email,
    subject: 'Mã OTP xác thực',
    text: `Mã OTP của bạn là: ${otp}`
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log('Lỗi khi gửi email: ' + error);
    } else {
      console.log('Email đã được gửi: ' + info.response);
    }
  });
};

const generateAndSendOTP = (email) => {
  const otp = generateOTP();
  otps[email] = {
    otp,
    createdTime: Date.now(), // Sử dụng Date.now() để lưu thời gian tạo mã OTP
  };
  sendOTPByEmail(email, otp);
  return otp;
};


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

// Hàm tạo và gửi OTP
const generateAndSendOTPRoute = (req, res) => {
  // Lấy email từ request
  const user_email = req.body.user_email;

  // Kiểm tra email hợp lệ và gửi OTP
  if (user_email) {
    const otp = generateAndSendOTP(user_email);
    res.status(200).json({ message: "Mã OTP đã được gửi thành công", otp });
  } else {
    res.status(400).json({ message: "Email không hợp lệ" });
  }
};

// Hàm kiểm tra OTP
const verifyOTPRoute = (req, res, next) => {
  const email = req.body.email;
  const otpToCheck = req.body.otp;

  if (email && otpToCheck) {
    const isOTPValid = verifyOTP(email, otpToCheck);
    if (isOTPValid) {
      // res.status(200).json({ message: "Mã OTP hợp lệ, Xác nhận thành công" });
      next()
    } else {
      return res.status(400).json({ message: "Mã OTP không hợp lệ" });
    }
  } else {
    return res.status(400).json({ message: "Email hoặc OTP không hợp lệ" });
  }
};

const someFunctionInController = (req, res) => {
  // Lấy dữ liệu email và otp từ yêu cầu hoặc bất kỳ nguồn nào khácconst email = req.body.email;
  const otp = req.body.otp;
  // Gọi middleware và truyền dữ liệu
  verifyOTPMiddleware(req, res, email, otp);

  // Tiếp tục xử lý
  // ...
};
const Signup = async (req, res) => {
  try {
    // const { error, value } = userSignup.validate(req.body); // Sử dụng schema để kiểm tra dữ liệu

    // if (error) {
    //   // Nếu dữ liệu không hợp lệ, trả về lỗi cho client
    //   return res.status(400).json({ message: error.details[0].message });
    // }

    // Dữ liệu hợp lệ, tiếp tục xử lý đăng ký
    const {
      user_lastname,
      user_firstname,
      user_province,
      user_district,
      user_ward,
      user_address,
      user_image,
      email,
      user_password,
      user_phone,
    } = req.body;


    // Kiểm tra xem tài khoản đã tồn tại hay chưa
    const checkUserQuery = "SELECT * FROM users WHERE user_email = $1";
    const { rows } = await connect.query(checkUserQuery, [email]);

    // if (rows) {
    //   return res.status(400).json({ message: "Tài khoản đã tồn tại" });
    // }

    // Mã hóa mật khẩu
    const hashPass = await bcrypt.hash(user_password, 10);

    // Tạo tài khoản mới
    const createUserQuery = `
            INSERT INTO users (user_lastname, user_firstname, user_province, user_district, user_ward, user_address, user_image, user_email, user_password, user_phone, role )
            VALUES ('${user_lastname}', '${user_firstname}', '${user_province}', '${user_district}','${user_ward}', '${user_address}', '${user_image}', '${email}', '${hashPass}', '${user_phone}', 1)
            RETURNING *
        `;
    connect.query(createUserQuery, (err, resolve) => {
      if (err) {
        return res.status(500).json({ message: "Tài khoản đã tồn tại", err })
      }
      const data = resolve.rows[0]
      console.log(data);
      const accessToken = jwt.sign({ user_id: data.id }, "datn", {
        expiresIn: "1d",
      });

      return res.status(201).json({
        message: "Đăng ký tài khoản thành công",
        users: data,
        accessToken: accessToken,
      });
    })

  } catch (error) {
    console.error("Lỗi khi đăng ký tài khoản:", error);
    return res.status(500).json({ message: "Đã xảy ra lỗi" });
  }
};
// const Signup = async (req, res) => {
//   const { email, otpToCheck, ...userData } = req.body;
//   try {
//     if (!verifyOTP(email, otpToCheck)) {
//       return res.status(400).json({ message: "Mã OTP không hợp lệ" });
//     }

//     const { error, value } = userSignup.validate(userData);
//     if (error) {
//       return res.status(400).json({ message: error.details[0].message });
//     }

//     const {
//       user_lastname,
//       user_firstname,
//       user_province,
//       user_district,
//       user_ward,
//       user_address,
//       user_image,
//       user_password,
//       user_phone,
//       otp
//     } = value;//     // Kiểm tra xem tài khoản đã tồn tại hay chưa
//     const checkUserQuery = "SELECT * FROM users WHERE user_email = $1";
//     const { rows } = await connect.query(checkUserQuery, [email]);

//     if (rows.length > 0) {
//       return res.status(400).json({ message: "Tài khoản đã tồn tại" });
//     }

//     // Mã hóa mật khẩu
//     const hashPass = await bcrypt.hash(user_password, 10);

//     // Tạo tài khoản mới
//     const createUserQuery = `
//       INSERT INTO users (user_lastname, user_firstname, user_province, user_district, user_ward, user_address, user_image, user_email, user_password, user_phone, role,otp )
//       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 1)
//       RETURNING id, user_lastname, user_firstname, user_province, user_district, user_ward, user_address, user_image, user_email, user_password, user_phone,otp
//     `;
//     const { rows: createdUser } = await connect.query(createUserQuery, [
//       user_lastname,
//       user_firstname,
//       user_province,
//       user_district,
//       user_ward,
//       user_address,
//       user_image,
//       email, // Sử dụng email đã được xác minh
//       hashPass,
//       user_phone,
//       otp
//     ]);

//     // Tạo AccessToken
//     const accessToken = jwt.sign({ user_id: createdUser[0].id }, "datn", {
//       expiresIn: "1d",
//     });

//     return res.status(201).json({
//       message: "Đăng ký tài khoản thành công",
//       users: createdUser[0],
//       accessToken: accessToken,
//     });
//   } catch (error) {
//     console.error("Lỗi khi đăng ký tài khoản:", error);
//     res.status(500).json({ message: "Đã xảy ra lỗi" });
//   }
// };
const Signin = async (req, res) => {
  try {
    const { user_email, user_password } = req.body;

    const { error } = userSignin.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    // Kiểm tra xem tài khoản tồn tại
    const checkUserQuery = "SELECT * FROM users WHERE user_email = $1";
    const { rows } = await connect.query(checkUserQuery, [user_email]);

    if (rows.length === 0) {
      return res.status(404).json({ message: "Tài khoản không tồn tại" });
    }

    const user = rows[0];

    // Kiểm tra mật khẩu
    const isPasswordValid = await bcrypt.compare(
      user_password,
      user.user_password
    );

    if (!isPasswordValid) {
      return res.status(401).json({ message: "Mật khẩu không đúng" });
    }

    // Tạo AccessToken
    const accessToken = jwt.sign({ user_id: user.id }, "datn", {
      expiresIn: "1d",
    });

    res.status(200).json({
      message: "Đăng nhập thành công",
      user: {
        id: user.id,
        user_lastname: user.user_lastname,
        user_firstname: user.user_firstname,
        user_province: user.user_province,
        user_district: user.user_district,user_ward: user.user_ward,
        user_address: user.user_address,
        user_image: user.user_image,
        user_email: user.user_email,
        user_phone: user.user_phone,
        role: user.role,
        otp: user.otp
      },
      accessToken: accessToken,
    });
  } catch (error) {
    console.error("Lỗi khi đăng nhập:", error);
    res.status(500).json({ message: "Đã xảy ra lỗi" });
  }
};
const TopUser = async (req, res) => {
  try {
    const sql = `
            SELECT user_id, COUNT(*) as order_count
            FROM orders
            GROUP BY user_id
            ORDER BY order_count DESC
            LIMIT 10
        `;

    connect.query(sql, (err, results) => {
      if (err) {
        return res.status(500).json({ message: "Lấy top user thất bại", err });
      }

      const data = results.rows;
      return res.status(200).json({ message: "Lấy top user thành công", data });
    });
  } catch (err) {
    return res.status(500).json({ message: "Lỗi API", err });
  }
};
const GetOneUser = async (req, res) => {
  try {
    const { id } = req.params;
    const sql = `SELECT * FROM users WHERE id = ${id}`;
    connect.query(sql, (err, results) => {
      if (err) {
        return res
          .status(500)
          .json({ message: "Lấy thông tin người dùng thất bại", error: err });
      }
      const data = results.rows[0];
      return res
        .status(200)
        .json({ message: "Lấy thông tin người dùng thành công", data });
    });
  } catch (err) {
    return res.status(500).json({ message: "Lỗi API", error: err });
  }
};

const getAllUser = async (req, res) => {
  try {
    const sql = `SELECT * FROM users`;
    const results = await connect.query(sql);
    if (!results || !results.rows || results.rows.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy user nào.' });
    }
    const data = results.rows;
    return res.status(200).json({
      message: 'Lấy tất cả user thành công',
      data,
    });
  } catch (err) {
    return res.status(500).json({ message: 'Lỗi API' });
  }
}
module.exports = { Signup, Signin, TopUser, GetOneUser, getAllUser, generateAndSendOTPRoute, someFunctionInController, verifyOTPRoute };