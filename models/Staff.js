// File: models/Staff.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Staff = sequelize.define('staff', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nama: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  birthday: {
    type: DataTypes.DATEONLY
  },
  role: {
    type: DataTypes.ENUM('Director', 'Producer', 'Staff'),
    allowNull: false
  },
  bio: {
    type: DataTypes.TEXT
  }
}, {
  timestamps: false
});

module.exports = Staff;