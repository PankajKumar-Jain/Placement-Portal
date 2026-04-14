const {
  createJWT,
  createUserToken,
  attachCookieToResponse,
  verifyJWT,
} = require('./jwt');

const { fileUpload } = require('./fileUpload');
const {
  validateModelDoc,
  validateJobReceivers,
  validateStudentCourse,
} = require('./dbUtils');

const { checkAcademicEligibility } = require('./eligibilityUtils');

module.exports = {
  createJWT,
  createUserToken,
  attachCookieToResponse,
  verifyJWT,
  fileUpload,
  validateModelDoc,
  validateJobReceivers,
  validateStudentCourse,
  checkAcademicEligibility,
};
