const jwt = require('jsonwebtoken');

const createUserToken = (user) => {
  const {
    _id: userId,
    name,
    role,
    email,
    courseId,
    batchId,
    departmentId,
    companyId,
    forcePasswordReset,
  } = user;

  return {
    userId,
    name,
    role,
    email,
    courseId,
    batchId,
    departmentId,
    companyId,
    forcePasswordReset: Boolean(forcePasswordReset),
  };
};

const createJWT = (userToken) => jwt.sign(userToken, process.env.JWT_SECRET);

const verifyJWT = (cookie) => jwt.verify(cookie, process.env.JWT_SECRET);

const attachCookieToResponse = (res, userToken) => {
  const accessTokenJWT = createJWT(userToken);

  const oneDay = 24 * 60 * 60 * 1000;
  const isProduction = process.env.NODE_ENV === 'production';

  res.cookie('accessToken', accessTokenJWT, {
    httpOnly: true,
    secure: isProduction,
    signed: true,
    expires: new Date(Date.now() + 30 * oneDay), // 30 days
    sameSite: isProduction ? "none" : "lax",
  });
};

module.exports = {
  createJWT,
  verifyJWT,
  createUserToken,
  attachCookieToResponse,
};
