


const connect = require('../../database');
const { categorySchema } = require('../schema/categorySchema');
const addCategory = async (req, res) => {
    try {
        const { error, value } = categorySchema.validate(req.body);
        if (error) {
            return res.status(400).json({ message: error.details[0].message });
        }
        const { category_name,image } = value;
        const CategoryQuery = `SELECT * FROM category WHERE category_name = $1`;
        const CategoryValues = [category_name];

        connect.query(CategoryQuery, CategoryValues, (err, Result) => {
            if (err) {
                return res.status(500).json({ message: 'Lỗi khi kiểm tra category' });
            }

            if (Result.rows.length > 0) {
                return res.status(400).json({ message: 'category đã tồn tại' });
            }
            const addQuery = `INSERT INTO category (category_name,image) VALUES ($1,$2) RETURNING *`;
            const addValues = [category_name,image];

            connect.query(addQuery, addValues, (err, Result) => {
                if (err) {
                    return res.status(500).json({ message: 'Thêm category thất bại' });
                }

                const data = Result.rows[0];
                return res.status(201).json({ message: 'Thêm category thành công', data });
            });
        });
    } catch (error) {
        return res.status(500).json({ message: 'Lỗi API' });
    }
}

//updateCategory

const updateCategory = (req, res) => {
    try {
        const categoryId = req.params.id;
        const { category_name,image } = req.body;
        const sql1 = `SELECT * FROM category WHERE category_id = ${categoryId}`;
        connect.query(sql1, (err, selectResult) => {
            if (err) {
                return res.status(500).json({ message: 'Lỗi truy vấn cơ sở dữ liệu', err });
            }

            if (selectResult.rows.length === 0) {
                return res.status(404).json({ message: 'Category không tồn tại' });
            }

            // Category tồn tại, tiến hành cập nhật
            const sql2 = `
                UPDATE category 
                SET 
                    category_name='${category_name}',
                    image='${image}'
                WHERE category_id = ${categoryId}
                RETURNING *`;

            connect.query(sql2, (err, updateResult) => {
                if (err) {
                    return res.status(500).json({ message: 'Lỗi không thể cập nhật sản phẩm', err });
                }

                const data = updateResult.rows[0];
                return res.status(200).json({ message: 'Sửa category thành công', data });
            });
        });

    } catch (error) {
        return res.status(500).json({ message: 'Lỗi API' });
    }
}

// getAllCategory 
const getAllCategory = async (req, res) => {
    try {
        const { page, perPage } = req.query; // Lấy thông tin trang và số mục trên mỗi trang từ query parameters

        const pageNumber = parseInt(page) || 1; // Chuyển đổi page thành số nguyên, mặc định là 1 nếu không có hoặc không hợp lệ
        const itemsPerPage = parseInt(perPage) || 3; // Chuyển đổi perPage thành số nguyên, mặc định là 3 nếu không có hoặc không hợp lệ

        const offset = (pageNumber - 1) * itemsPerPage; // Tính toán offset dựa trên trang hiện tại và số mục trên mỗi trang

        let sqlTotal = `SELECT COUNT(*) FROM category`; // Đếm tổng số dòng trong bảng category
        let sql = `SELECT * FROM category ORDER BY category_id LIMIT $1 OFFSET $2`; // Sử dụng LIMIT và OFFSET để thực hiện phân trang

        const totalResults = await connect.query(sqlTotal);
        const totalCategories = parseInt(totalResults.rows[0].count);

        const totalPages = Math.ceil(totalCategories / itemsPerPage);

        connect.query(sql, [itemsPerPage, offset], (err, results) => {
            if (err) {
                return res.status(500).json({ message: 'Lấy tất cả category thất bại' });
            }
            const data = results.rows;
            return res.status(200).json({
                message: 'Lấy tất cả category thành công',
                data,
                totalPages,
                currentPage: pageNumber,
            });
        });
    } catch (err) {
        return res.status(500).json({ message: 'Lỗi API' });
    }
}
const getAllCategoryNoPagination = async (req, res) => {
    try {
        let sql = `SELECT * FROM category`;

        connect.query(sql, (err, results) => {
            if (err) {
                return res.status(500).json({ message: 'Lấy tất cả category thất bại' });
            }
            const data = results.rows;
            return res.status(200).json({
                message: 'Lấy tất cả category thành công',
                data,
            });
        });
    } catch (err) {
        return res.status(500).json({ message: 'Lỗi API' });
    }
}


const GetAllCat = (req, res) => {
    let sql = `SELECT * FROM category`;
    connect.query(sql, (err, results) => {
        if (err) {
            return res.status(500).json({ message: "Loi khong lay duco all" })
        }
        const data = results.rows
        return res.status(200).json({ message: 'lay thanh cong', data })
    })
}
const getOneCat = async (req, res) => {
    try {
        const { id } = req.params
        const sql = `SELECT * FROM category WHERE category_id = ${id}`
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


const RemoveCategory = async (req, res) => {
    try {
        const { id } = req.params;

        // Xóa sản phẩm của danh mục
        await removeProductsOfCategory(id);

        // Xóa danh mục
        const sqlDeleteCategory = `DELETE FROM category WHERE category_id = ${id}`;
        connect.query(sqlDeleteCategory, (err) => {
            if (err) {
                return res.status(500).json({ message: 'Xoá category thất bại', err });
            }
            return res.status(200).json({ message: 'Xoá category và sản phẩm thành công' });
        });
    } catch (error) {
        console.error('Lỗi API:', error);
        return res.status(500).json({ message: 'Lỗi API.' });
    }
};

async function removeProductsOfCategory(category_id) {
    try {
        // Xoá sản phẩm của danh mục
        const deleteProductsQuery = `DELETE FROM product WHERE category_id = ${category_id}`;
        await connect.query(deleteProductsQuery);
    } catch (error) {
        console.error(`Error deleting products for category ${category_id}:`, error);
        // Xử lý lỗi nếu cần
    }
}
const ProductinCategory = async (req, res) => {
    try {
        // Thực hiện truy vấn SQL để lấy thông tin sản phẩm từ bảng "checkout"
        const checkoutSql = `SELECT * FROM checkout`;
        connect.query(checkoutSql, (err, checkoutResults) => {
            if (err) {
                return res.status(500).json({ message: 'Lỗi truy vấn SQL:', err });
            }

            const data = checkoutResults.rows;

            // Tạo một mảng chứa các "product_id" để tránh nhiều truy vấn SQL riêng lẻ
            const productIds = [];
            data?.map((data) => {
                data?.product?.map((data2) => {
                    productIds.push(data2.product_id);
                });
            });

            // Thực hiện truy vấn SQL để lấy thông tin sản phẩm dựa trên danh sách "productIds"
            const productSql = `SELECT p.product_id, p.category_id FROM product p WHERE p.product_id IN (${productIds.join(',')})`;
            connect.query(productSql, (err, productResults) => {
                if (err) {
                    return res.status(500).json({ message: 'Lỗi truy vấn SQL:', err });
                }

                const productData = productResults.rows;

                // Thực hiện truy vấn SQL để lấy danh sách các danh mục và số lượng sản phẩm trong mỗi danh mục
                const categorySql = `
                    SELECT c.category_name, COUNT(p.product_id) as product_count
                    FROM product p
                    INNER JOIN category c ON p.category_id = c.category_id
                    GROUP BY c.category_name
                    ORDER BY product_count DESC
                `;

                connect.query(categorySql, (err, categoryResults) => {
                    if (err) {
                        return res.status(500).json({ message: 'Lỗi truy vấn SQL:', err });
                    }

                    const categoryCounts = categoryResults.rows;

                    return res.status(200).json({ message: 'Thành công', categoryCounts });
                });
            });
        });
    } catch (err) {
        return res.status(500).json({ message: 'Lỗi API', err });
    }
};
const ProductinCategorys = async (req, res) => {
    try {
      const { id } = req.params;
  
      const relatedProductsSql = `
        SELECT * FROM product
        WHERE category_id = ${id}
      `;
  
      connect.query(relatedProductsSql, (err, relatedProductsResults) => {
        if (err) {
          return res.status(500).json({ message: "Lấy sản phẩm trong danh mục thất bại", err });
        }
  
        const relatedProducts = relatedProductsResults.rows;
  
        return res.status(200).json({ message: "Lấy sản phẩm thành công", data: relatedProducts });
      });
    } catch (err) {
      return res.status(500).json({ message: "Lỗi API", err });
    }
  }

module.exports = {ProductinCategorys, updateCategory, getOneCat, addCategory, getAllCategory, RemoveCategory, GetAllCat, getAllCategoryNoPagination, ProductinCategory };


