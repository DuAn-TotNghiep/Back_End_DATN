const { DateTime } = require('luxon');
const connect = require('../../database');



const getBill = async (req, res) => {
    try {
        const sql = `SELECT * FROM bill`;
        const results = await connect.query(sql);
        if (!results || !results.rows || results.rows.length === 0) {
            return res.status(404).json({ message: 'Không tìm thấy bill nào.' });
        }
        const data = results.rows;
        return res.status(200).json({
            message: 'Lấy tất cả bill thành công',
            data,
        });
    } catch (err) {
        return res.status(500).json({ message: 'Lỗi API' });
    }
}
const getOneBill = async (req, res) => {
    try {
        const { id } = req.params
        const sql = `SELECT * FROM bill WHERE bill_id = ${id}`
        connect.query(sql, (err, results) => {
            if (err) {
                return res.status(500).json({ message: 'Lấy 1 id thất bại', err })
            }
            const data = results.rows
            return res.status(200).json({ message: 'Lấy 1 id thành công', data })
        })
    } catch (err) {
        return res.status(500).json({ message: 'Lỗi API', err })
    }
}

const bill = async (req, res) => {
    try {
        const { user_id, order_id } = req.body;
        const bill_date = DateTime.local().setZone('Asia/Ho_Chi_Minh');
        const sql = {
            text: 'INSERT INTO bill (user_id, order_id, bill_date) VALUES ($1, $2, $3) RETURNING *',
            values: [user_id, order_id, bill_date],
        };
        const result = await connect.query(sql);

        if (result.rowCount > 0) {
            // Lấy thông tin từ bảng "orders"
            const getOrdersSql = {
                text: 'SELECT payment_status, order_total FROM orders WHERE order_id = $1',
                values: [order_id],
            };
            const ordersResult = await connect.query(getOrdersSql);

            if (ordersResult.rowCount > 0) {
                const ordersData = ordersResult.rows[0];
                const data = result.rows[0];
                // Thêm thông tin từ bảng "orders" vào đối tượng JSON
                data.payment_status = ordersData.payment_status;
                data.order_total = ordersData.order_total;
                return res.status(200).json({ message: 'Tạo  bill thành công', data });
            } else {
                return res.status(500).json({ message: 'Không thể lấy thông tin từ bảng orders' });
            }
        } else {
            return res.status(500).json({ message: 'Tạo bill thất bại' });
        }
    } catch (error) {
        return res.status(500).json({ message: 'Lỗi API' });
    }
}

module.exports = { bill, getBill, getOneBill };
