module.exports = (sequelize, DataTypes) => {
  const Genre = sequelize.define(
    "genre",
    {
      nama: { type: DataTypes.STRING, allowNull: false }
    },
    {
      tableName: "genre",
      timestamps: false
    }
  );

  // Genre.associate = (models) => {
  //   Genre.belongsToMany(models.Movie, { through: "movie_genre", foreignKey: "genre_id", otherKey: "movie_id", as: "movies" });
  // };

  return Genre;
};
