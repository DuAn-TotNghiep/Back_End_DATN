const { DateTime } = require("luxon");
const connect = require("../../database");
const { BillSchema } = require("../schema/BillSchema");
const { getAllSale } = require("./sale");

const getBill = async (req, res) => {
    try {
        const sql = `
            SELECT *
            FROM bill
            JOIN orders ON bill.order_id = orders.order_id
            JOIN checkout ON orders.checkout_id = checkout.id
            JOIN users ON checkout.user_id = users.id
        `;

        const results = await connect.query(sql);

        if (!results || !results.rows || results.rows.length === 0) {
            return res
                .status(404)
                .json({ message: "Không tìm thấy thông tin bill nào." });
        }

        const data = results.rows;
        return res.status(200).json({
            message: "Lấy thông tin bill và thông tin từ bảng checkout thành công",
            data,
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Lỗi API" });
    }
};

const updateBill = async (req, res) => {
    try {
        const id = req.params.id;
        const { province, district, ward, address } = req.body;
        const { user_phone } = req.body;

        // Kiểm tra xem hóa đơn có tồn tại
        const billExist = await connect.query(
            "SELECT * FROM bill WHERE bill_id = $1",
            [id]
        );
        // console.log(billExist);

        if (!billExist.rows || billExist.rows.length === 0) {
            return res.status(404).json({ message: "Hóa đơn không tồn tại!" });
        }
        // Kiểm tra dữ liệu đầu vào theo schema
        const { error } = BillSchema.validate({ user_phone, province, district, ward, address });
        if (error) {
            return res.status(400).json({ message: error.message });
        }
        // Nếu tồn tại, tiến hành cập nhật
        const updateCheckoutSql = `
            UPDATE checkout
            SET address = $1, province = $2, district = $3, ward = $4
            FROM orders
            WHERE checkout.id = orders.checkout_id
            AND orders.order_id = $5
            RETURNING *
        `;
        connect.query(
            updateCheckoutSql,
            [address, province, district, ward, billExist.rows[0].order_id],
            (err, result) => {
                if (err) {
                    return res
                        .status(500)
                        .json({ message: "Lỗi không thể cập nhật địa chỉ!", err });
                }
                const data = result.rows[0];
                const updateUsersSql = `
            UPDATE users
            SET user_phone = $1
            WHERE id = $2;
`;
                connect.query(
                    updateUsersSql,
                    [user_phone, data.user_id],
                    (err, result) => {
                        if (err) {
                            return res
                                .status(500)
                                .json({ message: "Lỗi không thể cập nhật số điện thoại", err });
                        }
                        return res
                            .status(200)
                            .json({ message: "Cập nhật thông tin hóa đơn thành công!" });
                    }
                );
                console.log(data);
            }
        );
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Lỗi API", error: error });
    }
};

const getOneBill = async (req, res) => {
    try {
        const { id } = req.params;
        const sql = `SELECT * FROM bill WHERE checkout_id = ${id} RETURNING*`;
        connect.query(sql, (err, results) => {
            if (err) {
                return res.status(500).json({ message: "Lấy 1 id thất bại", err });
            }
            const data = results.rows;
            return res.status(200).json({ message: "Lấy 1 id thành công", data });
        });
    } catch (err) {
        return res.status(500).json({ message: "Lỗi API", err });
    }
};
const getOneBillInCheckOut = async (req, res) => {
    try {
        const { id } = req.params;
        const sql = `SELECT * FROM bill WHERE order_id = ${id}`;
        connect.query(sql, (err, results) => {
            if (err) {
                return res.status(500).json({ message: "Lấy 1 id thất bại", err });
            }
            const data = results.rows;
            return res.status(200).json({ message: "Lấy 1 id thành công", data });
        });
    } catch (err) {
        return res.status(500).json({ message: "Lỗi API", err });
    }
};
const bill = async (req, res) => {
    try {
        const { user_id, order_id } = req.body;
        const bill_date = DateTime.local().setZone("Asia/Ho_Chi_Minh");

        const userQuery = `SELECT * FROM users WHERE id = ${user_id}`;
        const userData = await connect.query(userQuery);
        const user = userData.rows[0];
        const lastName = user?.user_lastname;
        const firstName = user?.user_firstname;
        const phone = user?.user_phone;

        const orderQuery = `SELECT * FROM orders WHERE order_id = ${order_id}`;
        const orderData = await connect.query(orderQuery);
        const order = orderData.rows[0];
        const totalSum = order?.order_total;

        const checkoutQuery = `SELECT * FROM checkout WHERE id = ${order?.checkout_id}`;
        const checkoutData = await connect.query(checkoutQuery);
        const checkout = checkoutData.rows[0];
        const address = checkout?.address;
        const province = checkout?.province;
        const district = checkout?.district;
        const ward = checkout?.ward;

        const productQueryPromises = checkout?.product?.map(async (data) => {
            const productQuery = `SELECT * FROM product WHERE product_id = ${data?.product_id}`;

            const productResult = await connect.query(productQuery);
            const productData = productResult.rows[0];
            let sql = `SELECT * FROM sale`;
            const sale = await connect.query(sql);
            const salediscount = sale?.rows?.find((data) => data?.sale_id == productData?.sale_id)?.sale_distcount
            const price = productData?.product_price * (salediscount/100)
            if (productData?.sale_id !=null) {
                return {
                    size: data?.size,
                    color: data?.color,
                    quantity: data?.quantity,
                    name: productData?.product_name,
                    price: productData?.product_price - price
                };
            } else {
                return {
                    size: data?.size,
                    color: data?.color,
                    quantity: data?.quantity,
                    name: productData?.product_name,
                    price: productData?.product_price
                };
            }
        });

        const productData = await Promise.all(productQueryPromises);
        const productsJson = JSON.stringify(productData);
        const sql1 = `
    INSERT INTO bill (
        customer_name, 
        customer_last_name, 
        customer_address,
        customer_province, 
        customer_district, 
        customer_ward, 
        customer_phone, 
        total_amount,
        creation_time, 
        products,
        order_id
    ) 
    VALUES (
        '${firstName}', 
        '${lastName}', 
        '${address}', 
        '${province}', 
        '${district}', 
        '${ward}', 
        '${phone}', 
        '${totalSum}', 
        '${bill_date}', 
        '${productsJson}',
        ${order_id}
    ) 
    RETURNING *
`;

        connect.query(sql1, (err, result) => {
            if (err) {
                return res.status(500).json({ message: "loi them bill", err });
            }
            const data = result.rows;
            return res.status(200).json({ message: "Tạo bill thành công", data });
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Lỗi API" });
    }
};

const getOneBill2 = async (req, res) => {
    try {
        const { id } = req.params;
        const sql = `
            SELECT *
            FROM bill
            JOIN orders ON bill.order_id = orders.order_id
            JOIN checkout ON orders.checkout_id = checkout.id
            JOIN users ON checkout.user_id = users.id
            WHERE bill.bill_id = ${id}
        `;

        const results = await connect.query(sql);

        if (!results || !results.rows || results.rows.length === 0) {
            return res.status(404).json({ message: `Không tìm thấy hóa đơn có id ${id}` });
        }

        const data = results.rows[0]; // Chỉ lấy phần tử đầu tiên vì chỉ có một hóa đơn
        return res.status(200).json({ message: `Lấy thông tin hóa đơn thành công`, data });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Lỗi API', err });
    }
};

module.exports = {
    getOneBill2,
    updateBill,
    bill,
    getBill,
    getOneBill,
    getOneBillInCheckOut,
};
