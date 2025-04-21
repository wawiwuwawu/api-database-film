// File: models/Genre.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Genre = sequelize.define('genres', {
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

module.exports = Genre;