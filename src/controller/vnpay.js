let $ = require("jquery");
const request = require("request");
const moment = require("moment");
const { func } = require("joi");
const { DateTime } = require("luxon");
const connect = require("../../database");
const io = require("../../app");
const vnpay = async (req, res) => {
  try {
    process.env.TZ = "Asia/Ho_Chi_Minh";

    let date = new Date();
    let createDate = moment(date).format("YYYYMMDDHHmmss");

    let ipAddr =
      req.headers["x-forwarded-for"] ||
      req.connection.remoteAddress ||
      req.socket.remoteAddress ||
      req.connection.socket.remoteAddress;

    let config = require("../config/config.json");

    let tmnCode = config.vnp_TmnCode;
    let secretKey = config.vnp_HashSecret;
    let vnpUrl = config.vnp_Url;
    let returnUrl = config.vnp_ReturnUrl;

    let orderId = moment(date).format("DDHHmmss");
    let amount = req.body.amount;
    let bankCode = req.body.bankCode;

    let locale = req.body.language;
    if (locale === null || locale === "") {
      locale = "vn";
    }
    let currCode = "VND";
    let vnp_Params = {};
    vnp_Params["vnp_Version"] = "2.1.0";
    vnp_Params["vnp_Command"] = "pay";
    vnp_Params["vnp_TmnCode"] = tmnCode;
    vnp_Params["vnp_Locale"] = locale;
    vnp_Params["vnp_CurrCode"] = currCode;
    vnp_Params["vnp_TxnRef"] = orderId;
    vnp_Params["vnp_OrderInfo"] = "Thanh toan cho ma GD:" + orderId;
    vnp_Params["vnp_OrderType"] = "other";
    vnp_Params["vnp_Amount"] = amount * 100;
    vnp_Params["vnp_ReturnUrl"] = returnUrl;
    vnp_Params["vnp_IpAddr"] = ipAddr;
    vnp_Params["vnp_CreateDate"] = createDate;
    if (bankCode !== null && bankCode !== "") {
      vnp_Params["vnp_BankCode"] = bankCode;
    }

    vnp_Params = sortObject(vnp_Params);

    let querystring = require("qs");
    let signData = querystring.stringify(vnp_Params, { encode: false });
    let crypto = require("crypto");
    let hmac = crypto.createHmac("sha512", secretKey);
    let signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");
    vnp_Params["vnp_SecureHash"] = signed;
    vnpUrl += "?" + querystring.stringify(vnp_Params, { encode: false });
    // Chuyển hướng người dùng đến trang thanh toán VNPAY
    return res.status(200).json({ message: "url", vnpUrl });
    // res.redirect(vnpUrl);
  } catch (error) {
    return res.status(500).json({ message: "Loi API VNPAY", error });
  }
};

const vnpay_return = async (req, res) => {
  try {
    // const time = DateTime.local().setZone('Asia/Ho_Chi_Minh');
    let vnp_Params = req.query;

    let secureHash = vnp_Params["vnp_SecureHash"];

    delete vnp_Params["vnp_SecureHash"];
    delete vnp_Params["vnp_SecureHashType"];

    vnp_Params = sortObject(vnp_Params);

    let config = require("../config/config.json");
    let tmnCode = config.vnp_TmnCode;
    let secretKey = config.vnp_HashSecret;

    let querystring = require("qs");
    let signData = querystring.stringify(vnp_Params, { encode: false });
    let crypto = require("crypto");
    let hmac = crypto.createHmac("sha512", secretKey);
    let signed = hmac.update(new Buffer.from(signData, "utf-8")).digest("hex");

    if (secureHash === signed) {
      // Kiem tra xem du lieu trong db co hop le hay khong va thong bao ket qua
      if (vnp_Params["vnp_ResponseCode"] === "00") {
        // Giao dịch thành công
        const ma = vnp_Params["vnp_TransactionNo"];
        const amount = vnp_Params["vnp_Amount"] / 100;
        const date = vnp_Params["vnp_PayDate"];
        // const status_vnpay = {
        //   status: "success",
        //   code: vnp_Params['vnp_TransactionNo'],
        //   amount: (vnp_Params['vnp_Amount'] / 100)
        // }
        // localStorage.setItem('status_vnpay', JSON.stringify(status_vnpay))

        const sql = `INSERT INTO vnpay(transaction_code , status,amount,transaction_time ) VALUES('${ma}','success', '${amount}', '${date}') RETURNING*`;
        console.log(ma, amount, date);
        connect.query(sql, (err, result) => {
          if (err) {
            return res.status(500).json({ message: "Loi them vnpay", err });
          }
          const data = result.rows;
          io.emit("vnpay", { message: "Có Thông Tin Mới", data });
          const successHTML = `
                <!DOCTYPE html>
                <html>
                <head>
                  <title>Thanh toán thành công</title>
                  <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css">
                  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css">

                </head>
                <body>
                
                <div class="container">
                  <div class="row justify-content-center">
                    <div class="col-6 mt-4">
                      <div class="alert alert-success" role="alert">
                        <h4 class="alert-heading">Thanh toán thành công! <i class="fa fa-check"></i> </h4>
                        <p>Cảm ơn bạn đã thực hiện thanh toán. Dưới đây là thông tin giao dịch:</p>
                        <ul>
                          <li>Mã giao dịch: <strong>${
                            vnp_Params["vnp_TransactionNo"]
                          }</strong></li>
                          <li>Ngày thanh toán: <strong>${
                            vnp_Params["vnp_PayDate"]
                          }</strong></li>
                          <li>Số tiền thanh toán: <strong>${
                            vnp_Params["vnp_Amount"] / 100
                          }</strong> VND</li>
                          <!-- Các trường dữ liệu khác có thể thêm tại đây -->
                        </ul>
                      </div>
                      <button class="btn btn-primary" onClick={window.close()}>Đóng</button>
                    </div>
                  </div>
                </div>
               
              </script>
                <script src="https://code.jquery.com/jquery-3.5.1.slim.min.js"></script>
                <script src="https://cdn.jsdelivr.net/npm/@popperjs/core@2.5.3/dist/umd/popper.min.js"></script>
                <script src="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/js/bootstrap.min.js"></script>
                </body>
                </html>
                
                `;
          res.send(successHTML);
        });

        // res.send('Thanh toán thành công! Mã giao dịch: ' + vnp_Params['vnp_TransactionNo']);

        // Bạn có thể thêm mã lệnh để lưu thông tin giao dịch vào cơ sở dữ liệu
      } else {
        // Giao dịch bị hủy hoặc lỗi
        const ma = vnp_Params["vnp_ResponseCode"];
        const date = vnp_Params["vnp_PayDate"];
        const amount = vnp_Params["vnp_Amount"] / 100;
        const sql = `INSERT INTO vnpay(transaction_code ,amount, status,transaction_time ) VALUES('${ma}','${amount}','error', '${date}') RETURNING*`;
        connect.query(sql, (err, result) => {
          if (err) {
            return res.status(500).json({ message: "Loi them vnpay", err });
          }
          const data = result.rows;
          io.emit("vnpay", { message: "Có Thông Tin Mới", data });
          const FailedHTML = `
                <!DOCTYPE html>
                <html>
                <head>
                  <title>Thanh toán</title>
                  <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css">
                  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css">
                </head>
                <body>
                
                <div class="container">
                  <div class="row justify-content-center">
                    <div class="col-6 mt-4">
                      <div class="alert alert-danger" role="alert">
                        <h4 class="alert-heading">Thanh toán thất bại! <i class="fa fa-times-circle"></i></h4>
                        <p>Xin lỗi, thanh toán của bạn không thành công. Dưới đây là thông tin giao dịch:</p>
                        <ul>
                          <li>Mã lỗi: <strong>${vnp_Params["vnp_ResponseCode"]}</strong></li>
                          <!-- Các trường dữ liệu lỗi khác có thể thêm tại đây -->
                        </ul>
                      </div>
                      <button class="btn btn-primary" onClick={window.close()}>Quay lại</button>
                    </div>
                  </div>
                </div>
                <script src="https://code.jquery.com/jquery-3.5.1.slim.min.js"></script>
                <script src="https://cdn.jsdelivr.net/npm/@popperjs/core@2.5.3/dist/umd/popper.min.js"></script>
                <script src="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/js/bootstrap.min.js"></script>
                </body>
                </html>
                
            `;
          res.send(FailedHTML);
        });
      }
    } else {
      // Hash không hợp lệ
      console.log("Hash không hợp lệ");
    }

    // // Hiển thị trang thành công hoặc trang lỗi tùy vào kết quả xử lý giao dịch
    // if (vnp_Params['vnp_ResponseCode'] === '00') {
    //     res.render('success', { code: vnp_Params['vnp_ResponseCode'] });
    // } else {
    //     res.render('error', { code: vnp_Params['vnp_ResponseCode'] });
    // }
  } catch (err) {
    return res.status(500).json({ message: "Loi API VNPAY", err });
  }
};

function sortObject(obj) {
  let sorted = {};
  let str = [];
  let key;
  for (key in obj) {
    if (obj.hasOwnProperty(key)) {
      str.push(encodeURIComponent(key));
    }
  }
  str.sort();
  for (key = 0; key < str.length; key++) {
    sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, "+");
  }
  return sorted;
}
const getOneVnpay = (req, res) => {
  try {
    const slq = `SELECT *
FROM vnpay
ORDER BY transaction_time DESC
LIMIT 1`;
    connect.query(slq, (err, result) => {
      if (err) {
        return res.status(500).json({ message: "Lay vnpay that bai", err });
      }
      const data = result.rows[0];
      return res.status(200).json({ message: "Lay thanh cong vnpay", data });
    });
  } catch (err) {
    return res.status(500).json({ message: "Loi API ", err });
  }
};

module.exports = { vnpay, vnpay_return, getOneVnpay };
