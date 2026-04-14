const mongoose = require('mongoose');
const validator = require('validator');

const CompanySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: [true, 'company Name is required'],
      unique: [true, 'Company with this name already exists'],
      minlength: [3, 'Name should be of atleast 3 characters'],
      maxlength: [30, 'Name should be of maximum 30 characters'],
    },

    about: {
      type: String,
      trim: true,
    },

    website: {
      type: String,
      trim: true,
      validate: {
        validator: validator.isURL,
        message: 'Invalid company URL!',
      },
    },

    photo: {
      type: String,
      trim: true,
    },

    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: [true, 'Company with this email already exists'],
      validate: {
        validator: validator.isEmail,
        message: 'Please enter a valid email',
      },
    },

    admins: {
      type: [mongoose.Types.ObjectId],
      default: [],
      ref: 'User',
    },

    jobsPosted: {
      type: Number,
      default: 0,
    },

    openingsCreated: {
      type: Number,
      default: 0,
    },

    candidatesHired: {
      type: Number,
      default: 0,
    },

    accessTill: {
      type: Date,
    },
  },
  { timestamps: true, versionKey: false }
);

const CompanyModel = mongoose.model('Company', CompanySchema);

module.exports = CompanyModel;
