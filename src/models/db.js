const mysql = require("mysql2/promise");
const fs = require("fs");

const pool = mysql.createPool({
  host: "riseup-riseup.e.aivencloud.com",
  user: "avnadmin",
  port: "11832",
  password: "AVNS_lFnOOTe5ISkyFePS5Og",
  database: "defaultdb",
  ssl: {
    rejectUnauthorized: true,
    ca: fs.readFileSync("./ca.pem"),
  },
});

module.exports = pool;
