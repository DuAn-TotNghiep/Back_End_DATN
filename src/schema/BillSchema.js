const Joi = require("joi");

const BillSchema = Joi.object({
    user_phone: Joi.string()
        .regex(/^\d{10}$/)
        .required()
        .messages({
            "string.empty": "Không được để trống số điện thoại!",
            "string.pattern.base": "Số điện thoại phải là số có đúng 10 chữ số",
        }),
    province: Joi.string()
        .trim()
        .required()
        .min(3)
        .max(50)
        .pattern(new RegExp("^[a-zA-ZÀ-ỹ\\s]+$"))
        .messages({
            "string.empty": "Không được để trống tỉnh!",
            "any.required": "Tỉnh là trường bắt buộc",
            "string.min": "Tỉnh phải có ít nhất {#limit} ký tự",
            "string.max": "Tỉnh không được vượt quá {#limit} ký tự",
            "string.pattern.base": "Tỉnh chỉ được chứa ký tự chữ và khoảng trắng",
        }),
    district: Joi.string()
        .trim()
        .required()
        .min(3)
        .max(50)
        .pattern(new RegExp("^[a-zA-ZÀ-ỹ\\s]+$"))
        .messages({
            "string.empty": "Không được để trống Huyện!",
            "any.required": "Huyện là trường bắt buộc",
            "string.min": "Huyện phải có ít nhất {#limit} ký tự",
            "string.max": "Huyện không được vượt quá {#limit} ký tự",
            "string.pattern.base": "Huyện chỉ được chứa ký tự chữ và khoảng trắng",
        }),
    ward: Joi.string()
        .trim()
        .required()
        .min(3)
        .max(50)
        .pattern(new RegExp("^[a-zA-ZÀ-ỹ\\s]+$"))
        .messages({
            "string.empty": "Không được để trống xã!",
            "any.required": "xã là trường bắt buộc",
            "string.min": "xã phải có ít nhất {#limit} ký tự",
            "string.max": "xã không được vượt quá {#limit} ký tự",
            "string.pattern.base": "xã chỉ được chứa ký tự chữ và khoảng trắng",
        }),
    address: Joi.string()
        .trim()
        .required()
        .min(5)
        .max(255)
        .pattern(new RegExp("^[a-zA-Z0-9À-ỹ\\s]+$"))
        .messages({
            "string.empty": "Không được để trống địa chỉ!",
            "any.required": "Địa chỉ là trường bắt buộc",
            "string.min": "Địa chỉ phải có ít nhất {#limit} ký tự",
            "string.max": "Địa chỉ không được vượt quá {#limit} ký tự",
            "string.pattern.base": "Địa chỉ chỉ được chứa ký tự chữ, số và khoảng trắng",
        })

});

module.exports = { BillSchema };
