const Joi = require('joi');

const userSchema = Joi.object({
    user_firstname: Joi.string().trim().min(1).required().messages({
        "string.empty": "Không được để trống tên",
        "any.required": "Tên là trường bắt buộc",
    }),

    user_lastname: Joi.string().trim().min(1).required().messages({
        "string.empty": "Không được để trống họ",
        "any.required": "Họ là trường bắt buộc",
    }),

    user_email: Joi.string().trim().email().required().messages({
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
        "any.required": "Địa chỉ là trường bắt buộc",
    }),

    user_province: Joi.string().allow('').messages({
        "any.required": "Tỉnh/thành phố là trường bắt buộc",
    }),
    user_district: Joi.string().allow('').messages({
   
        "any.required": "Quận/huyện là trường bắt buộc",
    }),

    user_ward: Joi.string().allow('').messages({
      
        "any.required": "Phường/xã là trường bắt buộc",
    }),

    user_phone: Joi.string().trim().required().messages({
        "string.empty": "Không được để trống số điện thoại",
        "any.required": "Số điện thoại là trường bắt buộc",
    }),
    
    user_image: Joi.string().allow('').messages({
       
        "any.required": "Image là trường bắt buộc",
    }),

});

module.exports = { userSchema };
