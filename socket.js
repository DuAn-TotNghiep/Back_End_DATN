const socketIO = require('socket.io');

const initSocket = (server) => {
    const io = socketIO(server, {
        cors: {
            origin: '*',
            methods: ['GET', 'POST']
        }
    });
    io.on('connection', (socket) => {
        console.log('A user connected');
        socket.on('disconnect', () => {
            console.log('A user disconnected');
        });
    });
    return io;
};

module.exports = initSocket;