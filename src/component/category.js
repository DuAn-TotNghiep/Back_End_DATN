const connect = require('../../database');
const { categorySchema } = require('../schema/categorySchema');
const addCategory = async (req, res) => {
    try {
        const { error, value } = categorySchema.validate(req.body);
        if (error) {
            return res.status(400).json({ message: error.details[0].message });
        }
        const { category_name } = value;
        const CategoryQuery = `SELECT * FROM category WHERE category_name = $1`;
        const CategoryValues = [category_name];

        connect.query(CategoryQuery, CategoryValues, (err, Result) => {
            if (err) {
                return res.status(500).json({ message: 'Lỗi khi kiểm tra category' });
            }

            if (Result.rows.length > 0) {
                return res.status(400).json({ message: 'category đã tồn tại' });
            }
            const addQuery = `INSERT INTO category (category_name) VALUES ($1) RETURNING *`;
            const addValues = [category_name];

            connect.query(addQuery, addValues, (err, Result) => {
                if (addErr) {
                    return res.status(500).json({ message: 'Thêm category thất bại' });
                }

                const data = addResult.rows[0];
                return res.status(201).json({ message: 'Thêm category thành công', data });
            });
        });
    } catch (error) {
        return res.status(500).json({ message: 'Lỗi API' });
    }
}
module.exports = { addCategory };
