// models/Seiyu.js
module.exports = (sequelize, DataTypes) => {
  const Seiyu = sequelize.define(
    "seiyu",
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, },
      name: { type: DataTypes.STRING(255), allowNull: false,
        validate: {
          notEmpty: { msg: "Nama tidak boleh kosong" },
        },
      },
      birthday: { type: DataTypes.DATEONLY, allowNull: false,
        validate: {
          isDate: { msg: "Format tanggal tidak valid (YYYY-MM-DD)" },
        },
      },
      bio: DataTypes.TEXT,
      website_url: DataTypes.STRING(255),
      instagram_url: DataTypes.STRING(255),
      twitter_url: DataTypes.STRING(255),
      youtube_url: DataTypes.STRING(255),
      profile_url: DataTypes.STRING(255),
      delete_hash: DataTypes.STRING(255),
    },
    {
      tableName: "seiyu",
      timestamps: false,
    }
  );


  return Seiyu;
};
