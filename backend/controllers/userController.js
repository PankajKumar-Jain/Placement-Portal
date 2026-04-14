const { StatusCodes } = require('http-status-codes');
const CustomAPIError = require('../errors');

const UserModel = require('../models/User');

const showCurrentUser = async (req, res) => {
  const userId = req?.user?.userId;

  if (userId) {
    const userData = await UserModel.findById(userId);
    if (userData._id != userId)
      throw new CustomAPIError.UnauthenticatedError('Unauthenticated error!');
  } else
    throw new CustomAPIError.UnauthenticatedError('Unauthenticated error!');

  res.status(StatusCodes.OK).json({ success: true, user: req.user });
};

const getUserById = async (req, res) => {
  const userId = req?.params?.userId;

  if (!userId) {
    throw new CustomAPIError.BadRequestError('User Id is required');
  }

  const user = UserModel.findOne({ _id: userId, role: 'user' });

  if (user) {
    return res.json({
      success: true,
      message: `User found with id: ${userId}`,
      user: user.name,
    });
  }

  return res.json({
    success: false,
    message: `No user found with id: ${userId}`,
  });
};

module.exports = {
  showCurrentUser,
  getUserById,
};
