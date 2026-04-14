const { verifyJWT } = require("../utils");
const CustomAPIError = require("../errors");
const UserModel = require("../models/User");

const authenticateUser = async (req, res, next) => {
  try {
    const { accessToken } = req.signedCookies;

    if (!accessToken) {
      throw new CustomAPIError.UnauthenticatedError("Authentication Failed");
    }

    const userPayload = verifyJWT(accessToken, process.env.JWT_SECRET);

    // Check if user is blocked
    const user = await UserModel.findById(userPayload.userId);
    if (user && user.isBlocked) {
      throw new CustomAPIError.UnauthenticatedError('Your account has been blocked by admin. Contact administration.');
    }

    req.user = userPayload;

    next();
  } catch (error) {
    if (error instanceof CustomAPIError.UnauthenticatedError) throw error;
    throw new CustomAPIError.UnauthenticatedError("Authentication Failed");
  }
};

const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      throw new CustomAPIError.UnauthorizedError(
        'Unauthorized to access this route'
      );
    }
    next();
  };
};

module.exports = { authenticateUser, authorizeRoles };
