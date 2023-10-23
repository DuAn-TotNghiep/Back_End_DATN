
const connect = require("../../database");

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
        const { sale_id } = req.body;
        const { id } = req.params
        let sql = `UPDATE product SET sale_id= ${sale_id} WHERE product_id=${id}`;
        connect.query(sql, (err, result) => {
            if (err) {
                return res.status(500).json({ message: 'Update sale that bai', err });
            }
            const data = result.rows;
            return res.status(200).json({ message: 'Update sale thành công', data });
        });
    } catch (error) {
        return res.status(500).json({ message: 'Lỗi API' });
    }
}
module.exports = { getAllSale, updateSaleProduct };
