const connect = require('../../database');


const checkout = (req, res) => {
    try {
        const { product, province, district, ward, address, payment, user_id, total } = req.body
        const productJSON = JSON.stringify(product);
        const sql = `
  INSERT INTO checkout (user_id, province, district, ward, payment, address, product, total)
  VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
  RETURNING *;
`;
        const values = [
            user_id,
            province,
            district,
            ward,
            payment,
            address,
            productJSON, // Sử dụng giá trị đã chuẩn bị ở trên
            total,
        ];
        connect.query(sql, values, (err, result) => {
            if (err) {
                return res.status(500).json({ message: "Khong them duoc check out", err })
            }
            const data = result.rows[0]
            const sql1 = `DELETE FROM cart
WHERE user_id = ${user_id}`
            connect.query(sql1, (err, result) => {
                if (err) {
                    return res.status(500).json({ message: 'xoas dudwocj sanr pham trong gio hang', err })
                }
                return res.status(200).json({ message: "Them thanh cong", data })
            })
        })
    } catch (err) {
        return res.status(500).json({ message: 'Loi API', err })
    }
}


const getOneheckout = (req, res) => {
    try {
        const { id } = req.params
        const sql = `SELECT * FROM checkout WHERE id=${id}`
        connect.query(sql, (err, result) => {
            if (err) {
                return res.status(500).json({ message: 'Khong lay duoc ', err })
            }
            const data = result.rows[0]
            return res.status(200).json({ message: 'Lay 1 thanh cong', data })
        })
    } catch (err) {
        return res.status(500).json({ message: 'Loi API', err })
    }
}
module.exports = { checkout, getOneheckout };