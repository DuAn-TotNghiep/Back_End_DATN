

const connect = require('../../database');
const { addProduct } = require('../schema/productSchema');
const AddProduct = async (req, res, next) => {
    try {
        const { color_id, size_id, category_id, name, image, desc, price } = req.body
       
        const { error } = addProduct.validate(req.body, { abortEarly: false });
        if (error) {
            const errs = error.details.map(err => err.message)
            return res.status(400).json(errs)
        }
        const sql1 = `INSERT INTO color_detail_product (color_id) VALUES (ARRAY[${color_id}]) RETURNING *`
        connect.query(sql1, (err, resolve) => {
            if (err) {
                return res.status(500).json({ message: "Loi khong them duoc mau cho san pham", err })
            }
            const color = resolve.rows[0]
            const sql2 = `INSERT INTO size_detail_product (size_id) VALUES (ARRAY[${size_id}]) RETURNING *`
            connect.query(sql2, (err, resolve) => {
                if (err) {
                    return res.status(500).json({ message: 'Loi khong them duoc size cho san pham', err })
                }
                const size = resolve.rows[0]
                const sql3 = `INSERT INTO image (image) VALUES (ARRAY['${image}']) RETURNING *`
                connect.query(sql3, (err, resolve) => {
                    if (err) {
                        return res.status(500).json({ message: 'Loi khong them duoc anh cho san pham', err })
                    }
                    const images = resolve.rows[0]
                    const sql4 = `SELECT * FROM product WHERE product_name='${name}'`
                    connect.query(sql4, (err, resolve) => {
                        console.log(resolve.rows);
                        if (resolve.rows.length > 0) {
                            return res.status(500).json({ message: 'san pham da ton tai' })
                        }
                        const sql5 = `INSERT INTO product (size_id, color_id, image_id,category_id, product_name, product_description, product_price) VALUES (${size.id}, ${color.id}, ${images.image_id}, ${category_id},'${name}','${desc}', ${price}) RETURNING *`
                        connect.query(sql5, (err, resolve) => {
                            if (err) {
                                return res.status(500).json({ message: 'Loi khong them duoc san pham', err })
                            }
                            const data = resolve.rows[0]
                            console.log(color);
                            const sql6 = `UPDATE color_detail_product SET product_id =${data.product_id} WHERE id=${color.id}`
                            connect.query(sql6, (err, resolve) => {
                                if (err) {
                                    return res.status(500).json({ message: "Khong cap nhap lai color cua product", err })
                                }
                                const sql7 = `UPDATE size_detail_product SET product_id =${data.product_id} WHERE id=${size.id}`
                                connect.query(sql7, (err, resolve) => {
                                    if (err) {
                                        return res.status(500).json({ message: "Khong cap nhap lai size cua product", err })
                                    }
                                    return res.status(200).json({ message: "Them san pham thanh cong", data })
                                })
                            })


                        })
                    })
                })
            })
        })
    } catch (err) {
        return res.status(500).json({ message: 'Loi api', err })
    }
}
module.exports = { AddProduct };