const connect = require('../../database');

const order = async (req, res) => {
    try {
        const { checkout_id, user_id, order_date, order_total } = req.body;

        // Sử dụng Prepared Statement để tránh SQL Injection
        const sql = {
            text: 'INSERT INTO orders (checkout_id, user_id, order_date, order_total) VALUES ($1, $2, $3, $4) RETURNING *',
            values: [checkout_id, user_id, order_date, order_total],
        };

        const result = await connect.query(sql);

        if (result.rowCount > 0) {
            const data = result.rows[0];
            console.log(data);
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
        let sql = 'SELECT * FROM orders';
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

module.exports = { order, getAllOrder };
