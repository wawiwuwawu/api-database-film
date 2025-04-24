// models/Seiyu.js
module.exports = (sequelize, DataTypes) => {
  const Seiyu = sequelize.define(
    "seiyu",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: {
          notEmpty: { msg: "Nama tidak boleh kosong" },
        },
      },
      birthday: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        validate: {
          isDate: { msg: "Format tanggal tidak valid (YYYY-MM-DD)" },
        },
      },
      bio: DataTypes.TEXT,
      website_url: DataTypes.STRING(255),
      instagram_url: DataTypes.STRING(255),
      twitter_url: DataTypes.STRING(255),
      youtube_url: DataTypes.STRING(255),
      profile_url: {
        type: DataTypes.STRING(255),
        validate: { isURL: { msg: "URL profil tidak valid" } },
      },
      delete_hash: DataTypes.STRING(255),
    },
    {
      tableName: "seiyu",
      timestamps: false,
    }
  );

  Seiyu.associate = (models) => {
    Seiyu.belongsToMany(models.Karakter, {
      through: models.MovieSeiyu,
      foreignKey: "seiyu_id",
      otherKey: "karakter_id",
      as: "karakter"
    });
    Seiyu.belongsToMany(models.Movie, {
      through: models.MovieSeiyu,
      foreignKey: "seiyu_id",
      otherKey: "movie_id",
      as: "film"
    });
  };

  return Seiyu;
};
