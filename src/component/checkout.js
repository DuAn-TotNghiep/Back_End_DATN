const connect = require('../../database');


const checkout = (req, res) => {
    try {
        const { product_id, province, district, ward, address, payment, user_id, total } = req.body
        const sql = `INSERT INTO checkout (user_id, province, district, ward, payment, address, product_id, total) VALUES (${user_id}, '${province}', '${district}', '${ward}', '${payment}', '${address}', ARRAY[${product_id}], ${total}) RETURNING *`;

        connect.query(sql, (err, result) => {
            if (err) {
                return res.status(500).json({ message: "Khong them duoc check out", err })
            }
            const data = result.rows[0]
            console.log(data);
            return res.status(200).json({ message: "Them thanh cong", data })
        })
    } catch (err) {
        return res.status(500).json({ message: 'Loi API', err })
    }
}
module.exports = { checkout };