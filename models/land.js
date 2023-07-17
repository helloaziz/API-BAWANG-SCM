"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Land extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Land.hasMany(models.Product, {
        foreignKey: "land_id",
        as: "product",
      });
      Land.belongsTo(models.User, {
        foreignKey: "user_id",
        as: "user",
      });
    }
  }
  Land.init(
    {
      user_id: DataTypes.INTEGER,
      length: DataTypes.DOUBLE,
      width: DataTypes.DOUBLE,
      area: DataTypes.DOUBLE,
      longtitude: DataTypes.DOUBLE,
      latitude: DataTypes.DOUBLE,
    },
    {
      sequelize,
      modelName: "Land",
    }
  );
  return Land;
};
