const { Sequelize } = require('sequelize');
const config = require('./database');

const sequelize = new Sequelize(
  config.DB_NAME,
  config.DB_USER,
  config.DB_PASSWORD,
  {
    host: config.DB_HOST,
    port: config.DB_PORT,
    dialect: config.DB_DIALECT,
    logging: false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    define: {
      underscored: true,
      timestamps: true
    }
  }
);

// Tes koneksi
sequelize.authenticate()
  .then(() => console.log('✅ MySQL connected!'))
  .catch(err => console.error('❌ MySQL connection error:', err));

module.exports = sequelize;