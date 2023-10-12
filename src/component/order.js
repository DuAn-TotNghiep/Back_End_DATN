const connect = require('../../database');
const { DateTime } = require('luxon');
const jwt = require('jsonwebtoken');
const io = require('../../app')


const order = async (req, res) => {
    try {
        const { checkout_id, user_id, order_total, payment_status } = req.body;
        const order_date = DateTime.local().setZone('Asia/Ho_Chi_Minh');
        console.log("quan");
        const sql = {
            text: 'INSERT INTO orders (checkout_id, user_id, order_date, order_total, status, payment_status) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            values: [checkout_id, user_id, order_date, order_total, 1, payment_status],
        };
        const result = await connect.query(sql);
        if (result.rowCount > 0) {
            const data = result.rows[0];
            io.emit('addorder', { message: 'Có Đơn Hàng Mới', data });
            return res.status(200).json({ message: 'Thêm thành công order', data });
        } else {
            return res.status(500).json({ message: 'Không thêm được order' });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Lỗi API', error });
    }
};

const getAllOrder = async (req, res) => {
    try {
        let sql = `SELECT * FROM orders
ORDER BY CASE 
    WHEN status = '1' THEN 1
    WHEN status = '2' THEN 2
     WHEN status = '3' THEN 3
      WHEN status = '0' THEN 4
END`
        connect.query(sql, (err, result) => {
            if (err) {
                return res.status(500).json({ message: 'Không lấy được danh sách order' });
            }
            const orders = result.rows;
            return res.status(200).json({ message: "lấy danh sách order thành công", orders });
        })
    } catch (error) {
        return res.status(500).json({ message: 'Lỗi API' });
    }
}
const getOneOrder = async (req, res) => {
    try {
        const { id } = req.params
        let sql = `SELECT * FROM orders WHERE order_id =${id} `;
        connect.query(sql, (err, result) => {
            if (err) {
                return res.status(500).json({ message: 'Không lấy được danh sách order' });
            }
            const data = result.rows;
            return res.status(200).json({ message: "lấy danh sách order thành công", data });
        })
    } catch (error) {
        return res.status(500).json({ message: 'Lỗi API' });
    }
}
const TotalAmountAllProductOrder = async (req, res) => {
    try {
        const sql = `
            SELECT o.user_id, CONCAT(u.user_firstname, ' ', u.user_lastname) AS user_name, SUM(o.order_total) AS total_amount
            FROM orders o
            JOIN users u ON o.user_id = u.id
            GROUP BY o.user_id, user_name
        `;

        connect.query(sql, (err, results) => {
            if (err) {
                return res.status(500).json({ message: 'Lấy tổng số tiền đơn hàng thất bại', err });
            }

            const totalAmountByUser = results.rows;
            return res.status(200).json({ message: 'Lấy tổng số tiền đơn hàng thành công', totalAmountByUser });
        });
    } catch (err) {
        return res.status(500).json({ message: 'Lỗi API', err });
    }
}
const CountOrderOnline = async (req, res) => {
    try {
        const sql = `
        SELECT COUNT(*) AS DonHangThanhToanOnline
        FROM orders
        WHERE payment_status = '2';
        `;
        connect.query(sql, (err, results) => {
            if (err) {
                return res.status(500).json({ message: 'Lấy số đơn hàng thanh toán Online thất bại', err });
            }

            const soDonHangThanhToanOnline = results.rows;
            return res.status(200).json({ message: 'Lấy số đơn hàng thanh toán Online thành công', soDonHangThanhToanOnline });
        });
    } catch (err) {
        return res.status(500).json({ message: 'Lỗi API', err });
    }
}
const UpdateCancell = (req, res) => {
    try {
        const { id } = req.body
        const sql = `UPDATE orders SET status=0 WHERE order_id=${id}`
        connect.query(sql, (err, result) => {
            if (err) {
                return res.status(500).json({ message: 'khong sua duoc trang thai cancell', err })
            }
            const data = result.rows[0]
            io.emit('cancell', { message: 'Đơn Hàng Đã Bị Hủy', data });
            return res.status(200).json({ message: 'sua thanh cong trang thai cancell', data })
        })
    } catch (err) {
        return res.status(500).json({ message: 'Loi API', err })
    }
}
const UpdateConfirm = (req, res) => {
    try {
        const { id } = req.body
        const sql = `UPDATE orders SET status=2 WHERE order_id=${id} RETURNING*`
        connect.query(sql, (err, result) => {
            if (err) {
                return res.status(500).json({ message: 'khong sua duoc trang thai confirm order', err })
            }
            const data = result.rows[0]
            io.emit('confirm', { message: 'Đơn hàng đã được xác nhận', data });
            return res.status(200).json({ message: 'sua thanh cong trang thai confirm order', data })
        })
    } catch (err) {
        return res.status(500).json({ message: 'Loi API', err })
    }
}
const UpdateDone = (req, res) => {
    try {
        const { id } = req.body
        const sql = `UPDATE orders SET status=3 WHERE order_id=${id}`
        connect.query(sql, (err, result) => {
            if (err) {
                return res.status(500).json({ message: 'khong sua duoc trang thai done order', err })
            }
            const data = result.rows[0]
            return res.status(200).json({ message: 'sua thanh cong trang thai done order', data })
        })
    } catch (err) {
        return res.status(500).json({ message: 'Loi API', err })
    }
}
const GetOrderPlacedDay=(req, res) => {
    try {
        const order_date = DateTime.local().setZone("Asia/Ho_Chi_Minh");
        const formattedDate = order_date.toFormat("yyyy-MM-dd");
        const sql = `SELECT COUNT(*) as order_count FROM orders WHERE status = '1' AND DATE(order_date) = '${formattedDate}'`;
        connect.query(sql, (err, result) => {
            if (err) {
                return res.status(500).json({ message: 'Loi', err })
            }
            const data = result.rows[0].order_count
            return res.status(200).json({ message: 'Thanh cong', data })
        })
    } catch (err) {
        return res.status(500).json({ message: 'Loi API', err })
    }
}
const GetOrderAwaitingDay = (req, res) => {
    try {
        const order_date = DateTime.local().setZone("Asia/Ho_Chi_Minh");
        const formattedDate = order_date.toFormat("yyyy-MM-dd");
        const sql = `SELECT COUNT(*) as order_count FROM orders WHERE status = '2' AND DATE(order_date) = '${formattedDate}'`;
        connect.query(sql, (err, result) => {
            if (err) {
                return res.status(500).json({ message: 'Loi', err })
            }
            const data = result.rows[0].order_count
            return res.status(200).json({ message: 'Thanh cong', data })
        })
    } catch (err) {
        return res.status(500).json({ message: 'Loi API', err })
    }
}
module.exports = { order, getAllOrder, TotalAmountAllProductOrder, getOneOrder, CountOrderOnline, UpdateCancell, UpdateConfirm, UpdateDone, GetOrderPlacedDay, GetOrderAwaitingDay };
