const { Client } = require('pg');
const connect = new Client({
    user: 'postgres',

    // password: 'jajaja1234z',
    password: 'admin',

    host: 'localhost',
    port: 5432, // Cổng mặc định của PostgreSQL là 5432
    // port: 3001, // Cổng mặc định của PostgreSQL là 5432
    // database: 'DU_AN_TOT_NGHIEP',

    // database: 'DUANTN',
    // database: 'DATN',

    database: 'DATN_2023_MAIN'



});
module.exports = connect; 