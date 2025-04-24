// models/MovieSeiyu.js
module.exports = (sequelize, DataTypes) => {
    const MovieSeiyu = sequelize.define(
      "movie_seiyu",
      {
        movie_id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          references: {
            model: "movies",
            key: "id"
          }
        },
        seiyu_id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          references: {
            model: "seiyu",
            key: "id"
          }
        },
        karakter_id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          references: {
            model: "karakter",
            key: "id"
          }
        },
      },
      {
        tableName: "movie_seiyu",
        timestamps: false,
        underscored: true
      }
    );
  
    // (Opsional) jika Anda ingin method atau asosiasi khusus di sini:
    MovieSeiyu.associate = (models) => {
      // Biasanya junction model tidak perlu belongsToMany
      MovieSeiyu.belongsTo(models.Movie, { foreignKey: "movie_id", as: "movie" });
      MovieSeiyu.belongsTo(models.Seiyu, { foreignKey: "seiyu_id", as: "seiyu" });
      MovieSeiyu.belongsTo(models.Karakter, { foreignKey: "karakter_id", as: "karakter" });
    };
  
    return MovieSeiyu;
  };
  