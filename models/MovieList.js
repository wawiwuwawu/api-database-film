module.exports = (sequelize, DataTypes) => {
  const MovieList = sequelize.define(
    "MovieList",
    {
      user_id: { type: DataTypes.INTEGER, primaryKey: true, references: { model: "users", key: "id" }, onDelete: 'CASCADE', onUpdate: 'CASCADE' },
      movie_id: { type: DataTypes.INTEGER, primaryKey: true, references: { model: "movies", key: "id" }, onDelete: 'CASCADE', onUpdate: 'CASCADE' },
      status: { type: DataTypes.ENUM("disimpan", "ditonton", "sudah ditonton"), allowNull: false, defaultValue: "disimpan" },
    },
    {
      tableName: "movie_list",
      timestamps: false
    }
  );



  return MovieList;
}