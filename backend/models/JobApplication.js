const mongoose = require('mongoose');
const validator = require('validator');

const JobApplicationSchema = new mongoose.Schema(
  {
    jobId: {
      type: mongoose.Types.ObjectId,
      required: true,
      ref: 'JobOpening',
    },

    applicantId: {
      type: mongoose.Types.ObjectId,
      required: true,
      ref: 'User',
    },

    applicantName: {
      type: String,
      required: true,
      trim: true,
    },

    companyId: {
      type: mongoose.Types.ObjectId,
      required: true,
      ref: 'Company',
    },

    status: {
      type: String,
      enum: ['pending', 'shortlisted', 'hired', 'rejected'],
      default: 'pending',
    },

    portfolio: {
      type: String,
      required: [true, 'Portfolio is required'],
      trim: true,
      validate: {
        validator: validator.isURL,
        message: 'Invalid portfolio URL!',
      },
    },

    coverLetter: {
      type: String,
      required: [true, 'Cover letter is required'],
    },

    resume: {
      type: String,
      required: [true, 'Resume is required'],
    },

    offerId: {
      type: mongoose.Types.ObjectId,
      ref: 'Offer',
    },
  },
  { timestamps: true, versionKey: false }
);

JobApplicationSchema.index({ jobId: 1, applicantId: 1 }, { unique: true });

const JobApplicationModel = mongoose.model(
  'JobApplication',
  JobApplicationSchema
);

module.exports = JobApplicationModel;
