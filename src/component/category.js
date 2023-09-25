


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
                if (err) {
                    return res.status(500).json({ message: 'Thêm category thất bại' });
                }

                const data = Result.rows[0];
                return res.status(201).json({ message: 'Thêm category thành công', data });
            });
        });
    } catch (error) {
        return res.status(500).json({ message: 'Lỗi API' });
    }
}

// getAllCategory 
const getAllCategory = async (req, res) => {
    try {
        const { page, perPage } = req.query; // Lấy thông tin trang và số mục trên mỗi trang từ query parameters

        const pageNumber = parseInt(page) || 1; // Chuyển đổi page thành số nguyên, mặc định là 1 nếu không có hoặc không hợp lệ
        const itemsPerPage = parseInt(perPage) || 3; // Chuyển đổi perPage thành số nguyên, mặc định là 10 nếu không có hoặc không hợp lệ

        const offset = (pageNumber - 1) * itemsPerPage; // Tính toán offset dựa trên trang hiện tại và số mục trên mỗi trang

        let sql = `SELECT * FROM category ORDER BY category_id LIMIT $1 OFFSET $2`; // Sử dụng LIMIT và OFFSET để thực hiện phân trang
        connect.query(sql, [itemsPerPage, offset], (err, results) => {
            if (err) {
                return res.status(500).json({ message: 'Lấy tất cả category thất bại' });
            }
            const data = results.rows;
            return res.status(200).json({ message: 'Lấy tất cả category thành công', data });
        });
    } catch (err) {
        return res.status(500).json({ message: 'Lỗi API' });
    }
}


module.exports = { addCategory, getAllCategory };
