const { User, Role } = require("../../models");
const { StatusCodes } = require("http-status-codes");
const { BadRequestError, NotFoundError } = require("../../errors");
const bcrypt = require("bcrypt");
const Validator = require("fastest-validator");
const { ROLES } = require("../../utils/enum");
const v = new Validator();

const registerBuyer = async (req, res, next) => {
  const {
    wallet_address,
    role_id,
    first_name,
    last_name,
    email,
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

  const userExist = await User.findOne({ where: { email } });
  if (userExist) {
    throw new BadRequestError("Email sudah terdaftar!");
  }

  if (password !== confirm_password) {
    throw new BadRequestError(`Password doesn't match`);
  }

  const checkRole = await Role.findOne({ where: { id: role_id } });
  if (!checkRole) {
    throw new NotFoundError("Role tidak ada!");
  }
  if (checkRole.name !== ROLES.RETAILER || checkRole.name !== ROLES.BUYER) {
    throw new BadRequestError("Hanya Retailer & Buyer diperbolehkan!");
  }

  const passwordHashed = await bcrypt.hash(password, 10);

  const result = await User.create({
    wallet_address,
    first_name,
    last_name,
    email,
    password: passwordHashed,
    role_id,
  });

  return res.status(StatusCodes.CREATED).json({
    status: true,
    message: "Success create user!",
    data: {
      first_name: result.first_name,
      last_name: result.last_name,
      email: result.email,
      role_id: result.role_id,
    },
  });
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const schema = {
      email: { type: "email", label: "Email Address" },
    };
    const check = await v.compile(schema);

    const validate = check({ email: `${email}` });

    if (validate.length > 0) {
      throw new BadRequestError("Email tidak valid");
    }

    const user = await User.findOne({
      where: { email },
      include: [
        {
          model: Role,
          as: "role",
        },
      ],
    });

    if (!user) {
      throw new NotFoundError("Email atau password salah");
    }

    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      throw new BadRequestError("Email atau password salah");
    }

    const payload = {
      id: user.id,
      email: user.email,
      role: user.role.role,
    };

    const token = jwt.sign(payload, JWT_SECRET_KEY);

    return res.status(StatusCodes.OK).json({
      status: true,
      message: "Success create addresss!",
      data: {
        email: email,
        token: token,
      },
    });
  } catch (error) {
    next(error);
  }
};

const whoami = async (req, res, next) => {
  try {
    const user = req.user;
    return res.status(StatusCodes.OK).json({
      status: true,
      message: "Success",
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { login, whoami, registerBuyer };
