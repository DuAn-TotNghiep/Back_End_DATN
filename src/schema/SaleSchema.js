const Joi = require('joi');

const SaleSchema = Joi.object({
    sale_distcount: Joi.number()
        .min(0)
        .max(100)
        .required()
        .messages({
            'number.base': 'sale_discount phải là một số.',
            'number.min': 'sale_discount phải lớn hơn hoặc bằng {#limit}',
            'number.max': 'sale_discount phải nhỏ hơn hoặc bằng {#limit}',
            'any.required': 'sale_discount không được để trống.'
        }),
    sale_name: Joi.string()
        .trim()
        .min(3)
        .max(30)
        .required()
        .custom((value, helpers) => {
            // Kiểm tra xem sale_name có chứa toàn số không
            if (/^\d+$/.test(value)) {
                return helpers.message({ custom: 'sale_name không được chứa toàn số' });
            }
            return value; // Giá trị hợp lệ
        })
        .messages({
            'string.base': 'sale_name phải là một chuỗi.',
            'string.empty': 'sale_name không được để trống.',
            'string.min': 'sale_name phải có ít nhất {#limit} ký tự.',
            'string.max': 'sale_name không được vượt quá {#limit} ký tự.',
            'custom': 'sale_name không được chứa toàn số'
        })
});

module.exports = { SaleSchema };
