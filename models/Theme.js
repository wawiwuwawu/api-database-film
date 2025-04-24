// models/Theme.js
module.exports = (sequelize, DataTypes) => {
  const Theme = sequelize.define(
    "theme",
    {
      nama: DataTypes.STRING
    },
    {
      tableName: "theme",
      timestamps: false
    }
  );

  Theme.associate = (models) => {
    Theme.belongsToMany(models.Movie, {
      through: models.MovieTheme,
      foreignKey: "theme_id",
      otherKey: "movie_id",
      as: "movies"
    });
  };

  return Theme;
};
