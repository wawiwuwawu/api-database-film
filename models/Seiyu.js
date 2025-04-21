// models/Seiyu.js
const Seiyu = sequelize.define('seiyu', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    nama: DataTypes.STRING,
    birthday: DataTypes.DATEONLY,
    bio: DataTypes.TEXT,
    website_url: DataTypes.STRING,
    instagram_url: DataTypes.STRING,
    twitter_url: DataTypes.STRING,
    youtube_url: DataTypes.STRING,
    profile_url: DataTypes.STRING
  });