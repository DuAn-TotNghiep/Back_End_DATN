const connect = require('../../database');

const getAllRecyclebin = async (req, res) => {
    try {
        const sql = `SELECT * FROM recycle_bin_product`;
        const results = await connect.query(sql);
        if (!results || !results.rows || results.rows.length === 0) {
            return res.status(404).json({ message: 'Không tìm thấy thùng rác' });
        }
        const data = results.rows;
        return res.status(200).json({
            message: 'Lấy tất cả product trong thùng rác thành công',
            data,
        });
    } catch (err) {
        return res.status(500).json({ message: 'Lỗi API' });
    }
}

module.exports = { getAllRecyclebin };
