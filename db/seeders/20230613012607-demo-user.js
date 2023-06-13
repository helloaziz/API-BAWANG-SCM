"use strict";
const bcrypt = require("bcrypt");
const { PASSWORD_DEFAULT_ADMIN } = process.env;

module.exports = {
  async up(queryInterface, Sequelize) {
    const encrypted = await bcrypt.hash(PASSWORD_DEFAULT_ADMIN, 10);
    await queryInterface.bulkInsert(
      "Users",
      [
        {
          wallet_address: "-",
          first_name: "Admin",
          last_name: "Bawang",
          email: "noreplybawang@gmail.com",
          location: "Semarang",
          address: "Semarang, Indonesia",
          phone_number: "085329447621",
          password: encrypted,
          role_id: 1,
          otp: "-",
          status: "ACTIVE",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      {}
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("Users", null, {});
  },
};
