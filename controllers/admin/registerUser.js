const { User } = require("../models");
const { BadRequestError } = require("../errors");
const bcrypt = require("bcrypt");
const Validator = require("fastest-validator");
const v = new Validator();

const register = async (req) => {
  const {
    wallet_address,
    first_name,
    last_name,
    email,
    location,
    address,
    phone_number,
    role_id = 3,
  } = req.body;
  const schema = {
    email: { type: "email", label: "Email Address" },
    password: { type: "string", min: 6 },
  };

  const check = await v.compile(schema);

  const validate = check({
    email: `${email}`,
    password: `${password}`,
  });

  if (validate.length > 0) {
    throw new BadRequestError(
      "Email tidak valid / Password minimal 6 karakter"
    );
  }

  if (password !== confirm_password) {
    throw new BadRequestError(`Password doesn't match`);
  }

  const userExist = await User.findOne({ where: { email, phone_number } });

  if (userExist) {
    throw new BadRequestError("User sudah terdaftar!");
  }

  const passwordHashed = await bcrypt.hash(email, 10);

  const result = await User.create({
    wallet_address,
    first_name,
    last_name,
    email,
    location,
    address,
    phone_number,
    password: passwordHashed,
    role_id,
  });

  return result;
};

module.exports = { register };
