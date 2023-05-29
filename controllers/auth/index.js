const { User } = require("../../models");
const { StatusCodes } = require("http-status-codes");
const { BadRequestError, NotFoundError } = require("../../errors");
const Validator = require("fastest-validator");
const v = new Validator();

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

module.exports = { login };
