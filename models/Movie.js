module.exports = (sequelize, DataTypes) => {
  const Movie = sequelize.define(
    "movie",
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      judul: { type: DataTypes.STRING(255), allowNull: false,
        validate: {
          notEmpty: { msg: "Judul tidak boleh kosong" },
          len: { args: [2, 255], msg: "Judul harus 2-255 karakter" }
        }
      },
      sinopsis: { type: DataTypes.TEXT, validate: { notEmpty: { msg: "Sinopsis tidak boleh kosong" } } },
      tahun_rilis: { type: DataTypes.INTEGER,allowNull: false,
        validate: {
          isYear(value) {
            const currentYear = new Date().getFullYear();
            if (value < 1900 || value > currentYear + 2) {
              throw new Error(`Tahun rilis harus 1900-${currentYear + 2}`);
            }
          }
        }
      },
      type: {
        type: DataTypes.ENUM("TV", "Movie", "ONA", "OVA"),
        allowNull: false,
        validate: { notEmpty: { msg: "Tipe film harus diisi" } }
      },
      episode: {
        type: DataTypes.INTEGER,
        validate: { min: { args: [1], msg: "Episode minimal 1" } }
      },
      durasi: {
        type: DataTypes.INTEGER,
        validate: { min: { args: [1], msg: "Durasi minimal 1 menit" } }
      },
      rating: {
        type: DataTypes.ENUM("G", "PG", "PG-13", "R", "NC-17"),
        allowNull: false
      },
      cover_url: DataTypes.STRING(255),
      delete_hash: DataTypes.STRING(255),
      created_at: { type: DataTypes.DATE, defaultValue: sequelize.literal("CURRENT_TIMESTAMP") }
    },
    {
      tableName: "movies",
      timestamps: false,
      underscored: true,
      paranoid: false,
      hooks: {
        beforeValidate: (movie) => {
          if (movie.tahun_rilis) {
            movie.tahun_rilis = parseInt(movie.tahun_rilis);
          }
        }
      },
      indexes: [
        { name: "unique_judul", fields: ["judul"], unique: true },
        { name: "index_tahun_rilis", fields: ["tahun_rilis"] }
      ]
    }
  );

  // Movie.associate = (models) => {
  //   Movie.belongsToMany(models.Genre, { through: "movie_genre", foreignKey: "movie_id", otherKey: "genre_id", as: "genre" });
  //   Movie.belongsToMany(models.Staff, { through: "movie_staff", foreignKey: "movie_id", otherKey: "staff_id", as: "staff" });
  //   Movie.belongsToMany(models.Theme, { through: "movie_themes", foreignKey: "movie_id", otherKey: "theme_id", as: "themes" });
  //   Movie.belongsToMany(models.Seiyu, { through: "movie_seiyu", foreignKey: "movie_id", otherKey: "seiyu_id", as: "pengisi_suara" });
  //   Movie.belongsToMany(models.Karakter, { through: "movie_seiyu", foreignKey: "movie_id", otherKey: "karakter_id", as: "karakter" });
  // };

  return Movie;
};
