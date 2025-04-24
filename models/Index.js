
console.log('[DEBUG] Loading models/index.js');
console.log('[DEBUG] User model:', User);
console.log('[DEBUG] Movie model:', Movie);
console.log('[DEBUG] Genre model:', Genre);
console.log('[DEBUG] Theme model:', Theme);
console.log('[DEBUG] Staff model:', Staff);
console.log('[DEBUG] Seiyu model:', Seiyu);
console.log('[DEBUG] Karakter model:', Karakter);
console.log('[DEBUG] MovieSeiyu model:', MovieSeiyu);
console.log('[DEBUG] MovieGenre model:', MovieGenre);
console.log('[DEBUG] MovieStaff model:', MovieStaff);
console.log('[DEBUG] MovieTheme model:', MovieTheme);
console.log('[DEBUG] sequelize:', sequelize);



const sequelize = require('../config/sequelize');
const { DataTypes } = require('sequelize');

// Import semua model
const modelDefiners = [
  require('./User'),
  require('./Movie'),
  require('./Genre'),
  require('./Theme'),
  require('./Staff'),
  require('./Seiyu'),
  require('./Karakter'),
  require('./MovieSeiyu'),
  require('./MovieGenre'),
  require('./MovieTheme'),
  require('./MovieStaff')
];

modelDefiners.forEach(definer => definer(sequelize, DataTypes));

const { User, Movie, Genre, Theme, Staff, Seiyu, Karakter, MovieSeiyu, MovieGenre, MovieStaff, MovieTheme } = sequelize.models;

// Definisikan relasi antar model
// 1. Movie - Genre (Many-to-Many)
Movie.belongsToMany(Genre, {
  through: 'movie_genres',
  foreignKey: 'movie_id',
  otherKey: 'genre_id',
  as: 'genres'
});
Genre.belongsToMany(Movie, {
  through: 'movie_genres',
  foreignKey: 'genre_id',
  otherKey: 'movie_id',
  as: 'movies'
});

// 2. Movie - Theme (Many-to-Many)
Movie.belongsToMany(Theme, {
  through: 'movie_themes',
  foreignKey: 'movie_id',
  otherKey: 'theme_id',
  as: 'themes'
});
Theme.belongsToMany(Movie, {
  through: 'movie_themes',
  foreignKey: 'theme_id',
  otherKey: 'movie_id',
  as: 'movies'
});

// 3. Movie - Staff (Many-to-Many)
Movie.belongsToMany(Staff, {
  through: 'movie_staff',
  foreignKey: 'movie_id',
  otherKey: 'staff_id',
  as: 'staff'
});
Staff.belongsToMany(Movie, {
  through: 'movie_staff',
  foreignKey: 'staff_id',
  otherKey: 'movie_id',
  as: 'movies'
});

// 4. Movie - Seiyu & Karakter (Many-to-Many dengan atribut tambahan di MovieSeiyu)
Movie.belongsToMany(Seiyu, {
  through: MovieSeiyu,
  foreignKey: 'movie_id',
  otherKey: 'seiyu_id',
  as: 'pengisi_suara'
});
Seiyu.belongsToMany(Movie, {
  through: MovieSeiyu,
  foreignKey: 'seiyu_id',
  otherKey: 'movie_id',
  as: 'film'
});

Karakter.belongsToMany(Movie, {
  through: MovieSeiyu,
  foreignKey: 'karakter_id',
  otherKey: 'movie_id',
  as: 'movies'
});
Movie.belongsToMany(Karakter, {
  through: MovieSeiyu,
  foreignKey: 'movie_id',
  otherKey: 'karakter_id',
  as: 'karakter'
});



// Export semua model dan koneksi
module.exports = {
  sequelize,
  Movie,
  Genre,
  Theme,
  Staff,
  Seiyu,
  Karakter,
  MovieSeiyu,
  MovieGenre,
  MovieTheme,
  MovieStaff,
  User
};
