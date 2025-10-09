const sequelize = require('../config/sequelize');
const { DataTypes } = require('sequelize');

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
const MovieList = require('./MovieList')(sequelize, DataTypes);




Movie.belongsToMany(Genre, { through: MovieGenre, foreignKey: 'movie_id', otherKey: 'genre_id', as: 'genres', onDelete: 'CASCADE' });
Movie.belongsToMany(Theme, { through: MovieTheme, foreignKey: 'movie_id', otherKey: 'theme_id', as: 'themes', onDelete: 'CASCADE' });
Movie.belongsToMany(Staff, { through: MovieStaff, foreignKey: 'movie_id', otherKey: 'staff_id', as: 'staffs', onDelete: 'CASCADE' });

Genre.belongsToMany(Movie, { through: MovieGenre, foreignKey: 'genre_id', otherKey: 'movie_id', as: 'movies', onDelete: 'CASCADE' });

Theme.belongsToMany(Movie, { through: MovieTheme, foreignKey: 'theme_id', otherKey: 'movie_id', as: 'movies', onDelete: 'CASCADE' });

Staff.belongsToMany(Movie, { through: MovieStaff, foreignKey: 'staff_id', otherKey: 'movie_id', as: 'movies', onDelete: 'CASCADE' });

MovieGenre.belongsTo(Genre, { foreignKey: 'genre_id', as: 'genres' });
MovieGenre.belongsTo(Movie, { foreignKey: 'movie_id', as: 'movies' });

MovieTheme.belongsTo(Theme, { foreignKey: 'theme_id', as: 'themes' });
MovieTheme.belongsTo(Movie, { foreignKey: 'movie_id', as: 'movies' });

MovieStaff.belongsTo(Staff, { foreignKey: 'staff_id', as: 'staffs' });
MovieStaff.belongsTo(Movie, { foreignKey: 'movie_id', as: 'movies' });

MovieSeiyu.belongsTo(Seiyu, { foreignKey: 'seiyu_id', as: 'seiyus' });
MovieSeiyu.belongsTo(Movie, { foreignKey: 'movie_id', as: 'movies' });
MovieSeiyu.belongsTo(Karakter, { foreignKey: 'karakter_id', as: 'karakters' });

Movie.belongsToMany(Seiyu, {
  through: { model: MovieSeiyu, unique: false},
  as: 'seiyus',
  foreignKey: 'movie_id',
  otherKey: 'seiyu_id',
  onDelete: 'CASCADE'
});

Seiyu.belongsToMany(Movie, {
  through: { model: MovieSeiyu, unique: false },
  as: 'movies',
  foreignKey: 'seiyu_id',
  otherKey: 'movie_id',
  onDelete: 'CASCADE'
});

Movie.belongsToMany(Karakter, {
  through: { model: MovieSeiyu, unique: false },
  as: 'karakters',
  foreignKey: 'movie_id',
  otherKey: 'karakter_id',
  onDelete: 'CASCADE'
});

Karakter.belongsToMany(Movie, {
  through: { model: MovieSeiyu, unique: false },
  as: 'movies',
  foreignKey: 'karakter_id',
  otherKey: 'movie_id',
  onDelete: 'CASCADE'
});

Seiyu.belongsToMany(Karakter, {
  through: { model: MovieSeiyu, unique: false },
  as: 'karakters',
  foreignKey: 'seiyu_id',
  otherKey: 'karakter_id',
  onDelete: 'CASCADE'
});

Karakter.belongsToMany(Seiyu, {
  through: { model: MovieSeiyu, unique: false },
  as: 'seiyus',
  foreignKey: 'karakter_id',
  otherKey: 'seiyu_id',
  onDelete: 'CASCADE'
});

User.belongsToMany(Movie, {
  through: MovieList,
  as: 'movies',
  foreignKey: 'user_id',
  otherKey: 'movie_id',
  onDelete: 'CASCADE'
});

Movie.belongsToMany(User, {
  through: MovieList,
  as: 'users',
  foreignKey: 'movie_id',
  otherKey: 'user_id',
  onDelete: 'CASCADE'
});

MovieList.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
MovieList.belongsTo(Movie, { foreignKey: 'movie_id', as: 'movie' });

User.hasMany(MovieList, { foreignKey: 'user_id', as: 'movieLists' });
Movie.hasMany(MovieList, { foreignKey: 'movie_id', as: 'movieLists' });

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
  User,
  MovieList
};
