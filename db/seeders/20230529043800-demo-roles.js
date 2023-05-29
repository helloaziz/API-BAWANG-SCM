"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert(
      "Roles",
      [
        {
          id: 1,
          name: "ADMIN",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 2,
          name: "PETANI",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 3,
          name: "PENGEPUL",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 4,
          name: "RETAILER",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 5,
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
