const { User, Role } = require("../../models");
const { BadRequestError, NotFoundError } = require("../../errors");
const { ROLES } = require("../../utils/enum");
const bcrypt = require("bcrypt");
const Validator = require("fastest-validator");
const { StatusCodes } = require("http-status-codes");
const v = new Validator();
const { PASSWORD_DEFAULT } = process.env;
const { Op } = require("sequelize");

const registerPatner = async (req, res, next) => {
  try {
    const {
      wallet_address,
      first_name,
      last_name,
      email,
      location,
      address,
      phone_number,
      role_id,
    } = req.body;
    const schema = {
      email: { type: "email", label: "Email Address" },
    };

    const check = await v.compile(schema);

    const validate = check({
      email: `${email}`,
    });

    if (validate.length > 0) {
      throw new BadRequestError(
        "Email tidak valid / Password minimal 6 karakter"
      );
    }

    const userExist = await User.findOne({
      where: {
        [Op.or]: [{ email }, { phone_number }],
      },
    });

    if (userExist) {
      throw new BadRequestError("Email/Nomer telepon sudah terdaftar!");
    }

    const checkRoles = await Role.findOne({ where: { id: role_id } });
    if (!checkRoles) {
      throw new NotFoundError("Role tidak tersedia!");
    }
    console.log(checkRoles.name);
    console.log(ROLES.PETANI);
    if (
      checkRoles.name !== ROLES.PETANI &&
      checkRoles.name !== ROLES.PENGEPUL
    ) {
      throw new BadRequestError(
        "Hanya role Petani & Pengepul yang dibolehkan!"
      );
    }

    const password = PASSWORD_DEFAULT;

    const passwordHashed = await bcrypt.hash(password, 10);

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

    return res.status(StatusCodes.OK).json({
      status: true,
      message: "Success create patner",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const registerAdmin = async (req, res, next) => {
  try {
    const {
      wallet_address,
      first_name,
      last_name,
      email,
      location,
      address,
      phone_number,
      role_id,
      password,
      confirm_password,
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

    const passwordHashed = await bcrypt.hash(password, 10);

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

    return res.status(StatusCodes.OK).json({
      status: true,
      message: "Success create admin",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { registerPatner, registerAdmin };
