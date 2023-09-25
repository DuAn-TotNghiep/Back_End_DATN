const Joi = require('joi');
const categorySchema = Joi.object({
    category_name: Joi.string()
        .trim()
        .min(3)
        .max(30)
        .required()
}).messages({
    'string.base': 'category name phải là một chuỗi.',
    'string.empty': 'category name không được để trống.',
    'string.min': 'category name phải có ít nhất {#limit} ký tự.',
    'string.max': 'category name không được vượt quá {#limit} ký tự.',
});

module.exports = { categorySchema };