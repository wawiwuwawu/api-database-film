// models/index.js
const sequelize = require('../config/sequelize');
const { DataTypes } = require('sequelize');

// Import semua model
const User = require('./User')(sequelize, DataTypes);
const Movie = require('./Movie')(sequelize, DataTypes);
const Genre = require('./Genre')(sequelize, DataTypes);
const Theme = require('./Theme')(sequelize, DataTypes);
const Staff = require('./Staff')(sequelize, DataTypes);
const Seiyu = require('./Seiyu')(sequelize, DataTypes);
const Karakter = require('./Karakter')(sequelize, DataTypes);
const MovieSeiyu = require('./MovieSeiyu')(sequelize, DataTypes);
const MovieGenre = require('./MovieGenre')(sequelize, DataTypes);
const MovieTheme = require('./MovieTheme')(sequelize, DataTypes);
const MovieStaff = require('./MovieStaff')(sequelize, DataTypes);


Movie.belongsToMany(Genre, { through: 'movie_genres', foreignKey: 'movie_id', otherKey: 'genre_id', as: 'genres' });
Genre.belongsToMany(Movie, { through: 'movie_genres', foreignKey: 'genre_id', otherKey: 'movie_id', as: 'movies' });
Movie.belongsToMany(Theme, { through: 'movie_themes', foreignKey: 'movie_id', otherKey: 'theme_id', as: 'themes' });
Theme.belongsToMany(Movie, { through: 'movie_themes', foreignKey: 'theme_id', otherKey: 'movie_id', as: 'movies' });
Movie.belongsToMany(Staff, { through: 'movie_staff', foreignKey: 'movie_id', otherKey: 'staff_id', as: 'staff' });
Staff.belongsToMany(Movie, { through: 'movie_staff', foreignKey: 'staff_id', otherKey: 'movie_id', as: 'movies' });
Movie.belongsToMany(Seiyu, { through: MovieSeiyu, foreignKey: 'movie_id', otherKey: 'seiyu_id', as: 'pengisi_suara' });
Seiyu.belongsToMany(Movie, { through: MovieSeiyu, foreignKey: 'seiyu_id', otherKey: 'movie_id', as: 'film' });
Karakter.belongsToMany(Movie, { through: MovieSeiyu, foreignKey: 'karakter_id', otherKey: 'movie_id', as: 'movies' });
Movie.belongsToMany(Karakter, { through: MovieSeiyu, foreignKey: 'movie_id', otherKey: 'karakter_id', as: 'karakter' });


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
