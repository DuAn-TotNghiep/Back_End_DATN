const Joi = require('joi');
const colorSchema = Joi.object({
    color_name: Joi.string()
        .trim()
        .min(1)
        .max(20)
        .required()
        .regex(/^[a-zA-Z\s]+$/)
        .custom((value, helpers) => {
            if (/[\p{P}\p{S}\p{C}]/u.test(value)) {
                return helpers.error('string.containsPunctuation');
            }
            const lowercaseValue = value.toLowerCase().trim();
            if (lowercaseValue !== value) {
                return helpers.error('string.caseChange');
            }
            return value;
        }, 'noCaseChange'),
}).messages({
    'string.base': 'Color name phải là một chuỗi.',
    'string.empty': 'Color name không được để trống.',
    'string.min': 'Color name phải có ít nhất {#limit} ký tự.',
    'string.max': 'Color name không được vượt quá {#limit} ký tự.',
    'string.pattern.base': 'Color name không hợp lệ.',
    'string.caseChange': 'Color name không được viết chữ hoa',
    'string.containsPunctuation': 'Color name không được chứa dấu',
});

module.exports = { colorSchema };
