require('dotenv').config();
const mysql = require('mysql2/promise');

const koneksi = mysql.createPool({
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: 'dedeari123',
  database: 'database_film',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  multipleStatements: true
});

module.exports = koneksi;