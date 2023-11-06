const Joi = require('joi');

const categorySchema = Joi.object({
    category_name: Joi.string()
        .trim()
        .min(3)
        .max(30)
        .required()
        .custom((value, helpers) => {
            // Kiểm tra xem category_name có chứa toàn số không
            if (/^\d+$/.test(value)) {
                return helpers.message({ custom: 'category name không được chứa toàn số' });
            }
            return value; // Giá trị hợp lệ
        }),
        image: Joi.required().messages({
            "string.empty": "Không được để trống image",
            "any.required": "Trường image phải là bắt buộc",
          
        })
        
}).messages({
    // 'string.base': 'category name phải là một chuỗi.',
    'string.empty': 'category name không được để trống.',
    'string.min': 'category name phải có ít nhất {#limit} ký tự.',
    'string.max': 'category name không được vượt quá {#limit} ký tự.',
    'custom': 'category name không được chứa toàn số',

});

module.exports = { categorySchema };
