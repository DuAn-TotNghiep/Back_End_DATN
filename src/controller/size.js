
const connect = require("../../database");
const { sizeSchema } = require("../schema/sizeSchema");

const addSize = async (req, res) => {
    try {
        const { error, value } = sizeSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ message: error.details[0].message });
        }
        const { size_name } = value;
        const SizeQuery = `SELECT * FROM size WHERE size_name = $1`;
        const SizeValues = [size_name];

        connect.query(SizeQuery, SizeValues, (err, Result) => {
            if (err) {
                return res.status(500).json({ message: 'Lỗi khi kiểm tra size' });
            }

            if (Result.rows.length > 0) {
                return res.status(400).json({ message: 'size đã tồn tại' });
            }
            const addQuery = `INSERT INTO size (size_name) VALUES ($1) RETURNING *`;
            const addValues = [size_name];

            connect.query(addQuery, addValues, (err, Result) => {
                if (err) {
                    return res.status(500).json({ message: 'Thêm size thất bại' });
                }

                const data = Result.rows[0];
                return res.status(201).json({ message: 'Thêm size thành công', data });
            });
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
