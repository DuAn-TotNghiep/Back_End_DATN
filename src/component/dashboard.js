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
module.exports = { getTotalDay, getTotalWeek };
