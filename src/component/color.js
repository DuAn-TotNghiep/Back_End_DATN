//Add Color


const connect = require('../../database');
const { colorSchema } = require('../schema/colorSchema');
const addColor = async (req, res) => {
    try {
        const { error, value } = colorSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ message: error.details[0].message });
        }
        const { color_name } = value;
        const checkColorQuery = `SELECT * FROM color WHERE color_name = $1`;
        const checkColorValues = [color_name];

        connect.query(checkColorQuery, checkColorValues, (checkErr, checkResult) => {
            if (checkErr) {
                return res.status(500).json({ message: 'Lỗi khi kiểm tra color' });
            }

            if (checkResult.rows.length > 0) {
                return res.status(400).json({ message: 'Color đã tồn tại' });
            }
            const addColorQuery = `INSERT INTO color (color_name) VALUES ($1) RETURNING *`;
            const addColorValues = [color_name];

            connect.query(addColorQuery, addColorValues, (addErr, addResult) => {
                if (addErr) {
                    return res.status(500).json({ message: 'Thêm color thất bại' });
                }

                const data = addResult.rows[0];
                return res.status(201).json({ message: 'Thêm color thành công', data });
            });
        });
    } catch (error) {
        return res.status(500).json({ message: 'Lỗi API' });
    }
}
const getAllColor = async (req, res) => {
    try {

        let sql = `SELECT * FROM color`;

        connect.query(sql, (err, result) => {
            if (err) {
                return res.status(500).json({ message: 'Lay color thất bại' });
            }
            const data = result.rows;
            return res.status(200).json({ message: 'Kay color thành công', data });
        });
    } catch (error) {
        return res.status(500).json({ message: 'Lỗi API' });
    }
}
const getOneColor = async (req, res) => {
    try {
        const { id } = req.params
        const sql = `SELECT * FROM color WHERE color_id = ${id}`
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
module.exports = { addColor, getAllColor, getOneColor };
