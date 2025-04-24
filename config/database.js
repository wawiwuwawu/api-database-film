require('dotenv').config();
const mysql = require('mysql2/promise');

// const koneksi = mysql.createPool({
//   host: 'localhost',
//   port: 3306,
//   user: 'root',
//   password: 'dedeari123',
//   database: 'database_film',
//   waitForConnections: true,
//   connectionLimit: 10,
//   queueLimit: 0,
//   multipleStatements: true
// });

module.exports = {
  DB_NAME: 'database_film',
  DB_USER: 'root',
  DB_PASSWORD: 'dedeari123',
  DB_HOST: 'localhost',
  DB_PORT: 3306,
  DB_DIALECT: 'mysql'
};

// koneksi.getConnection()
//   .then(() => console.log('✅ Database connected!'))
//   .catch(err => console.error('❌ Database error:', err.message));

// module.exports = koneksi;