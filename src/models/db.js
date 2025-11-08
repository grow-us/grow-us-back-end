const mysql = require("mysql2/promise");
const fs = require("fs");

require("dotenv").config();


const pool = mysql.createPool({
  host: process.env.HOST,
  user: process.env.USER,
  port: process.env.DB_PORT,
  password: process.env.PASSWORD,
  database: process.env.DATABASE,
  ssl: {
    rejectUnauthorized: true,
    ca: fs.readFileSync("./ca.pem"),
  },
});

module.exports = pool;
