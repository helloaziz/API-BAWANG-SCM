const { NotFoundError, BadRequestError } = require("../../errors");
const { User } = require("../../models");
const { EMAIL_STATUS } = require("../../utils/enum");
const { StatusCodes } = require("http-status-codes");
const { Op } = require("sequelize");

const updateBio = async (req, res, next) => {
  try {
    const user = req.user;

    const { first_name, last_name, email, location, address, phone_number } =
      req.body;

    const checkUser = await User.findOne({ email: user.email });
    if (checkUser.status === EMAIL_STATUS.INACTIVE) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        status: false,
        message: "Email tidak aktif!",
      });
    }
    if (!checkUser) {
      throw new NotFoundError("User tidak ada!");
    }

    const checkMobile = await User.findOne({
      where: { phone_number, id: { [Op.ne]: user.id } },
    });

    const checkEmail = await User.findOne({
      where: { email, id: { [Op.ne]: user.id } },
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
      },
      { where: { id: user.id } }
    );

    return res.status(StatusCodes.OK).json({
      status: true,
      message: "Success update data!",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { updateBio };
