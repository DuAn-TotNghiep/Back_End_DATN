

const connect = require('../../database');
const jwt = require('jsonwebtoken');
const { addProduct, updateProduct } = require('../schema/productSchema');
const { DateTime } = require('luxon')
const AddProduct = async (req, res, next) => {
    try {
        const { color_id, size_id, category_id, name, image, desc, price } = req.body
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
//update product

const UpdateProduct = async (req, res, next) => {
    try {
        const productId = req.params.id;
        const { color_id, size_id, category_id, name, image, desc, price, outstan } = req.body;

        // Kiểm tra xem sản phẩm có tồn tại không
        const sql1 = `SELECT * FROM product WHERE product_id = ${productId}`;
        connect.query(sql1, (err, result) => {
            if (err) {
                return res.status(500).json({ message: 'Lỗi truy vấn cơ sở dữ liệu', err });
            }

            if (result.rows.length === 0) {
                return res.status(404).json({ message: 'Sản phẩm không tồn tại' });
            }

            // Sản phẩm tồn tại, tiến hành cập nhật
            const sql2 = `
                UPDATE product 
                SET 
                    size_id = Array[${size_id}],
                    color_id = Array[${color_id}],
                    image = Array['${image}'],
                    category_id = ${category_id},
                    product_name = '${name}',
                    product_description = '${desc}',
                    product_price = ${price},
                    outstan=${outstan}
                WHERE product_id = ${productId}
                RETURNING *`;

            connect.query(sql2, (err, result) => {
                if (err) {
                    return res.status(500).json({ message: 'Lỗi không thể cập nhật sản phẩm', err });
                }

                const data = result.rows[0];
                return res.status(200).json({ message: 'Sửa sản phẩm thành công', data });
            });
        });
    } catch (err) {
        return res.status(500).json({ message: 'Lỗi API', err });
    }
}





// serachProduct


const searchProduct = async (req, res) => {
    try {
        let product_name = req.body.product_name;
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

// getProductSearchCategory

const getProductSearchCategory = async (req, res) => {
    try {
        let category_name = req.body.category_name;
        category_name = category_name.trim();
        let regex = `%${category_name}%`;

        // Truy vấn để lấy tất cả sản phẩm có tên chứa category_name
        let sql = `
            SELECT product.* 
            FROM product 
            WHERE product.product_name ILIKE $1
        `;

        const result = await connect.query(sql, [regex]);

        if (result.rows.length == 0) {
            return res.json({
                message: "Không tìm thấy sản phẩm của danh mục bạn đã chọn"
            });
        }

        return res.json({
            message: "Tìm thấy sản phẩm trong danh mục",
            data: result.rows,
        });
    } catch (error) {
        return res.status(500).json({ message: 'Lỗi API' });
    }
}




const getAllProducts = async (req, res) => {
    try {
        const sql = `SELECT * FROM product`;
        const results = await connect.query(sql);
        if (!results || !results.rows || results.rows.length === 0) {
            return res.status(404).json({ message: 'Không tìm thấy san pham nào.' });
        }
        const data = results.rows;
        return res.status(200).json({
            message: 'Lấy tất cả san pham thành công',
            data,
        });
    } catch (err) {
        return res.status(500).json({ message: 'Lỗi API' });
    }
}
const GetAllProductOff = (req, res) => {
    try {
        const sql = `SELECT * FROM product`;
        connect.query(sql, (err, resolve) => {
            const data = resolve.rows
            return res.status(200).json({
                message: 'Lấy tất cả san pham thành công',
                data,
            });
        })
    } catch (err) {
        return res.status(500).json({ message: 'Lỗi API' });
    }
}
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
        const sql = `SELECT * FROM product WHERE outstan IS NOT NULL AND outstan = true LIMIT 4`
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
        LIMIT 4;
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
        let sqlQuery = `SELECT * FROM product ORDER BY product_id DESC LIMIT 4;`;
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
const GetTopSaleProduct = async (req, res) => {
    try {
        const sql = `
    SELECT * FROM product WHERE sale_id > 0
    `;
        connect.query(sql, async (err, results) => {
            if (err) {
                return res.status(500).json({ message: 'Lấy sản phẩm giảm giá bán chạy thất bại', err });
            }
            const data = results.rows;

            let resolve = []
            const resultPromises = data.map(async (productId) => {
                // Tạo một Promise cho mỗi câu truy vấn SQL
                return new Promise((resolve, reject) => {
                    const sqlQuery = `SELECT * FROM checkout WHERE EXISTS (
                    SELECT * FROM jsonb_array_elements(product) AS p
                    WHERE p->>'product_id' ='${productId.product_id}')`;
                    connect.query(sqlQuery, (err, results) => {
                        if (err) {
                            reject(err);
                        } else {
                            resolve(results.rows);
                        }
                    });
                });
            });
            // Sử dụng Promise.all để gộp kết quả từ tất cả các truy vấn
            const allResults = await Promise.all(resultPromises);
            // Bây giờ allResults chứa mảng các kết quả từ các truy vấn
            // Gộp tất cả kết quả thành một mảng duy nhất
            const mergedResults = [].concat(...allResults);
            // Tạo một đối tượng để theo dõi số lượng sản phẩm mua
            const productCountMap = {};
            // Đếm số lượng sản phẩm mua
            mergedResults.forEach((row) => {
                if (!productCountMap[row.product[0].product_id]) {
                    productCountMap[row.product[0].product_id] = 1;
                } else {
                    productCountMap[row.product[0].product_id]++;
                }
            });
            // Chuyển đổi thành mảng các đối tượng có thông tin sản phẩm và số lượng
            const productListWithCounts = Object.keys(productCountMap).map((productId) => ({
                product_id: productId,
                count: productCountMap[productId],
            }));
            // Sắp xếp danh sách theo số lượng giảm dần
            productListWithCounts.sort((a, b) => b.count - a.count);
            // In danh sách sản phẩm và số lượng từ cao xuống
            return res.status(200).json({ message: 'Lấy sản phẩm giảm giá bán chạy nhất thành công', productListWithCounts });
        });
    } catch (err) {
        return res.status(500).json({ message: 'Lỗi API', err });
    }
}
const CountOrdersToday = async (req, res) => {
    try {
        const checkout_date = DateTime.local().setZone("Asia/Ho_Chi_Minh");
        const formattedDate = checkout_date.toFormat("yyyy-MM-dd");

        // Thực hiện truy vấn SQL để đếm số đơn hàng trong ngày
        const sqlQuery = `
        SELECT COUNT(*) AS checkoutday_date
        FROM checkout
        WHERE DATE(checkout_date) = '${formattedDate}';
      `;

        // Thực hiện truy vấn SQL
        const result = await connect.query(sqlQuery);

        // Lấy số đơn hàng được đặt trong ngày
        const orderCount = result.rows[0].checkoutday_date;

        return res.status(200).json({ checkoutday_date: orderCount });
    } catch (err) {
        return res.status(500).json({ message: 'Lỗi API', error: err.message });
    }
};
const CountOrdersMonth = async (req, res) => {
    try {
        const today = DateTime.local().setZone("Asia/Ho_Chi_Minh");
        const targetDate = today.minus({ days: 30 });

        // Thực hiện truy vấn SQL để đếm số đơn hàng trong tháng
        const sqlQuery = `
          SELECT COUNT(*) AS checkoutmonth_count
          FROM checkout
          WHERE DATE(checkout_date) BETWEEN '${targetDate.toISODate()}' AND '${today.toISODate()}';
        `;

        // Thực hiện truy vấn SQL
        const result = await connect.query(sqlQuery);

        // Lấy số đơn hàng được đặt trong tháng
        const orderCount = result.rows[0].checkoutmonth_count;

        return res.status(200).json({ checkoutmonth_count: orderCount });
    } catch (err) {
        return res.status(500).json({ message: 'Lỗi API', error: err.message });
    }
}
const SumProductDay = (req, res) => {
    try {
        const checkout_date = DateTime.local().setZone("Asia/Ho_Chi_Minh");
        const formattedDate = checkout_date.toFormat("yyyy-MM-dd");
        const sql = `SELECT * FROM checkout WHERE DATE(checkout_date) = '${formattedDate}' `
        connect.query(sql, (err, result) => {
            if (err) {
                return res.status(500).json({ message: 'loi', err })
            }
            let totalProductIds = 0;
            const data = result.rows
            data?.map((data) => {
                if (data && data.product) {
                    data?.product.map((data) => {
                        totalProductIds++;
                    })
                }
            })
            return res.status(200).json({ totalProductIds });
        })
    } catch (err) {
        return res.status(500).json({ message: 'Lỗi API', error: err.message });
    }
}
const FilterProductsByColor = (req, res) => {
    try {
        const { id } = req.params;
        const colorId = parseInt(id); // Chuyển đổi id thành kiểu integer

        if (isNaN(colorId)) {
            return res.status(400).json({ message: 'Id không hợp lệ' });
        }

        const sql = `SELECT * FROM product WHERE $1 = ANY(color_id)`;
        const values = [colorId];

        connect.query(sql, values, (err, result) => {
            if (err) {
                return res.status(500).json({ message: 'Không lấy được sản phẩm của màu này', err });
            }
            const data = result.rows;
            return res.status(200).json({ message: "Lấy thành công", data });
        });
    } catch (err) {
        return res.status(404).json({ message: 'Lỗi API', err });
    }
}

const FilterProductsBySize = (req, res) => {
    try {
        const { id } = req.params;
        const sizeId = parseInt(id); // Chuyển đổi id thành kiểu integer

        if (isNaN(sizeId)) {
            return res.status(400).json({ message: 'Id không hợp lệ' });
        }

        const sql = `SELECT * FROM product WHERE $1 = ANY(size_id)`;
        const values = [sizeId];

        connect.query(sql, values, (err, result) => {
            if (err) {
                return res.status(500).json({ message: 'Không lấy được sản phẩm của size này', err });
            }
            const data = result.rows;
            return res.status(200).json({ message: "Lấy thành công", data });
        });
    } catch (err) {
        return res.status(404).json({ message: 'Lỗi API', err });
    }
}

const FilterProductsByCategory = (req, res) => {
    try {
        const { id } = req.params
        const sql = `SELECT * FROM product WHERE category_id=${id}`;
        connect.query(sql, (err, result) => {
            if (err) {
                return res.status(500).json({ message: 'không lấy được sản phẩm thuộc danh mục này', err })
            }
            const data = result.rows
            return res.status(200).json({ message: "lấy thành công", data })
        })
    } catch (err) {
        return res.status(404).json({ message: 'Loi api' });
    }
}

const FilterProductsByPrice = (req, res) => {
    try {
        const { minPrice, maxPrice } = req.params;

        // Thực hiện truy vấn SQL để lọc sản phẩm theo giá
        const sql = `SELECT * FROM product WHERE product_price >= $1 AND product_price <= $2`;
        const values = [minPrice, maxPrice];

        connect.query(sql, values, (err, result) => {
            if (err) {
                return res.status(500).json({ message: 'Lọc sản phẩm theo giá thất bại', err });
            }
            const data = result.rows;
            return res.status(200).json({ message: "Lọc sản phẩm theo giá thành công", data });
        });
    } catch (err) {
        return res.status(404).json({ message: 'Loi api' });
    }
}



module.exports = { getProductSearchCategory, AddProduct, GetAllProductOff, UpdateProduct, getAllProducts, RemoveProduct, GetOutstan, GetSale, getNewProduct, searchProduct, GetOneProduct, GetTopSaleProduct, CountOrdersToday, CountOrdersMonth, SumProductDay, FilterProductsByColor, FilterProductsBySize, FilterProductsByCategory, FilterProductsByPrice };


