// models/MovieSeiyu.js
module.exports = (sequelize, DataTypes) => {
    const MovieSeiyu = sequelize.define(
      "SeiyuMovie",
      {
        movie_id: { type: DataTypes.INTEGER, primaryKey: true, references: { model: "movies", key: "id" } },
        seiyu_id: { type: DataTypes.INTEGER, primaryKey: true, references: { model: "seiyu", key: "id" } },
        karakter_id: { type: DataTypes.INTEGER, primaryKey: true, references: { model: "karakter", key: "id" } },
      },
      {
        tableName: "movie_seiyu",
        timestamps: false
      }
    );
  
    
    // MovieSeiyu.associate = (models) => {
    //   MovieSeiyu.belongsTo(models.Movie, { foreignKey: "movie_id", as: "movie" });
    //   MovieSeiyu.belongsTo(models.Seiyu, { foreignKey: "seiyu_id", as: "seiyu" });
    //   MovieSeiyu.belongsTo(models.Karakter, { foreignKey: "karakter_id", as: "karakter" });
    // };
  
    return MovieSeiyu;
  };
  