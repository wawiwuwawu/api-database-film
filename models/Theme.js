module.exports = (sequelize, DataTypes) => {
  const Theme = sequelize.define(
    "theme",
    {
      nama: DataTypes.STRING
    },
    {
      tableName: "theme",
      timestamps: false
    }
  );

  return Theme;
};
