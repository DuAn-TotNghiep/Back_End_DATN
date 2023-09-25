const { Client } = require('pg');
const connect = new Client({
    user: 'postgres',
    password: 'admin',
    host: 'localhost',
    port: 5432, // Cổng mặc định của PostgreSQL là 5432
    // port: 3001, // Cổng mặc định của PostgreSQL là 5432
    // database: 'DATN',
    database: 'DATN_2023_MAIN'
});
module.exports = connect;