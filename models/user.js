"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      User.hasMany(models.Product, {
        foreignKey: "user_id",
        as: "product",
      });
      User.hasMany(models.Transaction_order, {
        foreignKey: "user_id",
        as: "transaction",
      });
      User.belongsTo(models.Role, {
        foreignKey: "role_id",
        as: "role",
      });
    }
  }
  User.init(
    {
      wallet_address: DataTypes.STRING,
      first_name: DataTypes.STRING,
      last_name: DataTypes.STRING,
      email: DataTypes.STRING,
      location: DataTypes.STRING,
      address: DataTypes.STRING,
      phone_number: DataTypes.STRING,
      password: DataTypes.STRING,
      role_id: DataTypes.INTEGER,
      otp: DataTypes.STRING,
      status: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "User",
    }
  );
  return User;
};
