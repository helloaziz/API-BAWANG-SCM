const { User, Role } = require("../../models");
const { BadRequestError, NotFoundError } = require("../../errors");
const { ROLES, EMAIL_STATUS } = require("../../utils/enum");
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
      email: { type: "email" },
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

    const phoneSchema = {
      phone_number: {
        type: "string",
        pattern: /^0\d{9,12}$/,
        max: 13,
      },
    };

    const checkPhone = await v.compile(phoneSchema);

    const validatePhone = checkPhone({
      phone_number: `${phone_number}`,
    });

    if (validatePhone.length > 0) {
      throw new BadRequestError("Format nomor telepon salah!");
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
      status: EMAIL_STATUS.ACTIVE,
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

const index = async (req, res, next) => {
  try {
    const { email, phone_number } = req.query;

    let where = {};

    if (email) {
      where = {
        email: email,
      };
    } else if (phone_number) {
      where = {
        phone_number: phone_number,
      };
    }

    const result = await User.findAll({
      where,
      include: [{ model: Role, as: "role" }],
    });

    return res.status(StatusCodes.OK).json({
      status: true,
      message: "Success get users",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const show = async (req, res, next) => {
  try {
    const { user_id } = req.params;

    const result = await User.findOne({
      where: { id: user_id },
      include: [{ model: Role, as: "role" }],
    });

    if (!result) {
      throw new NotFoundError("User tidak ditemukan!");
    }

    return res.status(StatusCodes.OK).json({
      status: true,
      message: "Success get user",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const update = async (req, res, next) => {
  try {
    const { user_id } = req.params;
    const {
      first_name,
      last_name,
      email,
      location,
      address,
      phone_number,
      role_id,
    } = req.body;

    const schema = {
      email: { type: "email" },
    };

    const check = await v.compile(schema);

    const validate = check({
      email: `${email}`,
    });

    if (validate.length > 0) {
      throw new BadRequestError("Email tidak valid!");
    }

    const phoneSchema = {
      phone_number: {
        type: "string",
        pattern: /^0\d{9,12}$/,
        max: 13,
      },
    };

    const checkPhone = await v.compile(phoneSchema);

    const validatePhone = checkPhone({
      phone_number: `${phone_number}`,
    });

    if (validatePhone.length > 0) {
      throw new BadRequestError("Format nomor telepon salah!");
    }

    const checkUser = await User.findOne({ where: { id: user_id } });
    if (!checkUser) {
      throw new NotFoundError("User tidak ada!");
    }

    const checkMobile = await User.findOne({
      where: { phone_number, id: { [Op.ne]: user_id } },
    });

    const checkEmail = await User.findOne({
      where: { email, id: { [Op.ne]: user_id } },
    });

    if (checkMobile || checkEmail) {
      throw new BadRequestError("Email/nomer telepon sudah terdaftar");
    }

    const result = await User.update(
      {
        first_name,
        last_name,
        email,
        location,
        address,
        phone_number,
        role_id,
      },
      { where: { id: user_id } }
    );

    return res.status(StatusCodes.OK).json({
      status: true,
      message: "Success update user",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { registerPatner, registerAdmin, index, show, update };
