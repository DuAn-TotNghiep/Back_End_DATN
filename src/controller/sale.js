
const connect = require("../../database");
const io = require('../../app')
const getAllSale = async (req, res) => {
    try {

        let sql = `SELECT * FROM sale`;

        connect.query(sql, (err, result) => {
            if (err) {
                return res.status(500).json({ message: 'lay sale that bại' });
            }
            const data = result.rows;
            return res.status(200).json({ message: 'lay sale thành công', data });
        });
    } catch (error) {
        return res.status(500).json({ message: 'Lỗi API' });
    }
}
const updateSaleProduct = async (req, res) => {
    try {
        const { sale_id, id } = req.body;
        let sql = `UPDATE product SET sale_id= ${sale_id} WHERE product_id=${id} RETURNING *`;
        connect.query(sql, (err, result) => {
            if (err) {
                return res.status(500).json({ message: 'Update sale that bai', err });
            }
            const data = result.rows[0];
            console.log(data);
            io.emit('updatesale', { message: 'update sale thanh cong', data });
            return res.status(200).json({ message: 'Update sale thành công', data });
        });
    } catch (error) {
        return res.status(500).json({ message: 'Lỗi API' });
    }
}
module.exports = { getAllSale, updateSaleProduct };
