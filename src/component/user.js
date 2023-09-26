const connect = require('../../database');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { userSignup, userSignin } = require('../schema/userSchema'); // Đảm bảo bạn đã import schema của người dùng

const Signup = async (req, res) => {
    try {
        const { error, value } = userSignup.validate(req.body); // Sử dụng schema để kiểm tra dữ liệu

        if (error) {
            // Nếu dữ liệu không hợp lệ, trả về lỗi cho client
            return res.status(400).json({ message: error.details[0].message });
        }

        // Dữ liệu hợp lệ, tiếp tục xử lý đăng ký
        const { user_lastname, user_firstname, user_province, user_district, user_ward, user_address, user_image, user_email, user_password, user_phone } = value;

        // Kiểm tra xem tài khoản đã tồn tại hay chưa
        const checkUserQuery = 'SELECT * FROM users WHERE user_email = $1';
        const { rows } = await connect.query(checkUserQuery, [user_email]);

        if (rows.length > 0) {
            return res.status(400).json({ message: 'Tài khoản đã tồn tại' });
        }

        // Mã hóa mật khẩu
        const hashPass = await bcrypt.hash(user_password, 10);

        // Tạo tài khoản mới
        const createUserQuery = `
            INSERT INTO users (user_lastname, user_firstname, user_province, user_district, user_ward, user_address, user_image, user_email, user_password, user_phone, role )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 1)
            RETURNING id, user_lastname, user_firstname, user_province, user_district, user_ward, user_address, user_image, user_email, user_password, user_phone
        `;
        const { rows: createdUser } = await connect.query(createUserQuery, [
            user_lastname, user_firstname, user_province, user_district, user_ward, user_address, user_image, user_email, hashPass, user_phone
        ]);

        // Tạo AccessToken
        const accessToken = jwt.sign({ user_id: createdUser[0].id }, 'datn', { expiresIn: '1d' });

        res.status(201).json({
            message: 'Đăng ký tài khoản thành công',
            users: createdUser[0],
            accessToken: accessToken
        });

    } catch (error) {
        console.error('Lỗi khi đăng ký tài khoản:', error);
        res.status(500).json({ message: 'Đã xảy ra lỗi' });
    }
}
const Signin = async (req, res) => {
    try {
        const { user_email, user_password } = req.body;

  
        const { error } = userSignin.validate(req.body);
        if (error) {
            return res.status(400).json({ message: error.details[0].message });
        }

        // Kiểm tra xem tài khoản tồn tại
        const checkUserQuery = 'SELECT * FROM users WHERE user_email = $1';
        const { rows } = await connect.query(checkUserQuery, [user_email]);

        if (rows.length === 0) {
            return res.status(404).json({ message: 'Tài khoản không tồn tại' });
        }

        const user = rows[0];

        // Kiểm tra mật khẩu
        const isPasswordValid = await bcrypt.compare(user_password, user.user_password);

        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Mật khẩu không đúng' });
        }

        // Tạo AccessToken
        const accessToken = jwt.sign({ user_id: user.user_id }, 'datn', { expiresIn: '1d' });

        res.status(200).json({
            message: 'Đăng nhập thành công',
            user: {
                id: user.id,
                user_lastname: user.user_lastname,
                user_firstname: user.user_firstname,
                user_province: user.user_province,
                user_district: user.user_district,
                user_ward: user.user_ward,
                user_address: user.user_address,
                user_image: user.user_image,
                user_email: user.user_email,
                user_phone: user.user_phone,
            },
            accessToken: accessToken
        });

    } catch (error) {
        console.error('Lỗi khi đăng nhập:', error);
        res.status(500).json({ message: 'Đã xảy ra lỗi' });
    }
};
module.exports = { Signup,Signin };
