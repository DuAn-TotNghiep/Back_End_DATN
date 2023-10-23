const connect = require("../../database");

const voucher = async (req, res) => {
    try {
        const { voucher_code } = req.body;
        const voucher = await connect.query('SELECT voucher_amount FROM voucher WHERE voucher_code = $1 AND voucher_status = $2', [voucher_code, 'active']);
        if (voucher.rows.length === 0) {
            return res.status(404).json({ message: "Mã giảm giá không tồn tại hoặc đã hết hạn!" });
        }
        const discountAmount = voucher.rows[0].voucher_amount;
        return res.status(200).json({ message: "Đã áp dụng mã giảm giá", discountAmount });
    } catch (err) {
        return res.status(500).json({ message: 'Lỗi API', err });
    }
}
//add voucher

const AddVoucher = async (req, res) => {
    try {
        const { voucher_code, voucher_amount, voucher_status } = req.body;
        // Thực hiện truy vấn SQL để thêm mã giảm giá vào cơ sở dữ liệu
        let sql = `
    INSERT INTO voucher (voucher_code, voucher_amount, voucher_status)
    VALUES ($1, $2, $3)
    RETURNING *;
  `;
        const values = [voucher_code, voucher_amount, voucher_status];
        const result = await connect.query(sql, values);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Thêm mã giảm giá thất bại!" });
        }
        const data = result.rows[0];
        return res.status(200).json({ message: "Thêm mã giảm giá thành công!", data })
    } catch (err) {
        return res.status(500).json({ message: 'Lỗi API', err });
    }
}

module.exports = { voucher, AddVoucher };
