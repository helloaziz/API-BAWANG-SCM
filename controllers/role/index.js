const { Role } = require("../../models");
const { StatusCodes } = require("http-status-codes");
const { BadRequestError, NotFoundError } = require("../../errors");

const create = async (req, res, next) => {
  try {
    const { name } = req.body;

    const checkDuplicate = await Role.findOne({ where: { name } });
    if (checkDuplicate) {
      throw new BadRequestError("Role sudah ada!");
    }

    const result = await Role.create({ name });

    return res.status(StatusCodes.CREATED).json({
      status: true,
      message: "Success get roles!",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const index = async (req, res, next) => {
  try {
    const result = await Role.findAll({});

    return res.status(StatusCodes.OK).json({
      status: true,
      message: "Success get roles!",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const edit = async (req, res, next) => {
  try {
    const { role_id } = req.params;
    const { name } = req.body;

    const checkRole = await Role.findOne({ where: { id: role_id } });
    if (!checkRole) {
      throw new NotFoundError(`Tidak ada role dengan id: ${role_id}`);
    }

    const checkDuplicate = await Role.findOne({
      where: { name },
      id: { [Op.ne]: role_id },
    });
    if (checkDuplicate) {
      throw new BadRequestError(`Role sudah ada!`);
    }

    const result = await Role.update({ name }, { where: { id: role_id } });

    return res.status(StatusCodes.OK).json({
      status: true,
      message: "Success get roles!",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const show = async (req, res, next) => {
  try {
    const { role_id } = req.params;

    const result = await Role.findOne({ where: { id: role_id } });
    if (!result) {
      throw new NotFoundError(`Tidak ada role dengan id: ${role_id}`);
    }

    return res.status(StatusCodes.OK).json({
      status: true,
      message: "Success get roles!",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { index, create, edit, show };
