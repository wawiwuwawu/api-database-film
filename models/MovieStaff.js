module.exports = (sequelize, DataTypes) => {
  const MovieStaff = sequelize.define(
    "MovieStaff",
    {
      movie_id: { type: DataTypes.INTEGER, primaryKey: true,
        references: {
          model: "movies",
          key: "id"
        }
      },
      staff_id: { type: DataTypes.INTEGER, primaryKey: true,
        references: {
          model: "staff",
          key: "id"
        }
      },
    },
    {
      tableName: "movie_staff",
      timestamps: false
    }
  );

  // MovieStaff.associate = (models) => {
  //   MovieStaff.belongsTo(models.Movie, { foreignKey: "movie_id", as: "movie" });
  //   MovieStaff.belongsTo(models.Staff, { foreignKey: "staff_id", as: "staff" });
  // };

  return MovieStaff;
}