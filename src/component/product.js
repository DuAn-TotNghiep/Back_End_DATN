

const connect = require('../../database');
const jwt = require('jsonwebtoken');
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


// serachProduct


const searchProduct = async (req, res) => {
    try {
        let product_name = req.query.product_name;
        product_name = product_name.trim();
        let regex = `%${product_name}%`;

        // Trang hiện tại và số sản phẩm trên mỗi trang
        const page = req.query.page || 1;  // Trang mặc định là 1
        const perPage = 3;  // Số sản phẩm trên mỗi trang

        let sql = `SELECT * FROM product WHERE product_name ILIKE $1`;
        const result = await connect.query(sql, [regex]);

        if (result.rows.length == 0) {
            return res.json({
                message: "Không tìm thấy sản phẩm"
            });
        }

        // Tính toán số lượng trang
        const totalProducts = result.rows.length;
        const totalPages = Math.ceil(totalProducts / perPage);

        // Lọc kết quả để lấy sản phẩm trên trang hiện tại
        const startIndex = (page - 1) * perPage;
        const endIndex = startIndex + perPage;
        const productsOnPage = result.rows.slice(startIndex, endIndex);

        return res.json({
            message: "Tìm thấy sản phẩm",
            data: productsOnPage,
            totalPages,
            currentPage: page,
        });
    } catch (error) {
        return res.status(500).json({ message: 'Lỗi API' });
    }
}

const getAllProducts = async (req, res) => {
    try {
        const page = req.query.page;
        const perPage = 3; // Số sản phẩm trên mỗi trang

        let sql = 'SELECT * FROM product';
        const values = [];

        if (page !== undefined) {
            // Nếu có tham số 'page', thực hiện phân trang
            const offset = (page - 1) * perPage;
            sql += ` LIMIT ${perPage} OFFSET ${offset}`;
        }

        connect.query(sql, (err, result) => {
            if (err) {
                return res.status(500).json({ message: 'Không lấy được danh sách sản phẩm' });
            }
            const products = result.rows;

            if (page !== undefined) {
                return res.status(200).json({ message: `Danh sách sản phẩm trang ${page}`, products });
            } else {
                return res.status(200).json({ message: 'Danh sách sản phẩm', products });
            }
        });
    } catch (error) {
        return res.status(500).json({ message: 'Lỗi API' });
    }
};
const RemoveProduct = async (req, res) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        const decoded = jwt.verify(token, "datn");
        const userId = decoded.user_id;
        const { id } = req.params
        const now = DateTime.now().setZone('Asia/Ho_Chi_Minh');
        const sql1 = `SELECT * FROM product WHERE product_id=${id}`
        connect.query(sql1, (err, resolve) => {
            if (err) {
                return res.status(500).json({ message: 'Khong lay duoc san pham', err })
            }
            const product = resolve.rows[0]
            const sql2 = `DELETE FROM product WHERE product_id = ${id}`
            connect.query(sql2, (err, result) => {
                if (err) {
                    return res.status(500).json({ message: 'xoa product tai bang product that bai', err })
                }
            })
            const time = (now.toString());
            const imageStrings = product.image.map(image => `"${image}"`);
            const updatedProduct = {
                ...product,
                "image": imageStrings
            };
            const colorIdJSON = JSON.stringify(product.color_id);
            const sizeIdJSON = JSON.stringify(product.size_id);
            const sqlbin = `INSERT INTO recycle_bin_product (product, deleted_at, user_id ) VALUES('{"product_id": ${id} , "product_name": "${product.product_name}", "product_description":"${product.product_description}", "product_price":${product.product_price} , "category_id":${product.category_id}, "image":${updatedProduct.image}, "size_id":${sizeIdJSON},"color_id":${colorIdJSON} , "sale_id":${product.sale_id}, "outstan":${product.outstan}}',
'${time}', ${userId}) RETURNING *`
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
const GetOutstan = async (req, res) => {
    try {
        const sql = `SELECT * FROM product WHERE outstan IS NOT NULL AND outstan = true LIMIT 8`
        connect.query(sql, (err, results) => {
            if (err) {
                return res.status(500).json({ message: 'Lay outstan that bai', err })
            }
            const data = results.rows
            return res.status(200).json({ message: 'Lay outstan thanh cong', data })
        })
    } catch (err) {
        return res.status(500).json({ message: 'Loi api', err })
    }
}
const GetSale = async (req, res) => {
    try {
      const sql = `SELECT product.*, sale.sale_distcount FROM product
        JOIN sale ON product.sale_id = sale.sale_id
        WHERE sale.sale_distcount > 0
        LIMIT 8;
        `
        connect.query(sql, (err, results) => {
            if (err) {
                return res.status(500).json({ message: 'Lay sale that bai', err })
            }
            const data = results.rows
            return res.status(200).json({ message: 'Lay sale thanh cong', data })
        })
    } catch (err) {
        return res.status(500).json({ message: 'Loi api', err })
    }
}

const getNewProduct = async (req, res) => {
    try {
        let sqlQuery = `SELECT * FROM product ORDER BY product_id DESC LIMIT 8;`;
        connect.query(sqlQuery, (err, result) => {
            if (err) {
                return res.status(500).json({
                    message: "Lỗi truy vấn cơ sở dữ liệu"
                })
            }
            const data = result.rows;
            return res.json({
                message: "Danh sách 8 sản phẩm mới nhất",
                data
            });
        });
    } catch (error) {
        return res.status(500).json({ message: 'Lỗi API' });
    }
}
const GetOneProduct = async (req, res) => {
    try {
        const { id } = req.params
        const sql = `SELECT * FROM product WHERE product_id = ${id}`
        connect.query(sql, (err, results) => {
            if (err) {
                return res.status(500).json({ message: 'Lay one that bai', err })
            }
            const data = results.rows
            return res.status(200).json({ message: 'Lay one thanh cong', data })
        })
    } catch (err) {
        return res.status(500).json({ message: 'Loi api', err })
    }
}
module.exports = { AddProduct, getAllProducts, RemoveProduct, GetOutstan, GetSale, getNewProduct, searchProduct, GetOneProduct };


