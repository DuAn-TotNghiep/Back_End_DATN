const connect = require("../../database");



const getAllVoucher = async (req, res) => {
    try {
        const sql = 'SELECT * FROM voucher';
        connect.query(sql, (err, result) => {
            if (err) {
                return res.status(500).json({ message: 'Lấy tất cả voucher thất bại!' });
            }
            const data = result.rows;
            return res.status(200).json({ message: 'Lấy tất cả voucher thành công!', data });

        })
    } catch (error) {
        return res.status(500).json({ message: 'Lỗi API', err });

    }
}

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
//delete voucher
const DeleteVoucher = async (req, res) => {
    try {
        const id = req.params.id;
        const sql = `DELETE FROM voucher WHERE voucher_id=${id}`;
        connect.query(sql, (err, result) => {
            if (err) {
                return res.status(404).json({ message: "Xóa mã giảm giá thất bại!" });
            }
            if (result.rowCount === 0) {
                return res.status(404).json({ message: "Xóa mã giảm giá thất bại, ID không tồn tại!" });
            }
            return res.status(200).json({ message: "Xóa mã giảm giá thành công!" })
        })

    } catch (error) {
        return res.status(500).json({ message: 'Lỗi API', err });
    }
}
//update voucher

const UpdateVoucher = async (req, res) => {
    try {
        const id = req.params.id;
        const { voucher_code, voucher_amount, voucher_status } = req.body;

        // Kiểm tra xem mã giảm giá có tồn tại
        const sql1 = `SELECT * FROM voucher WHERE voucher_id = $1`;
        connect.query(sql1, [id], (err, result) => {
            if (err) {
                return res.status(500).json({ message: 'Lỗi truy vấn cơ sở dữ liệu!', error: err });
            }
            if (result.rows.length === 0) {
                return res.status(404).json({ message: 'Mã giảm giá không tồn tại!' });
            }

            // Nếu tồn tại, tiến hành cập nhật
            const sql2 = `
                UPDATE voucher 
                SET 
                    voucher_code = $1,
                    voucher_status = $2,
                    voucher_amount = $3
                WHERE voucher_id = $4
                RETURNING *;
            `;
            connect.query(sql2, [voucher_code, voucher_status, voucher_amount, id], (err, result) => {
                if (err) {
                    return res.status(500).json({ message: 'Lỗi không thể cập nhật mã giảm giá!', error: err });
                }
                const data = result.rows[0];
                return res.status(200).json({ message: "Cập nhật thành công mã giảm giá!", data });
            });
        });
    } catch (error) {
        return res.status(500).json({ message: 'Lỗi API', error: err });
    }
}


module.exports = { getAllVoucher, voucher, AddVoucher, DeleteVoucher, UpdateVoucher };
