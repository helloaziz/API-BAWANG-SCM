const { StatusCodes } = require("http-status-codes");
const { Product, User } = require("../../models");
const { NotFoundError } = require("../../errors");
const { Op } = require("sequelize");
const { DELETED, PRODUCT_STATUS } = require("../../utils/enum");

const create = async (req, res, next) => {
  try {
    const user = req.user;
    const { name, description, location, weight, price, stock } = req.body;

    const result = await Product.create({
      user_id: user.id,
      name,
      description,
      location,
      weight: parseFloat(weight),
      price: parseFloat(price),
      stockInt: parseInt(stock),
      deleted: DELETED.NO,
      status: PRODUCT_STATUS.ACTIVE,
    });

    return res.status(StatusCodes.CREATED).json({
      status: true,
      message: "Success Create Product!",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const edit = async (req, res, next) => {
  try {
    const { product_id } = req.params;
    const { name, description, location, weight, price, stock } = req.body;

    const checkProduct = await Product.findOne({ where: { id: product_id } });

    if (!checkProduct) {
      throw new NotFoundError(`Product tidak ada!`);
    }

    if (checkProduct.status === DELETED.YES) {
      throw new NotFoundError(`Product tidak ada!`);
    }

    const result = await Product.create(
      {
        name,
        description,
        location,
        weight: parseFloat(weight),
        price: parseFloat(price),
        stockInt: parseInt(stock),
      },
      { where: { id: product_id } }
    );

    return res.status(StatusCodes.OK).json({
      status: true,
      message: "Success Edit Product!",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const indexBuyerRetail = async (req, res, next) => {
  try {
    const { search } = req.query;

    let where = {
      deleted: DELETED.NO,
      status: PRODUCT_STATUS.ACTIVE,
    };

    if (search) {
      where = {
        ...where,
        name: {
          [Op.iLike]: `%${search}%`,
        },
      };
    }

    const result = await Product.findAll({
      where: where,
      include: [
        {
          model: User,
          as: "user",
        },
      ],
    });

    return res.status(StatusCodes.OK).json({
      status: true,
      message: "Success Get All Products!",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const index = async (req, res, next) => {
  try {
    const { search, page = 1, limit = 10 } = req.query;

    let where = {
      deleted: DELETED.NO,
    };

    if (search) {
      where = {
        ...where,
        name: {
          [Op.iLike]: `%${search}%`,
        },
      };
    }

    const pageNumber = parseInt(page);
    const limitPage = parseInt(limit);
    const offset = pageNumber * limitPage - limitPage;
    const allProducts = await Product.count();
    const totalPage = Math.ceil(allProducts / limit);

    const result = await Product.findAll({
      offset: offset,
      limit: limitPage,
      where: where,
      include: [
        {
          model: User,
          as: "user",
        },
      ],
    });

    return res.status(StatusCodes.OK).json({
      status: true,
      message: "Success Get All Products!",
      data: {
        data: result,
        pageNumber: pageNumber,
        limitPage: limitPage,
        totalRows: allProducts,
        totalPage: totalPage,
      },
    });
  } catch (error) {
    next(error);
  }
};

const show = async (req, res, next) => {
  try {
    const { product_id } = req.params;

    const result = await Product.findOne({
      where: {
        id: product_id,
        deleted: DELETED.NO,
      },
      include: [{ model: User, as: "user" }],
    });

    if (!result) {
      throw new NotFoundError(`Product tidak ada!`);
    }

    return res.status(StatusCodes.OK).json({
      status: true,
      message: "Success Get Product!",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const showBuyerRetail = async (req, res, next) => {
  try {
    const { product_id } = req.params;

    const result = await Product.findOne({
      where: {
        id: product_id,
        deleted: DELETED.NO,
        status: PRODUCT_STATUS.ACTIVE,
      },
      include: [{ model: User, as: "user" }],
    });

    if (!result) {
      throw new NotFoundError(`Product tidak ada!`);
    }

    return res.status(StatusCodes.OK).json({
      status: true,
      message: "Success Get Product!",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const destroy = async (req, res, next) => {
  try {
    const { product_id } = req.params;

    const checkProduct = await Product.findOne({
      where: { id: product_id },
    });

    if (!checkProduct) {
      throw new NotFoundError(`Product tidak ada!`);
    }

    if (checkProduct.deleted === DELETED.YES) {
      throw new NotFoundError(`Product tidak ada!`);
    }

    const result = await Product.update(
      {
        deleted: DELETED.YES,
        deletedAt: new Date(),
        status: PRODUCT_STATUS.INACTIVE,
      },
      { where: { id: product_id } }
    );

    return res.status(StatusCodes.OK).json({
      status: true,
      message: "Product berhasil dihapus!",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const status = async (req, res, next) => {
  const { product_id } = req.params;

  const checkProduct = await Product.findOne({
    where: { id: product_id },
  });

  if (!checkProduct) {
    throw new NotFoundError(`Product tidak ada!`);
  }

  if (checkProduct.deleted === DELETED.YES) {
    throw new NotFoundError(`Product tidak ada!`);
  }

  if (checkProduct.status === PRODUCT_STATUS.INACTIVE) {
    const result = await Product.update(
      { status: PRODUCT_STATUS.ACTIVE },
      { where: { id: product_id } }
    );

    return res.status(StatusCodes.OK).json({
      status: true,
      message: "Product aktif!",
      data: result,
    });
  }

  const result = await Product.update(
    { status: PRODUCT_STATUS.INACTIVE },
    { where: { id: product_id } }
  );

  return res.status(StatusCodes.OK).json({
    status: true,
    message: "Product nonaktif!",
    data: result,
  });
};

module.exports = {
  create,
  edit,
  index,
  indexBuyerRetail,
  showBuyerRetail,
  destroy,
  status,
  show,
};
