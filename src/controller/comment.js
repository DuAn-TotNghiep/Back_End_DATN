const connect = require('../../database');
const { DateTime } = require('luxon');
const AddComment = (req, res) => {
    try {
        const { content, user_id, product_id } = req.body;
        const comment_date = DateTime.local().setZone('Asia/Ho_Chi_Minh').toISO();
        const sql = `INSERT INTO comment(product_id, user_id, comment_text, comment_date) VALUES (${product_id}, ${user_id}, '${content}', '${comment_date}') RETURNING *`;

        connect.query(sql, (err, result) => {
            if (err) {
                return res.status(500).json({ message: "Khong them duoc cmt", err })
            }
            const data = result.rows[0]
            return res.status(200).json({ message: "Them Comment thanh cong", data })
        })
    } catch (err) {
        return res.status(404).json({ message: 'Loi api' });
    }
}
module.exports = {AddComment}