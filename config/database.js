// config/database.js
require('dotenv').config();
const mysql = require('mysql2/promise');

const koneksi = mysql.createPool({
  host: '192.168.0.131',
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
// koneksi database
// koneksi.connect((err) => {
//     if (err) throw err;
//     console.log('MySQL Connected...');
// });
module.exports = koneksi;