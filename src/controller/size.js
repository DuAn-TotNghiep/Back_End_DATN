
const connect = require("../../database");
const { sizeSchema } = require("../schema/sizeSchema");

const addSize = async (req, res) => {
    try {
        const { size_name } = req.body;

        // Kiểm tra dữ liệu sử dụng schema
        const { error } = sizeSchema.validate({ size_name });

        if (error) {
            return res.status(400).json({ message: error.details[0].message });
        }

        // Nếu dữ liệu hợp lệ, thực hiện truy vấn SQL
        let sql = `INSERT INTO size(size_name)
        VALUES('${size_name}') RETURNING *`;

        connect.query(sql, (err, result) => {
            if (err) {
                return res.status(500).json({ message: 'Thêm size thất bại' });
            }
            const data = result.rows[0];
            return res.status(200).json({ message: 'Thêm size thành công', data });
        });
    } catch (error) {
        return res.status(500).json({ message: 'Lỗi API' });
    }
}
const getAllSize = async (req, res) => {
    try {

        let sql = `SELECT * FROM size`;

        connect.query(sql, (err, result) => {
            if (err) {
                return res.status(500).json({ message: 'lay size thất bại' });
            }
            const data = result.rows;
            return res.status(200).json({ message: 'lay size thành công', data });
        });
    } catch (error) {
        return res.status(500).json({ message: 'Lỗi API' });
    }
}
const GetOneSize = async (req, res) => {
    try {
        const { id } = req.params
        const sql = `SELECT * FROM size WHERE size_id = ${id}`
        connect.query(sql, (err, results) => {
            if (err) {
                return res.status(500).json({ message: 'Lay one that bai', err })
            }
            const data = results.rows
            return res.status(200).json({ message: 'Lay one thanh cong', data })
        })
    } catch (err) {
        return res.status(500).json({ message: 'Loi api', err })
    }
}

module.exports = { addSize, getAllSize, GetOneSize };
