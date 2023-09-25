const { Client } = require('pg');
const connect = new Client({
    user: 'postgres',
    password: 'ADMIN',
    host: 'localhost',
    port: 5432, // Cổng mặc định của PostgreSQL là 5432
    // port: 3001, // Cổng mặc định của PostgreSQL là 5432
    database: 'DUANTN_2023',
});
module.exports = connect;