// File: models/Theme.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Theme = sequelize.define('themes', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nama: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true
  }
}, {
  timestamps: false
});

module.exports = Theme;