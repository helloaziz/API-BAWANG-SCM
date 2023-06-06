const { User, Role } = require("../../models");
const { StatusCodes } = require("http-status-codes");
const { BadRequestError, NotFoundError } = require("../../errors");
const jwt = require("jsonwebtoken");
const { JWT_SECRET_KEY } = process.env;
const bcrypt = require("bcrypt");
const Validator = require("fastest-validator");
const { ROLES } = require("../../utils/enum");
const v = new Validator();
const { Op } = require("sequelize");
const sendEmail = require("../../utils/mailer/sendEmail");
const templateHtml = require("../../utils/mailer/templateHtml");

const sendingEmail = async (user) => {
  const payload = {
    id: user.id,
    email: user.email,
  };
  const token = jwt.sign(payload, JWT_SECRET_KEY, { expiresIn: "900s" });
  const link = `localhost:3000/auth/resetpassword?token=${token}`;
  const htmlEmail = await templateHtml("forgot-password.ejs", {
    email: user.email,
    link: link,
  });
  await sendEmail(user.email, "Reset Password", htmlEmail);
};

const registerBuyer = async (req, res, next) => {
  try {
    const {
      wallet_address,
      role_id,
      first_name,
      last_name,
      email,
      phone_number,
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

    if (password !== confirm_password) {
      throw new BadRequestError(`Password doesn't match`);
    }

    const checkRole = await Role.findOne({ where: { id: role_id } });
    if (!checkRole) {
      throw new NotFoundError("Role tidak ada!");
    }
    if (checkRole.name !== ROLES.RETAILER && checkRole.name !== ROLES.BUYER) {
      throw new BadRequestError("Hanya Retailer & Buyer diperbolehkan!");
    }

    const passwordHashed = await bcrypt.hash(password, 10);

    const result = await User.create({
      wallet_address,
      first_name,
      last_name,
      email,
      phone_number,
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
  } catch (error) {
    next(error);
  }
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
      role: user.role.name,
    };

    const token = jwt.sign(payload, JWT_SECRET_KEY);

    return res.status(StatusCodes.OK).json({
      status: true,
      message: "Success login!",
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

const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const schema = {
      email: { type: "email", label: "Email Address" },
    };
    const check = await v.compile(schema);
    const validate = check({ email: `${email}` });

    if (validate.length > 0) {
      return res.status(400).json({
        status: false,
        message: "Email tidak valid!",
        data: null,
      });
    }

    const findUser = await User.findOne({ where: { email } });

    if (!findUser) {
      return res.status(400).json({
        status: false,
        message: "Email tidak fitemukan!",
      });
    }

    sendingEmail(findUser);
    return res.status(200).json({
      status: true,
      message: "Harap cek email untuk reset password!",
      data: findUser.email,
    });
  } catch (err) {
    next(err);
  }
};

const resetPassword = async (req, res, next) => {
  try {
    const { newPass, confirmNewPass } = req.body;
    const { token } = req.query;
    const schema = {
      newPass: { type: "string", min: 6 },
      confirmNewPass: { type: "string", min: 6 },
    };
    const check = await v.compile(schema);
    const validate = check({
      newPass: `${newPass}`,
      confirmNewPass: `${confirmNewPass}`,
    });

    if (validate.length > 0) {
      return res.status(400).json({
        status: false,
        message: "Password at least 6 characters!",
        data: null,
      });
    }

    const validUser = jwt.verify(token, JWT_SECRET_KEY);

    if (!validUser) {
      return res.status(401).json({
        status: false,
        message: "Invalid token!",
      });
    }

    const findUser = await User.findOne({ where: { id: validUser.id } });

    if (newPass !== confirmNewPass) {
      return res.status(400).json({
        status: false,
        message: "Password not match!",
      });
    }

    const encryptedPass = await bcrypt.hash(newPass, 10);

    await User.update(
      { password: encryptedPass },
      { where: { id: findUser.id } }
    );

    return res.status(200).json({
      status: true,
      message: "success change password",
      data: {
        id: findUser.id,
        email: findUser.email,
      },
    });
  } catch (err) {
    next(err);
  }
};

const changePassword = async (req, res, next) => {
  try {
    const user = req.user;
    const { oldPassword, newPassword, confirmNewPassword } = req.body;
    const schema = {
      oldPassword: { type: "string", min: 6 },
      newPassword: { type: "string", min: 6 },
      confirmNewPassword: { type: "string", min: 6 },
    };
    const check = await v.compile(schema);
    const validate = check({
      oldPassword: `${oldPassword}`,
      newPassword: `${newPassword}`,
      confirmNewPassword: `${confirmNewPassword}`,
    });

    if (validate.length > 0) {
      return res.status(400).json({
        status: false,
        message: "Password minimal 6 karakter!",
        data: null,
      });
    }

    const existUser = await User.findOne({ where: { id: user.id } });

    if (newPassword != confirmNewPassword) {
      return res.status(400).json({
        status: false,
        message: "Password Doesn't Match",
        data: null,
      });
    }
    const correct = await bcrypt.compare(oldPassword, existUser.password);
    if (!correct) {
      return res.status(400).json({
        status: false,
        message: "Old Password Doesn't Match!",
        data: null,
      });
    }

    const passwordHashed = await bcrypt.hash(newPassword, 10);
    const passwordUpdated = await User.update(
      { password: passwordHashed },
      { where: { id: user.id } }
    );
    if (!passwordUpdated) {
      return res.status(400).json({
        status: false,
        message: "Something Went Wrong",
        data: null,
      });
    }

    return res.status(200).json({
      status: true,
      message: "Password Updated!",
      data: passwordUpdated,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  login,
  whoami,
  registerBuyer,
  resetPassword,
  changePassword,
  forgotPassword,
};
