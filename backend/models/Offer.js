const mongoose = require('mongoose');

const OfferSchema = new mongoose.Schema(
  {
    jobApplicationId: {
      type: mongoose.Types.ObjectId,
      required: true,
      ref: 'JobApplication',
      unique: true,
    },

    jobId: {
      type: mongoose.Types.ObjectId,
      required: true,
      ref: 'JobOpenings',
    },

    studentId: {
      type: mongoose.Types.ObjectId,
      required: true,
      ref: 'User',
    },

    companyId: {
      type: mongoose.Types.ObjectId,
      required: true,
      ref: 'Company',
    },

    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected'],
      default: 'pending',
    },

    offerLetter: {
      type: String, // URL to the uploaded offer letter document
      trim: true,
    },

    offerLetterUploadedAt: {
      type: Date,
    },

    acceptedAt: {
      type: Date,
    },

    rejectedAt: {
      type: Date,
    },
  },
  { timestamps: true, versionKey: false }
);

const OfferModel = mongoose.model('Offer', OfferSchema);

module.exports = OfferModel;