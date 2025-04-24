// models/User.js
const { DataTypes } = require("sequelize");
const bcrypt = require("bcryptjs"); // Untuk hashing password

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    "User",
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
      email: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: {
          name: "email",
          msg: "Email sudah terdaftar",
        },
        validate: {
          isEmail: { msg: "Format email tidak valid" },
        },
      },
      password: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: {
          notEmpty: { msg: "Password tidak boleh kosong" },
          len: {
            args: [6, 255],
            msg: "Password minimal 6 karakter",
          },
        },
      },
      role: {
        type: DataTypes.ENUM("customer", "admin"),
        defaultValue: "customer",
        allowNull: false,
      },
      bio: DataTypes.TEXT,
      profile_url: {
        type: DataTypes.STRING(255),
        validate: { 
          isURL: { 
            msg: "URL profil tidak valid",
            protocols: ["http", "https"],
          },
        },
      },
      delete_hash: DataTypes.STRING(255),
      created_at: {
        type: DataTypes.DATE,
        defaultValue: sequelize.literal("CURRENT_TIMESTAMP"),
      },
    },
    {
      tableName: "users", // Nama tabel di database
      timestamps: false, // Nonaktifkan createdAt dan updatedAt otomatis
      underscored: true, // Konversi camelCase ke snake_case
      hooks: {
        beforeCreate: async (user) => {
          // Hash password sebelum disimpan
          if (user.password) {
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(user.password, salt);
          }
        },
        beforeUpdate: async (user) => {
          // Hash password jika diupdate
          if (user.changed("password")) {
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(user.password, salt);
          }
        },
      },
    }
  );

  // Method untuk verifikasi password
  User.prototype.verifyPassword = async function (password) {
    return await bcrypt.compare(password, this.password);
  };

  // Relasi (contoh: 1 user punya banyak review)
  User.associate = (models) => {
    User.hasMany(models.Review, {
      foreignKey: "user_id",
      as: "reviews",
    });
  };

  return User;
};