const connect = require("../../database");
const { DateTime } = require("luxon");

const checkout = (req, res) => {
  try {
    const {
      product,
      province,
      district,
      ward,
      address,
      payment,
      user_id,
      total,
    } = req.body;
    const productJSON = JSON.stringify(product);
    const order_date = DateTime.local().setZone("Asia/Ho_Chi_Minh");
    const sql = `
  INSERT INTO checkout (user_id, province, district, ward, payment, address, product, total,checkout_date)
  VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
  RETURNING *;
`;
    const values = [
      user_id,
      province,
      district,
      ward,
      payment,
      address,
      productJSON, // Sử dụng giá trị đã chuẩn bị ở trên
      total,
      order_date,
    ];
    connect.query(sql, values, (err, result) => {
      if (err) {
        return res
          .status(500)
          .json({ message: "Khong them duoc check out", err });
      }
      const data = result.rows[0];
      const sql1 = `DELETE FROM cart
WHERE user_id = ${user_id}`;
      connect.query(sql1, (err, result) => {
        if (err) {
          return res
            .status(500)
            .json({ message: "xoas dudwocj sanr pham trong gio hang", err });
        }
        return res.status(200).json({ message: "Them thanh cong", data });
      });
    });
  } catch (err) {
    return res.status(500).json({ message: "Loi API", err });
  }
};
const checkoutnow = (req, res) => {
  try {
    const {
      product,
      province,
      district,
      ward,
      address,
      payment,
      user_id,
      total,
    } = req.body;
    const productJSON = JSON.stringify(product);
    const order_date = DateTime.local().setZone("Asia/Ho_Chi_Minh");
    const sql = `
  INSERT INTO checkout (user_id, province, district, ward, payment, address, product, total,checkout_date)
  VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
  RETURNING *;
`;
    const values = [
      user_id,
      province,
      district,
      ward,
      payment,
      address,
      productJSON, // Sử dụng giá trị đã chuẩn bị ở trên
      total,
      order_date,
    ];
    connect.query(sql, values, (err, result) => {
      if (err) {
        return res
          .status(500)
          .json({ message: "Khong them duoc check out", err });
      }
      const data = result.rows[0];
      return res.status(200).json({ message: "Them thanh cong", data });
    });
  } catch (err) {
    return res.status(500).json({ message: "Loi API", err });
  }
};
const checkoutoff = (req, res) => {
  try {
    const {
      product,
      total,
      checkout_off,
      payment,
      province,
      district,
      ward,
      address,
    } = req.body;
    console.log(checkout_off);
    const productJSON = JSON.stringify(product);
    const order_date = DateTime.local().setZone("Asia/Ho_Chi_Minh");
    const sql = `
  INSERT INTO checkout (product, total,checkout_date,checkout_off, payment,province,district,ward,address)
  VALUES ($1, $2, $3, $4,$5,$6,$7,$8,$9)
  RETURNING *;
`;
    const values = [
      productJSON,
      total,
      order_date,
      checkout_off,
      payment,
      province,
      district,
      ward,
      address,
    ];

    connect.query(sql, values, (err, result) => {
      if (err) {
        return res
          .status(500)
          .json({ message: "Khong them duoc check out off", err });
      }
      const data = result.rows[0];
      return res.status(200).json({ message: "Them thanh cong", data });
    });
  } catch (err) {
    return res.status(500).json({ message: "Loi API", err });
  }
};
const checkoutnotoken = (req, res) => {
  try {
    const {
      product,
      province,
      district,
      ward,
      address,
      payment,
      user_id,
      total,
    } = req.body;
    const productJSON = JSON.stringify(product);
    const order_date = DateTime.local().setZone("Asia/Ho_Chi_Minh");
    const sql = `
  INSERT INTO checkout (user_id, province, district, ward, payment, address, product, total,checkout_date)
  VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
  RETURNING *;
`;
    const values = [
      user_id,
      province,
      district,
      ward,
      payment,
      address,
      productJSON, // Sử dụng giá trị đã chuẩn bị ở trên
      total,
      order_date,
    ];
    connect.query(sql, values, (err, result) => {
      if (err) {
        return res
          .status(500)
          .json({ message: "Khong them duoc check out", err });
      }
      const data = result.rows[0];

      return res.status(200).json({ message: "Them thanh cong", data });
    });
  } catch (err) {
    return res.status(500).json({ message: "Loi API", err });
  }
};

const getOneheckout = (req, res) => {
  try {
    const { id } = req.params;
    const sql = `SELECT * FROM checkout WHERE id=${id}`;
    connect.query(sql, (err, result) => {
      if (err) {
        return res.status(500).json({ message: "Khong lay duoc ", err });
      }
      const data = result.rows[0];
      return res.status(200).json({ message: "Lay 1 thanh cong", data });
    });
  } catch (err) {
    return res.status(500).json({ message: "Loi API", err });
  }
};
const getOneCheckOutProduct = (req, res) => {
  try {
    const { id } = req.params;
    const sql = `
  SELECT * FROM checkout
  WHERE exists (
    SELECT 1 FROM jsonb_array_elements(product) AS elem
    WHERE (elem->>'product_id')::integer = ${id}
  )
`;
    connect.query(sql, (err, result) => {
      if (err) {
        return res.status(500).json({ message: "loi", err });
      }
      const data = result.rows;
      return res.status(200).json({ message: "Thanh cong", data });
    });
  } catch (err) {
    return res.status(500).json({ message: "Loi API", err });
  }
};

module.exports = {
  checkout,
  getOneheckout,
  checkoutnotoken,
  getOneCheckOutProduct,
  checkoutoff,
  checkoutnow,
};
