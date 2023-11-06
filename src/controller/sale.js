
const connect = require("../../database");
const io = require('../../app');
const { SaleSchema } = require("../schema/SaleSchema");
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


module.exports = { getAllSale, updateSaleProduct ,addSale};
