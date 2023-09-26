const connect = require('../../database');
const jwt = require('jsonwebtoken');
const AddToCart = (req, res, next) => {
    try {
        const { product_id, quantity } = req.body;
      
        const token = req.headers.authorization?.split(" ")[1];
     
        const decoded = jwt.verify(token, "datn");
        const userId = decoded.user_id;
        console.log(product_id);
        let text = 'SELECT * FROM cart WHERE product_id = $1 AND user_id = $2'
        const values = [product_id, userId]
        connect.query(text, values, (err, result) => {
            if (err) {
                return res.status(500).json({ message: 'Khong thay san pham trong gio hang' })
            }
            const data = result.rows[0]
            if (data) {
                const newQuantity = data.quantity + quantity
                let sql = `UPDATE cart SET quantity =$1 WHERE product_id = $2 AND user_id = $3 RETURNING *`
                const updateValues = [newQuantity, product_id, userId];
                connect.query(sql, updateValues, (err, results) => {
                    if (err) {
                        return res.status(500).json({ message: 'Khong thay san pham trong gio hang', err })
                    }
                    const data1 = results.rows[0]
                    return res.status(200).json({ message: 'Them vao gio hang thanh cong', data1 })
                })
            } else {
                let sql = ` INSERT INTO cart (product_id, quantity, user_id) VALUES ($1, $2, $3) RETURNING *`
                const value = [product_id, quantity, userId]
                connect.query(sql, value, (err, results) => {
                    if (err) {
                        return res.status(500).json({ message: 'Them that bai ',err })
                    }
                    const data = results.rows[0]
                    return res.status(200).json({ message: 'Them vao gio hang thanh cong', data })
                })
            }
        });
    } catch (err) {
        return res.status(404).json({ message: err });
    }
}

module.exports = { AddToCart };