const connect = require("../../database");
const { DateTime } = require("luxon");
const jwt = require("jsonwebtoken");
const io = require("../../app");
const schedule = require('node-schedule');
const order = async (req, res) => {
  try {
    const { checkout_id, user_id, order_total, payment_status } = req.body;
    const order_date = DateTime.local().setZone("Asia/Ho_Chi_Minh");
    console.log("quan");
    const sql = {
      text: "INSERT INTO orders (checkout_id, user_id, order_date, order_total, status, payment_status) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
      values: [
        checkout_id,
        user_id,
        order_date,
        order_total,
        1,
        payment_status,
      ],
    };
    const result = await connect.query(sql);
    if (result.rowCount > 0) {
      const data = result.rows[0];
      io.emit("addorder", { message: "Có Đơn Hàng Mới", data });
      return res.status(200).json({ message: "Thêm thành công order", data });
    } else {
      return res.status(500).json({ message: "Không thêm được order" });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Lỗi API", error });
  }
};

const getAllOrder = async (req, res) => {
  try {
    let sql = `SELECT * FROM orders
ORDER BY CASE 
    WHEN status = '1' THEN 1
    WHEN status = '2' THEN 2
     WHEN status = '3' THEN 3
       WHEN status = '4' THEN 4
         WHEN status = '5' THEN 5
           WHEN status = '6' THEN 6
             WHEN status = '7' THEN 7
      WHEN status = '0' THEN 8
END,
order_date DESC`;
    connect.query(sql, (err, result) => {
      if (err) {
        return res
          .status(500)
          .json({ message: "Không lấy được danh sách order" });
      }
      const orders = result.rows;
      return res
        .status(200)
        .json({ message: "lấy danh sách order thành công", orders });
    });
  } catch (error) {
    return res.status(500).json({ message: "Lỗi API" });
  }
};
const getOneOrderinUser = async (req, res) => {
  try {
    const { id } = req.params;
    let sql = `SELECT * FROM orders WHERE user_id =${id} `;
    connect.query(sql, (err, result) => {
      if (err) {
        return res
          .status(500)
          .json({ message: "Không lấy được danh sách order" });
      }
      const data = result.rows;
      return res
        .status(200)
        .json({ message: "lấy danh sách order thành công", data });
    });
  } catch (error) {
    return res.status(500).json({ message: "Lỗi API" });
  }
};
const getOneOrder = async (req, res) => {
  try {
    const { id } = req.params;
    let sql = `SELECT * FROM orders WHERE order_id =${id} `;
    connect.query(sql, (err, result) => {
      if (err) {
        return res
          .status(500)
          .json({ message: "Không lấy được danh sách order" });
      }
      const data = result.rows;
      return res
        .status(200)
        .json({ message: "lấy danh sách order thành công", data });
    });
  } catch (error) {
    return res.status(500).json({ message: "Lỗi API" });
  }
};
const TotalAmountAllProductOrder = async (req, res) => {
  try {
    const sql = `
            SELECT o.user_id, CONCAT(u.user_firstname, ' ', u.user_lastname) AS user_name, SUM(o.order_total) AS total_amount
            FROM orders o
            JOIN users u ON o.user_id = u.id
            GROUP BY o.user_id, user_name
        `;

    connect.query(sql, (err, results) => {
      if (err) {
        return res
          .status(500)
          .json({ message: "Lấy tổng số tiền đơn hàng thất bại", err });
      }

      const totalAmountByUser = results.rows;
      return res.status(200).json({
        message: "Lấy tổng số tiền đơn hàng thành công",
        totalAmountByUser,
      });
    });
  } catch (err) {
    return res.status(500).json({ message: "Lỗi API", err });
  }
};
const CountOrderOnline = async (req, res) => {
  try {
    const sql = `
        SELECT COUNT(*) AS DonHangThanhToanOnline
        FROM orders
        WHERE payment_status = '2';
        `;
    connect.query(sql, (err, results) => {
      if (err) {
        return res
          .status(500)
          .json({ message: "Lấy số đơn hàng thanh toán Online thất bại", err });
      }

      const soDonHangThanhToanOnline = results.rows;
      return res.status(200).json({
        message: "Lấy số đơn hàng thanh toán Online thành công",
        soDonHangThanhToanOnline,
      });
    });
  } catch (err) {
    return res.status(500).json({ message: "Lỗi API", err });
  }
};
const UpdateCancell = (req, res) => {
  try {
    const { id } = req.body;
    const checkStatusSql = `SELECT status FROM orders WHERE order_id=${id}`;

    connect.query(checkStatusSql, (err, result) => {
      if (err) {
        return res.status(500).json({ message: "Không thể kiểm tra trạng thái đơn hàng", err });
      }

      const currentStatus = result.rows[0].status;
      // Check if the current status is 1
      if (currentStatus !== '1') {
        return res.status(500).json({ message: "Không thể sửa trạng thái đơn hàng khi trạng thái không phải là đã đặt hàng" });
      }

      // If the current status is 1, proceed with the update
      const updateSql = `UPDATE orders SET status=0 WHERE order_id=${id}`;
      connect.query(updateSql, (err, result) => {
        if (err) {
          return res.status(500).json({ message: "Không thể cập nhật trạng thái đơn hàng", err });
        }

        const data = result.rows[0];
        io.emit("cancell", { message: "Đơn Hàng Đã Bị Hủy", data });
        return res.status(200).json({ message: "Cập nhật trạng thái đơn hàng thành công", data });
      });
    });
  } catch (err) {
    return res.status(500).json({ message: "Lỗi API", err });
  }
};

const UpdateConfirm = (req, res) => {
  try {
    const { id } = req.body;

    const sql = `UPDATE orders SET status=2 WHERE order_id=${id} RETURNING*`;
    connect.query(sql, (err, result) => {
      if (err) {
        return res
          .status(500)
          .json({ message: "khong sua duoc trang thai confirm order", err });
      }
      const data = result.rows[0];
      io.emit("confirm", { message: "Đơn hàng đã được xác nhận", data });
      return res
        .status(200)
        .json({ message: "sua thanh cong trang thai confirm order", data });
    });
  } catch (err) {
    return res.status(500).json({ message: "Loi API", err });
  }
};
const UpdateShiping = (req, res) => {
  try {
    const { id } = req.body;
    console.log(id);
    const sql = `UPDATE orders SET status=3 WHERE order_id=${id} RETURNING*`;
    connect.query(sql, (err, result) => {
      if (err) {
        return res
          .status(500)
          .json({ message: "khong sua duoc trang thai shiping", err });
      }
      const data = result.rows[0];
      io.emit("confirm", { message: "Đơn hàng đã vận chuyển", data });
      return res
        .status(200)
        .json({ message: "sua thanh cong trang thai shipingr", data });
    });
  } catch (err) {
    return res.status(500).json({ message: "Loi API", err });
  }
};
const UpdateShipDone = (req, res) => {
  try {
    const { id } = req.body;
    let responseSent = false;
    const sql = `UPDATE orders SET status=4 WHERE order_id=${id} RETURNING*`;

    connect.query(sql, (err, result) => {
      if (err) {
        responseSent = true;
        return res
          .status(500)
          .json({ message: "Không sửa được trạng thái ship done", err });
      }

      const data = result.rows[0];

      io.emit("shiping", { message: "Đơn hàng đã được giao", data });

      // Schedule a job to run after 10 seconds
      schedule.scheduleJob(new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), function () {
        if (!responseSent) {
          const completeReq = { body: { id } };
          UpdateComplete(completeReq, res);
        }
      });
    });
  } catch (err) {
    return res.status(500).json({ message: "Lỗi API", err });
  }
};
const UpdateDone = (req, res) => {
  try {
    const { id } = req.body;
    const sql = `UPDATE orders SET status=5 WHERE order_id=${id}`;
    let responseSent = false;
    connect.query(sql, (err, result) => {
      if (err) {
        responseSent = true;
        return res
          .status(500)
          .json({ message: "khong sua duoc trang thai done order", err });
      }
      const data = result.rows[0];
      io.emit("statusdone", { message: "Đã Nhận Hàng", data });

      setTimeout(() => {
        if (!responseSent) {
          const completeReq = { body: { id } };
          UpdateComplete(completeReq, res);
        }
      }, 10000);
    });
  } catch (err) {
    return res.status(500).json({ message: "Loi API", err });
  }
};
const UpdateComplete = (req, res) => {
  try {
    const { id } = req.body;
    const sql = `UPDATE orders SET status=6 WHERE order_id=${id}`;
    connect.query(sql, (err, result) => {
      if (err) {
        return res
          .status(500)
          .json({ message: "khong sua duoc trang thai complete order", err });
      }
      const data = result.rows[0];
      const completeReq = { body: { id } };
      sendStatusByEmail(completeReq, res)
      io.emit("complete", { message: "Đơn hàng đã hoàn thành", data });
      return res
        .status(200)
        .json({ message: "sua thanh cong trang thai complete order", data });
    });
  } catch (err) {
    return res.status(500).json({ message: "Loi API", err });
  }
};
const UpdateOrder = (req, res) => {
  try {
    const { id } = req.body;
    console.log(id);
    const sql = `UPDATE orders SET payment_type='ok' WHERE order_id=${id}`;
    connect.query(sql, (err, result) => {
      if (err) {
        return res
          .status(500)
          .json({ message: "sua that bai", err });
      }
      const data = result.rows[0];
      return res
        .status(200)
        .json({ message: "sua thanh cong hoan hang thanh cong", data });
    });
  } catch (err) {
    return res.status(500).json({ message: "Loi API", err });
  }
};
const UpdateBomd = (req, res) => {
  try {
    const { id } = req.body;
    const sql = `UPDATE orders SET status=7 WHERE order_id=${id}`;
    connect.query(sql, (err, result) => {
      if (err) {
        return res
          .status(500)
          .json({ message: "khong sua duoc trang thai complete order", err });
      }
      const data = result.rows[0];
      io.emit("bomd", { message: "Khách hàng không nhận hàng", data });
      return res
        .status(200)
        .json({ message: "sua thanh cong trang thai không nhận hàng", data });
    });
  } catch (err) {
    return res.status(500).json({ message: "Loi API", err });
  }
};
const GetOrderPlacedDay = (req, res) => {
  try {
    const order_date = DateTime.local().setZone("Asia/Ho_Chi_Minh");
    const formattedDate = order_date.toFormat("yyyy-MM-dd");
    const sql = `SELECT COUNT(*) as order_count FROM orders WHERE status = '1' AND DATE(order_date) = '${formattedDate}'`;
    connect.query(sql, (err, result) => {
      if (err) {
        return res.status(500).json({ message: "Loi", err });
      }
      const data = result.rows[0].order_count;
      return res.status(200).json({ message: "Thanh cong", data });
    });
  } catch (err) {
    return res.status(500).json({ message: "Loi API", err });
  }
};
const GetOrderAwaitingDay = (req, res) => {
  try {
    const order_date = DateTime.local().setZone("Asia/Ho_Chi_Minh");
    const formattedDate = order_date.toFormat("yyyy-MM-dd");
    const sql = `SELECT COUNT(*) as order_count FROM orders WHERE status = '2' AND DATE(order_date) = '${formattedDate}'`;
    connect.query(sql, (err, result) => {
      if (err) {
        return res.status(500).json({ message: "Loi", err });
      }
      const data = result.rows[0].order_count;
      return res.status(200).json({ message: "Thanh cong", data });
    });
  } catch (err) {
    return res.status(500).json({ message: "Loi API", err });
  }
};
const GetOrderDoneDay = (req, res) => {
  try {
    const order_date = DateTime.local().setZone("Asia/Ho_Chi_Minh");
    const formattedDate = order_date.toFormat("yyyy-MM-dd");
    const sql = `SELECT COUNT(*) as order_count FROM orders WHERE status = '6' AND DATE(order_date) = '${formattedDate}'`;
    connect.query(sql, (err, result) => {
      if (err) {
        return res.status(500).json({ message: "Loi", err });
      }
      const data = result.rows[0].order_count;
      return res.status(200).json({ message: "Thanh cong", data });
    });
  } catch (err) {
    return res.status(500).json({ message: "Loi API", err });
  }
};
const getReceivedOrdersDay = async (req, res) => {
  try {
    const today = DateTime.local().setZone("Asia/Ho_Chi_Minh");
    const formattedDate = today.toFormat("yyyy-MM-dd");
    const sql = `SELECT * FROM orders WHERE status = '6' AND DATE(order_date)='${formattedDate}'`;

    const result = await connect.query(sql);

    const confirmedOrders = result.rows;
    return res.status(200).json({
      message: "Lấy danh sách đơn hàng đã nhận thành công",
      orders: confirmedOrders,
    });
  } catch (error) {
    return res.status(500).json({ message: "Lỗi API", error: error.message });
  }
};
const ListOrderInWeek = (req, res) => {
  const today = DateTime.local().setZone("Asia/Ho_Chi_Minh");

  try {
    const dailyTotals = [];
    for (let i = 0; i < 7; i++) {
      // Lấy dữ liệu cho 7 ngày
      const endOfDay = today.minus({ days: i }); // Để lấy ngày cuối của tháng
      const startOfDay = endOfDay.startOf("day"); // Để lấy ngày đầu của tháng
      const dayName = startOfDay.setLocale("vi").toFormat("dd/MM"); // Lấy tên ngày với định dạng "dd/MM/yyyy"
      const sql = `
          SELECT COUNT(*) AS total_products
          FROM orders
          WHERE DATE(order_date) = '${startOfDay.toISODate()}'
        `;

      connect.query(sql, (err, results) => {
        if (err) {
          return res
            .status(500)
            .json({ message: "Không lấy được sản phẩm trong ngày", err });
        }
        const data = results.rows[0];
        data.date = dayName; // Thêm tên ngày vào dữ liệu
        dailyTotals.push(data);
        if (dailyTotals.length === 7) {
          // Tất cả các ngày đã được lấy, trả về kết quả
          return res.status(200).json({
            message: "Lấy thành công sản phẩm từng ngày",
            data: dailyTotals,
          });
        }
      });
    }
  } catch (err) {
    return res.status(500).json({ message: "Lỗi API", err });
  }
};
const GetOrderForAdmin = async (req, res) => {
  try {
    const today = DateTime.local().setZone("Asia/Ho_Chi_Minh");
    const formattedDate = today.toFormat("yyyy-MM-dd");

    const sql = `SELECT * FROM orders WHERE DATE(order_date) = $1`;

    connect.query(sql, [formattedDate], (err, result) => {
      if (err) {
        return res
          .status(500)
          .json({ message: "Không lấy được danh sách đơn hàng" });
      }
      const orders = result.rows;
      return res.status(200).json({
        message: "Lấy danh sách đơn hàng theo ngày hiện tại thành công",
        orders,
      });
    });
  } catch (error) {
    return res.status(500).json({ message: "Lỗi API" });
  }
};
const getPlacedOrders = async (req, res) => {
  try {
    const today = DateTime.local().setZone("Asia/Ho_Chi_Minh");
    const formattedDate = today.toFormat("yyyy-MM-dd");
    const sql = `SELECT * FROM orders WHERE status = '1' AND DATE(order_date)='${formattedDate}'`;

    const result = await connect.query(sql);

    const confirmedOrders = result.rows;
    return res.status(200).json({
      message: "Lấy danh sách đơn hàng chờ xác nhận thành công",
      orders: confirmedOrders,
    });
  } catch (error) {
    return res.status(500).json({ message: "Lỗi API", error: error.message });
  }
};
const getReceivedOrders = async (req, res) => {
  try {
    // const today = DateTime.local().setZone("Asia/Ho_Chi_Minh");
    // const formattedDate = today.toFormat("yyyy-MM-dd");
    const sql = `SELECT * FROM orders WHERE status = '5' ORDER BY order_date DESC`;

    const result = await connect.query(sql);

    const confirmedOrders = result.rows;
    return res.status(200).json({
      message: "Lấy danh sách đơn hàng đã nhận thành công",
      orders: confirmedOrders,
    });
  } catch (error) {
    return res.status(500).json({ message: "Lỗi API", error: error.message });
  }
};
const getConfirmOrders = async (req, res) => {
  try {
    // const today = DateTime.local().setZone("Asia/Ho_Chi_Minh");
    // const formattedDate = today.toFormat("yyyy-MM-dd");
    const sql = `SELECT * FROM orders WHERE status = '1' ORDER BY order_date DESC`;

    const result = await connect.query(sql);

    const confirmedOrders = result.rows;
    return res.status(200).json({
      message: "Lấy danh sách đơn hàng chờ xác nhận thành công",
      orders: confirmedOrders,
    });
  } catch (error) {
    return res.status(500).json({ message: "Lỗi API", error: error.message });
  }
};
const getPendingOrders = async (req, res) => {
  try {
    const today = DateTime.local().setZone("Asia/Ho_Chi_Minh");
    const formattedDate = today.toFormat("yyyy-MM-dd");
    const sql = `SELECT * FROM orders WHERE status = '2' AND DATE(order_date)='${formattedDate}'`;

    const result = await connect.query(sql);

    const confirmedOrders = result.rows;
    return res.status(200).json({
      message: "Lấy danh sách đơn hàng đã nhận xác nhận thành công",
      orders: confirmedOrders,
    });
  } catch (error) {
    return res.status(500).json({ message: "Lỗi API", error: error.message });
  }
};
const getPendingOrdersAll = async (req, res) => {
  try {
    const sql = `SELECT * FROM orders WHERE status = '2' ORDER BY order_date DESC`;

    const result = await connect.query(sql);

    const confirmedOrders = result.rows;
    return res.status(200).json({
      message: "Lấy danh sách đơn hàng đã nhận xác nhận thành công",
      orders: confirmedOrders,
    });
  } catch (error) {
    return res.status(500).json({ message: "Lỗi API", error: error.message });
  }
};
const getShipingOrders = async (req, res) => {
  try {
    // const today = DateTime.local().setZone("Asia/Ho_Chi_Minh");
    // const formattedDate = today.toFormat("yyyy-MM-dd");
    const sql = `SELECT * FROM orders WHERE status = '3' ORDER BY order_date DESC`;

    const result = await connect.query(sql);

    const confirmedOrders = result.rows;
    return res.status(200).json({
      message: "Lấy danh sách đơn hàng đang giao thành công",
      orders: confirmedOrders,
    });
  } catch (error) {
    return res.status(500).json({ message: "Lỗi API", error: error.message });
  }
};
const getDeleveredOrders = async (req, res) => {
  try {
    // const today = DateTime.local().setZone("Asia/Ho_Chi_Minh");
    // const formattedDate = today.toFormat("yyyy-MM-dd");
    const sql = `SELECT * FROM orders WHERE status = '4' ORDER BY order_date DESC`;

    const result = await connect.query(sql);

    const confirmedOrders = result.rows;
    return res.status(200).json({
      message: "Lấy danh sách đơn hàng đã giao thành công",
      orders: confirmedOrders,
    });
  } catch (error) {
    return res.status(500).json({ message: "Lỗi API", error: error.message });
  }
};
const getCompleteOrders = async (req, res) => {
  try {
    // const today = DateTime.local().setZone("Asia/Ho_Chi_Minh");
    // const formattedDate = today.toFormat("yyyy-MM-dd");
    const sql = `SELECT * FROM orders WHERE status = '6' ORDER BY order_date DESC`;

    const result = await connect.query(sql);

    const confirmedOrders = result.rows;
    return res.status(200).json({
      message: "Lấy danh sách đơn hàng hoàn thành thành công",
      orders: confirmedOrders,
    });
  } catch (error) {
    return res.status(500).json({ message: "Lỗi API", error: error.message });
  }
};
const getBomdOrders = async (req, res) => {
  try {
    // const today = DateTime.local().setZone("Asia/Ho_Chi_Minh");
    // const formattedDate = today.toFormat("yyyy-MM-dd");
    const sql = `SELECT * FROM orders WHERE status = '7' ORDER BY order_date DESC`;

    const result = await connect.query(sql);

    const confirmedOrders = result.rows;
    return res.status(200).json({
      message: "Lấy danh sách đơn hàng hoàn thành thành công",
      orders: confirmedOrders,
    });
  } catch (error) {
    return res.status(500).json({ message: "Lỗi API", error: error.message });
  }
};
const getCompleteAndDoneOrders = async (req, res) => {
  try {
    // const today = DateTime.local().setZone("Asia/Ho_Chi_Minh");
    // const formattedDate = today.toFormat("yyyy-MM-dd");
    const sql = `SELECT * FROM orders WHERE status = '6' OR status = '5' ORDER BY order_date DESC`;

    const result = await connect.query(sql);

    const confirmedOrders = result.rows;
    return res.status(200).json({
      message: "Lấy danh sách đơn hàng hoàn thành thành công",
      orders: confirmedOrders,
    });
  } catch (error) {
    return res.status(500).json({ message: "Lỗi API", error: error.message });
  }
};
const getCancelledOrders = async (req, res) => {
  try {
    const sql = `
            SELECT * FROM orders
            WHERE status NOT IN ('1', '2', '3', '4', '5', '6') ORDER BY order_date DESC
        `;

    const result = await connect.query(sql);

    const cancelledOrders = result.rows;
    return res.status(200).json({
      message: "Lấy danh sách đơn hàng đã huỷ thành công",
      orders: cancelledOrders,
    });
  } catch (error) {
    return res.status(500).json({ message: "Lỗi API", error: error.message });
  }
};
const generateStatus = (req, res) => {
  const { id } = req.params;
  const sql = `SELECT * FROM orders WHERE order_id=${id}`;
  connect.query(sql, (err, result) => {
    if (err) {
      return res.status(500).json({ message: "Khong lay duoc order", err });
    }
    const data = result.rows[0];
    console.log(data);
  });
};
const getProduct = (id, quantity) => {
  const sql = `SELECT * FROM product WHERE product_id=${id} `
  connect.query(sql, (err, result) => {
    if (err) {
      return res.status(500).json({ message: "Khong lay duoc order", err });
    }
    const data = result.rows[0];
    const productHtml = `
          <tr>
            <td>${data?.product_name}</td>
            <td>${quantity}</td>
            <td>${data?.product_price}</td>
          </tr>
        `;
    return (productHtml);
  })
}
const nodemailer = require("nodemailer");
const numberFormatter = require("number-formatter");
const sendStatusByEmail = (req, res) => {
  try {
    const { id, text } = req.body;
    const sql = `SELECT * FROM orders WHERE order_id=${id}`;
    connect.query(sql, (err, result) => {
      if (err) {
        return res.status(500).json({ message: "Khong lay duoc order", err });
      }
      const data = result.rows[0];
      const sql1 = `SELECT * FROM checkout WHERE id=${data?.checkout_id}`;
      connect.query(sql1, async (err, result) => {
        if (err) {
          return res
            .status(500)
            .json({ message: "Khong lay duoc checkout", err });
        }
        const data1 = result.rows[0];

        let status = "";
        console.log(data1);
        if (data?.user_id === null) {
          const checkoutOffObject = JSON.parse(data1?.checkout_off || "");
          const formattedAmount = numberFormatter("#,###", data.order_total);
          const checkoutData = JSON.parse(data1.checkout_off);
          const transporter = nodemailer.createTransport({
            service: "Gmail",
            auth: {
              user: process.env.USER_EMAIL,
              pass: process.env.USER_PASSWORD,
            },
          });
          if (data.status == 2) {
            status = "Đã xác nhận đơn hàng";
          }
          if (data.status == 1) {
            status = "Đã đặt hàng";
          }
          if (data.status == 3) {
            status = "Đơn hàng đã bàn giao cho shipper";
          }
          if (data.status == 4) {
            status = "Đã vận chuyển thành công";
          }
          if (data.status == 5) {
            status = "Đã nhận hàng";
          }
          if (data.status == 6) {
            status = "Đơn hàng hoàn thành";
          }
          if (data.status == 7) {
            status = "Đơn hàng bị hoàn trả";
          }
          if (data.status == 0) {
            status = "Đơn hàng đã bị hủy";
          }

          const mailOptions = {
            from: process.env.USER_EMAIL,
            to: checkoutData.email,
            subject: `Thông báo tình trạng đơn hàng #${data?.order_id}`,
            html: `
    <p style="font-size: 16px;">Tình trạng đơn hàng của bạn: ${status}</p>
    ${data.status == 0 && text ? `<p style="font-size: 16px;">Lý do hủy: ${text}</p>` : ""}
    <p style="font-size: 16px;">Ngày đặt hàng: ${data.order_date}</p>
     <p>Thông tin sản phẩm: </p>
    <table border="1" style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
      <thead>
         
        <tr>
          <th style="border: 1px solid #ddd; padding: 8px; text-align: left; background-color: #f2f2f2;">Sản phẩm</th>
          <th style="border: 1px solid #ddd; padding: 8px; text-align: left; background-color: #f2f2f2;">Giá</th>
          <th style="border: 1px solid #ddd; padding: 8px; text-align: left; background-color: #f2f2f2;">Kích thước/Màu</th>
          <th style="border: 1px solid #ddd; padding: 8px; text-align: left; background-color: #f2f2f2;">Số lượng</th>
        </tr>
      </thead>
      <tbody>
            
      ${await Promise.all(
              data1?.product?.map(async (productData) => {
                console.log(productData)
                return new Promise(async (resolve, reject) => {
                  const sql = `SELECT * FROM product WHERE product_id=${productData?.product_id} `;

                  connect.query(sql, async (err, result) => {
                    if (err) {
                      reject({ message: "Khong lay duoc order", err });
                    } else {
                      const data = result.rows[0];
                      let sqlSale = `SELECT * FROM sale`;
                      const sale = await connect.query(sqlSale);
                      const salediscount = sale?.rows?.find((data1) => data1?.sale_id == data?.sale_id)?.sale_distcount
                      const price = data?.product_price * (salediscount / 100)
                      const formattedAmounts = numberFormatter("#,###", data.product_price);
                      const sizeName = `SELECT * FROM size WHERE size_id = ${productData?.size}`;
                      const sizeNameQuery = await connect.query(sizeName)
                      const sizeColor = `SELECT * FROM color WHERE color_id = ${productData?.color}`;
                      const sizeColorQuery = await connect.query(sizeColor)



                      const html = `
                <tr>
                  <td style="border: 1px solid #ddd; padding: 8px; text-align: left;">${data?.product_name}</td>
                <td style="border: 1px solid #ddd; padding: 8px; text-align: left;">
                  ${price ? `${data?.product_price - price}` : `${formattedAmounts}`}
                  </td>
                <td style="border: 1px solid #ddd; padding: 8px; text-align: left;">${sizeNameQuery.rows[0].size_name} - ${sizeColorQuery.rows[0].color_name} </td>
                  <td style="border: 1px solid #ddd; padding: 8px; text-align: left;">${productData?.quantity}</td>
                </tr>
              `;
                      resolve(html);
                    }
                  });
                });
              }) || []
            ).then(htmlArray => htmlArray.join(''))
              }
       
      </tbody>
    </table>
    <p style="font-size: 16px;">Địa chỉ giao hàng: <h3>${data1.address}-${data1.ward}-${data1.district}-${data1.province}</h3></p>
    <p style="font-size: 16px;">Thông tin liên hệ: <h3>${checkoutOffObject.name} - ${checkoutOffObject.phone} - ${checkoutOffObject.email}</h3></p>
    <p style="font-size: 16px;">Tổng tiền: <h3>${formattedAmount}VND</h3></p>
  `,
          };
          transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
              return res
                .status(200)
                .json({ message: "Lỗi khi gửi email: " + error });
            } else {
              return res
                .status(200)
                .json({ message: "Email đã được gửi: " + info.response });
            }
          });
        } else {
          const sql2 = `SELECT * FROM users WHERE id=${data?.user_id}`;
          connect.query(sql2, async (err, result) => {
            if (err) {
              return res
                .status(500)
                .json({ message: "Khong lay duoc checkout", err });
            }
            const data2 = result.rows[0];
            const formattedAmount = numberFormatter("#,###", data.order_total);


            const transporter = nodemailer.createTransport({
              service: "Gmail",
              auth: {
                user: process.env.USER_EMAIL,
                pass: process.env.USER_PASSWORD,
              },
            });
            if (data.status == 2) {
              status = "Đã xác nhận đơn hàng";
            }
            if (data.status == 1) {
              status = "Đã đặt hàng";
            }
            if (data.status == 3) {
              status = "Đã bàn giao cho shipper";
            }
            if (data.status == 4) {
              status = "Đã vận chuyển thành công";
            }
            if (data.status == 5) {
              status = "Đã nhận hàng";
            }
            if (data.status == 6) {
              status = "Đơn hàng hoàn thành";
            }
            if (data.status == 7) {
              status = "Đơn hàng bị hoàn trả";
            }
            if (data.status == 0) {
              status = "Đơn hàng đã bị hủy";
            }

            const mailOptions = {
              from: process.env.USER_EMAIL,
              to: data2.user_email,
              subject: `Thông báo tình trạng đơn hàng #${data?.order_id}`,
              html: `
    <p style="font-size: 16px;">Tình trạng đơn hàng của bạn: ${status}</p>
    ${data.status == 0 && text ? `<p style="font-size: 16px;">Lý do hủy: ${text}</p>` : ""}
    <p style="font-size: 16px;">Ngày đặt hàng: ${data.order_date}</p>
     <p>Thông tin sản phẩm: </p>
    <table border="1" style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
      <thead>
       
        <tr>
          <th style="border: 1px solid #ddd; padding: 8px; text-align: left; background-color: #f2f2f2;">Sản phẩm</th>
          <th style="border: 1px solid #ddd; padding: 8px; text-align: left; background-color: #f2f2f2;">Giá</th>
          <th style="border: 1px solid #ddd; padding: 8px; text-align: left; background-color: #f2f2f2;">Kích thước/Màu</th>
          <th style="border: 1px solid #ddd; padding: 8px; text-align: left; background-color: #f2f2f2;">Số lượng</th>
        </tr>
      </thead>
      <tbody>

      ${await Promise.all(
                data1?.product?.map(async (productData) => {
                  console.log(productData)
                  return new Promise(async (resolve, reject) => {
                    const sql = `SELECT * FROM product WHERE product_id=${productData?.product_id} `;

                    connect.query(sql, async (err, result) => {
                      if (err) {
                        reject({ message: "Khong lay duoc order", err });
                      } else {
                        const data = result.rows[0];
                        let sqlSale = `SELECT * FROM sale`;
                        const sale = await connect.query(sqlSale);
                        const salediscount = sale?.rows?.find((data1) => data1?.sale_id == data?.sale_id)?.sale_distcount
                        const price = data?.product_price * (salediscount / 100)
                        const formattedAmounts = numberFormatter("#,###", data.product_price);
                        const sizeName = `SELECT * FROM size WHERE size_id = ${productData?.size}`;
                        const sizeNameQuery = await connect.query(sizeName)
                        const sizeColor = `SELECT * FROM color WHERE color_id = ${productData?.color}`;
                        const sizeColorQuery = await connect.query(sizeColor)



                        const html = `
                <tr>
                  <td style="border: 1px solid #ddd; padding: 8px; text-align: left;">${data?.product_name}</td>
                <td style="border: 1px solid #ddd; padding: 8px; text-align: left;">
                  ${price ? `${data?.product_price - price}` : `${formattedAmounts}`}
                  </td>
                <td style="border: 1px solid #ddd; padding: 8px; text-align: left;">${sizeNameQuery.rows[0].size_name} - ${sizeColorQuery.rows[0].color_name} </td>
                  <td style="border: 1px solid #ddd; padding: 8px; text-align: left;">${productData?.quantity}</td>
                </tr>
              `;
                        resolve(html);
                      }
                    });
                  });
                }) || []
              ).then(htmlArray => htmlArray.join(''))
                }
       
      </tbody>
    </table>
    <p style="font-size: 16px;">Địa chỉ giao hàng: <h3>${data1.address}-${data1.ward}-${data1.district}-${data1.province}</h3></p>
    <p style="font-size: 16px;">Thông tin liên hệ: <h3> ${data2.user_lastname} ${data2.user_firstname} - ${data2.user_email} - ${data2.user_phone} </h3></p>
    <p style="font-size: 16px;">Tổng tiền: <h3>${formattedAmount}VND</h3></p>
  `,
            };
            transporter.sendMail(mailOptions, (error, info) => {
              if (error) {
                return res
                  .status(200)
                  .json({ message: "Lỗi khi gửi email: " + error });
              } else {
                return res
                  .status(200)
                  .json({ message: "Email đã được gửi: " + info.response });
              }
            });
          });
        }
      });
    });
  } catch (err) {
    return res.status(500).json({ message: "Loi API" });
  }
};
const searchOrdersByUserPhone = async (req, res) => {
  try {
    let order_id = req.body.order_id;
    if (!order_id || isNaN(order_id)) {
      return res.status(500).json({ message: "Vui lòng cung cấp mã đơn hàng hợp lệ" });
    }

    // Tìm đơn hàng từ bảng orders dựa trên order_id (đây là một số nguyên)
    const orderQuery = `SELECT * FROM orders WHERE order_id = $1`;
    const orderResult = await connect.query(orderQuery, [order_id]);

    if (orderResult.rows.length === 0) {
      return res.status(500).json({
        message: "Không tìm thấy mã đơn hàng này",
      });
    }

    const userId = orderResult.rows[0].user_id;

    // (Optional) Nếu bạn muốn lấy thông tin người dùng từ bảng users, bạn có thể thêm truy vấn tương tự như sau:
    // const userQuery = `SELECT * FROM users WHERE id = $1`;
    // const userResult = await connect.query(userQuery, [userId]);
    // const userData = userResult.rows[0];

    return res.status(200).json({
      message: "Tìm thấy đơn hàng",
      data: orderResult.rows,
      // (Optional) Thêm thông tin người dùng nếu cần
      // user: userData,
    });
  } catch (error) {
    console.error(error)
    return res.status(500).json({ message: "Lỗi API" });
  }
};
const searchOrdersByUserPhoneCancell = async (req, res) => {
  try {
    let order_id = req.body.order_id;
    if (!order_id || isNaN(order_id)) {
      return res.json({ message: "Vui lòng cung cấp order_id hợp lệ" });
    }

    const orderQuery = `SELECT * FROM orders WHERE order_id = $1 AND status= '0'`;
    const orderResult = await connect.query(orderQuery, [order_id]);

    if (orderResult.rows.length === 0) {
      return res.json({
        message: "Không tìm thấy đơn hàng cho order_id này",
      });
    }

    const userId = orderResult.rows[0].user_id;

    return res.json({
      message: "Tìm thấy đơn hàng",
      data: orderResult.rows,
    });
  } catch (error) {
    console.error(error)
    return res.status(500).json({ message: "Lỗi API" });
  }
};
const searchOrdersByUserPhoneCancell1 = async (req, res) => {
  try {
    let order_id = req.body.order_id;
    if (!order_id || isNaN(order_id)) {
      return res.json({ message: "Vui lòng cung cấp order_id hợp lệ" });
    }

    const orderQuery = `SELECT * FROM orders WHERE order_id = $1 AND status= '7'`;
    const orderResult = await connect.query(orderQuery, [order_id]);

    if (orderResult.rows.length === 0) {
      return res.json({
        message: "Không tìm thấy đơn hàng cho order_id này",
      });
    }

    const userId = orderResult.rows[0].user_id;

    return res.json({
      message: "Tìm thấy đơn hàng",
      data: orderResult.rows,
    });
  } catch (error) {
    console.error(error)
    return res.status(500).json({ message: "Lỗi API" });
  }
};
const searchOrdersByUserPhoneConfirm = async (req, res) => {
  try {
    let order_id = req.body.order_id;
    if (!order_id || isNaN(order_id)) {
      return res.json({ message: "Vui lòng cung cấp order_id hợp lệ" });
    }

    const orderQuery = `SELECT * FROM orders WHERE order_id = $1 AND status= '1'`;
    const orderResult = await connect.query(orderQuery, [order_id]);

    if (orderResult.rows.length === 0) {
      return res.json({
        message: "Không tìm thấy đơn hàng cho order_id này",
      });
    }

    const userId = orderResult.rows[0].user_id;

    return res.json({
      message: "Tìm thấy đơn hàng",
      data: orderResult.rows,
    });
  } catch (error) {
    console.error(error)
    return res.status(500).json({ message: "Lỗi API" });
  }
};
const searchOrdersByUserPhoneAwaitShipper = async (req, res) => {
  try {
    let order_id = req.body.order_id;
    if (!order_id || isNaN(order_id)) {
      return res.json({ message: "Vui lòng cung cấp order_id hợp lệ" });
    }

    const orderQuery = `SELECT * FROM orders WHERE order_id = $1 AND status= '2'`;
    const orderResult = await connect.query(orderQuery, [order_id]);

    if (orderResult.rows.length === 0) {
      return res.json({
        message: "Không tìm thấy đơn hàng cho order_id này",
      });
    }

    const userId = orderResult.rows[0].user_id;

    return res.json({
      message: "Tìm thấy đơn hàng",
      data: orderResult.rows,
    });
  } catch (error) {
    console.error(error)
    return res.status(500).json({ message: "Lỗi API" });
  }
};

const searchOrdersByUserPhoneShipping = async (req, res) => {
  try {
    let order_id = req.body.order_id;
    if (!order_id || isNaN(order_id)) {
      return res.json({ message: "Vui lòng cung cấp order_id hợp lệ" });
    }

    const orderQuery = `SELECT * FROM orders WHERE order_id = $1 AND status= '3'`;
    const orderResult = await connect.query(orderQuery, [order_id]);

    if (orderResult.rows.length === 0) {
      return res.json({
        message: "Không tìm thấy đơn hàng cho order_id này",
      });
    }

    const userId = orderResult.rows[0].user_id;

    return res.json({
      message: "Tìm thấy đơn hàng",
      data: orderResult.rows,
    });
  } catch (error) {
    console.error(error)
    return res.status(500).json({ message: "Lỗi API" });
  }
};
const searchOrdersByUserPhoneShipDone = async (req, res) => {
  try {
    let order_id = req.body.order_id;
    if (!order_id || isNaN(order_id)) {
      return res.json({ message: "Vui lòng cung cấp order_id hợp lệ" });
    }

    const orderQuery = `SELECT * FROM orders WHERE order_id = ${order_id} AND status BETWEEN '4' AND '6'`;
    const orderResult = await connect.query(orderQuery);
    console.log(orderResult);
    if (orderResult.rows.length === 0) {
      return res.json({
        message: "Không tìm thấy đơn hàng cho order_id này",
      });
    }

    const userId = orderResult.rows[0].user_id;

    return res.status(200).json({
      message: "Tìm thấy đơn hàng",
      data: orderResult.rows,
    });
  } catch (error) {
    console.error(error)
    return res.status(500).json({ message: "Lỗi API" });
  }
};
const searchOrdersByUserPhoneDone = async (req, res) => {
  try {
    let order_id = req.body.order_id;
    if (!order_id || isNaN(order_id)) {
      return res.json({ message: "Vui lòng cung cấp order_id hợp lệ" });
    }

    const orderQuery = `SELECT * FROM orders WHERE order_id = $1 AND status= '5'`;
    const orderResult = await connect.query(orderQuery, [order_id]);

    if (orderResult.rows.length === 0) {
      return res.json({
        message: "Không tìm thấy đơn hàng cho order_id này",
      });
    }

    const userId = orderResult.rows[0].user_id;

    return res.json({
      message: "Tìm thấy đơn hàng",
      data: orderResult.rows,
    });
  } catch (error) {
    console.error(error)
    return res.status(500).json({ message: "Lỗi API" });
  }
};
const searchOrdersByUserPhoneComplete = async (req, res) => {
  try {
    let order_id = req.body.order_id;
    if (!order_id || isNaN(order_id)) {
      return res.json({ message: "Vui lòng cung cấp order_id hợp lệ" });
    }

    const orderQuery = `SELECT * FROM orders WHERE order_id = $1 AND status= '6'`;
    const orderResult = await connect.query(orderQuery, [order_id]);

    if (orderResult.rows.length === 0) {
      return res.json({
        message: "Không tìm thấy đơn hàng cho order_id này",
      });
    }

    const userId = orderResult.rows[0].user_id;

    return res.json({
      message: "Tìm thấy đơn hàng",
      data: orderResult.rows,
    });
  } catch (error) {
    console.error(error)
    return res.status(500).json({ message: "Lỗi API" });
  }
};
module.exports = {
  order,
  searchOrdersByUserPhone,
  UpdateComplete,
  sendStatusByEmail,
  UpdateShipDone,
  getAllOrder,
  getOneOrderinUser,
  UpdateShiping,
  TotalAmountAllProductOrder,
  getOneOrder,
  CountOrderOnline,
  UpdateCancell,
  UpdateConfirm,
  UpdateDone,
  GetOrderPlacedDay,
  GetOrderAwaitingDay,
  GetOrderDoneDay,
  ListOrderInWeek,
  GetOrderForAdmin,
  getPlacedOrders,
  getReceivedOrders,
  getPendingOrders,
  getShipingOrders,
  getConfirmOrders,
  getDeleveredOrders,
  getCompleteOrders,
  getCancelledOrders,
  getPendingOrdersAll,
  getReceivedOrdersDay,
  searchOrdersByUserPhoneCancell,
  searchOrdersByUserPhoneConfirm,
  searchOrdersByUserPhoneAwaitShipper,
  searchOrdersByUserPhoneShipping,
  searchOrdersByUserPhoneShipDone,
  searchOrdersByUserPhoneDone,
  searchOrdersByUserPhoneComplete,
  getCompleteAndDoneOrders,
  getBomdOrders,
  UpdateBomd,
  UpdateOrder,
  searchOrdersByUserPhoneCancell1
};
