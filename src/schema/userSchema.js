const Joi = require('joi');

const userSignup = Joi.object({
    user_firstname: Joi.string().trim().min(1).required().messages({
        "string.empty": "Không được để trống tên",
     
    }),

    user_lastname: Joi.string().trim().min(1).required().messages({
        "string.empty": "Không được để trống họ",
    
    }),

    email: Joi.string().trim().email().required().messages({
        "string.empty": "Không được để trống email",
        "any.required": "Email là trường bắt buộc",
        "string.email": "Email không hợp lệ",
    }),

    user_password: Joi.string().min(6).required().messages({
        "string.empty": "Không được để trống mật khẩu",
        "any.required": "Mật khẩu là trường bắt buộc",
        "string.min": "Mật khẩu phải có ít nhất {#limit} ký tự",
    }),

    user_address: Joi.string().allow('').messages({
        "string.empty": "Không được để trống địa chỉ",

    }),

    user_province: Joi.string().allow('').messages({
        "string.empty": "Không được để trống Tỉnh/Thành phố",
    }),
    user_district: Joi.string().allow('').messages({
   
        "string.empty": "Không được để trống Huyện",
    }),

    user_ward: Joi.string().allow('').messages({
      
        "string.empty": "Không được để trống Phường",
    }),

    user_phone: Joi.string().trim().required().messages({
        "string.empty": "Không được để trống số điện thoại",
        "any.required": "Số điện thoại là trường bắt buộc",
    }),
    
    user_image: Joi.string().allow('').messages({
       
        "string.empty": "Không được để trống image",
    }),

});
const userSignin = Joi.object({
    user_email: Joi.string().trim().email().required().messages({
        "string.empty": "Không được để trống email",
        "any.required": "Email là trường bắt buộc",
        "string.email": "Email không hợp lệ",
    }),

    user_password: Joi.string().required().messages({
        "string.empty": "Không được để trống mật khẩu",
        "any.required": "Mật khẩu là trường bắt buộc",
    }),
});

module.exports = { userSignup,userSignin };
