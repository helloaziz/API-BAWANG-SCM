"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Transaction_order extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Transaction_order.hasOne(models.Transaction_order_detail, {
        foreignKey: "transaction_order_id",
        as: "detail",
      });
      Transaction_order.belongsTo(models.Payment, {
        foreignKey: "payment_id",
        as: "payment",
      });
      Transaction_order.belongsTo(models.User, {
        foreignKey: "user_id",
        as: "user",
      });
    }
  }
  Transaction_order.init(
    {
      user_id: DataTypes.INTEGER,
      product_id: DataTypes.INTEGER,
      payment_id: DataTypes.INTEGER,
      invoice_number: DataTypes.STRING,
      qty: DataTypes.INTEGER,
      note: DataTypes.TEXT,
      status_order: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "Transaction_order",
    }
  );
  return Transaction_order;
};
