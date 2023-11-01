const connect = require('../../database');

const getAllRecyclebin = async (req, res) => {
    try {
        const sql = `SELECT * FROM recycle_bin_product`;
        const results = await connect.query(sql);
        if (!results || !results.rows || results.rows.length === 0) {
            return res.status(404).json({ message: 'Không tìm thấy thùng rác' });
        }
        const data = results.rows;
        return res.status(200).json({
            message: 'Lấy tất cả product trong thùng rác thành công',
            data,
        });
    } catch (err) {
        return res.status(500).json({ message: 'Lỗi API' });
    }
}

const RestoreProduct = async (req, res) => {
    try {
        const id = req.params.id;
        let sql = `SELECT * FROM recycle_bin_product WHERE id = ${id}`;
        connect.query(sql, (err, result) => {
            if (err) {
                return res.status(500).json({ message: "Khong tim thay san pham da xoa trong thung rac", err });
            }
            const recyclebin = result.rows[0];
            const product = recyclebin.product;

            let sqlrestore = `INSERT INTO product (product_id, size_id, color_id, image, category_id, product_name, product_description, product_price) VALUES (${product.product_id}, Array[${product.size_id}], Array[${product.color_id}], Array['${product.image}'], ${product.category_id}, '${product.product_name}', '${product.product_description}', ${product.product_price}) RETURNING *`;
            connect.query(sqlrestore, async (err, result) => {
                if (err) {
                    return res.status(500).json({ message: "Khong khoi phuc duoc san pham", err });
                }
                const product = result.rows[0];

                let sqlUpdateIsBlocked = `UPDATE product SET isbblock = false WHERE product_id = ${product.product_id}`;
                connect.query(sqlUpdateIsBlocked, (err, result) => {
                    if (err) {
                        return res.status(500).json({ message: "Cap nhat trang thai isbblock that bai", err });
                    }

                    let slqremoveProduct = `DELETE FROM recycle_bin_product WHERE id = ${id}`;
                    connect.query(slqremoveProduct, (err, result) => {
                        if (err) {
                            return res.status(500).json({ message: "Xoa recyclebin that bai", err });
                        }
                        return res.status(200).json({ message: "Khoi phuc thanh cong product", product });
                    });
                });
            });
        });
    } catch (err) {
        return res.status(500).json({ message: 'Loi API', err });
    }
}

const RemoveProductRecyclebin = async (req, res) => {
    try {
        const id = req.params.id;
        let sql = `DELETE FROM recycle_bin_product WHERE id = ${id} RETURNING * `
        connect.query(sql, (err, result) => {
            if (err) {
                return res.status(500).json({ message: 'Khong xoa duoc', err })
            }
            const data = result.rows[0]
            return res.json({ message: 'Xoa thanh cong Recyclebin', data })
        })
    } catch (err) {
        return res.status(500).json({ message: "Loi api", err })
    }
}


module.exports = { getAllRecyclebin, RestoreProduct, RemoveProductRecyclebin };
