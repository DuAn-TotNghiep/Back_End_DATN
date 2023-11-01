const connect = require("../../database");
const { DateTime } = require("luxon");
const jwt = require("jsonwebtoken");
const io = require("../../app");

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
      WHEN status = '0' THEN 4
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
    const sql = `UPDATE orders SET status=0 WHERE order_id=${id}`;
    connect.query(sql, (err, result) => {
      if (err) {
        return res
          .status(500)
          .json({ message: "khong sua duoc trang thai cancell", err });
      }
      const data = result.rows[0];
      io.emit("cancell", { message: "Đơn Hàng Đã Bị Hủy", data });
      return res
        .status(200)
        .json({ message: "sua thanh cong trang thai cancell", data });
    });
  } catch (err) {
    return res.status(500).json({ message: "Loi API", err });
  }
};
const UpdateConfirm = (req, res) => {
  try {
    const { id } = req.body;
    console.log(id);
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
      io.emit("confirm", { message: "Đơn hàng đã được xác nhận", data });
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
          .json({ message: "khong sua duoc trang thai shipdone", err });
      }
      const data = result.rows[0];
      io.emit("shiping", { message: "Đơn hàng đã được giao", data });
      setTimeout(() => {
        if (!responseSent) {
          const completeReq = { body: { id } };
          UpdateComplete(completeReq, res);
        }
      }, 60000);
    });
  } catch (err) {
    return res.status(500).json({ message: "Loi API", err });
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
      io.emit("complete", { message: "Đơn hàng đã hoàn thành", data });
      return res
        .status(200)
        .json({ message: "sua thanh cong trang thai complete order", data });
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
    const sql = `SELECT * FROM orders WHERE status = '5'`;

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
    const sql = `SELECT * FROM orders WHERE status = '1'`;

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
    const sql = `SELECT * FROM orders WHERE status = '2'`;

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
    const sql = `SELECT * FROM orders WHERE status = '3'`;

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
    const sql = `SELECT * FROM orders WHERE status = '4'`;

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
    const sql = `SELECT * FROM orders WHERE status = '6'`;

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
            WHERE status NOT IN ('1', '2', '3', '4', '5', '6')
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
const generateAndSendStatusOrder = (email) => {
  const otp = generateOTP();
  otps[email] = {
    otp,
    createdTime: Date.now(), // Sử dụng Date.now() để lưu thời gian tạo mã OTP
  };
  sendOTPByEmail(email, otp);
  return otp;
};
const nodemailer = require("nodemailer");
const numberFormatter = require("number-formatter");
const sendStatusByEmail = (req, res) => {
  try {
    const { id } = req.body;
    const sql = `SELECT * FROM orders WHERE order_id=${id}`;
    connect.query(sql, (err, result) => {
      if (err) {
        return res.status(500).json({ message: "Khong lay duoc order", err });
      }
      const data = result.rows[0];
      const sql1 = `SELECT * FROM checkout WHERE id=${data?.checkout_id}`;
      connect.query(sql1, (err, result) => {
        if (err) {
          return res
            .status(500)
            .json({ message: "Khong lay duoc checkout", err });
        }
        const data1 = result.rows[0];
        let status = "";
        console.log(data1);
        if (data?.user_id === null) {
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
            status = "Đang vận chuyển";
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
          if (data.status == 0) {
            status = "Đơn hàng đã bị hủy";
          }

          const mailOptions = {
            from: process.env.USER_EMAIL,
            to: checkoutData.email,
            subject: `Thông báo tình trạng đơn hàng #${data?.order_id}`,
            html: `
                        <p>Tình trạng đơn hàng của bạn: ${status}</p>
                        Ngày đặt hàng: ${data.order_date}</p>
                         <p>Tổng tiền: <h3>${formattedAmount}VND</h3></p>
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
          connect.query(sql2, (err, result) => {
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
              status = "Đang vận chuyển";
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
            if (data.status == 0) {
              status = "Đơn hàng đã bị hủy";
            }

            const mailOptions = {
              from: process.env.USER_EMAIL,
              to: data2.user_email,
              subject: `Thông báo tình trạng đơn hàng #${data?.order_id}`,
              html: `
                        <p>Tình trạng đơn hàng của bạn: ${status}</p>
                        Ngày đặt hàng: ${data.order_date}</p>
                         <p>Tổng tiền: <h3>${formattedAmount}VND</h3></p>
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
    let user_phone = req.body.user_phone;
    user_phone = user_phone.trim();

    // Tìm user_id từ bảng users dựa trên user_phone
    const userQuery = `SELECT id FROM users WHERE user_phone ILIKE $1`;
    const userResult = await connect.query(userQuery, [`%${user_phone}%`]);

    if (userResult.rows.length === 0) {
      return res.json({
        message: "Không tìm thấy người dùng với số điện thoại này",
      });
    }

    const userId = userResult.rows[0].id;

    // Tìm đơn hàng từ bảng orders dựa trên user_id
    const orderQuery = `SELECT * FROM orders WHERE user_id = $1`;
    const orderResult = await connect.query(orderQuery, [userId]);

    if (orderResult.rows.length === 0) {
      return res.json({
        message: "Không tìm thấy đơn hàng cho người dùng này",
      });
    }

    return res.json({
      message: "Tìm thấy đơn hàng",
      data: orderResult.rows,
    });
  } catch (error) {
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
  getReceivedOrdersDay
};
