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
  const today = DateTime.local().setZone("Asia/Ho_Chi_Minh");
  const targetDate = today.minus({ days: 30 });
  try {
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
    const data = result.rows;
    return res
      .status(200)
      .json({ message: "Lấy thành công sản phẩm bán chạy trong ngay", data });
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
    return res.status(500).json({ message: 'Lỗi API', error: err.message });
  }
}
const TopProductMonth = async (req, res) => {
  try {
    const today = DateTime.local().setZone("Asia/Ho_Chi_Minh");
    const targetDate = today.minus({ days: 30 });
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
          .json({ message: "Không lấy được sản phẩm bán chạy trong tháng", err });
      }
      const data = results.rows;
      return res
        .status(200)
        .json({ message: "Lấy thành công sản phẩm bán chạy trong tháng", data });
    });

  } catch (error) {
    return res.status(500).json({ message: 'Lỗi API', error: error.message });
  }
}



const TopRevenueProductToday = async (req, res) => {
  try {
    const today = DateTime.local().setZone("Asia/Ho_Chi_Minh");

    // Thực hiện truy vấn SQL để lấy 3 sản phẩm có doanh thu cao nhất trong ngày
    const sql = `
    SELECT
      p.product_id,
      p.product_name,
      p.product_price::numeric AS product_price,
      SUM(p.product_price::numeric) AS total_revenue
    FROM (
      SELECT
        (product_data->>'product_id')::integer AS product_id
      FROM checkout, jsonb_array_elements(product) AS product_data
      WHERE DATE(checkout_date) = '${today.toFormat("yyyy-MM-dd")}'
    ) AS c
    JOIN product p ON c.product_id = p.product_id
    GROUP BY p.product_id, p.product_name, p.product_price
    ORDER BY total_revenue DESC
    LIMIT 5;
    `;

    connect.query(sql, (err, results) => {
      if (err) {
        return res
          .status(500)
          .json({ message: "Lỗi trong quá trình truy vấn", err });
      }

      // Kiểm tra xem kết quả trả về có tồn tại không trước khi truy cập thông tin sản phẩm
      if (results.rows.length > 0) {
        const topProducts = results.rows;
        return res
          .status(200)
          .json({ message: "sản phẩm có doanh thu cao nhất trong ngày", topProducts });
      } else {
        return res
          .status(200)
          .json({ message: "Hôm nay không có doanh thu", topProducts: [] });
      }
    });
  } catch (err) {
    return res.status(500).json({ message: 'Lỗi API', error: err.message });
  }
};


const TopRevenueProductThisWeek = async (req, res) => {
  try {
    const today = DateTime.local().setZone("Asia/Ho_Chi_Minh");
    const oneWeekAgo = today.minus({ weeks: 1 });

    // Thực hiện truy vấn SQL để lấy 3 sản phẩm có doanh thu cao nhất trong tuần
    const sql = `
    SELECT
      p.product_id,
      p.product_name,
      p.product_price::numeric AS product_price,
      SUM(p.product_price::numeric) AS total_revenue
    FROM (
      SELECT
        (product_data->>'product_id')::integer AS product_id
      FROM checkout, jsonb_array_elements(product) AS product_data
      WHERE DATE(checkout_date) BETWEEN '${oneWeekAgo.toFormat("yyyy-MM-dd")}' AND '${today.toFormat("yyyy-MM-dd")}'
    ) AS c
    JOIN product p ON c.product_id = p.product_id
    GROUP BY p.product_id, p.product_name, p.product_price
    ORDER BY total_revenue DESC
    LIMIT 3;
    `;

    connect.query(sql, (err, results) => {
      if (err) {
        return res
          .status(500)
          .json({ message: "Lỗi trong quá trình truy vấn", err });
      }

      // Kiểm tra xem kết quả trả về có tồn tại không trước khi truy cập thông tin sản phẩm
      if (results.rows.length > 0) {
        const topProducts = results.rows;
        return res
          .status(200)
          .json({ message: "sản phẩm có doanh thu cao nhất trong tuần", topProducts });
      } else {
        return res
          .status(200)
          .json({ message: "Tuần này không có doanh thu", topProducts: [] });
      }
    });
  } catch (err) {
    return res.status(500).json({ message: 'Lỗi API', error: err.message });
  }
};

const TopRevenueProductThisMonth = async (req, res) => {
  try {
    const today = DateTime.local().setZone("Asia/Ho_Chi_Minh");
    const firstDayOfMonth = today.startOf('month');

    // Thực hiện truy vấn SQL để lấy 3 sản phẩm có doanh thu cao nhất trong tháng
    const sql = `
    SELECT
      p.product_id,
      p.product_name,
      p.product_price::numeric AS product_price,
      SUM(p.product_price::numeric) AS total_revenue
    FROM (
      SELECT
        (product_data->>'product_id')::integer AS product_id
      FROM checkout, jsonb_array_elements(product) AS product_data
      WHERE DATE(checkout_date) BETWEEN '${firstDayOfMonth.toFormat("yyyy-MM-dd")}' AND '${today.toFormat("yyyy-MM-dd")}'
    ) AS c
    JOIN product p ON c.product_id = p.product_id
    GROUP BY p.product_id, p.product_name, p.product_price
    ORDER BY total_revenue DESC
    LIMIT 5;
    `;

    connect.query(sql, (err, results) => {
      if (err) {
        return res
          .status(500)
          .json({ message: "Lỗi trong quá trình truy vấn", err });
      }

      // Kiểm tra xem kết quả trả về có tồn tại không trước khi truy cập thông tin sản phẩm
      if (results.rows.length > 0) {
        const topProducts = results.rows;
        return res
          .status(200)
          .json({ message: " sản phẩm có doanh thu cao nhất trong tháng", topProducts });
      } else {
        return res
          .status(200)
          .json({ message: "Tháng này không có doanh thu", topProducts: [] });
      }
    });
  } catch (err) {
    return res.status(500).json({ message: 'Lỗi API', error: err.message });
  }
};


const CountPaymentOff = async (req, res) => {
  try {
    const sql = `
      SELECT COUNT(*) AS order_payment_offline
      FROM orders
      WHERE payment_status = '1';
      `;
    connect.query(sql, (err, results) => {
      if (err) {
        return res.status(500).json({ message: 'Lấy số đơn hàng thanh toán Offline thất bại', err });
      }

      const data = results.rows;
      return res.status(200).json({ message: 'Lấy số đơn hàng thanh toán Offline thành công', data });
    });
  } catch (err) {
    return res.status(500).json({ message: 'Lỗi API', err });
  }
}
const getTotalPerMonth = (req, res) => {
  const today = DateTime.local().setZone("Asia/Ho_Chi_Minh");

  try {
    const monthlyTotals = [];
    for (let i = 0; i < 13; i++) {
      const endOfMonth = today.minus({ months: i }).endOf('month');
      const startOfMonth = endOfMonth.startOf('month');
      const monthName = startOfMonth.setLocale('vi').toFormat('M/yyyy'); // Lấy tên tháng

      const sql = `
        SELECT SUM(order_total) AS total_amount_month
        FROM orders 
        WHERE 
        DATE(order_date) BETWEEN '${startOfMonth.toISODate()}' AND '${endOfMonth.toISODate()}'
AND status = '6'
      `;

      connect.query(sql, (err, results) => {
        if (err) {
          return res.status(500).json({ message: "Không lấy được tiền trong tháng này", err });
        }
        const data = results.rows[0];
        data.month = monthName; // Thêm tên tháng vào dữ liệu
        monthlyTotals.push(data);
        if (monthlyTotals.length === 12) {
          // Tất cả các tháng đã được lấy, trả về kết quả
          return res.status(200).json({ message: "Lấy thành công tổng tiền từng tháng", data: monthlyTotals });
        }
      });
    }
  } catch (err) {
    return res.status(500).json({ message: "Lỗi API", err });
  }



};

const getTotalPerDay = (req, res) => {
  const today = DateTime.local().setZone("Asia/Ho_Chi_Minh");

  try {
    const dailyTotals = [];
    for (let i = 0; i < 7; i++) { // Lấy dữ liệu cho 7 ngày
      const endOfDay = today.minus({ days: i }).endOf('day');
      const startOfDay = endOfDay.startOf('day');
      const dayDate = startOfDay.setLocale('vi').toFormat('dd/MM'); // Lấy ngày tháng

      const sql = `
        SELECT SUM(order_total) AS total_amount_day
        FROM orders 
        WHERE 
        DATE(order_date) BETWEEN '${startOfDay.toISODate()}' AND '${endOfDay.toISODate()}'
      `;

      connect.query(sql, (err, results) => {
        if (err) {
          console.error("Lỗi khi lấy doanh thu cho ngày", err);
          return res.status(500).json({ message: "Lỗi API", err });
        }
        const data = results.rows[0];
        data.date = dayDate; // Thêm ngày tháng vào dữ liệu
        dailyTotals.push(data);
        if (dailyTotals.length === 7) {
          // Tất cả các ngày đã được lấy, trả về kết quả
          return res.status(200).json({ message: "Lấy thành công doanh thu trong 7 ngày", data: dailyTotals });
        }
      });
    }
  } catch (err) {
    console.error("Lỗi API", err);
    return res.status(500).json({ message: "Lỗi API", err });
  }
};
const getDailyEarnings = (req, res) => {
  const { order_date } = req.body; // Lấy ngày từ URL
  const startOfDay = DateTime.fromISO(order_date, { zone: "Asia/Ho_Chi_Minh" });
  const endOfDay = startOfDay.endOf("day");

  try {
    const sql = `
      SELECT SUM(order_total) AS total_amount
      FROM orders
      WHERE 
        DATE(order_date) BETWEEN '${startOfDay.toISODate()}' AND '${endOfDay.toISODate()}';
    `;

    connect.query(sql, (err, results) => {
      if (err) {
        return res
          .status(500)
          .json({ message: "Không thể lấy số tiền cho ngày được chọn", err });
      }
      const data = results.rows[0];
      return res
        .status(200)
        .json({ message: "Lấy thành công tổng số tiền cho ngày được chọn", data });
    });
  } catch (err) {
    return res.status(500).json({ message: "Lỗi API", err });
  }

};
const getDaily = (req, res) => {
  const { start_date, end_date } = req.body; // Lấy ngày từ URL
  const startDate = DateTime.fromISO(start_date, { zone: "Asia/Ho_Chi_Minh" });
  const endDate = DateTime.fromISO(end_date, { zone: "Asia/Ho_Chi_Minh" });
  console.log(start_date, end_date);
  try {
    const sql = `
      SELECT SUM(order_total) AS total_amount
      FROM orders
      WHERE DATE(order_date) BETWEEN '${startDate.toISODate()}' AND '${endDate.toISODate()}';
    `;
    connect.query(sql, (err, results) => {
      if (err) {
        return res
          .status(500)
          .json({ message: "Không thể lấy số tiền cho  khoảng ngày được chọn", err });
      }
      const data = results.rows[0];
      return res
        .status(200)
        .json({ message: "Lấy thành công tổng số tiền cho khoảng được chọn", data });
    });
  } catch (err) {
    return res.status(500).json({ message: "Lỗi API", err });
  }
}
const getActionDaily = (req, res) => {
  const { start_date, end_date } = req.body; // Lấy ngày từ URL
  const startDate = DateTime.fromISO(start_date, { zone: "Asia/Ho_Chi_Minh" });
  const endDate = DateTime.fromISO(end_date, { zone: "Asia/Ho_Chi_Minh" });
  console.log(start_date, end_date);
  try {
    const sql = `
    SELECT * FROM actions
    WHERE DATE(action_date) BETWEEN '${startDate.toISODate()}' AND '${endDate.toISODate()}';
    `;
    connect.query(sql, (err, results) => {
      if (err) {
        return res.status(500).json({
          message: "Không thể lấy hành động cho khoảng ngày được chọn",
          err,
        });
      }
      const data = results.rows
      return res.status(200).json({
        message: "Lấy thành công hành động cho khoảng được chọn",
        data,
      });
    });
  } catch (err) {
    return res.status(500).json({ message: "Lỗi API", err });
  }
}


module.exports = { getTotalDay, getTotalWeek, TopProductToday, TopProductWeek, TopProductMonth, getTotalMonth, TopRevenueProductToday, TopRevenueProductThisWeek, TopRevenueProductThisMonth, CountPaymentOff, getTotalPerMonth, getTotalPerDay, getDailyEarnings, getDaily, getActionDaily };
