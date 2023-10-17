const connect = require("../../database");


const addFavoriteProduct = async (req, res) => {
    try {
        const { user_id, product_id } = req.body;
        const sql = {
            text: "INSERT INTO favorite_product (user_id, product_id) VALUES ($1, $2) RETURNING *",
            values: [user_id, product_id]
        }
        const result = await connect.query(sql);
        if (result.rowCount > 0) {
            const data = result.rows[0];
            return res.status(200).json({ message: "Thêm sản phẩm yêu thích thành công", data });
        } else {
            return res.status(500).json({ message: "Thêm sản phẩm yêu thích thất bại" })
        }
    } catch (error) {
        return res.status(500).json({ message: 'Lỗi API', error: error.message });
    }
}
const getAllFavorite = async (req, res) => {
    try {
        let sql = "SELECT * FROM favorite_product";
        connect.query(sql, (err, result) => {
            if (err) {
                return res.status(500).json({ message: 'Lấy sản phẩm yêu thích thất bại' });
            }
            const data = result.rows;
            return res.status(200).json({ message: "Lấy tất cả sản phẩm yêu thích thành công", data })
        })
    } catch (error) {
        return res.status(500).json({ message: 'Lỗi API', error: error.message });

    }
}
const deleteFavoriteProduct = async (req, res) => {
    try {
        const id = req.params.id;
        const sql = `DELETE FROM favorite_product WHERE favorite_product_id = ${id}`;
        connect.query(sql, (err) => {
            if (err) {
                return res.status(500).json({ message: 'Xóa thất bại' });
            }
            return res.status(200).json({ message: "Xoá thành công" })
        })
    } catch (error) {
        return res.status(500).json({ message: 'Lỗi API', error: error.message });
    }
}
module.exports = { addFavoriteProduct, getAllFavorite, deleteFavoriteProduct };