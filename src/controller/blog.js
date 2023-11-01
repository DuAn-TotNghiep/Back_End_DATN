const connect = require("../../database");
const { DateTime } = require('luxon');

const getAllBlog = (req, res) => {
    try {
        const sql = 'SELECT * FROM blog';
        connect.query(sql, (err, result) => {
            if (err) {
                return res.status(500).json({ message: "Lỗi không tìm được sản phẩm nào!", err })
            }
            const data = result.rows
            console.log(data);
            return res.status(200).json({ message: 'Tìm tất cả blog thành công!', data });
        })
    } catch (error) {
        return res.status(404).json({ message: 'Lỗi API' });
    }
}
const getOneBlog = async (req, res) => {
    try {
        const { id } = req.params
        const sql = `SELECT * FROM blog WHERE blog_id = ${id}`
        connect.query(sql, (err, results) => {
            if (err) {
                return res.status(500).json({ message: 'Lấy 1 blog thất bại', err })
            }
            const data = results.rows
            return res.status(200).json({ message: 'Lấy 1 blog thành công', data })
        })
    } catch (err) {
        return res.status(500).json({ message: 'Lỗi API', err })
    }
}

const searchBlog = async (req, res) => {
    try {
        let blog_title = req.body.blog_title;
        blog_title = blog_title.trim();
        let regex = `%${blog_title}%`;
        let sql = `SELECT * FROM blog WHERE blog_title ILIKE $1`;
        const result = await connect.query(sql, [regex]);

        if (result.rows.length == 0) {
            return res.json({
                message: "Không tìm thấy tiêu đề",
            });
        }
        return res.json({
            message: "Tìm thấy tiêu đề",
            data: result.rows,
        });
    } catch (error) {
        return res.status(500).json({ message: "Lỗi API" });

    }
}

const addBlog = (req, res) => {
    try {
        //api add image
        const { user_id, blog_title, blog_content, blog_image } = req.body;
        const blog_date = DateTime.local().setZone('Asia/Ho_Chi_Minh').toISO();

        const sql = `INSERT INTO blog(user_id, blog_title, blog_content, blog_date,blog_image) VALUES ('${user_id}', '${blog_title}', '${blog_content}', '${blog_date}','${blog_image}') RETURNING *`;

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
        //api update image
        const { blog_title, blog_content, blog_image } = req.body;

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
                    blog_content = $2,
                    blog_image=$3
                WHERE blog_id = $4
                RETURNING *;
            `;
            connect.query(sql2, [blog_title, blog_content, blog_image, id], (err, result) => {
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



module.exports = { searchBlog, addBlog, deleteBlog, updateBlog, getAllBlog, getOneBlog };
