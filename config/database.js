const mysql = require('mysql2');
// buat konfigurasi koneksi
const koneksi = mysql.createConnection({
    host: '192.168.0.131',
    port: '3306',
    user: 'root',
    password: 'dedeari123',
    database: 'database_film',
    multipleStatements: true
});
// koneksi database
koneksi.connect((err) => {
    if (err) throw err;
    console.log('MySQL Connected...');
});
module.exports = koneksi;