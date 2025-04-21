// models/Karakter.js
const Karakter = sequelize.define('karakter', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    nama: DataTypes.STRING,
    bio: DataTypes.TEXT
  });