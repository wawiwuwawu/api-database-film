module.exports = (sequelize, DataTypes) => {
  const MovieTheme = sequelize.define(
    "ThemeMovie",
    {
      movie_id: { type: DataTypes.INTEGER, primaryKey: true, references: { model: "movies", key: "id" } },
      theme_id: { type: DataTypes.INTEGER, primaryKey: true, references: { model: "theme", key: "id" } }
    },
    {
      tableName: "movie_theme",
      timestamps: false
    }
  );

  // MovieTheme.associate = (models) => {
  //   MovieTheme.belongsTo(models.Movie, { foreignKey: "movie_id", as: "movie" });
  //   MovieTheme.belongsTo(models.Theme, { foreignKey: "theme_id", as: "theme" });
  // };

  return MovieTheme;
}