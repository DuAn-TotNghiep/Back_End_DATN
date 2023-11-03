const connect = require('../../database');
const { DateTime } = require('luxon');
const AddComment = (req, res) => {
    try {
        const { content, user_id, product_id } = req.body;
        // Thực hiện kiểm tra xem người dùng đã có nhận xét cho sản phẩm này chưa
        const checkSql = `SELECT * FROM comment WHERE product_id = ${product_id} AND user_id = ${user_id}`;
        connect.query(checkSql, (checkErr, checkResult) => {
            if (checkErr) {
                return res.status(500).json({ message: "Lỗi khi kiểm tra nhận xét", err: checkErr });
            }
            if (checkResult.rows.length > 0) {
                return res.status(400).json({ message: "Bạn đã bình luận cho sản phẩm này" });
            }

            // Nếu người dùng chưa có nhận xét, thực hiện thêm nhận xét mới vào cơ sở dữ liệu
            const comment_date = DateTime.local().setZone('Asia/Ho_Chi_Minh').toISO();
            const sql = `INSERT INTO comment(product_id, user_id, comment_text, comment_date) VALUES (${product_id}, ${user_id}, '${content}', '${comment_date}') RETURNING *`;
            connect.query(sql, (err, result) => {
                if (err) {
                    return res.status(500).json({ message: "Không thêm được nhận xét", err });
                }
                const data = result.rows[0];
                return res.status(200).json({ message: "Thêm Comment thành công", data });
            });
        });
    } catch (err) {
        return res.status(404).json({ message: 'Lỗi API' });
    }
}

const GetAllCommentProduct = (req, res) => {
    try {
        const { id } = req.params
        const sql = `SELECT * FROM comment WHERE product_id=${id} ORDER BY comment_date DESC`;
        connect.query(sql, (err, result) => {
            if (err) {
                return res.status(500).json({ message: 'Khong lay duoc comment cua san pham', err })
            }
            const data = result.rows
            return res.status(200).json({ message: "Lay thanh cong", data })
        })
    } catch (err) {
        return res.status(404).json({ message: 'Loi api' });
    }
}

const getAllComment = (req, res) => {
    try {
        const sql = 'SELECT * FROM comment'
        connect.query(sql, (err, result) => {
            if (err) {
                return res.status(500).json({ message: 'Lấy tất cả comment thất bại!' });
            }
            const data = result.rows;
            return res.status(200).json({ message: 'Lấy tất cả comment thành công!', data });

        })
    } catch (error) {
        return res.status(404).json({ message: 'Loi api' });
    }
}

const deleteComment = (req, res) => {
    try {
        const id = req.params.id;
        const sql = `DELETE FROM comment WHERE id=${id}`;
        connect.query(sql, (err, result) => {
            if (err) {
                return res.status(404).json({ message: "Xóa comment thất bại!" });
            }
            if (result.rowCount === 0) {
                return res.status(404).json({ message: "Xóa comment thất bại, ID không tồn tại!" });
            }
            return res.status(200).json({ message: "Xóa comment thành công!" })

        })
    } catch (error) {
        return res.status(404).json({ message: 'Lỗi API' });
    }
}

const fillterCommentDaily = (req, res) => {
    const { start_date, end_date } = req.body; // Lấy ngày từ URL
    const startDate = DateTime.fromISO(start_date, { zone: "Asia/Ho_Chi_Minh" });
    const endDate = DateTime.fromISO(end_date, { zone: "Asia/Ho_Chi_Minh" });
    console.log(start_date, end_date);
    try {
        const sql = `
      SELECT * FROM comment
      WHERE DATE(comment_date) BETWEEN '${startDate.toISODate()}' AND '${endDate.toISODate()}';
      `;
        connect.query(sql, (err, results) => {
            if (err) {
                return res.status(500).json({
                    message: "Không thể lấy comment cho khoảng ngày được chọn",
                    err,
                });
            }
            const data = results.rows
            return res.status(200).json({
                message: "Lấy thành công comment cho khoảng được chọn",
                data,
            });
        });
    } catch (err) {
        return res.status(500).json({ message: "Lỗi API", err });
    }
}

module.exports = { AddComment, GetAllCommentProduct, getAllComment, deleteComment, fillterCommentDaily }