const { Client } = require("pg");
const connect = new Client({
  user: "postgres",

  // password: "admin",
  // password: 'admin',
  // password: 'ADMIN',
  // password: "admin",
  // password: "admin",
  // password: "ADMIN",
  // password: "admin",
  password: "admin",

  // password: "jajaja1234z",

  host: "localhost",
  port: 5432, // Cổng mặc định của PostgreSQL là 5432
  //  port: 3001, // Cổng mặc định của PostgreSQL là 5432
  // port: 3001, // Cổng mặc định của PostgreSQL là 5432

  // port: 3001, // Cổng mặc định của PostgreSQL là 5432
  // database: 'DU_AN_TOT_NGHIEP',

  // database: "DATN_MAIN",

  // database: "DATN",
  //  database: "DUANTN",


  // database: "DUANTN",

  database: "DATN_2023_MAIN",
  // database: "DUAN",

  // database: "DUAN"
});
module.exports = connect;
