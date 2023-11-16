const Joi = require("joi");

const sizeSchema = Joi.object({
    size_name: Joi.string()
        // .valid('S', 'M', 'L', 'XL', '2XL', '3XL', '4XL')
        // .regex(/^[SMXL234]{1}$/) // Sử dụng regex để chỉ cho phép chữ cái in hoa trong danh sách ['S', 'M', 'X', 'L', '2', '3', '4'] với độ dài bằng 1.
        .required()
        .min(1)
        .max(5)
        .regex(/^[A-Z]*[A-Z][A-Z]*$/)
        .required()
        .trim()
        .messages({
            'string.base': 'Kích thước phải là chuỗi.',
            'any.required': 'Kích thước là trường bắt buộc.',
            'string.empty': 'Kích thước không được để trống.',
            'string.min': 'Kích thước phải có ít nhất 1 kí tự.',
            'string.max': 'Kích thước không được quá 5 kí tự.',
            'string.pattern.base': 'Kích thước phải là chữ cái in hoa, ít nhất một kí tự, nhiều nhất bốn kí tự.',
            // 'any.only': 'Kích thước phải là một trong các giá trị: S, M, L, XL, 2XL, 3XL, 4XL.',
            // 'string.pattern.base': 'Kích thước phải là một trong các giá trị: S, M, L, XL, 2XL, 3XL, 4XL (viết hoa).',
        }),
});

module.exports = { sizeSchema };
