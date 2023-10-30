const connect = require("../../database");
const { DateTime } = require('luxon');

const addBlog = (req, res) => {
    try {
        const { user_id, blog_title, blog_content } = req.body;
        const blog_date = DateTime.local().setZone('Asia/Ho_Chi_Minh').toISO();

        const sql = `INSERT INTO blog(user_id, blog_title, blog_content, blog_date) VALUES ('${user_id}', '${blog_title}', '${blog_content}', '${blog_date}') RETURNING *`;

        connect.query(sql, (err, result) => {
            if (err) {
                return res.status(500).json({ message: "Không thêm được blog", err });
            }
            const data = result.rows[0];
            return res.status(200).json({ message: "Thêm Blog thành công", data });
        });
    } catch (error) {
        return res.status(404).json({ message: 'Lỗi API' });
    }
}

const deleteBlog = (req, res) => {
    try {
        const id = req.params.id;
        const sql = `DELETE FROM blog WHERE blog_id=${id}`;
        connect.query(sql, (err, result) => {
            if (err) {
                return res.status(404).json({ message: "Xóa blog thất bại!" });
            }
            if (result.rowCount === 0) {
                return res.status(404).json({ message: "Xóa blog thất bại, ID không tồn tại!" });
            }
            return res.status(200).json({ message: "Xóa blog thành công!" })

        })
    } catch (error) {
        return res.status(404).json({ message: 'Lỗi API' });
    }
}

const updateBlog = (req, res) => {
    try {
        const id = req.params.id;
        const { blog_title, blog_content } = req.body;

        // Kiểm tra xem blog có tồn tại
        const sql1 = `SELECT * FROM blog WHERE blog_id = $1`;
        connect.query(sql1, [id], (err, result) => {
            if (err) {
                return res.status(500).json({ message: 'Lỗi truy vấn cơ sở dữ liệu!', error: err });
            }
            if (result.rows.length === 0) {
                return res.status(404).json({ message: 'Blog không tồn tại!' });
            }

            // Nếu tồn tại, tiến hành cập nhật
            const sql2 = `
                UPDATE blog 
                SET 
                    blog_title = $1,
                    blog_content = $2
                WHERE blog_id = $3
                RETURNING *;
            `;
            connect.query(sql2, [blog_title, blog_content, id], (err, result) => {
                if (err) {
                    return res.status(500).json({ message: 'Lỗi không thể cập nhật blog!', error: err });
                }
                const data = result.rows[0];
                return res.status(200).json({ message: "Cập nhật thành công blog!", data });
            });
        });
    } catch (error) {
        return res.status(500).json({ message: 'Lỗi API', error: error });
    }
}

module.exports = { addBlog, deleteBlog, updateBlog };
