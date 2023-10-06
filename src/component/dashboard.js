const connect = require("../../database");
const { DateTime } = require("luxon");
const getTotolDay = (req, res) => {
  try {
    const order_date = DateTime.local().setZone("Asia/Ho_Chi_Minh");

    const formattedDate = order_date.toFormat("yyyy-MM-dd");
    console.log(formattedDate);
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
module.exports = { getTotolDay };
