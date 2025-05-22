module.exports = (sequelize, DataTypes) => {
  const MovieList = sequelize.define(
    "MovieList",
    {
      user_id: { type: DataTypes.INTEGER, primaryKey: true, references: { model: "users", key: "id" } },
      movie_id: { type: DataTypes.INTEGER, primaryKey: true, references: { model: "movies", key: "id" } },
      status: { type: DataTypes.ENUM("disimpan", "ditonton", "sudah ditonton"), allowNull: false, defaultValue: "disimpan" },
    },
    {
      tableName: "movie_list",
      timestamps: false
    }
  );



  return MovieList;
}