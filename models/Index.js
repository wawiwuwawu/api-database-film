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


Movie.belongsToMany(Genre, { through: MovieGenre, foreignKey: 'movie_id', otherKey: 'genre_id', as: 'genre' });
Movie.belongsToMany(Theme, { through: MovieTheme, foreignKey: 'movie_id', otherKey: 'theme_id', as: 'theme' });
Movie.belongsToMany(Staff, { through: MovieStaff, foreignKey: 'movie_id', otherKey: 'staff_id', as: 'staff' });
Movie.belongsToMany(Seiyu, { through: MovieSeiyu, foreignKey: 'movie_id', otherKey: 'seiyu_id', as: 'seiyu' });
Movie.belongsToMany(Karakter, { through: MovieSeiyu, foreignKey: 'movie_id', otherKey: 'karakter_id', as: 'karakter' });

Genre.belongsToMany(Movie, { through: MovieGenre, foreignKey: 'genre_id', otherKey: 'movie_id', as: 'movies' });

Theme.belongsToMany(Movie, { through: MovieTheme, foreignKey: 'theme_id', otherKey: 'movie_id', as: 'movies' });

Staff.belongsToMany(Movie, { through: MovieStaff, foreignKey: 'staff_id', otherKey: 'movie_id', as: 'movies' });

Seiyu.belongsToMany(Movie, { through: MovieSeiyu, foreignKey: 'seiyu_id', otherKey: 'movie_id', as: 'movies' });

Karakter.belongsToMany(Movie, { through: MovieSeiyu, foreignKey: 'karakter_id', otherKey: 'movie_id', as: 'movies' });
Karakter.belongsToMany(Seiyu, { through: MovieSeiyu, foreignKey: 'karakter_id', otherKey: 'seiyu_id', as: 'seiyu' });

MovieGenre.belongsTo(Genre, { foreignKey: 'genre_id', as: 'genre' });
MovieGenre.belongsTo(Movie, { foreignKey: 'movie_id', as: 'movie' });

MovieTheme.belongsTo(Theme, { foreignKey: 'theme_id', as: 'theme' });
MovieTheme.belongsTo(Movie, { foreignKey: 'movie_id', as: 'movie' });

MovieStaff.belongsTo(Staff, { foreignKey: 'staff_id', as: 'staff' });
MovieStaff.belongsTo(Movie, { foreignKey: 'movie_id', as: 'movie' });

MovieSeiyu.belongsTo(Seiyu, { foreignKey: 'seiyu_id', as: 'seiyu' });
MovieSeiyu.belongsTo(Movie, { foreignKey: 'movie_id', as: 'movie' });
MovieSeiyu.belongsTo(Karakter, { foreignKey: 'karakter_id', as: 'karakter' });



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
