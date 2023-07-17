"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Lahan extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Lahan.hasMany(models.Product, {
        foreignKey: "lahan_id",
        as: "product",
      });
    }
  }
  Lahan.init(
    {
      user_id: DataTypes.INTEGER,
      panjang: DataTypes.DOUBLE,
      lebar: DataTypes.DOUBLE,
      luas: DataTypes.DOUBLE,
      lng: DataTypes.DOUBLE,
      lat: DataTypes.DOUBLE,
    },
    {
      sequelize,
      modelName: "Lahan",
    }
  );
  return Lahan;
};
