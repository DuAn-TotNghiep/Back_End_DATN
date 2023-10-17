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

module.exports = { addFavoriteProduct };