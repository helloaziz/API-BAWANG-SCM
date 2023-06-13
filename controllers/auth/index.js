const { User, Role } = require("../../models");
const { StatusCodes } = require("http-status-codes");
const { BadRequestError, NotFoundError } = require("../../errors");
const jwt = require("jsonwebtoken");
const { JWT_SECRET_KEY } = process.env;
const bcrypt = require("bcrypt");
const Validator = require("fastest-validator");
const { ROLES, EMAIL_STATUS } = require("../../utils/enum");
const v = new Validator();
const { Op } = require("sequelize");
const sendEmail = require("../../utils/mailer/sendEmail");
const templateHtml = require("../../utils/mailer/templateHtml");

function generateOTP(len) {
  var digits = "0123456789";
  let OTP = "";
  for (let i = 0; i < len; i++) {
    OTP += digits[Math.floor(Math.random() * 10)];
  }
  return OTP;
}

const sendingEmail = async (user) => {
  const payload = {
    id: user.id,
    email: user.email,
  };
  const token = jwt.sign(payload, JWT_SECRET_KEY, { expiresIn: "900s" });
  const link = `http://localhost:3000/auth/reset-password?token=${token}`;
  const htmlEmail = await templateHtml("forgot-password.ejs", {
    email: user.email,
    link: link,
  });
  await sendEmail(user.email, "Reset Password", htmlEmail);
};

const sendOTP = async (otp, first_name, last_name, email) => {
  const htmlEmail = await templateHtml("otp.ejs", {
    email: email,
    first_name: first_name,
    last_name: last_name,
    otp: otp,
  });
  await sendEmail(email, "OTP", htmlEmail);
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
    if (
      checkRole.name !== ROLES.PENGEPUL &&
      checkRole.name !== ROLES.RETAILER
    ) {
      throw new BadRequestError("Hanya PENGEPUL & RETAILER diperbolehkan!");
    }

    const passwordHashed = await bcrypt.hash(password, 10);
    const createOTP = generateOTP(4);

    const result = await User.create({
      wallet_address,
      first_name,
      last_name,
      email,
      phone_number,
      password: passwordHashed,
      role_id,
      otp: createOTP,
      status: EMAIL_STATUS.INACTIVE,
    });

    const payload = {
      phone_number: result.hone_number,
      email: result.email,
      otp: result.otp,
      role_id: result.role_id,
      status: result.status,
    };

    const token = jwt.sign(payload, JWT_SECRET_KEY);

    sendOTP(createOTP, result.first_name, result.last_name, result.email);

    return res.status(StatusCodes.CREATED).json({
      status: true,
      message: "Success create user!",
      data: {
        first_name: result.first_name,
        last_name: result.last_name,
        email: result.email,
        role_id: result.role_id,
        token: token,
      },
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, phone_number, password } = req.body;

    let where = {};

    if (email) {
      const schema = {
        email: { type: "email" },
      };
      const check = await v.compile(schema);

      const validate = check({ email: `${email}` });

      if (validate.length > 0) {
        throw new BadRequestError("Email tidak valid!");
      }
      where = {
        email,
      };
    } else {
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
      where = {
        phone_number,
      };
    }

    const user = await User.findOne({
      where,
      include: [
        {
          model: Role,
          as: "role",
        },
      ],
    });

    if (!user) {
      throw new NotFoundError("Invalid credentials!");
    }

    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      throw new BadRequestError("Invalid credentials!");
    }

    const payload = {
      id: user.id,
      phone_number: user.phone_number,
      email: user.email,
      role: user.role.name,
      status: user.status,
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
      return res.status(StatusCodes.BAD_REQUEST).json({
        status: false,
        message: "Email tidak valid!",
      });
    }

    const findUser = await User.findOne({ where: { email } });

    if (!findUser) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        status: false,
        message: "Email tidak ditemukan!",
      });
    }

    sendingEmail(findUser);
    return res.status(StatusCodes.OK).json({
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
      return res.status(StatusCodes.BAD_REQUEST).json({
        status: false,
        message: "Password at least 6 characters!",
        data: null,
      });
    }

    const validUser = jwt.verify(token, JWT_SECRET_KEY);

    if (!validUser) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
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

    return res.status(StatusCodes.OK).json({
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
      return res.status(StatusCodes.OK).json({
        status: false,
        message: "Password minimal 6 karakter!",
        data: null,
      });
    }

    const existUser = await User.findOne({ where: { id: user.id } });

    if (newPassword != confirmNewPassword) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        status: false,
        message: "Password Doesn't Match",
        data: null,
      });
    }
    const correct = await bcrypt.compare(oldPassword, existUser.password);
    if (!correct) {
      return res.status(StatusCodes.BAD_REQUEST).json({
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
      return res.status(StatusCodes.BAD_REQUEST).json({
        status: false,
        message: "Something Went Wrong",
        data: null,
      });
    }

    return res.status(StatusCodes.OK).json({
      status: true,
      message: "Password Updated!",
      data: passwordUpdated,
    });
  } catch (err) {
    next(err);
  }
};

const activateAccount = async (req, res, next) => {
  try {
    const user = req.user;
    const { otp } = req.body;

    const checkUser = await User.findOne({ where: { email: user.email } });

    if (otp !== checkUser.otp) {
      throw new BadRequestError("OTP salah!");
    }

    await User.update(
      {
        status: EMAIL_STATUS.ACTIVE,
      },
      { where: { email: user.email } }
    );

    const getNewUser = await User.findOne({
      where: { email: user.email },
      include: [{ model: Role, as: "role" }],
    });
    if (getNewUser.status === EMAIL_STATUS.INACTIVE) {
      throw new BadRequestError("Email belum aktif!");
    }

    const payload = {
      id: getNewUser.id,
      phone_number: getNewUser.phone_number,
      email: getNewUser.email,
      role: getNewUser.role.name,
    };

    const token = jwt.sign(payload, JWT_SECRET_KEY);
    return res.status(StatusCodes.OK).json({
      status: true,
      message: "Success!",
      data: {
        token: token,
      },
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
  activateAccount,
};
