module.exports = (sequelize, DataTypes) => {
  const Genre = sequelize.define(
    "genre",
    {
      nama: { type: DataTypes.STRING, allowNull: false }
    },
    {
      tableName: "genre",
      timestamps: false
    }
  );


  return Genre;
};
