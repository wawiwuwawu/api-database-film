// models/Staff.js
module.exports = (sequelize, DataTypes) => {
  const Staff = sequelize.define(
    "staff",
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, },
      name: { type: DataTypes.STRING(255), allowNull: false,
        validate: {
          notEmpty: {
            msg: "Nama tidak boleh kosong",
          },
        },
      },
      birthday: { type: DataTypes.DATEONLY, allowNull: false,
        validate: {
          isDate: {
            msg: "Format tanggal tidak valid (YYYY-MM-DD)",
          },
        },
      },
      role: { type: DataTypes.ENUM("Director", "Producer", "Staff"), allowNull: false,
        validate: {
          isIn: {
            args: [["Director", "Producer", "Staff"]],
            msg: "Role harus Director, Producer, atau Staff",
          },
        },
      },
      bio: {
        type: DataTypes.TEXT,
      },
      profile_url: { type: DataTypes.STRING(255), },
      delete_hash: {
        type: DataTypes.STRING(255),
      },
    },
    {
      tableName: "staff",
      timestamps: false,
    }
  );

  // Staff.associate = (models) => {
  //   Staff.belongsToMany(models.Movie, { through: models.MovieStaff, foreignKey: "staff_id", otherKey: "movie_id", as: "movie", });
  // };

  return Staff;
};
