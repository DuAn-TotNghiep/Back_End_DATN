const connect = require("../../database");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { userSignup, userSignin } = require("../schema/userSchema"); // Đảm bảo bạn đã import schema của người dùng
const verifyOTPMiddleware = require('../middleware/verify'); // Đảm bảo rằng bạn import middleware
const io = require("../../app");
const otps = require('../otp'); // Import biến otps từ tệp otps.js

require('dotenv').config();
const nodemailer = require('nodemailer');
const { resolve } = require("path");
const { log } = require("console");


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
console.log(rows );
    if (rows == []) {
      return res.status(400).json({ message: "Tài khoản đã tồn tại" });
    }
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

    if (user.block) {
      return res.status(403).json({ message: "Tài khoản của bạn đã bị chặn" });
    }
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
        user_district: user.user_district, user_ward: user.user_ward,
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
const SigninNoToken = async (req, res) => {
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

    if (user.block) {
      return res.status(403).json({ message: "Tài khoản của bạn đã bị chặn" });
    }
    // Kiểm tra mật khẩu
    const isPasswordValid = await bcrypt.compare(
      user_password,
      user.user_password
    );
    const accessToken = jwt.sign({ user_id: user.id }, "datn");
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Mật khẩu không đúng" });
    }


    res.status(200).json({
      message: "Đăng nhập thành công",
      user: {
        id: user.id,
        user_lastname: user.user_lastname,
        user_firstname: user.user_firstname,
        user_province: user.user_province,
        user_district: user.user_district, user_ward: user.user_ward,
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
const SigninProfile = async (req, res) => {
  try {
    const { user_email, user_password } = req.body;



    // Kiểm tra xem tài khoản tồn tại
    const checkUserQuery = "SELECT * FROM users WHERE user_email = $1";
    const { rows } = await connect.query(checkUserQuery, [user_email]);

    if (rows.length === 0) {
      return res.status(404).json({ message: "Tài khoản không tồn tại" });
    }

    const user = rows[0];

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
        user_district: user.user_district, user_ward: user.user_ward,
        user_address: user.user_address,
        user_image: user.user_image,
        user_email: user.user_email,
        user_phone: user.user_phone,
        role: user.role,
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
            WHERE user_id IS NOT NULL
            GROUP BY user_id
            ORDER BY order_count DESC
            LIMIT 3
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
    const sql = `SELECT * FROM users ORDER BY id ASC`;
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
const updateProfile = async (req, res) => {
  try {
    const userId = req.params.id;
    const { user_lastname, user_firstname, user_province, user_ward, user_district, user_address, user_image,email, user_phone } = req.body;

    // Kiểm tra xem sản phẩm có tồn tại không
    const sql1 = `SELECT * FROM users WHERE id = ${userId}`;
    connect.query(sql1, (err, result) => {
      if (err) {
        return res.status(500).json({ message: 'Lỗi truy vấn cơ sở dữ liệu', err });
      }

      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'Tài khoản không tồn tại' });
      }

      // Sản phẩm tồn tại, tiến hành cập nhật
      const sql2 = `
            UPDATE users
            SET
            user_lastname='${user_lastname}',
            user_firstname='${user_firstname}',
            user_province ='${user_province}',
            user_ward ='${user_ward}',
            user_district ='${user_district}',
            user_address ='${user_address}',
            user_image = '${user_image}',
            user_email = '${email}',
            user_phone='${user_phone}'
            WHERE id=${userId}
            RETURNING *`;

      connect.query(sql2, (err, result) => {
        if (err) {  
          return res.status(500).json({ message: 'Lỗi không thể cập nhật thông tin', err });
          console.log(err);

        }

        const data = result.rows[0];
        return res.status(200).json({ message: 'Sửa thông tin thành công', data });
      });
    });
  } catch (err) {
    return res.status(500).json({ message: 'Lỗi API', err });
  }
}
const updateProfile1 = async (req, res) => {
  try {
    const userId = req.params.id;
    const { user_lastname, user_firstname, user_phone ,user_image} = req.body;

    // Kiểm tra xem sản phẩm có tồn tại không
    const sql1 = `SELECT * FROM users WHERE id = ${userId}`;
    connect.query(sql1, (err, result) => {
      if (err) {
        return res.status(500).json({ message: 'Lỗi truy vấn cơ sở dữ liệu', err });
      }

      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'Tài khoản không tồn tại' });
      }

      // Sản phẩm tồn tại, tiến hành cập nhật
      const sql2 = `
            UPDATE users
            SET
            user_lastname='${user_lastname}',
            user_firstname='${user_firstname}',
            user_phone='${user_phone}',
            user_image='${user_image}'
            WHERE id=${userId}
            RETURNING *`;

      connect.query(sql2, (err, result) => {
        if (err) {
          return res.status(500).json({ message: 'Lỗi không thể cập nhật thông tin', err });
          console.log(err);

        }

        const data = result.rows[0];
        return res.status(200).json({ message: 'Sửa thông tin thành công', data });
      });
    });
  } catch (err) {
    return res.status(500).json({ message: 'Lỗi API', err });
  }
}
const updateAddress = async (req, res) => {
  try {
    const userId = req.params.id;

    const { user_province, user_ward, user_district, user_address } = req.body;

    // Kiểm tra xem sản phẩm có tồn tại không
    const sql1 = `SELECT * FROM users WHERE id = ${userId}`;
    connect.query(sql1, (err, result) => {
      if (err) {
        return res.status(500).json({ message: 'Lỗi truy vấn cơ sở dữ liệu', err });
      }

      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'Tài khoản không tồn tại' });
      }

      // Sản phẩm tồn tại, tiến hành cập nhật
      const sql2 = `
            UPDATE users
            SET
            user_province ='${user_province}',
            user_ward ='${user_ward}',
            user_district ='${user_district}',
            user_address ='${user_address}'
            WHERE id=${userId}
            RETURNING *`;

      connect.query(sql2, (err, result) => {
        if (err) {
          return res.status(500).json({ message: 'Lỗi không thể cập nhật thông tin', err });
        }

        const data = result.rows[0];
        return res.status(200).json({ message: 'Sửa thông tin thành công', data });
      });
    });
  } catch (err) {
    return res.status(500).json({ message: 'Lỗi API', err });
  }
}
const ForgotPassword = async (req, res) => {
  try {
    const { email, new_password } = req.body;

    // Kiểm tra xem tài khoản tồn tại
    const checkUserQuery = "SELECT * FROM users WHERE user_email = $1";
    const { rows } = await connect.query(checkUserQuery, [email]);

    if (rows.length === 0) {
      return res.status(404).json({ message: "Tài khoản không tồn tại" });
    }

    const user = rows[0];

    // Cập nhật mật khẩu mới
    const hashedNewPassword = await bcrypt.hash(new_password, 10);

    const updatePasswordQuery = "UPDATE users SET user_password = $1 WHERE id = $2";
    await connect.query(updatePasswordQuery, [hashedNewPassword, user.id]);

    res.status(200).json({ message: "Cập nhật mật khẩu thành công" });
  } catch (error) {
    console.error("Lỗi khi cập nhật mật khẩu:", error);
    res.status(500).json({ message: "Đã xảy ra lỗi" });
  }
}
const updateBlockUser = async (req, res) => {
  try {
    const { block, id } = req.body;

    const checkAdminQuery = "SELECT role FROM users WHERE id = $1";
    const { rows } = await connect.query(checkAdminQuery, [id]);

    if (rows.length > 0 && rows[0].role === 0) {
      return res.status(403).json({ message: "Không thể block admin" });
    }

    let sql = `UPDATE users SET block = ${block} WHERE id = ${id}`;

    connect.query(sql, (err, result) => {
      if (err) {
        return res.status(500).json({ message: "Block user thất bại", err });
      }

      // const data = result.rows[0];
      // console.log(data);
      io.emit("blockuser", { message: "Cập nhật trạng thái user thành công" });
      return res.status(200).json({ message: "Cập nhật trạng thái user thành công" });
    });
  } catch (error) {
    return res.status(500).json({ message: "Lỗi API" });
  }
};
const ChangePassword = async (req, res) => {
  try {
    const { userId, currentPassword, newPassword } = req.body;

    // Kiểm tra xem userId tồn tại và lấy thông tin người dùng từ cơ sở dữ liệu
    const getUserQuery = "SELECT * FROM users WHERE id = $1";
    const { rows } = await connect.query(getUserQuery, [userId]);

    if (rows.length === 0) {
      return res.status(404).json({ message: "Người dùng không tồn tại" });
    }

    const user = rows[0];

    // Kiểm tra mật khẩu hiện tại có khớp không
    const passwordMatch = await bcrypt.compare(currentPassword, user.user_password);

    if (!passwordMatch) {
      return res.status(400).json({ message: "Mật khẩu hiện tại không đúng" });
    }

    // Mã hóa mật khẩu mới và cập nhật vào cơ sở dữ liệu
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    const updatePasswordQuery = "UPDATE users SET user_password = $1 WHERE id = $2";
    await connect.query(updatePasswordQuery, [hashedNewPassword, userId]);

    res.status(200).json({ message: "Cập nhật mật khẩu thành công" });
  } catch (error) {
    console.error("Lỗi khi cập nhật mật khẩu:", error);
    res.status(500).json({ message: "Đã xảy ra lỗi" });
  }
}

module.exports = { SigninNoToken, ChangePassword, ForgotPassword, updateProfile1, Signup, updateAddress, Signin, SigninProfile, TopUser, GetOneUser, getAllUser, generateAndSendOTPRoute, someFunctionInController, verifyOTPRoute, updateProfile, updateBlockUser };