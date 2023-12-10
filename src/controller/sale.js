
const connect = require("../../database");
const io = require('../../app');
const { SaleSchema } = require("../schema/SaleSchema");
const schedule = require('node-schedule');
const getAllSale = async (req, res) => {
    try {

        let sql = `SELECT * FROM sale`;

        connect.query(sql, (err, result) => {
            if (err) {
                return res.status(500).json({ message: 'lay sale that bại' });
            }
            const data = result.rows;
            return res.status(200).json({ message: 'lay sale thành công', data });
        });
    } catch (error) {
        return res.status(500).json({ message: 'Lỗi API' });
    }
}
const getOneSale = async (req, res) => {
    try {
        const { id } = req.params
        const sql = `SELECT * FROM sale WHERE sale_id = ${id}`
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
const updateSaleProduct = async (req, res) => {
    try {
        const { sale_id, id } = req.body;
        let sql = `UPDATE product SET sale_id= ${sale_id} WHERE product_id=${id} RETURNING *`;
        connect.query(sql, (err, result) => {
            if (err) {
                return res.status(500).json({ message: 'Update sale that bai', err });
            }
            const data = result.rows[0];
            console.log(data);
            io.emit('updatesale', { message: 'update sale thanh cong', data });
            return res.status(200).json({ message: 'Update sale thành công', data });
        });
    } catch (error) {
        return res.status(500).json({ message: 'Lỗi API' });
    }
}
const addSale = async (req, res) => {
    try {
        const { error, value } = SaleSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ message: error.details[0].message });
        }
        const { sale_distcount, sale_name } = value;
        const CategoryQuery = `SELECT * FROM sale WHERE sale_name = $1`;
        const CategoryValues = [sale_name];

        connect.query(CategoryQuery, CategoryValues, (err, Result) => {
            if (err) {
                return res.status(500).json({ message: 'Lỗi khi kiểm tra sale' });
            }

            if (Result.rows.length > 0) {
                return res.status(400).json({ message: 'sale đã tồn tại' });
            }
            const addQuery = `INSERT INTO sale (sale_name, sale_distcount) VALUES ($1, $2) RETURNING *`;
            const addValues = [sale_name, sale_distcount];

            connect.query(addQuery, addValues, (err, Result) => {
                if (err) {
                    return res.status(500).json({ message: 'Thêm sale thất bại' });
                }

                const data = Result.rows[0];
                return res.status(201).json({ message: 'Thêm sale thành công', data });
            });
        });
    } catch (error) {
        return res.status(500).json({ message: 'Lỗi API' });
    }
}
const updateSale = (req, res) => {
    try {
        const sale_id = req.params.id;
        const { sale_name, sale_distcount } = req.body;
        const sql1 = `SELECT * FROM sale WHERE sale_id = ${sale_id}`;
        connect.query(sql1, (err, selectResult) => {
            if (err) {
                return res.status(500).json({ message: 'Lỗi truy vấn cơ sở dữ liệu', err });
            }

            if (selectResult.rows.length === 0) {
                return res.status(404).json({ message: 'Category không tồn tại' });
            }

            // Category tồn tại, tiến hành cập nhật
            const sql2 = `
                UPDATE sale 
                SET 
                    sale_name='${sale_name}',
                    sale_distcount='${sale_distcount}'
                WHERE sale_id = ${sale_id}
                RETURNING *`;

            connect.query(sql2, (err, updateResult) => {
                if (err) {
                    return res.status(500).json({ message: 'Lỗi không thể cập nhật gias sale', err });
                }

                const data = updateResult.rows[0];
                return res.status(200).json({ message: 'Sửa sale thành công', data });
            });
        });

    } catch (error) {
        return res.status(500).json({ message: 'Lỗi API' });
    }
}
const RemoveSale = async (req, res) => {
    try {
        const { id } = req.params;

        // Tìm và xóa sản phẩm có sale_id tương ứng
        const sqlDeleteProducts = `DELETE FROM product WHERE sale_id = ${id}`;
        connect.query(sqlDeleteProducts, (productErr) => {
            if (productErr) {
                return res.status(500).json({ message: 'Xoá sản phẩm của Sale thất bại', error: productErr });
            }

            // Sau khi xóa sản phẩm, tiến hành xóa Sale
            const sqlDeleteSale = `DELETE FROM sale WHERE sale_id = ${id}`;
            connect.query(sqlDeleteSale, (saleErr) => {
                if (saleErr) {
                    return res.status(500).json({ message: 'Xoá Sale thất bại', error: saleErr });
                }
                return res.status(200).json({ message: 'Xoá Sale và sản phẩm thành công' });
            });
        });
    } catch (error) {
        console.error('Lỗi API:', error);
        return res.status(500).json({ message: 'Lỗi API.' });
    }
};
let startJob;
let endJob;
const UpdateFlashSale = (req, res) => {
    try {
        const { giostart, phutstart, ngaystart, thangstart, gioend, phutend, ngayend, thangend, id_cat, sale_id } = req.body
        // let startJob;
        // let endJob;
        function runScheduledTask() {
            const selectQuery = `SELECT * FROM product WHERE category_id=${id_cat} AND sale_id IS NULL`;
            connect.query(selectQuery, (err, results) => {
                if (err) {
                    return res.status(500).json({ message: 'Không lấy được sản phẩm', err });
                }

                const productsToUpdate = results.rows;

                productsToUpdate.forEach(product => {
                    const updateQuery = `UPDATE product SET sale_id = ${sale_id},  flashsale = true WHERE product_id = ${product.product_id}`;

                    connect.query(updateQuery, (err) => {
                        if (err) {
                            return res.status(500).json({ message: 'Không sửa được flash sale' });
                        }
                    });
                });
                const sql2 = `UPDATE flashsale SET status = true WHERE category_id = ${id_cat}`
                connect.query(sql2, (err, results) => {
                    if (err) {
                        return res.status(500).json({ message: 'Loi update', err })
                    }
                })
                return res.status(200).json({ message: 'update flast sale thanh cong' })
            });
        }
        function EndScheduledTask() {
            const selectQuery = `SELECT * FROM product WHERE category_id=${id_cat} AND flashsale=true`;

            connect.query(selectQuery, (err, results) => {
                if (err) {
                    return res.status(500).json({ message: 'Không lấy được sản phẩm', err });
                }

                const productsToUpdate = results.rows;

                productsToUpdate.forEach(product => {
                    const updateQuery = `UPDATE product SET sale_id = null ,flashsale = false WHERE product_id = ${product.product_id}`;

                    connect.query(updateQuery, (err) => {
                        if (err) {
                            return res.status(500).json({ message: 'Không sửa được flash sale' });
                        }
                        const sql = `DELETE FROM flashsale WHERE category_id = ${id_cat}`
                        connect.query(sql, (err) => {
                            if (err) {
                                return res.status(500).json({ message: 'Loi khong xoa flash sale', err })
                            }
                        })
                    });
                });

            });
        }
        startJob = schedule.scheduleJob(`${phutstart} ${giostart} ${ngaystart} ${thangstart} *`, function () {
            runScheduledTask();
        });
        schedule.scheduleJob(`${phutend} ${gioend} ${ngayend} ${thangend} *`, function () {
            EndScheduledTask();
        });
        endJob = schedule.scheduleJob(`${phutend} ${gioend} ${ngayend} ${thangend} *`, function () {
            EndScheduledTask();
        });
    } catch (error) {
        return res.status(500).json({ message: 'Lỗi API' });
    }
}
const AddFlashSale = (req, res) => {
    try {
        const { starttime, endtime, category_id, sale_id } = req.body
        const sql = `INSERT INTO flashsale (start_time, end_time, category_id, sale_id) VALUES ($1, $2, $3, $4) RETURNING *`;
        const values = [starttime, endtime, category_id, sale_id];
        connect.query(sql, values, (err, results) => {
            if (err) {
                return res.status(500).json({ message: 'Loi them', err })
            }
            const data = results.rows
            return res.json({ message: 'Them thanh cong', data })
        })
    } catch (error) {
        return res.status(500).json({ message: 'Lỗi API' });
    }
}

const EndScheduledTask = (categoryId) => {
    const selectQuery = `SELECT * FROM product WHERE category_id=${categoryId} AND flashsale=true`;

    connect.query(selectQuery, (err, results) => {
        if (err) {
            console.error('Không lấy được sản phẩm khi kết thúc flash sale', err);
            return;
        }

        const productsToUpdate = results.rows;

        productsToUpdate.forEach(product => {
            const updateQuery = `UPDATE product SET sale_id = null ,flashsale = false WHERE product_id = ${product.product_id}`;

            connect.query(updateQuery, (err) => {
                if (err) {
                    console.error('Không sửa được flash sale khi kết thúc', err);
                }
            });
        });

        const deleteFlashSaleQuery = `DELETE FROM flashsale WHERE category_id = ${categoryId}`;
        connect.query(deleteFlashSaleQuery, (err) => {
            if (err) {
                console.error('Lỗi khi xóa flash sale khi kết thúc', err);
            }
        });
    });
};
const DeleteFlashSale = (req, res) => {
    try {
        const id = req.params.id;
        const sql = `DELETE FROM flashsale WHERE id=${id}`;
        if (startJob) {
            startJob.cancel();
        }

        // Lấy categoryId từ flashsale cần xóa
        const getCategoryQuery = `SELECT category_id FROM flashsale WHERE id = ${id}`;
        connect.query(getCategoryQuery, (err, result) => {
            if (err) {
                return res.status(500).json({ message: 'Lỗi lấy categoryId từ flashsale', err });
            }

            const categoryId = result.rows[0].category_id;

            // Gọi hàm EndScheduledTask để cập nhật sản phẩm khi kết thúc flash sale
            EndScheduledTask(categoryId);

            // Tiếp tục xóa flashsale
            connect.query(sql, (err, result) => {
                if (err) {
                    return res.status(404).json({ message: "Xóa flashsale thất bại!" });
                }
                if (result.rowCount === 0) {
                    return res.status(404).json({ message: "Xóa flashsale thất bại, ID không tồn tại!" });
                }

                return res.status(200).json({ message: "Xóa flashsale thành công!" });
            });
        });
    } catch (error) {
        return res.status(500).json({ message: 'Lỗi API' });
    }
};
const UpdateFlashSaleStatusOK = (req, res) => {
    try {
        const { category_id } = req.body
        const sql = `UPDATE flashsale SET status = false WHERE category_id = ${category_id}`;
        connect.query(sql, (err, results) => {
            if (err) {
                return res.status(500).json({ message: 'Loi update', err })
            }
            return res.json({ message: 'thanh cong' })
        })
    } catch (error) {
        return res.status(500).json({ message: 'Lỗi API' });
    }
}
const getAllFashSale = (req, res) => {
    try {
        const sql = `SELECT * FROM flashsale`
        connect.query(sql, (err, results) => {
            if (err) {
                return res.status(500).json({ message: 'Lay flashsale that bai' })
            }
            const data = results.rows
            return res.json({ message: 'Lay flashsale thanh cong', data })
        })
    } catch (error) {
        return res.status(500).json({ message: 'Lỗi API' });
    }
}

module.exports = { DeleteFlashSale, getOneSale, updateSale, UpdateFlashSaleStatusOK, getAllFashSale, getAllSale, updateSaleProduct, addSale, RemoveSale, UpdateFlashSale, AddFlashSale };
