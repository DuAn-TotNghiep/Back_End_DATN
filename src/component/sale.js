
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

module.exports = { getAllSale };
