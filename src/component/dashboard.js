const connect = require("../../database");
const { DateTime } = require("luxon");
const getTotalDay = (req, res) => {
  try {
    const order_date = DateTime.local().setZone("Asia/Ho_Chi_Minh");
    const formattedDate = order_date.toFormat("yyyy-MM-dd");
    const sql = `SELECT SUM(order_total) AS total_amount_day
FROM orders
WHERE DATE(order_date) = '${formattedDate}'`;
    connect.query(sql, (err, result) => {
      if (err) {
        return res
          .status(500)
          .json({ message: "không lấy được tiền trong ngày hôm nay", err });
      }
      const data = result.rows[0];
      return res
        .status(200)
        .json({ message: "Lấy thành công tôngr tiền ngày hôm nay", data });
    });
  } catch (err) {
    return res.status(500).json({ message: "Loi API", err });
  }
};
const getTotalWeek = (req, res) => {
  try {
    const today = DateTime.local().setZone("Asia/Ho_Chi_Minh");
    const firstDayOfWeek = today.startOf("week");
    // Lấy ngày cuối cùng của tuần
    const lastDayOfWeek = today.endOf("week");
    const targetDate = today.minus({ days: 6 });
    const sql = `
    SELECT SUM(order_total) AS total_amount_week
FROM orders
WHERE 
 DATE(order_date) BETWEEN '${targetDate.toISODate()}' AND '${today.toISODate()}';
`;
    connect.query(sql, (err, results) => {
      if (err) {
        return res
          .status(500)
          .json({ message: "không lấy được tiền trong tuần này", err });
      }
      const data = results.rows[0];
      return res
        .status(200)
        .json({ message: "Lấy thành công tổng tiền trong tuần này", data });
    });
  } catch (err) {
    return res.status(500).json({ message: "Loi API", err });
  }
};
const getTotalMonth = (req, res) => {
  try {
    const sql = `
    SELECT SUM(order_total) AS total_amount_month
    FROM orders
    WHERE 
      EXTRACT(YEAR FROM order_date::date) = EXTRACT(YEAR FROM CURRENT_DATE) AND
      EXTRACT(MONTH FROM order_date::date) = EXTRACT(MONTH FROM CURRENT_DATE);
  `;
    connect.query(sql, (err, results) => {
      if (err) {
        return res
          .status(500)
          .json({ message: "không lấy được tiền trong tháng này", err });
      }
      const data = results.rows[0];
      return res
        .status(200)
        .json({ message: "Lấy thành công tổng tiền trong tháng này", data });
    });
  } catch (err) {
    return res.status(500).json({ message: "Loi API", err });
  }
};
const TopProductToday = async (req, res) => {
  try {
    const checkout_date = DateTime.local().setZone("Asia/Ho_Chi_Minh");
    const formattedDate = checkout_date.toFormat("yyyy-MM-dd");

    // Thực hiện truy vấn SQL để lấy sản phẩm được đặt hàng nhiều nhất trong ngày
    const sqlQuery = `
    SELECT p->>'product_id' AS product_id, COUNT(*) AS total_count
    FROM checkout, jsonb_array_elements(product) AS p
    WHERE DATE(checkout_date) = '${formattedDate}'
    GROUP BY p->>'product_id'
    ORDER BY total_count DESC
    LIMIT 3;
    `;

    // Thực hiện truy vấn SQL
    const result = await connect.query(sqlQuery);

    // Kiểm tra nếu không có kết quả
    if (result.length === 0) {
      return res.status(404).json({ message: 'Không có sản phẩm được đặt hàng trong ngày.' });
    }

    // Lấy thông tin sản phẩm được đặt hàng nhiều nhất
    const topProduct = result.rows;

    return res.status(200).json(topProduct);
  } catch (err) {
    return res.status(500).json({ message: 'Lỗi API', error: err.message });
  }
};
const TopProductWeek = async (req, res) => {
  try {
    const today = DateTime.local().setZone("Asia/Ho_Chi_Minh");
    const firstDayOfWeek = today.startOf("week");
    // Lấy ngày cuối cùng của tuần
    const lastDayOfWeek = today.endOf("week");
    const targetDate = today.minus({ days: 6 });
    const sql = `
  SELECT p->>'product_id' AS product_id, COUNT(*) AS total_count
    FROM checkout, jsonb_array_elements(product) AS p
    WHERE DATE(checkout_date) BETWEEN '${targetDate.toISODate()}' AND '${today.toISODate()}'
    GROUP BY p->>'product_id'
    ORDER BY total_count DESC
    LIMIT 3;
`
    connect.query(sql, (err, results) => {
      if (err) {
        return res
          .status(500)
          .json({ message: "không lấy được sản phẩm bán chạy trong tuần ", err });
      }
      const data = results.rows;
      return res
        .status(200)
        .json({ message: "Lấy thành công sản phẩm bán chạy trong tuần", data });
    });

  } catch (error) {

  }
}





module.exports = { getTotalDay, getTotalWeek, TopProductToday, TopProductWeek };
