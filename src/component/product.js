

const connect = require('../../database');
const { addProduct } = require('../schema/productSchema');
const { DateTime } = require('luxon')
const AddProduct = async (req, res, next) => {
    try {
        const { color_id, size_id, category_id, name, image, desc, price } = req.body
        const { error } = addProduct.validate(req.body, { abortEarly: false });
        if (error) {
            const errs = error.details.map(err => err.message)
            return res.status(400).json(errs)
        }
        const sql4 = `SELECT * FROM product WHERE product_name='${name}'`
        connect.query(sql4, (err, resolve) => {
            if (resolve.rows.length > 0) {
                return res.status(500).json({ message: 'san pham da ton tai' })
            }
            const sql5 = `INSERT INTO product (size_id, color_id, image,category_id, product_name, product_description, product_price) VALUES (Array[${size_id}], Array[${color_id}], Array['${image}'], ${category_id},'${name}','${desc}', ${price}) RETURNING *`
            connect.query(sql5, (err, resolve) => {
                if (err) {
                    return res.status(500).json({ message: 'Loi khong them duoc san pham', err })
                }
                const data = resolve.rows[0]
                return res.status(200).json({ message: "Them san pham thanh cong", data })
            })
        })
    } catch (err) {
        return res.status(500).json({ message: 'Loi api', err })
    }
}

const getAllProducts = async (req, res) => {
    try {
        const page = req.query.page || 1; // Trang mặc định là 1
        const perPage = 3; // Số sản phẩm trên mỗi trang

        const offset = (page - 1) * perPage; // Tính toán offset để truy vấn dữ liệu phù hợp

        const sql = 'SELECT * FROM product LIMIT $1 OFFSET $2';
        const values = [perPage, offset];

        connect.query(sql, values, (err, result) => {
            if (err) {
                return res.status(500).json({ message: 'Không lấy được danh sách sản phẩm' });
            }
            const products = result.rows;
            return res.status(200).json({ message: `Danh sách sản phẩm trang ${page}`, products });
        });
    } catch (error) {
        return res.status(500).json({ message: 'Lỗi API' });
    }
}
const RemoveProduct = async (req, res) => {
    try {
        const { id } = req.params
        const now = DateTime.now().setZone('Asia/Ho_Chi_Minh');
        const sql1 = `SELECT * FROM product WHERE product_id=${id}`
        connect.query(sql1, (err, resolve) => {
            if (err) {
                return res.status(500).json({ message: 'Khong lay duoc san pham', err })
            }
            const product = resolve.rows[0]
            console.log(product);
            console.log(product.color_id);
            const sql2 = `DELETE FROM product WHERE product_id = ${id}`
            connect.query(sql2, (err, result) => {
                if (err) {
                    return res.status(500).json({ message: 'xoa product tai bang product that bai', err })
                }
            })
            const time = (now.toString());

            const sqlbin = `INSERT INTO recycle_bin_product (product, deleted_at ) VALUES('{"product_id": ${id} , "product_name": "${product.product_name}", "product_description":"${product.product_description}", "product_price":${product.product_price} , "category_id":${product.category_id}, "image_id":${product.image_id}, "size_id":${product.size_id},"color_id":${product.color_id}}',
'${time}') RETURNING *`
            connect.query(sqlbin, (err, result) => {
                if (err) {
                    return res.status(500).json({ message: "Loi khi them vao thung rac", err })
                }
                const data = result.rows[0]
                return res.status(200).json({ message: 'Them vao thung rac thanh cong', data })
            })
        })
    } catch (error) {
        return res.status(500).json({ message: 'Lỗi API' });
    }
}

module.exports = { AddProduct, getAllProducts, RemoveProduct };


