const mongoose = require('mongoose');

const ExperienceDataSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Types.ObjectId,
      required: true,
      ref: 'User',
    },

    jobProfile: {
      type: String,
      required: [true, 'Job Profile is required'],
      trim: true,
    },

    company: {
      type: String,
      required: [true, 'Employer company is required'],
      trim: true,
    },

    startDate: {
      type: Date,
      required: [true, 'Job start date is required'],
    },

    endDate: {
      type: Date,
    },
  },
  { versionKey: false, timestamps: true, collection: 'StudentExperiences' }
);

const ExperienceDataModel = mongoose.model(
  'StudentExperienceData',
  ExperienceDataSchema
);

module.exports = ExperienceDataModel;
