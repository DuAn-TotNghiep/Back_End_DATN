

const Joi = require('joi');
const customValidation = (value, helpers) => {
    if (Array.isArray(value) && value.length === 0) {
        return helpers.error('any.invalid');
    }
    return value;
};
const addProduct = Joi.object({
    name: Joi.string().trim().min(10).max(200).required().messages({
        "string.empty": "Khong duoc de trong name",
        "any.required": "Truong name la truong bat buoc",
        "string.min": "Truong ten phai co it nhat {#limit} ky tu",
        "string.max": "Truong ten phai co nhieu nhat {#limit} ky tu}"
    }),
    price: Joi.number().positive().required().messages({
        "number.base": "Price phai la mot so",
        "any.required": "Price phai bat buoc co",
        "number.positive": " Price phai lon hon 0 ",

    }),
    desc: Joi.string().required().messages({
        "string.empty": "Khong duoc de trong desc",
        "any.required": "Truong desc phai la bat buoc"
    }),
    color_id: Joi.array().custom(customValidation, 'custom validation').required().messages({
        "string.empty": "Khong duoc de trong color_id",
        "any.required": "Truong color_id phai la bat buoc",
        "any.invalid": "color_id khong the la mot mang rong"
    }),

    size_id: Joi.array().custom(customValidation, 'custom validation').required().messages({
        "string.empty": "Khong duoc de trong size_id",
        "any.required": "Truong size_id phai la bat buoc",
        "any.invalid": "size_id khong the la mot mang rong"
    }), category_id: Joi.number().required().messages({
        "string.empty": "Khong duoc de trong category_id",
        "any.required": "Truong category_id phai la bat buoc"
    }), image: Joi.array().custom(customValidation, 'custom validation').required().messages({
        "string.empty": "Khong duoc de trong image",
        "any.required": "Truong image phai la bat buoc",
        "any.invalid": "image khong the la mot mang rong"
    }),
})
module.exports = { addProduct };