module.exports = (sequelize, DataTypes) => {
  const MovieGenre = sequelize.define(
    "MovieGenre",
    {
      movie_id: { type: DataTypes.INTEGER, primaryKey: true, references: { model: "movies", key: "id" } },
      genre_id: { type: DataTypes.INTEGER, primaryKey: true, references: { model: "genre", key: "id" } }
    },
    {
      tableName: "movie_genre",
      timestamps: false
    }
  );

  // MovieGenre.associate = (models) => {
  //   MovieGenre.belongsTo(models.Movie, { foreignKey: "movie_id", as: "movie" });
  //   MovieGenre.belongsTo(models.Genre, { foreignKey: "genre_id", as: "genre" });g
  // };

  return MovieGenre;
}