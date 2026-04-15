const UserModel = require('../models/User');
const CompanyModel = require('../models/Company');

const CustomAPIError = require('../errors');
const { StatusCodes } = require('http-status-codes');

const { createUserToken, attachCookieToResponse } = require('../utils');

const register = async (req, res) => {
  let { name, email, password } = req.body;

  if (!name || !email || !password) {
    throw new CustomAPIError.BadRequestError("All fields are required");
  }

  email = email.trim().toLowerCase();

  const existingUser = await UserModel.findOne({ email });
  if (existingUser) {
    throw new CustomAPIError.BadRequestError("User already exists");
  }

  // Let the User model's pre-save hook handle password hashing
  const user = await UserModel.create({
    name,
    email,
    password,
    role: "admin", // you can change to "student" if needed
  });

  res.status(StatusCodes.CREATED).json({
    success: true,
    message: "User created",
  });
};
const login = async (req, res) => {
  let { email, password } = req.body;

  if (!email?.trim() || !password) {
  throw new CustomAPIError.BadRequestError("Email and Password is required");
}
  email = email.trim().toLowerCase();

  const user = await UserModel.findOne({ email });

  if (!user) {
    console.log('no user');
    throw new CustomAPIError.UnauthenticatedError('Authentication failed');
  }

  const isPasswordCorrect = await user.comparePassword(password);

  if (!isPasswordCorrect) {
    throw new CustomAPIError.UnauthenticatedError('Authentication failed');
  }

  // Check if user is blocked
  if (user.isBlocked) {
    throw new CustomAPIError.UnauthenticatedError('Your account has been blocked by admin. Contact administration.');
  }

  // ENFORCE DASHBOARD EXPIRATION FOR COMPANY ADMINS
  if (user.role === 'company_admin' && user.companyId) {
    const company = await CompanyModel.findById(user.companyId);
    if (company && company.accessTill) {
      if (new Date(company.accessTill) < new Date()) {
        // Access expired
        console.log(`Company access expired for ${user.email}. Deleting admin.`);
        
        // Remove admin from company
        company.admins = company.admins.filter(
          (adminId) => adminId.toString() !== user._id.toString()
        );
        await company.save();

        // Delete user
        await UserModel.findByIdAndDelete(user._id);

        throw new CustomAPIError.UnauthenticatedError('Your company access has expired. Please contact the global admin.');
      }
    }
  }

  const userToken = createUserToken(user);
  attachCookieToResponse(res, userToken);

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'User Logged in',
    role: user.role,
    forcePasswordReset: Boolean(user.forcePasswordReset),
  });
};

const logout = async (req, res) => {
  const isProduction = process.env.NODE_ENV === 'production';
  res.cookie('accessToken', '', {
    httpOnly: true,
    signed: true,
    secure: isProduction,
    expires: new Date(Date.now()),
    sameSite: isProduction ? "none" : "lax",
  });
  res
    .status(StatusCodes.OK)
    .json({ success: true, message: 'logged out successfully' });
};

module.exports = {
  login,
  logout,
  register,
};
