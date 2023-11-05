const connect = require("../../database");


const addFavoriteProduct = async (req, res) => {
    try {
        const { user_id, product_id } = req.body;

        // Trước hết, kiểm tra xem user đã yêu thích sản phẩm này chưa
        const checkSql = {
            text: "SELECT * FROM favorite_product WHERE user_id = $1 AND product_id = $2",
            values: [user_id, product_id]
        }
        const checkResult = await connect.query(checkSql);

        // Nếu người dùng đã yêu thích sản phẩm này, xóa nó khỏi danh sách yêu thích
        if (checkResult.rowCount > 0) {
            const deleteSql = {
                text: "DELETE FROM favorite_product WHERE user_id = $1 AND product_id = $2",
                values: [user_id, product_id]
            }
            await connect.query(deleteSql);

            return res.status(200).json({ message: "Xóa sản phẩm yêu thích thành công" });
        }

        // Nếu người dùng chưa yêu thích sản phẩm này, thêm vào danh sách yêu thích
        const insertSql = {
            text: "INSERT INTO favorite_product (user_id, product_id) VALUES ($1, $2) RETURNING *",
            values: [user_id, product_id]
        }
        const result = await connect.query(insertSql);

        if (result.rowCount > 0) {
            const data = result.rows[0];
            return res.status(200).json({ message: "Thêm sản phẩm yêu thích thành công", data });
        } else {
            return res.status(500).json({ message: "Thêm sản phẩm yêu thích thất bại" });
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
const getOneFavorite = async (req, res) => {
    try {
        // Lấy user_id từ req.params hoặc req.query tùy thuộc vào cách bạn thiết kế API của mình.
        const id = req.params.id; // Đây là một ví dụ, bạn cần điều chỉnh để lấy user_id theo cách bạn đang sử dụng.

        let sql = `SELECT * FROM favorite_product WHERE user_id = ${id}`;
        connect.query(sql, (err, result) => {
            if (err) {
                return res.status(500).json({ message: 'Lấy sản phẩm yêu thích thất bại', error: err.message });
            }
            const data = result.rows;
            return res.status(200).json({ message: "Lấy sản phẩm yêu thích thành công", data });
        });
    } catch (error) {
        return res.status(500).json({ message: 'Lỗi API', error: error.message });
    }
}


const deleteFavoriteProduct = async (req, res) => {
    try {
        const id = req.params.id;
        const sql = `DELETE FROM favorite_product WHERE product_id = ${id}`;
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
module.exports = { addFavoriteProduct, getAllFavorite, deleteFavoriteProduct, getOneFavorite };