const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const connect = require("./database");
const app = express();
const { DateTime } = require('luxon');
const server = http.createServer(app);
// const io = socketIo(server);
const initSocket = require('./socket');
const io = initSocket(server);
module.exports = io
const cors = require("cors");
app.use(express.json());
const routerProduct = require("./src/router/product");
const routerColor = require("./src/router/color");
const routerCategory = require("./src/router/category");
const routerSize = require("./src/router/size");
const routerUser = require("./src/router/user");
const routerCart = require("./src/router/cart");
const routerCheckOut = require("./src/router/checkout");
const routerOrder = require("./src/router/order");
const routerSale = require("./src/router/sale");
const routerVnpay = require("./src/router/vnpay");
const routerDashBoard = require("./src/router/dashboard");
const routerBill = require('./src/router/bill')
const routerAction = require('./src/router/actions')
const routerRecyclebin = require('./src/router/recyclebin')
const routerFavorite = require('./src/router/favorite_product')
const routerComment = require('./src/router/comment')
const routerVoucher = require('./src/router/voucher')
const routerBlog = require('./src/router/blog')
const corsOptions = {
  origin: "*",
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true,
  optionsSuccessStatus: 204,
};
app.use(cors(corsOptions));

io.on("connection", (socket) => {
  console.log("A user connected");

  socket.on("message", (message) => {
    console.log(`Received message: ${message}`);
    io.emit("message", message);
  });

  socket.on("disconnect", () => {
    console.log("A user disconnected");
  });
});


app.use("/api", routerProduct);
app.use("/api", routerColor);
app.use("/api", routerCategory);
app.use("/api", routerSize);
app.use("/api", routerUser);
app.use("/api", routerCart);
app.use("/api", routerCheckOut);
app.use("/api", routerOrder);
app.use("/api", routerSale);
app.use("/api", routerVnpay);
app.use("/api", routerDashBoard);
app.use("/api", routerBill);
app.use("/api", routerAction);
app.use("/api", routerRecyclebin);
app.use("/api", routerFavorite);
app.use("/api", routerComment);
app.use("/api", routerVoucher);
app.use("/api", routerBlog);


connect.connect((err) => {
  if (err) {
    console.log("That bai !");
  }
  console.log("Thanh cong");
});
const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

