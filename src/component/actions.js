const connect = require('../../database');
const { DateTime } = require('luxon');
const actions = (req, res, next) => {
    try {
        const { user_id, action, old_data, new_data } = req.body
        const order_date = DateTime.local().setZone('Asia/Ho_Chi_Minh');
        const sql = `INSERT INTO actions (user_id, action, old_data, new_data, action_date) VALUES (${user_id}, '${action}', '${old_data}', '${new_data}','${order_date}' ) RETURNING *`;
        connect.query(sql, (err, result) => {
            if (err) {
                return res.status(500).json({ message: "Them hanh dong that bai", err })
            }
            const data = result.rows
            return res.status(200).json({ message: "Them hanh dong thanh cong", data })
        })
    } catch (err) {

    }
}
module.exports = { actions };