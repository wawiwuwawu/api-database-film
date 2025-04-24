// models/Karakter.js
module.exports = (sequelize, DataTypes) => {
  const Karakter = sequelize.define(
    "karakter",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      nama: {
        type: DataTypes.STRING,
        allowNull: false
      },
      bio: {
        type: DataTypes.TEXT
      }
    },
    {
      tableName: "karakter",
      timestamps: false
    }
  );

  Karakter.associate = (models) => {
    Karakter.belongsToMany(models.Seiyu, {
      through: models.MovieSeiyu,
      foreignKey: "karakter_id",
      otherKey: "seiyu_id",
      as: "seiyus"
    });
    Karakter.belongsToMany(models.Movie, {
      through: models.MovieSeiyu,
      foreignKey: "karakter_id",
      otherKey: "movie_id",
      as: "movies"
    });
  };

  return Karakter;
};
