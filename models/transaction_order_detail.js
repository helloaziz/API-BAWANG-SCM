"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Transaction_order_detail extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Transaction_order_detail.hasOne(models.Transaction_order, {
        foreignKey: "transaction_order_id",
        as: "transaction",
      });
    }
  }
  Transaction_order_detail.init(
    {
      transaction_order_id: DataTypes.INTEGER,
      total_weight: DataTypes.DOUBLE,
      total: DataTypes.DOUBLE,
    },
    {
      sequelize,
      modelName: "Transaction_order_detail",
    }
  );
  return Transaction_order_detail;
};
