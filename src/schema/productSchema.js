

const Joi = require('joi');
const customValidation = (value, helpers) => {
    if (Array.isArray(value) && value.length === 0) {
        return helpers.error('any.invalid');
    }
    return value;
};
const addProduct = Joi.object({
    name: Joi.string().trim().min(10).max(200).required().regex(/^[A-Za-z\s]+$/).messages({
        "string.empty": "Không được để trống name",
        "any.required": "Trường name là trường bắt buộc",
        "string.min": "Trường tên phải có ít nhất {#limit} ký tự",
        "string.max": "Trường tên phải có nhiều nhất {#limit} ký tự",
        "string.pattern.base": "Trường name chỉ cho phép nhập chữ và khoảng trắng"
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
const updateProduct = Joi.object({
    name: Joi.string().trim().min(10).max(200).required().regex(/^[A-Za-z\s]+$/).messages({
        "string.empty": "Không được để trống name",
        "any.required": "Trường name là trường bắt buộc",
        "string.min": "Trường tên phải có ít nhất {#limit} ký tự",
        "string.max": "Trường tên phải có nhiều nhất {#limit} ký tự",
        "string.pattern.base": "Trường name chỉ cho phép nhập chữ và khoảng trắng"
    }),

    price: Joi.number().positive().required().messages({
        "number.base": "Price phai la mot so",
        "any.required": "Price phai bat buoc co",
        "number.positive": "Price phai lon hon 0",
    }),

    desc: Joi.string().required().messages({
        "string.empty": "Không được để trống desc",
        "any.required": "Trường desc phải là bắt buộc"
    }),

    color_id: Joi.array().custom(customValidation, 'custom validation').required().messages({
        "string.empty": "Không được để trống color_id",
        "any.required": "Trường color_id phải là bắt buộc",
        "any.invalid": "color_id không thể là một mảng rỗng"
    }),

    size_id: Joi.array().custom(customValidation, 'custom validation').required().messages({
        "string.empty": "Không được để trống size_id",
        "any.required": "Trường size_id phải là bắt buộc",
        "any.invalid": "size_id không thể là một mảng rỗng"
    }),

    category_id: Joi.number().required().messages({
        "string.empty": "Không được để trống category_id",
        "any.required": "Trường category_id phải là bắt buộc"
    }),

    image: Joi.array().custom(customValidation, 'custom validation').required().messages({
        "string.empty": "Không được để trống image",
        "any.required": "Trường image phải là bắt buộc",
        "any.invalid": "image không thể là một mảng rỗng"
    })
});

module.exports = { addProduct, updateProduct };