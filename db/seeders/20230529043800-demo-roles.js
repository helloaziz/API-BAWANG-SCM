"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert(
      "Roles",
      [
        {
          name: "ADMIN",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "PETANI",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "PENGEPUL",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "RETAILER",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "BUYER",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      {}
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("Roles", null, {});
  },
};
