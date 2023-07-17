"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Product extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Product.belongsTo(models.User, {
        foreignKey: "user_id",
        as: "user",
      });
      Product.belongsTo(models.Lahan, {
        foreignKey: "lahan_id",
        as: "lahan",
      });
    }
  }
  Product.init(
    {
      user_id: DataTypes.INTEGER,
      lahan_id: DataTypes.INTEGER,
      name: DataTypes.STRING,
      description: DataTypes.TEXT,
      location: DataTypes.STRING,
      weight: DataTypes.DOUBLE,
      price: DataTypes.DOUBLE,
      stock: DataTypes.INTEGER,
      status: DataTypes.STRING,
      deleted: DataTypes.STRING,
      deletedAt: DataTypes.DATE,
    },
    {
      sequelize,
      modelName: "Product",
    }
  );
  return Product;
};
