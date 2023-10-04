const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const connect = require('./database');
const app = express();
const server = http.createServer(app);
const io = socketIo(server);
const cors = require('cors');
app.use(express.json());
const routerProduct = require('./src/router/product')
const routerColor = require('./src/router/color')
const routerCategory = require('./src/router/category')
const routerSize = require('./src/router/size')
const routerUser = require('./src/router/user')
const routerCart = require('./src/router/cart')
const routerCheckOut = require('./src/router/checkout')
const routerOrder = require('./src/router/order')
const routerSale = require('./src/router/sale')
const corsOptions = {
    origin: '*', // Địa chỉ nguồn bạn muốn cho phép
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', // Các phương thức được phép
    credentials: true, // Cho phép gửi cookie (nếu cần)
    optionsSuccessStatus: 204, // Trả về mã trạng thái 204 (No Content) cho yêu cầu kiểm tra trước
};

app.use(cors(corsOptions));
app.use('/api', routerProduct)
app.use('/api', routerColor)
app.use('/api', routerCategory)
app.use('/api', routerSize)
app.use('/api', routerUser)
app.use('/api', routerCart)
app.use('/api', routerCheckOut)
app.use('/api', routerOrder)
app.use('/api', routerSale)
io.on('connection', (socket) => {
    console.log('A user connected');

    socket.on('message', (message) => {
        console.log(`Received message: ${message}`);
        io.emit('message', message); // Gửi tin nhắn tới tất cả các kết nối
    });

    socket.on('disconnect', () => {
        console.log('A user disconnected');
    });
});
connect.connect((err) => {
    if (err) {
        console.log('That bai !');
    }
    console.log('Thanh cong');
})
const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});