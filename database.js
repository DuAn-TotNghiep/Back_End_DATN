const { Client } = require('pg');
const connect = new Client({
    user: 'postgres',
    password: 'jajaja1234z',
    host: 'localhost',
    port: 5432, // Cổng mặc định của PostgreSQL là 5432
    // port: 3001, // Cổng mặc định của PostgreSQL là 5432
    database: 'DATN'
});
module.exports = connect;