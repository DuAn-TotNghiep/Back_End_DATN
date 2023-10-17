const connect = require('../../database');
const jwt = require('jsonwebtoken');
const AddToCart = (req, res, next) => {
    try {
        const { product_id, quantity, productColor, productSize } = req.body;
        const token = req.headers.authorization?.split(" ")[1];
        const decoded = jwt.verify(token, "datn");
        const userId = decoded.user_id;
        const text = 'SELECT * FROM cart WHERE user_id = $1 AND product @> $2';
        const values = [userId, { product_id: product_id, color: productColor, size: productSize }];
        // const values = [product_id, userId]
        connect.query(text, values, (err, result) => {
            if (err) {
                return res.status(500).json({ message: 'Khong thay san pham trong gio hang' })
            }
            const data = result.rows[0]
            if (data) {
                const newQuantity = parseFloat(data.quantity) + parseFloat(quantity);
                let sql = `
  UPDATE cart 
  SET 
    quantity = $1
  WHERE 
    user_id = $2 
    AND product->>'product_id' = $3 
    AND product->>'color' = $4 
    AND product->>'size' = $5 
  RETURNING *`;
                const values = [newQuantity, userId, product_id, productColor, productSize];
                // const updateValues = [newQuantity, product_id, userId];
                connect.query(sql, values, (err, results) => {
                    if (err) {
                        return res.status(500).json({ message: 'Khong thay san pham trong gio hang', err })
                    }
                    const data1 = results.rows[0]
                    return res.status(200).json({ message: 'Them vao gio hang thanh cong', data1 })
                })
            } else {
                let sql = `INSERT INTO cart (product, quantity, user_id) VALUES ($1, $2, $3) RETURNING *`;
                const productInfo = {
                    product_id: product_id, // Đặt ID của sản phẩm
                    color: productColor,   // Đặt màu sắc sản phẩm
                    size: productSize      // Đặt kích thước sản phẩm
                };
                const values = [productInfo, quantity, userId];
                connect.query(sql, values, (err, results) => {
                    if (err) {
                        return res.status(500).json({ message: 'Them that bai ', err })
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
const GetOneCart = (req, res) => {
    try {
        const { id } = req.params
        const sql = `SELECT * FROM cart WHERE user_id = ${id}`
        connect.query(sql, (err, result) => {
            if (err) {
                return res.status(500).json({ message: "Khong lay duoc 1 cart", err })
            }
            const data = result.rows
            return res.status(200).json({ message: "Lay 1 cart thanh cong", data })
        })
    } catch (err) {
        return res.status(500).json({ message: "Loi api", err })
    }
}

const deleteCart = (req, res) => {
    try {
        const id = req.params.id;
        const sql = `DELETE FROM cart WHERE id=${id}`;
        connect.query(sql, (err) => {
            if (err) {
                return res.status(500).json({ message: 'Xóa thất bại' });
            }
            return res.status(200).json({ message: "Xoá thành công" })

        })
    } catch (error) {
        return res.status(500).json({ message: "Loi api", err })
    }
}
module.exports = { AddToCart, GetOneCart, deleteCart };