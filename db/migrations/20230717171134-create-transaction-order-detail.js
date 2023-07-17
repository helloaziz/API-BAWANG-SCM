'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Transaction_order_details', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      transaction_order_id: {
        type: Sequelize.INTEGER
      },
      total_weight: {
        type: Sequelize.DOUBLE
      },
      total: {
        type: Sequelize.DOUBLE
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Transaction_order_details');
  }
};