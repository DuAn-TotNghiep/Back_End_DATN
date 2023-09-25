

const connect = require('../../database');

 const GetALlBook = async (req, res) => {
    try {
        const sql = `SELECT * FROM color`
        connect.query(sql, (err, results) => {
            if (err) {
                return res.status(500).json({ message: 'Lay All that bai', err })
            }
            const data = results.rows
            return res.status(200).json({ message: 'Lay All thanh cong', data })
        })
    } catch (err) {
        return res.status(500).json({ message: 'Loi api', err })
    }
}
const getAllProducts = async (req, res)=>{
    try {
        const page = req.query.page || 1; // Trang mặc định là 1
        const perPage = 3; // Số sản phẩm trên mỗi trang

        const offset = (page - 1) * perPage; // Tính toán offset để truy vấn dữ liệu phù hợp

        const sql = 'SELECT * FROM product LIMIT $1 OFFSET $2';
        const values = [perPage, offset];

        connect.query(sql, values, (err, result) => {
            if (err) {
                return res.status(500).json({ message: 'Không lấy được danh sách sản phẩm' });
            }
            const products = result.rows;
            return res.status(200).json({ message: `Danh sách sản phẩm trang ${page}`, products });
        });
    } catch (error) {
        return res.status(500).json({ message: 'Lỗi API' });
    }
}
module.exports = { GetALlBook , getAllProducts};