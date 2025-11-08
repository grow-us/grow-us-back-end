const mysql = require("mysql2/promise");
const fs = require("fs");

require("dotenv").config();


const pool = mysql.createPool({
  host: process.env.host,
  user: process.env.user,
  port: process.env.port,
  password: process.env.password,
  database: process.env.database,
  ssl: {
    rejectUnauthorized: true,
    ca: fs.readFileSync("./ca.pem"),
  },
});

module.exports = pool;
