// File: models/Movie.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Movie = sequelize.define('movies', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  judul: DataTypes.STRING,
  sinopsis: DataTypes.TEXT,
  tahun_rilis: DataTypes.INTEGER,
  type: DataTypes.ENUM('TV', 'Movie', 'ONA', 'OVA'),
  episode: DataTypes.INTEGER,
  durasi: DataTypes.INTEGER,
  rating: DataTypes.ENUM('G', 'PG', 'PG-13', 'R', 'NC-17'),
  cover_url: DataTypes.STRING,
  created_at: DataTypes.DATE
}, {
  timestamps: false
});

module.exports = Movie;